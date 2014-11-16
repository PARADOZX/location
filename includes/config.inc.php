<?php  #config.inc.php 

$live = true;

function class_loader($class){
	require('class/' . $class.'.php');
}

spl_autoload_register('class_loader');

//Create the error handler
function my_error_handler($e_number, $e_message, $e_file, $e_line, $e_vars){
	
	//Build the error msg
	$message = "An error occurred in script 'e_file' on line $e_line: $e_message";
	
	//Append $e_vars to the $message
	//$message .= print_r($e_vars, 1);
	
	//show the error
	echo '<div class="error">' . $message . '</div>';
	//debug_print_backtrace();
	
}  //End of my_error handler def

if ($live == false){
//set error handler function
	set_error_handler('my_error_handler');
}

// Database
define ( 'DB_HOST', 'localhost' );
define ( 'DB_USER', 'root' );
define ( 'DB_PASSWORD', 'Shiet1sv' );
define ( 'DB_DB', 'location' );


