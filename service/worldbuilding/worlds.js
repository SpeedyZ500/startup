const express = require('express');
const { verifyAuth, } = require('./../service.js');
const { createID, 
    getDisplayable, 
    getCards, 
    addOne, 
    updateOne, 
    getOptions, 
    baseFields,
    worldPreProcessing,
    worldFullFields,
    baseProjectionFields,
    baseLookupFields,
    baseEditProjectionFields,
    optionsMap
 } = require("./../database.js")
const urlPrefix = "/worldbuilding/worlds/";

const worldsRouter = express.Router();




worldsRouter.get(`${urlPrefix}continents/options`, async (req, res) => {
    try {
        const worlds = await getCards(urlPrefix, {
            query:req.query, 
            projectionFields:{
                options:optionsMap("continents")
            },
            fields:["id"]
        });
        const flattened = worlds.flatMap(world =>
            (world.options || []).map(opt => ({
                ...opt,
                qualifier: world.id  // make sure it's still your displayable id
            }))
        );
        res.send(flattened);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Failed to fetch continent options' });
    }
});


worldsRouter.get(`${urlPrefix}options`, async (req, res) => {
    const options = await getOptions(urlPrefix, {query:req.query})
    res.send(options)
})

// 🚀 Router: Fetch worlds or individual world
worldsRouter.get(`${urlPrefix}`, async (req, res) => {
    const query = req.query || {};
    const worldsToSend = await getCards(urlPrefix, {
        query,
        lookupFields:baseLookupFields,
        fields:baseFields,
        projectionFields:baseProjectionFields
    })
    res.send(worldsToSend)
})

worldsRouter.get(`${urlPrefix}:id/bio`, async (req, res) => {
    const { id } = req.params;
    try{
        const world = await getDisplayable(urlPrefix, id, {
            lookupFields:baseLookupFields,
            fields:worldFullFields,
            projectionFields:baseProjectionFields
        });
        if(world){
            res.send(world);
        }
        else{
            res.status(404).json({ error: "World not found" });
        }
    }
    catch{
        res.status(500).send({msg:"server error"})
    }
    
});
worldsRouter.get(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const author = req.usid
    const {id} = req.params
    try{
        const world = await getEditable(urlPrefix, author, id, {
                lookupFields:baseLookupFields,
                fields:worldFullFields,
                projectionFields:baseEditProjectionFields
            }
        );
        if(world){
            return res.send(world);
        }
        else{
            return res.status(404).send({msg:"world not found"})
        }
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})
    }
})




worldsRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
    const {name, description} = req.body;
    const author = req.usid;
    if(!name || !author || !description){
        return res.status(409).send({msg:"Required fields not filled out"});
    }

    const id = createID(req.body.name, author);
    const worldData = req.body;
    worldData.id = id;
    worldData.url = `${urlPrefix}${id}`
    worldData.author = author;
    try{
        const world = await addOne(urlPrefix, worldData, {preProcessing:worldPreProcessing});
        if(world){
            return res.send({id:world.id, name:world.name, url:world.url})
        }
        else{
            return res.status(500).send({msg:"Failed to create World"})

        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});



worldsRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const userID  = req.usid;
    const worldData = req.body;
    if(!worldData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if(!worldData.id || worldData.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different World." });
    }
    try{
        const world = await updateOne(urlPrefix, worldData, userID, {preProcessing:worldPreProcessing});
        if(world){
            return res.send({id:world.id, name:world.name, url:world.url})
        }
        else{
            return res.status(500).send({msg:"Failed to update World"})
        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});

module.exports = worldsRouter;
