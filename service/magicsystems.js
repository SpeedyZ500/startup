const express = require('express');
const { verifyAuth } = require('./service.js');
const urlPrefix = "/worldbuilding/magicsystems/";


const magicRouter = express.Router();

const { 
    createID, 
    baseFields,
    fullBio,
    magicSystemPreProcessing,
    institutionLookups,
    magicSystemFullLookups,
    institutionProjectionFields,
    institutionBioProjectionFields,
    institutionEditProjectionFields,
    getOptions,
    modifyMany,
    addOne,
    updateOne,
    getCards,
    getDisplayable,
    getEditable,
    raceUnwindFields



    
 } = require('./database.js')

magicRouter.get(`${urlPrefix}types/options`, async (req, res) => {
    const options = await getOptions("magictypes")
    res.send(options)
})

magicRouter.get(`${urlPrefix}options`, async (req, res) => {
    const options = await getOptions("magicsystems", {query:req.query})
    res.send(options)
})




magicRouter.get(`${urlPrefix}`, async (req, res) => {
    const query = req.query || {};
    const magicSystemToSend = await getCards(urlPrefix, {
        query,
        lookupFields:institutionLookups,
        fields:baseFields,
        projectionFields:institutionProjectionFields,
        unwindFields:raceUnwindFields
    })
    res.send(magicSystemToSend)
})

magicRouter.get(`${urlPrefix}:id/bio`, async (req, res) => {
    const { id } = req.params;
    try{
        const magicSystem = await getDisplayable(urlPrefix, id, {
            lookupFields:magicSystemFullLookups,
            fields:fullBio,
            projectionFields:institutionBioProjectionFields
        });
        if(magicSystem){
            res.send(magicSystem);
        }
        else{
            res.status(404).json({ error: "Magic System not found" });
        }
    }
    catch{
        res.status(500).send({msg:"server error"})
    }
    
});
magicRouter.get(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const author = req.usid
    const {id} = req.params
    try{
        const magicSystem = await getEditable(urlPrefix, author, id, {
                lookupFields:magicSystemFullLookups,
                fields:fullBio,
                projectionFields:institutionEditProjectionFields
            }
        );
        if(magicSystem){
            return res.send(magicSystem);
        }
        else{
            return res.status(404).send({msg:"magic system not found"})
        }
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})
    }
})



magicRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
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
        const magicSystem = await addOne(urlPrefix, creationData, {preProcessing:magicSystemPreProcessing});
        if(magicSystem){
            return res.send({id:magicSystem.id, name:magicSystem.name, url:magicSystem.url})
        }
        else{
            return res.status(500).send({msg:"Failed to create Magic System"})

        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});



magicRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const userID  = req.usid;
    const updateData = req.body;
    if(!updateData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if(!updateData.id || updateData.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Magic System." });
    }
    try{
        const magicSystem = await updateOne(urlPrefix, updateData, userID, {preProcessing:magicSystemPreProcessing});
        if(magicSystem){
            return res.send({id:magicSystem.id, name:magicSystem.name, url:magicSystem.url})
        }
        else{
            return res.status(500).send({msg:"Failed to update Magic System"})
        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});

magicRouter.patch(`${urlPrefix}:list/:method`, verifyAuth, async (req, res) => {
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

module.exports = magicRouter;
