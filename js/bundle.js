(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    
    require.define = function (filename, fn) {
        if (require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};
});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process){var process = module.exports = {};

process.nextTick = (function () {
    var queue = [];
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;
    
    if (canPost) {
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);
    }
    
    return function (fn) {
        if (canPost) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        }
        else setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();
});

require.define("vm",function(require,module,exports,__dirname,__filename,process){module.exports = require("vm-browserify")});

require.define("/node_modules/vm-browserify/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("/node_modules/vm-browserify/index.js",function(require,module,exports,__dirname,__filename,process){var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInNewContext = function (context) {
    if (!context) context = {};
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
     
    if (!win.eval && win.execScript) {
        // win.eval() magically appears when this is called in IE:
        win.execScript('null');
    }
    
    var res = win.eval(this.code);
    
    forEach(Object_keys(win), function (key) {
        context[key] = win[key];
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInContext = function (context) {
    // seems to be just runInNewContext on magical context objects which are
    // otherwise indistinguishable from objects except plain old objects
    // for the parameter segfaults node
    return this.runInNewContext(context);
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    // not really sure what this one does
    // seems to just make a shallow copy
    var copy = {};
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};
});

require.define("/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("/index.js",function(require,module,exports,__dirname,__filename,process){var mouselib = require('./lib/mouselib');
var Panorama = require('./lib/panorama');
var Selector = require('./lib/selector');

var DataSlider = function(params) {

    if (params === undefined)
        var params = {}
    var canvas = undefined;
    var selector_canvas = undefined;
    var ctx = undefined;
    var vert = undefined;
    var panorama = undefined;
    var images = undefined;
    var loaded_data = undefined;
    var panoramacb = undefined;

    var createSelector = function(canvas) {
        vert = new Selector({canvas:canvas});
        vert.cb = function(params) {
            panorama.selectchange(params,loaded_data);
        }
    };
    var createPanorama = function(canvas) {
        if (panorama === undefined) 
        panorama = new Panorama({canvas:canvas});
    };
    var setMouse = function(selector,canvas) {
        $(canvas).mousemove(mouselib.mousemove.bind({vert:selector,canvas:canvas}));
        $(canvas).mousedown(mouselib.mousedown.bind({vert:selector,canvas:canvas}));
        $(canvas).mouseup(mouselib.mouseup.bind({vert:selector,canvas:canvas}));
        $(canvas).mouseout(mouselib.mouseout.bind({vert:selector,canvas:canvas}));
    };
    var wrapDiv = function(canvas) {
        var wrappingDiv = document.createElement('div');
        $(wrappingDiv).css('position','relative').css('width',canvas.width).css('height',canvas.height);
        wrappingDiv.id = 'dataslider_div';
        wrappingDiv.height = canvas.height;
        $(canvas).wrap(wrappingDiv);
    };
    this.to = function(obj) {
        canvas = obj;
        $(canvas).css('position','absolute');
        canvas.onselectstart = function(){ return false; }
        ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height);
        wrapDiv(canvas);

        selector_canvas = document.createElement('canvas');
        $(selector_canvas).css('position','absolute');
        selector_canvas.width = canvas.width; selector_canvas.height = canvas.height;
        $(canvas).after(selector_canvas);
        createSelector(selector_canvas);
        setMouse(vert,selector_canvas);
        createPanorama(canvas);
        panorama.selectchange = panoramacb;
    }
    this.setImages = function(obj) {
        images = obj;
        if (vert !== undefined) {
            vert.setImages(images);
            vert.draw();
        }
    };
    var isDrag = false;
    this.load = function (data,displayfn) {
        loaded_data = data;
        panorama.load(data,displayfn);
    }
    this.listen = function() {
    }
    this.onchange = function(cb) {
        // this way we can call onchange either before or after this.to creates panorama
        // for before
        panoramacb = cb;
        // for after
        if ((panorama !== undefined) && (panorama.selectchange === undefined)) {
            panorama.selectchange = cb;
        }
    }
    this.draw = function() {
        panorama.selectchange({data:{left:0,right:46}},loaded_data);
    };
};

exports = module.exports = DataSlider;
});

require.define("/lib/mouselib.js",function(require,module,exports,__dirname,__filename,process){var mousemove = function(ev) {
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
});

require.define("/lib/panorama.js",function(require,module,exports,__dirname,__filename,process){var Panorama = function(params) {
    var canvas = params.canvas;
    var ctx = canvas.getContext('2d');
    var loaded_data = undefined;
    this.load = function(data,display) {
        loaded_data = data;
        display(canvas,data);
    };
    this.selectchange = undefined;
};
exports = module.exports = Panorama;
});

require.define("/lib/selector.js",function(require,module,exports,__dirname,__filename,process){var Selector = function(params) {
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
        return ((x > (config.left.pos + config.left.width + 1)) && ((x+1) < config.right.pos))
    };
    this.isLeft = function(x) {
        return ((x >= config.left.pos) && (x < (config.left.pos+config.left.width)))
    };
    this.isRight = function(x) {
        return ((x>= config.right.pos) && (x< (config.right.pos+config.right.width)))
    };
    this.draw = function() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        // drag inside rect first
        ctx.fillStyle='rgba(211,255,255,0.5)';
        var x0 = Math.floor(config.left.pos+(config.left.width/2));
        var x1 = Math.floor(config.right.pos+(config.right.width/2));
        ctx.fillRect(x0,0,(config.right.pos - config.left.pos),canvas.height);
        ctx.fill();
        switch (config.left.status) {
            case 'normal':
            ctx.drawImage(this.hash['selector_left.png'],config.left.pos,0,7,46);
            break;
            case 'hover':
            ctx.drawImage(this.hash['selector_left_hover.png'],config.left.pos,0,7,46);
            break;
            case 'down':
            ctx.drawImage(this.hash['selector_left_down.png'],config.left.pos,0,7,46);
            break;
            default:
            break;
        }
        switch (config.right.status) {
            case 'normal':
            ctx.drawImage(this.hash['selector_right.png'],config.right.pos,0,7,46);
            break;
            case 'hover':
            ctx.drawImage(this.hash['selector_right_hover.png'],config.right.pos,0,7,46);
            break;
            case 'down':
            ctx.drawImage(this.hash['selector_right_down.png'],config.right.pos,0,7,46);
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
                    this.cb({type:type,data:data});
                }
            break;
            case 'resize':
                if (this.cb !== undefined) {
                    this.cb({type:type,data:data});
                }
            break;
            default: 
            break;
        } 
    };
};
exports = module.exports = Selector;
});

require.define("/node_modules/imagepreloader/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("/node_modules/imagepreloader/index.js",function(require,module,exports,__dirname,__filename,process){;(function (exports) {
    var ImageSet = function(params) {
        if (params === undefined) 
            params = {}
        var list = params.obj || [];
        var success = params.fn || undefined;
        var error = params.fn2 || undefined;
        var count = 0;
        if (params.Image !== undefined)
            Image = params.Image;
        var myimages = [];
        this.add = function(src) {
            list.push(src);
            return this
        }
        this.success = function(fn) {
            success = fn;
            return this
        }
        this.error = function(fn) {
            error = fn;
            return this
        }
        this.loaded = function() {
            count++;
            if (count === list.length) {
                success(myimages);
            }
        };
        this.done = function() {
            if (success !== undefined)
                list.forEach(function(src) {
                    var that = this;
                    var img = new Image();
                    img.onerror = function() {
                        if (error !== undefined) error("image load error!");
                    };
                    img.onabort = function() {
                        if (error !== undefined) error("image load abort!");
                    };
                    img.onload = function() {
                        that.loaded();
                    };
                    img.src = src;
                    img.name = src.slice(src.lastIndexOf('/')+1);
                    myimages.push(img);
                },this);
        };
    };
    if (exports.Window !== undefined) {
        exports.Preloader = ImageSet;
    } else if ((module !== undefined) && (module.exports !== undefined)) {
        exports = module.exports = ImageSet;
    }
})(typeof exports === 'undefined' ?  this : exports)
});

require.define("/start.js",function(require,module,exports,__dirname,__filename,process){var DataSlider = require('../');
var Preloader = require('imagepreloader');

$(window).ready(function() {
    var focus = document.getElementById('focus');
    var focusctx = focus.getContext('2d');
    var canvas = document.getElementById('mycanvas');
    var ctx = canvas.getContext('2d');
    var dataslider = new DataSlider;
    var basesize = 48;
    dataslider.to(canvas);
    dataslider.onchange(function(params,data) {
        console.log(arguments);
        var ctx = focusctx;
        ctx.clearRect(0,0,focus.width,focus.height);
        ctx.strokeRect(0,0,focus.width,focus.height);
        ctx.fillStyle = '#000000';
        var width = params.data.right - params.data.left;
        var factor = focus.width / width;
        var size = basesize * factor;
        ctx.font = size + "px Courier";
        console.log("width:" + width + " factor:" + factor);
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
    dataslider.draw();
//    dataslider.listen(newdatasource)
});
});
require("/start.js");
})();
