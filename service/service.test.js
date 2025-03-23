const request = require('supertest');
const app = require('./service');
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

test('register', async () => {
    const [register, email, username] = await registerUser();
    const displayname = username;
    const profanityFilter = true;
    expect(register.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(register.body).toMatchObject({ email, username, displayname, profanityFilter });
});



