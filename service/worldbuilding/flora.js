const express = require('express');
const { verifyAuth, createID } = require('./../service.js');
const urlPrefix = "/worldbuilding/flora/"

const floraRouter = express.Router();
let floraList = [];
let floraTypes = [
    "Plant",
    "Tree",
    "Flower",
    "Mushroom",
    "Magic Tree",
    "Monster"
]

async function getFlora(field, value){
    if (value) {
        return floraList.find((flora) => flora[field] === value);
    }
    return null;
}


async function getFloraList(queries){
    if(typeof queries === "object"){
        let filterFloraList = floraList;
        for(const [key, value] of Object.entries(queries)){
            if(Array.isArray(value)){
                filterFloraList = filterFloraList.filter(((flora) => 
                    Array.isArray(flora[key]) ? flora[key].some(char => value.includes(char)) : value.includes(flora[key] )))
            }
            else{
                filterFloraList = filterFloraList.filter(((flora) => 
                    Array.isArray(flora[key]) ? flora[key].includes(value) : value === flora[key]))
            }
        }
        return filterFloraList;
    }
    else{
        return floraList;
    }
}


floraRouter.get(`${urlPrefix}options`, async (req, res) => {
    const filteredFloraList = await getFloraList(req.query);
    const options = filteredFloraList.map((flora) => {
        return {
            value: flora.id, 
            label: flora.name,
            qualifier: flora.types || []
        }
    })
    res.send(options)
})

floraRouter.get(`${urlPrefix}types/options`, async (req, res) => {
    const options = floraTypes.map((type) => {
        return {
            value: type,
            label: type,
        }
    })
    res.send(options)
})



floraRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const queries = req.query || {};
    const {author} = req.query || "";
    if(!id || id === "undefined" || id.trim() === ""){
        let floraListToSend = await getFloraList(queries);
        res.send(floraListToSend)
    }
    else{
        if(id == "types"){
            res.send(floraTypes);
        }
        else{
            const flora = await getFlora("id", id);
            if(flora){
                if(author){
                    const isAuthor = author === flora.author;
                    res.send({isAuthor})
                }
                else{
                    res.send(flora);
                }
            }
            else{
                res.status(404).json({ error: "Flora not found" });
            }
        }
    }
});

floraRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
    
    const {name, description} = req.body;
    const author = req.username;
    if(!name || !author || !description){
        return res.status(409).send({msg:"Required fields not filled out"});
    }
    const id = createID(req.body.name, author);
    if(await getFlora("id", id)){
        return res.status(409).send({msg:"A Flora by you and by that name already exists"});
    }else{
        const flora = await createFlora(req.body, author, id);
        if(flora){
            return res.json(flora)
        }
    }
});



floraRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const username  = req.username;
    const updateData = req.body;
    if(!updateData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if(!updateData.id || updateData.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Flora." });
    }
    const flora = await getFlora("id", id);
    if(flora){
        if(username !== flora.author || updateData.author !== flora.author){
            res.status(401).send({msg:`cannot update flora, or field`});
        }
        if(username === flora.author){
            const updateData = req.body;
            const updated = await updateFlora(id, updateData)
            if(updated.msg){
                return res.status(500).send(updated.msg);
            }
            return res.send(updated);
        }
        else{
        }
    }
    else{
        res.status(404).send({msg:`Flora ${id}, not found`});
    }
});




async function createFlora(floraData, author, id){
    const floraURL = urlPrefix + id;
    const {name, types, description, 
        originWorld, originBiome,
        otherWorlds = [],  otherBiomes = [], 
        abilities, 
        countries,  custom, sections
    } = floraData
    
    const created = new Date().toJSON();
    await addTypes(types);
    const flora = {
        id,
        name,
        url:floraURL,
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
    floraList.push(flora)
    return flora
}
async function updateFlora(id, updateData){
    const {types, originWorld, otherWorlds, originBiome, otherBiomes } = updateData
    const flora = await getFlora("id", id);
    if(JSON.stringify(types) !== JSON.stringify(flora)){
        await addTypes(types);
    }
    const newBiomes = [originBiome, ...(otherBiomes ?? [])]
    if(JSON.stringify(newBiomes) !== JSON.stringify(flora.biomes)){
        updateData.biomes = newBiomes;
    }
    const newWorlds = [originWorld, ...(otherWorlds ?? [])]
    if(JSON.stringify(newWorlds) !== JSON.stringify(flora.worlds)){
        updateData.worlds = newWorlds;
    }
    return await floraUpdate(updateData);
}
async function floraUpdate(flora){
    const index = floraList.findIndex(char => char.id === flora.id);
    if(index !== -1){
        floraList[index] = flora;
        return flora
    }
    else {
        return {msg:"failed to update flora"}
    }
}

async function addTypes(type){
    if(Array.isArray(type)){
        type.forEach((item) => {
            if(!floraTypes.includes(item)){
                floraTypes.push(item);
            }
        })
    }
    else{
        if(!floraTypes.includes(type)){
            floraTypes.push(type)
        }
    }
    return "done"
}

async function modifyFlora(flora, list, data, method) {
    const restrictedLists = ["worlds", "biomes", "abilities", "sections", "custom"];
    if(restrictedLists.includes(list)){
        return {error: `can't modify ${list} directly use other or alt version` };
    }
    if (!flora[list] || !Array.isArray(flora[list])) {
        return { error: `List '${list}' not found, or not a list.` };
    }
    const floraData = flora[list];
    
    
    // Add or update references
    if (method === 'add' || method === 'put') {
        const existsInFlora = floraData.includes(data);
        if (!existsInFlora) {
            floraData.push(data);  // Add to flora object
        }
    } 
    // Delete references
    else if (method === 'delete') {
        const floraListIndex = floraData.findIndex(item => item === data);
        if (floraListIndex !== -1) {
            if(floraListIndex === floraData.length - 1){
                floraData.pop()
            }
            else{
                floraData.splice(floraListIndex, 1);
            }
        }
    }
    flora[list] = floraData;
    return await updateFlora(flora.id, flora);
}

// 🚀 Router: Modify a flora field (add/put/delete references)
floraRouter.patch(`${urlPrefix}:id/:list`, verifyAuth, async (req, res) => {
    const { id, list } = req.params;
    const { method, data } = req.body;
    const flora = await getFlora("id", id)
    if(!flora){
        return res.status(404).send({msg:"Error Flora not found"});
    }

    const result = await modifyFlora(flora, list, data, method);

    if (result.error) {
        return res.status(400).send(result);
    } else {
        return res.send(result);
    }
});

module.exports = {floraRouter, modifyFlora};
