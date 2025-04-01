const request = require('supertest');
const {registerUser, getRandomName} = require('./service.test');

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
    const updated = await request(app).put(`/api${path}`).send({name:"noice"}).set("Cookie", cookie);
    expect(updated.status).toBe(404);
}

async function testWrongAuthor(original, app){
    const [register] = await registerUser();
    const cookie = register.headers['set-cookie'];

    const updated = await request(app).put(`/api${original.url}`).send(original).set("Cookie", cookie);
    expect(updated.status).toBe(401);
}

async function testPatchAdd(path, list, app){
    const [register] = await registerUser();
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
    const [register] = await registerUser();
    const cookie = register.headers['set-cookie'];
    const response = await request(app)
        .patch(`/api${path}/${encodeURI(list)}`)
        .send({ data, method: "delete" })
        .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body[list]).not.toContain(data);
}

async function testPatchNotFound(path, list, app){
    const [register, ,username] = await registerUser();
    const cookie = register.headers['set-cookie'];
    const response = await request(app)
    .patch(`/api/${path}/${username}/${list}`)
    .send("No Object To Patch")
    .set("Cookie", cookie);
    expect(response.status).toBe(404);
}

async function testPatchFailures(path, list, app){
    const [register] = await registerUser();
    const cookie = register.headers['set-cookie'];
    const response = await request(app)
    .patch(`/api/${path}/${list}`)
    .send("bad List")
    .set("Cookie", cookie);
    expect(response.status).toBe(400);
}

async function testPatchSections(path, app){
    const [register] = await registerUser();
    const cookie = register.headers['set-cookie'];
    const response = await request(app)
    .patch(`/api/${path}/sections`)
    .send("should not be able to ever edit sections")
    .set("Cookie", cookie);
    expect(response.status).toBe(400);
}

async function testPatchDescription(path, app){
    const [register] = await registerUser();
    const cookie = register.headers['set-cookie'];
    const response = await request(app)
    .patch(`/api/${path}/description`)
    .send("should not be able to ever edit description")
    .set("Cookie", cookie);
    expect(response.status).toBe(400);
}

async function testPatchCustom(path, app){
    const [register] = await registerUser();
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
    testPatchDescription
}