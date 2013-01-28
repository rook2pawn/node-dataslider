var mouselib = require('./lib/mouselib');
var Panorama = require('./lib/panorama');
var Selector = require('./lib/selector');

var DataSlider = function(params) {
    if (params === undefined)
        var params = {}

    // necessary globals
    var loaded_data = undefined;
    var onchange = undefined;

    var panorama_canvas = undefined;
    var selector_canvas = undefined;
    var selector = undefined;
    var panorama = undefined;
    var createPanorama = function(canvas) {
        return new Panorama({canvas:canvas});
    };
    var createSelector = function(canvas) {
        return new Selector({canvas:canvas});
    };
    var wrapDiv = function(canvas) {
        var wrappingDiv = document.createElement('div');
        $(wrappingDiv).css('position','relative').css('width',canvas.width).css('height',canvas.height);
        wrappingDiv.id = 'dataslider_div';
        wrappingDiv.height = canvas.height;
        $(canvas).wrap(wrappingDiv);
    };
    var setMouse = function(selector,canvas) {
        $(canvas).mousemove(mouselib.mousemove.bind({vert:selector,canvas:canvas}));
        $(canvas).mousedown(mouselib.mousedown.bind({vert:selector,canvas:canvas}));
        $(canvas).mouseup(mouselib.mouseup.bind({vert:selector,canvas:canvas}));
        $(canvas).mouseout(mouselib.mouseout.bind({vert:selector,canvas:canvas}));
    };

    this.to = function(canvasobj) {
        panorama_canvas = canvasobj;
        $(panorama_canvas).css('position','absolute');
        panorama_canvas.onselectstart = function(){ return false; }
        wrapDiv(panorama_canvas);

        selector_canvas = document.createElement('canvas');
        $(selector_canvas).css('position','absolute');
        selector_canvas.width = panorama_canvas.width; selector_canvas.height = panorama_canvas.height;
        $(panorama_canvas).after(selector_canvas);

        selector = createSelector(selector_canvas);
        panorama = createPanorama(panorama_canvas);
        setMouse(selector,selector_canvas);
        if (onchange !== undefined) 
            panorama.onchange = onchange;
        selector.cb = function(params) {
            panorama.onchange(params,loaded_data);
        }
    }
    this.setImages = function(images) {
        if (selector !== undefined) {
            selector.setImages(images);
            selector.draw();
        }
    };
    this.load = function (data,displayfn) {
        loaded_data = data;
        panorama.load(data,displayfn);
    }
    this.listen = function() {
    }
    this.onchange = function(cb) {
        // this way we can call onchange either before or after this.to creates panorama
        // for before
        onchange = cb;
        // for after
        if ((panorama !== undefined) && (panorama.onchange === undefined)) {
            panorama.onchange = cb;
        }
    }
    this.draw = function() {
        panorama.onchange({data:{left:0,right:46}},loaded_data);
    };
    var add_draw = function(data) {
        loaded_data += data;
        panorama.add(data);
    }
    this.setPanoramaDisplayAddFn = function(fn) {
        panorama.displayaddfn = fn;
    };
    this.listen = function(ev,name) {
        ev.on(name,add_draw.bind({draw:this.draw,load:this.load}));
    };
};

exports = module.exports = DataSlider;
