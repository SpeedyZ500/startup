const express = require('express');
const { verifyAuth, createID, getUser, authCookieName} = require('./service.js');  
const urlPrefix = "/characters/"

const characterRouter = express.Router();

let characters = [
    {
        "id":"alastor_moonblaze_spencer_zaugg",
        "name":"Alastor Moonblaze",
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
        "name":"The Curator",
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
        "id":"alastor_moonblaze_spencer_zaugg",
        
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
        return characters.find((character) => character[field] === value);
    }
    return null;
}
async function getCharacterBio(field, value){
    if (value) {
        return characterBios.find((character) => character[field] === value);
    }
    return null;
}

async function getCharacters(queries){
    if(typeof queries === "object"){
        let filterCharacters = characters;
        for(const [key, value] of Object.entries(queries)){
            if(Array.isArray(value)){
                filterCharacters = filterCharacters.filter(((character) => 
                    Array.isArray(character[key]) ? character[key].some(char => value.includes(char)) : value.includes(character[key] )))
            }
            else{
                filterCharacters = filterCharacters.filter(((character) => 
                    Array.isArray(character[key]) ? character[key].includes(value) : value === character[key]))
            }
        }
        return filterCharacters;
    }
    else{
        return characters;
    }
}


characterRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const queries = req.query || {};
    const {author} = req.query || "";
    if(!id || id === "undefined" || id.trim() === ""){
        if(Object.keys(queries).length > 0){
            let charactersToSend = await getCharacters(queries);
            res.send(charactersToSend)
        }
        else{
            res.send(characters)
        }
    }
    else{
        if(id == "types"){
            res.send(characterTypes);
        }
        else{
            const character = await getCharacterBio("id", id);
            if(character){
                if(author){
                    const isAuthor = author === character.author;
                    res.send({isAuthor})
                }
                else{
                    res.send(character);
                }
            }
            else{
                res.status(404).json({ error: "Character not found" });
            }
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
    const id = await createID(req.body.name, req.body.author);
    if(await getCharacter("id", id)){
        res.status(409).send({msg:"A Character by you and by that name already exists"});
    }else{
        const character = await createCharacter(req.body, id);
        if(character){
            res.send({name:character.name, url:character.url, id:character.id})
        }
    }
});



characterRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const username  = req.username;
    const character = await getCharacter("id", id);
    if(character){
        if(username === character.author){
            const updateData = req.body;
            const updated = await updateCharacter(id, updateData)
            res.send({name:updated.name, url:updated.url, id:updated.id})
        }
        else{
            res.status(401).send({msg:`${currUser.displayname} is not the author`});
        }
    }
    else{
        res.status(404).send({msg:`Character ${id}, not found`});
    }
})




async function createCharacter(characterData, id){
    const characterURL = urlPrefix + id;
    
    const created = new Date().toJSON();
    const characterBio = {
        id:id,
        name:characterData.name,
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
                    source:"/worldbuilding/worlds",
                    edit:"select"
                },
                {
                    label:"Country",
                    value:characterData.Countries,
                    source:"/worldbuilding/countries",
                    edit:"multi-select"
                },
                {
                    label:"Family",
                    value:characterData.Family,
                    source:"/characters",
                    edit:"super-select"
                },
                {
                    label:"Titles",
                    value:characterData.Titles,
                    edit:"text-creatable"
                },
                {
                    label:"Born",
                    value:characterData.Born,
                    edit:"text"
                },
                {
                    label:"Died",
                    value:characterData.Died,
                    edit:"text"
                },
                {
                    label:"Race",
                    value:characterData.Race,
                    source:"/wordbuilding/races",
                    edit:"special-select",
                    qualifier:["sudo-shape-shifter"],
                },
                {
                    label:"Abilities",
                    value:characterData.Abilities,
                    source:"/worldbuilding/magicsystems",
                    edit:"multi-select"
                },
                {
                    label:"Type",
                    value:characterData.Type,
                    source:"/characters/types",
                    edit:"creatable"
                },
                {
                    label:"Allies",
                    value:characterData.Allies,
                    source:"/characters",
                    edit:"multi-select"
                },
                {
                    label:"Enemies",
                    value:characterData.Enemies,
                    source:"/characters",
                    edit:"multi-select"
                },
                {
                    label:"Organizations",
                    value:characterData.Organizations,
                    source:"/worldbuilding/organizations",
                    edit:"multi-select"
                },
                {
                    label:"Religion",
                    value:characterData.Religion,
                    source:"/worldbuilding/organizations",
                    type:"Religion",
                    edit:"select"
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
    const race = (characterData.Race && characterData.Race.length > 0) 
    ? characterData.Race.find(item => 
        (Array.isArray(item.type) ? 
            item.type.includes("sudo-shape-shifter") : item.type === "sudo-shape-shifter")
        ) || characterData.Race[0] || {value:"", path:""}
    : {value:"", path:""};

    const character = {
        id:id,
        name:characterData.name,
        url:characterURL,
        author:characterData.author,
        description:characterData.description,
        organizations:(characterData.Organizations && characterData.Organizations.length > 0)
        ? characterData.Organizations.map(org => org.id) 
        : [],
        belief:(characterData.Religion && characterData.Religion.length > 0)
        ? characterData.Religion.map(rel => rel.id)
        : [],
        abilities:(characterData.Abilities && characterData.Abilities.length > 0)
        ? characterData.Abilities.map(abil => abil.id)
        : [],
        world:(characterData.World && characterData.World.length > 0)
        ? characterData.World[0]?.id 
        : "",
        country:(characterData.Countries && characterData.Countries.length > 0)
        ? characterData.Race.map(abil => abil.id)
        : [],
        type:characterData.Type || [],
        race:(characterData.Race && characterData.Race.length > 0)
        ? characterData.Race.map(abil => abil.id) 
        : [],
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
                value:(characterData.World && characterData.World.length > 0)
                ? characterData.World[0]?.value 
                : "",
                path:(characterData.World && characterData.World.length > 0)
                ? characterData.World[0]?.path 
                : ""
            },
            {
                label:"Race",
                value: race?.value || "",
                path: race?.path || "",
            },
            {
                label:"Type",
                value:characterData.Type || [],
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
const onCard = ["Type", "Race", "World", "Abilities", "Religion", "Organizations", "Countries"];
async function updateCharacter(id, updateData){
    const {description, infoCard, sections} = updateData
    const characterBio = await getCharacterBio("id", id);
    const character = await getCharacter("id", id);
    if(infoCard && infoCard !== characterBio.infoCard){
        if(infoCard.name !== characterBio.infoCard.name){
            characterBio.infoCard.name = infoCard.name;
            character.name = infoCard.name;
        }
        if(infoCard.cardData && JSON.stringify(infoCard.cardData) !== JSON.stringify(characterBio.infoCard.cardData)){
            const cardData = characterBio.infoCard.cardData;
            const customData = characterBio.infoCard.cardData.filter(item => item.custom);
            for(const item of customData){
                const customInstance = infoCard.cardData.find(data => data.id === item.id);
                if(customInstance){
                    if(JSON.stringify(item) !== JSON.stringify(customInstance)){
                        const updateIndex = cardData.findIndex(data => data.id === item.id);
                        characterBio.infoCard.cardData[updateIndex] = customInstance;
                    }
                }
                else{
                    characterBio.infoCard.cardData = characterBio.infoCard.cardData.filter(data => data.id !== item.id);
                }
            }
            for (const item of infoCard.cardData){
                const existingIndex = cardData.findIndex(value => value.label === item.label)
                if(existingIndex != -1){
                    if(JSON.stringify(item) !== JSON.stringify(cardData[existingIndex])){
                        characterBio.infoCard.cardData[existingIndex].value = item.value;
                        if(onCard.includes(item.label)){
                            if(item.label === "Type"){
                                await addTypes(item.value);
                                character[item.label.toLowerCase()] = item.value;

                            }
                            else if(["World"].includes(item.label)){
                                character[item.label.toLowerCase()] = item.value[0]?.id;
                                const detailIndex = character.details.findIndex(detail => detail.label === item.label);
                                if (detailIndex !== -1) {
                                    character.details[detailIndex].value = item.value[0]?.value;
                                    character.details[detailIndex].path = item.value[0]?.path;
                                }
                            }
                            else{
                                character[item.label.toLowerCase()] = item.value.map(abil => abil.id);
                                if(item.label === "Race"){
                                    const race = item.value.find(val => 
                                        (Array.isArray(val.type) ? 
                                        val.type.includes("sudo-shape-shifter") : val.type === "sudo-shape-shifter"
                                    )
                                    ) || item.value[0];
                                    const detailIndex = character.details.findIndex(detail => detail.label === "Race");
                                    character.details[detailIndex].value = race?.value
                                    character.details[detailIndex].path = race?.path
                                }
                            }
                            
                            
                        }
                    }
                }
                else{
                    characterBio.infoCard.cardData.push(item);
                }
            }
                
        }
    }
    if(description && description !== characterBio.description){
        characterBio.description = description;
        character.description = description;
    }
    if(sections && JSON.stringify(sections) !== JSON.stringify(characterBio.sections)){
        characterBio.sections = sections;
    }
    characterBio.infoCard.modified = new Date().toJSON()
    const bioIndex = characterBios.findIndex(bio => bio.id === id);
    const characterIndex = characters.findIndex(bio => bio.id === id);
    characterBios[bioIndex] = characterBio;
    characters[characterIndex] = character;
    return character;
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

async function modifyCharacter(characterID, list, data, method) {
    const { id, value, path } = data;

    // Retrieve the character bio and main character data
    const characterBio = await getCharacterBio("id", characterID);
    const character = await getCharacter("id", characterID);

    if (!characterBio || !character) {
        console.error(`Character with ID '${characterID}' not found.`);
        return { error: "Character not found" };
    }

    // Locate the relevant list in both characterBio and character
    const bioList = characterBio.infoCard.cardData.find(item => item.label.toLowerCase() === list.toLowerCase());
    const characterList = character[list.toLowerCase()];

    if (!bioList || !characterList) {
        console.error(`List '${list}' not found.`);
        return { error: `List '${list}' not found.` };
    }

    // Create the item object (value, id, path)
    const newItem = { value, id, path };

    // Add or update references
    if (method === 'add' || method === 'put') {
        const existsInCharacter = characterList.some(item => item.id === id);
        const existsInBio = bioList.value.some(item => item.id === id);

        if (!existsInCharacter) {
            characterList.push(newItem);  // Add to character object
        }
        if (!existsInBio) {
            bioList.value.push(newItem);  // Add to character bio
        }
    } 
    // Delete references
    else if (method === 'delete') {
        // Remove from character object
        const characterListIndex = characterList.findIndex(item => item.id === id);
        if (characterListIndex !== -1) {
            characterList.splice(characterListIndex, 1);
        }

        // Remove from bio card data
        const bioListIndex = bioList.value.findIndex(item => item.id === id);
        if (bioListIndex !== -1) {
            bioList.value.splice(bioListIndex, 1);
        }
    }

    // Return updated character
    return { message: `Character '${list}' modified successfully`, character };
}

// 🚀 Router: Modify a character field (add/put/delete references)
characterRouter.patch(`${urlPrefix}:id/:list`, verifyAuth, async (req, res) => {
    const { id, list } = req.params;
    const { method, data } = req.body;

    const result = await modifyCharacter(id, list, data, method);

    if (result.error) {
        res.status(404).json(result);
    } else {
        res.send(result);
    }
});



module.exports = {characterRouter, modifyCharacter}
