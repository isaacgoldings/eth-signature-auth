const mongoose = require('mongoose');

const DocumentSchema = mongoose.Schema({
    // title: {
    //     type: String,
    //     required: true
    // },
    // description: {
    //     type: String,
    //     required: true
    // },
    // signatory: {
    //     type: String,
    //     immutable: true
    // }, 
    // date: {
    //     type: Date,
    //     default: Date.now
    // }
    user_name: String,
    email: String,
    hasBeenSigned: Boolean,
    isMultiUpload: Boolean,
    size: Number,
    filename: String,
    date: Number,
    recipient: String,
    
});

module.exports = mongoose.model('Documents', DocumentSchema);