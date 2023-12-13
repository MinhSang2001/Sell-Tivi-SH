import mongoose from 'mongoose'

const sliderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    photo: {
        data: Buffer,
        contentType: String
    },
    status: {
        type: String,
        default: "Không Hoạt Động",
        enum: ["Đang Hoạt Động", "Không Hoạt Động"],
    }
}, {timestamps: true})

export default mongoose.model('Slider', sliderSchema)