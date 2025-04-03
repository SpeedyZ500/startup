const request = require('supertest');
const {app, createID} = require('./service');
const { biomesRouter } = require(`./worldbuilding/biomes`)
app.use('/api', biomesRouter);
