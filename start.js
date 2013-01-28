var DataSlider = require('../');
var Preloader = require('imagepreloader');
var ee = require('events').EventEmitter;
var datasource = new ee;

$(window).ready(function() {
    var focus = document.getElementById('focus');
    var focusctx = focus.getContext('2d');
    var canvas = document.getElementById('mycanvas');
    var ctx = canvas.getContext('2d');
    var dataslider = new DataSlider;
    var basesize = 48;
    dataslider.to(canvas);
    dataslider.onchange(function(params,data) {
        var ctx = focusctx;
        ctx.clearRect(0,0,focus.width,focus.height);
        ctx.strokeRect(0,0,focus.width,focus.height);
        ctx.fillStyle = '#000000';
        var width = params.data.right - params.data.left;
        var factor = focus.width / width;
        var size = basesize * factor;
        ctx.font = size + "px Courier";
        //console.log("width:" + width + " factor:" + factor);
        ctx.fillText(data,-factor*(params.data.left+3),focus.height);
    });
    var imgset = new Preloader;
    imgset
        .add('img/selector_left.png')
        .add('img/selector_right.png')
        .add('img/selector_left_hover.png')
        .add('img/selector_right_hover.png')
        .add('img/selector_left_down.png')
        .add('img/selector_right_down.png')
        .success(function(images) {
            dataslider.setImages(images);
        })
        .error(function(msg) { console.log("Error:" + msg) })
        .done();
    dataslider.load("Jameson",function(canvas,data) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.font = basesize + "px Courier";
        ctx.fillText(data,0,basesize-10);
    });
    dataslider.listen(datasource,'data');    
    dataslider.setPanoramaDisplayAddFn(function(old,newdata) {
        console.log("new data:");
        console.log(newdata);
        console.log(old);
    });
    dataslider.draw();
    
    var words = ['Buffalo Trace', 'Laphroaig', 'Glennfiddich', 'Glenlivet', 'Bullit', 'Woodford Reserve'];
    var give = function() {
        if (words.length > 1) {
            datasource.emit('data',words.pop());
            setTimeout(give,3000);
        }
    }
    setTimeout(give,3000)
});
