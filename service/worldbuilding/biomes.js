const express = require('express');
const { verifyAuth, createID } = require('./../service.js');
const {modifyFlora} = require(`./flora.js`)
const {modifyWildlife} = require(`./wildlife.js`)
const urlPrefix = "/worldbuilding/biomes/";

const biomesRouter = express.Router();

// Temporary store for biomes
let biomes = [];

async function getBiome(field, value) {
    if (value) {
        return biomes.find((biome) => biome[field] === value);
    }
    return null;
}

async function getBiomes(queries){
    if(typeof queries === "object"){
        let filterBiomes = biomes;
        for(const [key, value] of Object.entries(queries)){
            if(Array.isArray(value)){
                filterBiomes = filterBiomes.filter(((biome) => 
                    Array.isArray(biome[key]) ? biome[key].some(bio => value.includes(bio)) : value.includes(biome[key] )))
            }
            else{
                filterBiomes = filterBiomes.filter(((biome) => 
                    Array.isArray(biome[key]) ? biome[key].includes(value) : value === biome[key]))
            }
        }
        return filterBiomes;
    }
    else{
        return biomes;
    }
}

biomesRouter.get(`${urlPrefix}options`, async (req, res) => {
    const filteredBiomes = await getBiomes(req.query);
    const options = filteredBiomes.map((biome) => {
        return {
            value: biome.id, 
            label: biome.name,
        }
    })
    res.send(options)
})

// 🚀 Router: Fetch biomes or individual biome
biomesRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const { author } = req.query || "";
    const queries = req.query || {};

    if (!id || id === "undefined" || id.trim() === "") {
        let biomesToSend = await getBiomes(queries);
        return res.send(biomesToSend);
    } else {
        const biome = await getBiome("id", id);
        if (biome) {
            if (author) {
                const isAuthor = author === biome.author;
                return res.send({ isAuthor });
            } else {
                return res.send(biome);
            }
        } else {
            return res.status(404).json({ error: "Biome not found" });
        }
    }
});



// 🚀 Router: Create a new biome
biomesRouter.post(`${urlPrefix}`, verifyAuth, async (req, res) => {
    const { name, description, sections } = req.body;
    const author = req.username;
    if(!name || !description || !sections){
        return res.status(409).send({msg:"Required fields not filled out"});
    }
    const id = createID(name, author);
    // Check if the biome already exists
    if (await getBiome("id", id)) {
        return res.status(409).send({ msg: `A biome entry by you with the name "${name}" already exists.` });
    }
    

    // Create new biome using createBiome function
    const newBiome = await createBiome(req.body, id, author);

    res.send(newBiome); // Respond with created biome
});

// 🚀 Router: Modify an existing biome (author check)
biomesRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    
    const { id } = req.params;
    const { body, username } = req;
    if(!body){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if( !body.id || body.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Biome." });
    }
    
    const biome = await getBiome("id", id);
    if (!biome) {
        return res.status(404).json({ error: "Biome not found" });
    }

    // Ensure the author is the original author
    if (biome.author !== username || biome.author !== body.author) {
        return res.status(401).json({ error: "You do not have permission to update this biome/field." });
    }

    // Update biome details
    const update = await updateBiome(body);
    if(update.msg){
        return res.status(500).send(update)
    }
    res.send(update);
});




// ✅ Create a new biome
async function createBiome(biomeData, id, author) {
    const {name, description, worlds, custom, sections} = biomeData;
    const url = urlPrefix + id;
    const created = new Date().toJSON();


    // Format the biome for the list
    const biome = {
        id: id,
        name,
        author,
        url,
        worlds: Array.isArray(worlds) ? worlds : worlds ? [worlds] : [],
        custom,
        description,
        sections,
        created,
        modified: created
    };

    // Store biome in the biome list
    biomes.push(biome);
    return biome;
}




async function updateBiome(updateData){
    const {id } = updateData
    const biome = await getBiome('id', id);
    if(!biome){
        return {msg:"Error updating biome"}
    }

    
    updateData.modified = new Date().toJSON();
    const index = biomes.findIndex(biome => biome.id === id);
    if(index !== -1){
        biomes[index] = updateData;
        return updateData;
    }
    else{
        return {msg:"Error updating biome"} 
    }
}

async function modifyBiome(biome, list, data, method) {
    const restrictedLists = ["sections", "custom"];
    if(restrictedLists.includes(list) ){
        return {error: `can't modify ${list} directly use other or alt version` };
    }
    if (!biome[list] || !Array.isArray(biome[list])) {
        return { error: `List '${list}' not found, or not a list.` };
    }
    const biomeData = biome[list];
    
    
    // Add or update references
    if (method === 'add' || method === 'put') {
        const existsInBiome = biomeData.includes(data);
        if (!existsInBiome) {
            biomeData.push(data);  // Add to country object
        }
    } 
    // Delete references
    else if (method === 'delete') {
        const biomeIndex = biomeData.findIndex(item => item === data);
        if (biomeIndex !== -1) {
            if(biomeIndex === biomeData.length - 1){
                biomeData.pop()
            }
            else{
                biomeData.splice(biomeIndex, 1);
            }
        }
    }
    biome[list] = biomeData;
    return await updateBiome(biome);
}

// 🚀 Router: Modify a country field (add/put/delete references)
biomesRouter.patch(`${urlPrefix}:id/:list`, verifyAuth, async (req, res) => {
    const { id, list } = req.params;
    const { method, data } = req.body;
    const biome = await getBiome("id", id)
    if(!biome){
        return res.status(404).send({msg:"Error Biome not found"});
    }

    const result = await modifyBiome(biome, list, data, method);

    if (result.error) {
        return res.status(400).send(result);
    } else {
        return res.send(result);
    }
});


module.exports = {biomesRouter,modifyBiome};
