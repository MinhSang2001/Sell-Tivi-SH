import mongoose from 'mongoose'

const newSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    detail: {
        type: String,
        required: true
    },
    photo: {
        data: Buffer,
        contentType: String
    },
}, {timestamps: true})

export default mongoose.model('New', newSchema)