
var ymap = new Y.Map("map", {
    "configure": {
        "dragging": true,
        "singleClickPan": true,
        "doubleClickZoom": true,
        "continuousZoom": true,
        "scrollWheelZoom": true
    }
});
ymap.drawMap(new Y.LatLng(35.66572, 139.73100), 17, Y.LayerSetId.NORMAL);


class CanvasLayer extends Y.Layer {
    constructor(targetid) {
        super();
        self.targetid_ = targetid;
        self.canvas_ = null;
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
            if (!container || !container[0])
                return;
            container[0].appendChild(canvas);   // canvas をはめ込む

            // canvas に描画する
            var ctx = self.canvas_.getContext('2d');
            ctx.clearRect(0, 0, self.canvas_.width, self.canvas_.height);

            var w = self.canvas_.width;
            var h = self.canvas_.height;
            ctx.fillStyle = "yellow";
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 10, 0, Math.PI * 2, false); // ○
            ctx.fill();
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.rect(0, 0, w, h);   // 枠線
            ctx.closePath();
            ctx.stroke();
        }
        return self;
    }
}

/*
function CanvasLayer(targetid) {
    this.targetid_ = targetid;
    this.canvas_ = null;

    CanvasLayer.prototype.drawLayer = function () {
        if (this.canvas_) {
            return;
        }
        var elem = document.getElementById(this.targetid_)
        var canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.width = elem.offsetWidth;    // はめ込み先の幅
        canvas.height = elem.offsetHeight;  // はめ込み先の高さ
        this.canvas_ = canvas;

        var container = this.getMapContainer(); // canvas をはめ込む親要素を取得
        if (!container || !container[0])
            return;
        container[0].appendChild(canvas);   // canvas をはめ込む

        // canvas に描画する
        var ctx = this.canvas_.getContext('2d');
        ctx.clearRect(0, 0, this.canvas_.width, this.canvas_.height);

        var w = this.canvas_.width;
        var h = this.canvas_.height;
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 10, 0, Math.PI * 2, false); // ○
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.rect(0, 0, w, h);   // 枠線
        ctx.closePath();
        ctx.stroke();
    }

    return this;
}
CanvasLayer.prototype = new Y.Layer();
*/
var geohash = new CanvasLayer('map');
ymap.addLayer(geohash);
