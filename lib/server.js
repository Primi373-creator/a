const express = require("express");
const app = express();
const path = require('path');

function connect(PORT) {
app.use(express.static(path.join(__dirname, 'server')));
app.listen(port, () => console.log(`Secktor Server listening on port http://localhost:${port}!`));
}

module.exports = connect;
