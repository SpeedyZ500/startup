const express = require('express');
const { verifyAuth } = require('./service.js');  
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


let genres = [];
let contentwarnings = [];

async function getStory(field, value){
    if (value) {
        return stories.find((story) => story[field] === value);
    }
    return null;
}
async function getChapter(story, field, value){
    if (value) {
        return story.chapters.find((chapter) => chapter[field] === value);
    }
    return null;
}


storiesRouter.get(`${urlPrefix}:storyID?/:chapterID?`, async (req, res) => {
    const {storyID, chapterID} = req.params;
    if(!storyID){
        res.send(stories);
    }
    else{
        const story = await getStory("id", storyID);
        if(story){
            if(!chapterID){
                res.send(story);
            }
            else{
                const chapter = await getChapter(story, field, value);
                if(chapter){
                    res.send(chapter);
                }
                else{
                    res.status(404).send({ error: "Chapter not found" });
                }
            }

        }
        else{
            res.status(404).send({ error: "Story not found" });
        }
    }
});

module.exports = storiesRouter;