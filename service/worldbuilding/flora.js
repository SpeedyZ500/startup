const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/flora/"

const floraRouter = express.Router();
let flora = [];
let floraBios = [];
let floraClassifications = [
    "Magic Tree"
]

floraRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(flora)
    }
    else{
        const floraBio = floraBios.find(bio => bio.id === id);
        if(floraBio){
            res.send(floraBio);
        }
        else{
            res.status(404).json({ error: "Flora not found" });
        }
    }
});

module.exports = floraRouter;
