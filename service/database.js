const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');
const { pipeline } = require('stream');
const { sanitizeId } = require('./service');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('yggdrasil');

(async function testConnection() {
    try {
      await db.command({ ping: 1 });
      console.log(`Connect to database`);
      await initializeDatabase()
      console.log('Database indexes initialized');

    } catch (ex) {
      console.log(`Unable to connect to database with ${url} because ${ex.message}`);
      process.exit(1);
    }
  })();

// Collections
const userCollection = db.collection('user');
const worldsCollection = db.collection('worlds');
const floraCollection = db.collection('flora');
const floraTypeCollection = db.collection('floraTypes');
const wildlifeCollection = db.collection('wildlife');
const wildlifeTypeCollection = db.collection('wildlifeTypes');
const charactersCollection = db.collection('characters');
const characterTypeCollection = db.collection('characterTypes');
const racesCollection = db.collection('races');
const raceTypeCollection = db.collection('raceTypes');
const organizationsCollection = db.collection('organizations');
const organizationTypeCollection = db.collection('organizationTypesBios');
const magicSystemsCollection = db.collection('magicsystems');
const magicTypeCollection = db.collection('magicTypes');
const countriesCollection = db.collection('countries');
const countryTypeCollection = db.collection('countryTypes');
const biomesCollection = db.collection('biomes');
const writingadviceCollection = db.collection('writingadvice');
const writingpromptsCollection = db.collection('writingprompts');
const storiesCollection = db.collection('stories');
const genreCollection = db.collection('genres');
const contentWarningCollection = db.collection('contentwarnings');
const chapterCollection = db.collection('chapter');
const edgeCollection = db.collection('edge')

async function initializeDatabase(){
    await userCollection.createIndex({username:1}, {unique:true})
    await userCollection.createIndex({email:1}, {unique:true})
    await worldsCollection.createIndex({id:1}, {unique:true})
    await floraCollection.createIndex({id:1}, {unique:true})
    await floraTypeCollection.createIndex({value:1}, {unique:true})
    await wildlifeCollection.createIndex({id:1}, {unique:true})
    await wildlifeTypeCollection.createIndex({value:1}, {unique:true})
    await charactersCollection.createIndex({id:1}, {unique:true})
    await characterTypeCollection.createIndex({value:1}, {unique:true})
    await racesCollection.createIndex({id:1}, {unique:true})
    await raceTypeCollection.createIndex({value:1}, {unique:true})
    await organizationsCollection.createIndex({id:1}, {unique:true})
    await organizationTypeCollection.createIndex({value:1}, {unique:true})
    await countriesCollection.createIndex({id:1}, {unique:true})
    await countryTypeCollection.createIndex({value:1}, {unique:true})
    await magicSystemsCollection.createIndex({id:1}, {unique:true})
    await magicTypeCollection.createIndex({value:1}, {unique:true})
    await biomesCollection.createIndex({id:1}, {unique:true})
    await storiesCollection.createIndex({id:1}, {unique:true})
    await chapterCollection.createIndex({id:1}, {unique:true})
    await chapterCollection.createIndex({storyID:1})

    await genreCollection.createIndex({value:1}, {unique:true})
    await contentWarningCollection.createIndex({value:1}, {unique:true})
    await edgeCollection.createIndex({source:1, target:1}, {unique:true})
    await writingadviceCollection.createIndex({description:1}, {unique:true})
    await writingpromptsCollection.createIndex({description:1}, {unique:true})
    await biomesCollection.createIndex({description:"text", name:"text"})
    await worldsCollection.createIndex({description:"text",  name:"text", continents:"text"})
    await countriesCollection.createIndex({description:"text", name:"text", continents:"text", towns:"text", types:"text"})
    await floraCollection.createIndex({description:"text",  name:"text",  types:"text"})
    await wildlifeCollection.createIndex({description:"text",  name:"text",  types:"text"})
    await magicSystemsCollection.createIndex({description:"text",  name:"text",  types:"text"})
    await organizationsCollection.createIndex({description:"text",  name:"text",  types:"text"})
    await racesCollection.createIndex({description:"text",  name:"text",  types:"text"})
    await charactersCollection.createIndex({
        description:"text", 
        name:"text",  
        types:"text",
        titles:"text",
        gender:"text",
        pronouns:"text",
        born:"text",
        died:"text",
        homeTown:"text",
    })
    await chapterCollection.createIndex({title:"text", genres:"text", body:"text", contentWarnings:"text"})
    await storiesCollection.createIndex({title:"text", genres:"text", description:"text", contentWarnings:"text"})
}


const worldbuildingCollections = [
    worldsCollection,
    floraCollection,
    wildlifeCollection,
    racesCollection,
    organizationsCollection,
    magicSystemsCollection,
    countriesCollection,
    biomesCollection
]
const collectionsMap = {
    users:userCollection,
    user:userCollection,
    author:userCollection,
    username:userCollection,

    worlds:worldsCollection,
    world:worldsCollection,
    originworld:worldsCollection,
    homeworld:worldsCollection,
    otherworlds:worldsCollection,

    flora:floraCollection,
    floratypes:floraTypeCollection,

    wildlife:wildlifeCollection,
    wildlifetype:wildlifeTypeCollection,

    characters:charactersCollection,
    character:charactersCollection,
    family:charactersCollection,
    enemies:charactersCollection,
    allies:charactersCollection,

    characterstypes:characterTypeCollection,
    charactertype:characterTypeCollection,
    characterstype:characterTypeCollection,
    charactertypes:characterTypeCollection,
    leaders:characterTypeCollection,

    race:racesCollection,
    races:racesCollection,
    altforms:racesCollection,
    
    racetypes:raceTypeCollection,
    racestypes:raceTypeCollection,
    racetype:raceTypeCollection,

    abilites:magicSystemsCollection,
    magic: magicSystemsCollection,
    magicsystem: magicSystemsCollection,
    magicsystems: magicSystemsCollection,

    magictypes: magicTypeCollection,

    country: countriesCollection,
    countries: countriesCollection,
    homecountry: countriesCollection,
    otherCountries: countriesCollection,
    countrytypes: countryTypeCollection,
    

    chapters: chapterCollection,
    stories: storiesCollection,
    storyID: storiesCollection,


    originbiome:biomesCollection,
    otherbiomes:biomesCollection,
    biomes: biomesCollection,
    biome:biomesCollection,

    religion:organizationsCollection,
    organizations: organizationsCollection,
    organizationtypes: organizationTypeCollection,

    genres: genreCollection,

    contentwarnings: contentWarningCollection,

    writingadvice: writingadviceCollection,
    writingprompts: writingpromptsCollection
}

const typeCollections = [
    countryTypeCollection,
    genreCollection,
    floraTypeCollection,
    wildlifeTypeCollection,
    contentWarningCollection,
    characterTypeCollection,
    raceTypeCollection,
    organizationTypeCollection,
    magicTypeCollection
]

const storyCollections = [
    chapterCollection,
    storiesCollection
]

const excludeCollections = [
    writingadviceCollection,
    writingpromptsCollection
]

function normalizeKey(value){
    return value
    .toLowerCase()
    .replace(/^\/worldbuilding\//, "")
    .replace(/^\//, "")
    .replace(/\s+/g, '')

}
function getCollection(value){
    const key = normalizeKey(value);
    return collectionsMap[key] || null;
}

async function processFilters(rawFilters){
    const processed = {};
    for(const key in rawFilters){
        let value = rawFilters[key]
        const isExclusion = /excludes/i.test(key);
        const isAll = /all/i.test(key);

        const field = key.replace(/excludes|all/gi, "").trim();
        const temp = ensureArray(await convertIDs(key, value))
        const operator = isExclusion ? "$nin" : isAll ? "$all" : "$in";


        if(processed[field]){
            processed[field].push({[operator]: temp})
        }
        else{
            processed[field] = [{[operator]: temp}]
        }
    }
    const keys = Object.keys(processed);
    if (keys.length === 1) {
        return { [keys[0]]: processed[keys[0]] };
    }
    return {
        $and: keys.map(field => ({
            [field]: processed[field]
        }))
    };
}

async function processFamilyToIDs(family){
    const newFamily = []
    for(const relationship of family){
        const value = await convertIDs("characters", relationship.value);
        newFamily.push({label:relationship.label, value})
    }
    return newFamily
}

async function processFamilyToDisplayable(family){
    const newFamily = []
    for(const relationship of family){
        const label = sanitizeText(relationship.label)
        const value = await convertToDisplayable("characters", relationship.value);
        newFamily.push({label, value})
    }
    return newFamily
}

const textEdits = ["text", "textarea", "text-creatable"]

async function processCustomToIDs(custom){
    const newCustom = []
    for(const field of custom) {
        const edit = field.edit;
        const label = sanitizeText(field.label)
        if(textEdits.includes(edit)){
            let value = field.value
            if(Array.isArray(value)){
                value = value.map((item) => sanitizeText(item))
            }
            else{
                value = sanitizeText(value)
            }
            newCustom.push({label, value, edit})
        }
        else if (edit === "super-select"){
            const source = field.source;
            const value = []
            for(const customRelation of field.value){
                const sanitizedLabel = sanitizeText(customRelation.label)
                const values = await convertIDs(source, customRelation.value);
                value.push({label:sanitizedLabel, value:values})
            }
            newCustom.push({source, value, edit, label});
        }
        else{
            const source = field.source;
            const value = await convertIDs(source, field.value)
            newCustom.push({source, value, edit, label:label});
        }
    }
    return newCustom
}

async function processCustomToDisplayable(custom) {
    const newCustom = [];

    for (const field of custom) {
        const edit = field.edit;

        if (textEdits.includes(edit)) {
            newCustom.push(field);
        } 
        else if (edit === "super-select") {
            const source = field.source;
            const value = [];

            for (const customRelation of field.value) {
                const displayValues = await convertToDisplayable(source, customRelation.value);
                value.push({ label: customRelation.label, value: displayValues });
            }

            newCustom.push({ value, label: field.label });
        } 
        else {
            const source = field.source;
            const displayValue = await convertToDisplayable(source, field.value);
            newCustom.push({ value: displayValue, label: field.label });
        }
    }
    return newCustom;
}

function basicProject(matchField, projectionFields) {
    return [
      { $match: { _id: { $in: matchField } } },
      { $project: projectionFields }
    ]
  }
  function ensureArray(input) {
    return Array.isArray(input) ? input : [input];
  }
  function unArray(original, result) {
    return Array.isArray(original) ? result : result[0];
  }
async function convertToDisplayable(source, raw) {
    const collection = getCollection(source);
    const ids = ensureArray(raw)
    let results = ids
    if(!collection || excludeCollections.includes(collection) || typeCollections.includes(collection)){
        return raw
    }
    else if(collection === userCollection){
        results = await collection.aggregate(basicProject(ids, {value: `$displayname`})).toArray();
    }
    if(storyCollections.includes(collection)){
        results = await collection.aggregate(basicProject(ids, {value: `$title`, url:1})).toArray();

    }
    else{
        results = await collection.aggregate(basicProject(ids, {value: `$name`, url:1})).toArray();
    }
    return unArray(raw, results)
}

async function convertToEditable(source, raw) {
    const collection = getCollection(source);
    const ids = ensureArray(raw)
    if(!collection || excludeCollections.includes(collection) || typeCollections.includes(collection)){
        return raw
    }
    
    let results = ids
    if(collection === userCollection){
        results = await collection.aggregate([
            { $match: { _id: { $in: ids } } },
            {
                $project: {
                    id:"$username"
                }
            }
        ]).toArray()
    }
    else {
        results = await collection.aggregate([
            { $match: { _id: { $in: ids } } },
            {
                $project: {
                    id:1
                }
            }
        ]).toArray()
    }
    const mapped = results.map((result) => result.id)
    return unArray(raw, results)
}

async function processFamilyToEditable(family){
    const newFamily = []
    for(const relationship of family){
        const value = await convertToEditable("characters", relationship.value);
        newFamily.push({label:relationship.label, value})
    }
    return newFamily
}

async function processCustomToEditable(custom){
    const newCustom = []
    
    for(const field of custom) {
        const { label, value, edit, source } = field;
        if(textEdits.includes(edit)){
            newCustom.push(field)
            continue
        }

        if (edit === "super-select"){
            const newValue = []
            for(const customRelation of value){
                const values = await convertToEditable(source, customRelation.value);
                value.push({label:customRelation.label, value:values})
            }
            newCustom.push({source, value:newValue, edit, label});
        }
        else{
            const converted = await convertToEditable(source, value)
            newCustom.push({source, value:converted, edit, label});
        }
    }
    return newCustom
}



async function convertIDs(collectionKey, input){
    if(collectionKey === "custom"){
        return processCustomToIDs(input)
    }
    if(collectionKey === "family"){
        return processFamilyToIDs(input)
    }
    const isArray = Array.isArray(input);
    const ids = isArray ? input : [input];
   
    const collection = getCollection(collectionKey)
    if (ids.length === 0 || !collection ||
        excludeCollections.includes(collection)  ){
            return collectionKey !== "password" ? isArray ? input.map((item) => sanitizeText(item))
            : sanitizeText(input) : input
    } 
    

    let found = []
    if(typeCollections.includes(collection)){
        found = await addTypesBatch(collection, ids);
    }
    else if(collection === userCollection){
        found = await collection
        .find({ username: { $in: ids }})
        .project({ _id: 1 })
        .toArray();
    }
    else {
        found = await collection
        .find({ id: { $in: ids } })
        .project({ _id: 1 })
        .toArray();
    }
    if (found.length !== ids.length) {
        throw createError(`Missing one or more ${collectionKey}`, 404);
    }
    return isArray ? found : found[0];
}
function createError(message, statusCode = 500) {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
}
async function addTypesBatch(collection, ids) {
    // Sanitize and deduplicate input values
    const sanitizedIds = [...new Set(ids.map(sanitizeText))];

    // Find already existing values
    const existingItems = await collection.find({ value: { $in: sanitizedIds } }).toArray();
    const existingValues = existingItems.map(item => item.value);

    // Identify values that are missing
    const missingValues = sanitizedIds.filter(id => !existingValues.includes(id));

    // Insert missing values
    if (missingValues.length > 0) {
        const insertDocs = missingValues.map(value => ({ value }));
        await collection.insertMany(insertDocs);

        // Optionally re-fetch inserted values to match schema format
        const insertedItems = await collection.find({ value: { $in: missingValues } }).toArray();
        existingItems.push(...insertedItems);
    }

    return existingItems;
}

async function processSort(rawSort){
    const processed = []
    const sortFields = {};
    const processedKeys = new Set();

    for (const [key, direction] of Object.entries(rawSort)) {
        const dir = direction === 'abc' ? 1 : -1
        if(key === "created" || key === "modified" || key === "expanded"){
            sortFields[key] = dir;
        }
        else{
            const collection = getCollection(key);
            if(!collection || excludeCollections.includes(collection)){
                continue;
            }
            else if(!processedKeys.has(collection)){
                processedKeys.add(key)
                processed.push({
                    "$lookup": {
                        from: collection.collectionName,
                        localField:key,
                        foreignField: '_id',
                        as:`${key}Details`
                    }
                })
                processed.push({
                    "$unwind": {
                        path:`$${key}Details`,
                        preserveNullAndEmptyArrays: true
                    }
                })
                
            }
            let sortField
            if(collection === userCollection){
                sortField = `${key}Details.displayname`
            }
            else if(storyCollections.includes(collection)){
                sortField = `${key}Details.title`
            }
            else {
                sortField = `${key}Details.name`
            }
            sortFields[sortField] = dir;
           
        }
    }
    if(Object.keys(sortFields).length > 0){
        processed.push({$sort: sortFields})
    }
    return processed
}



async function getOptions(collectionKey, { query }){
    const collection = getCollection(collectionKey)

    if(excludeCollections.includes(collection)){
        return [];
    }
    

    if(typeCollections.includes(collection)){
        return await getTypeOptions(collection)
    }
    else if(storyCollections.includes(collection)){
        if(collection === chapterCollection){
            return await getCatagoryOptions(storiesCollection, {query, labelField:"title", qualifierField:"storyID"})
        }
        return await getCatagoryOptions(storiesCollection, {query, labelField:"title"})
    }
    else if(collection === userCollection){
        return getCatagoryOptions(collection, {query, labelField:"displayname", valueField:"username"})
    }
    else{
        return getCatagoryOptions(collection, {query})
    }
}

async function getTypeOptions(collection){
    return await collection.aggregate([
        {
            $project:{
                label: "$value",
                value: 1,
                _id: 0
            }
        }
    ]).toArray()
}





async function getCatagoryOptions(collection, 
    {
        query = {},
        labelField = "name",
        valueField = "id",
        qualifierField = "types"
    } = {}
    ){
    const pipeline = [];

    const {filter = {}, sort = {}} = query

    if (Object.keys(filter).length > 0) {
        const processedFilter = await processFilters(filter)
        pipeline.push({ $match: processedFilter });
    }
    if (Object.keys(sort).length > 0) {
        const processedSort = await processSort(sort)
        pipeline.push({ $sort: processedSort });
    }
    const project = {
        label: `$${labelField}`,
        value: `$${valueField}`,
        _id: 0
    };

    if (qualifierField) {
        const qualifierCollection = getCollection(qualifierField);
        if(qualifierCollection && !typeCollections.includes(qualifierCollection) && !excludeCollections.includes(qualifierCollection)){
            ensureLookup(pipeline,qualifierField)
            project.qualifier = {
                $cond: {
                    if: { $isArray: `$${qualifierField}Details` },
                    then: {
                        $map: {
                            input: `$${qualifierField}Details`,
                            as: "item",
                            in: "$$item.id" // or any field you expect
                        }
                    },
                    else: `$${qualifierField}Details.id`
                }
            };
        
        }
        else{
            project.qualifier = `$${qualifierField}`;
        }
    }

    pipeline.push({ $project: project });

    return await collection.aggregate(pipeline).toArray();
}
async function getUserById(id){
    return await userCollection.findOne({_id:id});

}
async function getUserByUsername(username){
    return await userCollection.findOne({username:username});
}
async function getUserByEmail(email){
    return await userCollection.findOne({email:email});
}
function getUserByToken(token){
    return userCollection.findOne({token:token})
}

async function addUser(user){
    return await userCollection.insertOne(user)
}

async function addWritingPrompt(prompt){
    return await writingpromptsCollection.insertOne(prompt)
}
async function addWritingAdvice(advice){
    return await writingadviceCollection.insertOne(advice)
}

async function updateUser(user){
    return await userCollection.updateOne({username: user.username},{$set: user});
}

async function listUserDisplay(){
    return await userCollection.find({},{projection:{displayname:1, _id:0}}).toArray();
}


const ensureLookup = (pipeline, field) => {
    const collection = getCollection(field);
    const alreadyInPipeline = pipeline.some(stage => 
        stage.$lookup && stage.$lookup.from === collection.collectionName && stage.$lookup.localField === field
    );

    if (!alreadyInPipeline) {
        pipeline.push({
            $lookup: {
                from: collection.collectionName,
                localField: field,
                foreignField: '_id',
                as: `${field}Details`
            }
        });
    }
};


async function getCards(collectionKey, {
    query = {},
    fields = ["description"],
    lookupFields = [],
    projectionFields = {}
} = {}){
    const collection = getCollection(collectionKey)
    const {filter = {}, sort = {}} = query

    if (Object.keys(filter).length > 0) {
        const processedFilter = await processFilters(filter)
        pipeline.push({ $match: processedFilter });
    }
    if (Object.keys(sort).length > 0) {
        const processedSort = await processSort(sort)
        pipeline.push({ $sort: processedSort });
    }
    for (const field of lookupFields) {
        ensureLookup(pipeline, field);
    }

    const project = {_id:0}
    for(const field of fields){
        project[field] = 1;
    }
    Object.assign(project, projectionFields);
    pipeline.push({ $project: project });
    return await collection.aggregate(pipeline).toArray();
}

async function getGraph(id, filter={}){
    const pipeline = []
    const storyID = convertIDs("storyID", id);
    const match = {storyID}
    if (Object.keys(filter).length > 0) {
        const processedFilter = await processFilters(filter)
        Object.assign(match, processedFilter)
    }
    pipeline.push({ $match: match });
    pipeline.push({
        $project:{
            _id:0,
            id:1,
            data:{title:1, genres:1, url:1, contentWarnings:1}
        }
    })
    const nodes = await chapterCollection.aggregate(pipeline).toArray()

    const nodeIds = nodes.map(c => c.id);
    const edges = await edgeCollection
        .find({ source: { $in: nodeIds }, target: { $in: nodeIds } }).project({_id:0})
        .toArray();

    return {nodes, edges}
}

async function getEditable(collectionKey, author, id, {    
    lookupFields = [],
    fields = [], 
    projectionFields = {}
}= {}){
    const collection = getCollection(collectionKey)
    const pipeline = [
        { $match: {id, author}}
    ]
    for (const field of lookupFields) {
        ensureLookup(pipeline, field);
    }
    const project = {_id:0}
    for(const field of fields){
        project[field] = 1;
    }
    Object.assign(project, projectionFields);
    pipeline.push({ $project: project });

    const result = await collection.aggregate(pipeline).toArray();
    if(result.length === 0){
        throw createError("Data not found or you are not the author", 409)
    }
    const data = result[0];
    if(data.family){
        data.family = await processFamilyToEditable(data.family);
    }
    if(data.custom){
        data.custom = await processCustomToEditable(data.custom);
    }
    return data;
}

async function getDisplayable(collectionKey, id, {    
    lookupFields = [],
    fields = [], 
    projectionFields = {}
}= {}){
    const collection = getCollection(collectionKey)
    const pipeline = [
        { $match: {id}}
    ]
    for (const field of lookupFields) {
        ensureLookup(pipeline, field);
    }
    const project = {_id:0}
    for(const field of fields){
        project[field] = 1;
    }
    Object.assign(project, projectionFields);
    pipeline.push({ $project: project });

    const result = await collection.aggregate(pipeline).toArray();
    if(result.length === 0){
        throw createError("Data not found", 404)
    }
    const data = result[0];
    if(data.family){
        data.family = await processFamilyToDisplayable(data.family);
    }
    if(data.custom){
        data.custom = await processCustomToDisplayable(data.custom);
    }
    return data;

}

async function addOne(collectionKey, data, {preProcessing = {}, postProcessing = {}}){
    const collection = getCollection(collectionKey);
    let uniqueId = data.id;
    let existing = await collection.findOne({ id: uniqueId });
    if(collection === chapterCollection && existing){
        let counter = 0;
        while(existing){
            counter++; 
            uniqueId = `${data.id}_${counter}`;
            existing = await collection.findOne({ id: uniqueId });
        }
        data.id = uniqueId
        data.url = `${data.url}_${counter}`
    }
    else if(existing){
        throw createError("This name already exists in this collecton for this user", 409)
    }

    await Promise.all(
        Object.keys(data).map(async (key) => {
            if(key !== "author"){
                data[key] = await convertIDs(key, data[key]);
            }
        })
    );
    const created = new Date().toJSON()
    data.created = created;
    data.modified = created;
    for (const key in preProcessing) {
        data[key] = await preProcessing[key](data[key], data);
    }
    const result = await collection.insertOne(data)
    await Promise.all(
        Object.entries(postProcessing).map(([key, fn]) => fn(result[key], result, collectionKey))
    );
    return result
}

async function updateOne(collectionKey, data, author, {preProcessing = {}, postProcessing = {}}){
    await Promise.all(
        Object.keys(data).map(async (key) => {
            data[key] = await convertIDs(key, data[key]);
        })
    );
    const collection = getCollection(collectionKey);
    const original = await collection.findOne({id: data.id, author:author})
    if(!original){
        throw createError("Data does not exist or you are not the Author", 401);
    }
    
    data.modified = new Date().toJSON();

    for (const key in preProcessing) {
        data[key] = await preProcessing[key](data[key], data);
    }
   
    const result = await collection.updateOne({_id: original._id, author:author}, {$set:data})
    await Promise.all(
        Object.entries(postProcessing).map(([key, fn]) => fn(result[key], result, collectionKey))
    );
    return result
}




const createCombiner = (primaryKey, secondaryKey) => (full) => [full[primaryKey], ...(full[secondaryKey] || [])]
const combinedWorlds = createCombiner(originWorld, otherWorlds)
const combinedBiomes = createCombiner(originWorld, otherWorlds);

const addLeaders = async (val, full, key) => {
    const modified = new Date().toJSON();

    if (!val || val.length === 0) return;
    const updateFilter = key === "countries" ? {
        _id: { $in: val }, 
        homeCountry:{$ne:full._id}
    }: {_id: { $in: val }}
    const updatePayload = key === "countries" ? {
        $addToSet:{countries:full._id, otherCountries:full._id }, 
        $set: {modified}
    } 
        : {$addToSet:{[key]:full._id }, $set: {modified}}
    await chapterCollection.updateMany(updateFilter, updatePayload);
}

const expandStory = async (full) => {
    const timestamp = new Date().toJSON();
    await storyCollections.updateOne(
        { _id: full.storyID },
        { $set: { expanded: timestamp } }
    );
};

const combinedPrevious = (full) => [...(full.samePrevious || []), ...(full.anyPrevious || [])];
const combinedNext = (full) => [...(full.sameNext || []), ...(full.anyNext|| [])];


const connectChapters = async (full) => {
    const {
        _id,
        id,
        samePrevious = [],
        anyPrevious = [],
        sameNext = [],
        anyNext = [],
        previous = [],
        next = []
    } = full;
    const allChapters = [...samePrevious, ...anyPrevious, ...sameNext, ...anyNext, ...previous, ...next];
    await chapterCollection.updateMany(
        { _id: { $nin: allChapters } },
        {
          $pull: {
            samePrevious: full._id,
            anyPrevious: full._id,
            sameNext: full._id,
            anyNext: full._id,
            previous: full._id,
            next: full._id
          }
        }
    );

    await chapterCollection.updateMany(
        { _id: { $in: samePrevious } },
        {
          $addToSet: {sameNext:_id, next:_id}
        }
    );
    await chapterCollection.updateMany(
        { _id: { $in: sameNext } },
        {
          $addToSet: {samePrevious:_id, previous:_id}
        }
    );
    await chapterCollection.updateMany(
        { _id: { $in: anyPrevious } },
        {
          $addToSet: {anyNext:_id, next:_id}
        }
    );
    await chapterCollection.updateMany(
        { _id: { $in: anyNext } },
        {
          $addToSet: {anyPrevious:_id, previous:_id}
        }
    );

    const previousIDs = chapterCollection.aggregate([
        {$match: { _id: { $in: previous } }},
        {
            $project:{
                _id:0,
                id:1
            }
        }

    ]).toArray()
    

    const nextIDs = chapterCollection.aggregate([
        {$match: { _id: { $in: next } }},
        {
            $project:{
                _id:0,
                id:1
            }
        }

    ]).toArray()


    const nextIds = nextIDs.map(t => t.id);
    const prevIds = previousIDs.map(t => t.id);


    await edgeCollection.deleteMany({
        $or: [
          { source: id, target: { $nin: nextIds } },
          { target: id, source: { $nin: prevIds } }
        ]
      });

      // Create new edges if not already present
    const newEdges = [
        ...nextIds.map(target => ({ id:`${id}-${target}`, source: id, target })),
        ...prevIds.map(source => ({id:`${source}-${id}`, source, target: id }))
    ];

    if (newEdges.length > 0) {
        await edgeCollection.insertMany(newEdges, { ordered: false }).catch(() => {}); // Avoids dup error
    }
}

const restrictedKeys = ["custom", "familiy", "abilities", "sections", "towns", "genres", "contentWarnings", "races"]



const modificationRestrictedCollections = [
    worldsCollection,
    writingadviceCollection,
    writingpromptsCollection,
    storiesCollection,
    chapterCollection,
    edgeCollection,
    userCollection
]

async function  modifyMany(collectionKey, ids, list, data, method){
    if (!Array.isArray(ids) || !data ||  typeof list !== "string") {
        throw createError("Invalid Input", 400)
    }
    const collection = db.collection(collectionKey)
    if(modificationRestrictedCollections.includes(collection)){
        throw createError("This collection cannot be modified in this manner", 400);
    }
    if(restrictedKeys.includes(list)){
        throw createError(`Field ${list} cannot be modified in this manner, it is an author managed list`, 400);
    }
    const values = convertIDs(collectionKey, ids);
    const sample = await collection.findOne({ _id: values[0] });
    if (!sample || !Array.isArray(sample[list])) {
        throw createError(`${list} is not a list on this type`, 400);
    }
    let finalList = list
    const match = list.match(/^other(.+)/);
    if (!match) {
        const otherField = `other${list[0].toUpperCase()}${list.slice(1)}`;
        if (sample[otherField]) {
            finalList = otherField
        }
    }
    const base = finalList === "altForms"
        ? "races"
        : finalList.replace(/^other/, "").toLowerCase();
        
    const items = ensureArray(convertIDs(base, data));
    const query = { _id: { $in: values } };
    const stuffToOperate = {$each: items}
    const updateOp = method === "add" ? "$addToSet" : "$pull";
    const payloadPart = {[finalList]:  stuffToOperate}
    if(base !== finalList){
        payloadPart[base] = stuffToOperate
    }
    if(finalList === "altForms"){
        query["race"] = {$nin: items}
    }
    else if(finalList.startsWith("other")){
        const homeKey = `home${base[0].toUpperCase()}${base.slice(1)}`;
        const originKey = `origin${base[0].toUpperCase()}${base.slice(1)}`;
        query[homeKey] = { $nin: items };
        query[originKey] = { $nin: items };
    }
    const updatePayload = {
        [updateOp]: payloadPart,
        $set: {modified: new Date().toJSON()}
    }
    await collection.updateMany(query, updatePayload)
    return
}


function sanitizeText(text){
    return String(text)
    .replace(/<[^>]*>?/gm, '') // remove HTML tags
    .trim();
}








async function createID(name, author){
    const username = await getUserById(author).username
    return sanitizeId(`${name}_${username}`)
}













module.exports = {
    addUser,
    getUserById,
    getUserByUsername,
    getUserByEmail,
    getUserByToken,
    updateUser,
    listUserDisplay,
    combinedWorlds,
    addLeaders,
    combinedPrevious,
    combinedNext,
    connectChapters,
    combinedBiomes,
    createCombiner,
    expandStory,
    modifyMany,
    updateOne,
    addOne,
    getOptions,
    createID,
    getCards,
    getDisplayable,
    getEditable,
    addWritingAdvice,
    addWritingPrompt,
    getGraph,
    listUserDisplay
}