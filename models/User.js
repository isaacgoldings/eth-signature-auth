const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    user_name: String,
    email: String
});

module.exports = mongoose.model('Users', UserSchema);