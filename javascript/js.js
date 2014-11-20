$(document).ready(function(){

//define namespace
var ns = ns || {};

ns = {
	mark : document.getElementById('mark'),
	locate : document.getElementById('locate'),
	confirm_location : document.getElementById('confirm'),
	action_menu_mark : document.getElementById('action_menu_mark'),
	action_menu_locate : document.getElementById('action_menu_locate'),
	action_menu : document.getElementById('action_menu'),
	Animate : function(elem)
	{
		this.elem = elem;
	},
	location : {
		geolocation_available : false,
		get_geolocation : function()
		{
			if(navigator.geolocation) {
				this.geolocation_available = true;
				//ASYNC CALL
				navigator.geolocation.getCurrentPosition(this.map.generate_map, this.geo_error_handler);
			} else {
				throw "This application requires geolocation which your browser does not support.";
			}
		},
		geo_error_handler : function(error)
		{
			switch(error.code) {
				case error.PERMISSION_DENIED:
	            	alert("Geolocation is a requirement for this application.  Please turn it on.");
	            break;
		        case error.POSITION_UNAVAILABLE:
		            alert("Location information is currently unavailable. Please try again later.");
		            break;
		        case error.TIMEOUT:
		            alert("The request to get user location timed out.");
		            break;
		        case error.UNKNOWN_ERROR:
		            alert("An unknown error occurred.  Please try again later.");
		            break;
			}
		},
		find_location : function()
		{
			var good, 
				name = prompt('What is your username?');
			if (name != null) {
				if(ns.length_valid(name, true)) {
					$.ajax({
						type : "GET",
						url : "locate/db_access.php",
						data : { user: name }
					})
					.done(function(data) {
						//if data starts with '[' then username found.  
						if (data.match(/^\[/)) {
							var coords_json = $.parseJSON(data);
							alert(coords_json);
						} else {
							$('#main').children().css('display','none');

							action_menu.style.display = "block";
									
							var text = "Username not found."; 
							document.getElementById('action_menu_message').innerHTML = text;
						}
					});
				}
			}
		},
		map : {
			my_map : '',
			latitude : 0,
			longitude : 0,
			map_options : function(position)
			{
				return {
		          center: { lat: position.coords.latitude, lng: position.coords.longitude},
		          zoom: 18
		        };
			},
			generate_map : function(position)
			{
				var map_holder = document.getElementById('map_holder');
				var map_menu = document.getElementById('map_menu');

				map_holder.style.display = "block";
				map_menu.style.display = "block";
				$(ns.mark).css('display', 'none');
				$('#container, #main').css({
					'height' : '100%'
				});
				
				if(ns.location.geolocation_available) {
					ns.location.map.my_map = new google.maps.Map(map_holder, ns.location.map.map_options(position));

					//create and set marker on map.
					var lat_lng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

					ns.location.map.latitude = lat_lng.k;
					ns.location.map.longitude = lat_lng.B;

					var marker = ns.location.map.create_marker(lat_lng);

					google.maps.event.addListener(marker, 'dragend', function(evt){
					    // alert('Marker dropped: Current Lat: ' + evt.latLng.lat().toFixed(7) + ' Current Lng: ' + evt.latLng.lng().toFixed(7));
					    ns.location.map.latitude = evt.latLng.lat();
						ns.location.map.longitude = evt.latLng.lng();
					});

					marker.setMap(ns.location.map.my_map);

				}
			},
			create_marker : function(lat_long)
			{
				return new google.maps.Marker({
				    position: lat_long,
				    map: this.my_map,
				    title:"Hello World!",
				    draggable: true
				});
			}
		}
	},
	length_valid : function(answer, playback)
	{
		if(answer && answer.length >= 6) {
			return answer;
		} else {
			if(answer && answer.length < 6) {
				alert('The username must be at least 6 characters long.');
			} else alert('You must enter a username to continue');

			//recursive function to show prompt if user continues to enter username too short or empty username
			if (playback == true) {
				var name = prompt('What is your username?');
				//canceling prompt window will return null and escape recursive function
				if (name !== null){
					if (ns.length_valid(name, true)){
						return name;
					}
				}
			}
		}
	},
	events : function()
	{
		ns.mark.addEventListener('click', function(e)
		{
			var locate = new ns.Animate(ns.locate);
			locate.disappear();

			var mark = new ns.Animate(e.target);
			mark.set_transition(1.5);
			mark.explode(98, 100);

			//use jQuery since POJS does not allow binding of multiple events
			$(this).on('transitionend webkitTransitionEnd', function(e){
				//transitionend event fires once for each CSS property that was changed.
				//since we only need one instance of the callback, the hack below will 
				//allow the callback to be fired only once.
				if(e.originalEvent.propertyName == "width") {
					try {
						ns.location.get_geolocation();
					} catch(err) {
						alert(err);
					}
				}
			});
		});

		ns.locate.addEventListener('click', function(e)
		{
			var mark = new ns.Animate(ns.mark);
			mark.disappear();
			
			var locate = new ns.Animate(e.target);
			locate.set_transition(1.5);
			locate.explode(98, 100);

			$(this).on('transitionend webkitTransitionEnd', function(e){
				if(e.originalEvent.propertyName == "width") {
					ns.location.find_location();
				}

			});
		});

		ns.confirm_location.addEventListener('click', function()
		{
			// console.log(ns.location.map.latitude);
			var good,
				answer = prompt('Enter a username at least 6 characters');
			
			if(good = ns.length_valid(answer)) {
				$.ajax({
					type : "GET",	//change to POST
					url : "mark/db_access.php",
					data : { user: answer, lat: ns.location.map.latitude, long: ns.location.map.longitude }
				})
				.done(function(data)
				{
					if (data == 1) {
						$('#main').children().css('display','none');

						action_menu.style.display = "block";
						
						var text = "Location saved successfully.  Retrieve your saved location(s) by clicking "; 
						text += "'Locate' and entering the username: " + answer;
						document.getElementById('action_menu_message').innerHTML = text;						
						// var action_menu_top = document.getElementById('action_menu_top');
						// var children = action_menu_top.childNodes;
						// if (children.length === 4) action_menu_top.removeChild(children[3]);

						// var name = document.createElement('span');
						// name.style.fontWeight = "bold";
						// var text = document.createTextNode(answer + '.');
						// name.appendChild(text);

						// var menu = document.getElementById('action_menu_top');
						// menu.appendChild(name);
					}
				});
			}
		});

		ns.action_menu_mark.addEventListener('click', function(){
			try {
				ns.location.get_geolocation();
				action_menu.style.display = "none";
			} catch(err){
				alert(err);
			}
		});
		ns.action_menu_locate.addEventListener('click', function(){
			ns.location.find_location();
		});
	}//end of events method.
}; //end ns obj.

ns.Animate.prototype = (function(){
	var set_transition = function(time)
	{
		this.elem.style.transition = time + "s";
	};
	var explode = function(w, h)
	{
		this.elem.style.width = w + "%";
		this.elem.style.height = h + "vh";
	};
	var disappear = function()
	{
		this.elem.style.display = "none";
	};
	var fade_out = function()
	{
		$(this.elem).fadeOut(200);
	}
	return {
		set_transition : set_transition,
		explode : explode,
		disappear : disappear,
		fade_out : fade_out
	}
})();

ns.events(); //set event listeners.


});

