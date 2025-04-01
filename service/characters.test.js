const request = require('supertest');
const {testGetSpecific,
    testUpdate,
    testNotExist, 
    testWrongAuthor, 
    testPatchAdd, 
    testPatchRemove,
    testPatchNotFound,
    testPatchFailures,
    testPatchSections,
    testPatchCustom,
    testGetOptions,
    testGetFilteredOptions,
    testGetMany,
    testGetManyFiltered,
    testIsAuthor,
    testisNotAuthor,
    testNotFound,
    testPatchDescription
} = require('./testUtils')
const {app, createID} = require('./service');

const {registerUser, getRandomName} = require('./service.test');

const {characterRouter} = require("./characters");




app.use('/api', characterRouter);

test('get characters', async () => {
    await testGetMany(app, "characters")
})

test('get character types', async () => {
   await testGetMany(app, "characters/types");
})

test('fail to get character', async () => {
    await testNotFound(app, "characters");
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

test("Test Update Character", async () => {
    const [register, ,characterReturn] = await createCharacter();
    const character = characterReturn.body;
    character.race= "newRace";
    character.altForms = ["whatever"];
    character.homeWorld = ["cool"];
    character.otherWorlds = ["neet"];
    character.homeCountry = ["why"];
    character.otherCountries = ["why_not"]
    const {modified, ...expected} = character;
    expected.worlds = [expected.homeWorld, ...expected.otherWorlds];
    expected.countries = [expected.homeCountry, ...expected.otherCountries];
    expected.races = [expected.race, ...expected.altForms];
    await testUpdate(register, character, expected, app)
    // const cookie = register.headers['set-cookie'];
    // const updateCharacter = await request(app).put(`/api${character.url}`).send(character).set("Cookie", cookie);
    // expect(updateCharacter.headers['content-type']).toMatch('application/json; charset=utf-8');
    // const {modified: modifiedResult, ...characterResult} = updateCharacter.body
    // expect(modifiedResult != modified).toBe(true);
    // expect(characterResult).toMatchObject(expected)
});

test("Test Character update, no character of that id found", async () => {

    const [register, , name] = await registerUser();
    await testNotExist(register, `/characters/${name}`, app)
    // const cookie = register.headers['set-cookie'];
    // const updateCharacter = await request(app).put(`/api/characters/${name}`).send({name:"nonsence"}).set("Cookie", cookie);
    // expect(updateCharacter.status).toBe(404)
});

test("Test Character update, not author", async () => {
    // const [register] = await registerUser();
    // const cookie = register.headers['set-cookie'];
    const [ , ,characterReturn] = await createCharacter();
    const character = characterReturn.body;
    // character.description ="test changing wrong author";
    await testWrongAuthor(character, app)
    // const updateCharacter = await request(app).put(`/api${character.url}`).send(character).set("Cookie", cookie);

    // expect(updateCharacter.status).toBe(401)
});

test("Test Get Character", async () => {
    const [ , ,characterReturn] = await createCharacter();
    const character = characterReturn.body;
    await testGetSpecific(character, app)

})


test("Filter Characters", async () => {
    const [ , ,characterReturn] = await createCharacter();
    const character = characterReturn.body;
    await testGetManyFiltered(app, "characters", "race", character.race, "worlds", character.worlds)
})

test("Get Options", async() => {
    const [ , ,characterReturn] = await createCharacter();
    const character = characterReturn.body;
    await testGetOptions(app, "characters", character, "roles")
})

test("Get Filtered Options", async () => {
    const [ , ,characterReturn] = await createCharacter();
    const character = characterReturn.body;
    await testGetFilteredOptions(app, "characters", "race", character.race, "worlds", character.worlds)
})

test("Is author", async () => {
    const [ , ,characterReturn] = await createCharacter();
    const character = characterReturn.body;
    await testIsAuthor(app, character)
})

test("Is Not author", async () => {
    const [ , ,characterReturn] = await createCharacter();
    const character = characterReturn.body;
    await testisNotAuthor(app, character)
})

test("Add stuff", async () => {
    const [ , ,characterReturn] = await createCharacter();
    const path = characterReturn.body.url
    await testPatchAdd(path, "otherWorlds", app)
    await testPatchAdd(path, "otherCountries", app)
    await testPatchAdd(path, "organizations", app)
    await testPatchAdd(path, "roles", app)
    await testPatchAdd(path, "altForms", app)

})

test("Delete stuff", async () => {
    const [ , ,characterReturn,,, , , ,,, ,
        roles, ,
        altForms,, 
        organizations,,,,,
        otherWorlds,,
        otherCountries,,,,
    ] = await createCharacter();
    const path = characterReturn.body.url;
    await testPatchRemove(path,"otherWorlds", otherWorlds[0],app )
    await testPatchRemove(path,"otherCountries", otherCountries[0],app )
    await testPatchRemove(path,"organizations", organizations[0],app )
    await testPatchRemove(path,"roles", roles[0],app )
    await testPatchRemove(path,"altForms", altForms[0],app )
})

test("Attempt to modify nonexisting", async () => {
    await testPatchNotFound("characters", "otherWorlds", app);
})

test("Attempt to modify fields that arnt allowed", async () => {
    const [ , ,characterReturn] = await createCharacter();
    const path = characterReturn.body.url;
    await testPatchFailures(path, "homeWorld", app)
    await testPatchFailures(path, "worlds", app)
    await testPatchFailures(path, "homeCountry", app)
    await testPatchFailures(path, "country", app)
    await testPatchFailures(path, "homeTown", app)
    await testPatchFailures(path, "races", app)
    await testPatchFailures(path, "family", app)
    await testPatchFailures(path, "titles", app)
    await testPatchFailures(path, "abilities", app)
    await testPatchSections(path, app)
    await testPatchCustom(path, app)
    await testPatchDescription(path, app)
})