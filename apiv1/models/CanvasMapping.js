let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CanvasMap = new Schema({
    code_socket: String,
    canvas_socket: String,
});

module.exports = mongoose.model('CanvasMapping', CanvasMap);