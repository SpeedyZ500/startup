const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/biomes/"

const biomesRouter = express.Router();

let biomes = [];
let biomeBios = [];

async function getBiome(field, value) {
    if (value) {
        return biomes.find((biome) => biome[field] === value);
    }
    return null;
}

async function getBiomeBio(field, value) {
    if (value) {
        return biomeBios.find((biome) => biome[field] === value);
    }
    return null;
}

async function getBiomes(queries) {
    if (typeof queries === "object") {
        let filterBiomes = biomes;
        for (const [key, value] of Object.entries(queries)) {
            if (Array.isArray(value)) {
                filterBiomes = filterBiomes.filter((biome) =>
                    Array.isArray(biome[key])
                        ? biome[key].some((el) => value.includes(el))
                        : value.includes(biome[key])
                );
            } else {
                filterBiomes = filterBiomes.filter((biome) =>
                    Array.isArray(biome[key])
                        ? biome[key].includes(value)
                        : value === biome[key]
                );
            }
        }
        return filterBiomes;
    } else {
        return biomes;
    }
}


biomesRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const { author } = req.query || "";  
    const queries = req.query || {};

    if (!id || id === "undefined" || id.trim() === "") {
        if (Object.keys(queries).length > 0) {
            let biomesToSend = await getBiomes(queries);
            res.send(biomesToSend);
        } else {
            res.send(biomes);
        }
    } else {
        if (id === "types") {
            res.send(biomeTypes);
        } else {
            const biome = await getBiomeBio("id", id);
            if (biome) {
                if (author) {
                    const isAuthor = author === biome.author;
                    res.send({ isAuthor });
                } else {
                    res.send(biome);
                }
            } else {
                res.status(404).json({ error: "Biome not found" });
            }
        }
    }
});



module.exports = biomesRouter;
