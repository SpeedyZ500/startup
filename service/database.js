const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');
const crypto = require('crypto')

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
  });

function sanitizeId(id){
    return id
        .trim()
        .toLowerCase()
        .replace(/<[^>]*>?/gm, '') // remove HTML tags
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
}

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
const organizationTypeCollection = db.collection('organizationTypes');
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
const authCollection = db.collection('auth')
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
    await authCollection.createIndex({token:1}, {unique:true})

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
    wildlifetypes:wildlifeTypeCollection,

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

    abilities:magicSystemsCollection,
    magic: magicSystemsCollection,
    magicsystem: magicSystemsCollection,
    magicsystems: magicSystemsCollection,

    magictypes: magicTypeCollection,

    country: countriesCollection,
    countries: countriesCollection,
    homecountry: countriesCollection,
    othercountries: countriesCollection,
    countrytypes: countryTypeCollection,
    

    chapters: chapterCollection,
    chapter: chapterCollection,
    next:chapterCollection,
    previous:chapterCollection,
    samenext:chapterCollection,
    sameprevious:chapterCollection,
    anynext:chapterCollection,
    anyprevious:chapterCollection,

    stories: storiesCollection,
    storyid: storiesCollection,


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
    .replace(/\//g, "")
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
        const temp = await convertIDs(field, ensureArray(value))
        const operator = isExclusion ? "$nin" : isAll ? "$all" : "$in";
        if(temp.length && field){
            if(processed[field]){
                processed[field][operator] = temp
            }
            else{
                processed[field] = {[operator]: temp}
            }
        }
    }
    const keys = Object.keys(processed);
    if(!keys.length){
        return
    }
    if (keys.length === 1) {
        return processed
    }
    return {
        $and: keys.map(field => {
          return {[field]:processed[field]}
        })
    };
}

async function processFamilyToIDs(family){
    const familyArray = ensureArray(family)
    const newFamily = []
    for(const relationship of familyArray){
        const value = await convertIDs("characters", relationship.value);
        newFamily.push({label:relationship.label, value})
    }
    return newFamily
}

async function processFamilyToDisplayable(family){
    const familyArray = ensureArray(family)

    const newFamily = []
    for(const relationship of familyArray){
        const label = sanitizeText(relationship.label)
        const value = await convertToDisplayable("characters", relationship.value);
        newFamily.push({label, value})
    }
    return newFamily
}

const textEdits = ["text", "textarea", "text-creatable"]

async function processCustomToIDs(custom){
    const customArray = ensureArray(custom)
    const newCustom = []
    for(const field of customArray) {
        const edit = field.edit;
        const label = sanitizeText(field.label)
        const id = sanitizeText(field.id)
        if(textEdits.includes(edit)){
            const value =  sanitizeText(field.value)
            newCustom.push({label, value,id, edit})
        }
        else if (edit === "super-select"){
            const source = field.source;
            const value = []
            for(const customRelation of field.value){
                const sanitizedLabel = sanitizeText(customRelation.label)
                const values = await convertIDs(source, customRelation.value);
                value.push({label:sanitizedLabel, value:values})
            }
            newCustom.push({source, value, edit, label, id});
        }
        else{
            const source = field.source;
            const value = await convertIDs(source, field.value)
            newCustom.push({source, value, edit, label:label, id});
        }
    }
    return newCustom
}

async function processCustomToDisplayable(custom) {
    const customArray = ensureArray(custom)
    const newCustom = [];

    for (const field of customArray) {
        const edit = field.edit;

        if (textEdits.includes(edit)) {
            newCustom.push(field);
        } 
        else if (edit === "super-select") {
            const source = field.source;
            const value = [];

            for (const customRelation of field.value) {
                const displayValues = await convertToDisplayable(source, customRelation.value);
                value.push({ label: customRelation.label, value: displayValues});
            }
            newCustom.push({ value, label: field.label, format:"table"});
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
    return input ? Array.isArray(input) ? input : [input] : [];
  }
function unArray(original, result) {
    if (Array.isArray(original)) {
      return Array.isArray(result) ? result : [result];
    } else {
      return Array.isArray(result) ? result[0] : result;
    }
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
                    label:{ $ifNull: ["$name", "$title"] },
                    value:"$id",
                    qualifier:"$types"
                }
            }
        ]).toArray()
    }
    return unArray(raw, results)
}

async function processFamilyToEditable(family){
    const familyArray = ensureArray(family)
    const newFamily = []
    for(const relationship of familyArray){
        const value = await convertToEditable("characters", relationship.value);
        newFamily.push({label:relationship.label, value})
    }
    return newFamily
}

async function processCustomToEditable(custom){
    const customArray = ensureArray(custom)
    const newCustom = []
    
    for(const field of customArray) {
        const { label, value, edit, source, id} = field;
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
            newCustom.push({source, id, value:converted, edit, label});
        }
    }
    return newCustom
}



async function convertIDs(collectionKey, input){
    const ids = ensureArray(input)
    const collection = getCollection(collectionKey)
    if (ids.length === 0 || !collection || excludeCollections.includes(collection)  ){
            return sanitizeText(input)
    } 
    let found = []
    if(typeCollections.includes(collection)){
        found = await addTypesBatch(collection, ids);
        return unArray(input, found)
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
    const result = found.map(doc => doc._id)
    return unArray(input, result)
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
    if (missingValues.length) {
        const insertDocs = missingValues.map(value => ({ value }));
        await collection.insertMany(insertDocs);

        // Optionally re-fetch inserted values to match schema format
        const insertedItems = await collection.find({ value: { $in: missingValues } }).toArray();
        existingItems.push(...insertedItems);
    }

    return sanitizedIds;
}
const allowedSortFields = [
    "title",
    "name",
    "author",
    "homeWorld",
    "originWorld",
    "otherWorlds",
    "worlds",
    "homeCountry",
    "otherCountries",
    "countries",
    "originBiome",
    "otherBiomes",
    "biomes",
    "towns",
    "homeTown",
    "continents",
    "types",
    "titles",
    "created",
    "modified",
    "expanded",
    "genres",
    "contentWarnings",
    "abilities",
    "race",
    "altForms",
    "races",
    "leaders",
    "enemies",
    "allies",
    "organizations",
    "religion",
    "gender",
    "pronouns",
    "born",
    "died",
]


const requireUnwinding = [
    "types",
    "titles",
    "otherCountries",
    "countries",
    "otherWorlds",
    "otherBiomes",
    "biomes",
    "worlds",
    "genres",
    "towns",
    "continents",
    "contentWarnings",
    "abilities",
    "altForms",
    "races",
    "leaders",
    "enemies",
    "allies",
    "organizations"
]
async function processSort(pipeline, rawSort){
    const sortFields = {};
    const toUnwind = new Set()
    for(const [key, direction] of Object.entries(rawSort)){
        if(!allowedSortFields.includes(key)){
            continue;
        }
        const collection = getCollection(key);
        const lookup = !!collection
        if(lookup){
            ensureLookup(pipeline, key)
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
            sortFields[sortField] = direction;
        }
        else{
            sortFields[key] = direction;
        }
        if(requireUnwinding.includes(key)){
            toUnwind.add(lookup ? `${key}Details` : `${key}`);
        }
    }
    const grouper = {
        _id : "$_id",
        doc: {$first : "$$ROOT"}
    }
    const merger = {}
    for(const key of toUnwind){
        ensureUnwind(pipeline, key);
        grouper[key] = {$addToSet:`$${key}`}
        merger[key] = `$${key}`
    }
    if(Object.keys(sortFields).length){
        pipeline.push({$sort: sortFields})
    }
    if(toUnwind.size){
        pipeline.push({$group: grouper})
        pipeline.push({$replaceRoot:{
            newRoot:{$mergeObjects:["$doc", merger]}
        }})
    }   
    return
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
            return await getCatagoryOptions(chapterCollection, {query, labelField:"title", qualifierField:"storyID"})
        }
        return await getCatagoryOptions(storiesCollection, {query, labelField:"title"})
    }
    else if(collection === userCollection){
        return await getCatagoryOptions(collection, {query, labelField:"displayname", valueField:"username", appendAuthor:false})
    }
    else{
        return await getCatagoryOptions(collection, {query})
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
        qualifierField = "types",
        appendAuthor = true
    } = {}
    ){
    const pipeline = [];

    const {filter = {}, sort = {}} = query
    if (Object.keys(filter).length) {
        const processedFilter = await processFilters(filter)
        if(processedFilter){
            pipeline.push({ $match: processedFilter });
        }
    }
    if (Object.keys(sort).length) {
        await processSort(pipeline, sort)
    }
    if(appendAuthor){
        ensureLookup(pipeline, "author")
        ensureUnwind(pipeline, "authorDetails")
    }
    const project = {
        label: appendAuthor ? 
        { $concat: [`$${labelField}`, ' by ', { $ifNull: ['$authorDetails.displayname', 'Unknown'] }] }
        : `$${labelField}`,
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

async function addUser(user){
    const result = await userCollection.insertOne(user)
    return await userCollection.findOne({ _id: result.insertedId })
}
async function removeExpired(){
    const expires = new Date().toJSON()
    await authCollection.deleteMany({expires:{$lt:expires}})
}
async function addAuth(user, token, rememberMe=false){
    await removeExpired()
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date()
    expires.setDate(expires.getDate() + (rememberMe ? 30 : 1))
    await authCollection.insertOne({token:hashedToken, user:user._id, expires:expires.toJSON()})
}
async function removeAuth(token){
    await removeExpired()
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    await authCollection.deleteOne({token:hashedToken})

}
async function getAuth(token){
    await removeExpired()
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const authDoc = await authCollection.findOne({token:hashedToken})
    return authDoc ? authDoc.user : null;
}
async function getUserByToken(token){
    const id = await getAuth(token)
    return id ? await userCollection.findOne({ _id: id }) : null;
}


async function addWritingPrompt(prompt){
    prompt.description = sanitizeText(unArray("whatever", prompt.description))
    const existingPrompt = await writingpromptsCollection.findOne({ description: prompt.description });
    if(existingPrompt){
        throw createError("This prompt already exists", 409)
    }
    return await writingpromptsCollection.insertOne(prompt)
}
async function addWritingAdvice(advice){
    advice.description = sanitizeText(unArray("whatever", advice.description))
    const existingAdvice = await writingadviceCollection.findOne({ description: advice.description });
    if(existingAdvice){
        throw createError("This advice already exists", 409)
    }
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
const ensureUnwind = (pipeline, field) => {
    pipeline.push({
        $unwind:{
            path:`$${field}`,
            preserveNullAndEmptyArrays: true
        }
    });
}

async function getCards(collectionKey, {
    query = {},
    fields = ["description"],
    lookupFields = [],
    projectionFields = {},
    unwindFields = []
} = {}){
    const collection = getCollection(collectionKey)
    const {filter = {}, sort = {}} = query
    const pipeline = [];

    if (Object.keys(filter).length) {
        const processedFilter = await processFilters(filter)
        if(processedFilter){
            pipeline.push({ $match: processedFilter });
        }
    }
    if (Object.keys(sort).length) {
        await processSort(pipeline,sort)
    }
    for (const field of lookupFields) {
        ensureLookup(pipeline, field);
    }
    for (const field of unwindFields){
        ensureUnwind(pipeline, field)
    }
    const project = {_id:0}
    for(const field of fields){
        project[field] = 1;
    }
    Object.assign(project, projectionFields);
    pipeline.push({ $project: project });
    const cards = await collection.aggregate(pipeline).toArray();
    return cards;
}

async function getGraph(id, filter={}){
    const pipeline = []
    const storyID = await convertIDs("storyID", id);
    let match = {storyID}
    if (Object.keys(filter).length) {
        const processedFilter = await processFilters(filter);
        if (processedFilter) {
            if (processedFilter.$and) {
                processedFilter.$and.push({ storyID });
                match = processedFilter;
            } else {
                match = { $and: [ { storyID }, processedFilter ] };
            }
        }
    }

    pipeline.push({ $match: match });
    ensureLookup(pipeline, "author")
    ensureUnwind(pipeline, "authorDetails")

    pipeline.push({
        $project:{
            _id:0,
            id:1,
            title:1, 
            genres:1, 
            url:1, 
            contentWarnings:1, 
            description:1,
            author:"$authorDetails.displayname"
        }
    })

    pipeline.push({
        $addFields:{
            data: {
                title: "$title",
                genres: "$genres",
                url: "$url",
                contentWarnings: "$contentWarnings",
                description: "$description",
                author:"$author"
            },
            width:250,
            height:300,
            type:"chapterCard"
        }
    })

    pipeline.push({
        $project: {
          id: 1,
          data: 1,
          width: 1,
          height: 1,
          type: 1
        }
    });
    const children = await chapterCollection.aggregate(pipeline).toArray()

    const nodeIds = children.map(c => c.id);
    const edges = await edgeCollection
        .find({ source: { $in: nodeIds }, target: { $in: nodeIds } }).project({_id:0})
        .toArray();

    return {children, edges}
}

async function getEditable(collectionKey, author, id, {    
    lookupFields = [],
    fields = [], 
    projectionFields = {},
    unwindFields = []
}= {}){
    const collection = getCollection(collectionKey)
    const pipeline = [
        { $match: {id, author}}
    ]
    for (const field of lookupFields) {
        ensureLookup(pipeline, field);
    }
    for (const field of unwindFields){
        ensureUnwind(pipeline, field)
    }
    const project = {_id:0, id:1}
    for(const field of fields){
        project[field] = 1;
    }
    Object.assign(project, projectionFields);
    pipeline.push({ $project: project });

    const result = await collection.aggregate(pipeline).toArray();
    if(!result.length){
        throw createError("Data not found or you are not the author", 409)
    }
    const data = result[0];
    if(data.family && Array.isArray(data.family) && data.family.length){
        data.family = await processFamilyToEditable(data.family);
    }
    if(data.custom && Array.isArray(data.custom) && data.custom.length){
        data.custom = await processCustomToEditable(data.custom);
    }
    return data;
}

async function getDisplayable(collectionKey, id, {    
    lookupFields = [],
    fields = [], 
    projectionFields = {},
    unwindFields = []
}= {}){
    const collection = getCollection(collectionKey)
    const pipeline = [
        { $match: {id}}
    ]
    for (const field of lookupFields) {
        ensureLookup(pipeline, field);
    }
    for (const field of unwindFields){
        ensureUnwind(pipeline, field)
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
    const preProcessedData = await preprocessData(data, preProcessing)
    const created = new Date().toJSON()
    preProcessedData.created = created;
    preProcessedData.modified = created;
    
    const resultStuff = await collection.insertOne(preProcessedData)
    if(!resultStuff.acknowledged){
        throw createError("An Error occured", 500)
    }
    const result = await collection.findOne({ _id: resultStuff.insertedId })
    await Promise.all(
        Object.entries(postProcessing).map(([key, fn]) => fn(result[key], result, collectionKey))
    );
    return result
}
async function preprocessData(inputData, preProcessing) {
    const passThroughFields = ['id', 'url', 'author', 'created']; // These fields will just be passed through

    const processedData = {};

    for (const key of passThroughFields) {
        if (inputData.hasOwnProperty(key)) {
            processedData[key] = inputData[key];
        }
    }
    for (const key in preProcessing) {
        processedData[key] = await preProcessing[key](inputData[key], processedData);
    }
    return processedData;
}

async function updateOne(collectionKey, data, author, {preProcessing = {}, postProcessing = {}}){
    const collection = getCollection(collectionKey);
    const original = await collection.findOne({id: data.id, author:author})
    if(!original){
        throw createError("Data does not exist or you are not the Author", 401);
    }
    data.author = author
    const preProcessedData = await preprocessData(data, preProcessing)
    preProcessedData.modified = new Date().toJSON();
    preProcessedData.created = original.created
    preProcessedData.url = original.url
    if(collection === organizationsCollection){
        preProcessedData.listUsersAsMembers = original.listUsersAsMembers
    }
    const result = await collection.findOneAndUpdate({_id: original._id, author:author}, {$set:preProcessedData}, {returnDocument: 'after'})
    await Promise.all(
        Object.entries(postProcessing).map(([key, fn]) => fn(result[key], result, collectionKey))
    );
    return result
}






const restrictedKeys = ["custom", "familiy", "abilities", "sections","continents", "towns", "genres", "contentWarnings", "races"]



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
    if (!["add", "remove"].includes(method)) {
        throw createError("Unsupported method. Only 'add' and 'remove' are allowed.", 400);
    }
    if (!Array.isArray(ids) || !data ||  typeof list !== "string") {
        throw createError("Invalid Input", 400)
    }
    const collection = getCollection(collectionKey)
    if(modificationRestrictedCollections.includes(collection)){
        throw createError("This collection cannot be modified in this manner", 400);
    }
    if(restrictedKeys.includes(list)){
        throw createError(`Field ${list} cannot be modified in this manner, it is an author managed list`, 400);
    }
    const values = await convertIDs(collectionKey, ids);
    if (!values.length) {
        throw createError("No valid IDs provided for update", 400);
    }
    const temp = values[0]
    const sample = await collection.findOne({_id:temp});
    if (!sample || !Array.isArray(sample[list])) {
        throw createError(`${list} is not a list on this type`, 400);
    }
    let finalList = list
    const match = list.match(/^other(.+)/|/^altForms$/);
    if (!match && collection !== biomesCollection) {
        let otherField = `other${list[0].toUpperCase()}${list.slice(1)}`;
        if (sample[otherField]) {
            finalList = otherField
        }
        else{
            otherField = `altForms`;
            if (sample[otherField]) {
                finalList = otherField
            }
        }
        
    }
    const base = finalList === "altForms"
        ? "races"
        : finalList.replace(/^other/, "").toLowerCase();
        
    const items = await convertIDs(base, ensureArray(data));
    const query = { _id: { $in: values } };
    const stuffToOperate = method === "add"
    ? { $each: items }
    : { $in: items };
    const updateOp = method === "add" ? "$addToSet" : "$pull";
    const payloadPart = {[finalList]:  stuffToOperate}
    if(base !== finalList){
        payloadPart[base] = stuffToOperate
    }
    if(finalList === "altForms"){
        query["race"] = {$nin: items}
    }
    else if(finalList.startsWith("other") ){
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
    if(!text){
        return ""
    }
    if(Array.isArray(text)){
        return text.map((item) => sanitizeText(item))
    }
    else if(typeof text === 'object'){
        const sanitizedObject = {};
        for (const key in text) {
            if (text.hasOwnProperty(key)) {
                sanitizedObject[key] = sanitizeText(text[key]);
            }
        }
        return sanitizedObject;
    }
    return String(text)
    .replace(/<[^>]*>?/gm, '') // remove HTML tags
    .trim();
}








async function createID(name, author){
    const user = await getUserById(author)

    const username = user.username
    return sanitizeId(`${name}_${username}`)
}







function createMap(field, mode = 'display') {
    return {
        $map: {
            input: `$${field}Details`,
            as: "item",
            in: mode === 'edit'
                ? "$$item.id"
                // {
                //     label: "$$item.name" || "$$item.title",
                //     value: "$$item.id",
                //     qualifier: "$$item.types"
                // }
                : mode === 'chapter' ? {
                    value: "$$item.title",
                    url: "$$item.url"
                }: {
                    value: "$$item.name",
                    url: "$$item.url"
                }
        }
    }
}

function optionsMap(field){
    return{
        $map: {
            input: `$${field}`,
            as: "item",
            in:{
                value:"$$item",
                label:"$$item",
                qualifier:"$id"
            }
        }
    }
}

function createProjection(field, type="displayable"){
    if(type === 'edit'){
        return `$${field}Details.id`
        // {
        //     value:`$${field}Details.id`,
        //     label: `$${field}Details.name` || `$${field}Details.title`,
        //     qualifier: `$${field}Details.types`
        // }
    }
    else if(type === "story"){
        return {
            value: `$${field}Details.title`,
            url:`$${field}Details.url`
        }
    }
    else{
        return {
            value:`$${field}Details.name`,
            url:`$${field}Details.url`
        }
    }
}

function sanitizeSections(sections, sectionPrefix=""){
    if(!Array.isArray(sections)){
        return sanitizeSections(ensureArray(sections), sectionPrefix)
    }
    const processedSections = []
    sections.forEach((data, index) => {
        if(typeof data === "object"){
            const section = sanitizeText(data.section)
            const prefix = `${sectionPrefix}${index}`
            const id = sanitizeId(`${prefix}-${section}`)
            const subsections = sanitizeSections(data.subsections, `${prefix}.`)
            const text = sanitizeText(data.text)
            processedSections.push({section, prefix, id, subsections, text})
        }
    })
    return processedSections
}

const createCombiner = (primaryKey, secondaryKey) => (full) => [full[primaryKey], ...(full[secondaryKey] || [])]
const combinedWorlds = createCombiner("originWorld", "otherWorlds")
const combinedBiomes = createCombiner("originBiome", "otherBiomes");
const preProcessText = (value) => sanitizeText(unArray("whatever", value))
const preProcessTextArray = (value) => sanitizeText(ensureArray(value))
const processSingleID = async (value, collectionKey) => await convertIDs(collectionKey, unArray("whatever", value))
const processIDArray = async (value, collectionKey) => await convertIDs(collectionKey, ensureArray(value))


const processBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return ["true", "on", "1", "yes", "y"].includes(normalized)
    }
    if (typeof value === "number") return value === 1;
    return false
}

const addLeaders = async (val, full, key) => {
    const modified = new Date().toJSON();
    if(key ==="organizations" && (full.types || []).includes("Religion")) return
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
    return
}

const expandStory = async (full) => {
    const timestamp = new Date().toJSON();
    await storiesCollection.updateOne(
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

    const previousIDs = await chapterCollection.aggregate([
        {$match: { _id: { $in: previous } }},
        {
            $project:{
                _id:0,
                id:1
            }
        }

    ]).toArray()
    

    const nextIDs = await chapterCollection.aggregate([
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

    if (newEdges.length) {
        await edgeCollection.insertMany(newEdges, { ordered: false }).catch(() => {}); // Avoids dup error
    }
}

const basePreProcessing = {
    name:(value, _full) => preProcessText(value),
    description:(value, _full) => preProcessText(value),
    sections:(value, _full) => sanitizeSections(value),
    custom:(value, _full) => processCustomToIDs(value)
}
const baseFields = [
    "id",
    "name",
    "url",
    "description",
]

const bioFields = [
    "sections",
    "custom",
    "created",
    "modified"
]
const baseFullFields = [
    ...baseFields,
    ...bioFields
]



const baseLookupFields = [
    "author"
]
const baseProjectionFields = {
    author:'$authorDetails.displayname',
}
const baseEditProjectionFields = {
    author:'$authorDetails.username',
}

const worldPreProcessing = {
    ...basePreProcessing,
    continents:(value, _full) => preProcessTextArray(value),
}
const worldFullFields= [
    ...baseFullFields,
    "continents"
]


const chaptersPostProcessing = {
    storyID: (_value, full, _collectionKey) => expandStory(full),
    connect: (_value, full, _collectionKey) => connectChapters(full)
}
const storyPreProcessing = {
    title:(value, _full) => preProcessText(value),
    genres:async (value, _full) => processIDArray(value, "genres"),
    contentWarnings:async (value, _full) => processIDArray(value, "contentwarnings"),
    body:(value, _full) => preProcessText(value),
}
const chaptersPreProcessing = {
    ...storyPreProcessing,
    description:(value, _full) => preProcessText(value),
    storyID: async (value, _full) => processSingleID(value, "stories"),
    samePrevious: async(value, _full) => processIDArray(value, "chapters"),
    anyPrevious: async(value, _full) => processIDArray(value, "chapters"),
    sameNext: async(value, _full) => processIDArray(value, "chapters"),
    anyNext: async(value, _full) => processIDArray(value, "chapters"),
    previous: (_value, full) => combinedPrevious(full),
    next: (_value, full) => combinedNext(full)
}
const storyFields = [
    "id",
    "title",
    "genres",
    "contentWarnings",
    "body",
    "url"
]
const chapterLookupFields=[
    ...baseLookupFields,
    "storyID",
    "previous",
    "next",
]
const chapterProjectFields = {
    ...baseProjectionFields,
    storyID:createProjection("storyID", "story"),
    previous:createMap("previous", "edit"),
    next:createMap("next", "edit"),
}
const chapterEditLookupFields=[
    ...baseLookupFields,
    "samePrevious",
    "sameNext",
    "anyPrevious",
    "anyNext",
]
const chapterEditProjectFields = {
    ...baseEditProjectionFields,
    storyID:createProjection("storyID","edit"),
    samePrevious:createMap("samePrevious", "edit"),
    anyPrevious:createMap("anyPrevious", "edit"),
    sameNext:createMap("sameNext", "edit"),
    anyNext:createMap("anyNext", "edit")
}

const biomeLookupFields = [
    ...baseLookupFields,
    "worlds"
]

const biomeProjectionFields = {
    ...baseProjectionFields,
    worlds:createMap("worlds")
}
 
const biomeEditProjectionFields = {
    ...baseEditProjectionFields,
    worlds:createMap("worlds", "edit")
}
const biomePreProcessing = {
    ...basePreProcessing,
    worlds: async (value, _full) => await processIDArray(value, "worlds")
}
const otherWorldsPreProcessing = {
    otherWorld: async(value, _full) => await processIDArray(value, "worlds")
}

const preProcessWithOriginWorld = {
    originWorld: async (value, _full) => await processSingleID(value, "worlds"),
    ...otherWorldsPreProcessing,
    worlds: (_value, full) => combinedWorlds(full)
}
const preProcessAbilities = {
    abilities: async (value, _full) => await processIDArray(value, "magic")
}

const characterPreProcessing = {
    ...basePreProcessing,
    titles : async(value, _full) => preProcessTextArray(value),
    types: async(value, _full) => processIDArray(value, "charactertypes"),
    race: async(value, _full) => await processSingleID(value, "races"),
    altForms: async(value, _full) => await processIDArray(value, "races"),
    races:(_value, full) => createCombiner("race", "altForms")(full),
    homeWorld: async(value, _full) => await processSingleID(value, "worlds"),
    ...otherWorldsPreProcessing,
    worlds: (_value, full) => combinedWorlds(full),
    homeTown: (value, _full) => preProcessText(value),
    homeCountry: async(value, _full) => await processSingleID(value, "countries"),
    otherCountries: async(value, _full) => await processIDArray(value, "countries"),
    countries: (_value, full) => createCombiner("homeCountry","otherCountries")(full),
    family:async(value, _full) => await processFamilyToIDs(value),
    ...preProcessAbilities,
    organizations:async(value, _full) => await processIDArray(value, "organizations"),
    religion:async(value, _full) => await processSingleID(value, "organizations"),
    allies:async(value, _full) => await processIDArray(value, "characters"),
    enemies:async(value, _full) => await processIDArray(value, "characters"),
}

const containsBiomePreProcessing = {
    ...basePreProcessing,
    ...preProcessWithOriginWorld,
    ...preProcessAbilities,
    originBiome: async(value, _full) => await processSingleID(value, "biomes"),
    otherBiomes: async(value, _full) => await processIDArray(value, "biomes"),
    biomes: (_value, full) => combinedBiomes(full),
    countries: async (value, _full) => processIDArray(value, "countries")
}
const preProcessLeaders = {
    ...basePreProcessing,
    leaders: async(value, _full ) => await processIDArray(value, "characters"),
    authorIsLeader: (value, _full) => processBoolean(value),
    ...preProcessWithOriginWorld, 
}

const countriesPreProssesing = {
    ...preProcessLeaders,
    types: async (value, _full) => await processIDArray(value, "countrytypes"),
    biomes: async (value, _full) => await processIDArray(value, "biomes"),
    continents: (value, _full) => preProcessTextArray(value),
    towns: (value, _full) => preProcessTextArray(value)
}
const organizationsPreProcessing = {
    ...preProcessLeaders,
    types: async (value, _full) => await processIDArray(value, "organizationtypes"),
    countries: async (value, _full) => await processIDArray(value, "countries"),
}
const postProcessLeader = {
    leaders: async (value, full, catagoryKey) => await addLeaders(value, full, catagoryKey)
}

const magicSystemPreProcessing = {
    ...basePreProcessing,
    types: async (value, _full) => await processIDArray(value, "magictypes"),
    ...preProcessWithOriginWorld,
}

const wildlifePreProcessing = {
    ...containsBiomePreProcessing,
    types: async (value, _full) => await processIDArray(value, "wildlifetypes")
}

const floraPreProcessing = {
    ...containsBiomePreProcessing,
    types: async (value, _full) => await processIDArray(value, "floratypes")
}
const racePreProcessing = {
    ...basePreProcessing,
    ...preProcessWithOriginWorld,
    ...preProcessAbilities,
    types: async (value, _full) => await processIDArray(value, "racetypes"),
    countries: async (value, _full) => await processIDArray(value, "countries"),
}



const abilitiesProjectionFields = {
    abilities:createMap("abilities")
}

const abilitiesEditProjectionFields = {
    abilities:createMap("abilities", "edit")
}

const otherWorldsProjectionFields = {
    otherWorlds:createMap("otherWorlds")
}

const otherWorldsEditProjectionFields = {
    otherWorlds:createMap("otherWorlds", "edit")
}






const characterProjectionFields = {
    ...baseProjectionFields,
    homeWorld:createProjection("homeWorld"),
    homeCountry:createProjection("homeCountry"),
    race:createProjection("race"),
    religion:createProjection("religion")
}

const characterBioProjectionFields = {
    ...characterProjectionFields,
    ...abilitiesProjectionFields,
    ...otherWorldsProjectionFields,
    otherCountries:createMap("otherCountries"),
    altForms:createMap("altForms"),
    organizations:createMap("organizations"),
    allies:createMap("allies"),
    enemies:createMap("enemies"),
}

const characterEditProjectionFields = {
    ...baseEditProjectionFields,
    homeWorld:createProjection("homeWorld","edit"),
    homeCountry:createProjection("homeCountry", "edit"),
    ...otherWorldsEditProjectionFields,
    otherCountries:createMap("otherCountries", "edit"),
    ...abilitiesEditProjectionFields,
    race:createProjection("race", "edit"),
    altForms:createMap("altForms", "edit"),
    organizations:createMap("organizations", "edit"),
    allies:createMap("allies", "edit"),
    enemies:createMap("enemies", "edit"),
    religion:createProjection("religion","edit")
}

const bioWithTypes = [
    ...bioFields,
    "types",
]

const characterCards = [
    ...baseFields,
    "gender",
    "pronouns",
    "born",
    "died",
    "homeTown"
]
const characterCardsLookup = [
    ...baseLookupFields,
    "race",
    "religion",
    "homeWorld",
    "homeCountry"
]

const characterFullFields = [
    ...characterCards,
    "family",
    ...bioWithTypes
]

const characterFullLookupFields = [
    ...characterCardsLookup,
    "altForms",
    "organizations",
    "abilities",
    "enemies",
    "allies",
    "otherWorlds",
    "otherCountries"
]


const livingThingProjectionFields = {
    ...baseProjectionFields,
    originWorld:createProjection("originWorld"),
    originBiome:createProjection("originBiome"),
}

const livingThingBioProjectionFields = {
    ...livingThingProjectionFields,
    ...abilitiesProjectionFields,
    ...otherWorldsProjectionFields,
    otherBiomes:createMap("otherBiomes"),
    countries:createMap("countries"),
}

const livingThingEditProjectionFields = {
    ...baseEditProjectionFields,
    originWorld:createProjection("originWorld","edit"),
    originBiome:createProjection("originBiome"),
    otherBiomes:createMap("otherBiomes", "edit"),
    ...otherWorldsEditProjectionFields,
    countries:createMap("countries", "edit"),
    ...abilitiesEditProjectionFields,
}


const livingThingCardLookups = [
    ...baseLookupFields,
    "originWorld",
    "originBiome",
]


const fullBio = [
    ...baseFields,
    ...bioWithTypes
]


const livingThingFullLookups = [
    ...livingThingCardLookups,
    "otherWorlds",
    "otherBiomes",
    "countries",
    "abilities"
]

const raceProjectionFields = {
    ...baseProjectionFields,
    originWorld:createProjection("originWorld"),
}

const raceBioProjectionFields = {
    ...raceProjectionFields,
    ...abilitiesProjectionFields,
    ...otherWorldsProjectionFields,
    countries:createMap("countries"),
}

const raceEditProjectionFields = {
    ...baseEditProjectionFields,
    originWorld:createProjection("originWorld","edit"),
    ...otherWorldsEditProjectionFields,
    countries:createMap("countries", "edit"),
    ...abilitiesEditProjectionFields,
}

const raceCardLookups = [
    ...baseLookupFields,
    "originWorld"
]

const raceFullLookups = [
    ...raceCardLookups,
    "abilities",
    "otherWorlds",
    "countries",
]

const baseInstitutionCards = [
    ...baseFields,
    "authorIsLeader",
]

const institutionLookups = [
    ...baseLookupFields,
    "originWorld",
]

const magicSystemFullLookups = [
    ...institutionLookups,
    "otherWorlds",   
]
const institutionFullFields = [
    ...baseInstitutionCards,
    ...bioWithTypes,
]

const institutionFullLookups = [
    ...institutionLookups,
    "otherWorlds",   
    "leaders"
]
const institutionProjectionFields = {
    ...baseProjectionFields,
    originWorld:createProjection("originWorld"),
}

const institutionBioProjectionFields = {
    ...institutionProjectionFields,
    ...otherWorldsProjectionFields,
}

const organizationBioProjectionFields = {
    ...institutionBioProjectionFields,
    countries:createMap("countries"),

}

const institutionEditProjectionFields = {
    ...baseEditProjectionFields,
    originWorld:createProjection("originWorld","edit"),
    ...otherWorldsEditProjectionFields,
}

const organizationEditFields = {
    ...institutionEditProjectionFields,
    countries:createMap("countries", "edit"),
}

const countryBioProjectionFields = {
    ...institutionBioProjectionFields,
    biomes:createMap("biomes"),

}
const countryEditFields = {
    ...institutionEditProjectionFields,
    biomes:createMap("biomes", "edit"),
}

const organizationFullLookups = [
    ...institutionFullLookups,
    "countries"
]
const countryFullFields = [
    ...institutionFullFields,
    "continents",
    "towns"
]
const countryFullLookups = [
    ...institutionFullLookups,
    "biomes",
]

const baseUnwindFields = [
    "authorDetails"
]
const raceUnwindFields = [
    ...baseUnwindFields,
    "originWorldDetails"
]
const livingThingUnwindFields = [
    ...raceUnwindFields,
    "originBiomeDetails"
]
const characterUnwindFields = [
    ...baseUnwindFields,
    "raceDetails",
    "homeWorldDetails",
    "homeCountryDetails",
    "relegionDetails"
]
const cardsMap = {
    stories:{
        lookupFields:baseLookupFields, 
        projectionFields:baseProjectionFields,
        unwindFields:baseUnwindFields,
        fields:storyFields
    },
    chapter:{
        lookupFields:baseLookupFields, 
        projectionFields:baseProjectionFields,
        unwindFields:baseUnwindFields,
        fields:["title","url", "id"]
    },
    worlds:{
        lookupFields:baseLookupFields,
        fields:baseFields,
        projectionFields:baseProjectionFields,
        unwindFields:baseUnwindFields,
    },
    wildlife:{
        lookupFields:livingThingCardLookups,
        fields:baseFields,
        projectionFields:livingThingProjectionFields,
        unwindFields:livingThingUnwindFields
    },
    flora:{
        lookupFields:livingThingCardLookups,
        fields:baseFields,
        projectionFields:livingThingProjectionFields,
        unwindFields:livingThingUnwindFields
    },
    races:{
        lookupFields:raceCardLookups,
        fields:baseFields,
        projectionFields:raceProjectionFields,
        unwindFields:raceUnwindFields
    },
    organizations:{
        lookupFields:institutionLookups,
        fields:baseInstitutionCards,
        projectionFields:institutionProjectionFields,
        unwindFields:raceUnwindFields
    },
    magicsystems:{
        lookupFields:institutionLookups,
        fields:baseFields,
        projectionFields:institutionProjectionFields,
        unwindFields:raceUnwindFields
    },
    countries:{
        lookupFields:institutionLookups,
        fields:baseInstitutionCards,
        projectionFields:institutionProjectionFields,
        unwindFields:raceUnwindFields
    },
    characters:{
        lookupFields:characterCardsLookup,
        fields:characterCards,
        projectionFields:characterProjectionFields,
        unwindFields:characterUnwindFields

    },
    biomes:{
        lookupFields:baseLookupFields,
        fields:baseFields,
        projectionFields:baseProjectionFields,
        unwindFields:baseUnwindFields
    },
    users:{
        fields:["displayname"]
    },
    writingadvice:{
        fields:["description"]
    },
    writingprompts:{
        fields:["description"]
    }
}
const chapterUnwindFields = [
    ...baseUnwindFields,
    "storyIDDetails"
]

const displayableMap = {
    stories:{
        lookupFields:baseLookupFields, 
        projectionFields:baseProjectionFields,
        fields:[...storyFields, "created", "modified", "expanded"],
        unwindFields:baseUnwindFields,
    },
    chapter:{
        fields:[...storyFields, "description", "created", "modified"],
        lookupFields:chapterLookupFields,
        projectionFields:chapterProjectFields,
        unwindFields:chapterUnwindFields
    },
    worlds:{
        lookupFields:baseLookupFields,
        fields:worldFullFields,
        projectionFields:baseProjectionFields,
        unwindFields:baseUnwindFields,
    },
    wildlife:{
        lookupFields:livingThingFullLookups,
        fields:fullBio,
        projectionFields:livingThingBioProjectionFields,
        unwindFields:livingThingUnwindFields
    },
    flora:{
        lookupFields:livingThingFullLookups,
        fields:fullBio,
        projectionFields:livingThingBioProjectionFields,
        unwindFields:livingThingUnwindFields
    },
    races:{
        lookupFields:raceFullLookups,
        fields:fullBio,
        projectionFields:raceBioProjectionFields,
        unwindFields:raceUnwindFields
    },
    organizations:{
        lookupFields:organizationFullLookups,
        fields:[...institutionFullFields, "listUsersAsMembers"],
        projectionFields:organizationBioProjectionFields,
        unwindFields:raceUnwindFields
    },
    magicsystems:{
        lookupFields:magicSystemFullLookups,
        fields:fullBio,
        projectionFields:institutionBioProjectionFields,
        unwindFields:raceUnwindFields
    },
    countries:{
        lookupFields:countryFullLookups,
        fields:institutionFullFields,
        projectionFields:countryBioProjectionFields,
        unwindFields:raceUnwindFields
    },
    characters:{
        lookupFields:characterFullLookupFields,
        fields:characterFullFields,
        projectionFields:characterBioProjectionFields,
        unwindFields:characterUnwindFields
    },
    biomes:{
        lookupFields:biomeLookupFields,
        fields:baseFullFields,
        projectionFields:biomeProjectionFields,
        unwindFields:baseUnwindFields,
    }
}

const mapOptionsMap = {
    continents:{
        collection:"worlds",
        projectionFields:{
            label:"$continents",
            value:"$continents",
            qualifier:"$id"
        },
        unwindFields:["continents"],
    },
    towns:{
        collection:"countries",
        projectionFields:{
            label:"$towns",
            value:"$towns",
            qualifier:"$id"

        },
        unwindFields:["towns"],
    }
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
    listUserDisplay,
    createMap,
    createProjection,
    ensureArray,
    baseFields,
    worldPreProcessing,
    worldFullFields,
    baseProjectionFields,
    baseLookupFields,
    storyPreProcessing,
    chaptersPreProcessing,
    chaptersPostProcessing,
    storyFields,
    baseEditProjectionFields,
    chapterLookupFields,
    chapterProjectFields,
    chapterEditLookupFields,
    chapterEditProjectFields,
    biomeLookupFields,
    biomeProjectionFields,
    biomeEditProjectionFields,
    biomePreProcessing,
    optionsMap,
    characterPreProcessing,
    countriesPreProssesing,
    organizationsPreProcessing,
    postProcessLeader,
    magicSystemPreProcessing,
    wildlifePreProcessing,
    floraPreProcessing,
    racePreProcessing,
    characterCards,
    characterCardsLookup,
    characterFullFields,
    characterFullLookupFields,
    livingThingCardLookups,
    livingThingFullLookups,
    raceFullLookups,
    raceCardLookups,
    fullBio,
    baseInstitutionCards,
    institutionLookups,
    magicSystemFullLookups,
    institutionFullFields,
    institutionFullLookups,
    organizationFullLookups,
    countryFullFields,
    countryFullLookups,
    characterProjectionFields,
    characterBioProjectionFields,
    characterEditProjectionFields,
    livingThingProjectionFields,
    livingThingBioProjectionFields,
    livingThingEditProjectionFields,
    raceProjectionFields,
    raceBioProjectionFields,
    raceEditProjectionFields,
    institutionProjectionFields,
    organizationBioProjectionFields,
    organizationEditFields,
    countryBioProjectionFields,
    countryEditFields,
    raceCardLookups,
    sanitizeId,
    mapOptionsMap,
    cardsMap,
    displayableMap,
    chapterUnwindFields,
    baseUnwindFields,
    raceUnwindFields,
    livingThingUnwindFields,
    characterUnwindFields,
    baseFullFields,
    bioWithTypes,
    institutionBioProjectionFields,
    institutionEditProjectionFields,
    addAuth,
    removeAuth,
    getAuth


}