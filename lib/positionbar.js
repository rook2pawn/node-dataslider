var PositionBar = function(params) {
    var canvas = params.canvas;
    var ctx = canvas.getContext('2d');
    var selector = params.selector;
    var lineargradient = ctx.createLinearGradient(0,0,0,17);
    lineargradient.addColorStop(0,'#CCC');
    lineargradient.addColorStop(1,'white');

    var state = 'pause_light.png';
    this.hash = {};
    var mousedown = function(ev) {
        var offset = $(canvas).offset();
        var x = ev.pageX - offset.left;
        var y = ev.pageY - offset.top;
        var oldstate = state;
        if ((x >= 2) && (x <= 18)) {
            if (state !== 'play.png') 
                state = 'play.png';
            else 
                state = 'pause.png'
        }
        if (oldstate !== state) {
            ctx.clearRect(2,2,16,16);
            ctx.drawImage(this.hash[state],2,2,16,16);
        }
    }
    var mousemove = function(ev) {
        var offset = $(canvas).offset();
        var x = ev.pageX - offset.left;
        var y = ev.pageY - offset.top;
        var oldstate = state;
        if ((state == 'play.png') || (state == 'play_light.png')) {
            if ((x >= 2) && (x <= 18)) {
                state = 'play.png';
            } else
                state = 'play_light.png';
            if (oldstate !== state) {
                ctx.clearRect(2,2,16,16);
                ctx.drawImage(this.hash[state],2,2,16,16);
            }
            return
        }
        if ((x >= 2) && (x <= 18)) {
            state = 'pause.png';
        } else {
            state = 'pause_light.png';
        }
        if (oldstate !== state) {
            ctx.clearRect(2,2,16,16);
            ctx.drawImage(this.hash[state],2,2,16,16);
        }
    }
    $(canvas).mousemove(mousemove.bind(this));
    $(canvas).mousedown(mousedown.bind(this));
    this.setImages = function(images) {
        var that = this;
        images.forEach(function(img) {
            this.hash[img.name] = img;
        },that);
    }
    var getCenter = function() {
        var config  = selector.config;
        var left = config.left.pos;
        var right = config.right.pos;
        if ((left !== undefined) && (right !== undefined))
            return Math.round((left + right) / 2)
    }

    this.draw = function() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        var center = getCenter();
        var x = center - (this.hash['positionbar.png'].width / 2);
        ctx.fillStyle = lineargradient;
        ctx.fillRect(0,0,canvas.width,17);
        ctx.clearRect(2,2,16,16);
        ctx.drawImage(this.hash['positionbar.png'],x,2);
        ctx.drawImage(this.hash[state],2,2,16,16);
    }; 
};
exports = module.exports = PositionBar;
