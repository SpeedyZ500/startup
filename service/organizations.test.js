const request = require('supertest');
const {app, createID} = require('./service');
const {organizationsRouter} = require(`./worldbuilding/organizations`);
const {characterRouter} = require(`./characters`);
app.use('/api', organizationsRouter);
app.use('/api', characterRouter);



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
    createCharacter
} = require('./testUtils')







test('get Organizations', async () => {
    await testGetMany(app, "worldbuilding/organizations")
},5000)

test('get Organizations types', async () => {
   await testGetMany(app, "worldbuilding/organizations/types");
})

test('fail to get Organizations', async () => {
    await testNotFound(app, "worldbuilding/organizations");
})

async function createOrganization(){
    const [register, author, ,characterID] = await createCharacter(app)
    const cookie = register.headers['set-cookie'];
    const name = getRandomName("name");
    const types = [getRandomName('organization_type')];
    const countries = [getRandomName('country')]
    const leaders = [characterID]
    const authorIsLeader = true;
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
    


    const organization = await request(app).post('/api/worldbuilding/organizations').send({
        name,
        types,
        leaders,
        originWorld,
        otherWorlds,
        countries,
        authorIsLeader,
        description,
        sections,
        custom
    })
    .set('Cookie', cookie)
    const character = await request(app).get(`/api/characters/${characterID}`);

    const id = createID(name, author)
    return [
        register, 
        author, 
        character,
        organization, 
        id,
        name, 
        types, 
        leaders,
        originWorld,
        otherWorlds,
        countries,
        authorIsLeader,
        description,
        sections,
        custom
    ]
}

async function createReligion(){
    const [register, author, ,characterID] = await createCharacter(app)
    const cookie = register.headers['set-cookie'];
    const name = getRandomName("name");
    const types = ["Religion"];
    const countries = [getRandomName('country')]
    const leaders = [characterID]
    const authorIsLeader = true;
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
    


    const organization = await request(app).post('/api/worldbuilding/organizations').send({
        name,
        types,
        leaders,
        originWorld,
        otherWorlds,
        countries,
        authorIsLeader,
        description,
        sections,
        custom
    })
    .set('Cookie', cookie)
    const character = await request(app).get(`/api/characters/${characterID}`);

    const id = createID(name, author)
    return [
        register, 
        author, 
        character,
        organization, 
        id,
        name, 
        types, 
        leaders,
        originWorld,
        otherWorlds,
        countries,
        authorIsLeader,
        description,
        sections,
        custom
    ]
}

test("Test Organization Creation", async () => {
    const [
        register, 
        author, 
        character,
        organization, 
        id,
        name, 
        types, 
        leaders,
        originWorld,
        otherWorlds,
        countries,
        authorIsLeader,
        description,
        sections,
        custom
    ] = await createOrganization();
    const {created, modified, ...organizationWithoutDates} = organization.body;
    const worlds = [originWorld, ...otherWorlds]
    expect(organization.headers['content-type']).toMatch('application/json; charset=utf-8');
    const url = `/worldbuilding/organizations/${id}`
    const expected = {
        id,
        name,
        url,
        author,
        types,
        leaders,
        originWorld,
        otherWorlds,
        countries,
        worlds,
        authorIsLeader,
        custom,
        description,
        sections
    }

    expect(organizationWithoutDates).toMatchObject(expected)
    expect(character.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(character.body.organizations.includes(id)).toBe(true)
});

test("Test Organization Religion", async () => {
    const [
        register, 
        author, 
        character,
        organization, 
        id,
        name, 
        types, 
        leaders,
        originWorld,
        otherWorlds,
        countries,
        authorIsLeader,
        description,
        sections,
        custom
    ] = await createReligion();
    const {created, modified, ...organizationWithoutDates} = organization.body;
    const worlds = [originWorld, ...otherWorlds]
    expect(organization.headers['content-type']).toMatch('application/json; charset=utf-8');
    const url = `/worldbuilding/organizations/${id}`
    const expected = {
        id,
        name,
        url,
        author,
        types,
        leaders,
        originWorld,
        otherWorlds,
        countries,
        worlds,
        authorIsLeader,
        custom,
        description,
        sections
    }

    expect(organizationWithoutDates).toMatchObject(expected)
    expect(character.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(character.body.organizations.includes(id)).toBe(false)
});

test("Test Duplicate Organization Creation Creation", async () => {
    const [register, , , , ,name ] = await createOrganization();
    const cookie = register.headers['set-cookie'];
    const description = "Duplicate test";
    const organization = await request(app).post('/api/worldbuilding/organizations').send({name, description}).set("Cookie", cookie);
    expect(organization.status).toBe(409);
});

test("Test Organization Creation missing required field", async () => {
    const [register, , name] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const organization = await request(app).post('/api/worldbuilding/organizations').send({name}).set("Cookie", cookie);
    expect(organization.status).toBe(409);
});

test("Test Update organization", async () => {
    const [register, ,,organizationReturn, id] = await createOrganization();
    const organization = organizationReturn.body;
    const [, , ,characterID] = await createCharacter(app)
    organization.countries = ["whatever"];
    organization.originWorld = "cool";
    organization.otherWorlds = ["neet"];
    organization.types.push("another one");

    
    organization.leaders.push(characterID)
    const {modified, ...expected} = organization;
    expected.worlds = [expected.originWorld, ...expected.otherWorlds];
    await testUpdate(register, organization, expected, app)
    const character = await request(app).get(`/api/characters/${characterID}`);
    expect(character.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(character.body.organizations.includes(id)).toBe(true)
});

test("Test Update Religion", async () => {
    const [register, ,,organizationReturn, id] = await createReligion();
    const organization = organizationReturn.body;
    const [, , ,characterID] = await createCharacter(app)
    organization.countries = ["whatever"];
    organization.originWorld = "cool";
    organization.otherWorlds = ["neet"];
    organization.leaders.push(characterID)
    const {modified, ...expected} = organization;
    expected.worlds = [expected.originWorld, ...expected.otherWorlds];
    await testUpdate(register, organization, expected, app)
    const character = await request(app).get(`/api/characters/${characterID}`);
    expect(character.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(character.body.organizations.includes(id)).toBe(false)
});


test("Test Update Organization ID Mismatch", async () => {
    const [register, ,,organizationReturn] = await createOrganization();
    const organization = organizationReturn.body;
    await testMismatchIDs(app,register, organization )
});

test("Test Update Organization No Data passed", async () => {
    const [register, ,,organizationReturn] = await createOrganization();
    const organization = organizationReturn.body;
    await testNoDataPassed(app,register, organization )

});

test("Test Organization update, no Organization of that id found", async () => {
    const [register, , name] = await registerUser(app);
    await testNotExist(register, `/worldbuilding/organizations/${name}`, app)
});

test("Test Organization update, not author", async () => {
    // const [register] = await registerUser(app);
    // const cookie = register.headers['set-cookie'];
    const [ , ,,organizationReturn] = await createOrganization();
    const organization = organizationReturn.body;
    // character.description ="test changing wrong author";
    await testWrongAuthor(organization, app)
    // const updateCharacter = await request(app).put(`/api${character.url}`).send(character).set("Cookie", cookie);

    // expect(updateCharacter.status).toBe(401)
});

test("Test Get Organization", async () => {
    const [ , ,,organizationReturn] = await createOrganization();
    const organization = organizationReturn.body;
    await testGetSpecific(organization, app)

})


test("Filter Organizations", async () => {
    const [ , ,,organizationReturn] = await createOrganization();
    const organization = organizationReturn.body;
    await testGetManyFiltered(app, "worldbuilding/organizations", "author", organization.author, "worlds", organization.worlds)
})

test("Get Options", async() => {
    const [ , ,,organizationReturn] = await createOrganization();
    const organization = organizationReturn.body;
    await testGetOptions(app, "worldbuilding/organizations", organization, "types")
})

test("Get Filtered Options", async () => {
    const [ , ,,organizationReturn] = await createOrganization();
    const organization = organizationReturn.body;
    await testGetFilteredOptions(app, "worldbuilding/organizations", "author", organization.author, "worlds", organization.worlds)
})

test("Is author", async () => {
    const [ , ,,organizationReturn] = await createOrganization();
    const organization = organizationReturn.body;
    await testIsAuthor(app, organization)
})

test("Is Not author", async () => {
    const [ , ,,organizationReturn] = await createOrganization();
    const organization = organizationReturn.body;
    await testisNotAuthor(app, organization)
})

test("Add stuff", async () => {
    const [ , ,,organizationReturn] = await createOrganization();
    const path = organizationReturn.body.url
    await testPatchAdd(path, "otherWorlds", app)
    await testPatchAdd(path, "countries", app)
    await testPatchAdd(path, "types", app)
})

test("Delete stuff", async () => {
    const [register, 
        author, 
        character,
        organizationReturn, 
        id,
        name, 
        types, 
        leaders,
        originWorld,
        otherWorlds,
        countries,
        authorIsLeader,
        description,
        sections,
        custom

    ] = await createOrganization();
    const path = organizationReturn.body.url;
    await testPatchRemove(path,"otherWorlds", otherWorlds[0],app )
    await testPatchRemove(path,"countries", countries[0],app )
    await testPatchRemove(path,"types", types[0],app )
    await testPatchRemove(path,"leaders", leaders[0],app )
})

test("Attempt to modify nonexisting", async () => {
    await testPatchNotFound("wouldbuilding/organizations", "otherWorlds", app);
})

test("Attempt to modify fields that arnt allowed", async () => {
    const [ , ,,organizationReturn,] = await createOrganization();
    const path = organizationReturn.body.url;
    await testPatchFailures(path, "originWorld", app)
    await testPatchFailures(path, "worlds", app)
    await testPatchFailures(path, "leaders", app)
    await testPatchSections(path, app)
    await testPatchCustom(path, app)
    await testPatchDescription(path, app)
})

test("Get Organization Types options", async () => {
    const [ , 
        , 
        ,
        , 
        ,
        , 
        types, 
        
         ] = await createOrganization();
    const option = {id:types[0], name:types[0]}
    await testGetOptions(app, "worldbuilding/organizations/types", option);
})