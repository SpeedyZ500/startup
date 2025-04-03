const request = require('supertest');
const {app, createID} = require('./service');
const { floraRouter } = require(`./worldbuilding/flora`)
app.use('/api', floraRouter);
