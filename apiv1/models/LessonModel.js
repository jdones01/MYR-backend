let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let LessonSchema = new Schema({
	'name': { type: String, required: true },
	'prompt': String,
	'code': { type: String, required: true },
	'categories': Array
});

module.exports = mongoose.model('Lesson', LessonSchema);
