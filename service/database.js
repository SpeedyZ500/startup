const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('yggdrasil');

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

    continent:worldsCollection,

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
    hometown: countriesCollection,
    countrytypes: countryTypeCollection,
    

    chapters: chapterCollection,
    stories: storiesCollection,

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
async function getCollection(value){
    const key = normalizeKey(key);
    return collectionsMap[key] || null;
}

async function processFilters(rawFilters){
    const processed = {};
    for(const key in rawFilters){
        let value = rawFilters[key]
        const isExclusion = key.toLowerCase().includes("excludes");
        const field = key.replace(/excludes/i, "").trim();
        const temp = convertIDs(key, value)
        if(processed[field]){
            if(isExclusion){
                processed[field] = 
                [...processed[field],  {$nin: Array.isArray(temp) ? temp : [temp]}] 
            }
            else{
                processed[field] = 
                [...processed[field],  {$in: Array.isArray(temp) ? temp : [temp]}] 
            }
        }
        else{
            if(isExclusion){
                processed[field] = {$in: Array.isArray(temp) ? temp : [temp]}
            }
            else{
                processed[field],  {$nin: Array.isArray(temp) ? temp : [temp]} 
            }
        }
    }
    return processed
}

async function processFamilyToIDs(family){
    return family
}

async function processCustomToIDs(custom){
    return custom
}
async function convertIDs(collectionKey, input){
    if(collectionKey === custom){
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
            return input;
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
        throw new Error(`Missing one or more ${collectionKey}`);
    }
    return isArray ? found : found[0];
}

async function addTypesBatch(collection, ids){
    // Find all items in one go
    const existingItems = await collection.find({ value: { $in: ids } }).toArray();
    const existingValues = existingItems.map(item => item.value);
    
    // Find values that are missing and insert them
    const missingValues = ids.filter(id => !existingValues.includes(id));
    if (missingValues.length > 0) {
        const insertResults = await collection.insertMany(missingValues.map(value => ({ value })));
        existingItems.push(...insertResults.ops);
    }

    // Return all items (existing or newly inserted)
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
            else if(!processedKeys.has(key)){
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
                    $unwind: {
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



async function getOptions(collectionKey, { filter = {}, sort = {}}){
    const collection = getCollection(collectionKey)

    if(excludeCollections.includes(collection)){
        return [];
    }
    

    if(typeCollections.includes(collection)){
        return await getTypeOptions(collection)
    }
    else if(storyCollections.includes(collection)){
        if(collection === chapterCollection){
            return await getCatagoryOptions(storiesCollection, {filter, sort, labelField:"title", qualifierField:"storyID"})
        }
        return await getCatagoryOptions(storiesCollection, {filter, sort, labelField:"title"})
    }
    else if(collection === userCollection){
        return getCatagoryOptions(collection, {filter, sort, labelField:"displayname", valueField:"username"})
    }
    else{
        return getCatagoryOptions(collection, {filter, sort})
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
        filter = {}, 
        sort = {},
        labelField = "name",
        valueField = "id",
        qualifierField = "types"
    } = {}
    ){
    const pipeline = [];

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
        project.qualifier = `$${qualifierField}`;
    }

    pipeline.push({ $project: project });

    return await collection.aggregate(pipeline).toArray();
}

async function getUser(username){
    return await userCollection.findOne({username:username});
}
function getUserByToken(token){
    return userCollection.findOne({token:token})
}

async function addUser(user){
    return await userCollection.insertOne(user)
}

async function updateUser(user){
    return await userCollection.updateOne({username: user.username},{$set: user});
}

async function listUserDisplay(){
    return await userCollection.find({},{projection:{displayname:1}}).toArray();
}






























module.exports = {
    addUser,
    getUser,
    getUserByToken,
    updateUser,
    listUserDisplay
}