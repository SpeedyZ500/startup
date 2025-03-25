const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/wildlife/"

const wildlifeRouter = express.Router();
let wildlife = [];
let wildlifeBios = [];
let wildlifeClassifications = [
    "Monster"
]

async function getWildlife(field, value) {
    if (value) {
        return wildlife.find((wild) => wild[field] === value);
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
        let filterWildlife = wildlife;
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
            res.send(wildlife);
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


module.exports = wildlifeRouter;