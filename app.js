const path = require('path');
const colors = require('colors');
const express = require('express');
let app = express();

app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, 'index.html'))
);

app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/fixtures', express.static(path.join(__dirname, 'fixtures')));

const webpack = require('webpack');
let compiler = webpack(require('./webpack.config.js'));
compiler.watch({ // watch options:
    aggregateTimeout: 300, // wait so long for more changes
    poll: true // use polling instead of native watchers
}, (err) => {
    if (err) {
        throw err;
    } else {
        startAppOrNotifyChange();
    }
});

let listening = false;
function startAppOrNotifyChange() {
    if (listening) {
        console.log(colors.green('files updated!'));
    } else {
        listening = true;
        app.listen(3000, () => console.log(
            colors.green('Example app listening on port 3000!'))
        );
    }
}
