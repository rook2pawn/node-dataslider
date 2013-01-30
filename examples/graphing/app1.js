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

    // panorama data .. global cross function sad face ><
    // it is rekeyed across on displayaddfn to store
    // new locations of where each point lives
    // and accessed in onchange.
    var data = []; 
    dataslider.to(canvas);
    dataslider.onchange(function(params) {
        var pos = params.pos;
        var indices = lib.getIndices(data,pos);
        //console.log(indices);
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
    });
    dataslider.listen(datasource,'data');    
    dataslider.setAddFn(function(old,newdata) {
        old.push(newdata);
        return old;
    });
    dataslider.setDisplayAddFn(function(canvas,old,newdata) { 
        if (old.length > 50) {
            dataslider.thin();
            old = dataslider.getData();
        }
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height); 
        ctx.beginPath();
        var range = lib.rangeY(old,'y');
        var step = canvas.width / old.length;
        data = [];
        for (var i = 0; i < old.length; i++) {
            var normalized = (old[i].y / range.max) * canvas.height;
            var obj = {};
            obj.x = Math.floor(i*step);
            obj.y = Math.floor(canvas.height - normalized);
            data.push(obj);
            if (i === 0) {
                ctx.moveTo(obj.x,obj.y)
            } else {
                ctx.lineTo(obj.x,obj.y);
            }

        }
        ctx.lineTo(canvas.width,canvas.height);
        ctx.lineTo(0,canvas.height);
        ctx.fillStyle = '#d6e7f2';
        ctx.fill();
        ctx.strokeStyle = '#517ea5';
        ctx.stroke();
        // dots
        for (var i = 0; i < old.length; i++) {
            var normalized = (old[i].y / range.max) * canvas.height;
            var obj = {};
            obj.x = Math.floor(i*step);
            obj.y = Math.floor(canvas.height - normalized);
            ctx.beginPath();
            ctx.arc(obj.x,obj.y, 3, 0, Math.PI*2, false);
            ctx.stroke();
        }
        // find out UI.left -> data[i]  and UI.right -> data[j]
        var pos = dataslider.getConfig(); 
        var indices = lib.getIndices(data,pos);
        //console.log(indices);
        
    });
    var idx = 0;
    var step = 0.1;
    setInterval(function() {
//        var random = Math.floor(Math.random()*200);
        var random = Math.abs(Math.floor(Math.sin(Math.PI*(idx+step))*100));
        idx += step;
        datasource.emit('data',{y:random});
    },1000);
});
