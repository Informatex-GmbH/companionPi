<?php

try {
    $type = $_GET['type'];
    $data = json_decode(file_get_contents('php://input'));

    $response = new stdClass();

    // Type switchen
    switch ($type) {
        case 'addIpAddress':

            $msg = 'Wurde noch nicht geprögt :)';

            $response->msg = $msg;
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
