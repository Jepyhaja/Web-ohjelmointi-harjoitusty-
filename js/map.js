// variable for holding storedata
var alkoJSON;
var distances = [];
var sortedDistances;
// variable for closest stores
var closest = { stores: []};
// function calculating distances between users location (jyväskylä atm), and the various ALKO-stores
function calculateDistances(){
 $.each(alkoJSON.stores, function(index,store){
   //read latitude and longitude
   let latitude = store.latitude;
   let longtitude = store.longitude;

   // hard-coded user "location" lat: 62.242603, lng: 25.747257
   // use function distance to get the distance
   var rawdistance = distance(latitude, longtitude, 62.242603, 25.747257);

   // round the distance to 2 decimals
   var rounded = rawdistance.toFixed(2);

   // push result to array for later use.
   distances.push({distance: rounded, storeName: store.name, lat: latitude, lng: longtitude, phone:store.phone, type:store.outletTypeId, address: store.address, open:store.OpenDay0, link: store.link});
  });

  // sort the data to be distance ascending. (lowest first)
  sortedDistances = distances.sort(function(a, b) {
    return a.distance - b.distance;
  });
  console.log(sortedDistances);

  // once distances have been calculated, make marker out of them
  displayNearbyAlkos(10);
}

// function to make array of nearest alkos for set amount of markers.
function displayNearbyAlkos(a){

  for (var i = 0; i < a; i++){
    let distance = sortedDistances[i].distance;
    let name = sortedDistances[i].storeName;
    let phone = sortedDistances[i].phone;
    let type = sortedDistances[i].type;
    let address = sortedDistances[i].address;
    let open = sortedDistances[i].open;
    let link = sortedDistances[i].link;
    let storeloc = {lat: sortedDistances[i].lat, lng:sortedDistances[i].lng};
    closest.stores.push({distance:distance, storeName:name, location:storeloc, phone: phone, type:type, address:address, open:open, link:link});
  }
}

// distance between 2 points
// https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 +
          c(lat1 * p) * c(lat2 * p) *
          (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}


// create map
  var map;
  function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 62.242603, lng: 25.747257},
          zoom: 14
        });
    
    infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Olet tässä.');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}
    
    
    
    
        var contentString = "";
    // info window will display above content string
    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    // call ajax here to fill alkoJSON variable with storedata and to run distance calculations
    // this way we dont have to call ajax every time we want to access storedata.
   $.ajax({
     url: 'data/alkot.json',
     success: function(data){
       console.log(data);
       alkoJSON = data;
       calculateDistances();
     }
   }).fail(function(){
     console.log("failed to load alkot.json!");
   }).done(function(data){
     console.log("loaded");
     // read the array of closest markers set to 10 markers atm
     $.each(closest.stores, function(index,store){
       // read latitude and longitude
       var storeloc = store.location;
       var storetype = "";
       if(store.type != "outletType_myymalat"){
         storetype = "noutopiste";
       }
       // create marker
       var marker = new google.maps.Marker({
         position: storeloc,
         map: map,
         // all the additional data goes here -> will be shown when marker is focused
         // actual formating of this data "marker.addListener -> infowindow.setContent"
         title: store.storeName,
         storetype: storetype,
         open1: store.open,
         address: store.address,
         link: store.link,
         phone: store.phone
        });
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
        marker.addListener('click', function() {
                    infowindow.setContent(
                        '<div class="content">'+
                        '<h1 class="heading">'+this.title+' '+storetype+'</h1>'+
                        '<h3 class="opentimes">Aukioloajat: Ma-La '+this.open1+'</h3>'+
                        '<h3 class="info">Katuosoite: '+this.address+'</h3>'+
                        '<a href="'+this.link+'" class="link">Valikoimaan</a>'+
                        '<p class="info">Puh: '+this.phone+'</p>'+
                        '</div>'
                    );
                    // show info window
                    infowindow.open(map, this);
                  });
     }); // jQ each
   }); // ajax done
 }// init map
