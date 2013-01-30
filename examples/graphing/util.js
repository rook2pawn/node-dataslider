var Hash = require('hashish');
exports.rangeY = function(list,specialkey) {
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
