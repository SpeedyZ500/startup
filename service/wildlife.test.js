const request = require('supertest');
const {app, createID} = require('./service');

const {wildlifeRouter} = require(`./worldbuilding/wildlife`);
app.use('/api', wildlifeRouter);
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







test('get Wildlife', async () => {
    await testGetMany(app, "worldbuilding/wildlife")
})

test('get Wildlife types', async () => {
   await testGetMany(app, "worldbuilding/wildlife/types");
})

test('fail to get Wildlfe', async () => {
    await testNotFound(app, "worldbuilding/wildlife");
})

async function createWildlife(){
    const [register, , author] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const name = getRandomName("name");
    const types = ["Monster"];
    const abilities = [getRandomName('magicSystem')]
    const countries = [getRandomName('country')]
    const originWorld = getRandomName("world")
    const otherWorlds = [getRandomName("world")]
    const originBiome = getRandomName("biome")
    const otherBiomes = [getRandomName("biome")]
    const description = "an example description"
    const sections = [{
        section: "test section",
        text: "A test section",
        subsections:[]
    }]
    const custom = [
        {
            edit:"Text",
            label:"Diet",
            
            value:"Nonsence"
        }
    ]
    


    const wildlife = await request(app).post('/api/worldbuilding/wildlife').send({
        name,
        types,
        abilities,
        originWorld,
        otherWorlds,
        originBiome,
        countries,
        otherBiomes,
        description,
        sections,
        custom
    })
    .set('Cookie', cookie)
    const id = createID(name, author)
    return [
        register, 
        author, 
        wildlife, 
        id,
        name, 
        types, 
        abilities,
        originWorld,
        otherWorlds,
        originBiome,
        countries,
        otherBiomes,
        description,
        sections,
        custom
    ]
}

test("Test Character Creation", async () => {
    const [
        register, 
        author, 
        wildlife, 
        id,
        name, 
        types, 
        abilities,
        originWorld,
        otherWorlds,
        originBiome,
        countries,
        otherBiomes,
        description,
        sections,
        custom
    ] = await createWildlife();
    const {created, modified, ...wildlifeWithoutDates} = wildlife.body;
    const worlds = [originWorld, ...otherWorlds]
    const biomes = [originBiome, ...otherBiomes]
    expect(wildlife.headers['content-type']).toMatch('application/json; charset=utf-8');
    const url = `/worldbuilding/wildlife/${id}`
    const expected = {
        id,
        name,
        url,
        author,
        types,
        
        abilities,
        originWorld,
        originBiome,
        biomes,
        otherWorlds,
        otherBiomes,
        countries,
        worlds,
        custom,
        description,
        sections
    }

    expect(wildlifeWithoutDates).toMatchObject(expected)
});

test("Test Duplicate Wildlife Creation Creation", async () => {
    const [register, , , , name ] = await createWildlife();
    const cookie = register.headers['set-cookie'];
    const description = "Duplicate test";
    const character = await request(app).post('/api/worldbuilding/wildlife').send({name, description}).set("Cookie", cookie);
    expect(character.status).toBe(409);
});

test("Test Wildlife Creation missing required field", async () => {
    const [register, , name] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const character = await request(app).post('/api/worldbuilding/wildlife').send({name}).set("Cookie", cookie);
    expect(character.status).toBe(409);
});

test("Test Update Wildlife", async () => {
    const [register, ,wildlifeReturn] = await createWildlife();
    const wildlife = wildlifeReturn.body;
    wildlife.countries = ["whatever"];
    wildlife.originWorld = "cool";
    wildlife.otherWorlds = ["neet"];
    wildlife.originBiome = "why";
    wildlife.otherBiomes = ["why_not"]
    const {modified, ...expected} = wildlife;
    expected.worlds = [expected.originWorld, ...expected.otherWorlds];
    expected.biomes = [expected.originBiome, ...expected.otherBiomes];
    await testUpdate(register, wildlife, expected, app)
});


test("Test Update Wildlife ID Mismatch", async () => {
    const [register, ,wildlifeReturn] = await createWildlife();
    const wildlife = wildlifeReturn.body;
    await testMismatchIDs(app,register, wildlife )
});

test("Test Update Wildlife No Data passed", async () => {
    const [register, ,wildlifeReturn] = await createWildlife();
    const wildlife = wildlifeReturn.body;
    await testNoDataPassed(app,register, wildlife )

});

test("Test Wildlife update, no woildlife of that id found", async () => {

    const [register, , name] = await registerUser(app);
    await testNotExist(register, `/worldbuilding/wildlife/${name}`, app)
});

test("Test Wildlife update, not author", async () => {
    // const [register] = await registerUser(app);
    // const cookie = register.headers['set-cookie'];
    const [ , ,wildlifeReturn] = await createWildlife();
    const wildlife = wildlifeReturn.body;
    // character.description ="test changing wrong author";
    await testWrongAuthor(wildlife, app)
    // const updateCharacter = await request(app).put(`/api${character.url}`).send(character).set("Cookie", cookie);

    // expect(updateCharacter.status).toBe(401)
});

test("Test Get Wildlife", async () => {
    const [ , ,wildlifeReturn] = await createWildlife();
    const wildlife = wildlifeReturn.body;
    await testGetSpecific(wildlife, app)

})


test("Filter Wildlife", async () => {
    const [ , ,wildlifeReturn] = await createWildlife();
    const wildlife = wildlifeReturn.body;
    await testGetManyFiltered(app, "worldbuilding/wildlife", "originBiome", wildlife.originBiome, "worlds", wildlife.worlds)
})

test("Get Options", async() => {
    const [ , ,wildlifeReturn] = await createWildlife();
    const wildlife = wildlifeReturn.body;
    await testGetOptions(app, "worldbuilding/wildlife", wildlife, "types")
})

test("Get Filtered Options", async () => {
    const [ , ,wildlifeReturn] = await createWildlife();
    const wildlife = wildlifeReturn.body;
    await testGetFilteredOptions(app, "worldbuilding/wildlife", "originBiome", wildlife.originBiome, "worlds", wildlife.worlds)
})

test("Is author", async () => {
    const [ , ,wildlifeReturn] = await createWildlife();
    const wildlife = wildlifeReturn.body;
    await testIsAuthor(app, wildlife)
})

test("Is Not author", async () => {
    const [ , ,wildlifeReturn] = await createWildlife();
    const wildlife = wildlifeReturn.body;
    await testisNotAuthor(app, wildlife)
})

test("Add stuff", async () => {
    const [ , ,wildlifeReturn] = await createWildlife();
    const path = wildlifeReturn.body.url
    await testPatchAdd(path, "otherWorlds", app)
    await testPatchAdd(path, "otherBiomes", app)
    await testPatchAdd(path, "countries", app)
    await testPatchAdd(path, "types", app)
})

test("Delete stuff", async () => {
    const [ , ,wildlifeReturn,
        ,
        , 
        types, 
        ,
        ,
        otherWorlds,
        ,
        countries,
        otherBiomes,
        ,
        ,
        
    ] = await createWildlife();
    const path = wildlifeReturn.body.url;
    await testPatchRemove(path,"otherWorlds", otherWorlds[0],app )
    await testPatchRemove(path,"otherBiomes", otherBiomes[0],app )
    await testPatchRemove(path,"countries", countries[0],app )
    await testPatchRemove(path,"types", types[0],app )
})

test("Attempt to modify nonexisting", async () => {
    await testPatchNotFound("wouldbuilding/wildlife", "otherWorlds", app);
})

test("Attempt to modify fields that arnt allowed", async () => {
    const [ , ,wildlifeReturn,] = await createWildlife();
    const path = wildlifeReturn.body.url;
    await testPatchFailures(path, "originWorld", app)
    await testPatchFailures(path, "originBiome", app)
    await testPatchFailures(path, "worlds", app)
    await testPatchFailures(path, "biomes", app)
    await testPatchFailures(path, "abilities", app)
    await testPatchSections(path, app)
    await testPatchCustom(path, app)
    await testPatchDescription(path, app)
})

test("Get Wildlife Types optoins", async () => {
    const [ , ,wildlifeReturn,,
        , 
        types, 
         ] = await createWildlife();
    const option = {id:types[0], name:types[0]}
    await testGetOptions(app, "worldbuilding/wildlife/types", option);
})