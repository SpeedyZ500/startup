const express = require('express');
const { verifyAuth, createID } = require('./../service.js');
const urlPrefix = "/worldbuilding/worlds/";

const worldsRouter = express.Router();

let worlds = [];

async function getWorld(field, value) {
    if (value) {
        return worlds.find((world) => world[field] === value);
    }
    return null;
}

async function getWorlds(queries){
    if(typeof queries === "object"){
        let filterWorlds = worlds;
        for(const [key, value] of Object.entries(queries)){
            if(Array.isArray(value)){
                filterWorlds = filterWorlds.filter(((world) => 
                    Array.isArray(world[key]) ? world[key].some(wor => value.includes(wor)) : value.includes(world[key] )))
            }
            else{
                filterWorlds = filterWorlds.filter(((world) => 
                    Array.isArray(world[key]) ? world[key].includes(value) : value === world[key]))
            }
        }
        return filterWorlds;
    }
    else{
        return worlds;
    }
}

worldsRouter.get(`${urlPrefix}options`, async (req, res) => {
    const filteredWorlds = await getWorlds(req.query);
    const options = filteredWorlds.map((world) => {
        return {
            value: world.id, 
            label: world.name,
        }
    })
    res.send(options)
})

// 🚀 Router: Fetch worlds or individual world
worldsRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const { author } = req.query || "";
    const queries = req.query || {};

    if (!id || id === "undefined" || id.trim() === "") {
        let worldsToSend = await getWorlds(queries);
        return res.send(worldsToSend);
    } else {
        const world = await getWorld("id", id);
        if (world) {
            if (author) {
                const isAuthor = author === world.author;
                return res.send({ isAuthor });
            } else {
                return res.send(world);
            }
        } else {
            return res.status(404).json({ error: "World not found" });
        }
    }
});



// 🚀 Router: Create a new world
worldsRouter.post(`${urlPrefix}`, verifyAuth, async (req, res) => {
    const { name, description, sections } = req.body;
    const author = req.username;
    if(!name || !description || !sections){
        return res.status(409).send({msg:"Required fields not filled out"});
    }
    const id = createID(name, author);
    // Check if the world already exists
    if (await getWorld("id", id)) {
        return res.status(409).send({ msg: `A world entry by you with the name "${name}" already exists.` });
    }
    

    // Create new world using createWorld function
    const newWorld = await createWorld(req.body, id, author);

    res.send(newWorld); // Respond with created world
});

// 🚀 Router: Modify an existing world (author check)
worldsRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    
    const { id } = req.params;
    const { body, username } = req;
    if(!body){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if( !body.id || body.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different World." });
    }
    
    const world = await getWorld("id", id);
    if (!world) {
        return res.status(404).json({ error: "World not found" });
    }

    // Ensure the author is the original author
    if (world.author !== username || world.author !== body.author) {
        return res.status(401).json({ error: "You do not have permission to update this world/field." });
    }

    // Update world details
    const update = await updateWorld(body);
    if(update.msg){
        return res.status(500).send(update)
    }
    res.send(update);
});


// ✅ Create a new world
async function createWorld(worldData, id, author) {
    const {name, description, continents, custom, sections} = worldData;
    const url = urlPrefix + id;
    const created = new Date().toJSON();
    const formattedContinents = Array.isArray(continents) ? continents : [continents];

    const getterSections = createWorldGetterSections(id, formattedContinents);

    // Format the world for the list
    const world = {
        id: id,
        name,
        author,
        url,
        continents: formattedContinents,
        custom,
        description,
        sections,
        getterSections,
        created,
        modified: created
    };

    // Store world in the world list
    worlds.push(world);
    return world;
}

function createWorldGetterSections(id, continents){
    const getterSections = continents.map(continent => ({
        label: `Countries in ${continent}`,
        query: `/worldbuilding/countries?worlds=${id}&continent=${encodeURIComponent(continent)}`
    }));

    const additionalSections = [
        { label: "Biomes", query: `/worldbuilding/biomes?worlds=${id}` },
        { label: "Flora", query: `/worldbuilding/flora?worlds=${id}` },
        { label: "Wildlife", query: `/worldbuilding/wildlife?worlds=${id}` },
        { label: "Magic Systems", query: `/worldbuilding/magicsystems?worlds=${id}` },
        { label: "Organizations", query: `/worldbuilding/organizations?worlds=${id}` },
        { label: "Races", query: `/worldbuilding/races?worlds=${id}` },
        { label: "Characters Found Here/have visited/lived here", query:`/characters?worlds=${id}`}
    ];

    const finalGetterSections = [...getterSections, ...additionalSections];
    return finalGetterSections;
}

module.exports = worldsRouter;

async function updateWorld(updateData){
    const {id, continents} = updateData
    const world = getWorld('id', id);
    if(!world){
        return {msg:"Error updating world"}
    }
    const formattedContinents = Array.isArray(continents) ? continents : [continents];

    if(JSON.stringify(formattedContinents) != JSON.stringify(world.continents)){
        updateData.getterSections = createWorldGetterSections(id, formattedContinents);
    }
    updateData.modified = new Date().toJSON();
    const index = worlds.findIndex(world => world.id === id);
    if(index !== -1){
        worlds[index] = updateData;
        return updateData;
    }
    else{
        return {msg:"Error updating world"} 
    }
}