const express = require('express');
const { verifyAuth, authCookieName } = require('./service.js');
const urlPrefix = "/worldbuilding/organizations/";

const organizationsRouter = express.Router();

const { 
    createID, 
    institutionFullFields,
    organizationsPreProcessing,
    postProcessLeader,
    organizationFullLookups,
    organizationEditFields,
    modifyMany,
    addOne,
    updateOne,
    getEditable,
    raceUnwindFields,
    getAuth
 } = require('./database.js')



organizationsRouter.get(`${urlPrefix}author/:id`,async (req, res)=>{
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

organizationsRouter.get(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const author = req.usid
    const {id} = req.params
    try{
        const organization = await getEditable(urlPrefix, author, id, {
                lookupFields:organizationFullLookups,
                fields:institutionFullFields,
                projectionFields:organizationEditFields,
                unwindFields:raceUnwindFields

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
        res.status(e.statusCode || 500).send({msg:e.message})
    }
})



organizationsRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
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
        return res.status(e.statusCode || 500).send({msg:e.message})
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
        return res.status(e.statusCode || 500).send({msg:e.message})
    }
});

organizationsRouter.patch(`${urlPrefix}:list/:method`, verifyAuth, async (req, res) => {
    const { list, method } = req.params;
    const { ids, id } = req.body;
    try{
        await modifyMany(urlPrefix, ids, list, id, method)
        return res.send({msg:"success"})
    }
    catch(e){
        res.status(e.statusCode || 500).send({msg:e.message})
    }
});

module.exports = organizationsRouter;
