const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/wildlife/"

const wildlifeRouter = express.Router();
let wildlife = [];
let wildlifeBios = [];
let wildlifeClassifications = [
    "Monster"
]

wildlifeRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(wildlife)
    }
    else{
        const wildlife = wildlifeBios.find(bio => bio.id === id);
        if(wildlife){
            res.send(wildlife);
        }
        else{
            res.status(404).json({ error: "Wildlife not found" });
        }
    }
});

module.exports = wildlifeRouter;