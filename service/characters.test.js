const request = require('supertest');
const {app, createID} = require('./service');

const {registerUser, getRandomName} = require('./service.test');

const {characterRouter} = require("./characters");


app.use('/api', characterRouter);

test('get characters', async () => {
    const characters = await request(app).get('/api/characters');
    expect(characters.status).toBe(200);
    expect(Array.isArray(characters.body)).toBe(true);
})

test('get character types', async () => {
    const charactersTypes = await request(app).get('/api/characters/types');
    expect(charactersTypes.status).toBe(200);
    expect(Array.isArray(charactersTypes.body)).toBe(true);
})

test('fail to get character', async () => {
    const charactersTypes = await request(app).get('/api/characters/bye');
    expect(charactersTypes.status).toBe(404);
})

async function createCharacter(){
    const [register, , author] = await registerUser();
    const cookie = register.headers['set-cookie'];
    const name = getRandomName("name");
    const family = [{
        label:getRandomName('relation'), 
        value:[getRandomName('character')]
    }];
    const titles = [getRandomName("title")];
    const born = "in more interesting times";
    const died = "in lest intersting times"
    const roles = ["test-character"];
    const race = getRandomName('race');
    const altForms = [getRandomName('race')];
    const religion = getRandomName("religion");
    const organizations = [getRandomName("organization")];
    const abilities = [getRandomName('magicSystem')]
    const enemies = [getRandomName('character')]
    const allies = [getRandomName('character')]
    const homeWorld = getRandomName("world")
    const otherWorlds = [getRandomName("world")]
    const homeCountry = getRandomName("country")
    const otherCountries = [getRandomName("country")]
    const homeTown = getRandomName("town")
    const description = "an example description"
    const sections = [{
        section: "test section",
        text: "A test section",
        subsections:[]
    }]
    const custom = [
        {
            edit:"select",
            label:"Alchemy Specialty",
            source:"/magicsystems",
            type:"alchemy",
            value:getRandomName("magicsystem")
        }
    ]
    const gender = "what are you a cop"
    const pronouns = "wouldn't you like to know wheather boy"



    const character = await request(app).post('/api/characters').send({
        name,
        family,
        titles,
        gender, 
        pronouns,
        born,
        died,
        roles,
        race,
        altForms,
        religion,
        organizations,
        abilities,
        enemies,
        allies,
        homeWorld,
        otherWorlds,
        homeCountry,
        otherCountries,
        homeTown,
        description,
        sections,
        custom
    })
    .set('Cookie', cookie)
    const id = createID(name, author)
    return [
        register, 
        author, 
        character, 
        id,
        name, 
        family, 
        titles, 
        gender,
        pronouns,
        born, 
        died,
        roles, 
        race,
        altForms,
        religion, 
        organizations,
        abilities,
        enemies,
        allies,
        homeWorld,
        otherWorlds,
        homeCountry,
        otherCountries,
        homeTown,
        description,
        sections,
        custom
    ]
}

test("Test Character Creation", async () => {
    const [
        register, 
        author, 
        character, 
        id,
        name, 
        family, 
        titles, 
        gender,
        pronouns,
        born, 
        died,
        roles, 
        race,
        altForms,
        religion, 
        organizations,
        abilities,
        enemies,
        allies,
        homeWorld,
        otherWorlds,
        homeCountry,
        otherCountries,
        homeTown,
        description,
        sections,
        custom
    ] = await createCharacter();
    const {created, modified, url, ...characterWithoutDates} = character.body;
    const worlds = [homeWorld, ...otherWorlds]
    const countries = [homeCountry, ...otherCountries]
    const races = [race, ...altForms];
    expect(character.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(characterWithoutDates).toMatchObject({
        id,
        name,
        author,
        family,
        titles,
        gender,
        pronouns,
        born,
        died,
        roles,
        race,
        altForms,
        races,
        religion,
        organizations,
        abilities,
        enemies,
        allies,
        homeWorld,
        homeCountry,
        homeTown,
        otherWorlds,
        otherCountries,
        countries,
        worlds,
        custom,
        description,
        sections
    })
});

test("Test Duplicate Character Creation", async () => {
    const [register, , , , name ] = await createCharacter();
    const cookie = register.headers['set-cookie'];
    const description = "Duplicate test";
    const character = await request(app).post('/api/characters').send({name, description}).set("Cookie", cookie);
    expect(character.status).toBe(409);
});

test("Test Character Creation missing required field", async () => {
    const [register, , name] = await registerUser();
    const cookie = register.headers['set-cookie'];
    const character = await request(app).post('/api/characters').send({name}).set("Cookie", cookie);
    expect(character.status).toBe(409);
});