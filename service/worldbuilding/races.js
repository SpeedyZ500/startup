const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/races/"

const racesRouter = express.Router();

let races = [];
let raceBios = [];
let raceTypes = ["sudo-shape-shifter"]

async function getRace(field, value) {
    if (value) {
        return races.find((race) => race[field] === value);
    }
    return null;
}

async function getRaceBio(field, value) {
    if (value) {
        return raceBios.find((race) => race[field] === value);
    }
    return null;
}

async function getRaces(queries) {
    if (typeof queries === "object") {
        let filterRaces = races;
        for (const [key, value] of Object.entries(queries)) {
            if (Array.isArray(value)) {
                filterRaces = filterRaces.filter((race) =>
                    Array.isArray(race[key])
                        ? race[key].some((el) => value.includes(el))
                        : value.includes(race[key])
                );
            } else {
                filterRaces = filterRaces.filter((race) =>
                    Array.isArray(race[key])
                        ? race[key].includes(value)
                        : value === race[key]
                );
            }
        }
        return filterRaces;
    } else {
        return races;
    }
}




racesRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const { author } = req.query || "";  
    const queries = req.query || {};

    if (!id || id === "undefined" || id.trim() === "") {
        if (Object.keys(queries).length > 0) {
            let racesToSend = await getRaces(queries);
            res.send(racesToSend);
        } else {
            res.send(races);
        }
    } else {
        if (id === "types") {
            res.send(raceTypes);
        } else {
            const race = await getRaceBio("id", id);
            if (race) {
                if (author) {
                    const isAuthor = author === race.author;
                    res.send({ isAuthor });
                } else {
                    res.send(race);
                }
            } else {
                res.status(404).json({ error: "Race not found" });
            }
        }
    }
});


module.exports = racesRouter;