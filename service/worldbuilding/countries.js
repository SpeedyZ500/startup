const express = require('express');
const { verifyAuth } = require('./../service.js');
const { createID } = require('./../database.js')
const { modifyCharacter, getCharacter, charactersExists } = require('./../characters'); // Import modifyCharacters
const urlPrefix = "/worldbuilding/countries/";

const countriesRouter = express.Router();

let countries = [];
let countryTypes = [];

async function getCountry(field, value){
    if (value) {
        return countries.find((country) => country[field] === value);
    }
    return null;
}


async function getCountries(queries){
    if(typeof queries === "object"){
        let filterCountries = countries;
        for(const [key, value] of Object.entries(queries)){
            if(Array.isArray(value)){
                filterCountries = filterCountries.filter(((country) => 
                    Array.isArray(country[key]) ? country[key].some(char => value.includes(char)) : value.includes(country[key] )))
            }
            else{
                filterCountries = filterCountries.filter(((country) => 
                    Array.isArray(country[key]) ? country[key].includes(value) : value === country[key]))
            }
        }
        return filterCountries;
    }
    else{
        return countries;
    }
}


countriesRouter.get(`${urlPrefix}options`, async (req, res) => {
    const filteredCountries = await getCountries(req.query);
    const options = filteredCountries.map((country) => {
        return {
            value: country.id, 
            label: country.name,
        }
    })
    res.send(options)
})
countriesRouter.get(`${urlPrefix}types/options`, async (req, res) => {
    const options = countryTypes.map((type) => {
        return {
            value: type,
            label: type,
        }
    })
    res.send(options)
})
countriesRouter.get(`${urlPrefix}towns/options`, async (req, res) => {
    const countryID = req.query.filter.id
    const country = await getCountry("id", countryID)
    if(!country){
        return res.status(404).send({msg:"Country not found"})
    }
    const options = country.towns.map((town) => {
        return {
            value: town,
            label: town,
        }
    })
    return res.send(options)
})



countriesRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const queries = req.query || {};
    const {author} = req.query || "";
    if(!id || id === "undefined" || id.trim() === ""){
        let countriesToSend = await getCountries(queries);
        res.send(countriesToSend)
    }
    else{
        if(id == "types"){
            res.send(countryTypes);
        }
        else{
            const country = await getCountry("id", id);
            if(country){
                if(author){
                    const isAuthor = author === country.author;
                    res.send({isAuthor})
                }
                else{
                    res.send(country);
                }
            }
            else{
                res.status(404).json({ error: "Country not found" });
            }
        }
    }
});

countriesRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
    
    const {name, description, leaders} = req.body;
    
    const author = req.usid;

    if(!name || !author || !description){
        return res.status(409).send({msg:"Required fields not filled out"});
    }
    
    const id = createID(req.body.name, author);
    if(await getCountry("id", id)){
        return res.status(409).send({msg:"A Country by you and by that name already exists"});
    }else{
        const leadersArray = Array.isArray(leaders) ? leaders : leaders != null  ?  [leaders] : []
        if(!charactersExists(leadersArray)){
            return res.status(404).send({msg:"All Leaders must exist"});

        }
        const country = await createCountry(req.body, author, id);
        if(country){
            return res.json(country)
        }
    }
});



countriesRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const username  = req.usid;
    const updateData = req.body;
    const {leaders} = updateData
    if(!updateData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if(!updateData.id || updateData.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Country." });
    }
    
    const country = await getCountry("id", id);
    if(country){
        if(username !== country.author || updateData.author !== country.author){
            return res.status(401).send({msg:`cannot update country, or field`});
        }
        if(username === country.author){
            const leadersArray = Array.isArray(leaders) ? leaders : leaders != null  ?  [leaders] : []
            if(!charactersExists(leadersArray)){
                return res.status(404).send({msg:"All Leaders must exist"});

            }
            const updateData = req.body;
            const updated = await updateCountry(id, updateData)
            if(updated.msg){
                return res.status(500).send(updated.msg);
            }
            return res.send(updated);
        }
        
    }
    else{
        return res.status(404).send({msg:`Country ${id}, not found`});
    }
    return res.status(500).send({msg:`Server error`});
});




async function createCountry(countryData, author, id, leaders){
    const countryURL = urlPrefix + id;
    const {name, towns, description, 
        originWorld,
        otherWorlds = [], 
        authorIsLeader, types,
         continents, biomes, custom, sections
    } = countryData
    const biomesArray = Array.isArray(biomes) ? biomes : biomes ? [biomes] : []
    
    const created = new Date().toJSON();
    addTypes(types ?? [])
    const country = {
        id,
        name,
        url:countryURL,
        author,
        continents,
        types,
        towns,
        leaders,
        authorIsLeader,
        originWorld,
        otherWorlds,
        biomes: biomesArray,
        worlds: [originWorld, ...(otherWorlds ?? [])],
        custom,
        description,
        sections,
        created,
        modified:created,
    }

    await Promise.all(
        leadersArray.map(async (leader) => {
            const character = await getCharacter("id", leader);
            if (character) {
                await modifyCharacter(character, "otherCountries", id, "add");
            }
        })
    );
    countries.push(country)

    return country;
}
async function updateCountry(id, updateData){
    const { originWorld, otherWorlds, leaders,types} = updateData
    const country = await getCountry("id", id);
    if(JSON.stringify(types) !== JSON.stringify(country.types)){
        await addTypes(types);
    }
    if(JSON.stringify(leaders) !== JSON.stringify(country.leaders)){
        
        await Promise.all(
            leaders.map(async (leader) => {
                const character = await getCharacter("id", leader);
                if (character) {
                    await modifyCharacter(character, "otherCountries", id, "add");
                }
            })
        );
        
    }
    const newWorlds = [originWorld, ...(otherWorlds ?? [])]
    if(JSON.stringify(newWorlds) !== JSON.stringify(country.worlds)){
        updateData.worlds = newWorlds;
    }
    return await countryUpdate(updateData);
}
async function countryUpdate(country){
    const index = countries.findIndex(char => char.id === country.id);
    if(index !== -1){
        countries[index] = country;
        return country
    }
    else {
        return {msg:"failed to update country"}
    }
}

async function addTypes(type){
    if(Array.isArray(type)){
        type.forEach((item) => {
            if(!countryTypes.includes(item)){
                countryTypes.push(item);
            }
        })
    }
    else{
        if(!countryTypes.includes(type)){
            countryTypes.push(type)
        }
    }
    return "done"
}

async function modifyCountry(country, list, data, method) {
    const restrictedLists = ["worlds", "sections", "custom"];
    if(restrictedLists.includes(list) || (list === "leaders" && (method === "add" || method === "put"))){
        return {error: `can't modify ${list} directly use other or alt version` };
    }
    if (!country[list] || !Array.isArray(country[list])) {
        return { error: `List '${list}' not found, or not a list.` };
    }
    const countryData = country[list];
    
    
    // Add or update references
    if (method === 'add' || method === 'put') {
        const existsInCountry = countryData.includes(data);
        if (!existsInCountry) {
            countryData.push(data);  // Add to country object
        }
    } 
    // Delete references
    else if (method === 'delete') {
        const countriesIndex = countryData.findIndex(item => item === data);
        if (countriesIndex !== -1) {
            if(countriesIndex === countryData.length - 1){
                countryData.pop()
            }
            else{
                countryData.splice(countriesIndex, 1);
            }
        }
    }
    country[list] = countryData;
    return await updateCountry(country.id, country);
}

// 🚀 Router: Modify a country field (add/put/delete references)
countriesRouter.patch(`${urlPrefix}:id/:list`, verifyAuth, async (req, res) => {
    const { id, list } = req.params;
    const { method, data } = req.body;
    const country = await getCountry("id", id)
    if(!country){
        return res.status(404).send({msg:"Error Country not found"});
    }

    const result = await modifyCountry(country, list, data, method);

    if (result.error) {
        return res.status(400).send(result);
    } else {
        return res.send(result);
    }
});

module.exports = {countriesRouter, modifyCountry};
