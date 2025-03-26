const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const express = require('express');
const app = express();
const authCookieName = 'token';
const { 
    getUserByToken,
    getUserByUsername,
    getUserByEmail, createUser, updateUser } = require('./database');  // Import database functions

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
        req.username = user.username;
      next();
    } else {
      res.status(401).send({ msg: 'Unauthorized' });
    }
};

// Use MongoDB or another persistent data source instead of in-memory data
let writingadvice = [];  // You could retrieve this data from the database
let writingprompts = [];  // Same here


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

async function createAdvice(description, author, created){
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
    };
    writingadvice.push(advice);
    return advice;
}

apiRouter.post('/writingadvice', verifyAuth, (req, res) => {
    const description = req.body.description;
    const author = req.body.author;
    const created = new Date().toJSON();
    const advice = createAdvice(description, author,created );
    res.status(201).send(advice);
});

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
        ]};
        writingprompts.push(output)
        res.status(201).json(JSON.stringify(output));
    }
    catch(err){
        console.error("Error handling writing prompt submission:", err);
        res.status(500).send({ error: 'An error occurred while submitting the writing prompt' });
    }
});

apiRouter.get('/writingadvice', async (_req, res) => {
    res.send(writingadvice);
});

apiRouter.get('/writingprompts', async (_req, res) => {
    res.send(writingprompts);
});

// Registration
apiRouter.post('/auth/register', async (req, res) => {
    if(req.body.username !== await sanitizeId(req.body.username)){
        return res.status(400).send({ msg: "Your username has invalid characters"});
    }
    else if(await getUser('email', req.body.email)){
        return res.status(409).send({msg:"Email already registered to a user"})
    }
    else if(await getUser('username', req.body.username)){
        return res.status(409).send({msg:"Username already taken"})
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

// Login
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

// Logout
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
});

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

// Update User
apiRouter.put('/user/prof', async(req, res) => {
    try {
        const token = req.cookies[authCookieName];
        const user = await getUser('token', token);

        const profanityFilter  = req.body.profanityFilter;

        // Ensure profanityFilter is a boolean
        if (typeof profanityFilter !== 'boolean') {
            return res.status(400).send({ msg: 'Invalid input' });
        }

        user.profanityFilter = profanityFilter;
        await updateUser(user); // Update user in database
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
            user.password = await bcrypt.hash(req.body.newPassword, 10);
            await updateUser(user);  // Update password in database
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

// Set auth cookie
function setAuthCookie(res, user){
    user.token = uuid.v4();
    res.cookie('token', user.token, {
        secure: true,
        httpOnly: true,
        sameSite: 'Strict',
    });
}

// Clear auth cookie
function clearAuthCookie(res, user){
    delete user.token;
    res.clearCookie('token')
}

module.exports = {
    app,
    verifyAuth,
    sanitizeId,
    createID,
    getUser,
};
