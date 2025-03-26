const express = require('express');
const { verifyAuth, createID } = require('./../service.js');
const {modifyCharacter} = require(`./../characters.js`)
const urlPrefix = "/worldbuilding/organizations/";

const organizationsRouter = express.Router();
let organizations = [];
let organizationTypes = ["Religious", "Political", "Military", "Social", "Other"];

async function getOrganization(field, value) {
    if (value) {
        return organizations.find((organization) => organization[field] === value);
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

// 🚀 Router: Fetch organizations or individual organization
organizationsRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
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
            return res.send(organizationTypes);
        } else {
            const organization = await getOrganization("id", id);
            if (organization) {
                res.send(organization);
            } else {
                res.status(404).json({ error: "Organization not found" });
            }
        }
    }
});

// 🚀 Router: Create a new organization
organizationsRouter.post(`${urlPrefix}`, verifyAuth, async (req, res) => {
    const { name, author, World, Other_Worlds, Type, Leaders, description, Goals, Sections } = req.body;

    // Check if organization by the same author and name exists
    if (await getOrganization("name", name)) {
        return res.status(409).send({ msg: "An Organization by you with that name already exists, please append 'Jr.' or similar" });
    }

    const id = createID(name, author);
    
    // Create the organization
    const newOrganization = await createOrganization(req.body, id);

    // Add the organization to the referenced leaders (use modifyCharacter for leaders)
    if (Leaders && Leaders.length > 0) {
        for (const leaderId of Leaders) {
            await modifyCharacter(leaderId, "add", {
                id: newOrganization.id,
                path: newOrganization.url,
                value: newOrganization.name
            });
        }
    }

    res.status(201).json(newOrganization); // Respond with created organization
});

// 🚀 Router: Update an existing organization (with author check)
organizationsRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const { name, World, Other_Worlds, Type, Leaders, description, Goals, Sections } = req.body;

    // Check if the organization exists
    const organization = await getOrganization("id", id);
    if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
    }

    // Ensure the author is the original author
    if (organization.author !== req.username) {
        return res.status(403).json({ error: "You do not have permission to update this organization." });
    }

    await updateOrganization(id, req.body);
    res.send({ message: `Organization ${id} updated successfully` });
});

// 🚀 Router: Modify an organization (add/put/delete leaders and worlds)
organizationsRouter.patch(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const { method, data } = req.body;
    
    const result = await modifyOrganization(id, data, method);

    if (result.error) {
        res.status(404).json(result);
    } else {
        res.send(result);
    }
});

// ✅ Create a new organization
async function createOrganization(organizationData, id) {
    const organizationURL = urlPrefix + id;
    const created = new Date().toJSON();

    const organizationBio = {
        id: id,
        name: organizationData.name,
        url: organizationURL,
        author: organizationData.author,
        infoCard: {
            name: organizationData.name,
            cardData: [
                { label: "Author", value: organizationData.author },
                { label: "World", value: organizationData.World, source: "/worldbuilding/worlds", edit: "select" },
                { label: "Other Worlds", value: organizationData.Other_Worlds, source: "/worldbuilding/worlds", edit: "multi-select" },
                { label: "Type", value: organizationData.Type, source: "/worldbuilding/organizations/types", edit: "creatable" },
                { label: "Leaders", value: organizationData.Leaders, source: "/characters", edit: "multi-select" },
                { label: "Classification", value: organizationData.Other_Worlds.length > 0 ? "multi-world" : "uni-world" }
            ],
            created: created,
            modified: created
        },
        description: organizationData.description,
        goals: organizationData.Goals || "",
        sections: organizationData.Sections || [],
        listSections: [
            {
                label: "Leaders",
                query: `/characters?organizations=${id}`,
                canModifyReferences: true
            },
            {
                label: "Members",
                query: `/characters?organizationMembership=${id}`,
                canModifyReferences: false
            }
        ]
    };

    organizations.push(organizationBio);
    return organizationBio;
}

// ✅ Update an organization
async function updateOrganization(id, updateData) {
    const organization = await getOrganization("id", id);

    if (!organization) {
        console.error(`Organization with ID '${id}' not found.`);
        return;
    }

    const { description, infoCard, sections } = updateData;

    if (description) {
        organization.description = description;
    }

    if (infoCard) {
        organization.infoCard = infoCard;
    }

    if (sections) {
        organization.sections = sections;
    }
}

// ✅ Modify an organization (add/put/delete references to leaders, worlds, etc.)
async function modifyOrganization(id, data, method) {
    const { worldId, leaderId, path, value } = data;

    const organization = await getOrganization("id", id);
    
    if (!organization) {
        console.error(`Organization with ID '${id}' not found.`);
        return { error: "Organization not found" };
    }

    if (method === "add") {
        if (leaderId) {
            // Add to leaders
            if (!organization.Leaders.includes(leaderId)) {
                organization.Leaders.push(leaderId);
            }
        }

        if (worldId) {
            // Add to worlds (ensure unique)
            if (!organization.Worlds.includes(worldId)) {
                organization.Worlds.push(worldId);
                // If other worlds exist, tag as multi-world
                if (organization.Other_Worlds.length > 0) {
                    organization.infoCard.cardData.find((field) => field.label === "Classification").value = "multi-world";
                }
            }
        }
    } else if (method === "delete") {
        if (leaderId) {
            const index = organization.Leaders.indexOf(leaderId);
            if (index > -1) {
                organization.Leaders.splice(index, 1);
            }
        }

        if (worldId) {
            const index = organization.Worlds.indexOf(worldId);
            if (index > -1) {
                organization.Worlds.splice(index, 1);
                // If no other worlds, revert to uni-world
                if (organization.Other_Worlds.length === 0) {
                    organization.infoCard.cardData.find((field) => field.label === "Classification").value = "uni-world";
                }
            }
        }
    }

    return organization;
}

module.exports = {organizationsRouter, modifyOrganization};
