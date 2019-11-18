/**
 * いろいろかくよ
 * @class GeohashLayer
 * @extends {Y.Layer}
 */

class GeohashLayer extends Y.BlankMapLayer {
    constructor(targetid, geohash_precision, options) {
        super();
        self.targetid_ = targetid;
        self.parentDom = document.getElementById(self.targetid_);
        self.canvas_ = null;
        self.geohash_precision = parseInt(geohash_precision) || 4;
        self.geohashArray = new Array();
        self.map = null;
        self.bindClick = false;
        self.alias_text = options.alias;
        self.is_num = options.is_num || false;
        self.max_num = options.max_num|| 0;

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
                var geohash = Geohash.encode(ll.Lat, ll.Lon, url.searchParams.get('geohash_length')*1+1);
                console.log(geohash);
                var bounds = Geohash.bounds(geohash);
                var ne = this.map.fromLatLngToContainerPixel(new Y.LatLng(bounds.ne.lat, bounds.ne.lon));
                var sw = this.map.fromLatLngToContainerPixel(new Y.LatLng(bounds.sw.lat, bounds.sw.lon));
                // canvas に描画する
                var ctx = self.canvas_.getContext('2d');
                //ctx.strokeStyle = "red";
                //ctx.strokeRect(sw.x, ne.y, ne.x - sw.x, sw.y - ne.y);
                //ctx.strokeText(geohash, sw.x + 5, ne.y + 15);
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
            var is_drawed = false;
            var bounds = Geohash.bounds(geohash);
            var ne = that.fromLatLngToContainerPixel(new Y.LatLng(bounds.ne.lat, bounds.ne.lon));
            var sw = that.fromLatLngToContainerPixel(new Y.LatLng(bounds.sw.lat, bounds.sw.lon));

            // canvas に描画する
            var ctx = self.canvas_.getContext('2d');
            ctx.strokeStyle = "white";

            if (!self.is_num) {
                ctx.fillStyle = geohash.geohashToRGB(0.6);
                ctx.strokeRect(sw.x, ne.y, ne.x - sw.x, sw.y - ne.y);
                ctx.fillRect(sw.x, ne.y, ne.x - sw.x, sw.y - ne.y);
                ctx.strokeText(geohash, sw.x + 5, ne.y + 15);
                is_drawed = true;
            }

            // エイリアス設定があれば表示
            if (alias_text && alias_text[geohash]) {
                if (self.is_num) {
                    var alias_color = 255 - (255 * (alias_text[geohash] / self.max_num));
                    ctx.fillStyle = "rgba(255," + alias_color + ",0,0.5)";
                } else {
                    ctx.fillStyle = geohash.geohashToRGB(0.6);
                }
                ctx.strokeRect(sw.x, ne.y, ne.x - sw.x, sw.y - ne.y);
                ctx.fillRect(sw.x, ne.y, ne.x - sw.x, sw.y - ne.y);
                ctx.strokeText(alias_text[geohash], (sw.x + ne.x) / 2 - 10, (sw.y + ne.y) / 2);
                ctx.strokeText(geohash, sw.x + 5, ne.y + 15);
                is_drawed = true;
            }

            if (!is_drawed) {
                ctx.strokeStyle = "black";
                if (Object.keys(alias_text).length !==0) {
                    ctx.fillStyle = "rgba(0,0,0,0.2)";
                } else {
                    ctx.fillStyle = geohash.geohashToRGB(0.6);
                }

                ctx.strokeRect(sw.x, ne.y, ne.x - sw.x, sw.y - ne.y);
                ctx.fillRect(sw.x, ne.y, ne.x - sw.x, sw.y - ne.y);
                ctx.strokeText(geohash, sw.x + 5, ne.y + 15);
            }
        }

        var limit = 500;
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
            var ybounds= new Y.LatLngBounds(new Y.LatLng(bounds.sw.lat, bounds.sw.lon), new Y.LatLng(bounds.ne.lat, bounds.ne.lon));
            var ymap = that.getMap();
            var map_bounds = ymap.getBounds();

            // 日付変更線をまたぐ場合
            //if (map_bounds.ne.Lon * map_bounds.sw.Lon < 1) {

            /*} else */if (!map_bounds.containsBounds(ybounds, true)) {
                return;
            }

            // 描画してリストに追加
            self.geohashArray.push(geohash);
            strokeGeohash(geohash);
            //console.log('storoke : ' + geohash);

            var neighbours = Geohash.neighbours(geohash);
            for (var angle in neighbours) {
                fillGeohash(neighbours[angle]);
            }
        }
        fillGeohash(geohash);
    }
};
