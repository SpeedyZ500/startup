const app = require('./service.js');


const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
  });