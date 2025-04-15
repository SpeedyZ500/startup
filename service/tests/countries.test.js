const request = require('supertest');
const {app, createID} = require('../service');
const { countriesRouter } = require(`../countries`);
const {characterRouter} = require(`../characters`);

app.use('/api', countriesRouter);
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
} = require('../testUtils')

test('get Countries', async () => {
    await testGetMany(app, "worldbuilding/countries")
},5000)

test('get Countries types', async () => {
   await testGetMany(app, "worldbuilding/countries/types");
})

test('fail to get Countries', async () => {
    await testNotFound(app, "worldbuilding/countries");
})

async function createCountry(){
    const [register, author, ,characterID] = await createCharacter(app)
    const cookie = register.headers['set-cookie'];
    const name = getRandomName("name");
    const types = [getRandomName('country_type')];
    const towns = [getRandomName('town')]
    const leaders = [characterID]
    const authorIsLeader = true;
    const continents = [getRandomName("continent")]
    const originWorld = getRandomName("world")
    const otherWorlds = [getRandomName("world")]
    const description = "an example description"
    const biomes = [getRandomName("biomes")]
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
    


    const country = await request(app).post('/api/worldbuilding/countries').send({
        name,
        types,
        leaders,
        originWorld,
        otherWorlds,
        towns,
        authorIsLeader,
        description,
        sections,
        continents,
        custom,
        biomes
    })
    .set('Cookie', cookie)
    const character = await request(app).get(`/api/characters/${characterID}`);

    const id = createID(name, author)
    return [
        register, 
        author, 
        character,
        country, 
        id,
        name, 
        types, 
        leaders,
        originWorld,
        otherWorlds,
        towns,
        authorIsLeader,
        description,
        sections,
        continents,
        custom,
        biomes
    ]
}

test("Test Country Creation", async () => {
    const [
        register, 
        author, 
        character,
        country, 
        id,
        name, 
        types, 
        leaders,
        originWorld,
        otherWorlds,
        towns,
        authorIsLeader,
        description,
        sections,
        continents,
        custom,
        biomes
    ] = await createCountry();
    const {created, modified, ...countryWithoutDates} = country.body;
    const worlds = [originWorld, ...otherWorlds]
    expect(country.headers['content-type']).toMatch('application/json; charset=utf-8');
    const url = `/worldbuilding/countries/${id}`
    const expected = {
        id,
        name,
        url,
        author,
        types,
        leaders,
        originWorld,
        otherWorlds,
        towns,
        worlds,
        authorIsLeader,
        custom,
        description,
        continents,
        sections,
        biomes
    }

    expect(countryWithoutDates).toMatchObject(expected)
    expect(character.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(character.body.countries.includes(id)).toBe(true)
    expect(character.body.otherCountries.includes(id)).toBe(true)
});
test("Test Duplicate Organization Creation Creation", async () => {
    const [register, , , , ,name ] = await createCountry();
    const cookie = register.headers['set-cookie'];
    const description = "Duplicate test";
    const country = await request(app).post('/api/worldbuilding/countries').send({name, description}).set("Cookie", cookie);
    expect(country.status).toBe(409);
});test("Test Organization Creation missing required field", async () => {
    const [register, , name] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const country = await request(app).post('/api/worldbuilding/countries').send({name}).set("Cookie", cookie);
    expect(country.status).toBe(409);
});

test("Test Update Country", async () => {
    const [register, ,,countryReturn, id] = await createCountry();
    const country = countryReturn.body;
    const [, , ,characterID] = await createCharacter(app)
    country.originWorld = "cool";
    country.otherWorlds = ["neet"];
    country.types.push("another one");
    country.continents.push("random");
    country.biomes.push(getRandomName("biome"));


    
    country.leaders.push(characterID)
    const {modified, ...expected} = country;
    expected.worlds = [expected.originWorld, ...expected.otherWorlds];
    await testUpdate(register, country, expected, app)
    const character = await request(app).get(`/api/characters/${characterID}`);
    expect(character.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(character.body.countries.includes(id)).toBe(true)
    expect(character.body.otherCountries.includes(id)).toBe(true)

});

test("Test Update Country ID Mismatch", async () => {
    const [register, ,,countryReturn] = await createCountry();
    const country = countryReturn.body;
    await testMismatchIDs(app,register, country )
});

test("Test Update Country ID Mismatch", async () => {
    const [register, ,,countryReturn] = await createCountry();
    const country = countryReturn.body;
    await testNoDataPassed(app,register, country )
});

test("Test Country update, no Country of that id found", async () => {
    const [register, , name] = await registerUser(app);
    await testNotExist(register, `/worldbuilding/countries/${name}`, app)
});

test("Test Country update, not author", async () => {
    const [ , ,,countryReturn] = await createCountry();
    const country = countryReturn.body;
    await testWrongAuthor(country, app)

});

test("Test Get Country", async () => {
    const [ , ,,countryReturn] = await createCountry();
    const country = countryReturn.body;
    await testGetSpecific(country, app)

})

test("Filter Countries", async () => {
    const [ , ,,countryReturn] = await createCountry();
    const country = countryReturn.body;
    await testGetManyFiltered(app, "worldbuilding/countries", "author", country.author, "worlds", country.worlds)
})

test("Get Options", async() => {
    const [ , ,,countryReturn] = await createCountry();
    const country = countryReturn.body;
    await testGetOptions(app, "worldbuilding/countries", country)
})

test("Get Filtered Options", async () => {
    const [ , ,,countryReturn] = await createCountry();
    const country = countryReturn.body;
    await testGetFilteredOptions(app, "worldbuilding/countries", "author", country.author, "worlds", country.worlds)
})

test("Is author", async () => {
    const [ , ,,countryReturn] = await createCountry();
    const country = countryReturn.body;
    await testIsAuthor(app, country)
})

test("Is Not author", async () => {
    const [ , ,,countryReturn] = await createCountry();
    const country = countryReturn.body;
    await testisNotAuthor(app, country)
})

test("Add stuff", async () => {
    const [ , ,,countryReturn] = await createCountry();
    const path = countryReturn.body.url
    await testPatchAdd(path, "otherWorlds", app)
    await testPatchAdd(path, "continents", app)
    await testPatchAdd(path, "types", app)
})

test("Delete stuff", async () => {
    const [
        register, 
        author, 
        character,
        countryReturn, 
        id,
        name, 
        types, 
        leaders,
        originWorld,
        otherWorlds,
        towns,
        authorIsLeader,
        description,
        sections,
        continents,
        custom,
        biomes
    ] = await createCountry();
    const path = countryReturn.body.url;
    await testPatchRemove(path,"otherWorlds", otherWorlds[0],app )
    await testPatchRemove(path,"continents", continents[0],app )
    await testPatchRemove(path,"types", types[0],app )
    await testPatchRemove(path,"leaders", leaders[0],app )
    await testPatchRemove(path,"biomes", biomes[0],app )

})

test("Attempt to modify nonexisting", async () => {
    await testPatchNotFound("wouldbuilding/countries", "otherWorlds", app);
})

test("Attempt to modify fields that arnt allowed", async () => {
    const [ , ,,countryReturn,] = await createCountry();
    const path = countryReturn.body.url;
    await testPatchFailures(path, "originWorld", app)
    await testPatchFailures(path, "worlds", app)
    await testPatchFailures(path, "leaders", app)
    await testPatchSections(path, app)
    await testPatchCustom(path, app)
    await testPatchDescription(path, app)
})

test("Get Country Types options", async () => {
    const [ , 
        , 
        ,
        , 
        ,
        , 
        types, 
        ] = await createCountry();
    const option = {id:types[0], name:types[0]}
    await testGetOptions(app, "worldbuilding/countries/types", option);
})


test("Get Country Town options", async () => {
    const [
        , 
        , 
        ,
        , 
        id,
        , 
        , 
        ,
        ,
        ,
        towns,
        
        
    ] = await createCountry();
    const option = {id:towns[0], name:towns[0]}
    
    await testGetOptions(app, "worldbuilding/countries/towns", option, null ,`filter[id]=${id}`);
})

test("Get test Country not found Town options", async () => {
    const [
        , 
        , 
        ,
        , 
        ,
        name, 
        , 
        ,
        ,
        ,
        towns,
        
        
    ] = await createCountry();

    const townOptionsResponce = await request(app).get(`/api/worldbuilding/countries/towns/options?country=${name}`);
    expect(townOptionsResponce.status).toBe(404)
    
})