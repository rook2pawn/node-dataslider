var Selector = function(params) {
    var config = {
        left:{pos:0,status:'normal',width:7},
        right:{pos:46,status:'normal',width:7},
        middle:{status:'normal',startx:undefined,endx:undefined}
    };
    if (params === undefined)
        var params = {}
    var canvas = params.canvas;
    var ctx = canvas.getContext('2d');
    this.hash = {};
    this.cb = undefined;
    this.setImages = function(images) {
        var that = this;
        images.forEach(function(img) {
            this.hash[img.name] = img;
        },that);
    }
    this.setCanvas = function(obj) {
        canvas = obj;
    };
    this.setCtx = function(obj) {
        ctx = obj;
    };
    this.isMiddle = function(x) {
        return ((x > (config.left.pos - Math.floor(config.left.width/2) + config.left.width + 1)) && (x+1 < config.right.pos - Math.floor(config.right.width/2)))
    };
    this.isLeft = function(x) {
        return ((x >= config.left.pos - Math.floor(config.left.width/2)) && (x < (config.left.pos -Math.floor(config.left.width/2) +config.left.width)))
    };
    this.isRight = function(x) {
        return ((x>= config.right.pos - Math.floor(config.right.width/2)) && (x< (config.right.pos - Math.floor(config.right.width/2) +config.right.width)))
    };
    this.draw = function() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        // draggable area rectangle first between posts
        ctx.fillStyle='rgba(211,255,255,0.5)';
        ctx.fillRect(config.left.pos,0,(config.right.pos - config.left.pos),canvas.height);
        ctx.fill();
        var offset_left = Math.floor(config.left.width / 2);
        var offset_right = Math.floor(config.right.width / 2);
        switch (config.left.status) {
            case 'normal':
            ctx.drawImage(this.hash['selector_left.png'],config.left.pos-offset_left,0,7,46);
            break;
            case 'hover':
            ctx.drawImage(this.hash['selector_left_hover.png'],config.left.pos-offset_left,0,7,46);
            break;
            case 'down':
            ctx.drawImage(this.hash['selector_left_down.png'],config.left.pos-offset_left,0,7,46);
            break;
            default:
            break;
        }
        switch (config.right.status) {
            case 'normal':
            ctx.drawImage(this.hash['selector_right.png'],config.right.pos-offset_right,0,7,46);
            break;
            case 'hover':
            ctx.drawImage(this.hash['selector_right_hover.png'],config.right.pos-offset_right,0,7,46);
            break;
            case 'down':
            ctx.drawImage(this.hash['selector_right_down.png'],config.right.pos-offset_right,0,7,46);
            break;
            default:
            break;
        }
    }; 
    this.setLeft = function(newleft) {
        config.left.pos = newleft;
    };
    this.config = config;
    this.action = function(type, data) {
        switch (type) {
            case 'drag':
                if (this.cb !== undefined) {
                    this.cb({type:type,pos:data});
                }
            break;
            case 'resize':
                if (this.cb !== undefined) {
                    this.cb({type:type,pos:data});
                }
            break;
            default: 
            break;
        } 
    };
};
exports = module.exports = Selector;
