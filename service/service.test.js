const request = require('supertest');
const {app} = require('./service');
const character = require("./characters");


function getRandomName(prefix) {
    return `${prefix}_${Math.random().toString(36).substring(2, 15)}`;
}
  
async function registerUser() {
    const email = getRandomName('email');
    const username = getRandomName('username');
    const password = 'toomanysecrets';
    const response = await request(app).post('/api/auth/register').send({ email, username, password });

    return [response, email, username, password];
}

function validateAuth(response) {
    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const cookie = response.headers['set-cookie'];
    expect(cookie).toBeDefined();
    const uuidRegex = /^token=[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}.*$/i;
    const token = cookie.find((c) => c.match(uuidRegex));
    expect(token).toBeDefined();
  }

  
test('register', async () => {
    const [register, email, username] = await registerUser();
    const displayname = username;
    const profanityFilter = true;

    validateAuth(register)
    expect(register.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(register.body).toMatchObject({ email, username, displayname, profanityFilter });
});

test('create duplicate user', async () => {
    const [, email, username] = await registerUser();
    const response = await request(app).post('/api/auth/register').send({ email, username, password:"password" });
    expect(response.status).toBe(409);
})

test('login', async () => {
    const [, email, username, password] = await registerUser();
    const displayname = username;
    const profanityFilter = true;
    const response = await request(app).put('/api/auth/login').send({username, password });
    expect(response.headers['content-type']).toMatch('application/json; charset=utf-8');
    validateAuth(response)

    expect(response.body).toMatchObject({ email, username, displayname, profanityFilter });
})

test('Wrong Username or password, or non-existing user', async () => {
    const response = await request(app).put('/api/auth/login').send({username:"user", password:"pass"});
    expect(response.status).toBe(401);
})

test('get me', async () => {
    const [register, email, username] = await registerUser();
    const displayname = username;
    const profanityFilter = true;
    const cookie = register.headers['set-cookie'];
    const getMe = await request(app).get('/api/user/me').set('Cookie', cookie);
    expect(getMe.status).toBe(200);
    expect(getMe.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(getMe.body).toMatchObject({ email, username, displayname, profanityFilter });
  });







