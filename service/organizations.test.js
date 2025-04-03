const request = require('supertest');
const {app, createID} = require('./service');
const {organizationsRouter} = require(`./worldbuilding/organizations`);
app.use('/api', organizationsRouter);
