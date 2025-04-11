const express = require('express');
const { verifyAuth, createID} = require('./service.js');  
const urlPrefix = "/stories/"
 

const storiesRouter = express.Router();

let stories = [];
let chapters = [];
let genreList = [];
let contentWarningList = [];

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
//         const genreListArray = Array.isArray(genre) ? genre : [genre];
//         if(genreAll === "true"){
//             query.genre = {$all: genreListArray}
//         }
//         else{
//             query.genre = {$in: genreListArray}
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
    res.send(genreList)
})
storiesRouter.get(`${urlPrefix}contentwarnings`, async (_req, res) => {
    res.send(contentWarningList)
})

storiesRouter.get(`${urlPrefix}genre/options`, async (_req, res) => {
    
    const options = genreList.map((type) => {
        return {
            value: type, 
            label: type,
        }
    })
    res.send(options)
})
storiesRouter.get(`${urlPrefix}contentwarnings/options`, async (_req, res) => {
    const options = genreList.map((type) => {
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
    const {title, author} = req.body
    const id = createID(title, author)
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

async function createStory(storyData, id, author){
    const {title, description, genres, contentWarnings} = biomeData;
    const url = urlPrefix + id;
    const created = new Date().toJSON();
    await addGenres(genres)
    await addContentWarnings(contentWarnings)
    const story = {
        id: id,
        title,
        author,
        url,
        genres,
        contentWarnings,
        description,
        created,
        expanded: created
    };
    stories.push(story);
    return story;
}
async function getChapters(queries){
    if(typeof queries === "object"){
        let filterChapters = chapters;
        for(const [key, value] of Object.entries(queries)){
            if(Array.isArray(value)){
                filterChapters = filterChapters.filter(((chapter) => 
                    Array.isArray(chapter[key]) ? chapter[key].some(chap => value.includes(chap)) : value.includes(chapter[key] )))
            }
            else{
                filterChapters = filterChapters.filter(((chapter) => 
                    Array.isArray(chapter[key]) ? chapter[key].includes(value) : value === chapter[key]))
            }
        }
        return filterChapters;
    }
    else{
        return chapters;
    }
}
async function getChapter(field1, value1, field2, value2){
    if (value1) {
        if (value2){
            const filterChapters = chapters.filter((chapter) => chapter[field1] === value1)
            return filterChapters.find((chapter) => chapter[field2] === value2);
        }
        return chapters.find((chapter) => chapter[field1] === value1);
    }
    return null;
}
function chapterExists(id){
    return chapters.some(chap => chap.id === id);
}
function chapterExistsInStory(storyID, id){
    return chapters.some(chap => chap.id === id && chap.storyID === storyID);
}
async function createChapter(chapterData, storyID, author){
    const {title, samePrevious, sameNext, anyPrevious, anyNext, genres, contentWarnings, body} = chapterData
    const baseID = createID(title, author);
    

    const url = `${urlPrefix}${storyID}/${chapterID}`;
    const samePreviousArray = Array.isArray(samePrevious) ? samePrevious : samePrevious != null  ?  [samePrevious] : []
    const sameNextArray = Array.isArray(sameNext) ? sameNext : sameNext != null  ?  [sameNext] : []
    const anyPreviousArray = Array.isArray(anyPrevious) ? anyPrevious : anyPrevious != null  ?  [anyPrevious] : []
    const anyNextArray = Array.isArray(anyNext) ? anyNext : anyNext != null  ?  [anyNext] : []
    const previous = [...samePreviousArray, ...anyPreviousArray]
    const next = [...sameNextArray, anyNextArray]
    const created = new Date().toJSON();
    await addGenres(genres)
    await addContentWarnings(contentWarnings)
    const chapter = {
        body,
        id,
        author,
        chapterID,
        url,
        title,
        samePrevious: samePreviousArray,
        anyPrevious: anyPreviousArray,
        previous,
        sameNext: sameNextArray,
        anyNext: anyNextArray,
        next,
        created,
        modified:created
    }
    chapters.push(chapter)
    return chapter
}




async function addGenres(genre){
    if(Array.isArray(genre)){
        genre.forEach((item) => {
            if(!genreList.includes(item)){
                genreList.push(item)
            }
        })
    }
    else{
        if(!genreList.includes(genre)){
            genreList.push(genre)
        }
    }
    return "done"
}

async function addContentWarnings(contentWarning){
    if(Array.isArray(contentWarning)){
        contentWarning.forEach((item) => {
            if(!contentWarningList.includes(item)){
                contentWarningList.push(item)
            }
        })
    }
    else{
        if(!contentWarningList.includes(contentWarning)){
            contentWarningList.push(contentWarning)
        }
    }
    return "done"
}

module.exports = storiesRouter;
