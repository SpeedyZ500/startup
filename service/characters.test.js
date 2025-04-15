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
    testPatchDescription,
    testMismatchIDs,
    testNoDataPassed, 
    registerUser, 
    createCharacter
} = require('./testUtils')
const {app} = require('./service');
const {createID} = require('./database')


const characterRouter = require("./characters");




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
        types, 
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
    ] = await createCharacter(app);
    const {created, modified, ...characterWithoutDates} = character.body;
    const worlds = [homeWorld, ...otherWorlds]
    const countries = [homeCountry, ...otherCountries]
    const races = [race, ...altForms];
    expect(character.headers['content-type']).toMatch('application/json; charset=utf-8');
    const url = `/characters/${id}`
    const expected = {
        id,
        name,
        url,
        author,
        family,
        titles,
        gender,
        pronouns,
        born,
        died,
        types,
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
    }

    expect(characterWithoutDates).toMatchObject(expected)
});

test("Test Duplicate Character Creation", async () => {
    const [register, , , , name ] = await createCharacter(app);
    const cookie = register.headers['set-cookie'];
    const description = "Duplicate test";
    const character = await request(app).post('/api/characters').send({name, description}).set("Cookie", cookie);
    expect(character.status).toBe(409);
});

test("Test Character Creation missing required field", async () => {
    const [register, , name] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const character = await request(app).post('/api/characters').send({name}).set("Cookie", cookie);
    expect(character.status).toBe(409);
});

test("Test Update Character", async () => {
    const [register, ,characterReturn] = await createCharacter(app);
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
});


test("Test Update Character ID Mismatch", async () => {
    const [register, ,characterReturn] = await createCharacter(app);
    const character = characterReturn.body;
    await testMismatchIDs(app,register, character )
    

});

test("Test Update Character No Data passed", async () => {
    const [register, ,characterReturn] = await createCharacter(app);
    const character = characterReturn.body;
    await testNoDataPassed(app,register, character )

});

test("Test Character update, no character of that id found", async () => {

    const [register, , name] = await registerUser(app);
    await testNotExist(register, `/characters/${name}`, app)
});

test("Test Character update, not author", async () => {
    // const [register] = await registerUser(app);
    // const cookie = register.headers['set-cookie'];
    const [ , ,characterReturn] = await createCharacter(app);
    const character = characterReturn.body;
    // character.description ="test changing wrong author";
    await testWrongAuthor(character, app)
    // const updateCharacter = await request(app).put(`/api${character.url}`).send(character).set("Cookie", cookie);

    // expect(updateCharacter.status).toBe(401)
});

test("Test Get Character", async () => {
    const [ , ,characterReturn] = await createCharacter(app);
    const character = characterReturn.body;
    await testGetSpecific(character, app)

})


test("Filter Characters", async () => {
    const [ , ,characterReturn] = await createCharacter(app);
    const character = characterReturn.body;
    await testGetManyFiltered(app, "characters", "race", character.race, "worlds", character.worlds)
})

test("Get Options", async() => {
    const [ , ,characterReturn] = await createCharacter(app);
    const character = characterReturn.body;
    await testGetOptions(app, "characters", character, "types")
})

test("Get Filtered Options", async () => {
    const [ , ,characterReturn] = await createCharacter(app);
    const character = characterReturn.body;
    await testGetFilteredOptions(app, "characters", "race", character.race, "worlds", character.worlds)
})

test("Is author", async () => {
    const [ , ,characterReturn] = await createCharacter(app);
    const character = characterReturn.body;
    await testIsAuthor(app, character)
})

test("Is Not author", async () => {
    const [ , ,characterReturn] = await createCharacter(app);
    const character = characterReturn.body;
    await testisNotAuthor(app, character)
})

test("Add stuff", async () => {
    const [ , ,characterReturn] = await createCharacter(app);
    const path = characterReturn.body.url
    await testPatchAdd(path, "otherWorlds", app)
    await testPatchAdd(path, "otherCountries", app)
    await testPatchAdd(path, "organizations", app)
    await testPatchAdd(path, "types", app)
    await testPatchAdd(path, "altForms", app)

})

test("Delete stuff", async () => {
    const [ , ,characterReturn,,, , , ,,, ,
        types, ,
        altForms,, 
        organizations,,,,,
        otherWorlds,,
        otherCountries,,,,
    ] = await createCharacter(app);
    const path = characterReturn.body.url;
    await testPatchRemove(path,"otherWorlds", otherWorlds[0],app )
    await testPatchRemove(path,"otherCountries", otherCountries[0],app )
    await testPatchRemove(path,"organizations", organizations[0],app )
    await testPatchRemove(path,"types", types[0],app )
    await testPatchRemove(path,"altForms", altForms[0],app )
})

test("Attempt to modify nonexisting", async () => {
    await testPatchNotFound("characters", "otherWorlds", app);
})

test("Attempt to modify fields that arnt allowed", async () => {
    const [ , ,characterReturn] = await createCharacter(app);
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

test("Get Character Types optoins", async () => {
    const [ , ,characterReturn,,, , , ,,, ,
        types ] = await createCharacter(app);
    const option = {id:types[0], name:types[0]}
    await testGetOptions(app, "characters/types", option);
})