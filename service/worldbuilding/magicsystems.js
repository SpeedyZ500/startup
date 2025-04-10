const express = require('express');
const { verifyAuth, createID } = require('./../service.js');
const urlPrefix = "/worldbuilding/magicsystems/";


const magicRouter = express.Router();

let magicSystems = [];
let magicTypes = ["Alchemical", "Dimensional", "Technological", "Elemental", "Transformational"];

async function getMagicSystem(field, value){
    if (value) {
        return magicSystems.find((magicSystem) => magicSystem[field] === value);
    }
    return null;
}


async function getMagicSystems(queries){
    if(typeof queries === "object"){
        let filterMagicSystems = magicSystems;
        for(const [key, value] of Object.entries(queries)){
            if(Array.isArray(value)){
                filterMagicSystems = filterMagicSystems.filter(((magicSystem) => 
                    Array.isArray(magicSystem[key]) ? magicSystem[key].some(magic => value.includes(magic)) : value.includes(magicSystem[key] )))
            }
            else{
                filterMagicSystems = filterMagicSystems.filter(((magicSystem) => 
                    Array.isArray(magicSystem[key]) ? magicSystem[key].includes(value) : value === magicSystem[key]))
            }
        }
        return filterMagicSystems;
    }
    else{
        return magicSystems;
    }
}
magicRouter.get(`${urlPrefix}types/options`, async (_req, res) => {
    const options = magicTypes.map((type) => {
        return {
            value: type, 
            label: type,
        }
    })
    res.send(options)
})

magicRouter.get(`${urlPrefix}options`, async (req, res) => {
    const filteredmagicSystems = await getMagicSystems(req.query);
    const options = filteredmagicSystems.map((magicSystem) => {
        return {
            value: magicSystem.id, 
            label: magicSystem.name,
            qualifier: magicSystem.types || []
        }
    })
    res.send(options)
})



magicRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const queries = req.query || {};
    const {author} = req.query || "";
    if(!id || id === "undefined" || id.trim() === ""){
        let magicSystemsToSend = await getMagicSystems(queries);
        res.send(magicSystemsToSend)
    }
    else{
        if(id == "types"){
            res.send(magicTypes);
        }
        else{
            const magicSystem = await getMagicSystem("id", id);
            if(magicSystem){
                if(author){
                    const isAuthor = author === magicSystem.author;
                    res.send({isAuthor})
                }
                else{
                    res.send(magicSystem);
                }
            }
            else{
                res.status(404).json({ error: "Magic System not found" });
            }
        }
    }
});

magicRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
    
    const {name, description} = req.body;
    const author = req.username;
    if(!name || !author || !description){
        return res.status(409).send({msg:"Required fields not filled out"});
    }
    const id = createID(req.body.name, author);
    if(await getMagicSystem("id", id)){
        return res.status(409).send({msg:"A Magic System by you and by that name already exists"});
    }else{
        const magicSystem = await createMagicSystem(req.body, author, id);
        if(magicSystem){
            return res.json(magicSystem)
        }
    }
});



magicRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const username  = req.username;
    const updateData = req.body;
    if(!updateData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if(!updateData.id || updateData.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Magic System." });
    }
    const magicSystem = await getMagicSystem("id", id);
    if(magicSystem){
        if(username !== magicSystem.author || updateData.author !== magicSystem.author){
            res.status(401).send({msg:`cannot update Magic System, or field`});
        }
        if(username === magicSystem.author){
            const updateData = req.body;
            const updated = await updateMagicSystem(id, updateData)
            if(updated.msg){
                return res.status(500).send(updated.msg);
            }
            return res.send(updated);
        }
        else{
        }
    }
    else{
        res.status(404).send({msg:`Magic System ${id}, not found`});
    }
});




async function createMagicSystem(magicSystemData, author, id){
    const magicSystemURL = urlPrefix + id;
    const {name, types, description, 
        originWorld,
        otherWorlds = [], custom, sections
    } = magicSystemData
    
    const created = new Date().toJSON();
    await addTypes(types);
    const magicSystem = {
        id,
        name,
        url:magicSystemURL,
        author,
        types,
        originWorld,
        otherWorlds,
        worlds: [originWorld, ...(otherWorlds ?? [])],
        custom,
        description,
        sections,
        created,
        modified:created,
    }
    magicSystems.push(magicSystem)
    return magicSystem
}
async function updateMagicSystem(id, updateData){
    const {types, originWorld, otherWorlds, } = updateData
    const magicSystem = await getMagicSystem("id", id);
    if(JSON.stringify(types) !== JSON.stringify(types)){
        await addTypes(types);
    }
   
    const newWorlds = [originWorld, ...(otherWorlds ?? [])]
    if(JSON.stringify(newWorlds) !== JSON.stringify(magicSystem.worlds)){
        updateData.worlds = newWorlds;
    }
    
    return await magicSystemUpdate(updateData);
}
async function magicSystemUpdate(magicSystem){
    const index = magicSystems.findIndex(char => char.id === magicSystem.id);
    if(index !== -1){
        magicSystems[index] = magicSystem;
        return magicSystem
    }
    else {
        return {msg:"failed to update Magic System"}
    }
}

async function addTypes(type){
    if(Array.isArray(type)){
        type.forEach((item) => {
            if(!magicTypes.includes(item)){
                magicTypes.push(item);
            }
        })
    }
    else{
        if(!magicTypes.includes(type)){
            magicTypes.push(type)
        }
    }
    return "done"
}

async function modifyMagicSystem(magicSystem, list, data, method) {
    const restrictedLists = ["worlds", "sections", "custom"];
    if(restrictedLists.includes(list)){
        return {error: `can't modify ${list} directly use other or alt version` };
    }
    if (!magicSystem[list] || !Array.isArray(magicSystem[list])) {
        return { error: `List '${list}' not found, or not a list.` };
    }
    const magicSystemList = magicSystem[list];
    
    
    // Add or update references
    if (method === 'add' || method === 'put') {
        const existsInMagicSystem = magicSystemList.includes(data);
        if (!existsInMagicSystem) {
            magicSystemList.push(data);  // Add to magicSystem object
        }
    } 
    // Delete references
    else if (method === 'delete') {
        const magicSystemListIndex = magicSystemList.findIndex(item => item === data);
        if (magicSystemListIndex !== -1) {
            if(magicSystemListIndex === magicSystemList.length - 1){
                magicSystemList.pop()
            }
            else{
                magicSystemList.splice(magicSystemListIndex, 1);
            }
        }
    }
    magicSystem[list] = magicSystemList;
    return await updateMagicSystem(magicSystem.id, magicSystem);
}

// 🚀 Router: Modify a magicSystem field (add/put/delete references)
magicRouter.patch(`${urlPrefix}:id/:list`, verifyAuth, async (req, res) => {
    const { id, list } = req.params;
    const { method, data } = req.body;
    const magicSystem = await getMagicSystem("id", id)
    if(!magicSystem){
        return res.status(404).send({msg:"Error Magic System not found"});
    }

    const result = await modifyMagicSystem(magicSystem, list, data, method);

    if (result.error) {
        return res.status(400).send(result);
    } else {
        return res.send(result);
    }
});


module.exports = {magicRouter,modifyMagicSystem};
