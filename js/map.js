

// variable for holding storedata
var alkoJSON;
var distances = [];
var sortedDistances;
// variable for closest stores
var closest = { stores: []};
var currentPos = [];
var gotLocation = false;
var directionsService;
var directionsDisplay;
// create map
  var map;
  function initMap() {
        // connect direction service
        directionsService = new google.maps.DirectionsService();
        // connect directions renderer
        directionsDisplay = new google.maps.DirectionsRenderer();
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 62.242603, lng: 25.747257},
          zoom: 12
        });
        directionsDisplay.setMap(map);
        infoWindow = new google.maps.InfoWindow;

    // call ajax here to fill alkoJSON variable with storedata and to run distance calculations
    // this way we dont have to call ajax every time we want to access storedata.
   $.ajax({
     url: 'data/alkot.json',
     success: function(data){
       alkoJSON = data;
       console.log("initmap() currentPos[0] = " + currentPos[0]);
       //consists of 3 major parts!
         getLocation();
       //calculateAndDisplayRoute(directionsService, directionsDisplay);
       console.log("initmap()  currentPos =  " + currentPos);
     }
   }).fail(function(){
     console.log("initmap() " + "failed to load alkot.json!");
   }).done(function(data){
     console.log("initmap() " + "loaded");
   });
 }

/*
// init map
function initMap() {
    // connect direction service
    var directionsService = new google.maps.DirectionsService();
    // connect directions renderer
    var directionsDisplay = new google.maps.DirectionsRenderer();
    // create a map
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 62.2426034, lng: 25.7472567},
        zoom: 4
    });
    // create info window
    infowindow = new google.maps.InfoWindow();
    // use map in directions display
    directionsDisplay.setMap(map);
    // show button event handling
    //calculateAndDisplayRoute(directionsService, directionsDisplay, map);
}
*/
// function calculating distances between users location (jyväskylä atm), and the various ALKO-store
// part 3 runs in displayNearbyAlkos!
function calculateDistances(){
 $.each(alkoJSON.stores, function(index,store){
   //read latitude and longitude
   let latitude = store.latitude;
   let longtitude = store.longitude;

   // hard-coded user "location" lat: 62.242603, lng: 25.747257
   // use function distance to get the distance
   var rawdistance = distance(latitude, longtitude, currentPos[0].lat, currentPos[0].lng);

   // round the distance to 2 decimals
   var rounded = rawdistance.toFixed(2);

   // push result to array for later use.
   distances.push({distance: rounded, storeName: store.name, lat: latitude, lng: longtitude, phone:store.phone, type:store.outletTypeId, address: store.address, open:store.OpenDay0, link: store.link});
  });

  // sort the data to be distance ascending. (lowest first)
  sortedDistances = distances.sort(function(a, b) {
    return a.distance - b.distance;
  });
  console.log("calculateDistances() sortedDistances = ");
  console.log(sortedDistances);

  // once distances have been calculated, make markers out of them
  displayNearbyAlkos(10);
}


// calc and display route
function calculateAndDisplayRoute(directionsService, directionsDisplay, map) {
    var selectedMode = "WALKING";
    // get route
    directionsService.route({
        origin: currentPos[0].lat + "," + currentPos[0].lng,
        destination: closest.stores[0].location.lat + "," + closest.stores[0].location.lng,
        travelMode: google.maps.TravelMode[selectedMode]
    }, function(response, status) {
        console.log("calculateAndDisplayRoute() " + response); // MUISTA tutustua datarakenteeseen Console-ikkunan kautta!!
        if (status === 'OK') {
            // display route
            directionsDisplay.setDirections(response);
        } else {
            console.log('Directions request failed due to ' + status);
        }
    });
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
  console.log("closest stores :");
  console.log(closest.stores);
//now we have array of the 10 closest alkos
//now we call drawMarkers to draw the actual markers
//display nearby alkos must run first!!!
  drawMarkers();
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


//Part 3
//just draw the fucking markers will ya!?
function drawMarkers(){
  var contentString = "";
  // info window will display above content string
  var infowindow = new google.maps.InfoWindow({
      content: contentString
  });
// read the array of closest markers set to 10 markers atm
$.each(closest.stores, function(index,store){
  // read latitude and longitude
  var storeloc = store.location;
  var storetype = "";
  if(store.type != "outletType_myymalat"){
    storetype = "noutopiste";
  }

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
   marker.setIcon('../images/markeri.svg');
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
});
console.log("markers drawn.");
calculateAndDisplayRoute(directionsService, directionsDisplay, map);
};
//Part 1
// HTML5 geolocation. Must run before any other functions that need user position!!!!
function getLocation(){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      currentPos.push({lat: pos.lat,lng:pos.lng});
      console.log("getLocation() currentPos = ");
      console.log(currentPos);

      infoWindow.setPosition(pos);
      infoWindow.setContent('Olet tässä.');
      infoWindow.open(map);
      map.setCenter(pos);
      //Notice me senBOI
      //Run calculateDistances after getLocation() is ready
      //Call it right here you mofo.
      calculateDistances();
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
};
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}
