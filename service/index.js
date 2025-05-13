const { app } = require('./service.js');
const { peerProxy } = require('./peerProxy.js');

const characterRouter = require('./characters.js');
const storiesRouter = require('./stories.js');
const biomesRouter = require('./biomes.js');
const countriesRouter = require('./countries.js');
const floraRouter = require('./flora.js');
const magicRouter = require('./magicsystems.js');
const organizationsRouter = require('./organizations.js');
const racesRouter = require('./races.js');
const wildlifeRouter = require('./wildlife.js');
const worldsRouter = require('./worlds.js');

app.use('/api', characterRouter);
app.use('/api', storiesRouter);
app.use('/api', biomesRouter);
app.use('/api', countriesRouter);
app.use('/api', floraRouter);
app.use('/api', magicRouter);
app.use('/api', organizationsRouter);
app.use('/api', racesRouter);
app.use('/api', wildlifeRouter);
app.use('/api', worldsRouter);
app.use('/login*', (_req, res) => {
  res.sendFile('login.html', { root: 'public' });
})
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});







const port = process.argv.length > 2 ? process.argv[2] : 4000;

const httpService = app.listen(port,  () => {
    console.log(`Listening on port ${port}`);
  });


peerProxy(httpService)