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
    dataslider.to(canvas);
    dataslider.onchange(function(params) {
        var ctx = focusctx;
        ctx.clearRect(0,0,focus.width,focus.height);
        ctx.strokeRect(0,0,focus.width,focus.height);
        ctx.fillStyle = '#000000';
        var width = params.pos.right - params.pos.left;
        var data = dataslider.getData();
        var unitwidth = canvas.width  / data.length;
        var unitsize = focus.width * (unitwidth / width);
        
        ctx.font = Math.round(unitsize) + "px Courier";
        for (var i = 0; i < data.length; i++) {
            ctx.fillText(data[i],Math.floor(unitsize*i) - (focus.width/width)*(params.pos.left+3),focus.height);
        }
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
        var basesize = Math.floor(canvas.width / data.length);
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.font = basesize + "px Courier";
        for (var i = 0; i < data.length; i++) {
            ctx.fillStyle = '#000000';
            ctx.fillText(data[i],basesize*i,canvas.height);
        }
    });
    dataslider.listen(datasource,'data');    
    dataslider.setAddFn(function(old,newdata) {
        return old.concat(':').concat(newdata); 
    })
    dataslider.setDisplayAddFn(function(canvas,old,newdata) {
        var basesize = Math.floor(canvas.width / old.length);
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.font = basesize + "px Courier";
        for (var i = 0; i < old.length; i++) {
            ctx.fillStyle = '#000000';
            ctx.fillText(old[i],basesize*i,canvas.height);
        }
        dataslider.draw();
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
