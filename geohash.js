/**
 * 初期化
 */
var ymap = new Y.Map("map", {
    "configure": {
        "dragging": true,
        "singleClickPan": true,
        "doubleClickZoom": true,
        "continuousZoom": true,
        "scrollWheelZoom": true
    }
});

/**
 * いろいろかくよ
 * @class CanvasLayer
 * @extends {Y.Layer}
 */
class CanvasLayer extends Y.Layer {
    constructor(targetid) {
        super();
        self.targetid_ = targetid;
        self.canvas_ = null;
        self.geohash_precision = 7;
    }

    drawLayer() {
        CanvasLayer.prototype.drawLayer = function () {
            if (self.canvas_) {
                return;
            }
            var elem = document.getElementById(self.targetid_)
            var canvas = document.createElement("canvas");
            canvas.style.position = "absolute";
            canvas.width = elem.offsetWidth;    // はめ込み先の幅
            canvas.height = elem.offsetHeight;  // はめ込み先の高さ
            self.canvas_ = canvas;

            var container = this.getMapContainer(); // canvas をはめ込む親要素を取得
            if (!container || !container[0]) {
                return;
            }
            container[0].appendChild(canvas);   // canvas をはめ込む

            var ymap = this.getMap();
            var center = ymap.getCenter()
            var geohash = Geohash.encode(center.Lat, center.Lon, self.geohash_precision);
            var bounds = Geohash.bounds(geohash);
            var ne = this.fromLatLngToContainerPixel(new Y.LatLng(bounds.ne.lat, bounds.ne.lon));
            var sw = this.fromLatLngToContainerPixel(new Y.LatLng(bounds.sw.lat, bounds.sw.lon));

            // canvas に描画する
            var ctx = self.canvas_.getContext('2d');
            ctx.strokeStyle = "red";
            ctx.strokeRect(ne.x, ne.y, sw.x, sw.y);
            ctx.strokeText(geohash, ne.x+5, ne.y+10);
        }
        return self;
    }
}
var geohash = new CanvasLayer('map');
ymap.addLayer(geohash);
ymap.drawMap(new Y.LatLng(35.66572, 139.73100), 10, Y.LayerSetId.NORMAL);
