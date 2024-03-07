// --------------------------------------------------------------
// Node.js Server
// --------------------------------------------------------------

'use strict';

const process = require('process');
process.chdir(__dirname);

const http = require('http');
const express = require('express');
const JSON5 = require('json5');
const fs = require('fs');

const app = express();
const config = JSON5.parse(fs.readFileSync('../config/config.json5', 'utf8'));

app.use(express.json());

// kijs
app.post('/', (req, res) => {

    if (req.headers['x-library'] !== undefined && req.headers['x-library'] === 'kijs') {

        // Content Type validieren
        if (req.headers['content-type'] !== 'application/json') {
            res.send('Invalid Content-Type');
            return;
        }

        require('./js/ag/kijsRouter');
        const kijs = new kijsRouter();
        kijs.handleRequest(req.body).then(responseData => {
            res.send(responseData);
        });

    } else {
        res.status(403).end();
    }
});

app.use(express.static('../public'));

// HTML
app.get('/', (req, res) => {
    let html = fs.readFileSync('../public/resources/templ/guiMain.html', 'utf8')
    html = html.replace('#CONFIG#', JSON5.stringify(config.app));

    res.send(html);
});

let server = http.createServer({}, app);
server.addListener('upgrade', (req, res, head) => console.log('UPGRADE:', req.url));
server.on('error', (err) => console.error(err));
server.listen(config.app.port, () => console.log('Http running on port ' + config.app.port));

require('./websocketServer');
const wss = new websocketServer(server);
try {
        // // set ip address
        // require('./system');
        // system.setIpAddress(data.ip, data.netmask).then(result => {
        //
        // });

    // const udpServers = {};
    // wss.on('startUdpServer', data => {
    //
    //     // set ip address
    //     require('./system');
    //     system.setIpAddress(data.ip, data.netmask).then(result => {
    //
    //         const msg = {
    //             fn: 'ipAddressChange',
    //             data: {
    //                 ip: data.ip,
    //                 netmask: data.netmask
    //             }
    //         };
    //         wss.sendToClients(msg);
    //
    //         require('./udpServer');
    //         for (let i = 0; i < data.ports.length; i++) {
    //             const port = data.ports[i];
    //
    //             // stop server if exists
    //             const promises = [];
    //             for (const [key, value] of Object.entries(udpServers)) {
    //                 promises.push(value.stopServer());
    //                 delete udpServers[key];
    //             }
    //
    //             Promise.all(promises).then(() => {
    //                 // start new server
    //                 const udp = new udpSocketServer(port)
    //                 udpServers[port] = udp;
    //
    //                 // listener when data comes in
    //                 udp.on('data', params => {
    //
    //                     const data = {
    //                         fn: 'udpData',
    //                         data: params
    //                     };
    //
    //                     wss.sendToClients(data);
    //                 });
    //             });
    //         }
    //     }).catch(error => {
    //         const msg = {
    //             fn: 'error',
    //             msg: error
    //         };
    //
    //         wss.sendToClients(msg);
    //     });
    // });
} catch (error) {
    if (wss) {
        const msg = {
            fn: 'error',
            msg: error
        };

        wss.sendToClients(msg);
    }
}
