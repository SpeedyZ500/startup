const express = require('express');
const { verifyAuth, createID } = require('./../service.js');
const {modifyFlora} = require(`./flora.js`)
const {modifyWildlife} = require(`./wildlife.js`)
const urlPrefix = "/worldbuilding/biomes/";

const biomesRouter = express.Router();

// Temporary store for biomes
let biomes = [];

// 🚀 Router: Fetch biomes or individual biome
biomesRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const queries = req.query || {};

    if (!id || id === "undefined" || id.trim() === "") {
        let biomesToSend = biomes;

        if (Object.keys(queries).length > 0) {
            biomesToSend = biomes.filter(biome => {
                return Object.entries(queries).every(([key, value]) => {
                    return biome[key] && biome[key].includes(value);
                });
            });
        }

        res.send(biomesToSend);
    } else {
        const biome = biomes.find(b => b.id === id);
        if (biome) {
            res.send(biome);
        } else {
            res.status(404).json({ error: "Biome not found" });
        }
    }
});

// 🚀 Router: Create a new biome
biomesRouter.post(`${urlPrefix}`, verifyAuth, async (req, res) => {
    const { name, author, Worlds, Wildlife, Flora, Sections } = req.body;
    const id = createID(name, author);
    if (await getBiome("id", id)) {
        return res.status(409).send({ msg: `A Biome entry by you with the name "${name}" already exists.` });
    }
    // Create new biome using createBiome function
    const newBiome = await createBiome(req.body, id);
    
    // Add biome to the referenced flora and wildlife using modifyWildlife and modifyFlora
    if (Wildlife && Wildlife.length > 0) {
        for (const wildlifeId of Wildlife) {
            await modifyWildlife(wildlifeId, "add", {
                id: newBiome.id,
                path: newBiome.url,
                value: newBiome.name
            });
        }
    }

    if (Flora && Flora.length > 0) {
        for (const floraId of Flora) {
            await modifyFlora(floraId, "add", {
                id: newBiome.id,
                path: newBiome.url,
                value: newBiome.name
            });
        }
    }

    res.status(201).json(newBiome); // Respond with created biome
});

// 🚀 Router: Modify an existing biome (author check)
biomesRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    const biome = biomes.find(b => b.id === id);
    if (!biome) {
        return res.status(404).json({ error: "Biome not found" });
    }

    // Ensure the author is the original author
    if (biome.author !== req.username) {
        return res.status(403).json({ error: "You do not have permission to update this biome." });
    }

    // Update biome details
    Object.assign(biome, body);

    res.send({ message: `Biome ${id} updated successfully` });
});

// 🚀 Router: Modify biome references (e.g., add/remove wildlife, flora)
biomesRouter.patch(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const { method, data } = req.body;

    const biome = biomes.find(b => b.id === id);
    if (!biome) {
        return res.status(404).json({ error: "Biome not found" });
    }

    // Ensure the author is the original author
    if (biome.author !== req.username) {
        return res.status(403).json({ error: "You do not have permission to modify references in this biome." });
    }

    // Modify wildlife references
    if (data && data.wildlife) {
        for (const wildlifeId of data.wildlife) {
            await modifyWildlife(wildlifeId, method, {
                id: biome.id,
                path: biome.url,
                value: biome.name
            });
        }
    }

    // Modify flora references
    if (data && data.flora) {
        for (const floraId of data.flora) {
            await modifyFlora(floraId, method, {
                id: biome.id,
                path: biome.url,
                value: biome.name
            });
        }
    }

    res.send({ message: `Biome references updated successfully` });
});

// ✅ Create a new biome
async function createBiome(biomeData, id) {
    const biomeURL = urlPrefix + id;
    const created = new Date().toJSON();

    const biomeBio = {
        id: id,
        name: biomeData.name,
        url: biomeURL,
        author: biomeData.author,
        infoCard: {
            name: biomeData.name,
            cardData: [
                { label: "Author", value: biomeData.author },
                { label: "Worlds", value: biomeData.Worlds, source: "/worldbuilding/worlds", edit: "multi-select" }
            ],
            created: created,
            modified: created
        },
        description: biomeData.Description,
        sections: biomeData.Sections || [],
        listSections: [
            {
                label: "Wildlife",
                query: `/wildlife?biomes=${id}`,
                canModifyReferences: true
            },
            {
                label: "Flora",
                query: `/flora?biomes=${id}`,
                canModifyReferences: true
            }
        ]
    };

    const biome = {
        id: id,
        name: biomeData.name,
        url: biomeURL,
        author: biomeData.author,
        worlds: biomeData.Worlds || [],
        details: [
            { label: "name", value: biomeData.name, path: biomeURL, location: "head", filter: false },
            { label: "author", value: biomeData.author }
        ]
    };

    biomes.push(biome);

    return biome;
}

async function modifyBiome(id, data, method) {
    const { worldId, wildlifeId, floraId, path, value } = data;

    const biome = biomes.find(b => b.id === id);
    if (!biome) {
        console.error(`Biome with ID '${id}' not found.`);
        return { error: "Biome not found" };
    }

    if (method === "add") {
        // Add to wildlife
        if (wildlifeId) {
            if (!biome.Wildlife.includes(wildlifeId)) {
                biome.Wildlife.push(wildlifeId);
            }
        }

        // Add to flora
        if (floraId) {
            if (!biome.Flora.includes(floraId)) {
                biome.Flora.push(floraId);
            }
        }

        // Add to worlds
        if (worldId) {
            if (!biome.Worlds.includes(worldId)) {
                biome.Worlds.push(worldId);
                // If other worlds exist, tag as multi-world
                if (biome.Worlds.length > 1) {
                    biome.infoCard.cardData.find((field) => field.label === "Classification").value = "multi-world";
                }
            }
        }
    } else if (method === "delete") {
        // Remove from wildlife
        if (wildlifeId) {
            const index = biome.Wildlife.indexOf(wildlifeId);
            if (index > -1) {
                biome.Wildlife.splice(index, 1);
            }
        }

        // Remove from flora
        if (floraId) {
            const index = biome.Flora.indexOf(floraId);
            if (index > -1) {
                biome.Flora.splice(index, 1);
            }
        }

        // Remove from worlds
        if (worldId) {
            const index = biome.Worlds.indexOf(worldId);
            if (index > -1) {
                biome.Worlds.splice(index, 1);
                // If no other worlds, revert to uni-world
                if (biome.Worlds.length === 0) {
                    biome.infoCard.cardData.find((field) => field.label === "Classification").value = "uni-world";
                }
            }
        }
    }

    return biome;
}


module.exports = {biomesRouter,modifyBiome};
