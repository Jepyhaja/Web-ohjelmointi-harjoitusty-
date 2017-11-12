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
