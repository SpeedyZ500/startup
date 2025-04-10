const express = require('express');
const { verifyAuth, createID} = require('./service.js');  
const urlPrefix = "/stories/"
 

const storiesRouter = express.Router();

let stories = [];
let chapters = [];
let genres = [];
let contentWarnings = [];

//fetch stories
// storiesRouter.get(urlPrefix, async(req,res) => {
//     const {author, excludeAuthor, 
//         genre, genreAll, excludeGenre, 
//         contentwarnings, warningsAll, excludeWarnings} = req.query;
//     const query = {}
//     if(author){
//         query.author = {$in: Array.isArray(author) ? author : [author] }
//     }
//     if(excludeAuthor){
//         query.author = { ...query.author, $nin: Array.isArray(excludeAuthor) ? excludeAuthor : [excludeAuthor] };
//     }
//     if(genre){
//         const genresArray = Array.isArray(genre) ? genre : [genre];
//         if(genreAll === "true"){
//             query.genre = {$all: genresArray}
//         }
//         else{
//             query.genre = {$in: genresArray}
//         }
//     }
//     if(excludeGenre){
//         query.genre = {...query.genre, $nin: Array.isArray(excludeGenre) ? excludeGenre : [excludeGenre]}
//     }
//     if(contentwarnings){
//         const warningsArray = Array.isArray(contentwarnings) ? contentwarnings : [contentwarnings];
//         if(warningsAll === "true"){
//             query.contentwarnings = {$all: warningsArray}
//         }
//         else{
//             query.contentwarnings = {$in: warningsArray}
//         }
//     }
//     if(excludeWarnings){
//         query.contentwarnings = {...query.contentwarnings, $nin: Array.isArray(excludeWarnings) ? excludeWarnings : [excludeWarnings]}
//     }
// })
storiesRouter.get(`${urlPrefix}genre`, async (_req, res) => {
    res.send(genres)
})
storiesRouter.get(`${urlPrefix}contentwarnings`, async (_req, res) => {
    res.send(contentWarnings)
})

storiesRouter.get(`${urlPrefix}genre/options`, async (_req, res) => {
    
    const options = genres.map((type) => {
        return {
            value: type, 
            label: type,
        }
    })
    res.send(options)
})
storiesRouter.get(`${urlPrefix}contentwarnings/options`, async (_req, res) => {
    const options = contentWarnings.map((type) => {
        return {
            value: type, 
            label: type,
        }
    })
    res.send(options)
})

//stories chapters
storiesRouter.get(`${urlPrefix}:storyID/chapters/options`, async (req, res) => {
    const { storyID } = req.params;

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
//stories chapters
storiesRouter.get(`${urlPrefix}:storyID/chapters`, async (req, res) => {
    const { storyID } = req.params;

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

//individual story
storiesRouter.get(`${urlPrefix}?:storyID`, async (req, res) => {
    const { storyID } = req.params;

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

async function getStory(field, value){
    if (value) {
        return stories.find((story) => story[field] === value);
    }
    return null;
}


async function getStories(queries){
    if(typeof queries === "object"){
        let filterStories = stories;
        for(const [key, value] of Object.entries(queries)){
            if(Array.isArray(value)){
                filterStories = filterStories.filter(((story) => 
                    Array.isArray(story[key]) ? story[key].some(st => value.includes(st)) : value.includes(story[key] )))
            }
            else{
                filterStories = filterStories.filter(((story) => 
                    Array.isArray(story[key]) ? story[key].includes(value) : value === character[key]))
            }
        }
        return filterStories;
    }
    else{
        return stories;
    }
}

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
