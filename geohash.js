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

document.getElementById('geohash').addEventListener('change', function () {
    var center = Geohash.decode(this.value);
    ymap.drawMap(new Y.LatLng(center.lat, center.lon));
});
document.getElementById('geohash_length').addEventListener('change', function () {
    window.location.href = createUrl(this.value);
});
ymap.bind('moveend', function () {
    updateHistory(createUrl());

    var url = new URL(window.location);
    document.getElementById('geohash').value = url.searchParams.get('geohash');
    document.getElementById('geohash').size = url.searchParams.get('geohash').length;
    document.getElementById('geohash_length').value = url.searchParams.get('geohash_length');
    document.getElementById('geohash_length').size = url.searchParams.get('geohash_length').length;
    document.getElementById('position').value = url.searchParams.get('p');
    document.getElementById('position').size = url.searchParams.get('p').length+5;
});

var alias = {};
if (url.searchParams.get('alias')) {
    var _alias = url.searchParams.get('alias').split(',').map(p=>{return p.split(':')});
    for (var i=0; i<_alias.length; i++) {
        alias[_alias[i][0]] = _alias[i][1];
    }
}

ymap.addLayer(new GeohashLayer('map', url.searchParams.get('geohash_length'), alias));

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
    var alias = '';
    if (url.searchParams.get('alias')) {
        alias = '&alias=' + url.searchParams.get('alias');
    }
    return 'geohash.html?' +
        'geohash_length=' + geohash_length +
        '&geohash=' + Geohash.encode(ll.Lat, ll.Lon, url.searchParams.get('geohash_length')) +
        '&p=' + latlon + ',' + ymap.zoom + 'z' +
        alias;
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