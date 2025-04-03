const express = require('express');
const { verifyAuth, createID} = require('./service.js');  
const urlPrefix = "/stories/"
 

const storiesRouter = express.Router();

let stories = [];

storiesRouter.get(urlPrefix, async(req,res) => {
    const {author, excludeAuthor, 
        genre, genreAll, excludeGenre, 
        contentwarnings, warningsAll, excludeWarnings} = req.query;
    const query = {}
    if(author){
        query.author = {$in: Array.isArray(author) ? author : [author] }
    }
    if(excludeAuthor){
        query.author = { ...query.author, $nin: Array.isArray(excludeAuthor) ? excludeAuthor : [excludeAuthor] };
    }
    if(genre){
        const genresArray = Array.isArray(genre) ? genre : [genre];
        if(genreAll === "true"){
            query.genre = {$all: genresArray}
        }
        else{
            query.genre = {$in: genresArray}
        }
    }
    if(excludeGenre){
        query.genre = {...query.genre, $nin: Array.isArray(excludeGenre) ? excludeGenre : [excludeGenre]}
    }
    if(contentwarnings){
        const warningsArray = Array.isArray(contentwarnings) ? contentwarnings : [contentwarnings];
        if(warningsAll === "true"){
            query.contentwarnings = {$all: warningsArray}
        }
        else{
            query.contentwarnings = {$in: warningsArray}
        }
    }
    if(excludeWarnings){
        query.contentwarnings = {...query.contentwarnings, $nin: Array.isArray(excludeWarnings) ? excludeWarnings : [excludeWarnings]}
    }
})

// 🚀 Router: Fetch stories or individual story
storiesRouter.get(`${urlPrefix}:storyID?`, async (req, res) => {
    const { storyID, chapterID } = req.params;

    if (!storyID) {
        res.send(stories);
    } else {
        const story = await getStory("id", storyID);
        if (story) {
            res.send(story);
        } else {
            res.status(404).send({ error: "Story not found" });
        }
    }
});



storiesRouter.post(`${urlPrefix}:storyID?`, verifyAuth, async (req, res) => {
    const { storyID } = req.params;
    const {Name, author} = req.body
    const id = createID(Name, author)
    if(!storyID){
        if(getStory("id", id)){
            req.status(409).send({msg:"You created a story by this id already"})
        }
    }
    else{

    }
})

// 🚀 Router: Add a chapter to an existing story
storiesRouter.patch(`${urlPrefix}:storyID`, verifyAuth, async (req, res) => {
    const { storyID } = req.params;
    const { data } = req.body; // Expect the chapter data to be in req.body.data

    const story = await getStory("id", storyID);
    if (!story) {
        return res.status(404).json({ error: "Story not found" });
    }

    // Add the chapter to the story's chapters list
    story.chapters.push(data);

    res.status(200).json({ message: `Chapter added successfully to story ${storyID}` });
});

// Helper function to fetch a story by a field and value
async function getStory(field, value) {
    if (value) {
        return stories.find((story) => story[field] === value);
    }
    return null;
}

module.exports = storiesRouter;
