<?php  #db_access.php

require 'includes/config.inc.php';

$request = $_SERVER['REQUEST_URI'];

try {
	$api = new LocationAPI($request);
	$api->processAPI();  
} catch (Exception $e) {
	//handle exception
}


?>