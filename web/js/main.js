const url = window.location.href + '/ajax.php';
const companionPort = 8000;

// Weiterleiten zu Companion wenn nicht von localhost geladen
if (window.location.origin !== 'http://localhost') {
    window.location.replace(window.location.origin + ':' + companionPort);
}

document.addEventListener('DOMContentLoaded', function () {

    // Listeners setzen
    document.getElementById('wifi').onchange = onWifiChange;
    document.getElementById('addIpAddress').oninput = onAddIpAddressChange;
    document.getElementById('addIpAddressBtn').onclick = onAddIpAdresseBtnClick;
    document.getElementById('keyboard').onclick = onKeyboardClick;

    // Companion Port auf GUI schreiben
    document.getElementById('companionPort').innerHTML = companionPort.toString();

    // WLAN-Daten laden
    _loadWifiData();

    // IP-Adressen auslesen
    _loadIpAddresses();
});

document.addEventListener('click', function (e) {
    if (e.target.nodeName === 'INPUT') {
        selectedInputField = e.target;
        selectedInputField.dispatchEvent(new Event('input'));
    }
});


// PROTECTED

function _loadIpAddresses() {
    _makeRequest({}, 'getIpAddresses').then(response => {
        let element = document.getElementById('ipAddresses');

        // Alle IP-Adressen löschen
        while (element.firstChild) {
            element.removeChild(element.lastChild);
        }

        // IP-Adressen hinzufügen
        if (response.rows) {
            response.rows.forEach((ipAddress) => {
                let row = document.createElement('p');
                row.innerHTML = ipAddress;
                row.onclick = function() {
                    onRemoveIpAddressClick(ipAddress);
                };

                element.append(row);
            });
        }
    });
}


function _loadWifiData() {
    _makeRequest({}, 'getWifiData').then(response => {
       if (response.ssid) {
           document.getElementById('ssid').innerHTML = response.ssid;
       }

       if (response.password) {
           document.getElementById('password').innerHTML = response.password;
       }
    });
}


// Führt einen XHR-Request aus
function _makeRequest(data, type, params = '') {
    data = JSON.stringify(data);

    if (params) {
        params = '&' + params;
    }

    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
            const responseJson = JSON.parse(xhr.response);

            // Nachrichten verarbeiten
            _manageMessages(responseJson);

            resolve(responseJson);
        });

        xhr.addEventListener('error', () => {
            const responseJson = JSON.parse(xhr.response);

            // Nachrichten verarbeiten
            _manageMessages(json);

            reject(xhr.response);
        });

        // Request senden
        xhr.open('POST', url + '?type=' + type + params);

        // Content Header setzen
        xhr.setRequestHeader('Content-Type', 'application/json');

        // Daten senden
        xhr.send(data);
    });
}


function _manageMessages(response) {
    if (response.errMsg) {
        tata.error('Fehler', response.errMsg, {
            duration: 10000
        });
    } else if (response.msg) {
        tata.success('Info', response.msg, {
            duration: 10000
        });
    }
}


// LISTENERS

function onAddIpAddressChange(e) {
    let element = e.target;
    let value = e.target.value.replace(/\D/g, '');
    let numbers = value.split('');
    let newValue = '';

    numbers.forEach(function (char, index) {

        if (index >= 12) {
            return;
        }

        if (index && index % 3 === 0) {
            newValue += '.';
        }

        newValue += char;
    });

    // Parts validieren
    let parts = newValue.split('.');
    for (let i = 0; i < parts.length; i++) {
        if (parseInt(parts[i]) >= 255) {
            tata.error('Fehler', 'Die IP-Adresse ist ungültig.<br>Nur Werte bis 254 sind erlaubt.', {
                duration: 10000
            });
            newValue = '';
            break;
        }
    }

    element.value = newValue;
}

function onAddIpAdresseBtnClick() {
    let element = document.getElementById('addIpAddress');
    let ip = element.value;

    let data = {
        value: ip
    };

    _makeRequest(data, 'addIpAddress').then((response) => {

        if (!response.errMsg) {
            element.value = '';
        }

        _loadIpAddresses();
    });
}

function onRemoveIpAddressClick(ip) {
    let data = {
        value: ip
    };

    _makeRequest(data, 'removeIpAddress').then(() => {
        _loadIpAddresses();
    });
}

function onKeyboardClick(e) {

    if (e.target.classList.contains('button')) {
        let element = document.getElementById('addIpAddress');

        if (element) {
            let value = element.value;

            if (e.target.innerHTML === 'DEL') {
                element.value = value.substring(0, value.length - 1);
            } else {
                element.value = value + e.target.innerHTML;
            }

            element.dispatchEvent(new Event('input'));
        }
    }
}

function onWifiChange(e) {
    let value = e.target.value;
    let boolValue = false;

    if (value === 'on') {
        value = 'off';
        document.getElementById('wifiData').style.display = 'none';
    } else {
        boolValue = true;
        value = 'on';
        document.getElementById('wifiData').style.display = 'block';
        _loadWifiData();
    }
    e.target.value = value;

    let data = {
        value: boolValue
    };

    _makeRequest(data, 'wifiChange');
}
