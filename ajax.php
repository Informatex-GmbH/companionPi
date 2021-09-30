<?php


$type = $_GET['type'];
$data = json_decode(file_get_contents('php://input'));

$response = new stdClass();

// Type switchen
switch ($type) {
    case 'addIpAddress':

        break;

    case 'wifiChange':

        break;

}


// Response senden
echo json_encode($response);
