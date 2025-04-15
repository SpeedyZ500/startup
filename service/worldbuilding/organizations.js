const express = require('express');
const { verifyAuth } = require('./../service.js');
const urlPrefix = "/worldbuilding/organizations/";

const organizationsRouter = express.Router();

const { 
    createID, 
    baseInstitutionCards,
    institutionFullFields,
    organizationsPreProcessing,
    postProcessLeader,
    institutionLookups,
    organizationFullLookups,
    institutionProjectionFields,
    organizationBioProjectionFields,
    organizationEditFields,
    getOptions,
    modifyMany,
    addOne,
    updateOne,
    getCards,
    getDisplayable,
    getEditable


    
 } = require('./../database.js')

organizationsRouter.get(`${urlPrefix}types/options`, async (req, res) => {
    const options = await getOptions("organizationtypes")
    res.send(options)
})

organizationsRouter.get(`${urlPrefix}options`, async (req, res) => {
    const options = await getOptions("organizations", {query:req.query})
    res.send(options)
})




organizationsRouter.get(`${urlPrefix}`, async (req, res) => {
    const query = req.query || {};
    const organizationToSend = await getCards(urlPrefix, {
        query,
        lookupFields:institutionLookups,
        fields:baseInstitutionCards,
        projectionFields:institutionProjectionFields
    })
    res.send(organizationToSend)
})

organizationsRouter.get(`${urlPrefix}:id/bio`, async (req, res) => {
    const { id } = req.params;
    try{
        const organization = await getDisplayable(urlPrefix, id, {
            lookupFields:organizationFullLookups,
            fields:institutionFullFields,
            projectionFields:organizationBioProjectionFields
        });
        if(organization){
            res.send(organization);
        }
        else{
            res.status(404).json({ error: "organization not found" });
        }
    }
    catch{
        res.status(500).send({msg:"server error"})
    }
    
});
organizationsRouter.get(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const author = req.usid
    const {id} = req.params
    try{
        const organization = await getEditable(urlPrefix, author, id, {
                lookupFields:organizationFullLookups,
                fields:institutionFullFields,
                projectionFields:organizationEditFields
            }
        );
        if(organization){
            return res.send(organization);
        }
        else{
            return res.status(404).send({msg:"organization not found"})
        }
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})
    }
})



organizationsRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
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
        const organization = await addOne(urlPrefix, creationData, {
            preProcessing:organizationsPreProcessing, 
            postProcessing:postProcessLeader
        });
        if(organization){
            return res.send({id:organization.id, name:organization.name, url:organization.url})
        }
        else{
            return res.status(500).send({msg:"Failed to create Organization"})

        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});



organizationsRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const userID  = req.usid;
    const updateData = req.body;
    if(!updateData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if(!updateData.id || updateData.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Organization." });
    }
    try{
        const organization = await updateOne(urlPrefix, updateData, userID, {preProcessing:organizationsPreProcessing});
        if(organization){
            return res.send({id:organization.id, name:organization.name, url:organization.url})
        }
        else{
            return res.status(500).send({msg:"Failed to update Organization"})
        }
    }
    catch(e){
        return res.status(e.status || 500).send({msg:e.message})
    }
});

organizationsRouter.patch(`${urlPrefix}:list/:method`, verifyAuth, async (req, res) => {
    const { list, method } = req.params;
    const { organizations, id } = req.body;
    try{
        await modifyMany(urlPrefix, organizations, list, id, method)
        return res.send({msg:"success"})
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})
    }
});

module.exports = organizationsRouter;
