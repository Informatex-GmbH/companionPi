/* global this, kijs, ifmx */

// --------------------------------------------------------------
// ifmx.sp.KeyboardContainer
// --------------------------------------------------------------
kijs.createNamespace('ifmx.sp');

ifmx.sp.KeyboardContainer = class ifmx_sp_KeyboardContainer extends kijs.gui.Container {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config = {}) {
        super(false);

        this._app = new ifmx.app.App();
        this._textField = null;

        // Config generieren
        Object.assign(this._defaultConfig, {
            cls: 'ifmx-keyboard-container',
            elements: this._createElements()
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
    // MEMBERS
    // --------------------------------------------------------------

    // PROTECTED
    _createElements() {
        this._textField = new kijs.gui.field.Text(
            {
                name: 'ip',
                labelHide: true,
                required: true,
                validationRegExp: {
                    regExp: /^(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                    msg: kijs.getText('No valid IP-Address')
                },
                on: {
                    input: this.#onIpAddressInput,
                    context: this
                }
            }
        );

        return [
            this._textField,
            {
                xtype: 'kijs.gui.Container',
                cls: 'ifmx-keyboard',
                elements: [
                    {
                        xtype: 'kijs.gui.Container',
                        elements: [
                            {
                                xtype: 'kijs.gui.Button',
                                name: 7,
                                caption: 7,
                                on: {
                                    click: this.#onKeyboardBtnClick,
                                    context: this
                                }
                            }, {
                                xtype: 'kijs.gui.Button',
                                name: 8,
                                caption: 8,
                                on: {
                                    click: this.#onKeyboardBtnClick,
                                    context: this
                                }
                            }, {
                                xtype: 'kijs.gui.Button',
                                name: 9,
                                caption: 9,
                                on: {
                                    click: this.#onKeyboardBtnClick,
                                    context: this
                                }
                            }
                        ]
                    },{
                        xtype: 'kijs.gui.Container',
                        elements: [
                            {
                                xtype: 'kijs.gui.Button',
                                name: 4,
                                caption: 4,
                                on: {
                                    click: this.#onKeyboardBtnClick,
                                    context: this
                                }
                            }, {
                                xtype: 'kijs.gui.Button',
                                name: 5,
                                caption: 5,
                                on: {
                                    click: this.#onKeyboardBtnClick,
                                    context: this
                                }
                            }, {
                                xtype: 'kijs.gui.Button',
                                name: 6,
                                caption: 6,
                                on: {
                                    click: this.#onKeyboardBtnClick,
                                    context: this
                                }
                            }
                        ]
                    },{
                        xtype: 'kijs.gui.Container',
                        elements: [
                            {
                                xtype: 'kijs.gui.Button',
                                name: 1,
                                caption: 1,
                                on: {
                                    click: this.#onKeyboardBtnClick,
                                    context: this
                                }
                            }, {
                                xtype: 'kijs.gui.Button',
                                name: 2,
                                caption: 2,
                                on: {
                                    click: this.#onKeyboardBtnClick,
                                    context: this
                                }
                            }, {
                                xtype: 'kijs.gui.Button',
                                name: 3,
                                caption: 3,
                                on: {
                                    click: this.#onKeyboardBtnClick,
                                    context: this
                                }
                            }
                        ]
                    },{
                        xtype: 'kijs.gui.Container',
                        elements: [
                            {
                                xtype: 'kijs.gui.Button',
                                name: 0,
                                caption: 0,
                                on: {
                                    click: this.#onKeyboardBtnClick,
                                    context: this
                                }
                            }, {
                                xtype: 'kijs.gui.Button',
                                name: '.',
                                caption: '.',
                                on: {
                                    click: this.#onKeyboardBtnClick,
                                    context: this
                                }
                            }, {
                                xtype: 'kijs.gui.Button',
                                name: 'Del',
                                iconMap: 'kijs.iconMap.Fa.delete-left',
                                on: {
                                    click: this.#onKeyboardBtnClick,
                                    context: this
                                }
                            }
                        ]
                    }
                ]
            },{
                xtype: 'kijs.gui.Button',
                name: 'addBtn',
                caption: kijs.getText('IP hinzufügen'),
                cls: 'ifmx-add-btn',
                disableFlex: false,
                isDefault: true,
                on: {
                    click: this.#onAddBtnClick,
                    context: this
                }
            }
        ];
    }

    // PRIVATE
    // LISTENERS
    #onAddBtnClick() {

        if (this._textField.validate()) {
            const data = {
                ip: this._textField.value,
                netmask: '255.255.255.0'
            };

            this._app.sendWsMessage('addIpAddress', data);
            this._textField.value = '';
        } else {
            kijs.gui.CornerTipContainer.show(kijs.getText('Fehler'), kijs.getText('Die IP-Adresse ist nicht gültig'), 'error');
        }
    }

    #onIpAddressInput(e) {
        let element = e.element;
        let value = element.value;
        let parts = value.split('.');

        parts.forEach(function (part, index) {

            if (part.length > 3) {
                if (parts.length < 4) {
                    let newPart = part.slice(3);
                    parts.push(newPart);
                }

                part = part.slice(0, 3);
                parts[index] = part;
            }
        });

        element.value = parts.join('.');
    }
    #onKeyboardBtnClick(e) {
        if (e.element.name === 'Del') {
            this._textField.value = this._textField.value.slice(0, -1);
        } else {
            this._textField.value = this._textField.value + e.element.name;
        }

        this._textField.raiseEvent('input');
        this._textField.validate();
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
