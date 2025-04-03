const request = require('supertest');
const {app, createID} = require('./service');
const { magicRouter } = require(`./worldbuilding/magicsystems`)
app.use('/api', magicRouter);
