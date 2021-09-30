const url = 'http://localhost/companionPi/ajax.php';

document.addEventListener('DOMContentLoaded', function () {

    // Listeners setzen
    document.getElementById('wifi').onchange = onWifiChange;
    document.getElementById('addIpAddress').oninput = onAddIpAddressChange;
    document.getElementById('addIpAddressBtn').onclick = onAddIpAdresseBtnClick;
    document.getElementById('keyboard').onclick = onKeyboardClick;

});

document.addEventListener('click', function (e) {
    if (e.target.nodeName === 'INPUT') {
        selectedInputField = e.target;
        selectedInputField.dispatchEvent(new Event('input'));
    }
})


function onAddIpAddressChange(e) {
    let element = e.target;
    let value = e.target.value.replace(/\D/g,'');
    let numbers = value.split('');
    let newValue = '';
    let i = 0;
    let d = 0;

    numbers.forEach(function (char, index) {

        if (index >= 12) {
            return;
        }

        if (index && index % 3 === 0) {
            newValue += '.';
        }

        newValue += char;
    });

    element.value = newValue;
}

function onAddIpAdresseBtnClick() {
    let ip = document.getElementById('addIpAddress').value;

    let data = {
        value: ip
    };

    _makeRequest(data, 'addIpAddress');
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
    } else {
        value = 'on';
        boolValue = true;
    }
    e.target.value = value;

    let data = {
        value: boolValue
    };

    _makeRequest(data, 'wifiChange');
}


// PROTECTED

// Führt einen XHR-Request aus
function _makeRequest(data, type, params = '') {
    data = JSON.stringify(data);

    if (params) {
        params = '&' + params;
    }

    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
            resolve(JSON.parse(xhr.response));
        });

        xhr.addEventListener('error', () => {
            const json = JSON.parse(xhr.response);
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
