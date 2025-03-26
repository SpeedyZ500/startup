const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/wildlife/"

const wildlifeRouter = express.Router();
let wildlifeList = [];
let wildlifeBios = [];
let wildlifeTypes = [
    "Monster"
]

async function getWildlife(field, value) {
    if (value) {
        return wildlifeList.find((wild) => wild[field] === value);
    }
    return null;
}

async function getWildlifeBio(field, value) {
    if (value) {
        return wildlifeBios.find((wild) => wild[field] === value);
    }
    return null;
}

async function getWildlifeList(queries) {
    if (typeof queries === "object") {
        let filterWildlife = wildlifeList;
        for (const [key, value] of Object.entries(queries)) {
            if (Array.isArray(value)) {
                filterWildlife = filterWildlife.filter((wild) =>
                    Array.isArray(wild[key])
                        ? wild[key].some((el) => value.includes(el))
                        : value.includes(wild[key])
                );
            } else {
                filterWildlife = filterWildlife.filter((wild) =>
                    Array.isArray(wild[key])
                        ? wild[key].includes(value)
                        : value === wild[key]
                );
            }
        }
        return filterWildlife;
    } else {
        return wildlife;
    }
}


wildlifeRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const { author } = req.query || "";  
    const queries = req.query || {};

    if (!id || id === "undefined" || id.trim() === "") {
        if (Object.keys(queries).length > 0) {
            let wildlifeToSend = await getWildlifeList(queries);
            res.send(wildlifeToSend);
        } else {
            res.send(wildlifeList);
        }
    } else {
        if (id === "types") {
            res.send(wildlifeTypes);
        } else {
            const wild = await getWildlifeBio("id", id);
            if (wild) {
                if (author) {
                    const isAuthor = author === wild.author;
                    res.send({ isAuthor });
                } else {
                    res.send(wild);
                }
            } else {
                res.status(404).json({ error: "Wildlife not found" });
            }
        }
    }
});

wildlifeRouter.post(urlPrefix, verifyAuth, async (req, res) => {
    const { body } = req;
    const id = createID(body.name, body.author);
    if (await getWildlife("id", id)) {
        return res.status(409).send({ msg: `A Wildlife entry by you with the name "${name}" already exists.` });
    }
    const newWildlife = await createWildlife(body, id);
    res.status(201).json(newWildlife); // Respond with created wildlife
});

// Modify wildlife (e.g., update details, sections, etc.)
wildlifeRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    // Get the wildlife from the database to check the ownership
    const wildlife = await getWildlife("id", id);
    
    if (wildlife && wildlife.author === req.username) {
        // Proceed with updating wildlife if ownership matches
        const updatedWildlife = await updateWildlife(id, body);
        res.status(200).json(updatedWildlife); // Respond with updated wildlife
    } else {
        res.status(403).json({ error: "You do not have permission to update this wildlife" });
    }
});

// Add types to the wildlife types list
wildlifeRouter.post(`${urlPrefix}types`, verifyAuth, async (req, res) => {
    const { type } = req.body;
    const result = await addTypes(type);
    res.status(200).json({ message: result });
});


async function createWildlife(wildlifeData, id) {
    const wildlifeURL = `${urlPrefix}${id}`;
    const created = new Date().toJSON();
    const wildlifeBio = {
        id,
        name: wildlifeData.name,
        url: wildlifeURL,
        author: wildlifeData.author,
        infoCard: {
            name: wildlifeData.name,
            cardData: [
                { label: "Author", value: wildlifeData.author },
                { label: "Origin World", value: wildlifeData.Origin_World, source: "/worldbuilding/worlds", edit: "select" },
                { label: "Type", value: wildlifeData.Type, source: "/worldbuilding/wildlife/types", edit: "creatable" },
                { label: "Worlds", value: wildlifeData.Worlds, source: "/worldbuilding/worlds", edit: "multi-select" },
                { label: "Countries", value: wildlifeData.Countries, source: "/worldbuilding/countries", edit: "multi-select" },
                { label: "Biomes", value: wildlifeData.Biomes, source: "/worldbuilding/biomes", edit: "multi-select" },
                { label: "Abilities", value: wildlifeData.Abilities, source: "/worldbuilding/magicsystems", edit: "multi-select" }
            ],
            created,
            modified: created
        },
        description: wildlifeData.Description,
        sections: wildlifeData.sections || []
    };

    let originValue = wildlifeData.Origin_World;
    if (Array.isArray(wildlifeData.Origin_World)) {
        wildlifeData.Worlds.push(...wildlifeData.Origin_World);
        originValue = wildlifeData.Origin_World[0];
    } else {
        wildlifeData.Worlds.push(wildlifeData.Origin_World);
    }

    const wildlife = {
        id,
        name: wildlifeData.name,
        url: wildlifeURL,
        author: wildlifeData.author,
        description: wildlifeData.Description,
        originWorld: originValue.id || originValue,
        worlds: wildlifeData.Worlds.map(world => world.id),
        countries: wildlifeData.Countries.map(country => country.id),
        biomes: wildlifeData.Biomes.map(biome => biome.id),
        type: wildlifeData.Type || [],
        abilities: wildlifeData.Abilities.map(abil => abil.id),
        details: [
            { label: "name", value: wildlifeData.name, path: wildlifeURL, location: "head", filter: false },
            { label: "author", value: wildlifeData.author },
            { label: "Origin World", value: originValue.value || originValue, path: originValue.path || originValue.url || null },
            { label: "type", value: wildlifeData.Type || [] },
            { label: "Created", value: created, display: false, filter: false }
        ]
    };

    wildlifeBios.push(wildlifeBio);
    wildlifeList.push(wildlife);
    return wildlife;
}



async function modifyWildlife(wildlifeID, list, data, method) {
    const { id, value, path } = data;

    // Retrieve the wildlife bio and wildlife data
    const wildlifeBio = await getWildlifeBio("id", wildlifeID);
    const wildlife = await getWildlife("id", wildlifeID);

    // Find the index for the wildlifeBio and wildlife in their respective arrays
    const bioIndex = wildlifeBios.findIndex(bio => bio.id === wildlifeID);
    const wildlifeIndex = wildlifeList.findIndex(wildlife => wildlife.id === wildlifeID);

    // Locate the correct section (list) in both the wildlifeBio and the wildlife object
    const bioList = wildlifeBio.infoCard.cardData.find(item => item.label.toLowerCase() === list.toLowerCase());
    const wildlifeListObj = wildlife[list.toLowerCase()];

    // Check if the list was found in both wildlifeBio and wildlife
    if (!bioList || !wildlifeListObj) {
        console.error(`List '${list}' not found in either wildlifeBio or wildlife.`);
        return;
    }

    // Create the object that we will check and add (value, id, path)
    const newItem = { value, id, path };

    // Add, put, or delete the data based on the method provided
    if (method === 'add' || method === 'put') {
        // Check if the item is already in the list before adding
        const existsInWildlife = wildlifeListObj.some(item => item.id === id && item.value === value && item.path === path);
        const existsInBio = bioList.value.some(item => item.id === id && item.value === value && item.path === path);

        if (!existsInWildlife) {
            wildlifeListObj.push(id); // Add the item to the wildlife object list
        }
        if (!existsInBio) {
            bioList.value.push(newItem); // Add the item to the wildlifeBio cardData list
        }
    } else if (method === 'delete') {
        // Remove the item from both the wildlife object and the wildlifeBio cardData list
        const wildlifeListIndex = wildlifeListObj.findIndex(item => item.id === id && item.value === value && item.path === path);
        if (wildlifeListIndex !== -1) {
            wildlifeListObj.splice(wildlifeListIndex, 1); // Remove from wildlife object list
        }

        const bioListIndex = bioList.value.findIndex(item => item.id === id && item.value === value && item.path === path);
        if (bioListIndex !== -1) {
            bioList.value.splice(bioListIndex, 1); // Remove from wildlifeBio cardData list
        }
    }

    // Update the wildlifeBio and wildlife in their respective arrays
    wildlifeBios[bioIndex] = wildlifeBio;
    wildlifeList[wildlifeIndex] = wildlife;

    // Return the updated wildlife
    return wildlife;
}

async function updateWildlife(id, updateData) {
    const { description, infoCard, sections } = updateData;
    const wildlifeBio = await getWildlifeBio("id", id);
    const wildlife = await getWildlife("id", id);

    if (!wildlifeBio || !wildlife) {
        console.error(`Wildlife with ID ${id} not found.`);
        return { error: "Wildlife not found" };
    }

    let modified = false;  // Track if any modifications occur

    // Update infoCard if there are changes
    if (infoCard && JSON.stringify(infoCard) !== JSON.stringify(wildlifeBio.infoCard)) {
        wildlifeBio.infoCard = infoCard;
        modified = true;

        for (const item of infoCard.cardData) {
            const label = item.label.toLowerCase();

            switch (label) {
                case "worlds": {
                    let newWorldIDs = item.value.map(world => world.id);

                    // ✅ Ensure Origin World is included first
                    if (wildlife.originWorld && !newWorldIDs.includes(wildlife.originWorld.id)) {
                        newWorldIDs.unshift(wildlife.originWorld.id);
                    }

                    // Only update if worlds have changed
                    if (JSON.stringify(newWorldIDs) !== JSON.stringify(wildlife.worlds)) {
                        wildlife.worlds = newWorldIDs;
                        modified = true;
                    }
                    break;
                }

                case "origin world": {
                    if (item.value && item.value.id) {
                        const newOrigin = item.value;

                        // Only update if the Origin World is different
                        if (JSON.stringify(wildlife.originWorld) !== JSON.stringify(newOrigin)) {
                            wildlife.originWorld = newOrigin;

                            // ✅ Ensure Origin World is part of the worlds array
                            if (!wildlife.worlds.includes(newOrigin.id)) {
                                wildlife.worlds.unshift(newOrigin.id);  // Add Origin World at the beginning
                            }

                            // Update the details array
                            const originDetailIndex = wildlife.details.findIndex(detail => detail.label === "Origin World");
                            if (originDetailIndex !== -1) {
                                wildlife.details[originDetailIndex] = {
                                    label: "Origin World",
                                    value: newOrigin.value || newOrigin.name,
                                    path: newOrigin.path || newOrigin.url || null
                                };
                            } else {
                                wildlife.details.push({
                                    label: "Origin World",
                                    value: newOrigin.value || newOrigin.name,
                                    path: newOrigin.path || newOrigin.url || null
                                });
                            }
                            modified = true;
                        }
                    }
                    break;
                }

                case "abilities": {
                    const newAbilities = item.value.map(abil => abil.id);
                    if (JSON.stringify(newAbilities) !== JSON.stringify(wildlife.abilities)) {
                        wildlife.abilities = newAbilities;
                        modified = true;
                    }
                    break;
                }

                case "biomes": {
                    const newBiomes = item.value.map(biome => biome.id);
                    if (JSON.stringify(newBiomes) !== JSON.stringify(wildlife.biomes)) {
                        wildlife.biomes = newBiomes;
                        modified = true;
                    }
                    break;
                }

                case "countries": {
                    const newCountries = item.value.map(country => country.id);
                    if (JSON.stringify(newCountries) !== JSON.stringify(wildlife.countries)) {
                        wildlife.countries = newCountries;
                        modified = true;
                    }
                    break;
                }

                case "type": {
                    if (JSON.stringify(item.value) !== JSON.stringify(wildlife.type)) {
                        wildlife.type = item.value;
                        modified = true;
                    }
                    break;
                }
            }
        }
    }

    // Update sections if they have changed
    if (sections && JSON.stringify(sections) !== JSON.stringify(wildlifeBio.sections)) {
        wildlifeBio.sections = sections;
        modified = true;
    }

    // Update description if it has changed
    if (description && description !== wildlife.description) {
        wildlifeBio.description = description;
        wildlife.description = description;
        modified = true;
    }

    // Save the updated wildlife and wildlifeBio only if modified
    if (modified) {
        wildlifeBio.infoCard.modified = new Date().toJSON();
        const bioIndex = wildlifeBios.findIndex(bio => bio.id === id);
        const wildlifeIndex = wildlifeList.findIndex(w => w.id === id);

        if (bioIndex !== -1) wildlifeBios[bioIndex] = wildlifeBio;
        if (wildlifeIndex !== -1) wildlifeList[wildlifeIndex] = wildlife;
        console.log(`Wildlife ${id} updated successfully`);
        return { message: "Wildlife updated successfully", wildlife };
    }

    console.log(`No changes detected for Wildlife ${id}`);
    return { message: "No changes detected" };
}



module.exports = {wildlifeRouter, modifyWildlife};