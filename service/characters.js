const express = require('express');
const { verifyAuth, authCookieName} = require('./service.js');  
const{ createID, getCards, getDisplayable, getEditable, getOptions,
    addOne, updateOne, modifyMany,
    characterPreProcessing,
    characterCards,
    characterCardsLookup,
    characterBioProjectionFields,
    characterEditProjectionFields,
    characterFullFields,
    characterFullLookupFields,
    characterProjectionFields,
    characterUnwindFields,
    getAuth
    
} = require('./database.js')
const urlPrefix = "/characters/"

const characterRouter = express.Router();








characterRouter.get(`${urlPrefix}types/options`, async (req, res) => {
    const options = await getOptions("characterstypes")
    res.send(options)
})

characterRouter.get(`${urlPrefix}options`, async (req, res) => {
    const options = await getOptions("characters", {query:req.query})
    res.send(options)
})




characterRouter.get(`${urlPrefix}`, async (req, res) => {
    const query = req.query || {};
    const charactersToSend = await getCards(urlPrefix, {
        query,
        lookupFields:characterCardsLookup,
        fields:characterCards,
        projectionFields:characterProjectionFields,
        unwindFields:characterUnwindFields
    })
    res.send(charactersToSend)
})

characterRouter.get(`${urlPrefix}:id/bio`, async (req, res) => {
    const { id } = req.params;
    try{
        const character = await getDisplayable(urlPrefix, id, {
            lookupFields:characterFullLookupFields,
            fields:characterFullFields,
            projectionFields:characterBioProjectionFields
        });
        if(character){
            res.send(character);
        }
        else{
            res.status(404).json({ error: "Character not found" });
        }
    }
    catch{
        res.status(500).send({msg:"server error"})
    }
    
});

characterRouter.get(`${urlPrefix}author/:id`,async (req, res)=>{
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
characterRouter.get(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const author = req.usid
    const {id} = req.params
    try{
        const character = await getEditable(urlPrefix, author, id, {
                lookupFields:characterFullLookupFields,
                fields:characterFullFields,
                projectionFields:characterEditProjectionFields,
                unwindFields:characterUnwindFields
            }
        );
        if(character){
            return res.send(character);
        }
        else{
            return res.status(404).send({msg:"character not found"})
        }
    }
    catch(e){
        res.status(e.statusCode || 500).send({msg:e.message})
    }
})



characterRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
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
        const character = await addOne(urlPrefix, creationData, {preProcessing:characterPreProcessing});
        if(character){
            return res.send({id:character.id, name:character.name, url:character.url})
        }
        else{
            return res.status(500).send({msg:"Failed to create Character"})

        }
    }
    catch(e){
        return res.status(e.statusCode || 500).send({msg:e.message})
    }
});



characterRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const userID  = req.usid;
    const updateData = req.body;
    if(!updateData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if(!updateData.id || updateData.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Character." });
    }
    try{
        const character = await updateOne(urlPrefix, updateData, userID, {preProcessing:characterPreProcessing});
        if(character){
            return res.send({id:character.id, name:character.name, url:character.url})
        }
        else{
            return res.status(500).send({msg:"Failed to update Character"})
        }
    }
    catch(e){
        return res.status(e.statusCode || 500).send({msg:e.message})
    }
});








// 🚀 Router: Modify a character field (add/put/delete references)
characterRouter.patch(`${urlPrefix}:list/:method`, verifyAuth, async (req, res) => {
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



module.exports = characterRouter
