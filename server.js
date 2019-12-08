const path = require('path');
var compression = require('compression')
const express = require('express');
const app = express();
const outputFolder = "/dist/Website"

/*
// If an incoming request uses
// a protocol other than HTTPS,
// redirect that request to the
// same url but with HTTPS
const forceSSL = function() {
  return function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    next();
  }
}

// Instruct the app
// to use the forceSSL
// middleware
app.use(forceSSL());
*/

//Applies standard GZIP compression encoding
app.use(compression());

// Run the app by serving the static files
// in the dist directory
app.use(express.static(__dirname + outputFolder));

// For all GET requests, send back index.html
// so that PathLocationStrategy can be used
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + outputFolder + '/index.html'));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080, () => {
  console.log(`Mi Cocina website running over Node.JS server is listening on port: ${process.env.PORT || 8080}`);
  console.log(`Environment is: ${(!process.env.NODE_ENV) ? "Not defined" : process.env.NODE_ENV}`);

  if (process.env.NODE_ENV == "production") {
      console.warn(`\n
      =============================================================
      CURRENT ENVIRONMENT SETTINGS CORRESPONDS TO: PRODUCTION SITE.
      =============================================================\n`)
  }

  console.log(`Executing on folder: ${__dirname + outputFolder}`);
  console.log(`Executing script: ${__filename}`);
  console.log(`\nServer is ready!\n`);
});