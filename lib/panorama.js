var Panorama = function(params) {
    var canvas = params.canvas;
    var ctx = canvas.getContext('2d');
    var loaded_data = undefined;

    this.onchange = undefined;
    this.displayfn = undefined;
    this.addfn = undefined;
    this.getLoadedData = function() {
        console.log("GetLoaded: "  + loaded_data);
        return loaded_data
    }
    this.load = function(data,fn) {
        loaded_data = data;
        this.displayfn = fn;
        this.displayfn(canvas,data);
    };
    this.displayaddfn = undefined;
    this.add = function(data) {
        if (this.panorama.displayaddfn !== undefined) {
            this.panorama.displayaddfn(loaded_data,data);
        }
        loaded_data = this.panorama.addfn(loaded_data,data);
    };
};
exports = module.exports = Panorama;
