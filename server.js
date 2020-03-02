'use strict';

const express = require('express');
const app = express();
const port = 9000;

app.get('/', (req, res) => res.send('Hello World !!!\n'));

app.listen(port, () => console.log(`NodeJS server listening on port ${port}`));