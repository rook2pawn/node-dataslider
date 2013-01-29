var DataSlider = require('../');
var Preloader = require('imagepreloader');
var Chart = require('chart');
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
    })
    dataslider.setDisplayAddFn(function(canvas,old,newdata) { 
//    console.log("old:");console.log(old);
//    console.log("new:");console.log(newdata);
    });

    setInterval(function() {
        var random = Math.floor(Math.random()*100);
        datasource.emit('data',{y:random});
    },1000);
});
