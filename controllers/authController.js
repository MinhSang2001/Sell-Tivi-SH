import userModel from '../models/userModel.js'
import orderModel from '../models/orderModel.js'

import { comparePassword, hashPassword } from '../helpers/authHelper.js';
import JWT from 'jsonwebtoken'
import productModel from '../models/productModel.js';

export const registerController = async (req, res) => {
    try {
        const {name, email, phone, address, answer, password } = req.body
        // validations
        if(!name) {
            return res.send({error: 'Không được để trống tên'})
        }
        if(!email) {
            return res.send({error: 'Không được để trống email'})
        }
        if(!phone) {
            return res.send({error: 'Không được để trống số điện thoại'})
        }
        if(!address) {
            return res.send({error: 'Không được để trống địa chỉ'})
        }
        if(!answer) {
            return res.send({error: 'Không được để trống câu hỏi'})
        }
        if(!password) {
            return res.send({error: 'Không được để trống mật khẩu'})
        }
        

        // check user
        const exisitingUser = await userModel.findOne({email})
        
        // existing user
        if(exisitingUser) {
            return res.status(200).send({
                success: false,
                message: 'Đã tồn tại tài khoản này'
            })
        }

        // register user
        const hashedPassword = await hashPassword(password)
        //save
        const user = await new userModel({
            name,
            email,
            phone,
            address,
            answer,
            password: hashedPassword
        }).save()

        res.status(201).send({
            success: true,
            message: 'Đăng ký thành công',
            user
        })

    } catch (error) {
        console.log(error)
        res.status(500).send ({
            success:false,
            message: 'Có lỗi trong phần đăng ký',
            error
        })
    }
};

// Post login
export const loginController = async (req, res) => {
    try {
        const {email, password} = req.body
        // validation
        if(!email || !password) {
            return res.status(404).send({
                success: false,
                message: 'Email hoặc mật khẩu không hợp lệ'
            })
        }
        // check user
        const user = await userModel.findOne({email})
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'Email không tồn tại'
            })
        }
        const match = await comparePassword(password, user.password)
        if (!match) {
            return res.status(200).send({
                success: false,
                message: 'Mật khẩu không hợp lệ'
            })  
        }
        //token
        const token = await JWT.sign({
            _id:user._id
        }, process.env.JWT_SECRET, {expiresIn: "7d"})
        res.status(200).send({
            success: true,
            message: 'Đăng nhập thành công',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
            },
            token,
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Có lỗi xảy ra',
            error
        })
    }
}

// forgotPasswordController
export const forgotPasswordController = async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body
        if (!email) {
            res.status(400).send({ message: 'Email không được bỏ trống '})
        }
        if (!answer) {
            res.status(400).send({ message: 'Câu hỏi không được bỏ trống '})
        }
        if (!newPassword) {
            res.status(400).send({ message: 'Mật khẩu không được bỏ trống '})
        }
        //check 
        const user = await userModel.findOne({ email, answer })
        // validation
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'Sai email hoặc câu hỏi'
            })
        }
        const hashed = await hashPassword(newPassword)
        await userModel.findByIdAndUpdate(user._id, { password: hashed })
        res.status(200).send({
            success: true,
            message: 'Đặt lại mật khẩu thành công'
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Có lỗi xảy ra',
            error
        })
    }
}

// test controller
export const testController = (req, res) => {
    try {
        res.send("Protected Routes");
    } catch (error) {
        console.log(error);
        res.send({ error })
    }
}

export const userController = async (req, res) => {
    try {
        const user = await userModel
        .find({})
        .sort({ createdAt: -1 })
        res.status(200).send({
            success: true, 
            message: 'Toàn bộ sản phẩm',
            user,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Có lỗi xảy ra',
            error: error.message
        })
    }
}

export const userDeleteController = async (req, res) => {
    try{
        const user = await userModel.findByIdAndDelete(req.params.id)
        res.status(200).send({
            success: true,
            message: "Xóa sản phẩm thành công",
            user
        })
    }
    catch(error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Có lỗi xảy ra",
            error
        })
    }
}

// profile update 
export const updateProfileController = async (req, res) => {
    try {
        const { name, email, password, address, phone } = req.body;
        const user = await userModel.findById(req.user._id);;
        // password
        if(password && password.length < 6) {
            return res.json({error: "Mật khẩu cần dài hơn 6 kí tự"})
        }
        const hashedPassword = password ? await hashPassword(password) : undefined
        const updatedUser = await userModel.findByIdAndUpdate(req.user._id, {
            name: name || user.name,
            password: hashedPassword || user.password,
            phone: phone || user.phone,
            address: address || user.address
        }, {new: true})
        res.status(200).send({
            success: true,
            message: "Cập nhật thông tin thành công",
            updatedUser
        })
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Có lỗi xảy ra",
            error
        })
    }
}

export const createOrderController = async (req, res) => {
    try {
        const { products, total, buyer } = req.body;
  
        // Check if products exist
        const productsExist = await Promise.all(
          products.map(async (item) => {
            const product = await productModel.findById(item.product);
            return {
              _id: product._id,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
              photo: product.photo
            };
          })
        );
  
        // Calculate total price
        const totalPrice = productsExist.reduce((acc, curr) => {
          return acc + curr.price * curr.quantity;
        }, 0);
  
        if (total !== totalPrice) {
          return res.status(400).json({ error: 'Total price does not match' });
        }
  
        // Create the order
        const newOrder = new orderModel({
          products: productsExist,
          total,
          buyer,
        });
  
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}

export const updateStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        // Cập nhật status của đơn hàng
        const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });

        if (status === "Đã Nhận Được Hàng") {
            for (const productInfo of updatedOrder.products) {
                const productId = productInfo._id; // Lấy ID sản phẩm từ đơn hàng

                // Lấy sản phẩm từ database bằng ID
                const product = await productModel.findById(productId);

                if (product) {
                    // Lấy số lượng đã đặt từ sản phẩm trong đơn hàng
                    const orderedQuantity = productInfo.quantity;

                    // Trừ số lượng đã đặt từ tổng số lượng sản phẩm
                    product.quantity -= orderedQuantity;

                    // Lưu thay đổi vào database
                    await product.save();
                }
            }
        }


        res.json(updatedOrder);      
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Có lỗi xảy ra",
            error
        })
    }
}
    
export const getAllOrdersController =  async (req, res) => {
    try {
        const orders = await orderModel
          .find({})
          .populate({
            path: 'products._id', // Assuming '_id' is the field referencing the product
            model: 'Products', // Replace with your actual model name for products
            select: 'name slug description price category quantity shipping', // Specify fields to retrieve
          })
          .populate("buyer", "name")
          .sort({createdAt: -1});
        res.json(orders);
      } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          message: "Có lỗi xảy ra",
          error,
        });
      }
}
    
export const getOrderDetailsController = async (req, res) => {
    try {
        const order = await orderModel
            .find({ buyer: req.user._id })
            .populate({
                path: 'products._id', // Assuming '_id' is the field referencing the product
                model: 'Products', // Replace with your actual model name for products
                select: 'name slug description price category quantity shipping', // Specify fields to retrieve
              })
            .populate("buyer", "name")
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
    
export const deleteOrderController = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const deletedOrder = await orderModel.findByIdAndDelete(orderId);
        
        if (deletedOrder) {
            res.status(200).json({
                success: true,
                message: 'Đã xóa order thành công',
                deletedOrder,
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy order để xóa',
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xóa order',
            error: error.message,
        });
    }
};