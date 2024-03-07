/* global kijs, ifmx */

// --------------------------------------------------------------
// ifmx.App (singleton)
// --------------------------------------------------------------
kijs.createNamespace('ifmx.app');

ifmx.app.App = class ifmx_app_App {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config = null) {
        const companionPort = 8000;

        // Weiterleiten zu Companion, wenn nicht von localhost geladen
        if (window.location.origin !== 'http://localhost') {
             window.location.replace(window.location.origin + ':' + companionPort);
        } else {

            // Singleton (es wird immer die gleiche Instanz zurückgegeben)
            if (!ifmx_app_App._singletonInstance) {
                ifmx_app_App._singletonInstance = this;

                if (config === null) {
                    throw new Error('cannot create instance of App without config.');
                }

                this._config = config;
                this._viewport = null;
                this._mainPanel = null;
                this._offlineWindow = null;

                // RPC-Instanz
                let rpcConfig = {};
                if (config.ajaxUrl) {
                    rpcConfig.url = config.ajaxUrl;
                }
                if (config.ajaxTimeout) {
                    rpcConfig.timeout = config.ajaxTimeout * 1000;
                }
                this._rpc = new kijs.gui.Rpc(rpcConfig);

                // Events
                window.addEventListener('beforeunload', this._onBeforeUnload.bind(this));
                window.addEventListener('error', this._onError.bind(this));

                // Websocket
                let wssUrl = 'ws://' + window.location.host + '/ws';
                this._websocket = new WebSocket(wssUrl);
                this._websocket.addEventListener('open', this._onWsConnect.bind(this));

                this._websocket.addEventListener('message', this._onWsMessage.bind(this));
                this._websocket.addEventListener('close', function () {
                    console.error('Websocket connection lost');

                    kijs.gui.MsgBox.error('Fehler', kijs.getText('Websocket connection lost'), function (e) {
                        if (e.btn === 'ok') {
                            location.reload();
                        }
                    });
                }.bind(this));
            }

            return ifmx_app_App._singletonInstance;
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get config() {
        return this._config;
    }

    get isDirty() {
        let isDirty = false;
        if (this._viewport) {
            kijs.Array.each(this._viewport.elements, function (element) {
                if (element instanceof ifmx.app.MainPanel) {
                    isDirty = element.isDirty;
                }
            }, this);
        }
        return isDirty;
    }

    get isMobileDevice() {
        return !!(navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i));
    }

    get localStorage() {
        return localStorage;
    }

    get mainPanel() {
        return this._mainPanel;
    }

    get name() {
        return this.config.name;
    };

    get pushNotificationSupported() {
        return !!(navigator.serviceWorker && window.PushManager)
    }

    get rpc() {
        return this._rpc;
    }

    get serviceworker() {
        return this._serviceworker;
    }

    get version() {
        return this.config.version;
    };

    get webauthnSupported() {
        return !!(navigator.credentials && navigator.credentials.create);
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Startet die App. Hauptstartpunkt, wird von index aufgerufen.
     * @returns {undefined}
     */
    run() {

            // ViewPort erstellen
            this._viewport = new kijs.gui.ViewPort({
                cls: 'kijs-flexcolumn',
                theme: 'dark'
            });
            this._viewport.render();

            // App anzeigen
            this._startApp();
    }

    sendWsMessage(fn, data = {}) {
        let params = {
            fn: fn,
            data: data
        };

        params = JSON.stringify(params);
        this._websocket.send(params);
    }

    // PROTECTED
    _showOfflineWindow() {
        if (!this._offlineWindow) {
            this._offlineWindow = new kijs.gui.Window(
                {
                    caption: kijs.getText('Offline'),
                    iconMap: 'kijs.iconMap.Fa.globe',
                    innerStyle: {
                        padding: '10px'
                    },
                    modal: true,
                    closable: false,
                    resizable: false,
                    maximizable: false,
                    elements: [
                        {
                            xtype: 'kijs.gui.Element',
                            html: kijs.getText('No console connected')
                        }
                    ]
                }
            );
        }
        this._offlineWindow.show();
    }

    /**
     * Startet das Hauptpanel
     * @returns {undefined}
     */
    _startApp() {
        this._mainPanel = new ifmx.app.MainPanel();
        this._viewport.add(this._mainPanel);
    }

    // Listeners

    /**
     * Zeigt eine Meldung an, wenn die Seite verlassen wird, und noch ungespeicherte
     * Daten vorhanden sind.
     * @param {Object} e
     * @returns {Boolean}
     */
    _onBeforeUnload(e) {
        if (this.isDirty) {
            e.preventDefault();
            e.returnValue = '';
            return false;
        }
    }

    _onError(e) {
        const log = {};
        if (e.error instanceof Error) {
            const err = e.error;
            log.message = err.message || err.description || '';
            log.filename = err.fileName || err.filename || '';
            log.lineNumber = err.lineno || err.lineNumber || null;
            log.columnNumber = err.colno || err.columnNumber || null;
            log.stack = err.stack || '';

        } else {
            log.message = e.message || e.description || '';
            log.filename = e.filename || e.fileName || '';
            log.lineNumber = e.lineno || e.lineNumber || null;
            log.columnNumber = e.colno || e.columnNumber || null;
            log.stack = '';
        }

        // Auf dem Server ins Logfile schreiben
        if (this._rpc && this._rpc.do) {
            this._rpc.do('jsErrorLog', log);
        }
    }

    _onWsConnect() {
        this.sendWsMessage('getInfos');

        console.log('Websocket connected');
    }

    _onWsMessage(e) {
        let message = JSON.parse(e.data);

        switch (message.fn) {
            case 'addIpAddress':
                this._mainPanel.infos = message.data;
                break;

            case 'getInfos':
                this._mainPanel.infos = message.data;
                break;

            case 'error':
                kijs.gui.MsgBox.error('Error', message.msg);
                break;

            case 'ipAddressChange':
                this._mainPanel.ip = message.data.ip;
                break;

            case 'removeIpAddress':
                this._mainPanel.infos = message.data;
                break;

            case 'udpData':
                this._mainPanel.setData(message.data.port, message.data);
                break;
            default:
                console.log(message);
        }
    }

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        // RPC entladen
        this._rpc.destruct();

        // Variablen
        this._config = null;
        this._viewport = null;
        this._mainPanel = null;
        this._offlineWindow = null;
        this._rpc = null;
        this._viewport = null;
        this._serviceworker = null;
    }
};
