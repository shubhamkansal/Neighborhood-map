var myMap;
var info;
var markers = [];

var Restaurants= [
    {
        name: 'The Indian coffee house',
        res_id : 120535 // Zomato res_id
    },
    {
        name: 'The Girl in the cafe',
        res_id : 120344 // Zomato res_id
    },
    {
        name: 'Books and Brew',
        res_id : 120554 // Zomato res_id
    },
    {
        name: 'Mid point Cafe',
        res_id : 122301 // Zomato res_id
    },
    {
        name: 'Sindhi Sweets',
        res_id : 120280 // Zomato res_id
    },
    {
        name: 'Dominos Pizza',
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
    info = new google.maps.InfoWindow({maxwidth: 80});
    fetchRestaurantDetails();
}



function showInfo(marker, info){
    var main_res = "";
    main_res = "<h2>"+marker.res.name+"</h2><hr>";
    main_res += "<h3>Cuisines:</h3>"+marker.res.cuisines+"<br>";
    main_res += "<h3>Rating:</h3>"+marker.res.user_rating.aggregate_rating+"<br>";
     if( info.marker !== marker && info.marker !== undefined )
    {
        info.marker.setAnimation( null );
    }
    info.marker = marker;
    info.marker.setAnimation( google.maps.Animation.BOUNCE );
    info.setContent(main_res);


    info.open( map , marker );

    info.addListener('closeclick' , function() {
        info.marker.setAnimation( null );
    });

}

function show(){
    for (var i = 0; i < markers.length; i++) {
        markers[i].setVisible(true);
    }
}
function hide(){
   for (var i = 0; i < markers.length; i++) {
        markers[i].setVisible(false);
    }
}

function fetchRestaurantDetails() {
    var j = 0;
    for( var i in Restaurants ) {
        zomato( Restaurants[ i ].res_id , j);
        j++;
    }
}

function zomato(id, j) {
    $.ajax({
        url : 'https://developers.zomato.com/api/v2.1/restaurant',
        headers: {
            'Accept' : 'application/json',
            'user-key' : '53f10e93683d449bf7bc8decae82c681'
        },
        data: 'res_id='+id,
        async: true,
    }).done(function(response){
        //console.log(response);
        var currres='';
        currres = response.location;
        var latlng = new google.maps.LatLng(parseFloat(currres.latitude),parseFloat(currres.longitude));
        var marker = new google.maps.Marker({
            position: latlng,
            title: response.name,
            map: myMap,
            res: response

        });
        marker.addListener('click', function(){
            showInfo(this, info);
        });

        ViewModel.init();
        markers.push(marker);

    }).fail(function(response,status, error){
        ViewModel.error("Zomato not working");// zomato erroe
        ViewModel.mapError(true);//nmap error

    });
}

function ErrorMethod() {
    ViewModel.error( 'Unable to load the map' );
    ViewModel.mapError( true );
}

function showMarker( markerTitle ) {
    for( var i in markers )
    {
        if( markers[ i ].title == markerTitle )
        {
            showInfo( markers[ i ] , info );
            return;
        }
    }
}

var ViewModel = {

    mapError : ko.observable( false ),
    listall : ko.observableArray(),
    search : ko.observable(''),

    error : ko.observable(''),

    init : function() {
        for( var marker in markers )
        {

           ViewModel.listall.push( markers[marker].title );

        }
    },

     find : function(text){
        //console.log("yoo");
        ViewModel.listall.removeAll();
        for( var i in markers )
        {
            if( markers[ i ].title.toLowerCase().indexOf( text.toLowerCase() ) >= 0 )
            {

                markers[ i ].setVisible(true);
                //console.log("hry");
                 ViewModel.listall.push(markers[ i ].title);
            }
            else
            {
                markers[ i ].setVisible(false);
            }
        }
    }

}
ko.applyBindings(ViewModel);
ViewModel.search.subscribe( ViewModel.find );
