const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/magicsystems/"
const magicRouter = express.Router();

let magicSystems = [];
let magicSystemBios = [];
let magicTypes = [
    "Alchemical", 
    "Dimensional", 
    "Technological", 
    "Elemental",
    "Transformational"
]

async function getMagicSystem(field, value) {
    if (value) {
        return magicSystems.find((magicSystem) => magicSystem[field] === value);
    }
    return null;
}

async function getMagicSystemBio(field, value) {
    if (value) {
        return magicSystemBios.find((magicSystem) => magicSystem[field] === value);
    }
    return null;
}

async function getMagicSystems(queries) {
    if (typeof queries === "object") {
        let filterMagicSystems = magicSystems;
        for (const [key, value] of Object.entries(queries)) {
            if (Array.isArray(value)) {
                filterMagicSystems = filterMagicSystems.filter((magicSystem) =>
                    Array.isArray(magicSystem[key])
                        ? magicSystem[key].some((el) => value.includes(el))
                        : value.includes(magicSystem[key])
                );
            } else {
                filterMagicSystems = filterMagicSystems.filter((magicSystem) =>
                    Array.isArray(magicSystem[key])
                        ? magicSystem[key].includes(value)
                        : value === magicSystem[key]
                );
            }
        }
        return filterMagicSystems;
    } else {
        return magicSystems;
    }
}


magicRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const { author } = req.query || "";  
    const queries = req.query || {};

    if (!id || id === "undefined" || id.trim() === "") {
        if (Object.keys(queries).length > 0) {
            let magicSystemsToSend = await getMagicSystems(queries);
            res.send(magicSystemsToSend);
        } else {
            res.send(magicSystems);
        }
    } else {
        if (id === "types") {
            res.send(magicTypes);
        } else {
            const magicSystem = await getMagicSystemBio("id", id);
            if (magicSystem) {
                if (author) {
                    const isAuthor = author === magicSystem.author;
                    res.send({ isAuthor });
                } else {
                    res.send(magicSystem);
                }
            } else {
                res.status(404).json({ error: "Magic System not found" });
            }
        }
    }
});



module.exports = magicRouter;
