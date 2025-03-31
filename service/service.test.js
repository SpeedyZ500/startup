const request = require('supertest');
const {app} = require('./service');


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

test('Logout', async () => {
    const [register] = await registerUser();
    const cookie = register.headers['set-cookie'];
    const loggout = await request(app).delete('/api/auth/logout').set('Cookie', cookie);
    expect(loggout).toBeDefined();
    expect(loggout.status).toBe(200);
})

test('Logout failed', async () => {
    const loggout = await request(app).delete('/api/auth/logout');
    expect(loggout).toBeDefined();
    expect(loggout.status).toBe(401);
})

test('get authenticated', async () => {
    const [register] = await registerUser();
    const cookie = register.headers['set-cookie'];
    const authenticated = true
    const result = await request(app).get('/api/auth').set('Cookie', cookie);
    expect(result.headers['content-type']).toMatch('application/json; charset=utf-8');

    expect(result.body).toMatchObject({authenticated})
})

test('get unauthenticated', async () => {
    const authenticated = false;
    const result = await request(app).get('/api/auth');
    expect(result.headers['content-type']).toMatch('application/json; charset=utf-8');

    expect(result.body).toMatchObject({authenticated});
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
test('get me unauthenteicated', async () => {
    const getMe = await request(app).get('/api/user/me');
    expect(getMe.status).toBe(401);
})

test('get me badToken', async () => {
    const [register] = await registerUser();
    const cookie = register.headers['set-cookie'];
    await request(app).delete('/api/auth/logout').set('Cookie', cookie);

    const getMe = await request(app).get('/api/user/me').set('Cookie',cookie);
    expect(getMe.status).toBe(401);
})

test('get user', async () => {
    const [, , username] = await registerUser();
    const displayname = username;
    const getUser = await request(app).get(`/api/user/${encodeURIComponent(username)}`);
    expect(getUser.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(getUser.body).toMatchObject({displayname})
})

test('get nonexisting user', async () => {
    const username = getRandomName('username');
    const displayname = username;
    const getUser = await request(app).get(`/api/user/${encodeURIComponent(username)}`);
    expect(getUser.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(getUser.body).toMatchObject({displayname})
})

test('update profanity', async () => {
    const [register, email, username] = await registerUser();
    const displayname = username;
    const profanityFilter = false;
    const cookie = register.headers['set-cookie'];
    const updateProf = await request(app).put('/api/user/prof').send({profanityFilter}).set('Cookie', cookie);
    expect(updateProf.headers['content-type']).toMatch('application/json; charset=utf-8');
    expect(updateProf.body).toMatchObject({email, username, displayname, profanityFilter})
})

test('update profanity, unauthenticated', async () => {
    const profanityFilter = false;
    const updateProf = await request(app).put('/api/user/prof').send({profanityFilter});
    expect(updateProf.status).toBe(401);
})




test('change password', async () => {
    const [register, , ,oldPassword] = await registerUser();
    const newPassword = "whatever"
    const confirmPassword = newPassword;
    const cookie = register.headers['set-cookie'];

    const updatePass = await request(app).put('/api/user/pass').send({oldPassword, newPassword, confirmPassword}).set('Cookie', cookie);
    expect(updatePass.status).toBe(200);
})

test('same as old', async () => {
    const [register, , ,oldPassword] = await registerUser();
    const newPassword = oldPassword
    const confirmPassword = oldPassword;
    const cookie = register.headers['set-cookie'];

    const updatePass = await request(app).put('/api/user/pass').send({oldPassword, newPassword, confirmPassword}).set('Cookie', cookie);
    expect(updatePass.status).toBe(400);
})

test('wrong password', async () => {
    const [register, , oldPassword] = await registerUser();
    const newPassword = "whatever"
    const confirmPassword = newPassword;
    const cookie = register.headers['set-cookie'];

    const updatePass = await request(app).put('/api/user/pass').send({oldPassword, newPassword, confirmPassword}).set('Cookie', cookie);
    expect(updatePass.status).toBe(401);
})

test('"new and confirm dont match', async () => {
    const [register, , , oldPassword] = await registerUser();
    const newPassword = "whatever"
    const confirmPassword = "whateve";
    const cookie = register.headers['set-cookie'];

    const updatePass = await request(app).put('/api/user/pass').send({oldPassword, newPassword, confirmPassword}).set('Cookie', cookie);
    expect(updatePass.status).toBe(400);
})

test('missing component', async () => {
    const [register, , , oldPassword] = await registerUser();
    const newPassword = "whatever"
    const cookie = register.headers['set-cookie'];

    const updatePass = await request(app).put('/api/user/pass').send({oldPassword, newPassword}).set('Cookie', cookie);
    expect(updatePass.status).toBe(400);
})

test('post advice', async () => {
    const [register, , author] = await registerUser();
    const description = "whatever";
    const cookie = register.headers['set-cookie'];
    const writingadvice = await request(app).post('/api/writingadvice').send({description}).set('Cookie', cookie);
    expect(writingadvice.headers['content-type']).toMatch('application/json; charset=utf-8');

    expect(writingadvice.body).toMatchObject({description, author});
})

test('post advice without decription', async () => {
    const [register] = await registerUser();
    const cookie = register.headers['set-cookie'];
    const writingadvice = await request(app).post('/api/writingadvice').set('Cookie', cookie);
    expect(writingadvice.status).toBe(400);
})

test('post prompt', async () => {
    const [register, , author] = await registerUser();
    const description = "whatever";
    const cookie = register.headers['set-cookie'];
    const writingprompts = await request(app).post('/api/writingprompts').send({description}).set('Cookie', cookie);
    expect(writingprompts.headers['content-type']).toMatch('application/json; charset=utf-8');

    expect(writingprompts.body).toMatchObject({description, author});
})

test('post prompt without decription', async () => {
    const [register] = await registerUser();
    const cookie = register.headers['set-cookie'];
    const writingprompts = await request(app).post('/api/writingprompts').set('Cookie', cookie);
    expect(writingprompts.status).toBe(400);
})

test('get prompts', async () => {
    const writingprompts = await request(app).get('/api/writingprompts');
    expect(writingprompts.status).toBe(200);
    expect(Array.isArray(writingprompts.body)).toBe(true);

})

test('get advice', async () => {
    const writingadvice = await request(app).get('/api/writingadvice');
    expect(writingadvice.status).toBe(200);
    expect(Array.isArray(writingadvice.body)).toBe(true);

})

module.exports = {registerUser, getRandomName}

