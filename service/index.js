const { app } = require('./service.js');
const charactersRouter = require('./characters.js');
const storiesRouter = require('./stories.js');
const biomesRouter = require('./worldbuilding/biomes.js');
const countriesRouter = require('./worldbuilding/countries.js');
const floraRouter = require('./worldbuilding/flora.js');
const magicRouter = require('./worldbuilding/magicsystems.js');
const organizationsRouter = require('./worldbuilding/organizations.js');
const racesRouter = require('./worldbuilding/races.js');
const wildlifeRouter = require('./worldbuilding/wildlife.js');
const worldsRouter = require('./worldbuilding/worlds.js');

app.use('/api', charactersRouter);
app.use('/api', storiesRouter);
app.use('/api', biomesRouter);
app.use('/api', countriesRouter);
app.use('/api', floraRouter);
app.use('/api', magicRouter);
app.use('/api', organizationsRouter);
app.use('/api', racesRouter);
app.use('/api', wildlifeRouter);
app.use('/api', worldsRouter);









const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
  });