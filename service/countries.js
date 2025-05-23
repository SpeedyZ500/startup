const express = require('express');
const { verifyAuth, authCookieName } = require('./service.js');
const urlPrefix = "/worldbuilding/countries/";

const countriesRouter = express.Router();

const { 
    createID, 
    institutionFullFields,
    countriesPreProcessing,
    postProcessLeader,
    countryFullLookups,
    countryEditFields,
    getOptions,
    modifyMany,
    addOne,
    updateOne,
    optionsMap,
    getCards,
    getEditable,
    getAuth,
    raceUnwindFields
    
 } = require('./database.js')

 countriesRouter.get(`${urlPrefix}towns/options`, async (req, res) => {
    try {
        const courntries = await getCards(urlPrefix, {
            query:req.query, 
            projectionFields:{
                options:optionsMap("towns")
            },
            fields:["id"]
        });
        const flattened = courntries.flatMap(country =>
            (country.options || []).map(opt => ({
                ...opt,
                qualifier: country.id  // make sure it's still your displayable id
            }))
        );
        res.send(flattened);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Failed to fetch town options' });
    }
});

countriesRouter.get(`${urlPrefix}types/options`, async (req, res) => {
    const options = await getOptions("countrytypes")
    res.send(options)
})

countriesRouter.get(`${urlPrefix}options`, async (req, res) => {
    const options = await getOptions("countries", {query:req.query})
    res.send(options)
})






countriesRouter.get(`${urlPrefix}author/:id`,async (req, res)=>{
    const token = req.cookies[authCookieName];
    const author = await getAuth(token)
    if(!author){
        return res.send({isAuthor:false})
    }
    const id = req.params.id
    try{
        await getEditable(urlPrefix, author, id, {
            fields:["id"]
        })
        return res.send({isAuthor:true})
    }
    catch{
        return res.send({isAuthor:false})
    }
})


countriesRouter.get(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const author = req.usid
    const {id} = req.params
    try{
        const country = await getEditable(urlPrefix, author, id, {
                lookupFields:countryFullLookups,
                fields:institutionFullFields,
                projectionFields:countryEditFields,
                unwindFields:raceUnwindFields
                

            }
        );
        if(country){
            return res.send(country);
        }
        else{
            return res.status(404).send({msg:"country not found"})
        }
    }
    catch(e){
        res.status(e.statusCode || 500).send({msg:e.message})
    }
})



countriesRouter.post(`${urlPrefix}`, verifyAuth, async (req,res) => {
    const {name, description} = req.body;
    const author = req.usid;
    if(!name || !author || !description){
        return res.status(409).send({msg:"Required fields not filled out"});
    }

    const id = await createID(req.body.name, author);
    const creationData = req.body;
    creationData.id = id;
    creationData.url = `${urlPrefix}${id}`
    creationData.author = author;



    try{
        const country = await addOne(urlPrefix, creationData, {
            preProcessing:countriesPreProcessing, 
            postProcessing:postProcessLeader
        });
        if(country){
            return res.send({id:country.id, name:country.name, url:country.url})
        }
        else{
            return res.status(500).send({msg:"Failed to create Country"})

        }
    }
    catch(e){
        return res.status(e.statusCode || 500).send({msg:e.message})
    }
});



countriesRouter.put(`${urlPrefix}:id`, verifyAuth, async (req, res) => {
    const { id } = req.params;
    const userID  = req.usid;
    const updateData = req.body;
    if(!updateData){
        return res.status(400).send({ msg: "Missing data to update." });
    }
    else if(!updateData.id || updateData.id !== id ){
        return res.status(400).send({ msg: "ID mismatch. Cannot modify a different Country." });
    }
    try{
        const country = await updateOne(urlPrefix, updateData, userID, {preProcessing:countriesPreProcessing});
        if(country){
            return res.send({id:country.id, name:country.name, url:country.url})
        }
        else{
            return res.status(500).send({msg:"Failed to update Country"})
        }
    }
    catch(e){
        return res.status(e.statusCode || 500).send({msg:e.message})
    }
});

countriesRouter.patch(`${urlPrefix}:list/:method`, verifyAuth, async (req, res) => {
    const { list, method } = req.params;
    const { ids, id } = req.body;
    try{
        await modifyMany(urlPrefix, ids, list, id, method)
        return res.send({msg:"success"})
    }
    catch(e){
        res.status(e.statusCode || 500).send({msg:e.message})
    }
});

module.exports = countriesRouter ;
