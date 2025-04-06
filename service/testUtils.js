const request = require('supertest');
const {createID } = require('./service')

async function testGetSpecific(original, app){
    const result = await request(app).get(`/api${original.url}`);
    expect(result.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(result.body).toMatchObject(original)
}

async function testGetMany(app, path){
    const result = await request(app).get(`/api/${path}`);
    expect(result.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(Array.isArray(result.body)).toBe(true);
}

async function testGetManyFiltered(app, path, individualKey, individualValue, arrayKey, array){
    const filterIndividual = `${individualKey}=${encodeURI(individualValue)}`;
    let filterMany = [];
    
    if (Array.isArray(array)) {
        filterMany = array.map(item => `${arrayKey}=${encodeURI(item)}`);
    }
    const queryString = [filterIndividual, ...filterMany].join('&');

    const response = await request(app).get(`/api/${path}?${queryString}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

}


async function testUpdate(response, original, expected, app){
    const cookie = response.headers['set-cookie'];
    const updated = await request(app).put(`/api${original.url}`).send(original).set("Cookie", cookie);
    const {modified, ...result} = updated.body;
    expect(updated.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(result).toMatchObject(expected)
}

async function testNotExist(response, path, app){
    const cookie = response.headers['set-cookie'];
    const updated = await request(app).put(`/api${path}/noice`).send({id:"noice"}).set("Cookie", cookie);
    expect(updated.status).toBe(404);
}

async function testWrongAuthor(original, app){
    const [register] = await registerUser(app);
    const cookie = register.headers['set-cookie'];

    const updated = await request(app).put(`/api${original.url}`).send(original).set("Cookie", cookie);
    expect(updated.status).toBe(401);
}

async function testPatchAdd(path, list, app){
    const [register] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const data = getRandomName("data");
    const response = await request(app)
        .patch(`/api${path}/${list}`)
        .send({ data, method: "add" })
        .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body[list]).toContain(data);
}

async function testPatchRemove(path, list, data, app){
    const [register] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const response = await request(app)
        .patch(`/api${path}/${encodeURI(list)}`)
        .send({ data, method: "delete" })
        .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body[list]).not.toContain(data);
}

async function testPatchNotFound(path, list, app){
    const [register, ,username] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const response = await request(app)
    .patch(`/api/${path}/${username}/${list}`)
    .send("No Object To Patch")
    .set("Cookie", cookie);
    expect(response.status).toBe(404);
}

async function testPatchFailures(path, list, app){
    const [register] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const response = await request(app)
    .patch(`/api/${path}/${list}`)
    .send({data:"bad list", method:"add"} )
    .set("Cookie", cookie);
    expect(response.status).toBe(400);
}

async function testPatchSections(path, app){
    const [register] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const response = await request(app)
    .patch(`/api/${path}/sections`)
    .send("should not be able to ever edit sections")
    .set("Cookie", cookie);
    expect(response.status).toBe(400);
}

async function testPatchDescription(path, app){
    const [register] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const response = await request(app)
    .patch(`/api/${path}/description`)
    .send("should not be able to ever edit description")
    .set("Cookie", cookie);
    expect(response.status).toBe(400);
}

async function testPatchCustom(path, app){
    const [register] = await registerUser(app);
    const cookie = register.headers['set-cookie'];
    const response = await request(app)
    .patch(`/api/${path}/sections`)
    .send("should not be able to ever edit custom")
    .set("Cookie", cookie);
    expect(response.status).toBe(400);
}

async function testGetOptions(app, path, original, qualifier){
    const expected = {value: original.id, label: original.name};
    if(qualifier){
        expected.qualifier = original[qualifier];
    }
    const response = await request(app).get(`/api/${path}/options`);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining(expected)]))
};

async function testGetFilteredOptions(app, path, individualKey, individualValue, arrayKey, array){
    const filterIndividual = `${individualKey}=${encodeURI(individualValue)}`;
    let filterMany = [];
    
    if (Array.isArray(array)) {
        filterMany = array.map(item => `${arrayKey}=${encodeURI(item)}`);
    }
    const queryString = [filterIndividual, ...filterMany].join('&');

    const response = await request(app).get(`/api/${path}/options?${queryString}`)
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true)
};

async function testIsAuthor(app, original){
    const response = await request(app).get(`/api${original.url}?author=${encodeURI(original.author)}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({isAuthor:true})
}
async function testisNotAuthor(app, original){
    const author = `${original.author}not`;
    const response = await request(app).get(`/api${original.url}?author=${encodeURI(author)}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({isAuthor:false})
}

async function testNotFound(app, path){
    const random =  getRandomName('random');
    const response = await request(app).get(`/api/${path}/${encodeURI(random)}`);
    expect(response.status).toBe(404);
}

async function testMismatchIDs(app, response, original){
    const cookie = response.headers['set-cookie'];
    const updated = await request(app).put(`/api${original.url}manipulated`).send(original).set("Cookie", cookie);
    expect(updated.status).toBe(400);
}
async function testNoDataPassed(app, response, original){
    const cookie = response.headers['set-cookie'];
    const updated = await request(app).put(`/api${original.url}manipulated`).set("Cookie", cookie);
    expect(updated.status).toBe(400);
}

function getRandomName(prefix) {
    return `${prefix}_${Math.random().toString(36).substring(2, 15)}`;
}
  
async function registerUser(app) {
    const email = getRandomName('email');
    const username = getRandomName('username');
    const password = 'toomanysecrets';
    const response = await request(app).post('/api/auth/register').send({ email, username, password });

    return [response, email, username, password];
}

async function createCharacter(app){
    const [register, , author] = await registerUser(app);
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
module.exports = { 
    testGetSpecific,
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
    getRandomName,
    registerUser,
    createCharacter
}