const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/countries/"

const countriesRouter = express.Router();

let countries = [];
let countryBios = [];

async function getCountry(field, value) {
    if (value) {
        return countries.find((country) => country[field] === value);
    }
    return null;
}

async function getCountryBio(field, value) {
    if (value) {
        return countryBios.find((country) => country[field] === value);
    }
    return null;
}

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


module.exports = countriesRouter;
