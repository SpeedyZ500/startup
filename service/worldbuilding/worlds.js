const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/worlds/"

const worldsRouter = express.Router();
let worlds = [];

let worldBios = [
    {
        "id":"the_void_spencer_zaugg",
        "infoCard":{
            "name":"The Void",
            "cardData":[
                {
                    "label":"Author",
                    "value":"Spencer Zaugg"
                }
            ],
            "created":"2025-02-20T21:56:41Z",
            "modified":"2025-02-20T21:56:41Z"
    
        },
        "description":"The World Between Worlds",
        "sections":[
            {
                "section":"Please be Patient",
                "text":"I haven't finished it yet this is a test"
            }
        ]
    
    }
];

worldsRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(worlds)
    }
    else{
        const world = worldBios.find(bio => bio.id === id);
        if(world){
            res.send(world);
        }
        else{
            res.status(404).json({ error: "World not found" });
        }
    }
});


module.exports = worldsRouter;