// variable for holding storedata
var alkoJSON;
var distances = [];
var sortedDistances;

// when document is ready, call ajax to fill alkoJSON variable with storedata
// this way we dont have to call ajax every time we want to access storedata.
$(document).ready(function(){
  $.ajax({
    url: "data/alkot.json",
    success: function(data){
      console.log(data);
      alkoJSON = data;
      calculateDistances();
    }
  }).fail(function(){
    console.log("something went wrong when loading alkot.json");
  })
});

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
   
   //push result to array for later use.
   distances.push({distance: rounded, storeName: store.name, storeID: store.storeId});
  });
  
  // sort the data to be distance ascending. (lowest first)
  sortedDistances = distances.sort(function(a, b) {
    return a.distance - b.distance;
  });
  console.log(sortedDistances);
  
  //once distances have been calculated, show them on the page.
  displayNearbyAlkos(10);
}


// function to display nearest alkos.
function displayNearbyAlkos(a){
  
  for (var i = 0; i < a; i++){
    let distance = sortedDistances[i].distance;
    let name = sortedDistances[i].storeName;
    let id = sortedDistances[i].storeID;
    
    $("#distances").append("<p>" + distance + "km " + name + " ID:" + id + "</p>");
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


//create map
  var map;
  function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 62.242603, lng: 25.747257},
          zoom: 14
        });
        var contentString = "";
    // info window will display above content string
    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    
    //add markers
    // THIS AJAX BELOW SHOULD BE REMOVED BECAUSE THE DATA IS ALREADY STORED IN alkoJSON variable
   $.ajax({
     url: 'data/alkot.json'
   }).fail(function(){
     console.log("failed to load alkot.json!");
   }).done(function(data){
     console.log("loaded");
     $.each(data.stores, function(index,store){
       //read latitude and longitude
       var storeLatLng = {lat: store.latitude, lng: store.longitude};
       var storetype = "";
       //create marker
       var marker = new google.maps.Marker({
         position: storeLatLng,
         map: map,
         //all the additional data goes here -> will be shown when marker is focused
         //actual formating of this data "marker.addListener -> infowindow.setContent"
         title: store.name,
         type: store.outletTypeId,
         open1: store.OpenDay0,
         open2: store.OpenDay1,
         address: store.address,
         phone: store.phone,
         link: store.link
        });
        if (store.outletTypeId != "outletType_myymalat"){
          var storetype = "Noutopiste"
        }
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
   }); //ajax done
 }//init map
