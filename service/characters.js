const express = require('express');
const { verifyAuth, createID} = require('./service.js');  
const urlPrefix = "/characters/"

const characterRouter = express.Router();

let characters = [
    {
        "id":"alastor_moonblaze_spencer_zaugg",
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
        "id":"the_curator_spencer_zaugg",
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
let characterTypes = []

async function getCharacter(field, value){
    if (value) {
        return character.find((character) => character[field] === value);
    }
    return null;
}
async function getCharacterBio(field, value){
    if (value) {
        return characterBios.find((character) => character[field] === value);
    }
    return null;
}


characterRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(characters)

    }
    else{
        if(id == "types"){
            res.send(characterTypes);
        }
        const character = await getCharacterBio("id", id);
        if(character){
            res.send({character});
        }
        else{
            res.status(404).json({ error: "Character not found" });
        }
    }
});

characterRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
    const name = req.body.name;
    const author = req.body.author;
    const description = req.body.description;
    if(!name || !author || !description){
        res.status(409).send({msg:"Required fields not filled out"});

    }
    const id = createID(req.body.name, req.body.author);
    if(await getCharacter("id", id)){
        res.status(409).send({msg:"A Character by you and by that name already exists"});
    }else{
        const character = await createCharacter(req.body, id);
        if(character){
            res.send({name:character.name, url:character.url, id:character.id})
        }
    }
});


async function createCharacter(characterData, id){
    const characterURL = prefixURL + id;
    
    const created = new Date().toJSON();
    const characterBio = {
        id:id,
        url:characterURL,
        author:characterData.author,
        infoCard:{
            name:characterData.name,
            cardData:[
                {
                    label:"Author",
                    value:characterData.author
                },
                {
                    label:"World",
                    value:characterData.World,
                    source:"/worldbuilding/worlds"
                },
                {
                    label:"Country",
                    value:characterData.Country,
                    source:"/worldbuilding/countries"
                },
                {
                    label:"Family",
                    value:characterData.Family,
                    source:"/characters"
                },
                {
                    label:"Titles",
                    value:characterData.Titles
                },
                {
                    label:"Born",
                    value:characterData.Born
                },
                {
                    label:"Died",
                    value:characterData.Died
                },
                {
                    label:"Race",
                    value:characterData.Race,
                    source:"/wordbuilding/races",
                },
                {
                    label:"Abilities",
                    value:characterData.Abilities
                },
                {
                    label:"Type",
                    value:characterData.Type,
                    source:"/characters/types"
                },
                {
                    label:"Allies",
                    value:characterData.Allies,
                    source:"/characters"
                },
                {
                    label:"Enemies",
                    value:characterData.Enemies,
                    source:"/characters"
                },
                {
                    label:"Organizations",
                    value:characterData.Organizations,
                    source:"/worldbuilding/organizations",
                },
                {
                    label:"Religion",
                    value:characterData.Religion,
                    source:"/worldbuilding/organizations",
                    type:"Religion"
                }
            ],
            created:created,
            modified:created
        },
        description:characterData.description,
        sections:characterData.sections
    };
    await addTypes(characterData.Type);
    characterBios.push(characterBio);
    const worldName = typeof characterData.World === 'object' && characterData.World !== null 
    ? characterData.World.value 
    : characterData.World;

    const worldPath = typeof characterData.World === 'object' && characterData.World !== null 
        ? characterData.World.path 
        : null;

    const raceName = typeof characterData.Race === 'object' && characterData.Race !== null 
    ? characterData.Race.value 
    : characterData.Race;

    const racePath = typeof characterData.Race === 'object' && characterData.Race !== null 
        ? characterData.Race.path 
        : null;

    const character = {
        id:id,
        url:characterURL,
        author:characterData.author,
        description:characterData.description,
        organizations:characterData.Organizations,
        belief:characterData.Religion,
        abilities:characterData.Abilities,
        world:characterData.World,
        country:characterData.Country,
        types:characterData.Type,
        race:characterData.Race,
        details:[
            {
                label:"name",
                value:characterData.name,
                path:characterURL,
                location:"head",
                filter:false
            },
            {
                label:"author",
                value:characterData.author,
            },
            {
                label:"World",
                value:worldName,
                path:worldPath
            },
            {
                label:"Race",
                value:raceName,
                path:racePath
            },
            {
                label:"Type",
                value:characterData.Type,
                display:false
            },
            {
                label:"Created",
                value:created,
                "display":false,
                "filter":false
            }


        ]
    }
    characters.push(character)

    return character

}

async function addTypes(type){
    if(Array.isArray(type)){
        type.forEach((item) => {
            if(!characterTypes.includes(item)){
                characterTypes.push(item);
            }
        })
    }
    else{
        if(!characterTypes.includes(type)){
            characterTypes.push(type)
        }
    }
    return "done"
}
module.exports = characterRouter
