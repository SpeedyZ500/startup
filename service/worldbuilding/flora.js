const express = require('express');
const { verifyAuth } = require('./../service.js');
const urlPrefix = "/worldbuilding/flora/"

const floraRouter = express.Router();
const { 
    createID, 
    baseFields,
    fullBio,
    floraPreProcessing,
    livingThingCardLookups,
    livingThingFullLookups,
    livingThingProjectionFields,
    livingThingBioProjectionFields,
    livingThingEditProjectionFields,
    getOptions,
    modifyMany,
    addOne,
    updateOne,
    getCards,
    getDisplayable,
    getEditable


    
 } = require('./../database.js')

floraRouter.get(`${urlPrefix}types/options`, async (req, res) => {
    const options = await getOptions("floratypes")
    res.send(options)
})

floraRouter.get(`${urlPrefix}options`, async (req, res) => {
    const options = await getOptions("flora", {query:req.query})
    res.send(options)
})




floraRouter.get(`${urlPrefix}`, async (req, res) => {
    const query = req.query || {};
    const floraToSend = await getCards(urlPrefix, {
        query,
        lookupFields:livingThingCardLookups,
        fields:baseFields,
        projectionFields:livingThingProjectionFields
    })
    res.send(floraToSend)
})

floraRouter.get(`${urlPrefix}:id/bio`, async (req, res) => {
    const { id } = req.params;
    try{
        const flora = await getDisplayable(urlPrefix, id, {
            lookupFields:livingThingFullLookups,
            fields:fullBio,
            projectionFields:livingThingBioProjectionFields
        });
        if(flora){
            res.send(flora);
        }
        else{
            res.status(404).json({ error: "Flora not found" });
        }
    }
    catch{
        res.status(500).send({msg:"server error"})
    }
    
});
floraRouter.get(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const author = req.usid
    const {id} = req.params
    try{
        const flora = await getEditable(urlPrefix, author, id, {
                lookupFields:livingThingFullLookups,
                fields:fullBio,
                projectionFields:livingThingEditProjectionFields
            }
        );
        if(flora){
            return res.send(flora);
        }
        else{
            return res.status(404).send({msg:"flora not found"})
        }
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})
    }
})



floraRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
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
        const flora = await addOne(urlPrefix, creationData, {preProcessing:floraPreProcessing});
        if(flora){
            return res.send({id:flora.id, name:flora.name, url:flora.url})
        }
        else{
            return res.status(500).send({msg:"Failed to create Flora"})

        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});



floraRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const userID  = req.usid;
    const updateData = req.body;
    if(!updateData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if(!updateData.id || updateData.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Flora." });
    }
    try{
        const flora = await updateOne(urlPrefix, updateData, userID, {preProcessing:floraPreProcessing});
        if(flora){
            return res.send({id:flora.id, name:flora.name, url:flora.url})
        }
        else{
            return res.status(500).send({msg:"Failed to update Flora"})
        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});








// 🚀 Router: Modify a flora field (add/put/delete references)
floraRouter.patch(`${urlPrefix}:list/:method`, verifyAuth, async (req, res) => {
    const { list, method } = req.params;
    const { flora, id } = req.body;
    try{
        await modifyMany(urlPrefix, flora, list, id, method)
        return res.send({msg:"success"})
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})
    }
});
module.exports = floraRouter;
