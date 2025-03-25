const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/worlds/"

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

async function getWorlds(queries) {
    if (typeof queries === "object") {
        let filterWorlds = worlds;
        for (const [key, value] of Object.entries(queries)) {
            if (Array.isArray(value)) {
                filterWorlds = filterWorlds.filter((world) =>
                    Array.isArray(world[key])
                        ? world[key].some(w => value.includes(w))
                        : value.includes(world[key])
                );
            } else {
                filterWorlds = filterWorlds.filter((world) =>
                    Array.isArray(world[key])
                        ? world[key].includes(value)
                        : value === world[key]
                );
            }
        }
        return filterWorlds;
    } else {
        return worlds;
    }
}

worldsRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const {author} = req.query || "";
    const queries = req.query || {};
    if (!id || id === "undefined" || id.trim() === "") {
        if (Object.keys(queries).length > 0) {
            let worldsToSend = await getWorlds(queries);
            res.send(worldsToSend);
        } else {
            res.send(worlds);
        }
    } else {
        if (id === "types") {
            res.send(worldTypes);
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
    }
});



module.exports = worldsRouter;