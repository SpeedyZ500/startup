const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const express = require('express');
const app = express();
app.use(cookieParser());

const authCookieName = 'token';

// The scores and users are saved in memory and disappear whenever the service is restarted.
let users = [];


app.get('/cookie', (req, res) => {
    const token = uuid.v4();
})

app.get('*', (req, res) =>{
    const token = req.cookies?.token;
    if(!token){
        return res.status(401).send({msg: 'unauthorized'});
    }
    else{
        return res.send({msg: "secure"});
    }
});
