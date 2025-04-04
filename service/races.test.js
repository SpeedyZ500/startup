const request = require('supertest');
const {app, createID} = require('./service');
const {racesRouter} = require(`./worldbuilding/races`);
app.use('/api', racesRouter);

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
    getRandomName
} = require('./testUtils')







test('get Races', async () => {
    await testGetMany(app, "worldbuilding/races")
})

test('get Races types', async () => {
   await testGetMany(app, "worldbuilding/races/types");
})

test('fail to get Races', async () => {
    await testNotFound(app, "worldbuilding/races");
})

async function createRace(){
    const [register, , author] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const name = getRandomName("name");
    const types = ["Humanoid"];
    const abilities = [getRandomName('magicSystem')]
    const countries = [getRandomName('country')]
    const originWorld = getRandomName("world")
    const otherWorlds = [getRandomName("world")]
    const description = "an example description"
    const sections = [{
        section: "test section",
        text: "A test section",
        subsections:[]
    }]
    const custom = [
        {
            edit:"Text",
            label:"Origin",
            
            value:"Sleepy time"
        }
    ]
    


    const race = await request(app).post('/api/worldbuilding/races').send({
        name,
        types,
        abilities,
        originWorld,
        otherWorlds,
        countries,
        description,
        sections,
        custom
    })
    .set('Cookie', cookie)
    const id = createID(name, author)
    return [
        register, 
        author, 
        race, 
        id,
        name, 
        types, 
        abilities,
        originWorld,
        otherWorlds,
        countries,
        description,
        sections,
        custom
    ]
}

test("Test Character Creation", async () => {
    const [
        register, 
        author, 
        race, 
        id,
        name, 
        types, 
        abilities,
        originWorld,
        otherWorlds,
        countries,
        description,
        sections,
        custom
    ] = await createRace();
    const {created, modified, ...raceWithoutDates} = race.body;
    const worlds = [originWorld, ...otherWorlds]
    expect(race.headers['content-type']).toMatch('application/json; charset=utf-8');
    const url = `/worldbuilding/races/${id}`
    const expected = {
        id,
        name,
        url,
        author,
        types,
        abilities,
        originWorld,
        otherWorlds,
        countries,
        worlds,
        custom,
        description,
        sections
    }

    expect(raceWithoutDates).toMatchObject(expected)
});

test("Test Duplicate Race Creation Creation", async () => {
    const [register, , , , name ] = await createRace();
    const cookie = register.headers['set-cookie'];
    const description = "Duplicate test";
    const race = await request(app).post('/api/worldbuilding/races').send({name, description}).set("Cookie", cookie);
    expect(race.status).toBe(409);
});

test("Test Race Creation missing required field", async () => {
    const [register, , name] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const race = await request(app).post('/api/worldbuilding/races').send({name}).set("Cookie", cookie);
    expect(race.status).toBe(409);
});

test("Test Update race", async () => {
    const [register, ,raceReturn] = await createRace();
    const race = raceReturn.body;
    race.countries = ["whatever"];
    race.originWorld = "cool";
    race.otherWorlds = ["neet"];
    const {modified, ...expected} = race;
    expected.worlds = [expected.originWorld, ...expected.otherWorlds];
    await testUpdate(register, race, expected, app)
});


test("Test Update Race ID Mismatch", async () => {
    const [register, ,raceReturn] = await createRace();
    const race = raceReturn.body;
    await testMismatchIDs(app,register, race )
});

test("Test Update Race No Data passed", async () => {
    const [register, ,raceReturn] = await createRace();
    const race = raceReturn.body;
    await testNoDataPassed(app,register, race )

});

test("Test Race update, no Race of that id found", async () => {

    const [register, , name] = await registerUser(app);
    await testNotExist(register, `/worldbuilding/races/${name}`, app)
});

test("Test Race update, not author", async () => {
    // const [register] = await registerUser(app);
    // const cookie = register.headers['set-cookie'];
    const [ , ,raceReturn] = await createRace();
    const race = raceReturn.body;
    // character.description ="test changing wrong author";
    await testWrongAuthor(race, app)
    // const updateCharacter = await request(app).put(`/api${character.url}`).send(character).set("Cookie", cookie);

    // expect(updateCharacter.status).toBe(401)
});

test("Test Get Race", async () => {
    const [ , ,raceReturn] = await createRace();
    const race = raceReturn.body;
    await testGetSpecific(race, app)

})


test("Filter Races", async () => {
    const [ , ,raceReturn] = await createRace();
    const race = raceReturn.body;
    await testGetManyFiltered(app, "worldbuilding/races", "author", race.author, "worlds", race.worlds)
})

test("Get Options", async() => {
    const [ , ,raceReturn] = await createRace();
    const race = raceReturn.body;
    await testGetOptions(app, "worldbuilding/races", race, "types")
})

test("Get Filtered Options", async () => {
    const [ , ,raceReturn] = await createRace();
    const race = raceReturn.body;
    await testGetFilteredOptions(app, "worldbuilding/races", "author", race.author, "worlds", race.worlds)
})

test("Is author", async () => {
    const [ , ,raceReturn] = await createRace();
    const race = raceReturn.body;
    await testIsAuthor(app, race)
})

test("Is Not author", async () => {
    const [ , ,raceReturn] = await createRace();
    const race = raceReturn.body;
    await testisNotAuthor(app, race)
})

test("Add stuff", async () => {
    const [ , ,raceReturn] = await createRace();
    const path = raceReturn.body.url
    await testPatchAdd(path, "otherWorlds", app)
    await testPatchAdd(path, "countries", app)
    await testPatchAdd(path, "types", app)
})

test("Delete stuff", async () => {
    const [ , ,raceReturn,
        ,
        , 
        types, 
        ,
        ,
        otherWorlds,
        ,
        countries,
        ,
        ,
        
    ] = await createRace();
    const path = raceReturn.body.url;
    await testPatchRemove(path,"otherWorlds", otherWorlds[0],app )
    await testPatchRemove(path,"countries", countries[0],app )
    await testPatchRemove(path,"types", types[0],app )
})

test("Attempt to modify nonexisting", async () => {
    await testPatchNotFound("wouldbuilding/races", "otherWorlds", app);
})

test("Attempt to modify fields that arnt allowed", async () => {
    const [ , ,raceReturn,] = await createRace();
    const path = raceReturn.body.url;
    await testPatchFailures(path, "originWorld", app)
    await testPatchFailures(path, "worlds", app)
    await testPatchFailures(path, "abilities", app)
    await testPatchSections(path, app)
    await testPatchCustom(path, app)
    await testPatchDescription(path, app)
})

test("Get Race Types options", async () => {
    const [ , ,raceReturn,,
        , 
        types, 
         ] = await createRace();
    const option = {id:types[0], name:types[0]}
    await testGetOptions(app, "worldbuilding/races/types", option);
})