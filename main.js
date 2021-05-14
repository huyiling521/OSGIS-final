//Variables

var neighborhood;
var crimeData;
var featureGroup;
var currentSelectNeighbor;
var parsedCrimeData
var requestCrimeData
var parsedPoliceDistData
var censusTractDataFeatures
var crimeMarkers
var locationCensus
var tractLocList
var crimeLoc
var filteredMarkers
var markersTab = "clear"
var info = L.control();

var res

//Data loading

var phillyTract = "https://raw.githubusercontent.com/OpheliaLYJ/MUSA_practicum_scooter/master/data/PH_trimmed.GeoJSON";
var phillyNeighborhood = "https://raw.githubusercontent.com/huyiling521/OSGIS-final/main/data/Neighborhoods_Philadelphia.geojson"
var phillyCrimePart1 = "https://raw.githubusercontent.com/huyiling521/OSGIS-final/main/data/3%20month%20crime%20trimed-part1.json"
var phillyCrimePart2 = "https://raw.githubusercontent.com/huyiling521/OSGIS-final/main/data/3%20month%20crime%20trimed-part2.json"
var phillyCrimePart3 = "https://raw.githubusercontent.com/huyiling521/OSGIS-final/main/data/3%20month%20crime%20trimed-part3.json"
var phillyPoliceDist = "https://raw.githubusercontent.com/huyiling521/OSGIS-final/main/data/Boundaries_District.geojson"
var requestURL = "https://phl.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20incidents_part1_part2%20WHERE%20dispatch_date_time%20%3E=%20current_date%20-%207"
var crimeName = ["Criminal Homiside", "Forcible Rape", "Robbery", "Aggravated Assault", "Burglary", "Larceny-Theft", "Motor Vehicle Theft", "Arson", "All Other Offenses"]
var ucr_generalList = [100,200,300,400,500,600,700,900,0]
var category = _.object(ucr_generalList, crimeName)
var toSearch = _.object(crimeName, ucr_generalList)

/*$.ajax(phillyTract).done(function(res){

    parsedCensusTractData = JSON.parse(res);
    featureGroup = L.geoJSON(parsedCensusTractData, {onEachFeature: 
        onEachFeatureFunc}).addTo(map)
})*/

$.ajax(phillyPoliceDist ).done(function(res){

    parsedPoliceDistData = JSON.parse(res);
    featureGroup = L.geoJSON(parsedPoliceDistData, {
        style:{
            fillColor: "#bdbdbd",
            opacity: 0.3,
            color: '#969696',
            dashArray: '3',
            fillOpacity: 0.2
        },
        onEachFeature: onEachFeatureFunc}).addTo(map)
})

$.ajax(requestURL).done(function(res){
    requestCrimeData = res["rows"];
    crimeType = _.groupBy(requestCrimeData, "ucr_general")
    crimeDist = _.groupBy(requestCrimeData, "dc_dist")
    crimeBlock = _.groupBy(requestCrimeData, "location_block")
    crimeBlockSort = _.pairs(crimeBlock)

    crimeMarkers =_.map(requestCrimeData,function(crime) {
        if ((crime.ucr_general == 800) || (crime.ucr_general > 900)){
            var customIcon = L.divIcon({className: "otherCrime"});
            var markerOptions = { icon: customIcon }
        } else {
            var customIcon = L.divIcon({className: category[crime.ucr_general].replaceAll(" ", "")});
            var markerOptions = { icon: customIcon }
        } // An options object
            // Actually make the marker object a part of our data for later use.
        if (crime.point_x){
            crime.marker = L.marker([crime.point_y, crime.point_x], markerOptions)
            .bindPopup(crime.text_general_code + " at " + crime.location_block)}
        return crime.marker})


    _.sortBy(crimeBlockSort, function(block){
        return (_.size(block[1]))
    })

    crimeBlockMost = _.first()
 

    _.each(crimeDist,function(dist){
        countObj = _.groupBy(dist, "ucr_general")
        _.extend(dist, {countNum: countObj})
    })

    crimeDistNum = _.countBy(requestCrimeData, "dc_dist")

})

$('#doFilter').click(function() {
    // Here, we're using jQuery's `map` function; it works very much like underscore's
    // We want true if checked, false if not
    var checkboxValues = $('input[type=checkbox]').map(function(_, element) {
          return $(element).prop('checked');
    }).get();
    var zippedCrimeTypes = _.zip(checkboxValues, crimeName);
        crimeFilters = _.chain(zippedCrimeTypes)
        .filter(function(zip) { return zip[0]; })
        .map(function(zip) { return zip[1]; })
        .value();
        console.log(crimeFilters)
        getUcr = _.map(crimeFilters, function(type){
            return toSearch[type]
        })
        console.log(getUcr)

  
   filtered = _.filter(requestCrimeData, function(data){
       if (_.contains(getUcr, 0)){
           return (_.contains(getUcr,Number(data.ucr_general)) || data.ucr_general == 800 || data.ucr_general >900)
       } else
        return _.contains(getUcr,Number(data.ucr_general))
   })

   resetMap()
   filteredMarkers = _.map(filtered,function(crime) {
    if ((crime.ucr_general == 800) || (crime.ucr_general > 900)){
        var customIcon = L.divIcon({className: "otherCrime"});
        var markerOptions = { icon: customIcon }
    } else {
        var customIcon = L.divIcon({className: category[crime.ucr_general].replaceAll(" ", "")});
        var markerOptions = { icon: customIcon }
    } // An options object
        // Actually make the marker object a part of our data for later use.
    if (crime.point_x){
        crime.marker = L.marker([crime.point_y, crime.point_x], markerOptions)
        .bindPopup(crime.text_general_code + " at " + crime.location_block).addTo(map);
    }
    markersTab = "filter"
    return crime.marker
})
    console.log(markersTab)
})

function showCrimes(){
 /* crimeMarkers =_.map(requestCrimeData,function(crime) {
        if ((crime.ucr_general == 800) || (crime.ucr_general > 900)){
            var customIcon = L.divIcon({className: "otherCrime"});
            var markerOptions = { icon: customIcon }
        } else {
            var customIcon = L.divIcon({className: category[crime.ucr_general].replaceAll(" ", "")});
            var markerOptions = { icon: customIcon }
        } // An options object
            // Actually make the marker object a part of our data for later use.
        if (crime.point_x){
            crime.marker = L.marker([crime.point_y, crime.point_x], markerOptions)
            .bindPopup(crime.text_general_code + " at " + crime.location_block).addTo(map);
        }
        return crime.marker
        })*/
        if (markersTab == "clear"){
            crimeMarkers.forEach(function(marker){
                if (marker){
                    marker.addTo(map)}
                markersTab = "all"
            })
        }else{
            resetMap()
            crimeMarkers.forEach(function(marker){
                if (marker){
                    marker.addTo(map)}
                markersTab = "all"
        })    
    }   console.log(markersTab)
}     


function resetMap(){
    if (markersTab == "all"){
        crimeMarkers.forEach(function(marker){
            if (marker){
            map.removeLayer(marker)}
    }) 
        markersTab = "clear"
    } else if
        (markersTab == "filter"){
            filteredMarkers.forEach(function(marker){
                if (marker){
                    map.removeLayer(marker)
                }
            }) 
            markersTab = "clear"
    }
    resetCityPage()
    console.log(markersTab)
}


var year = $('#getyear').text()
var month = $('#getmonth').text()  

function constructURL(year,month){
    
}

$('#show-crimes').click(function(){
    
    showCrimes()
})

$("#resetmap").click(function(){
    resetMap()
})

$("#all").click(function(){
    resetMap()
    showCrimes()
   
})

$("#clear").click(function(){
    console.log("1")
    resetMap()
})

$("#Help").click(function(){
    $('#myModalHome').modal('show');
})

var myModal = document.getElementById('myModalHome')
var myInput = document.getElementById('myInput')

myModalHome.addEventListener('shown.bs.modal', function () {
  myInput.focus()
})
/*$('doFilter').click(function(){
    obj = document.getElementsByName("select")
    console.log(obj)
})

//$.ajax(phillyCrime).done(function (res){
    //parsedCrimeData = JSON.parse(res)*/

/*$.when($.ajax(phillyCrimePart1), $.ajax(phillyCrimePart2), $.ajax(phillyCrimePart3))
    .then(function(res1, res2, res3){
        //parsedRes1 = JSON.parse(res1[0])
        //parsedRes2 = JSON.parse(res2[0])
        parsedRes3 = JSON.parse(res3[0])
        //parsedCrimeData = parsedRes1.concat(parsedRes2, parsedRes3)
        crimeMarkers =_.map(parsedRes3,function(crime) {
            var customIcon = L.divIcon({className: category[crime.ucr_general].replaceAll(" ", "")});
            var markerOptions = { icon: customIcon };  // An options object
            // Actually make the marker object a part of our data for later use.
            if (crime.lat){
                crime.marker = L.marker([crime.lat, crime.lng], markerOptions)
                .bindPopup(crime.text_general_code + " Happened " + crime.location_block).addTo(map);
            }return crime.marker
        })     
})
/*
$.ajax(phillyCrimePart3).done(function (res){
    parsedCrimeData = JSON.parse(res)
    crimeMarkerData = _.filter(parsedCrimeData, function(crime){
        return ((crime.dispatch_date_time.includes("2021/5")) 
                || (crime.dispatch_date_time.includes("2021/4/2")))
    }) 
    crimeMarkers = _.map(crimeMarkerData, function(crime){
        if (crime.lat){
            var customIcon = L.divIcon({className: category[crime.ucr_general].replaceAll(" ", "")});
            var markerOptions = { icon: customIcon };
            marker = L.marker([crime.lat, crime.lng], markerOptions).addTo(map)}
        return marker
    })
})

$.when($.ajax(phillyCrimePart1), $.ajax(phillyCrimePart2), $.ajax(phillyCrimePart3))
    .then(function(res1, res2, res3){
        parsedRes1 = JSON.parse(res1[0])
        parsedRes2 = JSON.parse(res2[0])
        parsedRes3 = JSON.parse(res3[0])
        parsedCrimeData = parsedRes1.concat(parsedRes2, parsedRes3)
        crimeMarkerData = _.filter(parsedCrimeData, function(crime){
            return crime.dispatch_date_time.includes("2021/5")
                   // || (crime.dispatch_date_time.includes("2021/4/2")))
        }) 
        crimeMarkers = _.map(crimeMarkerData, function(crime){
            if (crime.lat){
                var customIcon = L.divIcon({className: category[crime.ucr_general].replaceAll(" ", "")});
                var markerOptions = { icon: customIcon };
                marker = L.marker([crime.lat, crime.lng], markerOptions)}
            return marker
        })

        _.map(parsedCrimeData, function(crime){
            if (crime.lat){
             var point = turf.points([[crime.lat, crime.lng]])
            }
            locationCensus = _.filter(censusTractDataFeatures, function(tract){
                tractLoc = tract.geometry.coordinates[0][0]
                tractLocList = _.map(tractLoc, function(item){
                    return item.reverse()
                })
                console.log(tractLocList)
                area = turf.polygon(tractLocList)
                return turf.pointsWithinPolygon(point, area)
            })
            locationCensus.myTab++ 
        })

    })


   /* crimeMarkerData = _.map(parsedCrimeData, function(crime){
        return (crime["dispatch_date_time"].includes("2021/4") || crime["dispatch_data_time"].includes("2021/5"))
    })
    crimeMarkers = _.map(crimeMarkerData, function(crime){
        if (crime.lat){
            marker = L.marker([crime.lat, crime.lng]).addTo(map)}
        return marker
    })
})*/
