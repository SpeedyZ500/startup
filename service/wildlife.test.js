const request = require('supertest');
const {app, createID} = require('./service');

const {wildlifeRouter} = require(`./worldbuilding/wildlife`);
app.use('/api', wildlifeRouter);
