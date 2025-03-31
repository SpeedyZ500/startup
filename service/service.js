const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const express = require('express');
const app = express();
const authCookieName = 'token';
const { 
    getUserByToken,
    getUserByUsername,
    getUserByEmail, addUser, /*updateUser*/ } = require('./database');  // Import database functions

app.use(express.json());
app.use(cookieParser());

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

app.use(express.static('public'));

var apiRouter = express.Router();
app.use(`/api`, apiRouter);

let users = [];

function getUser(field, value){
    if (value) {
        return users.find((user) => user[field] === value);
    }
    return null;
}


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
async function updateUser(user){
    const index = users.find(me => me.username === user.username)
    users[index] = user
    return user
}



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

async function createAdvice(description, author){
    const created = new Date().toJSON();
    
    const advice = { description:description , author:author, created:created};
    writingadvice.push(advice);

    return advice;
}

apiRouter.post('/writingadvice', verifyAuth, async (req, res) => {
    const description = req.body.description;
    if (!description){
        return res.status(400).json({ error: 'text is required' });
    }
    const author = req.username;
    const advice = await createAdvice(description, author );
    if(advice){
        res.send({description:advice.description, author:advice.author});
    }
    else{
        res.status(500).send({msg:"error creating advice"});
    }
});
let writingadvice = [];
let writingprompts = [];
async function createPrompt(description, author){
    const created = new Date().toJSON();
    
    const prompt = { description:description , author:author, created:created};
    writingprompts.push(prompt);

    return prompt;
}
apiRouter.post('/writingprompts', verifyAuth, async (req, res) => {
    const description = req.body.description;
    if (!description){
        return res.status(400).json({ error: 'text is required' });
    }
    const output = await createPrompt(description, req.username);
    res.status(201).send({description:output.description, author:output.author});

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
        res.status(401).send({msg: 'Wrong Username or Password'});
    }
});

// Logout
apiRouter.delete('/auth/logout', verifyAuth, async (req, res) => {
    const token = req.cookies[authCookieName];
    const user = await getUser('token', token);
    if(user){
        clearAuthCookie(res, user);
        res.send({});
    }
    else{
        res.status(401).send({msg:"Aunotherized"});
    }
    
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
apiRouter.get('/user/:username', async (req, res) => {
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

// Update User
apiRouter.put('/user/prof', verifyAuth, async(req, res) => {
    try {
        const user = await getUser('username', req.username);
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

        const user = await getUser('username', req.username);
        
        if (user && (await bcrypt.compare(oldPassword, user.password))){
            user.password = await bcrypt.hash(newPassword, 10);
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
    apiRouter
};
