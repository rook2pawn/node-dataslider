var DataSlider = require('../');
var Preloader = require('imagepreloader');
var Chart = require('chart');
var Hash = require('hashish');
var ee = require('events').EventEmitter;
var datasource = new ee;

$(window).ready(function() {
    var chart = new Chart;
    chart.series(datasource);
    var focus = document.getElementById('focus');
    chart.to(focus);
    var focusctx = focus.getContext('2d');
    var canvas = document.getElementById('mycanvas');
    var ctx = canvas.getContext('2d');
    var dataslider = new DataSlider;
    dataslider.to(canvas);
    dataslider.onchange(function(params) {
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
    dataslider.load([], function(canvas,data){
        var ctx = canvas.getContext('2d');
        ctx.fillStyle='#FF0000';
        ctx.fillRect(0,0,20,20);
    });
    dataslider.listen(datasource,'data');    
    dataslider.setAddFn(function(old,newdata) {
        old.push(newdata);
        return old;
    });
var rangeY = function(list,specialkey) {
    // % to top pad so the "peak" isn't at the top of the viewport, but we allow some extra space for better visualization
//    var padding = 0.10; // 0.10 = 10%;
    var padding = 0;

    var minY = undefined;
    var maxY = undefined;
    for (var i = 0; i < list.length; i++) {
        Hash(list[i])
            .filter(function(val,key) { 
                if (specialkey !== undefined) 
                    return (key == specialkey) 
                return (key !== 'date')
             })
            .forEach(function(val,key) {
            if (minY == undefined) 
                minY = val;
            if (maxY == undefined)
                maxY = val;
            if (val < minY)
                minY = val;
            if (val > maxY)
                maxY = val;
        });
    }
    maxY = (1 + padding)*maxY;
    var spread = undefined;
    if ((minY!== undefined) && (maxY !== undefined)) {
        spread = maxY - minY;
    }
    // shift is the amount any value in the interval needs to be shifted by to fall with the interval [0,spread]
    var shift = undefined;
    if ((minY < 0) && (maxY >= 0)) {
        shift = Math.abs(minY);
    }
    if ((minY < 0) && (maxY < 0)) {
        shift = Math.abs(maxY) + Math.abs(minY);
    }
    if (minY > 0) {
        shift = -minY;
    }
    if (minY == 0) 
        shift = 0;
    return {min:minY,max:maxY,spread:spread,shift:shift}
};
    dataslider.setDisplayAddFn(function(canvas,old,newdata) { 
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height); 
        ctx.beginPath();
        ctx.moveTo(0,canvas.height);
        var range = rangeY(old,'y');
        var step = Math.floor(canvas.width / old.length);
        for (var i = 0; i < old.length; i++) {
            var normalized = (old[i].y / range.max) * canvas.height;
            ctx.lineTo(i*step,canvas.height - normalized);
        }
        ctx.lineTo(canvas.width,canvas.height);
        ctx.lineTo(0,canvas.height);
        ctx.fillStyle = '#d6e7f2';
        ctx.fill();
        ctx.strokeStyle = '#517ea5';
        ctx.stroke();
    });

    setInterval(function() {
        var random = Math.floor(Math.random()*200);
        datasource.emit('data',{y:random});
    },1000);
});
