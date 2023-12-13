import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    products: [
      {
        product: {
          type: mongoose.ObjectId,
          ref: "Products",
        },
        quantity: {
          type: Number,
        }
      }
    ],
    total: {
      type: Number
    },
    buyer: {
        type: mongoose.ObjectId,
        ref: "users"
    },
    status: {
        type: String,
        default: "Chưa Xử Lý",
        enum: ["Chưa Xử Lý", "Đang Chuẩn Bị", "Đang Giao Hàng", "Đã Nhận Được Hàng", "Đã Hủy"],
    }
}, {timestamps: true})



export default mongoose.model('Order', orderSchema)