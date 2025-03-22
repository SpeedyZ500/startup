const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const express = require('express');
const app = express();
const authCookieName = 'token';

app.use(express.json());
app.use(cookieParser());

app.use(express.static('public'));

var apiRouter = express.Router();
app.use(`/api`, apiRouter);






// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
    const token = req.cookies[authCookieName];

    const user = await getUser('token', token);
    if (user) {
      next();
    } else {
      res.status(401).send({ msg: 'Unauthorized' });
    }
  };

let users = [];

let writingadvice = [
    {
        "description": "It doesn't matter what it is you write, just start writing, getting ideas on a page is more important than if it looks good.",
        "details":[
            {
                "label":"Author",
                "value":"Spencer Zaugg",
                "filter":false,
                "display":false
            }
        ],
        "id":"1"
    },
    {
        "description": "Write down random questions",
        "details":[
            {
                "label":"Author",
                "value":"Spencer Zaugg",
                "filter":false,
                "display":false
            }
        ],
        "id":"2"
    },
    {
        "description": "Write down story ideas, and character concepts.",
        "details":[
            {
                "label":"Author",
                "value":"Spencer Zaugg",
                "filter":false,
                "display":false
                
            }
        ],
        "id":"3"
    }
];

let writingprompts = [
    {
        "description": "What if werewoves were real, but they aren't around today because they colonized the moon?",
        "details":[
            {
                "label":"Author",
                "display":false,
                "filter":false,
                "value":"Spencer Zaugg"
            }
        ],
        "id":"1"
    },
    {
        "description": "What if I was actually good at writing?",
        "details":[
            {
                "label":"Author",
                "display":false,
                "filter":false,
                "value":"Spencer Zaugg"
            }
        ],
        "id":"2"
    },
    {
        "description": "What if I was actually good at programming?",
        "details":[
            {
                "label":"Author",
                "display":false,

                "value":"Spencer Zaugg"
            }
        ],
        "id":"3"
    }
];












function sanitizeId(id){
    return id
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
}
async function createID(name, author){
    return sanitizeId(`${name}_${author}`);
}


async function createUser(email, username, password, displayname) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
        email: email,
        username:username,
        password: passwordHash,
        profanityFilter:true,

    };
    if(displayname && displayname !== ''){
        user.displayname = displayname;
    }
    else{
        user.displayname = username;
    }

    users.push(user);

    return user;
}


function getUser(field, value){
    if (value) {
        return users.find((user) => user[field] === value);
    }
    return null;
}


function createAdvice(description, author, created){
    const advice = {description: description, details:[{
            label:"Author",
            value:author,
            display:false,
            filter:false
        },
        {
            label:"created",
            value:created,
            display:false,
            filter:false
        }]
    }
    writingadvice.push(advice);
    return advice;
    
}

apiRouter.post('/writingadvice', verifyAuth, (req, res) => {
    const description = req.body.description;
    const author = req.body.author;
    const created = new Date().toJSON();
    const advice = createAdvice(description, author,created )
    res.status(201).send(advice);
});
function getResourceById(resource, id){
    return resource.find(item => item.id === id);
}
apiRouter.post('/writingprompts', verifyAuth, (req, res) => {
    try{
        const description = req.body.Description;
        if (!description){
            return res.status(400).json({ error: 'text is required' });

        }
        const author = req.body.author;
        const created = new Date().toJSON();
        const output = {description:description, details:[
            {
                label:"Author",
                value:author,
                display:false,
                filter:false
            },
            {
                label:"created",
                value:created,
                display:false,
                filter:false
            }
        ]}
        writingprompts.push(output)
        res.status(201).json(JSON.stringify(output));
    }
    catch(err){
        console.error("Error handling writing prompt submission:", err);
        res.status(500).send({ error: 'An error occurred while submitting the writing prompt' });
    }
})



apiRouter.get('/writingadvice', async (_req, res) => {
    res.send(writingadvice);
});



apiRouter.get('/writingprompts', async (_req, res) => {
    res.send(writingprompts)
});
















apiRouter.get('/stories/:storyID?/:chapterID?', async (req, res) => {
    const {storyID, chapterID} = req.params;
    if(!storyID){
        res.send(stories);
    }
    else{
        const story = stories.find(story => story.id === storyID);
        if(story){
            if(!chapterID){
                res.send(story);
            }
            else{
                const chapter = story.chapters.find(chapter => chapter.id === chapterID);
                if(chapter){
                    res.send(chapter);
                }
                else{
                    res.status(404).send({ error: "Chapter not found" });
                }
            }

        }
        else{
            res.status(404).send({ error: "Story not found" });
        }
    }
});


//registration
apiRouter.post('/auth/register', async (req, res) => {
    if(await getUser('email', req.body.email)){
        res.status(409).send({msg:"Email already registered to a user"})
    }
    else if(await getUser('username', req.body.username)){
        res.status(409).send({msg:"Username already taken"})
    } else{

        const user = await createUser(req.body.email, req.body.username, req.body.password, req.body.displayname);
        if(user){
            setAuthCookie(res, user);
            res.send({email:user.email, username:user.username, displayname:user.displayname, profanityFilter:user.profanityFilter});    
        }
        else{
            res.status(500).send({ msg: "User creation failed" });
        }
    }
    
});

// login
apiRouter.put('/auth/login', async (req, res) => {
    const identifier = req.body.username;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(identifier);

    const user = await getUser(isEmail ? "email" : "username", identifier);
    if (user && (await bcrypt.compare(req.body.password, user.password))){

        setAuthCookie(res, user);  

        res.send({email:user.email, username:user.username, displayname:user.displayname, profanityFilter:user.profanityFilter});
    }
    else{
        res.status(401).send({msg: 'Unauthorized'});
    }
});

// logout
apiRouter.delete('/auth/logout', verifyAuth, async (req, res) => {
    const token = req.cookies[authCookieName];
    const user = await getUser('token', token);
    if(user){
        clearAuthCookie(res, user);
    }
    res.send({});
});

apiRouter.get(`/auth`, async (req, res) => {
    const token = req.cookies[authCookieName];
    const user = await getUser('token', token);
    if(user){
        res.send({authenticated:true});
    }
    else{
        res.send({authenticated:false});
    }
})

const fs = require('fs');
const path = require('path');


  

apiRouter.get('/user/:user', async (req, res) => {
    try{
        const {username} = req.params;
        const user = await getUser('username', username);
        if(user){
            res.send({displayname:user.displayname});
        }
        else{
            res.send({displayname:username});
        }
    }
    catch(error){
        res.send({displayname:username});
    }
});
// getMe
apiRouter.get('/user/me', async (req, res) => {
            const token = req.cookies[authCookieName];
        if(token){
            const user = await getUser('token', token);
            if (user) {
                res.send({email:user.email, username:user.username, displayname:user.displayname, profanityFilter:user.profanityFilter});
            } else {
            res.status(401).send({ msg: 'Unauthorized' });
            } 
        }
        else {
        res.status(401).send({ msg: 'Unauthorized' });
        }
  });
apiRouter.put('/user/prof', async(req, res) => {
    try {
        const token = req.cookies[authCookieName];
        const user = await getUser('token', token);

        const profanityFilter  = req.body.profanityFilter;

        // Ensure profanityFilter is a boolean
        if (typeof profanityFilter !== 'boolean') {
            return res.status(400).send({ msg: 'Invalid input' });
        }

        // Update user settings in memory (replace with MongoDB update later)
        user.profanityFilter = profanityFilter;
        await updateUser(user); // Replace with actual DB update logic when using MongoDB
        res.send({email:user.email, username:user.username, displayname:user.displayname, profanityFilter:user.profanityFilter});
    
    } catch (error) {
        console.error('Error updating profanity filter:', error);
        res.status(500).send({ msg: 'Internal server error' });
    }
});
apiRouter.put('/user/pass', verifyAuth, async(req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).send({ msg: 'All password fields are required' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).send({ msg: 'New password and confirmation do not match' });
        }

        if (oldPassword === newPassword) {
            return res.status(400).send({ msg: 'New password cannot be the same as the old password' });
        }

        const token = req.cookies[authCookieName];
        const user = await getUser('token', token);
        
        if (user && (await bcrypt.compare(req.body.oldPassword, user.password))){
            // Update user settings in memory (replace with MongoDB update later)
            
            user.password = await bcrypt.hash(req.body.newPassword, 10);
            await updateUser(user); // Replace with actual DB update logic when using MongoDB
            res.send({msg:"User successfully updated "});
        }
        else{
            res.status(401).send({msg: "Password is incorrect"})
        }

    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).send({ msg: 'Internal server error' });
    }
});

apiRouter.put('/user/displayname', verifyAuth, async (req, res) =>{
    try {
        const token = req.cookies[authCookieName];
        const user = await getUser('token', token);

        const displayname  = req.body.displayname;

        // Ensure profanityFilter is a boolean
        if (typeof displayname !== 'string') {
            return res.status(400).send({ msg: 'Invalid input' });
        }


        // Update user settings in memory (replace with MongoDB update later)
        user.displayname = displayname;
        await updateUser(user); // Replace with actual DB update logic when using MongoDB
        res.send({email:user.email, username:user.username, displayname:user.displayname, profanityFilter:user.profanityFilter});
    
    } catch (error) {
        console.error('Error updating display name:', error);
        res.status(500).send({ msg: 'Internal server error' });
    }
});

apiRouter.get('/user/prof',  async(req, res) => {
    const token = req.cookies[authCookieName];
    const user = await getUser('token', token);
    if (user){
        res.send({profanityFilter:user.profanityFilter});
    }
    else{
        res.send({profanityFilter:true});
    }
})

 


//update user middleware
async function updateUser(user){
    const index = users.findIndex((use) => use.username === user.username);
    if (index !== -1) {
        users[index] = user;
    } else {
        console.warn(`User ${user.username} not found in memory.`);
    }
}





// apiRouter.get('/cookie', (req, res) => {
//     const token = uuid.v4();
// })

// apiRouter.get('*', (req, res) =>{
//     const token = req.cookies?.token;
//     if(!token){
//         return res.status(401).send({msg: 'unauthorized'});
//     }
//     else{
//         return res.send({msg: "secure"});
//     }
// });

function setAuthCookie(res, user){
    user.token = uuid.v4();
    res.cookie('token', user.token, {
        secure: true,
        httpOnly: true,
        sameSite: 'Strict',
    });
}

apiRouter.use(function (err, req, res, next) {
    res.status(500).send({ type: err.name, message: err.message });
  });

function clearAuthCookie(res, user){
    delete user.token;
    res.clearCookie('token')
}

module.exports = {
    app,
    verifyAuth,
    sanitizeId,
    createID

};