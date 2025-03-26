const express = require('express');
const { verifyAuth, createID } = require('./../service.js');
const urlPrefix = "/worldbuilding/flora/"

const floraRouter = express.Router();
let floraList = [];
let floraBios = [];
let floraTypes = [
    "Plant",
    "Tree",
    "Flower",
    "Mushroom",
    "Magic Tree"
]

async function getFlora(field, value) {
    if (value) {
        return floraList.find((flora) => flora[field] === value);
    }
    return null;
}

async function getFloraBio(field, value) {
    if (value) {
        return floraBios.find((flora) => flora[field] === value);
    }
    return null;
}

async function getFloraList(queries) {
    if (typeof queries === "object") {
        let filterFlora = floraList;
        for (const [key, value] of Object.entries(queries)) {
            if (Array.isArray(value)) {
                filterFlora = filterFlora.filter((flora) =>
                    Array.isArray(flora[key])
                        ? flora[key].some((el) => value.includes(el))
                        : value.includes(flora[key])
                );
            } else {
                filterFlora = filterFlora.filter((flora) =>
                    Array.isArray(flora[key])
                        ? flora[key].includes(value)
                        : value === flora[key]
                );
            }
        }
        return filterFlora;
    } else {
        return floraList;
    }
}

floraRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const { author } = req.query || "";
    const queries = req.query || {};

    if (!id || id === "undefined" || id.trim() === "") {
        if (Object.keys(queries).length > 0) {
            let floraToSend = await getFloraList(queries);
            res.send(floraToSend);
        } else {
            res.send(floraList);
        }
    } else {
        if (id === "types") {
            res.send(floraTypes);
        } else {
            const flora = await getFloraBio("id", id);
            if (flora) {
                if (author) {
                    const isAuthor = author === flora.author;
                    res.send({ isAuthor });
                } else {
                    res.send(flora);
                }
            } else {
                res.status(404).json({ error: "Flora not found" });
            }
        }
    }
});

// 🚀 Create new flora
floraRouter.post(urlPrefix, verifyAuth, async (req, res) => {
    const { body } = req;
    const id = createID(req.body.name, req.body.author);
    if (await getFlora("id", id)) {
        return res.status(409).send({ msg: `A Flora entry by you with the name "${name}" already exists.` });
    }
    const newFlora = await createFlora(body, id);
    res.status(201).json(newFlora); // Respond with created flora
});

// 🚀 Modify flora (e.g., update details, sections, etc.)
floraRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    // Get the flora bio and the flora itself
    const floraBio = await getFloraBio("id", id);
    const flora = await getFlora("id", id);

    // Ensure flora and floraBio exist and that the current user is the author
    if (!floraBio || !flora) {
        return res.status(404).json({ error: `Flora with ID '${id}' not found` });
    }

    if (flora.author !== req.username) {
        return res.status(403).json({ error: "You do not have permission to update this flora" });
    }

    // Proceed with the update if ownership matches
    const updatedFlora = await updateFlora(id, body);
    res.status(200).json(updatedFlora); // Respond with updated flora
});

// 🚀 Add types to the flora types list
floraRouter.post(`${urlPrefix}types`, verifyAuth, async (req, res) => {
    const { type } = req.body;
    const result = await addTypes(type);
    res.status(200).json({ message: result });
});


async function createFlora(floraData, id) {
    const floraURL = `${urlPrefix}${id}`;
    const created = new Date().toJSON();
    const floraBio = {
        id,
        name: floraData.name,
        url: floraURL,
        author: floraData.author,
        infoCard: {
            name: floraData.name,
            cardData: [
                { label: "Author", value: floraData.author },
                { label: "Origin World", value: floraData.Origin_World, source: "/worldbuilding/worlds", edit: "select" },
                { label: "Type", value: floraData.Type, source: "/worldbuilding/flora/types", edit: "creatable" },
                { label: "Worlds", value: floraData.Worlds, source: "/worldbuilding/worlds", edit: "multi-select" },
                { label: "Countries", value: floraData.Countries, source: "/worldbuilding/countries", edit: "multi-select" },
                { label: "Biomes", value: floraData.Biomes, source: "/worldbuilding/biomes", edit: "multi-select" },
                { label: "Properties", value: floraData.Properties, source: "/worldbuilding/magicsystems", edit: "multi-select" }
            ],
            created,
            modified: created
        },
        description: floraData.Description,
        sections: floraData.sections || []
    };

    let originValue = floraData.Origin_World;
    if (Array.isArray(floraData.Origin_World)) {
        floraData.Worlds.push(...floraData.Origin_World);
        originValue = floraData.Origin_World[0];
    } else {
        floraData.Worlds.push(floraData.Origin_World);
    }

    const flora = {
        id,
        name: floraData.name,
        url: floraURL,
        author: floraData.author,
        description: floraData.Description,
        originWorld: originValue.id || originValue,
        worlds: floraData.Worlds.map(world => world.id),
        countries: floraData.Countries.map(country => country.id),
        biomes: floraData.Biomes.map(biome => biome.id),
        type: floraData.Type || [],
        properties: floraData.Properties.map(prop => prop.id),
        details: [
            { label: "name", value: floraData.name, path: floraURL, location: "head", filter: false },
            { label: "author", value: floraData.author },
            { label: "Origin World", value: originValue.value || originValue, path: originValue.path || originValue.url || null },
            { label: "type", value: floraData.Type || [] },
            { label: "Created", value: created, display: false, filter: false }
        ]
    };

    floraBios.push(floraBio);
    floraList.push(flora);
    return flora;
}

async function modifyFlora(floraID, list, data, method) {
    const { id, value, path } = data;

    // Retrieve the flora bio and flora data
    const floraBio = await getFloraBio("id", floraID);
    const flora = await getFlora("id", floraID);

    // Ensure Origin World cannot be modified
    if (list.toLowerCase() === 'origin_world' && method === 'put') {
        console.error(`Modification of Origin World is restricted.`);
        return { error: "Modification of Origin World is restricted." };
    }

    const bioIndex = floraBios.findIndex(bio => bio.id === floraID);
    const floraIndex = floraList.findIndex(f => f.id === floraID);

    const bioList = floraBio.infoCard.cardData.find(item => item.label.toLowerCase() === list.toLowerCase());
    const floraListObj = flora[list.toLowerCase()];

    if (!bioList || !floraListObj) {
        console.error(`List '${list}' not found in either floraBio or flora.`);
        return;
    }

    const newItem = { value, id, path };

    if (method === 'add' || method === 'put') {
        const existsInFlora = floraListObj.some(item => item.id === id && item.value === value && item.path === path);
        const existsInBio = bioList.value.some(item => item.id === id && item.value === value && item.path === path);

        if (!existsInFlora) {
            floraListObj.push(newItem.id); // Add only the ID to the flora object list
        }
        if (!existsInBio) {
            bioList.value.push(newItem); // Add only the ID to the floraBio cardData list
        }
    } else if (method === 'delete') {
        const floraListIndex = floraListObj.findIndex(item => item.id === id && item.value === value && item.path === path);
        if (floraListIndex !== -1) {
            floraListObj.splice(floraListIndex, 1);
        }

        const bioListIndex = bioList.value.findIndex(item => item.id === id && item.value === value && item.path === path);
        if (bioListIndex !== -1) {
            bioList.value.splice(bioListIndex, 1);
        }
    }

    floraBios[bioIndex] = floraBio;
    floraList[floraIndex] = flora;

    return flora;
}

async function updateFlora(id, updateData) {
    const { description, infoCard, sections } = updateData;
    const floraBio = await getFloraBio("id", id);
    const flora = await getFlora("id", id);

    if (!floraBio || !flora) {
        console.error(`Flora with ID ${id} not found.`);
        return { error: "Flora not found" };
    }

    let modified = false;

    if (infoCard && JSON.stringify(infoCard) !== JSON.stringify(floraBio.infoCard)) {
        floraBio.infoCard = infoCard;
        modified = true;

        for (const item of infoCard.cardData) {
            const label = item.label.toLowerCase();

            switch (label) {
                case "worlds": {
                    let newWorldIDs = item.value.map(world => world.id);
                    if (flora.originWorld && !newWorldIDs.includes(flora.originWorld.id)) {
                        newWorldIDs.unshift(flora.originWorld.id);
                    }

                    if (JSON.stringify(newWorldIDs) !== JSON.stringify(flora.worlds)) {
                        flora.worlds = newWorldIDs;
                        modified = true;
                    }
                    break;
                }

                case "origin world": {
                    if (item.value && item.value.id) {
                        const newOrigin = item.value;

                        if (JSON.stringify(flora.originWorld) !== JSON.stringify(newOrigin)) {
                            flora.originWorld = newOrigin;
                            if (!flora.worlds.includes(newOrigin.id)) {
                                flora.worlds.unshift(newOrigin.id);
                            }

                            const originDetailIndex = flora.details.findIndex(detail => detail.label === "Origin World");
                            if (originDetailIndex !== -1) {
                                flora.details[originDetailIndex] = {
                                    label: "Origin World",
                                    value: newOrigin.value || newOrigin.name,
                                    path: newOrigin.path || newOrigin.url || null
                                };
                            } else {
                                flora.details.push({
                                    label: "Origin World",
                                    value: newOrigin || newOrigin.name,
                                    path: newOrigin.path || newOrigin.url || null
                                });
                            }
                            modified = true;
                        }
                    }
                    break;
                }

                case "properties": {
                    const newProperties = item.value.map(prop => prop.id);
                    if (JSON.stringify(newProperties) !== JSON.stringify(flora.properties)) {
                        flora.properties = newProperties;
                        modified = true;
                    }
                    break;
                }

                case "biomes": {
                    const newBiomes = item.value.map(biome => biome.id);
                    if (JSON.stringify(newBiomes) !== JSON.stringify(flora.biomes)) {
                        flora.biomes = newBiomes;
                        modified = true;
                    }
                    break;
                }

                case "countries": {
                    const newCountries = item.value.map(country => country.id);
                    if (JSON.stringify(newCountries) !== JSON.stringify(flora.countries)) {
                        flora.countries = newCountries;
                        modified = true;
                    }
                    break;
                }

                case "type": {
                    if (JSON.stringify(item.value) !== JSON.stringify(flora.type)) {
                        flora.type = item.value;
                        modified = true;
                    }
                    break;
                }
            }
        }
    }

    if (sections && JSON.stringify(sections) !== JSON.stringify(floraBio.sections)) {
        floraBio.sections = sections;
        modified = true;
    }

    if (description && description !== flora.description) {
        floraBio.description = description;
        flora.description = description;
        modified = true;
    }

    if (modified) {
        floraBio.infoCard.modified = new Date().toJSON();
        const bioIndex = floraBios.findIndex(bio => bio.id === id);
        const floraIndex = floraList.findIndex(f => f.id === id);

        if (bioIndex !== -1) floraBios[bioIndex] = floraBio;
        if (floraIndex !== -1) floraList[floraIndex] = flora;
        console.log(`Flora ${id} updated successfully`);
        return { message: "Flora updated successfully", flora };
    }

    console.log(`No changes detected for Flora ${id}`);
    return { message: "No changes detected" };
}

module.exports = {floraRouter, modifyFlora};
