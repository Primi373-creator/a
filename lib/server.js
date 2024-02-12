const express = require("express");
const app = express();
const path = require('path');

function connect(PORT) {
app.use(express.static(path.join(__dirname, 'server')));
app.listen(PORT, () => { console.log('App listened on port', PORT); });
}

module.exports = connect;
