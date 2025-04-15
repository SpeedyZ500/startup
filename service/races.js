const express = require('express');
const { verifyAuth } = require('./service.js');
const urlPrefix = "/worldbuilding/races/";

const racesRouter = express.Router();

const { 
    createID, 
    baseFields,
    fullBio,
    racePreProcessing,
    raceCardLookups,
    raceFullLookups,
    raceProjectionFields,
    raceBioProjectionFields,
    raceEditProjectionFields,
    getOptions,
    modifyMany,
    addOne,
    updateOne,
    getCards,
    getDisplayable,
    getEditable


    
 } = require('./database.js')

racesRouter.get(`${urlPrefix}types/options`, async (req, res) => {
    const options = await getOptions("racetypes")
    res.send(options)
})

racesRouter.get(`${urlPrefix}options`, async (req, res) => {
    const options = await getOptions("race", {query:req.query})
    res.send(options)
})




racesRouter.get(`${urlPrefix}`, async (req, res) => {
    const query = req.query || {};
    const raceToSend = await getCards(urlPrefix, {
        query,
        lookupFields:raceCardLookups,
        fields:baseFields,
        projectionFields:raceProjectionFields
    })
    res.send(raceToSend)
})

racesRouter.get(`${urlPrefix}:id/bio`, async (req, res) => {
    const { id } = req.params;
    try{
        const race = await getDisplayable(urlPrefix, id, {
            lookupFields:raceFullLookups,
            fields:fullBio,
            projectionFields:raceBioProjectionFields
        });
        if(race){
            res.send(race);
        }
        else{
            res.status(404).json({ error: "Race not found" });
        }
    }
    catch{
        res.status(500).send({msg:"server error"})
    }
    
});
racesRouter.get(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const author = req.usid
    const {id} = req.params
    try{
        const race = await getEditable(urlPrefix, author, id, {
                lookupFields:raceFullLookups,
                fields:fullBio,
                projectionFields:raceEditProjectionFields
            }
        );
        if(race){
            return res.send(race);
        }
        else{
            return res.status(404).send({msg:"race not found"})
        }
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})
    }
})



racesRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
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
        const race = await addOne(urlPrefix, creationData, {preProcessing:racePreProcessing});
        if(race){
            return res.send({id:race.id, name:race.name, url:race.url})
        }
        else{
            return res.status(500).send({msg:"Failed to create Race"})

        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});



racesRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const userID  = req.usid;
    const updateData = req.body;
    if(!updateData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if(!updateData.id || updateData.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Race." });
    }
    try{
        const race = await updateOne(urlPrefix, updateData, userID, {preProcessing:racePreProcessing});
        if(race){
            return res.send({id:race.id, name:race.name, url:race.url})
        }
        else{
            return res.status(500).send({msg:"Failed to update Race"})
        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});








// 🚀 Router: Modify a race field (add/put/delete references)
racesRouter.patch(`${urlPrefix}:list/:method`, verifyAuth, async (req, res) => {
    const { list, method } = req.params;
    const { races, id } = req.body;
    try{
        await modifyMany(urlPrefix, races, list, id, method)
        return res.send({msg:"success"})
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})
    }
});
module.exports = racesRouter;
