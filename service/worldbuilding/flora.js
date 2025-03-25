const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/flora/"

const floraRouter = express.Router();
let flora = [];
let floraBios = [];
let floraClassifications = [
    "Magic Tree"
]
async function getFlora(field, value) {
    if (value) {
        return flora.find((plant) => plant[field] === value);
    }
    return null;
}

async function getFloraBio(field, value) {
    if (value) {
        return floraBios.find((plant) => plant[field] === value);
    }
    return null;
}

async function getFloraList(queries) {
    if (typeof queries === "object") {
        let filterFlora = flora;
        for (const [key, value] of Object.entries(queries)) {
            if (Array.isArray(value)) {
                filterFlora = filterFlora.filter((plant) =>
                    Array.isArray(plant[key])
                        ? plant[key].some((el) => value.includes(el))
                        : value.includes(plant[key])
                );
            } else {
                filterFlora = filterFlora.filter((plant) =>
                    Array.isArray(plant[key])
                        ? plant[key].includes(value)
                        : value === plant[key]
                );
            }
        }
        return filterFlora;
    } else {
        return flora;
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
            res.send(flora);
        }
    } else {
        if (id === "types") {
            res.send(floraTypes);
        } else {
            const plant = await getFloraBio("id", id);
            if (plant) {
                if (author) {
                    const isAuthor = author === plant.author;
                    res.send({ isAuthor });
                } else {
                    res.send(plant);
                }
            } else {
                res.status(404).json({ error: "Flora not found" });
            }
        }
    }
});


module.exports = floraRouter;
