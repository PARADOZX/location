$(document).ready(function(){

var ns = ns || {};

ns = {
	mark : document.getElementById('mark'),
	locate : document.getElementById('locate'),
	confirm_location : document.getElementById('confirm'),
	action_menu_mark : document.getElementById('action_menu_mark'),
	action_menu_locate : document.getElementById('action_menu_locate'),
	action_menu : document.getElementById('action_menu'),
	delete_button : document.getElementById('delete_button'),
	back_to_menu : document.getElementById('back_to_menu'),
	delete_all : document.getElementById('delete_all'),
	Animate : function(elem)
	{
		this.elem = elem;
	},
	location : {
		geolocation_available : false,
		get_location : false,
		location_iterator : 0,
		coordinates : [],
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
			$( "#scroll_previous, #scroll_next" ).off();	

			var good, 
				name = prompt('What is your username?');

				//cache username for delete all functionality
				ns.location.username = name;  

			if (name != null) {
				if(ns.length_valid(name, true)) {

					$('#mym').addClass('spins');

					setTimeout(function(){

						mym.src = "img/loading.png";

						$.ajax({
							type : "GET",
							url : "db_access.php",
							data : { user: name }
						})
						.done(function(data) {
							
							$('#mym').css('display', 'none');

							//if data starts with '[' then username found. 
							if (data.match(/^\[/)) {
								var coords_json = $.parseJSON(data);
								ns.location.coordinates = coords_json;  //cache for delete functionality

								ns.location.get_location = true;
								ns.location.map.generate_map(coords_json);
							} else {
								var text = data; 
								ns.show_action_menu(text);
							}
						});

					}, 250)
				}
			}
		},
		delete_location : function()
		{
			if(confirm('Really delete?')) {
				$.ajax({
					type : "DELETE",
					url : "db_access.php",
					data : { locationID : ns.location.location_iterator }
				})
				.done(function(data){
					if (data == "Delete successful.") {
						// REFRESHES LOCATE MAP WITH STRANGE BUGS THAT I CANNOT FIGURE OUT  //debug
							//1) cannot find 'lat' of undefined, however map still works which uses 'lat' property
							//2) when scrolling through array it calls multiple elemnts simultaneously
						// for (x in ns.location.coordinates){
						// 	if (ns.location.coordinates[x]['locationID'] === ns.location.location_iterator) {
						// 		ns.location.coordinates.splice(x, 1);
						// 	}
						// }

						// if (ns.location.coordinates.length === 0){
						// 	var text = "No saved location for this username";
						// 	ns.show_action_menu(text);
						// } else {
						// 	ns.location.get_location = true;
						// 	ns.location.map.generate_map(ns.location.coordinates);
						// }
						var text = "deleted";
						ns.show_action_menu(text);	
					}
				});
			} 
		},
		delete_all : function()
		{
			if(confirm('Really delete?')) {
				$.ajax({
					type : "DELETE",
					url : "db_access.php",
					data : { delete_all: ns.location.username }
				})
				.done(function(data){
					if(data == true) {
						ns.show_action_menu('Delete all successful');
					}
				});
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
				//clear action menu of any previous messages.
				ns.action_menu.style.display = "none";

				var map_holder = document.getElementById('map_holder');
				var map_menu = document.getElementById('map_menu');
				var map_menu_confirm = document.getElementById('map_menu_confirm');
				var map_menu_found = document.getElementById('map_menu_found');

				map_holder.style.display = "block";
				map_menu.style.display = "block";

				if(ns.location.geolocation_available) {
					$(ns.mark).css('display', 'none');
					map_menu_confirm.style.display = "block";
					map_menu_found.style.display = "none";

					ns.location.map.my_map = new google.maps.Map(map_holder, ns.location.map.map_options(position));

					//create and set marker on map.
					var lat_lng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

					ns.location.map.latitude = lat_lng.k;
					ns.location.map.longitude = lat_lng.D;

					var marker = ns.location.map.create_marker(lat_lng, true);

					google.maps.event.addListener(marker, 'dragend', function(evt){
					    // alert('Marker dropped: Current Lat: ' + evt.latLng.lat().toFixed(7) + ' Current Lng: ' + evt.latLng.lng().toFixed(7));
					    ns.location.map.latitude = evt.latLng.lat();
						ns.location.map.longitude = evt.latLng.lng();
					});

					marker.setMap(ns.location.map.my_map);

					$('#mym').css('display', 'none');

					ns.location.geolocation_available = false;
				}

				if(ns.location.get_location) {
					$(ns.locate).css('display', 'none');
					map_menu_found.style.display = "block";
					map_menu_confirm.style.display = "none";

					ns.location.get_location = false;
					
					if (typeof position === 'object') {

						var num = 0,
							length = position.length,
							scroll_previous = document.getElementById('scroll_previous'),
							scroll_next = document.getElementById('scroll_next');

						var found_map = function(x){

							var lat = parseFloat(position[x]['lat']),
								lng = parseFloat(position[x]['lon']),
								text = document.getElementById('found_text');

							//hide scroll buttons if only one location found for username
							if (length <= 1) {
								scroll_previous.style.visibility = "hidden";
								scroll_next.style.visibility = "hidden";
							} else {
								scroll_previous.style.visibility = "hidden";
								scroll_next.style.visibility = "visible";
							}

							//assign iterator value for delete functionality
							ns.location.location_iterator = position[x]['locationID'];

							ns.location.map.my_map = new google.maps.Map(map_holder, { center : { lat: lat, lng: lng }, zoom: 18 });
							var lat_lng = new google.maps.LatLng(lat, lng);
							var marker = ns.location.map.create_marker(lat_lng, false);
							marker.setMap(ns.location.map.my_map);

							$('#mym').css('display', 'none');

							text.innerHTML = "Marked on: " + position[x]['created'];
						};

						var previous = function()
						{
							num = ns.util.iterator.previous(num);
							found_map(num);

							scroll_previous.style.visibility = (num === 0) ? "hidden" : "visible";
							scroll_next.style.visibility = (num >= length-1) ? "hidden" : "visible";
						}

						var next = function()
						{
							num = ns.util.iterator.next(num);
							found_map(num);

							scroll_previous.style.visibility = (num === 0) ? "hidden" : "visible";
							scroll_next.style.visibility = (num >= length-1) ? "hidden" : "visible";
						}
						
						$("#scroll_previous").on('click', previous);
						$("#scroll_next").on('click', next);

						found_map(num);

					} else {
						ns.show_action_menu('Error parsing location data.');
					}	
				}
			},
			create_marker : function(lat_long, draggable)
			{
				return new google.maps.Marker({
				    position: lat_long,
				    map: this.my_map,
				    title:"Hello World!",
				    draggable: draggable
				});
			}
		}
	},
	show_action_menu : function(text)
	{
		$('#main').children().css('display','none');
		action_menu.style.display = "block";
		document.getElementById('action_menu_message').innerHTML = text;
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

			//deprecated v1.0
			// var mark = new ns.Animate(e.target);
			// mark.set_transition(1.5);
			// mark.explode(98, 75);  

			$('#mym').addClass('spins');

			setTimeout(function(){

				mym.src = "img/loading.png";

				try {
					ns.location.get_geolocation();
				} catch(err) {
					alert(err);
				}

			}, 250)

			//deprecated v1.0
			//use jQuery since POJS does not allow binding of multiple events
			// $(this).on('transitionend webkitTransitionEnd', function(e){
			// 	//transitionend event fires once for each CSS property that was changed.
			// 	//since we only need one instance of the callback, the hack below will 
			// 	//allow the callback to be fired only once.
			// 	if(e.originalEvent.propertyName == "width") {
			// 		try {
			// 			ns.location.get_geolocation();
			// 		} catch(err) {
			// 			alert(err);
			// 		}
			// 	}
			// });
		});

		ns.locate.addEventListener('click', function(e)
		{
			var mark = new ns.Animate(ns.mark);
			mark.disappear();
			
			//deprecated v1.0
			// var locate = new ns.Animate(e.target);
			// locate.set_transition(1.5);
			// locate.explode(98, 75);

			try {
				ns.location.find_location();
			} catch(err) {
				alert(err);
			}

			//deprecated v1.0
			// $(this).on('transitionend webkitTransitionEnd', function(e){
			// 	if(e.originalEvent.propertyName == "width") {
			// 		ns.location.find_location();
			// 	}

			// });
		});

		//event handling of action_menu's confirm button
		ns.confirm_location.addEventListener('click', function()
		{
			var good,
				answer = prompt('Enter a username at least 6 characters');
			
			if(good = ns.length_valid(answer)) {
				$.ajax({
					type : "POST",	
					url : "db_access.php",
					data : { user: answer, lat: ns.location.map.latitude, long: ns.location.map.longitude }
				})
				.done(function(data)
				{
					if (data == 1) {
						var text = "Location saved successfully.  Retrieve your saved location(s) by clicking "; 
						text += "'Locate' and entering the username: " + answer;
						ns.show_action_menu(text);						
					}
				});
			}
		}); 

		ns.action_menu_mark.addEventListener('click', function(){
			try {
				ns.location.get_geolocation();
			} catch(err){
				alert(err);
			}
		});
		ns.action_menu_locate.addEventListener('click', function(){
			ns.location.find_location();
		});

		ns.delete_button.addEventListener('click', function(){
			ns.location.delete_location();
		});

		ns.back_to_menu.addEventListener('click', function(){
			ns.show_action_menu('Please choose an option.');
		});

		ns.delete_all.addEventListener('click', function(){
			ns.location.delete_all();
		});
	},
	util : {
		iterator: {
			previous : function(x)
			{
				return x-1;
			},
			next : function(x)
			{
				return x+1;
			}
		}
	}
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

