const express = require('express');
const { createServer } = require('http');
const path = require('path');

function connect(PORT) {
    const __filename = new URL(import.meta.url).pathname;
    const __dirname = path.dirname(__filename);

    let app = global.app = express();
    console.log(app);

    let server = global.server = createServer(app);

    app.use(express.static(path.join(__dirname, 'server')));

    server.listen(PORT, () => {
        console.log('App listened on port', PORT);
    });
}

module.exports = connect;
