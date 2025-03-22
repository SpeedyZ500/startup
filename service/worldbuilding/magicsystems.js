const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/magicsystems/"
const magicRouter = express.Router();

let magicsystems = [];
let magicsystemBios = [];
let magicTypes = [
    "Alchemical", 
    "Dimensional", 
    "Technological", 
    "Elemental",
    "Transformational"
]


magicRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(magicsystems)
    }
    else{
        const magicsystem = magicsystemBios.find(bio => bio.id === id);
        if(magicsystem){
            res.send(magicsystem);
        }
        else{
            res.status(404).json({ error: "Magic System not found" });
        }
    }
});


module.exports = magicRouter;
