const express = require('express');
const { verifyAuth, createID } = require('./../service.js');
const {modifyCharacter, getCharacter, charactersExists} = require(`./../characters.js`)
const urlPrefix = "/worldbuilding/organizations/";

const organizationsRouter = express.Router();
let organizations = [];
let organizationTypes = ["Religion", "Political", "Military", "Social", "Other"];

async function getOrganization(field, value){
    if (value) {
        return organizations.find((organization) => organization[field] === value);
    }
    return null;
}


async function getOrganizations(queries){
    if(typeof queries === "object"){
        let filterOrganizations = organizations;
        for(const [key, value] of Object.entries(queries)){
            if(Array.isArray(value)){
                filterOrganizations = filterOrganizations.filter(((organization) => 
                    Array.isArray(organization[key]) ? organization[key].some(char => value.includes(char)) : value.includes(organization[key] )))
            }
            else{
                filterOrganizations = filterOrganizations.filter(((organization) => 
                    Array.isArray(organization[key]) ? organization[key].includes(value) : value === organization[key]))
            }
        }
        return filterOrganizations;
    }
    else{
        return organizations;
    }
}


organizationsRouter.get(`${urlPrefix}options`, async (req, res) => {
    const filteredOrganizations = await getOrganizations(req.query);
    const options = filteredOrganizations.map((organization) => {
        return {
            value: organization.id, 
            label: organization.name,
            qualifier: organization.types || []
        }
    })
    res.send(options)
})

organizationsRouter.get(`${urlPrefix}types/options`, async (_req, res) => {
    const options = organizationTypes.map((type) => {
        return {
            value: type,
            label: type,
        }
    })
    res.send(options)
})



organizationsRouter.get(`${urlPrefix}:id?`, async (req, res) => {
    const { id } = req.params;
    const queries = req.query || {};
    const {author} = req.query || "";
    if(!id || id === "undefined" || id.trim() === ""){
        let organizationsToSend = await getOrganizations(queries);
        res.send(organizationsToSend)
    }
    else{
        if(id == "types"){
            res.send(organizationTypes);
        }
        else{
            const organization = await getOrganization("id", id);
            if(organization){
                if(author){
                    const isAuthor = author === organization.author;
                    res.send({isAuthor})
                }
                else{
                    res.send(organization);
                }
            }
            else{
                res.status(404).json({ error: "Organization not found" });
            }
        }
    }
});

organizationsRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
    
    const {name, description, leaders} = req.body;
    const author = req.username;
    if(!name || !author || !description){
        return res.status(409).send({msg:"Required fields not filled out"});
    }
    

    const id = createID(req.body.name, author);
    if(await getOrganization("id", id)){
        return res.status(409).send({msg:"A Organization by you and by that name already exists"});
    }else{
        const leadersArray = Array.isArray(leaders) ? leaders : leaders != null  ?  [leaders] : []

        if(!charactersExists(leadersArray)){
            return res.status(404).send({msg:"All Leaders must exist"});
        }
        const organization = await createOrganization(req.body, author, id, leadersArray);
        if(organization){
            return res.json(organization)
        }
    }
});



organizationsRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const username  = req.username;
    const updateData = req.body;
    const {leaders} = updateData
    if(!updateData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if(!updateData.id || updateData.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Organization." });
    }

    

    const organization = await getOrganization("id", id);
    if(organization){
        if(username !== organization.author || updateData.author !== organization.author){
            res.status(401).send({msg:`cannot update organization, or field`});
        }
        if(username === organization.author){
            const leadersArray = Array.isArray(leaders) ? leaders : leaders != null  ?  [leaders] : []
            if(!charactersExists(leadersArray)){
                return res.status(404).send({msg:"All Leaders must exist"});
            }
            const updateData = req.body;
            const updated = await updateOrganization(id, updateData)
            if(updated.msg){
                return res.status(500).send(updated.msg);
            }
            return res.send(updated);
        }
       
    }
    else{
        res.status(404).send({msg:`Organization ${id}, not found`});
    }
});




async function createOrganization(organizationData, author, id, leaders){
    const organizationURL = urlPrefix + id;
    const {name, types, description, 
        originWorld,
        otherWorlds = [], authorIsLeader,
        countries,  custom, sections
    } = organizationData

    
    const created = new Date().toJSON();
    await addTypes(types);
    const organization = {
        id,
        name,
        url:organizationURL,
        author,
        types,
        leaders,
        authorIsLeader,
        originWorld,
        otherWorlds,
        countries,
        worlds: [originWorld, ...(otherWorlds ?? [])],
        custom,
        description,
        sections,
        created,
        modified:created,
    }

    if(Array.isArray(types) && !types.includes("Religion")){
        await Promise.all(
            leaders.map(async (leader) => {
                const character = await getCharacter("id", leader);
                if (character) {
                    await modifyCharacter(character, "organizations", id, "add");
                }
            })
        );
    }
    organizations.push(organization)

    return organization
}
async function updateOrganization(id, updateData){
    const {types, originWorld, otherWorlds, leaders } = updateData
    const organization = await getOrganization("id", id);
    if(JSON.stringify(types) !== JSON.stringify(organization.types)){
        await addTypes(types);
    }
    if(JSON.stringify(leaders) !== JSON.stringify(organization.leaders)){
        if(!types.includes("Religion")){
            await Promise.all(
                leaders.map(async (leader) => {
                    const character = await getCharacter("id", leader);
                    if (character) {
                        await modifyCharacter(character, "organizations", id, "add");
                    }
                })
            );
        }
    }
    const newWorlds = [originWorld, ...(otherWorlds ?? [])]
    if(JSON.stringify(newWorlds) !== JSON.stringify(organization.worlds)){
        updateData.worlds = newWorlds;
    }
    return await organizationUpdate(updateData);
}
async function organizationUpdate(organization){
    const index = organizations.findIndex(char => char.id === organization.id);
    if(index !== -1){
        organizations[index] = organization;
        return organization
    }
    else {
        return {msg:"failed to update organization"}
    }
}

async function addTypes(type){
    if(Array.isArray(type)){
        type.forEach((item) => {
            if(!organizationTypes.includes(item)){
                organizationTypes.push(item);
            }
        })
    }
    else{
        if(!organizationTypes.includes(type)){
            organizationTypes.push(type)
        }
    }
    return "done"
}

async function modifyOrganization(organization, list, data, method) {
    const restrictedLists = ["worlds", "sections", "custom"];
    if(restrictedLists.includes(list) || (list === "leaders" && (method === "add" || method === "put"))){
        return {error: `can't modify ${list} directly use other or alt version` };
    }
    if (!organization[list] || !Array.isArray(organization[list])) {
        return { error: `List '${list}' not found, or not a list.` };
    }
    const organizationData = organization[list];
    
    
    // Add or update references
    if (method === 'add' || method === 'put') {
        const existsInOrganization = organizationData.includes(data);
        if (!existsInOrganization) {
            organizationData.push(data);  // Add to organization object
        }
    } 
    // Delete references
    else if (method === 'delete') {
        const organizationIndex = organizationData.findIndex(item => item === data);
        if (organizationIndex !== -1) {
            if(organizationIndex === organizationData.length - 1){
                organizationData.pop()
            }
            else{
                organizationData.splice(organizationIndex, 1);
            }
        }
    }
    organization[list] = organizationData;
    return await updateOrganization(organization.id, organization);
}

// 🚀 Router: Modify a organization field (add/put/delete references)
organizationsRouter.patch(`${urlPrefix}:id/:list`, verifyAuth, async (req, res) => {
    const { id, list } = req.params;
    const { method, data } = req.body;
    const organization = await getOrganization("id", id)
    if(!organization){
        return res.status(404).send({msg:"Error Organization not found"});
    }

    const result = await modifyOrganization(organization, list, data, method);

    if (result.error) {
        return res.status(400).send(result);
    } else {
        return res.send(result);
    }
});


module.exports = {organizationsRouter, modifyOrganization};
