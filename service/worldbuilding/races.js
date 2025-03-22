const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/races/"

const racesRouter = express.Router();

let races = [];
let raceBios = [];



racesRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(races)
    }
    else{
        const race = raceBios.find(bio => bio.id === id);
        if(race){
            res.send(race);
        }
        else{
            res.status(404).json({ error: "Race not found" });
        }
    }
});

module.exports = racesRouter;