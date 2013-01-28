var mousemove = function(ev) {
    var canvas = this.canvas;
    var offset = $(canvas).offset();
    var x = ev.pageX - offset.left;
    var y = ev.pageY - offset.top;
    var needsDraw = false;
    var vert = this.vert;

    var styles = {}; styles.hover = "hover"; styles.slide = "slide";

    if ((vert.config.left.status !== 'down') && (vert.config.right.status !== 'down') && (vert.config.middle.status !== 'drag')) {
        if (vert.isLeft(x)) {
            if (vert.config.left.status !== 'hover') {
                vert.config.left.status = 'hover';
                $(canvas).removeClass();                
                $(canvas).addClass(styles.hover);                
                needsDraw = true;
            }
        } else if (vert.isRight(x)) {
            if (vert.config.right.status !== 'hover') {
                vert.config.right.status = 'hover';
                $(canvas).removeClass();                
                $(canvas).addClass(styles.hover);                
                needsDraw = true;
            }
        } else {
            if (vert.isMiddle(x)) {
                $(canvas).addClass(styles.slide);
            } else {
                $(canvas).removeClass();                
                if (vert.config.left.status !== 'normal') {
                    vert.config.left.status = 'normal';
                    needsDraw = true;
                } 
                if (vert.config.right.status != 'normal') {
                    vert.config.right.status = 'normal';
                    needsDraw = true;
                }
            }
        }
    } else {
        if (vert.config.middle.status == 'drag') {
            var offset = x - vert.config.middle.startx;
            if ((vert.config.right.pos + offset < (canvas.width - vert.config.right.width)) && (vert.config.left.pos + offset >= 0)) {
                vert.config.middle.startx = x;
                vert.config.left.pos += offset;
                vert.config.right.pos += offset;
                vert.action('drag',{left:vert.config.left.pos,right:vert.config.right.pos});
                needsDraw = true;
            }
        } else if (vert.config.left.status == 'down') {
            vert.config.left.pos = x;
            $(canvas).addClass('hover');                
            needsDraw = true;
            vert.action('resize',{left:vert.config.left.pos,right:vert.config.right.pos});
        } else if (vert.config.right.status == 'down') {
            if (x < canvas.width - vert.config.right.width) {
                vert.config.right.pos = x;
                $(canvas).addClass('hover');                
                needsDraw = true;
                vert.action('resize',{left:vert.config.left.pos,right:vert.config.right.pos});
            }
        }
    }
    if (needsDraw)  {
        vert.draw();
    }
};
var mousedown = function(ev) {
    ev.originalEvent.preventDefault();
    var canvas = this.canvas;
    var vert = this.vert;
    var offset = $(canvas).offset();
    var x = ev.pageX - offset.left;
    var y = ev.pageY - offset.top;
    if (vert.isLeft(x)) {
        vert.config.left.status = 'down';
        vert.draw();
    }
    if (vert.isRight(x)) {
        vert.config.right.status = 'down';
        vert.draw();
    }
    if (vert.isMiddle(x)) {
        vert.config.middle.status = 'drag';
        vert.config.middle.startx = x;
        vert.draw(); 
    }
}
var mouseup = function(ev) {
    var vert = this.vert;
    var canvas = this.canvas;
    vert.config.left.status = 'normal';
    vert.config.right.status = 'normal';
    vert.config.middle.status = 'normal';
    $(canvas).removeClass();
    vert.draw();
}
var mouseout = function() {
    var vert = this.vert;
    var canvas = this.canvas;
    vert.config.left.status = 'normal';
    vert.config.right.status = 'normal';
    vert.config.middle.status = 'normal';
    $(canvas).removeClass();
    vert.draw();
};
exports.mouseout = mouseout;
exports.mouseup = mouseup;
exports.mousemove = mousemove;
exports.mousedown = mousedown;
