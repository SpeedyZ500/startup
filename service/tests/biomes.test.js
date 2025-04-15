const request = require('supertest');
const {app, createID} = require('../service');
const { biomesRouter } = require(`../biomes`)
app.use('/api', biomesRouter);

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
    getRandomName,
} = require('./testUtils')

test('get Biomes', async () => {
    await testGetMany(app, "worldbuilding/biomes")
},5000)



test('fail to get Biomes', async () => {
    await testNotFound(app, "worldbuilding/biomes");
})

async function createBiome(){
    const [register, , author] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const name = getRandomName("biome")
    const worlds = [getRandomName("world")]
    const description = "an example description"
    const sections = [{
        section: "test section",
        text: "A test section",
        subsections:[]
    }]
    const custom = [
        {
            edit:"text",
            label:"Whatever",
            value:"Cool"
        }
    ]
    const biome = await request(app).post(`/api/worldbuilding/biomes`)
    .send({
        name,
        worlds,
        description,
        sections,
        custom,
    })
    .set("Cookie", cookie)
    const id = createID(name, author);
    
    return [
        register,
        author,
        biome,
        id,
        name,
        worlds,
        description,
        sections,
        custom,
    ]
    
}

test("Test Biome Creation", async () => {
    const [
        ,
        author,
        biome,
        id,
        name,
        worlds,
        description,
        sections,
        custom
    ] = await createBiome();


    const url = `/worldbuilding/biomes/${id}`
    const expected = {
        id,
        url,
        name,
        author,
        worlds,
        description,
        sections,
        custom,
    }

    const {created, modified, ...biomeWithoutDates} = biome.body;


    expect(biome.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(biomeWithoutDates).toMatchObject(expected)
})

test("Test Duplicate Biome Creation", async () => {
    const [register, , , , name , , , sections] = await createBiome(app);
    const cookie = register.headers['set-cookie'];
    const description = "Duplicate test";
    const biome = await request(app).post('/api/worldbuilding/biomes').send({name, description, sections}).set("Cookie", cookie);
    expect(biome.status).toBe(409);
});

test("Test Biome Creation missing required field", async () => {
    const [register, , name] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const biome = await request(app).post('/api/worldbuilding/biomes').send({name}).set("Cookie", cookie);
    expect(biome.status).toBe(409);
});

test("Test Update Biome", async () => {
    const [register, ,biomeReturn] = await createBiome();
    const biome = biomeReturn.body;
    biome.worlds = ["cool"];
    const {modified, ...expected} = biome;
    await testUpdate(register, biome, expected, app)
});

test("Test Update Biome ID Mismatch", async () => {
    const [register, ,biomeReturn] = await createBiome();
    const biome = biomeReturn.body;
    await testMismatchIDs(app,register, biome )
    

});

test("Test Update Biome No Data passed", async () => {
    const [register, ,biomeReturn] = await createBiome();
    const biome = biomeReturn.body;
    await testNoDataPassed(app,register, biome )

});

test("Test Biome update, no biome of that id found", async () => {

    const [register, , name] = await registerUser(app);
    await testNotExist(register, `/worldbuilding/biomes/${name}`, app)
});

test("Test Biome update, not author", async () => {
    const [ , ,biomeReturn] = await createBiome();
    const biome = biomeReturn.body;
    await testWrongAuthor(biome, app)

});
test("Test Get Biome", async () => {
    const [ , ,biomeReturn] = await createBiome();
    const biome = biomeReturn.body;
    await testGetSpecific(biome, app)
});

test("Filter Biomes", async () => {
    const [ , ,biomeReturn] = await createBiome();
    const biome = biomeReturn.body;
    await testGetManyFiltered(app, "worldbuilding/biomes", "author", biome.author, "worlds", biome.worlds)
})

test("Get Options", async() => {
    const [ , ,biomeReturn] = await createBiome();
    const biome = biomeReturn.body;
    await testGetOptions(app, "worldbuilding/biomes", biome)
})

test("Get Filtered Options", async () => {
    const [ , ,biomeReturn] = await createBiome();
    const biome = biomeReturn.body;
    await testGetFilteredOptions(app, "worldbuilding/biomes", "author", biome.author, "worlds", biome.worlds)
})

test("Is author", async () => {
    const [ , ,biomeReturn] = await createBiome(app);
    const biome = biomeReturn.body;
    await testIsAuthor(app, biome)
})

test("Is Not author", async () => {
    const [ , ,biomeReturn] = await createBiome();
    const biome = biomeReturn.body;
    await testisNotAuthor(app, biome)
})

test("Add stuff", async () => {
    const [ , ,biomeReturn] = await createBiome();
    const path = biomeReturn.body.url
    await testPatchAdd(path, "worlds", app)
})

test("delete stuff", async () => {
    const [
        ,
        ,
        biomeReturn,
        ,
        ,
        worlds,
        
    ] = await createBiome();
    const path = biomeReturn.body.url;
    await testPatchRemove(path,"worlds", worlds[0],app );
})

test("Attempt to modify nonexisting", async () => {
    await testPatchNotFound("worldbuilding/biomes", "worlds", app);
})

test("Attempt to modify fields that arnt allowed", async () => {
    const [ , ,biomeReturn] = await createBiome();
    const path = biomeReturn.body.url;
    await testPatchSections(path, app)
    await testPatchCustom(path, app)
    await testPatchDescription(path, app)
})