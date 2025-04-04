const request = require('supertest');
const {app, createID} = require('./service');
const storiesRouter = require(`./stories`);
app.use('/api', storiesRouter);
