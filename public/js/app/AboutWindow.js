/* global this, kijs, ifmx */

// --------------------------------------------------------------
// ifmx.app.AboutWindow
// --------------------------------------------------------------
kijs.createNamespace('ifmx.app');

ifmx.app.AboutWindow = class ifmx_app_AboutWindow extends kijs.gui.Window {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._app = new ifmx.app.App();

        // Config generieren
        Object.assign(this._defaultConfig, {
            caption: kijs.getText('Über') + ' ' + this._app.name,
            cls: 'ifmx-app-aboutwindow',
            iconMap: 'kijs.iconMap.Fa.circle-info',
            closable: true,
            maximizable: false,
            resizable: false,
            modal: true,
            elements: this._createElements(),
        });

         // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // keine
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Fenster anzeigen
        this.show();
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PROTECTED

    // Config definieren
    _createElements() {

        let browser = (kijs.Navigator.browserVendor !== kijs.Navigator.browser ? kijs.Navigator.browserVendor + ' ' : '') + kijs.Navigator.browser + ' ' + kijs.Navigator.browserVersion;
        let resolution = screen.width + 'x' + screen.height + 'px';
        let system = (kijs.Navigator.osVendor + ' ' + kijs.Navigator.os + ' ' + kijs.Navigator.osVersion).trim();
        return [
            {
                xtype: 'kijs.gui.field.Display',
                label: 'App version:',
                value: this._app.version
            },{
                xtype: 'kijs.gui.field.Display',
                label: 'kijs version:',
                value: kijs.version
            }, {
                xtype: 'kijs.gui.field.Display',
                label: 'Browser:',
                value: browser
            }, {
                xtype: 'kijs.gui.field.Display',
                label: 'System:',
                value: system,
                visible: !!system
            }, {
                xtype: 'kijs.gui.field.Display',
                label: 'Screenresolution:',
                value: resolution
            }, {
                xtype: 'kijs.gui.field.Display',
                label: 'Developer:',
                value: 'Informatex'
            }
        ];
    }

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }

        // Basisklasse entladen
        super.destruct(true);

        // Variablen (Objekte/Arrays) leeren
    }
};
