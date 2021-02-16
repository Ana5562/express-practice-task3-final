const mongoose = require('mongoose');
const schema = mongoose.Schema;

const comment = new schema({
    show_id: Number,
    name: String,
    content: String, 
    created_at: Date
});

module.exports = mongoose.model("Comment", comment);