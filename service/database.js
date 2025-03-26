const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('yggdrasil');

const userCollection = db.collection('user');
const worldsCollection = db.collection('worlds');
const worldBiosCollection = db.collection('worldBios')

const floraCollection = db.collection('flora');
const floraBiosCollection = db.collection('floraBios');

const wildlifeCollection = db.collection('wildlife');
const wildlifeBiosCollection = db.collection('wildlifeBios');

const charactersCollection = db.collection('characters');
const characterBiosCollection = db.collection('characterBios');
const characterTypesCollection = db.collection('characterTypes');

const racesCollection = db.collection('races');
const raceBiosCollection = db.collection('racesBios');
const raceTypesCollection = db.collection('raceTypes');

const organizationsCollection = db.collection('organizations');
const organizationBiosCollection = db.collection('organizationBios');
const organizationTypesBiosCollection = db.collection('organizationTypesBios');


const magicSystemsCollection = db.collection('magicsystems');
const magicSystemBiosCollection = db.collection('magicsystemBios');
const magicTypesBiosCollection = db.collection('magicTypes');


const countriesCollection = db.collection('countries');
const countryBiosCollection = db.collection('countryBios');
const countryTypesCollection = db.collection('countryTypes');


const biomesCollection = db.collection('biomes');
const biomeBiosCollection = db.collection('biomeBios');

const writingadviceCollection = db.collection('writingadvice')
const writingpromptsCollection = db.collection('writingprompts')
const storiesCollection = db.collection('stories')
const genresCollection = db.collection('genres')
const contentwarningsCollection = db.collection('contentwarnings')
