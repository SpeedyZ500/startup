const express = require('express');
const { verifyAuth } = require('./../service.js');  
const { createID } = require('./../database.js')

const urlPrefix = "/worldbuilding/wildlife/"

const wildlifeRouter = express.Router();
let wildlifeList = [];
let wildlifeTypes = ["Monster"]

async function getWildlife(field, value){
    if (value) {
        return wildlifeList.find((wildlife) => wildlife[field] === value);
    }
    return null;
}


async function getWildlifeList(queries){
    if(typeof queries === "object"){
        let filterWildlifeList = wildlifeList;
        for(const [key, value] of Object.entries(queries)){
            if(Array.isArray(value)){
                filterWildlifeList = filterWildlifeList.filter(((wildlife) => 
                    Array.isArray(wildlife[key]) ? wildlife[key].some(char => value.includes(char)) : value.includes(wildlife[key] )))
            }
            else{
                filterWildlifeList = filterWildlifeList.filter(((wildlife) => 
                    Array.isArray(wildlife[key]) ? wildlife[key].includes(value) : value === wildlife[key]))
            }
        }
        return filterWildlifeList;
    }
    else{
        return wildlifeList;
    }
}


wildlifeRouter.get(`${urlPrefix}options`, async (req, res) => {
    const filteredWildlifeList = await getWildlifeList(req.query);
    const options = filteredWildlifeList.map((wildlife) => {
        return {
            value: wildlife.id, 
            label: wildlife.name,
            qualifier: wildlife.types || []
        }
    })
    res.send(options)
})

wildlifeRouter.get(`${urlPrefix}types/options`, async (req, res) => {
    const options = wildlifeTypes.map((type) => {
        return {
            value: type,
            label: type,
        }
    })
    res.send(options)
})



wildlifeRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const queries = req.query || {};
    const {author} = req.query || "";
    if(!id || id === "undefined" || id.trim() === ""){
        let wildlifeListToSend = await getWildlifeList(queries);
        res.send(wildlifeListToSend)
    }
    else{
        if(id == "types"){
            res.send(wildlifeTypes);
        }
        else{
            const wildlife = await getWildlife("id", id);
            if(wildlife){
                if(author){
                    const isAuthor = author === wildlife.author;
                    res.send({isAuthor})
                }
                else{
                    res.send(wildlife);
                }
            }
            else{
                res.status(404).json({ error: "Wildlife not found" });
            }
        }
    }
});

wildlifeRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
    
    const {name, description} = req.body;
    const author = req.usid;
    if(!name || !author || !description){
        return res.status(409).send({msg:"Required fields not filled out"});
    }
    const id = createID(req.body.name, author);
    if(await getWildlife("id", id)){
        return res.status(409).send({msg:"A Wildlife by you and by that name already exists"});
    }else{
        const wildlife = await createWildlife(req.body, author, id);
        if(wildlife){
            return res.json(wildlife)
        }
    }
});



wildlifeRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const username  = req.usid;
    const updateData = req.body;
    if(!updateData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if(!updateData.id || updateData.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Wildlife." });
    }
    const wildlife = await getWildlife("id", id);
    if(wildlife){
        if(username !== wildlife.author || updateData.author !== wildlife.author){
            res.status(401).send({msg:`cannot update wildlife, or field`});
        }
        if(username === wildlife.author){
            const updateData = req.body;
            const updated = await updateWildlife(id, updateData)
            if(updated.msg){
                return res.status(500).send(updated.msg);
            }
            return res.send(updated);
        }
        else{
        }
    }
    else{
        res.status(404).send({msg:`Wildlife ${id}, not found`});
    }
});




async function createWildlife(wildlifeData, author, id){
    const wildlifeURL = urlPrefix + id;
    const {name, types, description, 
        originWorld, originBiome,
        otherWorlds = [],  otherBiomes = [], 
        abilities, 
        countries,  custom, sections
    } = wildlifeData
    
    const created = new Date().toJSON();
    await addTypes(types);
    const wildlife = {
        id,
        name,
        url:wildlifeURL,
        author,
        types,
        abilities,
        originWorld,
        originBiome,
        otherWorlds,
        otherBiomes,
        countries,
        biomes:[originBiome, ...(otherBiomes ?? [])],
        worlds: [originWorld, ...(otherWorlds ?? [])],
        custom,
        description,
        sections,
        created,
        modified:created,
    }
    wildlifeList.push(wildlife)
    return wildlife
}
async function updateWildlife(id, updateData){
    const {types, originWorld, otherWorlds, originBiome, otherBiomes } = updateData
    const wildlife = await getWildlife("id", id);
    if(JSON.stringify(types) !== JSON.stringify(wildlife)){
        await addTypes(types);
    }
    const newBiomes = [originBiome, ...(otherBiomes ?? [])]
    if(JSON.stringify(newBiomes) !== JSON.stringify(wildlife.biomes)){
        updateData.biomes = newBiomes;
    }
    const newWorlds = [originWorld, ...(otherWorlds ?? [])]
    if(JSON.stringify(newWorlds) !== JSON.stringify(wildlife.worlds)){
        updateData.worlds = newWorlds;
    }
    return await wildlifeUpdate(updateData);
}
async function wildlifeUpdate(wildlife){
    const index = wildlifeList.findIndex(char => char.id === wildlife.id);
    if(index !== -1){
        wildlifeList[index] = wildlife;
        return wildlife
    }
    else {
        return {msg:"failed to update wildlife"}
    }
}

async function addTypes(type){
    if(Array.isArray(type)){
        type.forEach((item) => {
            if(!wildlifeTypes.includes(item)){
                wildlifeTypes.push(item);
            }
        })
    }
    else{
        if(!wildlifeTypes.includes(type)){
            wildlifeTypes.push(type)
        }
    }
    return "done"
}

async function modifyWildlife(wildlife, list, data, method) {
    const restrictedLists = ["worlds", "biomes", "abilities", "sections", "custom"];
    if(restrictedLists.includes(list)){
        return {error: `can't modify ${list} directly use other or alt version` };
    }
    if (!wildlife[list] || !Array.isArray(wildlife[list])) {
        return { error: `List '${list}' not found, or not a list.` };
    }
    const wildlifeData = wildlife[list];
    
    
    // Add or update references
    if (method === 'add' || method === 'put') {
        const existsInWildlife = wildlifeData.includes(data);
        if (!existsInWildlife) {
            wildlifeData.push(data);  // Add to wildlife object
        }
    } 
    // Delete references
    else if (method === 'delete') {
        const wildlifeListIndex = wildlifeData.findIndex(item => item === data);
        if (wildlifeListIndex !== -1) {
            if(wildlifeListIndex === wildlifeData.length - 1){
                wildlifeData.pop()
            }
            else{
                wildlifeData.splice(wildlifeListIndex, 1);
            }
        }
    }
    wildlife[list] = wildlifeData;
    return await updateWildlife(wildlife.id, wildlife);
}

// 🚀 Router: Modify a wildlife field (add/put/delete references)
wildlifeRouter.patch(`${urlPrefix}:id/:list`, verifyAuth, async (req, res) => {
    const { id, list } = req.params;
    const { method, data } = req.body;
    const wildlife = await getWildlife("id", id)
    if(!wildlife){
        return res.status(404).send({msg:"Error Wildlife not found"});
    }

    const result = await modifyWildlife(wildlife, list, data, method);

    if (result.error) {
        return res.status(400).send(result);
    } else {
        return res.send(result);
    }
});






module.exports = {wildlifeRouter, modifyWildlife};