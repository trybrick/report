$( document ).ready(function() {
	//kickoff map logic
    initialize();

    //map navigation
    map.on('click', function(e){
    	addMarker(e);
        $('#housephoto, #senatephoto, #ushousephoto, #ussenatephoto, #ussenatephoto2').attr('src',"data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=").attr('width',0).attr('height',0);;
		identifyDistrict(e);
		$('#geocodeFeedback').hide();
		$("#geocodeAddress").val('');
		slideSidebar();
		dataLayer.push({'event': 'mapclick'});
	});     

    // on small screens
	$('#toggleSidebar').click(function(e){
		e.preventDefault();
		slideSidebar();
	});
    
    // on small screens
	$('#pull-out').click(function(e){
		slideSidebar();
	});

	// on small screens
	$('#pull-in').click(function(e){
		slideSidebar();
	});

    // on small screens allow geolocation
    $('#gpsButton').click(function(e){
    	e.preventDefault();
    	zoomToGPSLocation();
    	dataLayer.push({'event': 'gps'});
    });

    // enter key event
    $("#geocodeAddress").bind("keypress", {}, keypressInBox);
    
    // both key and enter fire geoCodeAddress
    $('#searchButton').click(function(e){
    	e.preventDefault();
    	dataLayer.push({'event': 'searchButton'});
    	geoCodeAddress(geocoder, map);
    })
	
	// hide links - format is off until results come back
    $('.memberLink').hide();
/*
    $( ".mnhouse, .mnsenate, .ushouse, .ussenate1, .ussenate2" ).click(function(e) {
        var link = '';
        dataLayer.push({'event': 'memberclick'});
        link = $(this).attr('data-webid');
    	//console.log($(this).data('webid'))
    	window.open(link)
    });
*/
	// Members UI click turn red with 'active' class
	$( ".memberLink" ).click(function(e) {
		e.stopPropagation();
		dataLayer.push({'event': 'zoomToDistrict'});
		var mom = $(this).parent();
		var grandma = mom.parent();
		var child = $(this).children();
		//console.log(mom);
		//console.log(grandma);
		//console.log(child);
        grandma.addClass('active').siblings().removeClass('active');
        //get static minnesota geojson (faster than php)
		if (child.is('#ussenatelink') || child.is('#ussenate2link')){
			//console.log(child);
		  	if(typeof MinnesotaBoundaryLayer === 'undefined'){
					$.getJSON("./data/Minnesota2015.json", function(data) {
						var myStyle = {
		    				"color": "#991a36",
		    				"weight": 2,
		    				"opacity": 0.65
						};
						MinnesotaBoundaryLayer = L.geoJson(data, {style:myStyle});
		  			}).done(function(){
		  				
		  				showSenateDistrict();
		  			});
		  		} else {
		  			showSenateDistrict();
		  		}	
		} else {
	        showDistrict(grandma.attr('class'));
	    }
	    
	});

	//Open layers tab
	$('#triangle-topright').click(function(){
  		$(this).animate({right:'-100px'},250, function(){
    		$('#map_layers').animate({right:0},250);
    		dataLayer.push({'event': 'openLayers'});
  		});  
	});

    //Close layers tab
	$('#map_layers_toggle').click(function(){
  		$('#map_layers').animate({right:'-225px'},250, function(){
    		$('#triangle-topright').animate({right:0},250);
  		});  
	});
	
	//Toggle basemap
	$('#satellitonoffswitch').click(function(){
		if (map.hasLayer(vectorBasemap)){
			map.removeLayer(vectorBasemap);
			map.addLayer(streetsBasemap);
		} else {
			map.removeLayer(streetsBasemap);
			map.addLayer(vectorBasemap);
		}
	});

    //fetch overlay layers
	$('#countyonoffswitch, #cononoffswitch, #ssonoffswitch, #shonoffswitch, #cityonoffswitch').click(function(){
		//console.log(typeof($(this).attr('id')));
		var elementName = $(this).attr('id')
        getOverlayLayers($(this), $(this).attr('id'));
        dataLayer.push({'event': 'layerToggle_'+ elementName});
	});

	//map reset
	$('#map_reset').click(function(){
		map.setView(L.latLng(46.1706, -93.6678),6);
		$('#mask').show();
		$('#geocodeFeedback').hide();
		$("#geocodeAddress").val('');
		$(".mnhouse, .mnsenate, .ushouse, .ussenate1, .ussenate2" ).removeClass('active');
		$('.memberLink').hide();
		$('#housemember, #senatemember, #ushousemember, #ussenatemember, #ussenatemember2').html('');
		$('#housedistrict, #senatedistrict, #ushousedistrict, #ussenatedistrict, #ussenatedistrict2').html('');
		$('#housephoto, #senatephoto, #ushousephoto, #ussenatephoto, #ussenatephoto2').attr('src',"data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=").attr('width',0).attr('height',0);;
        
		//Toggle basemap when you reset 
		if($('#satellitonoffswitch').is(':checked')){
				//:checked = true -> leave it ... when I copied the switches I had initial states backwards
		} else {
			//:checked = false -> toggle map
			toggleBaseLayers($('#satellitonoffswitch'),streetsBasemap,vectorBasemap);
			//$('#satellitonoffswitch').prop('checked', true);
		}
		//toggle all layer switches
		toggleLayerSwitches();
		//Remove all layers except the basemap -- down here because its an asychronous thead apparently
		map.eachLayer(function(layer){
			//Remove map layers except mapbox
			if (typeof layer._url === "undefined" || typeof layer.defaultWmsParams !== "undefined"){
				map.removeLayer(layer);				
			};	
		});	   
	});

	//----- OPEN Modal
    $('[data-popup-open]').on('click', function(e)  {
        var targeted_popup_class = $(this).attr('data-popup-open');
        $('[data-popup="' + targeted_popup_class + '"]').fadeIn(350); 
        e.preventDefault();
    });
 
    //----- CLOSE Modal
    $('[data-popup-close]').on('click', function(e)  {
        var targeted_popup_class = $(this).attr('data-popup-close');
        $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350); 
        e.preventDefault();
    });

    //attach a hover method to layers ribbon
    $('#triangle-topright').on('mouseenter', function(){
    	$('.fa-map').css('color', '#8d8d8d'); 
    }).on('mouseleave', function(){
    	$('.fa-map').css('color', '#e6e6e6');
    });    

	$('.loader').hide();

	console.log("Welcome to the 'Who Represents Me?' legislative district finder application, developed by the MN State Legislative Coordinating Commission. The application's responsive web design(RWD), open-source code can be found at 'https://github.com/Ccantey/LCC-DistrictFinder'.")

});//end ready()

