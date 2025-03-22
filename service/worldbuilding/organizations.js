const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/organizations/"

const organizationsRouter = express.Router();
let organizations = [];
let organizationBios = []
let organizationTypes = ["Religion"]

organizationsRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const filter = req.query.type;
    if(!id){
        if(!filter){
            res.send(organizations)
        }
        else{
            const organization = organizations.filter(item => item.type === filter);
            res.send(organization);
        }
    }
    else{
        const organization = organizationBios.find(bio => bio.id === id);
        if(organization){
            res.send(organization);
        }
        else{
            res.status(404).json({ error: "Organization not found" });
        }
    }
});
module.exports = organizationsRouter;