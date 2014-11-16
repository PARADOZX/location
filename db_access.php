<?php  #db_access.php

require 'includes/config.inc.php';

$request = $_SERVER['REQUEST_URI'];

//debug
// $request = "locate/34.23432/-23.32398";

try {
	$api = new LocationAPI($request);
	$api->processAPI();
} catch (Exception $e) {
	//handle exception
}


?>