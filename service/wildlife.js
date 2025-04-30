const express = require('express');
const { verifyAuth } = require('./service.js');  


const urlPrefix = "/worldbuilding/wildlife/"

const wildlifeRouter = express.Router();

const { 
    createID, 
    baseFields,
    baseFullFields,
    wildlifePreProcessing,
    livingThingCardLookups,
    livingThingFullLookups,
    livingThingProjectionFields,
    livingThingBioProjectionFields,
    livingThingEditProjectionFields,
    livingThingUnwindFields,
    fullBio,
    getOptions,
    modifyMany,
    addOne,
    updateOne,
    getCards,
    getDisplayable,
    getEditable


    
 } = require('./database.js')

wildlifeRouter.get(`${urlPrefix}types/options`, async (req, res) => {
    const options = await getOptions("wildlifetypes")
    res.send(options)
})

wildlifeRouter.get(`${urlPrefix}options`, async (req, res) => {
    const options = await getOptions("wildlife", {query:req.query})
    res.send(options)
})




wildlifeRouter.get(`${urlPrefix}`, async (req, res) => {
    const query = req.query || {};
    const wildlifeToSend = await getCards(urlPrefix, {
        query,
        lookupFields:livingThingCardLookups,
        fields:baseFields,
        projectionFields:livingThingProjectionFields
    })
    res.send(wildlifeToSend)
})

wildlifeRouter.get(`${urlPrefix}:id/bio`, async (req, res) => {
    const { id } = req.params;
    try{
        const wildlife = await getDisplayable(urlPrefix, id, {
            lookupFields:livingThingFullLookups,
            fields:baseFullFields,
            projectionFields:livingThingBioProjectionFields
        });
        if(wildlife){
            res.send(wildlife);
        }
        else{
            res.status(404).json({ error: "Wildlife not found" });
        }
    }
    catch{
        res.status(500).send({msg:"server error"})
    }
    
});
wildlifeRouter.get(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const author = req.usid
    const {id} = req.params
    try{
        const wildlife = await getEditable(urlPrefix, author, id, {
                lookupFields:livingThingFullLookups,
                fields:fullBio,
                projectionFields:livingThingEditProjectionFields,
                unwindFields:livingThingUnwindFields
            }
        );
        if(wildlife){
            return res.send(wildlife);
        }
        else{
            return res.status(404).send({msg:"wildlife not found"})
        }
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})
    }
})



wildlifeRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
    const {name, description} = req.body;
    const author = req.usid;
    if(!name || !author || !description){
        return res.status(409).send({msg:"Required fields not filled out"});
    }

    const id = await createID(req.body.name, author);
    const creationData = req.body;
    creationData.id = id;
    creationData.url = `${urlPrefix}${id}`
    creationData.author = author;



    try{
        const wildlife = await addOne(urlPrefix, creationData, {preProcessing:wildlifePreProcessing});
        if(wildlife){
            return res.send({id:wildlife.id, name:wildlife.name, url:wildlife.url})
        }
        else{
            return res.status(500).send({msg:"Failed to create Wildlife"})

        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});



wildlifeRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const userID  = req.usid;
    const updateData = req.body;
    if(!updateData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if(!updateData.id || updateData.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Wildlife." });
    }
    try{
        const wildlife = await updateOne(urlPrefix, updateData, userID, {preProcessing:wildlifePreProcessing});
        if(wildlife){
            return res.send({id:wildlife.id, name:wildlife.name, url:wildlife.url})
        }
        else{
            return res.status(500).send({msg:"Failed to update Wildlife"})
        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});








// 🚀 Router: Modify a wildlife field (add/put/delete references)
wildlifeRouter.patch(`${urlPrefix}:list/:method`, verifyAuth, async (req, res) => {
    const { list, method } = req.params;
    const { ids, id } = req.body;
    try{
        await modifyMany(urlPrefix, ids, list, id, method)
        return res.send({msg:"success"})
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})
    }
});


module.exports = wildlifeRouter;