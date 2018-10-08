var ymap = new Y.Map("map", {
    "configure": {
        "dragging": true,
        "singleClickPan": false,
        "doubleClickZoom": true,
        "continuousZoom": true,
        "scrollWheelZoom": true
    }
});



var url = new URL(window.location);
if (!url.searchParams.get('geohash_length') || !url.searchParams.get('geohash_length').match(/[0-9]+/)) {
    window.location.href = 'geohash.html?geohash_length=5';
}
function updateHistory (p) {
    // TODO : 5秒待って更新
    history.replaceState('', '', p);
}
ymap.bind('moveend', function () {
    var ll = ymap.getCenter();
    var latlon = '@'+ll.Lat+','+ll.Lon
    p = 'geohash.html?geohash_length=' + url.searchParams.get('geohash_length') + '&p=' + latlon +'&z='+ymap.zoom;
    updateHistory(p);
});

ymap.addLayer(new GeohashLayer('map', url.searchParams.get('geohash_length')));
ymap.drawMap(new Y.LatLng(35.66572, 139.73100), url.searchParams.get('z') || 15, Y.LayerSetId.NORMAL);
document.getElementById('map').addEventListener ('ongeohashlimit', () => {
    console.dir('fire limit');
    var ll = ymap.getCenter();
    var latlon = '@'+ll.Lat+','+ll.Lon
    p = 'geohash.html?geohash_length=' + (url.searchParams.get('geohash_length')*1-1) + '&p=' + latlon +'&z='+ymap.zoom;
    location.href = p
});
window.addEventListener('resize', () => {
    ymap.updateSize();
});