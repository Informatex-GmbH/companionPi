// --------------------------------------------------------------
// system functions
// --------------------------------------------------------------
const EventEmitter = require('node:events');
const {exec} = require('child_process');

system = class system extends EventEmitter {

    static addIpAddress(ip, netmask) {
        return new Promise((resolve, reject) => {

            // Höchste virtuelle IP herausfinden
            exec('ip addr show eth0 | grep "inet " | grep -oP "(?<=eth0:)[0-9]+" | sort -rn | head -n 1', (error, stdout, stderr) => {

                if (error) {
                    reject(error.message);
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                }

                if (!error && !stderr) {
                    const count = parseInt(stdout) + 1;
                    exec('ifconfig eth0:' + count + ' ' + ip + ' netmask ' + netmask + ' up', (error, stdout, stderr) => {
                        if (error) {
                            reject(error.message);
                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                        }

                        resolve(stdout ? stdout : stderr);
                    });
                }
            });
        });
    }

    static getIpAddresses() {
        return new Promise((resolve, reject) => {
            exec('hostname --all-ip-addresses', (error, stdout, stderr) => {
                if (error) {
                    reject(error.message);
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                }

                let result = [];
                const ipAddresses = stdout.split(' ');
                for (let i = 0; i < ipAddresses.length; i++) {
                    if (ipAddresses[i].match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/)) {
                        result.push(ipAddresses[i]);
                    }
                }

                resolve(result);
            });
        });
    }

    static removeIpAddress(ip) {
        return new Promise((resolve, reject) => {
            exec('ifconfig eth0 del ' + ip, (error, stdout, stderr) => {
                if (error) {
                    reject(error.message);
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                }

                resolve(stdout ? stdout : stderr);
            });
        });
    }

    static setIpAddress(ip, netmask) {
        return new Promise((resolve, reject) => {
            exec('ifconfig eth0 ' + ip + ' netmask ' + netmask, (error, stdout, stderr) => {
                if (error) {
                    reject(error.message);
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                }

                resolve(stdout ? stdout : stderr);
            });
        });
    }
}
