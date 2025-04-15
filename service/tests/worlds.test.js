const request = require('supertest');
const {testGetSpecific,
    testUpdate,
    testNotExist, 
    testWrongAuthor, 
    testGetOptions,
    testGetFilteredOptions,
    testGetMany,
    testGetManyFiltered,
    testIsAuthor,
    testisNotAuthor,
    testNotFound,
    testMismatchIDs,
    testNoDataPassed,
    registerUser, 
    getRandomName
} = require('../testUtils')
const {app, createID} = require('../service');


const worldsRouter = require("../worlds");

app.use('/api', worldsRouter);

test('get Worlds', async () => {
    await testGetMany(app, "worldbuilding/worlds")
})



test('fail to get Worlds', async () => {
    await testNotFound(app, "worldbuilding/worlds");
})


async function createWorld(){
    const [register, , author] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const name = getRandomName("world")
    const continents = [getRandomName("continent")]
    const description = "an example description"
    const sections = [{
        section: "test section",
        text: "A test section",
        subsections:[]
    }]
    const custom = [
        {
            edit:"text",
            label:"Gravity",
            value:"0.9 Yggdrasill Standard"
        }
    ]
    const world = await request(app).post(`/api/worldbuilding/worlds`)
    .send({
        name,
        continents,
        description,
        sections,
        custom,
    })
    .set("Cookie", cookie)
    const id = createID(name, author);
    
    return [
        register,
        author,
        world,
        id,
        name,
        continents,
        description,
        sections,
        custom,
    ]
    
}
function createGetterSections(continents, id){
    const getterSections = continents.map(continent => ({
        label: `Countries in ${continent}`,
        query: `/worldbuilding/countries?filter[worlds]=${id}&filter[continents]=${encodeURIComponent(continent)}`
    }));

    
    return getterSections;
}
test("Test World Creation", async () => {
    const [
        ,
        author,
        world,
        id,
        name,
        continents,
        description,
        sections,
        custom
    ] = await createWorld();

    const getterSections = createGetterSections(continents, id)

    const url = `/worldbuilding/worlds/${id}`
    const expected = {
        id,
        url,
        name,
        author,
        continents,
        description,
        sections,
        custom,
        getterSections
    }

    const {created, modified, ...worldWithoutDates} = world.body;


    expect(world.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(worldWithoutDates).toMatchObject(expected)
})
test("Test Duplicate World Creation", async () => {
    const [
        register,
        author,
        ,
        id,
        name,
        continents,
        description,
        sections,
        custom
    ] = await createWorld();
    const cookie = register.headers['set-cookie'];
    const world = await request(app).post(`/api/worldbuilding/worlds`)
    .send({
        name,
        continents,
        description,
        sections,
        custom,
    })
    .set("Cookie", cookie)
    expect(world.status).toBe(409)
})

test("Test World Creation missing required field", async () => {
    const [register, , name] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const world = await request(app).post('/api/worldbuilding/worlds').send({name}).set("Cookie", cookie);
    expect(world.status).toBe(409);
});


test("Test Update World", async () => {
    const [
        register,
        ,
        worldReturn
        
    ] = await createWorld();
    const world = worldReturn.body;
    world.description = "New Description"
    world.continents = ["Wuba Duba Duba Zat True"]

    const {modified, ...expected} = world;
    expected.getterSections = createGetterSections(world.continents, world.id)
    await testUpdate(register, world, expected, app)
})

test("Test Update World ID Mismatch", async () => {
    const [register, ,worldReturn] = await createWorld();
    const world = worldReturn.body;
    await testMismatchIDs(app,register, world )
    

});

test("Test Update World No Data passed", async () => {
    const [register, ,worldReturn] = await createWorld();
    const world = worldReturn.body;
    await testNoDataPassed(app,register, world )

});

test("Test World update, no world of that id found", async () => {

    const [register, , name] = await registerUser(app);
    await testNotExist(register, `worldbuilding/worlds/${name}`, app)
});

test("Test World update, not author", async () => {
    const [ , ,worldReturn] = await createWorld();
    const world = worldReturn.body;
    await testWrongAuthor(world, app)
    
});

test("Test Get World", async () => {
    const [ , ,worldReturn] = await createWorld();
    const world = worldReturn.body;
    await testGetSpecific(world, app)

})


test("Filter Worlds", async () => {
    const [ , ,worldReturn] = await createWorld();
    const world = worldReturn.body;
    await testGetManyFiltered(app, "worldbuilding/worlds", "author", world.author, "continents", world.continents)
})

test("Is author", async () => {
    const [ , ,worldReturn] = await createWorld();
    const world = worldReturn.body;
    await testIsAuthor(app, world)
})

test("Is Not author", async () => {
    const [ , ,worldReturn] = await createWorld();
    const world = worldReturn.body;
    await testisNotAuthor(app, world)
})

test("Get Options", async() => {
    const [ , ,worldReturn] = await createWorld();
    const world = worldReturn.body;
    await testGetOptions(app, "worldbuilding/worlds", world)
})

test("Get Filtered Options", async () => {
    const [ , ,worldReturn] = await createWorld();
    const world = worldReturn.body;
    await testGetFilteredOptions(app, "worldbuilding/worlds", "author", world.author, "continents", world.continents)
})

test("Get continents", async () => {
    const [ , ,worldReturn, , ,continents] = await createWorld();
    const path = worldReturn.body.url;
    const result = await request(app).get(`/api/${path}/continents`);
    expect(result.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(Array.isArray(result.body)).toBe(true);
    expect(result.body).toEqual(continents);
})
test("Get continents world not found", async () => {
    const result = await request(app).get(`/api/worldbuilding/worlds/bad/continents`);
    expect(result.status).toBe(404);
})

test("Get Continents options", async () => {
    const [ , ,worldReturn, id, ,continents] = await createWorld();
    const path = worldReturn.body.url;
    const expected = {id:continents[0], name:continents[0], world:id}
    await testGetOptions(app,`worldbuilding/worlds/continents`, expected,"world",`filter[id]=${id}`);
})

test("Fail to get options", async () => {
    const result = await request(app).get(`/api/worldbuilding/worlds/continents/options?filter[id]=bad`);
    expect(result.status).toBe(404);
})