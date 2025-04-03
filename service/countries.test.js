const request = require('supertest');
const {app, createID} = require('./service');
const { countriesRouter } = require(`./worldbuilding/countries`)
app.use('/api', countriesRouter);
