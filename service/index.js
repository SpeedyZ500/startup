const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const express = require('express');
const app = express();
app.use(express.json());
app.use(cookieParser());




const authCookieName = 'token';

let users = [];
let races = [];
let worlds = [];
let characters = [
    {
        "id":1,
        "details":[
            {
                "label":"name",
                "value":"Alastor Moonblaze",
                "path":"/characters/alastor_moonblaze_spencer_zaugg",
                "location":"head",
                "filter":false
            },
            {
                "label":"author",
                "value":"Spencer Zaugg"
            },
            {
                "label":"World",
                "value":"The Void",
                "path":"/worldbuilding/worlds/the_void_spencer_zaugg"
            },
            {
                "label":"Race",
                "value":"Remgulus",
                "path":"/worldbuilding/races/remgulus_spencer_zaugg"
            },
            {
                "label":"Type",
                "value":[
                    "Side Character",
                    "Protagonist"
                ],
                "display":false
            },
            {
                "label":"created",
                "display":false,
                "value":"2025-02-23T20:10:43.930Z",
                "filter":false

            }
        ],
        "description":"A mysterious Alchemist who seeks to restore his world"
    },
    {
        "id":2,
        "details":[
            {
                "label":"name",
                "value":"The Curator",
                "path":"/characters/the_curator_spencer_zaugg",
                "location":"head",
                "filter":false
            },
            {
                "label":"author",
                "value":"Spencer Zaugg"
            },
            {
                "label":"World",
                "value":"The Void",
                "path":"/worldbuilding/worlds/the_void_spencer_zaugg"
            },
            {
                "label":"Race",
                "value":"???"
            },
            {
                "label":"Type",
                "value":[
                    "Hero",
                    "Protagonist"
                ],
                "display":false
            },
            {
                "label":"created",
                "value":"2025-02-23T20:12:33.862Z",
                "display":false,
                "filter":false

            }
        ],
        "description":"A mysterious individual who claims to rule over Yggdrasil, the World Tree. Not much is known about them."
    }
];
let biomes = [];
let magicsystems = [];
let organizations = [];
let stories = [
    [
        {
            "name":"The Moonlit Alchemist",
            "id":1,
            "details":[
                {
                    "label":"name",
                    "value":"The Moonlit Alchemist",
                    "path":"/stories/the_moonlit_alchemist_spencer_zaugg",
                    "location":"head",
                    "filter":false
                },
                {
                    "label":"author",
                    "value":"Spencer Zaugg"
                },
                {
                    "label":"Genre",
                    "value":[
                        "Example",
                        "Fantasy"
                    ],
                    "location":"footer"
                },
                {
                    "label":"Content Warnings",
                    "value":[
                        "Fallen Universe"
                    ],
                    "location":"footer"
    
                },
                {
                    "label":"created",
                    "value":"2025-02-23T20:10:43.930Z",
                    "display":false,
                    "filter":false
                },
                {
                    "label":"expanded",
                    "value":"2025-02-23T20:10:43.930Z",
                    "display":false,
                    "filter":false
                }
            ],
    
            "description":"The story of a mysterious Alchemist who's alchemy is enhanced by moonlight, displaced from his world"
        }
    ]
];
let writingadvice = [];
let writingprompts = [];
let wildlife = [];
let flora = [];
let countries = [];
let biopages = [];


async function createUser(email, username, password, displayname) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
        email: email,
        username:username,
        password: passwordHash,
        profanityFilter:true
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

function getList(source){
    let list = [];
    switch(source){
        case "races":
            list = races;
            break;
        case "characters":
            list = characters;
            break;
        case "worlds":
            list = worlds;
            break;
        case "stories":
            list = stories;
            break;
        case "biomes":
            list = biomes;
            break;
        case "magicsystems":
            list = magicsystems;
            break;
        case "organizations":
            list = organizations;
            break;
        case "writingadvice":
            list = writingadvice;
            break;
        case "writingpromts":
            list = writingprompts;
            break;
        case "wildlife":
            list = wildlife;
        case "flora":
            list = flora;
        case "countries":
            list = countries;
    }
    return list;
}
//registration
app.post('/api/auth', async (req, res) => {
    if(await getUser('email', req.body.email)){
        res.status(409).send({msg:"Email already registered to a user"})
    }
    else if(await getUser('username', req.body.username)){
        res.status(409).send({msg:"Username already taken"})
    } else{

        const user = await createUser(req.body.email, req.body.username, req.body.password, req.body.displayname);
        if(user){
            setAuthCookie(res, user);
            res.send({email:user.email, username:user.username, displayname:user.displayname});    
        }
        else{
            res.status(500).send({ msg: "User creation failed" });
        }
    }
    
});

// login
app.put('/api/auth', async (req, res) => {
    const identifier = req.body.username;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(identifier);

    const user = await getUser(isEmail ? "email" : "username", identifier);
    if (user && (await bcrypt.compare(req.body.password, user.password))){
        setAuthCookie(res, user);
        res.send({email:user.email, username:user.username, displayname:user.displayname});
    }
    else{
        req.status(401).send({msg: 'Unauthorized'});
    }
});

// logout
app.delete('/api/auth', async (req, res) => {
    const token = req.cookies['token'];
    const user = await getUser('token', token);
    if(user){
        clearAuthCookie(res, user);
    }
    res.send({});
});

app.get(`/api/auth`, async (req, res) => {
    const token = req.cookies['token'];
    const user = await getUser('token', token);
    if(user){
        res.send({authenticated:true});
    }
    else{
        res.send({authenticated:false});
    }
})
app.get('/api/user/any', async (req, res) => {
    const username = req.query.username
    const user = await getUser('username', username);
    res.send({
        displayname: user ? user.displayname : username,

    })

});
// getMe
app.get('/api/user/me', async (req, res) => {
    const token = req.cookies['token'];
    const user = await getUser('token', token);
    if (user){
        res.send({email:user.email, username:user.username, displayname:user.displayname});
    }
    else{
        res.status(401).send({msg: 'Unauthorized'});
    }
});

app.get('/api/user/prof', async(req, res) => {
    const token = req.cookies['token'];
    const user = await getUser('token', token);
    if (user){
        res.send({profanityFilter:user.profanityFilter});
    }
    else{
        res.send({profanityFilter:true});
    }
})
// app.put('/api/user/setting/prof', async(req, res) => {

// })
const port = 4000;
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});






// app.get('/cookie', (req, res) => {
//     const token = uuid.v4();
// })

// app.get('*', (req, res) =>{
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
        sameSite: 'strict',
    });
}

function clearAuthCookie(res, user){
    delete user.token;
    res.clearCookie('token')
}
