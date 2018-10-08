/**
 * いろいろかくよ
 * @class GeohashLayer
 * @extends {Y.Layer}
 */

class GeohashLayer extends Y.BlankMapLayer {
    constructor(targetid, geohash_precision) {
        super();
        self.targetid_ = targetid;
        self.parentDom = document.getElementById(self.targetid_);
        self.canvas_ = null;
        self.geohash_precision = parseInt(geohash_precision) || 4;
        self.geohashArray = new Array();
        self.map = null;
        self.bindClick = false;

        window.addEventListener('resize', () => {
            this.fitSize();
            this.drawLayer();
        });
    }

    fitSize () {
        if (!self.canvas_) return;

        self.canvas_.width = self.parentDom.offsetWidth;    // はめ込み先の幅
        self.canvas_.height = self.parentDom.offsetHeight;  // はめ込み先の高さ
    }

    createCanvas () {
        if (!self.bindClick) {
            self.bindClick = true;
            this.map.bind('click',  (ll) => {
                var geohash = Geohash.encode(ll.Lat, ll.Lon, url.searchParams.get('l')*1+1);
                console.log(geohash);
                var bounds = Geohash.bounds(geohash);
                var ne = this.map.fromLatLngToContainerPixel(new Y.LatLng(bounds.ne.lat, bounds.ne.lon));
                var sw = this.map.fromLatLngToContainerPixel(new Y.LatLng(bounds.sw.lat, bounds.sw.lon));
                // canvas に描画する
                var ctx = self.canvas_.getContext('2d');
                ctx.strokeStyle = "red";
                ctx.strokeRect(sw.x, ne.y, ne.x - sw.x, sw.y - ne.y);
                ctx.strokeText(geohash, sw.x + 5, ne.y + 15);
            });
        }

        if (self.canvas_) {
            self.canvas_.remove();
            self.geohashArray = new Array();
            this.map.unbind('click');
        }
        var canvas = document.createElement("canvas");
        canvas.style.position = "fixed";
        //canvas.style.background = "#0000ff36"
        canvas.style.top = 0;
        canvas.style.left = 0;
        self.canvas_ = canvas;

        this.fitSize();

        var container = this.getMapContainer(); // canvas をはめ込む親要素を取得
        if (!container || !container[0]) {
            return;
        }
        container[0].appendChild(canvas);   // canvas をはめ込む
    }
    drawLayer() {
        var that = this;
        this.createCanvas();

        var ymap = this.getMap();
        var center = ymap.getCenter()

        var geohash = Geohash.encode(center.Lat, center.Lon, self.geohash_precision);


        var strokeGeohash = function (geohash) {
            var bounds = Geohash.bounds(geohash);
            var ne = that.fromLatLngToContainerPixel(new Y.LatLng(bounds.ne.lat, bounds.ne.lon));
            var sw = that.fromLatLngToContainerPixel(new Y.LatLng(bounds.sw.lat, bounds.sw.lon));
            // canvas に描画する
            var ctx = self.canvas_.getContext('2d');
            ctx.strokeStyle = "red";
            ctx.strokeRect(sw.x, ne.y, ne.x - sw.x, sw.y - ne.y);

            ctx.strokeText(geohash, sw.x + 5, ne.y + 15);
        }

        var limit = 300;
        var fillGeohash = function (geohash) {
            // 描画済みか確認
            if (self.geohashArray.includes(geohash)) {
                return;
            }
            // 一応リミット...
            if (self.geohashArray.length > limit) {
                // 制限がかかったらgeohashの桁数をへらす
                var ongeohashlimit = document.createEvent("Event")
                ongeohashlimit.initEvent("ongeohashlimit", true, true);
                self.parentDom.dispatchEvent(ongeohashlimit);
                return;
            }

            // 描画エリア内か確認
            var bounds = Geohash.bounds(geohash);
            var ymap = that.getMap();
            var map_bounds = ymap.getBounds();
            if (!(
                map_bounds.containsLatLng(new Y.LatLng(bounds.ne.lat, bounds.ne.lon)) || // 北東
                map_bounds.containsLatLng(new Y.LatLng(bounds.sw.lat, bounds.ne.lon)) || // 北西
                map_bounds.containsLatLng(new Y.LatLng(bounds.sw.lat, bounds.sw.lon)) || // 南西
                map_bounds.containsLatLng(new Y.LatLng(bounds.ne.lat, bounds.sw.lon))    // 南東
            )) {
                return;
            }

            // 描画してリストに追加
            self.geohashArray.push(geohash);
            strokeGeohash(geohash);

            var neighbours = Geohash.neighbours(geohash);
            for (var angle in neighbours) {
                fillGeohash(neighbours[angle]);
            }
        }
        fillGeohash(geohash);
    }
};
