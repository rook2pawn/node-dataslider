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
// getIndicesByTimestamp
exports.getIndicesByTimestamp = function(data,boundaries) {
    var l_index = undefined;
    var r_index = undefined;
    for (var i= 0; i < data.length; i++) {
        if ((data[i].date >= boundaries.left) && (l_index === undefined)) {
            l_index = i;
        }     
        if ((data[i].date >= boundaries.right) && (r_index === undefined)) {
            r_index = i-1;
            break;
        }
    }
    return {left:l_index,right:r_index}
}
// getIndicesByDisplayX 
exports.getIndices = function(data,pos) {
    $('#status').html("left:" + pos.left.pos + " right:" + pos.right.pos);
    var l_ms = undefined;
    var r_ms = undefined;
    for (var i= 0; i < data.length; i++) {
        if ((data[i].x >= pos.left.pos) && (l_ms === undefined)) {
            l_ms = data[i].date;
        }     
        if ((data[i].x >=pos.right.pos) && (r_ms === undefined)) {
            r_ms = data[i-1].date;
            break;
        }
    }
    return {left:l_ms,right:r_ms}
}
exports.getDateString = function(ms) {
    var date = new Date(ms);

    var pad = function(str) {
        if (str.length == 1) 
            return '0'.concat(str)
        if (str.length === 0) 
            return '00'
        else 
            return str
    };  
    var hours = date.getHours() % 12;
    if (hours === 0) 
        hours = '12';
    var seconds = pad(date.getSeconds());
    var minutes = pad(date.getMinutes());
    var meridian = date.getHours() >= 12 ? 'pm' : 'am';
    return hours +':'.concat(minutes) + ':'.concat(seconds) + meridian;
};
