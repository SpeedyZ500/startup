const express = require('express');
const { verifyAuth, authCookieName } = require('./service.js');
const urlPrefix = "/worldbuilding/flora/"

const floraRouter = express.Router();
const { 
    createID, 
    fullBio,
    floraPreProcessing,
    livingThingFullLookups,
    livingThingEditProjectionFields,
    modifyMany,
    addOne,
    updateOne,
    getEditable,
    getUserByToken,
    livingThingUnwindFields
    
 } = require('./database.js')

 floraRouter.get(`${urlPrefix}author/:id`,async (req, res)=>{
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

floraRouter.get(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const author = req.usid
    const {id} = req.params
    try{
        const flora = await getEditable(urlPrefix, author, id, {
                lookupFields:livingThingFullLookups,
                fields:fullBio,
                projectionFields:livingThingEditProjectionFields,
                unwindFields:livingThingUnwindFields
                
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
        res.status(e.statusCode || 500).send({msg:e.message})
    }
})



floraRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
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
        const flora = await addOne(urlPrefix, creationData, {preProcessing:floraPreProcessing});
        if(flora){
            return res.send({id:flora.id, name:flora.name, url:flora.url})
        }
        else{
            return res.status(500).send({msg:"Failed to create Flora"})

        }
    }
    catch(e){
        return res.status(e.statusCode || 500).send({msg:e.message})
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
        return res.status(e.statusCode || 500).send({msg:e.message})
    }
});








// 🚀 Router: Modify a flora field (add/put/delete references)
floraRouter.patch(`${urlPrefix}:list/:method`, verifyAuth, async (req, res) => {
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
module.exports = floraRouter;
