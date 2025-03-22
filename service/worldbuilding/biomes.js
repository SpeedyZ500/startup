const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/biomes/"

const biomesRouter = express.Router();

let biomes = [];
let biomeBios = [];

biomesRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(biomes)
    }
    else{
        const biome = biomeBios.find(bio => bio.id === id);
        if(biome){
            res.send(biome);
        }
        else{
            res.status(404).json({ error: "Biome not found" });
        }
    }
});


module.exports = biomesRouter;
