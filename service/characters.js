const express = require('express');
const { verifyAuth, createID, getUser, authCookieName} = require('./service.js');  
const urlPrefix = "/characters/"

const characterRouter = express.Router();

let characters = [
    
];

let characterBios =[
    
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
    const author = req.username;
    const description = req.body.description;
    if(!name || !author || !description){
        res.status(409).send({msg:"Required fields not filled out"});

    }
    const id = await createID(req.body.name, req.body.author);
    if(await getCharacter("id", id)){
        res.status(409).send({msg:"A Character by you and by that name already exists"});
    }else{
        const character = await createCharacter(req.body, author, id);
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
            if(updated.msg){
                return res.status(500).send(updated.msg);
            }
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




async function createCharacter(characterData, author, id){
    const characterURL = urlPrefix + id;
    const {name, titles, roles, description, gender, 
        pronouns, born, died, homeWorld, homeCountry, homeTown,
        otherWorlds = [], otherCountries = [], race, altForms = [], 
        abilities, enemies, allies,
        organizations, religion, family, custom, sections
    } = characterData
    
    const created = new Date().toJSON();
    await addTypes(roles);
    const character = {
        id,
        name,
        url:characterURL,
        author,
        family,
        titles,
        gender,
        pronouns,
        born,
        died,
        roles,
        race, //stored for editing
        altForms, //stored for editing,
        races:[race, ...(altForms ?? [])], //stored for querries
        religion,
        organizations,
        abilities,
        enemies,
        allies,
        homeWorld,
        homeCountry,
        homeTown,
        otherWorlds,
        otherCountries,
        countries:[homeCountry, ...(otherCountries ?? [])],
        worlds: [homeWorld, ...(otherWorlds ?? [])],
        custom,
        description,
        sections,
        created,
        modified:created,
    }
    characters.push(character)
    return character
}
async function updateCharacter(id, updateData){
    const {roles} = updateData
    const character = await getCharacter("id", id);
    if(JSON.stringify(roles) !== JSON.stringify(character)){
        await addTypes(roles);
    }
    updateData.modified = new Date().toJSON();
    return await updateCharacter(updateData);
}
async function characterUpdate(character){
    const index = characters.findIndex(char => char.id === character.id);
    if(index !== -1){
        characters[index] = character;
        return character
    }
    else {
        return {msg:"failed to update character"}
    }
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
