var Panorama = function(params) {
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
