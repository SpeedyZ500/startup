const express = require('express');
const { verifyAuth, createID } = require('./../service.js');
const { modifyWildlife } = require('./wildlife'); // Import modifyWildlife
const { modifyFlora } = require('./flora'); // Import modifyFlora
const { modifyCharacters } = require('./../characters'); // Import modifyCharacters
const urlPrefix = "/worldbuilding/countries/";

const countriesRouter = express.Router();

let countries = [];
let countryBios = [];

// Function to get country by a specific field
async function getCountry(field, value) {
    if (value) {
        return countries.find((country) => country[field] === value);
    }
    return null;
}

// Function to get country bio by a specific field
async function getCountryBio(field, value) {
    if (value) {
        return countryBios.find((country) => country[field] === value);
    }
    return null;
}

// Function to filter countries based on queries
async function getCountries(queries) {
    if (typeof queries === "object") {
        let filterCountries = countries;
        for (const [key, value] of Object.entries(queries)) {
            if (Array.isArray(value)) {
                filterCountries = filterCountries.filter((country) =>
                    Array.isArray(country[key])
                        ? country[key].some((el) => value.includes(el))
                        : value.includes(country[key])
                );
            } else {
                filterCountries = filterCountries.filter((country) =>
                    Array.isArray(country[key])
                        ? country[key].includes(value)
                        : value === country[key]
                );
            }
        }
        return filterCountries;
    } else {
        return countries;
    }
}

// Route: Get country or list of countries
countriesRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const { author } = req.query || "";
    const queries = req.query || {};

    if (!id || id === "undefined" || id.trim() === "") {
        if (Object.keys(queries).length > 0) {
            let countriesToSend = await getCountries(queries);
            res.send(countriesToSend);
        } else {
            res.send(countries);
        }
    } else {
        if (id === "types") {
            res.send(countryTypes);
        } else {
            const country = await getCountryBio("id", id);
            if (country) {
                if (author) {
                    const isAuthor = author === country.author;
                    res.send({ isAuthor });
                } else {
                    res.send(country);
                }
            } else {
                res.status(404).json({ error: "Country not found" });
            }
        }
    }
});

// Route: Create new country
countriesRouter.post(`${urlPrefix}`, verifyAuth, async (req, res) => {
    const { name, author, Worlds, Leaders, Biomes, Sections } = req.body;
    const id = createID(name, author);

    if (await getCountry("id", id)) {
        return res.status(409).send({ msg: `A Country entry by you with the name "${name}" already exists.` });
    }

    const newCountry = await createCountry(req.body, id);

    // Add references to wildlife and flora using modifyWildlife and modifyFlora
    if (Leaders && Leaders.length > 0) {
        for (const leaderId of Leaders) {
            await modifyCharacters(leaderId, "add", {
                id: newCountry.id,
                path: newCountry.url,
                value: newCountry.name
            });
        }
    }

    res.status(201).json(newCountry); // Respond with created country
});

// Route: Modify an existing country (author check)
countriesRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    const countryBio = await getCountryBio("id", id); // Fetch the countryBio by its ID
    if (!countryBio) {
        return res.status(404).json({ error: "CountryBio not found" });
    }

    // Ensure the author is the original author
    if (countryBio.author !== req.username) {
        return res.status(403).json({ error: "You do not have permission to update this country." });
    }

    // Update countryBio details
    await updateCountryBio(id, body);

    res.send({ message: `Country ${id} updated successfully` });
});

// Route: Modify country references (e.g., add/remove wildlife, flora)
countriesRouter.patch(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const { method, data } = req.body;

    const countryBio = await getCountryBio("id", id); // Fetch the countryBio by its ID
    if (!countryBio) {
        return res.status(404).json({ error: "CountryBio not found" });
    }

    // Ensure the author is the original author
    if (countryBio.author !== req.username) {
        return res.status(403).json({ error: "You do not have permission to modify references in this country." });
    }

    // Modify wildlife references
    if (data && data.wildlife) {
        for (const wildlifeId of data.wildlife) {
            await modifyWildlife(wildlifeId, method, {
                id: countryBio.id,
                path: countryBio.url,
                value: countryBio.name
            });
        }
    }

    // Modify flora references
    if (data && data.flora) {
        for (const floraId of data.flora) {
            await modifyFlora(floraId, method, {
                id: countryBio.id,
                path: countryBio.url,
                value: countryBio.name
            });
        }
    }

    // Modify character references (e.g., leaders)
    if (data && data.leaders) {
        for (const leaderId of data.leaders) {
            await modifyCharacters(leaderId, method, {
                id: countryBio.id,
                path: countryBio.url,
                value: countryBio.name
            });
        }
    }

    res.send({ message: `Country references updated successfully` });
});

// ✅ Create a new country
async function createCountry(countryData, id) {
    const countryURL = urlPrefix + id;
    const created = new Date().toJSON();

    const countryBio = {
        id: id,
        name: countryData.name,
        url: countryURL,
        author: countryData.author,
        infoCard: {
            name: countryData.name,
            cardData: [
                { label: "Author", value: countryData.author },
                { label: "World", value: countryData.Worlds, source: "/worldbuilding/worlds", edit: "multi-select" },
                { label: "Leaders", value: countryData.Leaders, source: "/worldbuilding/characters", edit: "multi-select" },
                { label: "Biomes", value: countryData.Biomes, source: "/worldbuilding/biomes", edit: "multi-select" }
            ],
            created: created,
            modified: created
        },
        description: countryData.Description,
        sections: countryData.Sections || [],
        listSections: [
            {
                label: "Wildlife",
                query: `/wildlife?countries=${id}`,
                canModifyReferences: true
            },
            {
                label: "Flora",
                query: `/flora?countries=${id}`,
                canModifyReferences: true
            }
        ]
    };

    const country = {
        id: id,
        name: countryData.name,
        url: countryURL,
        author: countryData.author,
        worlds: countryData.Worlds || [], // Store list of world IDs
        leaders: countryData.Leaders || [], // Store list of leader IDs
        biomes: countryData.Biomes || [], // Store list of biome IDs
        details: [
            { label: "name", value: countryData.name, path: countryURL, location: "head", filter: false },
            { label: "author", value: countryData.author }
        ]
    };

    countries.push(country);  // Store country object with lists of IDs
    countryBios.push(countryBio); // Store countryBio object

    return country;
}

// ✅ Update a countryBio
async function updateCountryBio(id, updateData) {
    const countryBio = countryBios.find(c => c.id === id);

    if (!countryBio) {
        console.error(`CountryBio with ID '${id}' not found.`);
        return;
    }

    // Retrieve current values from countryBio infoCard cardData
    const worldLabel = countryBio.infoCard.cardData.find((field) => field.label === "World");
    const leadersLabel = countryBio.infoCard.cardData.find((field) => field.label === "Leaders");
    const biomesLabel = countryBio.infoCard.cardData.find((field) => field.label === "Biomes");

    const worldValue = worldLabel ? worldLabel.value : null;
    const leadersValue = leadersLabel ? leadersLabel.value : [];
    const biomesValue = biomesLabel ? biomesLabel.value : [];

    // Destructure updateData
    const { description, infoCard, sections } = updateData;

    if (description) {
        countryBio.description = description;
    }

    if (infoCard) {
        // Update countryBio infoCard and cardData based on provided infoCard object
        if (infoCard.cardData) {
            countryBio.infoCard.cardData = infoCard.cardData;

            // Retrieve and set updated values for Worlds, Leaders, and Biomes from new cardData
            const updatedWorldLabel = infoCard.cardData.find((field) => field.label === "World");
            const updatedLeadersLabel = infoCard.cardData.find((field) => field.label === "Leaders");
            const updatedBiomesLabel = infoCard.cardData.find((field) => field.label === "Biomes");

            countryBio.worlds = updatedWorldLabel ? updatedWorldLabel.value : worldValue; // Fall back to existing value if not updated
            countryBio.leaders = updatedLeadersLabel ? updatedLeadersLabel.value : leadersValue; // Same here
            countryBio.biomes = updatedBiomesLabel ? updatedBiomesLabel.value : biomesValue; // Same here
        }
    }

    if (sections) {
        countryBio.sections = sections;
    }

    // After updating the countryBio, you might want to perform additional actions like updating associated leaders, biomes, or other relationships.
}

async function modifyCountry(id, data, method) {
    const { worldId, leaderId, path, value } = data;

    const country = await getCountry("id", id);
    
    if (!country) {
        console.error(`Country with ID '${id}' not found.`);
        return { error: "Country not found" };
    }

    if (method === "add") {
        if (leaderId) {
            // Add to leaders
            if (!country.Leaders.includes(leaderId)) {
                country.Leaders.push(leaderId);
            }
        }

        if (worldId) {
            // Add to worlds (ensure unique)
            if (!country.Worlds.includes(worldId)) {
                country.Worlds.push(worldId);
                // If other worlds exist, tag as multi-world
                if (country.Other_Worlds.length > 0) {
                    country.infoCard.cardData.find((field) => field.label === "Classification").value = "multi-world";
                }
            }
        }
    } else if (method === "delete") {
        if (leaderId) {
            const index = country.Leaders.indexOf(leaderId);
            if (index > -1) {
                country.Leaders.splice(index, 1);
            }
        }

        if (worldId) {
            const index = country.Worlds.indexOf(worldId);
            if (index > -1) {
                country.Worlds.splice(index, 1);
                // If no other worlds, revert to uni-world
                if (country.Other_Worlds.length === 0) {
                    country.infoCard.cardData.find((field) => field.label === "Classification").value = "uni-world";
                }
            }
        }
    }

    return country;
}


module.exports = {countriesRouter, modifyCountry};
