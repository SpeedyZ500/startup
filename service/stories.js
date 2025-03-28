const express = require('express');
const { verifyAuth, createID} = require('./service.js');  
const urlPrefix = "/stories/"
 

const storiesRouter = express.Router();

let stories = [
    {
        "name":"The Moonlit Alchemist",
        "id":"the_moonlit_alchemist_spencer_zaugg",
        "details":[
            {
                "label":"name",
                "value":"The Moonlit Alchemist",
                "path":"/stories/the_moonlit_alchemist_spencer_zaugg",
                "location":"head",
                "filter":false
            },
            {
                "label":"author",
                "value":"Spencer Zaugg"
            },
            {
                "label":"Genre",
                "value":[
                    "Example",
                    "Fantasy"
                ],
                "location":"footer"
            },
            {
                "label":"Content Warnings",
                "value":[
                    "Fallen Universe"
                ],
                "location":"footer"

            },
            {
                "label":"created",
                "value":"2025-02-23T20:10:43.930Z",
                "display":false,
                "filter":false
            },
            {
                "label":"expanded",
                "value":"2025-02-23T20:10:43.930Z",
                "display":false,
                "filter":false
            }
        ],
        "info":[
            {
                "label":"Genre",
                "value":[
                    "Example",
                    "Fantasy"
                ],
            },
            {
                "label":"Content Warnings",
                "value":[
                    "Fallen Universe"
                ]
            }
        ],

        "description":"The story of a mysterious Alchemist who's alchemy is enhanced by moonlight, displaced from his world",
        "chapters":[
            {
                "chapterId":1,
                "chapterNumber":1,
                "title":"The End and a Beginning",
                "contentwarning":[
                    "Fallen Universe"
                ],
                "genre":[
                    "Example",
                    "Fantasy"
                ],
                "author":"Spencer Zaugg",
                "previous":[],
                "branches": [2,3],
                "path":"/stories/the_moonlit_alchemist_spencer_zaugg/1_the_end_and_a_beginning_spencer_zaugg",
                "content":"The beginning"
            },
            {
                "chapterId":2,
                "chapterNumber":2,
                "title":"Seeking a New Home",
                "contentwarning":[
                    "Fallen Universe"
                ],
                "genre":[
                    "Example",
                    "Fantasy"
                ],
                "author":"Spencer Zaugg",
                "previous":[1],
                "branches": [],
                "path":"/stories/the_moonlit_alchemist_spencer_zaugg/2_seeking_a_new_home",
                "content":"The beginning"
            },
            {
                "chapterId":3,
                "chapterNumber":2,
                "title":"A new Friend",
                "contentwarning":[
                    "Fallen Universe"
                ],
                "genre":[
                    "Example",
                    "Fantasy"
                ],
                "author":"Spencer Zaugg",
                "previous":[1],
                "branches": [],
                "path":"/stories/the_moonlit_alchemist_spencer_zaugg/3_a_new_friend",
                "content":"The beginning"
            }
        ]
    }
];

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
