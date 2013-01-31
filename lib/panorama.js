var Panorama = function(params) {
    var canvas = params.canvas;
    var ctx = canvas.getContext('2d');
    var loaded_data = undefined;

    this.onchange = undefined;
    this.displayfn = undefined;
    this.addfn = undefined;
    this.getLoadedData = function() {
        return loaded_data
    }
    this.load = function(data,fn) {
        loaded_data = data;
        this.displayfn = fn;
        this.displayfn(canvas,data);
    }
    this.displayaddfn = undefined;
    this.add = function(data) {
        var result = this.panorama.addfn(loaded_data,data);
        if ((result !== undefined) || (result !== false)) {
            loaded_data = result
            if (this.panorama.displayaddfn !== undefined) {
                this.panorama.displayaddfn(canvas,loaded_data,data);
            }
        }
    }
    this.thin = function() {
        var thinned = [];
        thinned.push(loaded_data[0]);
        for (var i = 1; i < loaded_data.length -1; i++) {
            if (i % 2 === 0) 
            thinned.push(loaded_data[i]);
        }
        thinned.push(loaded_data[loaded_data.length - 1]);
        loaded_data = thinned;
    }
};
exports = module.exports = Panorama;
