const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('yggdrasil');

// Collections
const userCollection = db.collection('user');
const worldsCollection = db.collection('worlds');
const floraCollection = db.collection('flora');
const floraTypesCollection = db.collection('floraTypes');
const wildlifeCollection = db.collection('wildlife');
const wildlifeTypesCollection = db.collection('wildlifeTypes');
const charactersCollection = db.collection('characters');
const characterTypesCollection = db.collection('characterTypes');
const racesCollection = db.collection('races');
const raceTypesCollection = db.collection('raceTypes');
const organizationsCollection = db.collection('organizations');
const organizationTypesCollection = db.collection('organizationTypesBios');
const magicSystemsCollection = db.collection('magicsystems');
const magicTypesCollection = db.collection('magicTypes');
const countriesCollection = db.collection('countries');
const countryTypesCollection = db.collection('countryTypes');
const biomesCollection = db.collection('biomes');
const writingadviceCollection = db.collection('writingadvice');
const writingpromptsCollection = db.collection('writingprompts');
const storiesCollection = db.collection('stories');
const genresCollection = db.collection('genres');
const contentwarningsCollection = db.collection('contentwarnings');
const chapterCollection = db.collection('chapter');

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