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
        for (var i = 0; i < loaded_data.length; i++) {
            // todo: improve
            if (i % 4 != 0) {
                thinned.push(loaded_data[i]);
            }
        }
        loaded_data = thinned;
    }
};
exports = module.exports = Panorama;
