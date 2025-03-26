const express = require('express');
const { verifyAuth, createID } = require('./../service.js');
const urlPrefix = "/worldbuilding/races/";

const racesRouter = express.Router();

let races = [];
let raceBios = [];
let raceTypes = ["sudo-shape-shifter"];

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

// 🚀 Router: Fetch races or individual race
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

// 🚀 Router: Create a new race
racesRouter.post(`${urlPrefix}`, verifyAuth, async (req, res) => {
    const id = createID(req.body.name, req.body.author);
    if (await getRace("id", id)) {
        return res.status(409).send({ msg: `A Race entry by you with the name "${name}" already exists.` });
    }
    const newRace = await createRace(req.body, id);
    res.send(newRace);
});

// 🚀 Router: Update an existing race
racesRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Get the race bio and the race itself
    const raceBio = await getRaceBio("id", id);
    const race = await getRace("id", id);

    // Ensure race and raceBio exist and that the current user is the author
    if (!raceBio || !race) {
        return res.status(404).json({ error: `Race with ID '${id}' not found` });
    }

    if (race.author !== req.username) {
        return res.status(403).json({ error: "You do not have permission to update this race" });
    }

    // Proceed with the update if ownership matches
    await updateRace(id, updateData);
    res.send({ message: `Race ${id} updated successfully` });
});


// 🚀 Router: Modify a race field (add/put/delete references)
racesRouter.patch(`${urlPrefix}:id/:list`, verifyAuth, async (req, res) => {
    const { id, list } = req.params;
    const { method, data } = req.body;

    const result = await modifyRace(id, list, data, method);

    if (result.error) {
        res.status(404).json(result);
    } else {
        res.send(result);
    }
});

// ✅ Create a new race
async function createRace(raceData, id) {
    const raceURL = urlPrefix + id;
    const created = new Date().toJSON();

    const raceBio = {
        id: id,
        name: raceData.name,
        url: raceURL,
        author: raceData.author,
        infoCard: {
            name: raceData.name,
            cardData: [
                { label: "Author", value: raceData.author },
                { label: "Worlds", value: raceData.Worlds, source: "/worldbuilding/worlds", edit: "multi-select" },
                { label: "Countries", value: raceData.Countries, source: "/worldbuilding/countries", edit: "multi-select" },
                { label: "Abilities", value: raceData.Abilities, source: "/worldbuilding/magicsystems", edit: "multi-select" },
                { label: "Type", value: raceData.Type, source: "/worldbuilding/races/types", edit: "creatable" }
            ],
            created: created,
            modified: created
        },
        description: raceData.Description,
        sections: raceData.sections || [],
        listSections: [
            {
                label:"Members of this Race",
                query: `/characters?races=${id}`,
                canModifyReferences: false
            }
        ]
    };

    await addTypes(raceData.Type);
    raceBios.push(raceBio);

    const race = {
        id: id,
        name: raceData.name,
        url: raceURL,
        author: raceData.author,
        description: raceData.Description,
        abilities: raceData.Abilities?.map(abil => abil.id) || [],
        worlds: raceData.Worlds?.map(world => world.id) || [],
        countries: raceData.Countries?.map(country => country.id) || [],
        type: raceData.Type || [],
        details: [
            { label: "name", value: raceData.name, path: raceURL, location: "head", filter: false },
            { label: "author", value: raceData.author },
            { label: "type", value: raceData.Type || [] },
            { label: "Created", value: created, display: false, filter: false }
        ]
    };

    races.push(race);
    return race;
}

// ✅ Add new types dynamically
async function addTypes(type) {
    if (Array.isArray(type)) {
        type.forEach((item) => {
            if (!raceTypes.includes(item)) {
                raceTypes.push(item);
            }
        });
    } else {
        if (!raceTypes.includes(type)) {
            raceTypes.push(type);
        }
    }
    return "done";
}

// ✅ Update race data
async function updateRace(id, updateData) {
    const { description, infoCard, sections } = updateData;
    const raceBio = await getRaceBio("id", id);
    const race = await getRace("id", id);

    if (!raceBio || !race) {
        console.error(`Race with ID '${id}' not found.`);
        return;
    }

    if (description && description !== raceBio.description) {
        raceBio.description = description;
        race.description = description;
    }

    if (infoCard) {
        raceBio.infoCard = infoCard;
        race.name = infoCard.name;
    }

    if (sections) {
        raceBio.sections = sections;
    }

    const bioIndex = raceBios.findIndex(b => b.id === id);
    const raceIndex = races.findIndex(r => r.id === id);

    raceBios[bioIndex] = raceBio;
    races[raceIndex] = race;
}

// ✅ Modify a race (add/put/delete references)
async function modifyRace(raceID, list, data, method) {
    const { id, value, path } = data;

    const raceBio = await getRaceBio("id", raceID);
    const race = await getRace("id", raceID);

    if (!raceBio || !race) {
        console.error(`Race with ID '${raceID}' not found.`);
        return { error: "Race not found" };
    }

    const bioList = raceBio.infoCard.cardData.find(item => item.label.toLowerCase() === list.toLowerCase());
    const raceList = race[list.toLowerCase()];

    if (!bioList || !raceList) {
        console.error(`List '${list}' not found.`);
        return { error: `List '${list}' not found.` };
    }

    const newItem = { value, id, path };

    if (method === 'add' || method === 'put') {
        if (!raceList.some(item => item.id === id)) {
            raceList.push(newItem);
        }
        if (!bioList.value.some(item => item.id === id)) {
            bioList.value.push(newItem);
        }
    } else if (method === 'delete') {
        raceList.splice(raceList.findIndex(item => item.id === id), 1);
        bioList.value.splice(bioList.value.findIndex(item => item.id === id), 1);
    }

    return { message: `Race '${list}' modified successfully`, race };
}

module.exports = racesRouter;
