const request = require('supertest');
const {app, createID} = require('./service');
const { magicRouter } = require(`./worldbuilding/magicsystems`)
app.use('/api', magicRouter);

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
    await testGetMany(app, "worldbuilding/magicsystems")
},5000)



test('fail to get Biomes', async () => {
    await testNotFound(app, "worldbuilding/magicsystems");
})

async function createMagicSystem(){
    const [register, , author] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const name = getRandomName("magic")
    const types = [getRandomName("magic type")];
    const originWorld = getRandomName("world");
    const otherWorlds = [getRandomName("world")];
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
    const magic = await request(app).post(`/api/worldbuilding/magicsystems`)
    .send({
        name,
        types,
        originWorld,
        otherWorlds,
        description,
        sections,
        custom,
    })
    .set("Cookie", cookie)
    const id = createID(name, author);
    
    return [
        register,
        author,
        magic,
        id,
        name,
        types,
        originWorld,
        otherWorlds,
        description,
        sections,
        custom,
    ]
    
}

test("Test Magic System Creation", async () => {
    const [
        ,
        author,
        magic,
        id,
        name,
        types,
        originWorld,
        otherWorlds,
        description,
        sections,
        custom
    ] = await createMagicSystem();

    const worlds = [originWorld, ...otherWorlds]

    const url = `/worldbuilding/magicsystems/${id}`
    const expected = {
        id,
        url,
        name,
        author,
        types,
        originWorld,
        otherWorlds,
        worlds,
        description,
        sections,
        custom,
    }

    const {created, modified, ...magicWithoutDates} = magic.body;


    expect(magic.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(magicWithoutDates).toMatchObject(expected)
})

test("Test Duplicate Magic System Creation", async () => {
    const [register, , , , name , , , sections] = await createMagicSystem();
    const cookie = register.headers['set-cookie'];
    const description = "Duplicate test";
    const magic = await request(app).post('/api/worldbuilding/magicsystems').send({name, description, sections}).set("Cookie", cookie);
    expect(magic.status).toBe(409);
});

test("Test Magic System Creation missing required field", async () => {
    const [register, , name] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const magic = await request(app).post('/api/worldbuilding/magicsystems').send({name}).set("Cookie", cookie);
    expect(magic.status).toBe(409);
});

test("Test Update Magic System", async () => {
    const [register, ,magicReturn] = await createMagicSystem();
    const magic = magicReturn.body;
    magic.originWorld = ["cool"];
    magic.otherWorlds = ["neet"];
    const {modified, ...expected} = magic;
    expected.worlds = [expected.originWorld, ...expected.otherWorlds];
    await testUpdate(register, magic, expected, app)
});

test("Test Update Magic System ID Mismatch", async () => {
    const [register, ,magicReturn] = await createMagicSystem();
    const magic = magicReturn.body;
    await testMismatchIDs(app,register, magic )
    

});

test("Test Update Magic System No Data passed", async () => {
    const [register, ,magicReturn] = await createMagicSystem();
    const magic = magicReturn.body;
    await testNoDataPassed(app,register, magic )

});

test("Test Magic System update, no Magic System of that id found", async () => {

    const [register, , name] = await registerUser(app);
    await testNotExist(register, `/worldbuilding/magicsystems/${name}`, app)
});

test("Test Magic System update, not author", async () => {
    const [ , ,magicReturn] = await createMagicSystem();
    const magic = magicReturn.body;
    await testWrongAuthor(magic, app)

});
test("Test Get Magic System", async () => {
    const [ , ,magicReturn] = await createMagicSystem();
    const magic = magicReturn.body;
    await testGetSpecific(magic, app)
});

test("Filter Magic Systems", async () => {
    const [ , ,magicReturn] = await createMagicSystem();
    const biome = magicReturn.body;
    await testGetManyFiltered(app, "worldbuilding/magicsystems", "originWorld", biome.originWorld, "worlds", biome.worlds)
})

test("Get Options", async() => {
    const [ , ,magicReturn] = await createMagicSystem();
    const magic = magicReturn.body;
    await testGetOptions(app, "worldbuilding/magicsystems", magic, "types")
})

test("Get Filtered Options", async () => {
    const [ , ,magicReturn] = await createMagicSystem();
    const magic = magicReturn.body;
    await testGetFilteredOptions(app, "worldbuilding/magicsystems", "originWorld", magic.originWorld, "worlds", magic.worlds)
})

test("Is author", async () => {
    const [ , ,magicReturn] = await createMagicSystem(app);
    const magic = magicReturn.body;
    await testIsAuthor(app, magic)
})

test("Is Not author", async () => {
    const [ , ,magicReturn] = await createMagicSystem();
    const magic = magicReturn.body;
    await testisNotAuthor(app, magic)
})

test("Add stuff", async () => {
    const [ , ,magicReturn] = await createMagicSystem();
    const path = magicReturn.body.url
    await testPatchAdd(path, "otherWorlds", app)
})

test("delete stuff", async () => {
    const [
        ,
        ,
        magicReturn,
        ,
        ,
        originWorld,
        otherWorlds,
        
    ] = await createMagicSystem();
    const path = magicReturn.body.url;
    await testPatchRemove(path,"otherWorlds", otherWorlds[0],app );
})

test("Attempt to modify nonexisting", async () => {
    await testPatchNotFound("worldbuilding/magicsystems", "worlds", app);
})

test("Attempt to modify fields that arnt allowed", async () => {
    const [ , ,magicReturn] = await createMagicSystem();
    const path = magicReturn.body.url;
    await testPatchFailures(path, "worlds", app)
    await testPatchSections(path, app)
    await testPatchCustom(path, app)
    await testPatchDescription(path, app)
})

test("Get Magic Types", async () => {
    await testGetMany(app, "worldbuilding/magicsystems/types");
})

test("Get Magic Type Options", async () => {
    const [,
        ,
        ,
        ,
        ,
        types] = await createMagicSystem();
    const option = {id:types[0], name:types[0]}
    await testGetOptions(app, "worldbuilding/magicsystems/types", option);
})