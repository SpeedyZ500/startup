
const express = require('express');

const { verifyAuth, authCookieName } = require('./service.js');  

const {
    createID, 
    getEditable, 
    baseLookupFields, 
    storyFields, 
    baseEditProjectionFields,
    chapterEditLookupFields,
    chapterEditProjectFields,
    storyPreProcessing,
    addOne,
    updateOne,
    chaptersPostProcessing,
    chaptersPreProcessing,
    baseUnwindFields,
    chapterUnwindFields,
    getUserByToken
} = require('./database.js');

const urlPrefix = "/stories/"
 

const storiesRouter = express.Router();

storiesRouter.get(`${urlPrefix}author/chapter/:id`,async (req, res)=>{
    const token = req.cookies[authCookieName];
    const user = await getUserByToken(token)
    if(!user){
        return res.send({isAuthor:false})
    }
    const id = req.params.id
    const author = user._id
    try{
        await getEditable("chapters", author, id, {
            fields:["id"]
        })
        return res.send({isAuthor:true})
    }
    catch{
        return res.send({isAuthor:false})
    }
})

storiesRouter.get(`${urlPrefix}author/:id`,async (req, res)=>{
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


storiesRouter.get(`${urlPrefix}chapter/:chapterID`, verifyAuth, async (req, res) => {
    const {chapterID} = req.params;
    
    try{
        const chapter = await getEditable("chapters", req.usid, chapterID, {
            fields:[...storyFields, "description"],
            lookupFields:chapterEditLookupFields,
            projectionFields:chapterEditProjectFields,
            unwindFields:chapterUnwindFields

        })
        if(chapter){
            res.send(chapter);
        }
        else{
            res.status(404).send({msg:"Chapter not found"})
        }
    }
    catch(e){
        res.status(e.statusCode || 500).send({msg:e.message})
    }
})
storiesRouter.get(`${urlPrefix}:storyID`, verifyAuth, async (req, res) => {
    const { storyID } = req.params;
    try{
        const story = await getEditable(urlPrefix,req.usid,storyID,{ 
            lookupFields:baseLookupFields, 
            projectionFields:baseEditProjectionFields,
            fields:storyFields,
            unwindFields:baseUnwindFields
        })
        if(story){
            res.send(story)
        }
        else{
            res.status(404).send({msg:"Story not found"})
        }
    }
    catch(e){
        res.status(e.statusCode || 500).send({msg:e.message})

    }
})







storiesRouter.post(urlPrefix, verifyAuth, async (req, res) => {
    const {title} = req.body
    const author = req.usid
    const createData = req.body
    try{
        createData.author = author
        const id = await createID(title, author)
        createData.id = id
        createData.url = `${urlPrefix}${id}`
        const story = await addOne(urlPrefix,createData,{
            preProcessing:storyPreProcessing,
        })
        if(story){
            res.send({title:story.title, url:story.url, id:story.id})
        }
        
    }
    catch(e){
        res.status(e.statusCode || 500).send({msg:e.message})
    }
})

storiesRouter.post(`${urlPrefix}:storyID`, verifyAuth, async (req, res) => {
    const { storyID } = req.params;
    const {title} = req.body
    const author = req.usid
    const createData = req.body
    try{
        createData.storyID = storyID
        const id = await createID(`${storyID}_${title}`, author)
        createData.id = id
        createData.url = `${urlPrefix}${storyID}/${id}`
        createData.author=author
        const chapter = await addOne("chapters",createData,{
            preProcessing:chaptersPreProcessing,
            postProcessing:chaptersPostProcessing
        })
        res.send({title:chapter.title, url:chapter.url, id:chapter.id})
    }
    catch(e){
        res.status(e.statusCode || 500).send({msg:e.message})
    }
})



// 🚀 Router: Add a chapter to an existing story
storiesRouter.put(`${urlPrefix}:storyID/:chapterID?`, verifyAuth, async (req, res) => {
    const { storyID, chapterID} = req.params;
    const author = req.usid
    const updateData = req.body
    if(!updateData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    try{
        if(!chapterID){
            if(!updateData.id || updateData.id !== storyID ){
                return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Story." });
            }
            const story = await updateOne(urlPrefix,updateData, author,{
                preProcessing:storyPreProcessing,
            })
            if(story){
                res.send({title:story.title, url:story.url, id:story.id})
            }
        }
        else{
            if(!updateData.id || updateData.id !== chapterID ){
                return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Chapter." });
            }
            const chapter = await updateOne("chapters",updateData, author,{
                preProcessing:chaptersPreProcessing,
                postProcessing:chaptersPostProcessing
            })
            res.send({title:chapter.title, url:chapter.url, id:chapter.id})
        }
    }
    catch(e){
        res.status(e.statusCode || 500).send({msg:e.message})
    }});

// Helper function to fetch a story by a field and value

module.exports = storiesRouter;
