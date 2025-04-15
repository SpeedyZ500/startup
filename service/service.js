const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const express = require('express');
const app = express();
const authCookieName = 'token';
const { 
    getUserByToken,
    getUserByUsername,
    getUserByEmail, 
    addUser, 
    updateUser,
    getUserById,
    getOptions,
    getCards,
    listUserDisplay,
    addWritingAdvice,
    addWritingPrompt
 } = require('./database');  // Import database functions

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
    

    return await addUser(user)
    ;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidId(id) {
    return id === sanitizeId(id);
}

function isValidPassword(pass){
    return typeof password === "string" && password.length >= 8 && /^[^\s<>]*$/.test(password);
}

app.use(express.static('public'));

var apiRouter = express.Router();
app.use(`/api`, apiRouter);

let users = [];

async function getUser(field, value){
    if(field === "username"){
        return await getUserByUsername(value)
    }
    else if(field === "email"){
        return await getUserByEmail(value);
    }
    else if(field === "token"){
        return await getUserByToken(value);
    }
    else if(field === "id"){
        return await getUserById(value);
    }
    return null;
}


// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
    const token = req.cookies[authCookieName];
    const user = await getUserByToken(token)
    if (user) {
        req.usid = user._id;
      next();
    } else {
      res.status(401).send({ msg: 'Unauthorized' });
    }
};




function sanitizeId(id){
    return id
        .trim()
        .toLowerCase()
        .replace(/<[^>]*>?/gm, '') // remove HTML tags
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
}






apiRouter.post('/writingadvice', verifyAuth, async (req, res) => {
    const description = req.body.description;
    if (!description){
        return res.status(400).json({ error: 'text is required' });
    }
    const author = req.usid;
    try{
        const created = new Date().toJSON();
        const advice = await addWritingAdvice({description, author, created});
        if(advice){
            res.send({description:advice.description});
        }
        else{
            res.status(500).send({msg:"error creating advice"});
        }
    
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message});

    }
});



apiRouter.post('/writingprompts', verifyAuth, async (req, res) => {
    const description = req.body.description;
    if (!description){
        return res.status(400).json({ error: 'text is required' });
    }
    const author = req.usid;
    try{
        const created = new Date().toJSON();
        const prompt = await addWritingPrompt({description, author, created});
        if(prompt){
            res.send({description:prompt.description});
        }
        else{
            res.status(500).send({msg:"error creating Prompt"});
        }
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message});
    }
});

apiRouter.get('/writingadvice', async (req, res) => {
    const writingadvice = await getCards("writingadvice", {query:req.query})
    res.send(writingadvice);
});

apiRouter.get('/writingprompts', async (req, res) => {
    const writingPrompts = await getCards("writingprompts", {query:req.query})
    res.send(writingPrompts);
});

// Registration
apiRouter.post('/auth/register', async (req, res) => {
    if(!isValidId(req.body.username)){
        return res.status(400).send({msg:"You have invalid characters in your username, no spaces, < > etc"})
    }
    if(!isValidPassword(req.body.password)){
        return res.status(400).send({ msg: "Invalid password. No spaces or < > allowed. Minimum 8 characters." });
    }
    if(!isValidEmail(req.body.email)){
        return res.status(400).send({ msg: "Please provide a valid email." });

    }
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
            await setAuthCookie(res, user);

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
        await setAuthCookie(res, user);  
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
        await clearAuthCookie(res, user);
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
apiRouter.get(`/users/options`, async (req, res) =>{
    const options = await getOptions("users",{query:req.query})
    res.send(options)
})
apiRouter.get(`/users`, async (_req, res) =>{
    const users = await listUserDisplay();
    res.send(users)
})


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
        const user = await getUser('id', req.usid);
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

        const user = await getUser('id', req.usid);
        
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
async function setAuthCookie(res, user){
    user.token = uuid.v4();
    await updateUser(user)
    res.cookie('token', user.token, {
        secure: true,
        httpOnly: true,
        sameSite: 'Strict',
        maxAge: 1000 * 60 * 60 * 24 * 7 
    });
}

// Clear auth cookie
async function clearAuthCookie(res, user){
    delete user.token;
    await updateUser(user)
    res.clearCookie('token')
}

module.exports = {
    app,
    verifyAuth,
    sanitizeId,
    getUser,
    apiRouter
};
