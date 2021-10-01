<?php

try {
    $type = $_GET['type'];
    $data = json_decode(file_get_contents('php://input'));

    $response = new stdClass();

    // Type switchen
    switch ($type) {
        case 'addIpAddress':
            $msg = '';
            $errMsg = '';
            $ipAddress = $data->value;
            $fileName = '/home/pi/ip.config';

            if (preg_match('/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/', $ipAddress)) {

                // vereinfachen 000 = 0 usw.
                $ipAddress = implode(".", array_map('intval', explode(".", $ipAddress)));

                // Überprüfen ob IP schon in Datei ist
                if (file_exists($fileName)) {
                    $fileContent = file_get_contents($fileName);
                    $existingIpAddresses = explode("\n", $fileContent);

                    foreach ($existingIpAddresses as $existingIpAddress) {
                        if ($existingIpAddress === $ipAddress) {
                            $errMsg = 'IP-Adresse existiert schon';
                            break;
                        }
                    }
                }

                if (!$errMsg) {

                    exec("sudo ifconfig eth0 add $ipAddress netmask 255.255.255.0", $output, $resultCode);

                    if ($resultCode) {
                        throw new Exception('IP-Adresse konnte nicht hinzugefügt werden');
                    } else {

                        if (file_put_contents($fileName, $ipAddress . "\n", FILE_APPEND)) {
                            $msg = 'IP-Adresse wurde hinzugefügt';
                        } else {
                            $errMsg = 'IP konnte nicht in Datei geschrieben werden';
                        }
                    }
                }
            } else {
                $errMsg = 'Keine gültige IP-Adresse';
            }

            $response->msg = $msg;
            $response->errMsg = $errMsg;
            break;

        case 'getIpAddresses':
            $ipAddresses = exec('hostname --all-ip-addresses', $output, $resultCode);
            $ipAddresses = explode(' ', $ipAddresses);

            $rows = [];

            foreach ($ipAddresses as $ipAddress) {
                if (preg_match('/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/', $ipAddress)) {
                    $rows[] = $ipAddress;
                }
            }

            $response->rows = $rows;

            if ($resultCode) {
                throw new Exception('IP Adressen konnten nicht ausgelesen werden.');
            }
            break;

        case 'removeIpAddress':
            $msg = '';
            $errMsg = '';
            $ipAddress = $data->value;
            $fileName = '/home/pi/ip.config';

            if (preg_match('/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/', $ipAddress)) {

                // Überprüfen ob IP schon in Datei ist
                if (file_exists($fileName)) {

                    $fileContent = file_get_contents($fileName);
                    $existingIpAddresses = explode("\n", $fileContent);
                    $errMsg = 'Dies ist eine System IP-Adresse und kann nicht gelöscht werden';

                    foreach ($existingIpAddresses as $key => $existingIpAddress) {
                        if ($existingIpAddress === $ipAddress) {
                            unset($existingIpAddresses[$key]);
                            $errMsg = '';
                        }
                    }

                    if (!$errMsg) {
                        exec("sudo ifconfig eth0 del $ipAddress", $output, $resultCode);

                        if ($resultCode) {
                            throw new Exception('IP-Adresse konnte nicht entfernt werden');
                        } else {

                            if ($existingIpAddresses) {
                                $fileContent = implode("\n", $existingIpAddresses);

                                if (file_put_contents($fileName, $fileContent) !== false) {
                                    $msg = 'IP-Adresse wurde gelöscht';
                                } else {
                                    $errMsg = 'Datei konnte nicht mehr geschrieben werden';
                                }
                            } else {
                                unlink($fileName);
                            }
                        }
                    }
                }
            } else {
                $errMsg = 'IP-Adresse kann nicht gelöscht werden';
            }

            $response->msg = $msg;
            $response->errMsg = $errMsg;
            break;

        case 'wifiChange':
            $action = 'stop';
            $msg = 'WLAN wurde ausgeschaltet';

            if ($data->value) {
                $action = 'start';
                $msg = 'WLAN wurde eingeschaltet';
            }

            exec("sudo systemctl $action hostapd", $output, $resultCode);

            if ($resultCode) {
                if ($action === 'stop') {
                    $message = 'WLAN konnte nicht gestoppt werden.';
                } else {
                    $message = 'WLAN konnte nicht gestartet werden.';
                }
                throw new Exception($message);
            }

            $response->msg = $msg;
            break;

    }


    // Response senden
    echo json_encode($response);
} catch (\Throwable $e) {
    $response = new stdClass();
    $response->errMsg = $e->getMessage();

    echo json_encode($response);
}
