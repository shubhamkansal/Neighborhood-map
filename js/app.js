var myMap;
var info;
var markers = [];

var Restaurants= [
    {
        name: 'The Indian Coffee House',
        res_id : 120535 // Zomato res_id
    },
    {
        name: 'Girl In The Cafe',
        res_id : 120344 // Zomato res_id
    },
    {
        name: 'Books N Brew',
        res_id : 120554 // Zomato res_id
    },
    {
        name: 'Midpoint Cafe',
        res_id : 122301 // Zomato res_id
    },
    {
        name: 'Sindhi Sweets',
        res_id : 120280 // Zomato res_id
    },
    {
        name: 'Domino\'s Pizza',
        res_id : 120097 // Zomato res_id
    },


    ];
function initMap(){
    //console.log('jello');
    myMap = new google.maps.Map(document.getElementById('map'),{
        center:{
            lat: 30.7333,
            lng: 76.7794
        },
        zoom: 13
    });
    //opening of info window
    info = new google.maps.InfoWindow({maxwidth: 80});
    fetchRestaurantDetails();
}



function showInfo(marker, info){
    // main_res contains the content of info window
    var main_res = "";
    main_res = "<h2>"+marker.res.name+"</h2><hr>";//title of restaurant
    main_res += "<h3>Cuisines:</h3>"+marker.res.cuisines+"<br>";//cuisines
    main_res += "<h3>Rating:</h3>"+marker.res.user_rating.aggregate_rating+"<br>";//rating
     if( info.marker !== marker && info.marker !== undefined )
    {
        info.marker.setAnimation( null );
    }
    info.marker = marker;
    //make the marker bounce on clicking it
    info.marker.setAnimation( google.maps.Animation.BOUNCE );
    info.setContent(main_res);

    //opening map
    info.open( map , marker );

    info.addListener('closeclick' , function() {
        info.marker.setAnimation( null );
    });

}

function show(){
    //showing all the markers
    for (var i = 0; i < markers.length; i++) {
        markers[i].setVisible(true);
    }
}
function hide(){
    //hiding markers
   for (var i = 0; i < markers.length; i++) {
        markers[i].setVisible(false);
    }
}

function fetchRestaurantDetails() {
    //finding content of each info window using zomato
    for( var i in Restaurants ) {
        zomato( Restaurants[ i ].res_id , j);
    }
    //invoking init function
    ViewModel.init();
}

function zomato(id, j) {
    $.ajax({
        url : 'https://developers.zomato.com/api/v2.1/restaurant',//url for zomato
        headers: {
            'Accept' : 'application/json',
            'user-key' : '53f10e93683d449bf7bc8decae82c681'//api key of zomato
        },
        data: 'res_id='+id,//rest_id is used to find content
        async: true,
    }).done(function(response){
        //console.log(response);
        var currres='';
        currres = response.location;
        //making long and lat combined 
        var latlng = new google.maps.LatLng(parseFloat(currres.latitude),parseFloat(currres.longitude));
        //calculating marker attributes
        var marker = new google.maps.Marker({
            position: latlng,
            title: response.name,
            map: myMap,
            res: response

        });
        //on clicking marker
        marker.addListener('click', function(){
            showInfo(this, info);
        });
        markers.push(marker);

    }).fail(function(response,status, error){
        ViewModel.error("Zomato not working");// zomato erroe
        ViewModel.mapError(true);//nmap error

    });
}

function ErrorMethod() {
    ViewModel.error( 'Unable to load the map' );//error
    ViewModel.mapError( true );//setting mapError to true
}

function showMarker( markerTitle ) {
    for( var i in markers )
    {
        //matching title with the marker title
        if( markers[ i ].title == markerTitle )
        {
            showInfo( markers[ i ] , info );
            return;
        }
    }
}

var ViewModel = {
    
    error : ko.observable(''),
    mapError : ko.observable( false ),
    listall : ko.observableArray([]),//list of all restaurants
    search : ko.observable(''),
    // init function 
    init : function() {
        for( var marker in Restaurants )
        {
           //putting each title in the list
           ViewModel.listall.push( Restaurants[marker].name );
        }
    },

     find : function(text){
        //console.log("yoo");
        ViewModel.listall.removeAll();
        for( var i in markers ) {
            //console.log("hello");
            if( markers[ i ].title.toLowerCase().indexOf( text.toLowerCase() ) >= 0 ) {
                markers[ i ].setVisible(true);
                //console.log("hry");
                 ViewModel.listall.push(markers[ i ].title);
            }
            else {
                //console.log("in else block");
                markers[ i ].setVisible(false);
            }
        }
    }

}
ko.applyBindings(ViewModel);//binding ViewModel to the html file
ViewModel.search.subscribe( ViewModel.find );//calling find function
