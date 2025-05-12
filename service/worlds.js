const express = require('express');
const { verifyAuth, authCookieName} = require('./service.js');
const { createID, 
    addOne, 
    updateOne, 
    worldPreProcessing,
    worldFullFields,
    baseLookupFields,
    baseEditProjectionFields,
    baseUnwindFields,
    getAuth,
    getEditable
 } = require("./database.js")
const urlPrefix = "/worldbuilding/worlds/";

const worldsRouter = express.Router();

worldsRouter.get(`${urlPrefix}author/:id`,async (req, res)=>{
    const token = req.cookies[authCookieName];
    const author = await getAuth(token)
    if(!author){
        return res.send({isAuthor:false})
    }
    const id = req.params.id
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



worldsRouter.get(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const author = req.usid
    const {id} = req.params
    try{
        const world = await getEditable(urlPrefix, author, id, {
                lookupFields:baseLookupFields,
                fields:worldFullFields,
                projectionFields:baseEditProjectionFields,
                unwindFields:baseUnwindFields
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
        res.status(e.statusCode || 500).send({msg:e.message})
    }
})




worldsRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
    const {name, description} = req.body;
    const author = req.usid;
    if(!name || !author || !description){
        return res.status(409).send({msg:"Required fields not filled out"});
    }

    const id = await createID(req.body.name, author);
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
        return res.status(e.statusCode || 500).send({msg:e.message})
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
        return res.status(e.statusCode || 500).send({msg:e.message})
    }
});

module.exports = worldsRouter;
