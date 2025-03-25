const express = require('express');
const { verifyAuth, createID} = require('./../service.js');  
const urlPrefix = "/worldbuilding/organizations/"

const organizationsRouter = express.Router();
let organizations = [];
let organizationBios = []
let organizationTypes = ["Religion"]

async function getOrganization(field, value) {
    if (value) {
        return organizations.find((organization) => organization[field] === value);
    }
    return null;
}

async function getOrganizationBio(field, value) {
    if (value) {
        return organizationBios.find((organization) => organization[field] === value);
    }
    return null;
}

async function getOrganizations(queries) {
    if (typeof queries === "object") {
        let filterOrganizations = organizations;
        for (const [key, value] of Object.entries(queries)) {
            if (Array.isArray(value)) {
                filterOrganizations = filterOrganizations.filter((organization) =>
                    Array.isArray(organization[key])
                        ? organization[key].some((el) => value.includes(el))
                        : value.includes(organization[key])
                );
            } else {
                filterOrganizations = filterOrganizations.filter((organization) =>
                    Array.isArray(organization[key])
                        ? organization[key].includes(value)
                        : value === organization[key]
                );
            }
        }
        return filterOrganizations;
    } else {
        return organizations;
    }
}


organizationsRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const { author } = req.query || ""; 
    const queries = req.query || {};

    if (!id || id === "undefined" || id.trim() === "") {
        if (Object.keys(queries).length > 0) {
            let organizationsToSend = await getOrganizations(queries);
            res.send(organizationsToSend);
        } else {
            res.send(organizations);
        }
    } else {
        if (id === "types") {
            res.send(organizationTypes);
        } else {
            const organization = await getOrganizationBio("id", id);
            if (organization) {
                if (author) {
                    const isAuthor = author === organization.author;
                    res.send({ isAuthor });
                } else {
                    res.send(organization);
                }
            } else {
                res.status(404).json({ error: "Organization not found" });
            }
        }
    }
});

module.exports = organizationsRouter;