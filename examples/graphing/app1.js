var DataSlider = require('../');
var Preloader = require('imagepreloader');
var Chart = require('chart');
var ee = require('events').EventEmitter;
var lib = require('./util.js');
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
        $('#status').html("type:" + params.type + " left:" + params.pos.left+ " right:" + params.pos.right);
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
    dataslider.setDisplayAddFn(function(canvas,old,newdata) { 
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height); 
        ctx.beginPath();
        ctx.moveTo(0,canvas.height);
        var range = lib.rangeY(old,'y');
        var step = canvas.width / old.length;
        for (var i = 0; i < old.length; i++) {
            var normalized = (old[i].y / range.max) * canvas.height;
            ctx.lineTo(Math.floor(i*step),Math.floor(canvas.height - normalized));
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
