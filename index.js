var mouselib = require('./lib/mouselib');
var Panorama = require('./lib/panorama');
var Selector = require('./lib/selector');
var PositionBar = require('./lib/positionbar');
var Preloader = require('imagepreloader');

var DataSlider = function(params) {
    if (params === undefined)
        var params = {}

    // necessary globals
    var onchange = undefined;

    var panorama_canvas = undefined;
    var selector_canvas = undefined;
    var positionbar_canvas = undefined;
    var selector = undefined;
    var panorama = undefined;
    var positionbar = undefined;
    var createPositionBar = function(canvas) {
        var bar = new PositionBar({canvas:canvas,selector:selector});
        var imgset = new Preloader;
        imgset
            .add('img/play.png')
            .add('img/play_light.png')
            .add('img/pause.png')
            .add('img/pause_light.png')
            .add('img/positionbar.png')
            .success(function(images) { 
                bar.setImages(images);
                bar.draw();
            })
            .error(function(msg) {
                console.log(msg)
            })
            .done();
        return bar;
    };
    var createPanorama = function(canvas) {
        return new Panorama({canvas:canvas});
    };
    var createSelector = function(canvas) {
        var sel = new Selector({canvas:canvas});  
        var imgset = new Preloader;
        imgset
            .add('img/selector_left.png')
            .add('img/selector_right.png')
            .add('img/selector_left_hover.png')
            .add('img/selector_right_hover.png')
            .add('img/selector_left_down.png')
            .add('img/selector_right_down.png')
            .success(function(images) {
                sel.setImages(images);
                sel.draw();
            })
            .error(function(msg) { console.log("Error:" + msg) })
            .done();
        return sel;
    };

    var wrapDiv = function(canvas) {
        var wrappingDiv = document.createElement('div');
        $(wrappingDiv).css('position','relative').css('width',canvas.width).css('height',2*canvas.height);
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

        positionbar_canvas = document.createElement('canvas');
        $(positionbar_canvas).css('position','absolute').css('top',panorama_canvas.height);
        positionbar_canvas.width = panorama_canvas.width; positionbar_canvas.height = panorama_canvas.height;  
        $(panorama_canvas).after(positionbar_canvas);

        selector = createSelector(selector_canvas);
        panorama = createPanorama(panorama_canvas);
        positionbar = createPositionBar(positionbar_canvas);
        setMouse(selector,selector_canvas);
        if (onchange !== undefined) 
            panorama.onchange = onchange;
        selector.cb = function(params) {
            positionbar.draw();
            panorama.onchange(params);
        }
    }
    this.load = function(data,fn) {
        panorama.load(data,fn);
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
        var params = {pos: 
        { left: {pos: selector.config.left.pos},
          right: {pos: selector.config.right.pos}
        }}; 
        panorama.onchange(params);
    };
    this.getData = function(params) {
        return panorama.getLoadedData();
    };
    this.getConfig = function() {
        return selector.config;
    }
    this.setDisplayAddFn = function(fn) {
        panorama.displayaddfn = fn;
    };
    this.setAddFn = function(fn) {
        panorama.addfn = fn;
    };
    this.listen = function(ev,name) {
        ev.on(name,panorama.add.bind({panorama:panorama}));
    };
    this.thin = function() {
        panorama.thin();
    }
};
exports = module.exports = DataSlider;
