function highlightFeatureBorder(e){
    if (currentSelectNeighbor){
        featureGroup.resetStyle(currentSelectNeighbor);
    } 
    var layer = e.target;
    currentSelectNeighbor = layer
    map.fitBounds(layer.getBounds().pad(Math.sqrt(2) / 6));
    layer.setStyle({
        weight: 5,
        color: "red",
        dashArray: '',
        fillOpacity:0
    })
}


function highlightFeature(e) {
    var layer = e.target;
    if (currentSelectNeighbor != layer){
        layer.setStyle({
            weight: 3,
            color: "#d36767",
            opacity: 1,
            fillColor: "#d36767",
            //color: "#175491",
            dashArray: '',
            fillOpacity: 0.2
        })
    }   

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    };
    //info.update(layer.feature.properties);
}

function resetHighlight(e) {
    if (currentSelectNeighbor != e.target){ 
    featureGroup.resetStyle(e.target)}
    //info.update();
}

function onEachFeatureFunc(feature, layer) {
    layer.myTag = "tract";
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: function (event) {
            highlightFeatureBorder(event);
            updateTable(event);
          }       
    })
    layer.bindTooltip("District " + feature.properties.DIST_NUMC)
}


function setColor(crimeDist){

}

function brewStyle(feature) {
    return {
        fillColor: brew.getColorInRange(feature.properties[var_display]),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}
/*function onEachFeature(feature, layer) {
    layer.myTag = "tract";
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: function (event) {
          updateTable(event);
          zoomToFeature(event)
        }
    })
};*/
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds().pad(Math.sqrt(2) / 6));
}

function updateTable(e) {
    $('#tb-title').text("Distric Crime Overview")
  //  console.log(target["PREDICTED.CNT"])

    var target = e.target.feature.properties
    $('#tb-sub').text("This shows crimes within 7 days.")
    $('#tb-dist').text("District Number:")
    $('#tb-vio').text("")
    $('#tb-viorate').text("Violate Crimes:")
    $('#tb-econ').text("Property Crimes:")
    $('#tb-other').text("Other Offenses:")
    $('#tb-totalrate').text("")
  
    $('#tb-dist1').text(target["DIST_NUMC"])
    $('#tb-space').text("")
    $('#tb-vio-num').text(calculateViolateDist(crimeDist[target["DIST_NUMC"]]))
    $('#tb-econ-num').text(calculateEconDist(crimeDist[target["DIST_NUMC"]]))
    $('#tb-other-num').text(calculateOtherOffenseDist(crimeDist[target["DIST_NUMC"]]))
    $('#tb-totalnum').text(calculateTotalDist(crimeDist[target["DIST_NUMC"]]))
    $('#tb-totalrate-num').text("")
}


var city_pop = $('#tb-dist').text()
var city_vio = $('#tb-vio').text()
var city_viorate = $('#tb-viorate').text()
var city_econ = $('#tb-econ').text()
var city_other = $('#tb-other').text()
var city_total = $('#tb-total').text()
var city_totalrate = $('#tb-totalrate').text()

var city_pop_num = $('#tb-dist1').text()
var city_space = $('#tb-space').text()
var city_vio_num = $('#tb-vio-num').text()
var city_econ_num = $('#tb-econ-num').text()
var city_other_num = $('#tb-other-num').text()
var city_total_num = $('#tb-total-num').text()
var city_totalrate_num = $('#tb-totalrate-num').text()

function resetCityPage() {
    $('#tb-title').text("City Overview")
    $('#tb-sub').text("")
    $('#tb-dist').text(city_pop)
    $('#tb-vio').text(city_vio)
    $('#tb-viorate').text(city_viorate)
    $('#tb-econ').text(city_econ)
    $('#tb-other').text(city_other)
    $('#tb-total').text(city_total)
    $('#tb-totalrate').text(city_totalrate)

    $('#tb-dist1').text(city_pop_num)
    $('#tb-space').text(city_space)
    $('#tb-vio-num').text(city_vio_num)
    $('#tb-econ-num').text(city_econ_num)
    $('#tb-other-num').text(city_other_num)
    $('#tb-total-num').text(city_total_num)
    $('#tb-totalrate-num').text(city_totalrate_num)
}

function calculateViolateDist(dist){
    return (_.size(dist.countNum["100"]) + _.size(dist.countNum["200"]) + _.size(dist.countNum["300"]) 
    + _.size(dist.countNum["400"]) + _.size(dist.countNum["500"]) + _.size(dist.countNum["900"]))
}

function calculateEconDist(dist){
    return (_.size(dist.countNum["600"]) + _.size(dist.countNum["700"]))
}

function calculateOtherOffenseDist(dist){
    return (calculateTotalDist(dist) - calculateEconDist(dist) - calculateViolateDist(dist))
}

function calculateTotalDist(dist){
    return (_.size(dist) - 1)
}

function calculateRisk(dist){
    var area = getArea(dist)

    var risk = 100 * calculateViolateDist(dist) + 50 * calculateEconDist(dist) + 20 * calculateOtherOffenseDist(dist)
    return parseInt(risk / area)
}

function getArea(dist){
    var area = 0
    _.each(a, function(dist){
        if (dist.properties.DIST_NUMC == "14"){
            area = parseInt(dist.properties.AREA_SQMI)
        } 
    }) 
    return parseInt(area / 10000000)
}