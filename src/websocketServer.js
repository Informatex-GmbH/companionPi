// --------------------------------------------------------------
// WebsocketServer
// --------------------------------------------------------------
const ws = require('ws');
const JSON5 = require('json5');
const EventEmitter = require('node:events');
const {exec} = require('child_process');

websocketServer = class websocketServer extends EventEmitter {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(server) {
        super();
        this._wss = new ws.Server({server, path: '/ws'});

        // Listeners
        this._wss.on('connection', this._onConnection.bind(this));
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get instance() {
        return this._wss;
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    sendToClient(ws, data) {
        data = JSON.stringify(data);
        ws.send(data);
    }

    sendToClients(data) {
        data = JSON.stringify(data);
        this._wss.clients.forEach(function each(client) {
            if (client !== ws) {
                client.send(data);
            }
        });
    }

    // LISTENERS
    _onConnection(webSocket) {
        console.log('new client connected');

        webSocket.on('message', function (message) {
            this._onMessage(webSocket, message);
        }.bind(this));

        // handling what to do when clients disconnects from server
        webSocket.on('close', () => {
            console.log('the client has disconnected');
        });

        // handling client connection error
        webSocket.onerror = function () {
            console.log('Some Error occurred')
        }
    }

    _onMessage(ws, message) {
        try {
            message = JSON5.parse(message);

            console.log(message);

            if (message.fn) {
                let data;
                let requestData = message.data;
                let promisses = [];

                switch (message.fn) {
                    case 'addIpAddress':
                        require('./system');
                        promisses.push(new Promise(resolve => {
                            system.addIpAddress(message.data.ip, message.data.netmask).then(result => {
                                system.getIpAddresses().then(ipAddresses => {
                                    data = {
                                        ipAddresses: ipAddresses
                                    };

                                    resolve(true);
                                });
                            });
                        }));
                        break;

                    case 'getInfos':
                        require('./system');
                        promisses.push(system.getIpAddresses().then(ipAddresses => {
                            data = {
                                ipAddresses: ipAddresses
                            };
                        }));
                        break;

                    case 'getIpAddresses':
                        promisses.push(system.getIpAddresses().then(ipAddresses => {
                            data = {
                                ipAddresses: ipAddresses
                            };
                        }));
                        break;

                    case 'removeIpAddress':
                        require('./system');
                        promisses.push(new Promise(resolve => {
                            system.removeIpAddress(message.data.ip).then(result => {
                                system.getIpAddresses().then(ipAddresses => {
                                    data = {
                                        ipAddresses: ipAddresses
                                    };

                                    resolve(true);
                                });
                            });
                        }));
                        break;

                    case 'startUdpServer':
                        this.emit('startUdpServer', requestData);
                        break;
                }

                if (promisses) {
                    Promise.all(promisses).then(() => {
                        if (data) {
                            const response = {
                                fn: message.fn,
                                data: data
                            };
                            this.sendToClient(ws, response);
                        }
                    });
                } else if (data) {
                    const response = {
                        fn: message.fn,
                        data: data
                    };
                    this.sendToClient(ws, response);
                }
            }
        } catch (error) {
            console.log('err: ' + error);
            this.sendToClient(ws, error);
        }
    }

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {

    }
};
