const express = require('express');
const { verifyAuth, authCookieName} = require('./service.js');  
const{ createID, getCards, getDisplayable, getEditable, getOptions,
    createProjection,
    createMap,
    addOne, updateOne, modifyMany, ensureArray} = require('./database.js')
const urlPrefix = "/characters/"

const characterRouter = express.Router();








characterRouter.get(`${urlPrefix}types/options`, async (req, res) => {
    const options = await getOptions("characterstypes")
    res.send(options)
})

characterRouter.get(`${urlPrefix}options`, async (req, res) => {
    const options = await getOptions("characters", {query:req.query})
    res.send(options)
})

const characterBaseFields=[
    "id",
    "name",
    "url",
    "description",
    "types",
    "gender",
    "pronouns",
    "born",
    "died",
    "homeTown"
]
const characterBaseLookupFields=[
    "author",
    "race",
    "religion",
    "homeWorld",
    "homeCountry",
]

const characterBaseProjectionFields={
    author:'$authorDetails.displayname',
    race:createProjection("race"),
    religion:createProjection("religion"),
    homeWorld:createProjection("homeWorld"),
    homeCountry:createProjection("homeCountry"),
}

const characterFullFields = [
    ...characterBaseFields,
    "titles", 
    "family",
    "custom",
    "sections",
    "created",
    "modified"
]
const characterFullLookupFields=[
    ...characterBaseLookupFields,
    "altForms",
    "organizations",
    "abilities",
    "enemies",
    "allies",
    "otherWorlds",
    "otherCountries",
]
const characterBioProjectionFields={
    ...characterBaseProjectionFields,
    altForms:createMap("altForms"),
    organizations:createMap("organizations"),
    abilities:createMap("abilities"),
    allies:createMap("allies"),
    enemies:createMap("enemies"),
    otherWorlds:createMap("otherWorlds"),
    otherCountries:createMap("otherCountries"),
}
const characterEditProjectionFields={
    author:'$authorDetails.username',
    race:createProjection("race"),
    religion:createProjection("religion", "edit"),
    homeWorld:createProjection("homeWorld", "edit"),
    homeCountry:createProjection("homeCountry", "edit"),
    altForms:createMap("altForms","edit"),
    organizations:createMap("organizations", "edit"),
    abilities:createMap("abilities","edit"),
    allies:createMap("allies","edit"),
    enemies:createMap("enemies","edit"),
    otherWorlds:createMap("otherWorlds","edit"),
    otherCountries:createMap("otherCountries","edit"),
}


characterRouter.get(`${urlPrefix}`, async (req, res) => {
    const query = req.query || {};
    const charactersToSend = await getCards(urlPrefix, {
        query,
        lookupFields:characterBaseLookupFields,
        fields:characterBaseFields,
        projectionFields:characterBaseProjectionFields
    })
    res.send(charactersToSend)
})

characterRouter.get(`${urlPrefix}:id/bio`, async (req, res) => {
    const { id } = req.params;
    try{
        const character = await getDisplayable(urlPrefix, id, {
            lookupFields:characterFullLookupFields,
            fields:characterFullFields,
            projectionFields:characterBioProjectionFields
        });
        if(character){
            res.send(character);
        }
        else{
            res.status(404).json({ error: "Character not found" });
        }
    }
    catch{
        res.status(500).send({msg:"server error"})
    }
    
});
characterRouter.get(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const author = req.usid
    const {id} = req.params
    try{
        const character = await getEditable(urlPrefix, author, id, {
                lookupFields:characterFullLookupFields,
                fields:characterFullFields,
                projectionFields:characterEditProjectionFields
            }
        );
        if(character){
            return res.send(character);
        }
        else{
            return res.status(404).send({msg:"character not found"})
        }
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})
    }
})

const characterPreProcessing = {
    otherWorlds:ensureArray,
    otherCountries:ensureArray,
    altForms:ensureArray,
    organizations:ensureArray,
    abilities:ensureArray,
    allies:ensureArray,
    enemies:ensureArray,
    titles:ensureArray,
    family:ensureArray,
    custom:ensureArray,
    sections:ensureArray,
    worlds:createCombiner("homeWorld", "otherWorlds"),
    races:createCombiner("race", "altForms"),
    countries:createCombiner("homeCountry", "otherCountries")
}

characterRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
    const {name, description} = req.body;
    const author = req.usid;
    if(!name || !author || !description){
        return res.status(409).send({msg:"Required fields not filled out"});
    }

    const id = createID(req.body.name, author);
    const creationData = req.body;
    creationData.id = id;
    creationData.url = `${urlPrefix}${id}`
    creationData.author = author;



    try{
        const character = await addOne(urlPrefix, creationData, {preProcessing:characterPreProcessing});
        if(character){
            return res.send({id:character.id, name:character.name, url:character.url})
        }
        else{
            return res.status(500).send({msg:"Failed to create Character"})

        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});



characterRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const userID  = req.usid;
    const updateData = req.body;
    if(!updateData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if(!updateData.id || updateData.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Character." });
    }
    try{
        const character = await updateOne(urlPrefix, updateData, userID, {preProcessing:characterPreProcessing});
        if(character){
            return res.send({id:character.id, name:character.name, url:character.url})
        }
        else{
            return res.status(500).send({msg:"Failed to update Character"})
        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});








// 🚀 Router: Modify a character field (add/put/delete references)
characterRouter.patch(`${urlPrefix}:list/:method`, verifyAuth, async (req, res) => {
    const { list, method } = req.params;
    const { characters, id } = req.body;
    try{
        await modifyMany(urlPrefix, characters, list, id, method)
        return res.send({msg:"success"})
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})
    }
});



module.exports = characterRouter
