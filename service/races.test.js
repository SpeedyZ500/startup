const request = require('supertest');
const {app, createID} = require('./service');
const {racesRouter} = require(`./worldbuilding/races`);
app.use('/api', racesRouter);
