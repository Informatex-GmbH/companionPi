/* global kijs, ifmx, this */

// --------------------------------------------------------------
// ifmx.app.MainPanel
// --------------------------------------------------------------
kijs.createNamespace('ifmx.app');

ifmx.app.MainPanel = class ifmx_app_MainPanel extends kijs.gui.Panel {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config = {}) {
        super(false);

        this._app = new ifmx.app.App();
        this._mainPanel = null;

        // Config generieren
        config = Object.assign({}, {
            caption: this._app.name,
            iconCls: 'ifmx-logo-header',
            cls: 'ifmx-mainpanel',
            headerBarElements: [{
                    xtype: 'kijs.gui.Button',
                    name: 'infoBtn',
                    iconMap: 'kijs.iconMap.Fa.circle-info',
                    tooltip: kijs.getText('Über') + ' ' + this._app.name,
                    on: {
                        click: function () {
                            new ifmx.app.AboutWindow();
                        },
                        context: this
                    }
                }
            ],
            elements: this._createElements()
        }, config);

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // keine
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    set ip(val) {
        this.caption = this.caption.replace(/\(.*\)/, '') + ' (' + val + ')';
    }

    set infos(val) {
        this.down('ipAddresses').addresses = val.ipAddresses;
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    // PROTECTED

    /**
     * Erstellt die Elemente
     * @returns {Array}
     */
    _createElements() {
        return [
            {
                xtype: 'ifmx.sp.KeyboardContainer',
                name: 'keyboard'
            },{
                xtype: 'ifmx.sp.IpAddressContainer',
                name: 'ipAddresses'
            }
        ];
    }

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        super.destruct();
        this._app = null;
        this._mainPanel = null;
    }
};
