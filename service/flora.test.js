const request = require('supertest');
const {app, createID} = require('./service');
const { floraRouter } = require(`./worldbuilding/flora`)
app.use('/api', floraRouter);
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







test('get Flora', async () => {
    await testGetMany(app, "worldbuilding/flora")
})

test('get Flora types', async () => {
   await testGetMany(app, "worldbuilding/flora/types");
})

test('fail to get Flora', async () => {
    await testNotFound(app, "worldbuilding/flora");
})

async function createFlora(){
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
    


    const flora = await request(app).post('/api/worldbuilding/flora').send({
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
        flora, 
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
        flora, 
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
    ] = await createFlora();
    const {created, modified, ...floraWithoutDates} = flora.body;
    const worlds = [originWorld, ...otherWorlds]
    const biomes = [originBiome, ...otherBiomes]
    expect(flora.headers['content-type']).toMatch('application/json; charset=utf-8');
    const url = `/worldbuilding/flora/${id}`
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

    expect(floraWithoutDates).toMatchObject(expected)
});

test("Test Duplicate Flora Creation Creation", async () => {
    const [register, , , , name ] = await createFlora();
    const cookie = register.headers['set-cookie'];
    const description = "Duplicate test";
    const character = await request(app).post('/api/worldbuilding/flora').send({name, description}).set("Cookie", cookie);
    expect(character.status).toBe(409);
});

test("Test Flora Creation missing required field", async () => {
    const [register, , name] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const character = await request(app).post('/api/worldbuilding/flora').send({name}).set("Cookie", cookie);
    expect(character.status).toBe(409);
});

test("Test Update Flora", async () => {
    const [register, ,floraReturn] = await createFlora();
    const flora = floraReturn.body;
    flora.countries = ["whatever"];
    flora.originWorld = "cool";
    flora.otherWorlds = ["neet"];
    flora.originBiome = "why";
    flora.otherBiomes = ["why_not"]
    const {modified, ...expected} = flora;
    expected.worlds = [expected.originWorld, ...expected.otherWorlds];
    expected.biomes = [expected.originBiome, ...expected.otherBiomes];
    await testUpdate(register, flora, expected, app)
});


test("Test Update Flora ID Mismatch", async () => {
    const [register, ,floraReturn] = await createFlora();
    const flora = floraReturn.body;
    await testMismatchIDs(app,register, flora )
});

test("Test Update Flora No Data passed", async () => {
    const [register, ,floraReturn] = await createFlora();
    const flora = floraReturn.body;
    await testNoDataPassed(app,register, flora )

});

test("Test Flora update, no woildlife of that id found", async () => {

    const [register, , name] = await registerUser(app);
    await testNotExist(register, `/worldbuilding/flora/${name}`, app)
});

test("Test Flora update, not author", async () => {
    // const [register] = await registerUser(app);
    // const cookie = register.headers['set-cookie'];
    const [ , ,floraReturn] = await createFlora();
    const flora = floraReturn.body;
    // character.description ="test changing wrong author";
    await testWrongAuthor(flora, app)
    // const updateCharacter = await request(app).put(`/api${character.url}`).send(character).set("Cookie", cookie);

    // expect(updateCharacter.status).toBe(401)
});

test("Test Get Flora", async () => {
    const [ , ,floraReturn] = await createFlora();
    const flora = floraReturn.body;
    await testGetSpecific(flora, app)

})


test("Filter Flora", async () => {
    const [ , ,floraReturn] = await createFlora();
    const flora = floraReturn.body;
    await testGetManyFiltered(app, "worldbuilding/flora", "originBiome", flora.originBiome, "worlds", flora.worlds)
})

test("Get Options", async() => {
    const [ , ,floraReturn] = await createFlora();
    const flora = floraReturn.body;
    await testGetOptions(app, "worldbuilding/flora", flora, "types")
})

test("Get Filtered Options", async () => {
    const [ , ,floraReturn] = await createFlora();
    const flora = floraReturn.body;
    await testGetFilteredOptions(app, "worldbuilding/flora", "originBiome", flora.originBiome, "worlds", flora.worlds)
})

test("Is author", async () => {
    const [ , ,floraReturn] = await createFlora();
    const flora = floraReturn.body;
    await testIsAuthor(app, flora)
})

test("Is Not author", async () => {
    const [ , ,floraReturn] = await createFlora();
    const flora = floraReturn.body;
    await testisNotAuthor(app, flora)
})

test("Add stuff", async () => {
    const [ , ,floraReturn] = await createFlora();
    const path = floraReturn.body.url
    await testPatchAdd(path, "otherWorlds", app)
    await testPatchAdd(path, "otherBiomes", app)
    await testPatchAdd(path, "countries", app)
    await testPatchAdd(path, "types", app)
})

test("Delete stuff", async () => {
    const [ , ,floraReturn,
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
        
    ] = await createFlora();
    const path = floraReturn.body.url;
    await testPatchRemove(path,"otherWorlds", otherWorlds[0],app )
    await testPatchRemove(path,"otherBiomes", otherBiomes[0],app )
    await testPatchRemove(path,"countries", countries[0],app )
    await testPatchRemove(path,"types", types[0],app )
})

test("Attempt to modify nonexisting", async () => {
    await testPatchNotFound("wouldbuilding/flora", "otherWorlds", app);
})

test("Attempt to modify fields that arnt allowed", async () => {
    const [ , ,floraReturn,] = await createFlora();
    const path = floraReturn.body.url;
    await testPatchFailures(path, "originWorld", app)
    await testPatchFailures(path, "originBiome", app)
    await testPatchFailures(path, "worlds", app)
    await testPatchFailures(path, "biomes", app)
    await testPatchFailures(path, "abilities", app)
    await testPatchSections(path, app)
    await testPatchCustom(path, app)
    await testPatchDescription(path, app)
})

test("Get Flora Types optoins", async () => {
    const [ , ,floraReturn,,
        , 
        types, 
         ] = await createFlora();
    const option = {id:types[0], name:types[0]}
    await testGetOptions(app, "worldbuilding/flora/types", option);
})