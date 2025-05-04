const express = require('express');
const { verifyAuth, authCookieName} = require('./service.js');
const {
    createID, 
    getEditable, 
    biomeLookupFields,
    biomeEditProjectionFields,
    biomePreProcessing, 
    baseFullFields,
    addOne,
    updateOne,
    getUserByToken,
    baseUnwindFields
} = require('./database.js')
const urlPrefix = "/worldbuilding/biomes/";

const biomesRouter = express.Router();

// Temporary store for biomes





biomesRouter.get(`${urlPrefix}author/:id`,async (req, res)=>{
    const token = req.cookies[authCookieName];
    const user = await getUserByToken(token)
    if(!user){
        return res.send({isAuthor:false})
    }
    const id = req.params.id
    const author = user._id
    try{
        await getEditable(urlPrefix, author, id, {
            fields:["id"]
        })
        return res.send({isAuthor:true})
    }
    catch{
        return res.send({isAuthor:false})
    }
})

// 🚀 Router: Fetch biomes or individual biome
biomesRouter.get(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const author  = req.usid 
    try{
        const biome = await getEditable(urlPrefix, author, id, {
                lookupFields:biomeLookupFields,
                fields:baseFullFields,
                projectionFields:biomeEditProjectionFields,
                unwindFields:baseUnwindFields
            }
        );
        if(biome){
            return res.send(biome);
        }
        else{
            return res.status(404).send({msg:"Biome not found"})
        }
    }
    catch(e){
        res.status(e.statusCode || 500).send({msg:e.message})
    }
    
});



// 🚀 Router: Create a new biome
biomesRouter.post(`${urlPrefix}`, verifyAuth, async (req, res) => {
    const { name, description, sections } = req.body;
    const author = req.usid;
    if(!name || !description || !sections){
        return res.status(409).send({msg:"Required fields not filled out"});
    }
    const id = await createID(name, author);
    const biomeData = req.body;
    biomeData.id = id;
    biomeData.url = `${urlPrefix}${id}`
    biomeData.author = author;
    try{
        const biome = await addOne(urlPrefix, biomeData, {preProcessing:biomePreProcessing});
        if(biome){
            return res.send({id:biome.id, name:biome.name, url:biome.url})
        }
        else{
            return res.status(500).send({msg:"Failed to create Biome"})
        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});

// 🚀 Router: Modify an existing biome (author check)
biomesRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const { body, usid } = req;
    if(!body){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if( !body.id || body.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Biome." });
    }
    try{
        const biome = await updateOne(urlPrefix, body, usid, {preProcessing:biomePreProcessing});
        if(biome){
            return res.send({id:biome.id, name:biome.name, url:biome.url})
        }
        else{
            return res.status(500).send({msg:"Failed to update Biome"})
        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});



// 🚀 Router: Modify a country field (add/put/delete references)
biomesRouter.patch(`${urlPrefix}:list/:method`, verifyAuth, async (req, res) => {
    const { list, method } = req.params;
    const { biomes, id } = req.body;
    try{
        await modifyMany(urlPrefix, biomes, list, id, method)
        return res.send({msg:"success"})
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})
    }
});


module.exports = biomesRouter;
