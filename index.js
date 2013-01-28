var mouselib = require('./lib/mouselib');
var Panorama = require('./lib/panorama');
var Selector = require('./lib/selector');

var DataSlider = function(params) {

    if (params === undefined)
        var params = {}
    var canvas = undefined;
    var selector_canvas = undefined;
    var ctx = undefined;
    var vert = undefined;
    var panorama = undefined;
    var images = undefined;
    var loaded_data = undefined;
    var panoramacb = undefined;
    var datasource = undefined;

    var createSelector = function(canvas) {
        vert = new Selector({canvas:canvas});
        vert.cb = function(params) {
            panorama.selectchange(params,loaded_data);
        }
    };
    var createPanorama = function(canvas) {
        if (panorama === undefined) 
        panorama = new Panorama({canvas:canvas});
    };
    var setMouse = function(selector,canvas) {
        $(canvas).mousemove(mouselib.mousemove.bind({vert:selector,canvas:canvas}));
        $(canvas).mousedown(mouselib.mousedown.bind({vert:selector,canvas:canvas}));
        $(canvas).mouseup(mouselib.mouseup.bind({vert:selector,canvas:canvas}));
        $(canvas).mouseout(mouselib.mouseout.bind({vert:selector,canvas:canvas}));
    };
    var wrapDiv = function(canvas) {
        var wrappingDiv = document.createElement('div');
        $(wrappingDiv).css('position','relative').css('width',canvas.width).css('height',canvas.height);
        wrappingDiv.id = 'dataslider_div';
        wrappingDiv.height = canvas.height;
        $(canvas).wrap(wrappingDiv);
    };
    this.to = function(obj) {
        canvas = obj;
        $(canvas).css('position','absolute');
        canvas.onselectstart = function(){ return false; }
        ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height);
        wrapDiv(canvas);

        selector_canvas = document.createElement('canvas');
        $(selector_canvas).css('position','absolute');
        selector_canvas.width = canvas.width; selector_canvas.height = canvas.height;
        $(canvas).after(selector_canvas);
        createSelector(selector_canvas);
        setMouse(vert,selector_canvas);
        createPanorama(canvas);
        panorama.selectchange = panoramacb;
    }
    this.setImages = function(obj) {
        images = obj;
        if (vert !== undefined) {
            vert.setImages(images);
            vert.draw();
        }
    };
    var isDrag = false;
    this.load = function (data,displayfn) {
        loaded_data = data;
        panorama.load(data,displayfn);
    }
    this.listen = function() {
    }
    this.onchange = function(cb) {
        // this way we can call onchange either before or after this.to creates panorama
        // for before
        panoramacb = cb;
        // for after
        if ((panorama !== undefined) && (panorama.selectchange === undefined)) {
            panorama.selectchange = cb;
        }
    }
    this.draw = function() {
        panorama.selectchange({data:{left:0,right:46}},loaded_data);
    };
    var add_draw = function(data) {
        loaded_data += data;
        panorama.add(data);
    }
    this.setPanoramaDisplayAddFn = function(fn) {
        panorama.displayaddfn = fn;
    };
    this.listen = function(ev,name) {
        datasource = ev; 
        datasource.on(name,add_draw.bind({draw:this.draw,load:this.load}));
    };
};

exports = module.exports = DataSlider;
