
const express = require('express');

const { verifyAuth } = require('./service.js');  

const {
    createID, 
    getGraph, 
    getCards, 
    getDisplayable, 
    getEditable, 
    getOptions, 
    baseLookupFields, 
    baseProjectionFields, 
    storyFields, 
    baseEditProjectionFields,
    chapterLookupFields,
    chapterProjectFields,
    chapterEditLookupFields,
    chapterEditProjectFields,
    storyPreProcessing,
    addOne,
    updateOne,
    chaptersPostProcessing,
    chaptersPreProcessing


} = require('./database.js');

const urlPrefix = "/stories/"
 

const storiesRouter = express.Router();



//stories chapters

//stories chapters
storiesRouter.get(`${urlPrefix}:storyID/chapters`, async (req, res) => {
    const { storyID } = req.params;
    const { filter } = req.query
    const graph = await getGraph(storyID, filter)
    if(graph){
        res.send(graph)
    }
    else{
        res.status(404).send({msg:"Graph not found"})
    }
});
storiesRouter.get(`${urlPrefix}:storyID`, verifyAuth, async (req, res) => {
    const { storyID } = req.params;
    try{
        const story = await getEditable(urlPrefix,req.params.usid,storyID,{ 
            lookupFields:baseLookupFields, 
            projectionFields:baseEditProjectionFields,
            fields:storyFields
        })
        if(story){
            res.send(story)
        }
        else{
            res.status(404).send({msg:"Story not found"})
        }
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})

    }
})




storiesRouter.get(`${urlPrefix}chapter/:chapterID`, verifyAuth, async (req, res) => {
    const {chapterID} = req.params;
    
    try{
        const chapter = await getEditable("chapters", req.usid, chapterID, {
            fields:storyFields,
            lookupFields:chapterEditLookupFields,
            projectionFields:chapterEditProjectFields,
        })
        if(chapter){
            res.send(chapter);
        }
        else{
            res.status(404).send({msg:"Chapter not found"})
        }
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})
    }
})


storiesRouter.post(`${urlPrefix}:storyID?`, verifyAuth, async (req, res) => {
    const { storyID } = req.params;
    const {title} = req.body
    const author = req.usid
    const createData = req.body
    try{
        createData.author = author
        if(!storyID){
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
        else{
            createData.storyID = storyID
            const id = await createID(`${storyID}_${title}`, author)
            createData.id = id
            createData.url = `${urlPrefix}${storyID}/${id}`
            const chapter = await addOne("chapters",createData,{
                preProcessing:chaptersPreProcessing,
                postProcessing:chaptersPostProcessing
            })
            res.send({title:chapter.title, url:chapter.url, id:chapter.id})
        }
    }
    catch(e){
        res.status(e.status || 500).send({msg:e.message})
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
        res.status(e.status || 500).send({msg:e.message})
    }});

// Helper function to fetch a story by a field and value

module.exports = storiesRouter;
