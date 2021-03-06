<!doctype html>
<html lang="en">

<head>
	<meta name="viewport" content="initial-scale=1, maximum-scale=1.0, user-scalable=no">
	<meta charset="utf-8">
	<link rel="stylesheet" href="css/reset.css" type="text/css">
	<link rel="stylesheet" href="css/style.css" type="text/css">
	<script src="javascript/jquery.js"></script>
	<script type="text/javascript" src="javascript/js.js"></script>
	<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA2Y8qrLyotp9pUoczNmkw96lwawiTpTNY"></script>
	<title>Place Your Mark by James Chiang</title>
</head>

<body>
<header class="center">
	<h2 class="text-center">Place Your Mark...</h2>
</header>
<hr />
<div id="container" class="center">
	<section id="main">
    	<div id="mark" class="location_button text-center">MARK</div>
    	<div id="locate" class="location_button text-center">LOCATE</div>
    	<div id="map_holder"></div>
    	<div id="map_menu" class="text-center">
    		<div id="menu_top" class="bottom_menu">
    			<span class="geo_enable">Confirm Location<br/>(you can drag marker to a different location)</span>
    		</div>
    		<div id="menu_bottom" class="bottom_menu"><span class="geo_enable"><button id="confirm">CONFIRM</button></div>
    	</div>
	</section>
</div>
<hr />
<footer id="footer" class="text-center">
FOOTER
</footer>

</body>

</html>