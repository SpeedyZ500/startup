const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/countries/"

const countriesRouter = express.Router();

let countries = [];
let countryBios = [];

countriesRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    if(!id){
        res.send(countries)
    }
    else{
        const country = countryBios.find(bio => bio.id === id);
        if(country){
            res.send(country);
        }
        else{
            res.status(404).json({ error: "Country not found" });
        }
    }
});

module.exports = countriesRouter;
