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
    updateHistory(createUrl());
});

ymap.addLayer(new GeohashLayer('map', url.searchParams.get('geohash_length')));

var p = parseP(url.searchParams.get('p'));
ymap.drawMap(new Y.LatLng(p.Lat, p.Lon) , p.zoom , Y.LayerSetId.NORMAL);
document.getElementById('map').addEventListener ('ongeohashlimit', () => {
    console.dir('fire limit');
    location.href = createUrl(url.searchParams.get('geohash_length')*1-1);
});
window.addEventListener('resize', () => {
    ymap.updateSize();
});

function createUrl(geohash_length) {
    if (!geohash_length) {
        geohash_length = url.searchParams.get('geohash_length');
    }

    var ll = ymap.getCenter();
    var latlon = '@'+ll.Lat+','+ll.Lon
    return 'geohash.html?' +
        'geohash_length=' + geohash_length +
        '&geohash=' + Geohash.encode(ll.Lat, ll.Lon, url.searchParams.get('geohash_length')) +
        '&p=' + latlon + ',' + ymap.zoom + 'z'
        ;
}

function parseP (p) {
    p = p + "";
    var m = p.match(/@([0-9.]+),([0-9.]+),([0-9]+)z/);
    if (m === null) {
        m = {};
    }
    return {
        Lat : m[1] || 35.171962,
        Lon : m[2] || 136.8817322,
        zoom : m[3] || 13
    }
}