const express = require('express');
const { verifyAuth, createID } = require('./../service.js');
const { modifyMagicSystem } = require('./magicsystems.js');
const { modifyBiome } = require('./biomes.js');
const { modifyFlora } = require('./flora.js');
const { modifyWildlife } = require('./wildlife.js');
const { modifyOrganization } = require('./organizations.js');
const { modifyCountry } = require('./countries.js');
const urlPrefix = "/worldbuilding/worlds/";

const worldsRouter = express.Router();

let worlds = [];
let worldBios = [];

async function getWorld(field, value) {
    if (value) {
        return worlds.find((world) => world[field] === value);
    }
    return null;
}

async function getWorldBio(field, value) {
    if (value) {
        return worldBios.find((world) => world[field] === value);
    }
    return null;
}

// 🚀 Router: Fetch worlds or individual world
worldsRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const { author } = req.query || "";
    const queries = req.query || {};

    if (!id || id === "undefined" || id.trim() === "") {
        if (Object.keys(queries).length > 0) {
            let worldsToSend = await getWorlds(queries);
            res.send(worldsToSend);
        } else {
            res.send(worlds);
        }
    } else {
        const world = await getWorldBio("id", id);
        if (world) {
            if (author) {
                const isAuthor = author === world.author;
                res.send({ isAuthor });
            } else {
                res.send(world);
            }
        } else {
            res.status(404).json({ error: "World not found" });
        }
    }
});

// 🚀 Router: Create a new world
worldsRouter.post(`${urlPrefix}`, verifyAuth, async (req, res) => {
    const { name, author, Description, MagicSystems, Races, Flora, Wildlife, Biomes, Continents, Countries, Religion, Organizations, Sections } = req.body;
    const id = createID(name, author);
    
    // Check if the world already exists
    if (await getWorld("id", id)) {
        return res.status(409).send({ msg: `A world entry by you with the name "${name}" already exists.` });
    }

    // Create new world using createWorld function
    const newWorld = await createWorld(req.body, id);

    // Modify references for related entities (magic systems, biomes, flora, wildlife, etc.)
    if (MagicSystems && MagicSystems.length > 0) {
        for (const magicSystemId of MagicSystems) {
            await modifyMagicSystem(magicSystemId, "add", {
                id: newWorld.id,
                path: newWorld.url,
                value: newWorld.name
            });
        }
    }

    if (Biomes && Biomes.length > 0) {
        for (const biomeId of Biomes) {
            await modifyBiome(biomeId, "add", {
                id: newWorld.id,
                path: newWorld.url,
                value: newWorld.name
            });
        }
    }

    if (Flora && Flora.length > 0) {
        for (const floraId of Flora) {
            await modifyFlora(floraId, "add", {
                id: newWorld.id,
                path: newWorld.url,
                value: newWorld.name
            });
        }
    }

    if (Wildlife && Wildlife.length > 0) {
        for (const wildlifeId of Wildlife) {
            await modifyWildlife(wildlifeId, "add", {
                id: newWorld.id,
                path: newWorld.url,
                value: newWorld.name
            });
        }
    }

    if (Organizations && Organizations.length > 0) {
        for (const organizationId of Organizations) {
            await modifyOrganization(organizationId, "add", {
                id: newWorld.id,
                path: newWorld.url,
                value: newWorld.name
            });
        }
    }

    if (Religion && Religion.length > 0) {
        for (const religionId of Religion) {
            await modifyOrganization(religionId, "add", {
                id: newWorld.id,
                path: newWorld.url,
                value: newWorld.name
            });
        }
    }

    if (Countries && Countries.length > 0) {
        for (const countryId of Countries) {
            await modifyCountry(countryId, "add", {
                id: newWorld.id,
                path: newWorld.url,
                value: newWorld.name
            });
        }
    }

    res.status(201).json(newWorld); // Respond with created world
});

// 🚀 Router: Modify an existing world (author check)
worldsRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    const world = await getWorldBio("id", id);
    if (!world) {
        return res.status(404).json({ error: "World not found" });
    }

    // Ensure the author is the original author
    if (world.author !== req.username) {
        return res.status(403).json({ error: "You do not have permission to update this world." });
    }

    // Update world details
    Object.assign(world, body);

    res.send({ message: `World ${id} updated successfully` });
});

// 🚀 Router: Modify world references (e.g., add/remove magic systems, biomes, flora, etc.)
worldsRouter.patch(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const { method, data } = req.body;

    const world = await getWorldBio("id", id);
    if (!world) {
        return res.status(404).json({ error: "World not found" });
    }

    // Ensure the author is the original author
    if (world.author !== req.username) {
        return res.status(403).json({ error: "You do not have permission to modify references in this world." });
    }

    // Modify magic systems references
    if (data && data.magicSystems) {
        for (const magicSystemId of data.magicSystems) {
            await modifyMagicSystems(magicSystemId, method, {
                id: world.id,
                path: world.url,
                value: world.name
            });
        }
    }

    // Modify biomes references
    if (data && data.biomes) {
        for (const biomeId of data.biomes) {
            await modifyBiome(biomeId, method, {
                id: world.id,
                path: world.url,
                value: world.name
            });
        }
    }

    // Modify flora references
    if (data && data.flora) {
        for (const floraId of data.flora) {
            await modifyFlora(floraId, method, {
                id: world.id,
                path: world.url,
                value: world.name
            });
        }
    }

    // Modify wildlife references
    if (data && data.wildlife) {
        for (const wildlifeId of data.wildlife) {
            await modifyWildlife(wildlifeId, method, {
                id: world.id,
                path: world.url,
                value: world.name
            });
        }
    }

    // Modify organizations references
    if (data && data.organizations) {
        for (const organizationId of data.organizations) {
            await modifyOrganization(organizationId, method, {
                id: world.id,
                path: world.url,
                value: world.name
            });
        }
    }

    // Modify religions references
    if (data && data.religions) {
        for (const religionId of data.religions) {
            await modifyOrganization(religionId, method, {
                id: world.id,
                path: world.url,
                value: world.name
            });
        }
    }

    // Modify countries references
    if (data && data.countries) {
        for (const countryId of data.countries) {
            await modifyCountry(countryId, method, {
                id: world.id,
                path: world.url,
                value: world.name
            });
        }
    }

    res.send({ message: `World references updated successfully` });
});

// ✅ Create a new world
async function createWorld(worldData, id) {
    const worldURL = urlPrefix + id;
    const created = new Date().toJSON();

    const worldBio = {
        id: id,
        name: worldData.name,
        url: worldURL,
        author: worldData.author,
        infoCard: {
            name: worldData.name,
            cardData: [
                { label: "Author", value: worldData.author },
                { label: "Countries", value: worldData.Countries, source: "/worldbuilding/countries", edit: "multi-select" },
                { label: "Continents", value: worldData.Continents, source: "/worldbuilding/countries", categoryLabel: "Continent" }
            ],
            created: created,
            description: worldData.Description
        },
        listSections: [
            { label: "Organizations", source: `/api/worldbuilding/organizations?worlds=${id}`, canModifyReferences: true },
            { label: "Magic Systems", source: `/api/worldbuilding/magicsystems?worlds=${id}`, canModifyReferences: true },
            { label: "Races", source: `/api/worldbuilding/races?worlds=${id}`, canModifyReferences: true },
            { label: "Flora", source: `/api/worldbuilding/flora?worlds=${id}`, canModifyReferences: true },
            { label: "Wildlife", source: `/api/worldbuilding/wildlife?worlds=${id}`, canModifyReferences: true },
            { label: "Biomes", source: `/api/worldbuilding/biomes?worlds=${id}`, canModifyReferences: true }
        ]
    };

    // Format the world for the list
    const worldList = {
        id: id,
        name: worldData.name,
        url: worldURL,
        author: worldData.author,
        details: [
            { label: "name", value: worldData.name, path: worldURL, location: "head", filter: false },
            { label: "author", value: worldData.author }
        ]
    };

    // Store world in the world list
    worlds.push(worldList);
    worldBios.push(worldBio);
    return worldBio;
}

module.exports = worldsRouter;
