const express = require('express');
const { verifyAuth, createID } = require('./../service.js');
const urlPrefix = "/worldbuilding/races/";

const racesRouter = express.Router();

let races = [];
let raceTypes = ["sudo-shape-shifter"];


async function getRace(field, value){
    if (value) {
        return races.find((race) => race[field] === value);
    }
    return null;
}


async function getRaces(queries){
    if(typeof queries === "object"){
        let filterRaces = races;
        for(const [key, value] of Object.entries(queries)){
            if(Array.isArray(value)){
                filterRaces = filterRaces.filter(((race) => 
                    Array.isArray(race[key]) ? race[key].some(char => value.includes(char)) : value.includes(race[key] )))
            }
            else{
                filterRaces = filterRaces.filter(((race) => 
                    Array.isArray(race[key]) ? race[key].includes(value) : value === race[key]))
            }
        }
        return filterRaces;
    }
    else{
        return races;
    }
}


racesRouter.get(`${urlPrefix}options`, async (req, res) => {
    const filteredRaces = await getRaces(req.query);
    const options = filteredRaces.map((race) => {
        return {
            value: race.id, 
            label: race.name,
            qualifier: race.types || []
        }
    })
    res.send(options)
})

racesRouter.get(`${urlPrefix}types/options`, async (req, res) => {
    const options = raceTypes.map((type) => {
        return {
            value: type,
            label: type,
        }
    })
    res.send(options)
})



racesRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const queries = req.query || {};
    const {author} = req.query || "";
    if(!id || id === "undefined" || id.trim() === ""){
        let racesToSend = await getRaces(queries);
        res.send(racesToSend)
    }
    else{
        if(id == "types"){
            res.send(raceTypes);
        }
        else{
            const race = await getRace("id", id);
            if(race){
                if(author){
                    const isAuthor = author === race.author;
                    res.send({isAuthor})
                }
                else{
                    res.send(race);
                }
            }
            else{
                res.status(404).json({ error: "Race not found" });
            }
        }
    }
});

racesRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
    
    const {name, description} = req.body;
    const author = req.username;
    if(!name || !author || !description){
        return res.status(409).send({msg:"Required fields not filled out"});
    }
    const id = createID(req.body.name, author);
    if(await getRace("id", id)){
        return res.status(409).send({msg:"A Race by you and by that name already exists"});
    }else{
        const race = await createRace(req.body, author, id);
        if(race){
            return res.json(race)
        }
    }
});



racesRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const username  = req.username;
    const updateData = req.body;
    if(!updateData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if(!updateData.id || updateData.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Race." });
    }
    const race = await getRace("id", id);
    if(race){
        if(username !== race.author || updateData.author !== race.author){
            res.status(401).send({msg:`cannot update race, or field`});
        }
        if(username === race.author){
            const updateData = req.body;
            const updated = await updateRace(id, updateData)
            if(updated.msg){
                return res.status(500).send(updated.msg);
            }
            return res.send(updated);
        }
        else{
        }
    }
    else{
        res.status(404).send({msg:`Race ${id}, not found`});
    }
});




async function createRace(raceData, author, id){
    const raceURL = urlPrefix + id;
    const {name, types, description, 
        originWorld,
        otherWorlds = [], 
        abilities, 
        countries,  custom, sections
    } = raceData
    
    const created = new Date().toJSON();
    await addTypes(types);
    const race = {
        id,
        name,
        url:raceURL,
        author,
        types,
        abilities,
        originWorld,
        otherWorlds,
        countries,
        worlds: [originWorld, ...(otherWorlds ?? [])],
        custom,
        description,
        sections,
        created,
        modified:created,
    }
    races.push(race)
    return race
}
async function updateRace(id, updateData){
    const {types, originWorld, otherWorlds } = updateData
    const race = await getRace("id", id);
    if(JSON.stringify(types) !== JSON.stringify(race)){
        await addTypes(types);
    }
    const newWorlds = [originWorld, ...(otherWorlds ?? [])]
    if(JSON.stringify(newWorlds) !== JSON.stringify(race.worlds)){
        updateData.worlds = newWorlds;
    }
    return await raceUpdate(updateData);
}
async function raceUpdate(race){
    const index = races.findIndex(char => char.id === race.id);
    if(index !== -1){
        races[index] = race;
        return race
    }
    else {
        return {msg:"failed to update race"}
    }
}

async function addTypes(type){
    if(Array.isArray(type)){
        type.forEach((item) => {
            if(!raceTypes.includes(item)){
                raceTypes.push(item);
            }
        })
    }
    else{
        if(!raceTypes.includes(type)){
            raceTypes.push(type)
        }
    }
    return "done"
}

async function modifyRace(race, list, data, method) {
    const restrictedLists = ["worlds", "abilities", "sections", "custom"];
    if(restrictedLists.includes(list)){
        return {error: `can't modify ${list} directly use other or alt version` };
    }
    if (!race[list] || !Array.isArray(race[list])) {
        return { error: `List '${list}' not found, or not a list.` };
    }
    const races = race[list];
    
    
    // Add or update references
    if (method === 'add' || method === 'put') {
        const existsInRace = races.includes(data);
        if (!existsInRace) {
            races.push(data);  // Add to race object
        }
    } 
    // Delete references
    else if (method === 'delete') {
        const racesIndex = races.findIndex(item => item === data);
        if (racesIndex !== -1) {
            if(racesIndex === races.length - 1){
                races.pop()
            }
            else{
                races.splice(racesIndex, 1);
            }
        }
    }
    race[list] = races;
    return await updateRace(race.id, race);
}

// 🚀 Router: Modify a race field (add/put/delete references)
racesRouter.patch(`${urlPrefix}:id/:list`, verifyAuth, async (req, res) => {
    const { id, list } = req.params;
    const { method, data } = req.body;
    const race = await getRace("id", id)
    if(!race){
        return res.status(404).send({msg:"Error Race not found"});
    }

    const result = await modifyRace(race, list, data, method);

    if (result.error) {
        return res.status(400).send(result);
    } else {
        return res.send(result);
    }
});
module.exports = {racesRouter, modifyRace};
