const mongoose = require('mongoose')
const Schema   = mongoose.Schema

const ImageSchema = new Schema({
    uuid: String,
    cdnUrl: String,
    created: {
        type: Date,
        default: Date.now
    }
})

module.exports = ImageSchema