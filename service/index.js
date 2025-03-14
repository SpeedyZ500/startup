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
let worlds = [
    
];
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
];
let writingadvice = [
    {
        "description": "It doesn't matter what it is you write, just start writing, getting ideas on a page is more important than if it looks good.",
        "details":[
            {
                "label":"Author",
                "value":"Spencer Zaugg",
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
let wildlife = [];
let flora = [];
let countries = [];

let characterBios =[
    {
        "id":"alator_moonblaze_spencer_zaugg",
        "infoCard":{
            "name":"Alastor Moonblaze",
            "cardData":[
                {
                    "label":"Author",
                    "value":"Spencer Zaugg"
                },
                {
                    "label":"Family",
                    "value":[
                        {
                            "label":"Father?/Creator",
                            "value":[
                                {
                                    "value":"Spencer Zaugg"
                                   
                                }
                            ]
                        }
                    ]
                },
                
                {
                    "label":"Titles",
                    "value":[
                        "The Moonlit Alchemist"
                    ]
                },
                {
                    "label":"Gender",
                    "value":"Male"
                },
                {
                    "label":"Pronouns",
                    "value":"He/Him"
                },
                {
                    "label":"Types/Roles",
                    "value":[
                        "Side Character",
                        "Protagonist"
                    ]
                },
                {
                    "label":"Enemies",
                    "value":[
                        {
                            "value":"The Curator",
                            "path":"/characters/the_curator_spencer_zaugg"
                        }
                    ]
                }
    
            ],
            
            "created":"2025-02-23T20:10:43.930Z",
            "modified":"2025-02-23T20:10:43.930Z"
    
        },
        "description":"A mysterious Alchemist who seeks to restore his world",
        "sections":[
            {
                "section":"Description",
                "text":"A mysterious Alchemist who seeks to restore his world \n A fellow who is not just below average hight, he has Brown Hair and Brown eyes. Best we can tell \"Alastor Moonblaze\" was not his original name, though it is unlikely he remembers his original name, or more likely names, because he is a Remgulus. He is labeled a Side Character because he feels so strongly that he isn't anyone important, he is just some guy hanging out. \n He is someone who does his best to be a good person, and feels he often falls short."
            }
        ]
    },
    {
        "id":"the_currator_spencer_zaugg",
        "infoCard":{
            "name":"The Curator",
            "cardData":[
                {
                    "label":"Author",
                    "value":"Spencer Zaugg"
                },
                {
                    "label":"World",
                    "value":{
                        "value":"The Void",
                        "path":"/worldbuilding/worlds/the_void_spencer_zaugg"
                    }
                },
                {
                    "label":"Titles",
                    "value":[
                        "The Curator",
                        "The Story Teller",
                        "",
                        "The Story Keeper",
                        "Hero of Dark Light",
                        "Eternal Watcher",
                        "",
                        "Harbinger of Light",
                        "Arborist of Reality",
                        "Realm Lord",
                        "Void Tamer",
                        "Eternal Emperor of Yggdrasil",
                        "Slayer of Demons",
                        "The Stellar Story",
                        "Exterminator of Darkness",
                        "Returner",
                        "",
                        "Observer",
                        "Freedom Bringer",
                        "",
                        "Star Warrior",
                        "Originator",
                        "Unifier",
                        "Light Bringer",
                        "Sorcerer of Light"
                    ]
    
                },
                {
                    "label":"Gender",
                    "value":"NB (Numerous Bees)"
                },
                {
                    "label":"Pronouns",
                    "value":"They/Them (collective)"
                },
                {
                    "label":"Type/Roles",
                    "value":[
                        "Hero",
                        "Protagonist"
                    ]
                },
                {
                    "label":"Race",
                    "value":"Unknown"
                },
                {
                    "label":"Abilities",
                    "value":[
                        {
                            "value":"Void Walking",
                            "path":"/worldbuilding/magicsystems/void_walking_spencer_zaugg"
                        },
                        {
                            "value":"Data Manipulation"
                        }
                    ]
                },
                {
                    "label":"Allies",
                    "value":"Everyone :)"
                },
                {
                    "label":"Enemies",
                    "value":[
                        {
                            "value":"Alastor Moonblaze",
                            "path":"/characters/alastor_moonblaze_spencer_zaugg"
                        },
                        {
                            "value":"Spencer Zaugg"
                        }
                    ]
                }
            ],
            "created":"2025-02-23T20:12:33.862Z",
            "modified":"2025-02-23T20:12:33.862Z"
        },
        "description":"A mysterious individual who claims to rule over Yggdrasil, the World Tree. Not much is known about them.",
        "sections":[
            {
                "section":"Description",
                "text":[
                    "They don't like when people use any gendered pronouns to describe them, also doesn't like when you refer to them as a singular entity, they much prefer ya'll to you. They consider themselves a hero, and the protagonist of all stories, more accurately however is that they are a godlike entity, in that they have godlike power, but they are not omniscient, omnipresent, nor are they omnipotent. They are however very powerful, being able to manipulate classification of them-self and other characters and creatures. They cannot read the contents of this specific entry, and yet they can manipulate the information contained within it. The less savory titles and what is likely a truer description of them is therefore not possible. This page is not to be considered entirely accurate. Some things that are accurate are hidden or altered, some words have been shifted and replaced with similar sounding words, which allows us to track information on them. Look for Patterns, especially for cases of the pattern being broken.",
                    "They look like a living cloak, with only darkness beneath the hood. This Cloak has colorful embroidery, and Golden Stars."
                ]
            }
            
        ],
        "":"The Curator may be a representation of how we are giving away or free will and the ability to choose to curate our own experiences"
    }
]
let raceBios = [];
let worldBios = [
    {
        "id":"the_void_spencer_zaugg",
        "infoCard":{
            "name":"The Void",
            "cardData":[
                {
                    "label":"Author",
                    "value":"Spencer Zaugg"
                }
            ],
            "created":"2025-02-20T21:56:41Z",
            "modified":"2025-02-20T21:56:41Z"
    
        },
        "description":"The World Between Worlds",
        "sections":[
            {
                "section":"Please be Patient",
                "text":"I haven't finished it yet this is a test"
            }
        ]
    
    }
];
let floraBios = []
let magicsystemBios = [];
let organizationBios = [];
let biomeBios = [];
let countryBios = [];


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

app.get('/api/characters/:id?', async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(characters)
    }
    else{
        const character = characterBios.find(char => char.id === id);
        if(character){
            res.send({character});
        }
        else{
            res.status(404).json({ error: "Character not found" });
        }
    }
});



app.get('/api/writingadvice/', async (_req, res) => {
    res.send(writingadvice);
});



app.get('/api/writingprompts/', async (_req, res) => {
    res.send(writingprompts)
});



app.get('/api/worldbuilding/races/:id?', async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(races)
    }
    else{
        const race = raceBios.find(bio => bio.id === id);
        if(race){
            res.send(race);
        }
        else{
            res.status(404).json({ error: "Race not found" });
        }
    }
});
app.get('/api/worldbuilding/worlds/:id?', async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(worlds)
    }
    else{
        const world = worldBios.find(bio => bio.id === id);
        if(world){
            res.send(world);
        }
        else{
            res.status(404).json({ error: "World not found" });
        }
    }
});

app.get('/api/worldbuilding/wildlife/:id?', async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(wildlife)
    }
    else{
        const character = wildlifeBios.find(bio => bio.id === id);
        if(character){
            res.send(character);
        }
        else{
            res.status(404).json({ error: "Wildlife not found" });
        }
    }
});

app.get('/api/worldbuilding/flora/:id?', async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(flora)
    }
    else{
        const floraBio = floraBios.find(bio => bio.id === id);
        if(floraBio){
            res.send(floraBio);
        }
        else{
            res.status(404).json({ error: "Flora not found" });
        }
    }
});

app.get('/api/worldbuilding/magicsystems/:id?', async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(magicsystems)
    }
    else{
        const magicsystem = magicsystemBios.find(bio => bio.id === id);
        if(magicsystem){
            res.send(magicsystem);
        }
        else{
            res.status(404).json({ error: "Magic System not found" });
        }
    }
});

app.get('/api/worldbuilding/organizations/:id?', async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(organizations)
    }
    else{
        const organization = organizationBios.find(bio => bio.id === id);
        if(organization){
            res.send(organization);
        }
        else{
            res.status(404).json({ error: "Organization not found" });
        }
    }
});

app.get('/api/worldbuilding/biomes/:id?', async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(biomes)
    }
    else{
        const biome = biomeBios.find(bio => bio.id === id);
        if(biome){
            res.send(biome);
        }
        else{
            res.status(404).json({ error: "Biome not found" });
        }
    }
});

app.get('/api/worldbuilding/countries/:id?', async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(countries)
    }
    else{
        const country = countryBios.find(bio => bio.id === id);
        if(country){
            res.send(country);
        }
        else{
            res.status(404).json({ error: "Country not found" });
        }
    }
});


app.get('/api/stories/:storyID?/:chapterID?', async (req, res) => {
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
            res.send({email:user.email, username:user.username, displayname:user.displayname, profanityFilter:user.profanityFilter});    
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
        res.send({email:user.email, username:user.username, displayname:user.displayname, profanityFilter:user.profanityFilter});
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

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
    const user = await findUser('token', req.cookies[authCookieName]);
    if (user) {
      next();
    } else {
      res.status(401).send({ msg: 'Unauthorized' });
    }
  };
app.get('/api/user/any', async (req, res) => {
    try{
        const username = req.query.username
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
app.get('/api/user/me', async (req, res) => {
    const token = req.cookies[authCookieName];
    const user = await getUser('token', token);
    if (user){
        res.send({email:user.email, username:user.username, displayname:user.displayname, profanityFilter:user.profanityFilter});
    }
    else{
        res.status(401).send({msg:"Not Logged in"});
    }
});
app.put('/api/user/prof', async(req, res) => {
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
app.get('/api/user/prof',  async(req, res) => {
    const token = req.cookies[authCookieName];
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

//update user middleware
async function updateUser(user){
    const index = users.findIndex((use) => use.username === user.username);
    if (index !== -1) {
        users[index] = user;
    } else {
        console.warn(`User ${user.username} not found in memory.`);
    }
}





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
