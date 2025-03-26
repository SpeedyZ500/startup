const express = require('express');
const { verifyAuth, createID } = require('./../service.js');
const urlPrefix = "/worldbuilding/magicsystems/";


const magicRouter = express.Router();

let magicSystems = [];
let magicSystemBios = [];
let magicTypes = ["Alchemical", "Dimensional", "Technological", "Elemental", "Transformational"];

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

// 🚀 Router: Fetch magic systems or individual magic system
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

// 🚀 Router: Create a new magic system
magicRouter.post(`${urlPrefix}`, verifyAuth, async (req, res) => {
    const id = createID(req.body.name, req.body.author);
    if (await getMagicSystem("id", id)) {
        return res.status(409).send({ msg: `A Magic System entry by you with the name "${name}" already exists.` });
    }
    const newMagicSystem = await createMagicSystem(req.body, id);
    res.send(newMagicSystem);
});

// 🚀 Router: Update an existing magic system (with author check)
magicRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Ensure the author is the original author
    const magicSystem = await getMagicSystemBio("id", id);
    if (magicSystem.author !== req.user.id) {
        return res.status(403).json({ error: "You do not have permission to update this magic system." });
    }

    await updateMagicSystem(id, updateData);
    res.send({ message: `Magic System ${id} updated successfully` });
});

// 🚀 Router: Modify a magic system field (add/put/delete references)
magicRouter.patch(`${urlPrefix}:id/:list`, verifyAuth, async (req, res) => {
    const { id, list } = req.params;
    const { method, data } = req.body;

    const result = await modifyMagicSystem(id, list, data, method);

    if (result.error) {
        res.status(404).json(result);
    } else {
        res.send(result);
    }
});

// ✅ Create a new magic system
async function createMagicSystem(magicSystemData, id) {
    const magicSystemURL = urlPrefix + id;
    const created = new Date().toJSON();

    const magicSystemBio = {
        id: id,
        name: magicSystemData.name,
        url: magicSystemURL,
        author: magicSystemData.author,
        infoCard: {
            name: magicSystemData.name,
            cardData: [
                { label: "Author", value: magicSystemData.author },
                { label: "Worlds", value: magicSystemData.Worlds, source: "/worldbuilding/worlds", edit: "multi-select" },
                { label: "Type", value: magicSystemData.Type, source: "/worldbuilding/magicsystems/types", edit: "creatable" }
            ],
            created: created,
            modified: created
        },
        description: magicSystemData.Description,
        sections: magicSystemData.sections || [],
        listSections: [
            {
                label: "Practitioners",
                query: `/characters?abilities=${id}`,
                canModifyReferences: false
            },
            {
                label: "Magical Creatures",
                query: `/wildlife?abilities=${id}`,
                canModifyReferences: false
            },
            {
                label: "Flora with Magical Properties",
                query: `/flora?properties=${id}`,
                canModifyReferences: false
            }
        ]
    };

    await addTypes(magicSystemData.Type);
    magicSystemBios.push(magicSystemBio);

    const magicSystem = {
        id: id,
        name: magicSystemData.name,
        url: magicSystemURL,
        author: magicSystemData.author,
        description: magicSystemData.Description,
        worlds: magicSystemData.Worlds?.map(world => world.id) || [],
        type: magicSystemData.Type || [],
        details: [
            { label: "name", value: magicSystemData.name, path: magicSystemURL, location: "head", filter: false },
            { label: "author", value: magicSystemData.author },
            { label: "type", value: magicSystemData.Type || [] },
            { label: "Created", value: created, display: false, filter: false }
        ]
    };

    magicSystems.push(magicSystem);
    return magicSystem;
}

// ✅ Add new types dynamically
async function addTypes(type) {
    if (Array.isArray(type)) {
        type.forEach((item) => {
            if (!magicTypes.includes(item)) {
                magicTypes.push(item);
            }
        });
    } else {
        if (!magicTypes.includes(type)) {
            magicTypes.push(type);
        }
    }
    return "done";
}

// ✅ Update magic system data
async function updateMagicSystem(id, updateData) {
    const { description, infoCard, sections } = updateData;
    const magicSystemBio = await getMagicSystemBio("id", id);
    const magicSystem = await getMagicSystem("id", id);

    if (!magicSystemBio || !magicSystem) {
        console.error(`Magic System with ID '${id}' not found.`);
        return;
    }

    if (description && description !== magicSystemBio.description) {
        magicSystemBio.description = description;
        magicSystem.description = description;
    }

    if (infoCard) {
        magicSystemBio.infoCard = infoCard;
        magicSystem.name = infoCard.name;
    }

    if (sections) {
        magicSystemBio.sections = sections;
    }

    const bioIndex = magicSystemBios.findIndex(b => b.id === id);
    const magicSystemIndex = magicSystems.findIndex(m => m.id === id);

    magicSystemBios[bioIndex] = magicSystemBio;
    magicSystems[magicSystemIndex] = magicSystem;
}

// ✅ Modify a magic system (add/put/delete references)
async function modifyMagicSystem(magicSystemID, list, data, method) {
    const { id, value, path } = data;

    const magicSystemBio = await getMagicSystemBio("id", magicSystemID);
    const magicSystem = await getMagicSystem("id", magicSystemID);

    if (!magicSystemBio || !magicSystem) {
        console.error(`Magic System with ID '${magicSystemID}' not found.`);
        return { error: "Magic System not found" };
    }

    const bioList = magicSystemBio.infoCard.cardData.find(item => item.label.toLowerCase() === list.toLowerCase());
    const magicSystemList = magicSystem[list.toLowerCase()];

    if (!bioList || !magicSystemList) {
        console.error(`List '${list}' not found.`);
        return { error: `List '${list}' not found.` };
    }

    const newItem = { value, id, path };

    if (method === 'add' || method === 'put') {
        if (!magicSystemList.some(item => item.id === id)) {
            magicSystemList.push(newItem);
        }
        if (!bioList.value.some(item => item.id === id)) {
            bioList.value.push(newItem);
        }
    } else if (method === 'delete') {
        magicSystemList.splice(magicSystemList.findIndex(item => item.id === id), 1);
        bioList.value.splice(bioList.value.findIndex(item => item.id === id), 1);
    }

    return { message: `Magic System '${list}' modified successfully`, magicSystem };
}

module.exports = {magicRouter,modifyMagicSystem};
