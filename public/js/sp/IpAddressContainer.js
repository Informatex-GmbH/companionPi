/* global this, kijs, ifmx */

// --------------------------------------------------------------
// ifmx.sp.IpAddressContainer
// --------------------------------------------------------------
kijs.createNamespace('ifmx.sp');

ifmx.sp.IpAddressContainer = class ifmx_sp_IpAddressContainer extends kijs.gui.Container {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config = {}) {
        super(false);

        this._app = new ifmx.app.App();
        this._textField = null;

        // Config generieren
        Object.assign(this._defaultConfig, {
            cls: 'ifmx-ipaddress-container'
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
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    set addresses(val) {
        this._createElements(val);
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    // PROTECTED
    _createElements(addresses) {
        if (!kijs.isArray(addresses)) {
            addresses = [addresses];
        }

        let elements = [];
        kijs.Array.each(addresses, address => {
            let element = new kijs.gui.Element(
                {
                    cls: 'ifmx-ipaddress',
                    html: address,
                    on: {
                        click: this.#onAddressClick,
                        context: this
                    }
                }
            );

            elements.push(element);
        }, this);

        this.removeAll();
        this.add(elements);
    }

    // LISTENERS
    #onAddressClick(e) {
        kijs.gui.MsgBox.confirm(kijs.getText('IP entfernen'), kijs.getText('Willst du die IP %1 entfernen?', '', e.element.html)).then(result => {
            if (result.btn === 'yes') {
                const data = {
                    ip: e.element.html
                };

                this._app.sendWsMessage('removeIpAddress', data);
            }
        });
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

        this._app = null;
        this._textField = null;
    }
};
