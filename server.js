'use strict';

const express = require('express');
const morgan = require('morgan');
var os = require("os");

const app = express();

function getNetworkInterfaces(ifaces) {

    const addresses = [];

    //TODO : inject POD_IP

    Object.keys(ifaces).forEach(function (name) {

        ifaces[name].forEach(function (iface) {
            if ('IPv4' === iface.family
                && !iface.internal) {
                const o = {};
                o[name] = iface.address
                addresses.push(o);
            }
        });
    });

    return addresses;

}

app.use(morgan("dev"));

app.get('/health', (req, res) => res.send(
    {
        status: 'ok',
        message: 'we are up and running'
    }
));

app.get('/', (req, res) => res.send({
    status: 'ok',
    namespace: process.env.MY_POD_NAMESPACE || 'docker',
    hostname: process.env.MY_POD_NAME || os.hostname(),
    ip: process.env.MY_POD_IP || getNetworkInterfaces(os.networkInterfaces()),
    timestamp: new Date().getTime()
}));

const port = process.env.PORT || 9000;
app.listen(port, () => console.log(`NodeJS server listening on port ${port}`));