import productModel from "../models/productModel.js"
import categoryModel from "../models/categoryModel.js"
import orderModel from "../models/orderModel.js"

import slugify from "slugify"
import fs from "fs"
import braintree from 'braintree'
import dotenv from "dotenv"

dotenv.config();

var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: "wxd35kv7k6f34dzq",
    publicKey: "r3sbywwyynfhq2tw",
    privateKey: "95f1007234d9b2047c1b5cd199be456b",
  });

export const createProductController = async (req, res) => {
    try {
        const {name, slug, description, price, category, quantity, shipping} = req.fields
        const {photo} = req.files
        // alidation
        switch (true) {
            case !name:
                return res.status(500).send({error: 'Không được để trống tên sản phẩm'})
            case !description:
                return res.status(500).send({error: 'Không được để trống mô tả'})
            case !price:
                return res.status(500).send({error: 'Không được để trống giá cả'})
            case !category:
                return res.status(500).send({error: 'Không được để trống danh mục'})
            case !quantity:
                return res.status(500).send({error: 'Không được để trống số lượng'})
            case photo && photo.size > 5000000:
                return res.status(500).send({error: 'Không được để trống ảnh sản phẩm và phải ít hơn 5mb'})
        }
        const products = new productModel({...req.fields, slug: slugify(name)})

        if (photo) {
            products.photo.data = fs.readFileSync(photo.path)
            products.photo.contentType = photo.type
        }
        await products.save()
        res.status(201).send({
            success: true,
            message: "Thêm thành công",
            products
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: 'Lỗi khi tạo sản phẩm'
        })
    }
}

export const getProductController = async (req, res) => {
    try {
        const products = await productModel
        .find({})
        .populate('category')
        .select("-photo")
        .sort({ createdAt: -1 })
        res.status(200).send({
            success: true, 
            countTotal: products.length,
            message: 'Toàn bộ sản phẩm',
            products,
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

// get single product
export const singleProductController = async (req, res) => {
    try {
        const product = await productModel
        .findOne({ slug: req.params.slug })
        .select("-photo")
        .populate("category")
        res.status(200).send({
            success: true,
            message: 'Thông tin sản phẩm',
            product
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

// get photo
export const productPhotoController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid).select("photo")
        if(product.photo.data) {
            res.set('Content-type', product.photo.contentType)
            return res.status(200).send(product.photo.data)
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Có lỗi xảy ra",
            error
        })
    }
}

// delete controller
export const deleteProductController = async (req, res) => {
    try{
        const product = await productModel.findByIdAndDelete(req.params.pid).select("-photo")
        res.status(200).send({
            success: true,
            message: "Xóa sản phẩm thành công",
            product
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

// update product
export const updateProductController = async (req, res) => {
    try {
        const {name, slug, description, price, category, quantity, shipping} = req.fields
        const {photo} = req.files
        // alidation
        switch (true) {
            case !name:
                return res.status(500).send({error: 'Không được để trống tên sản phẩm'})
            case !description:
                return res.status(500).send({error: 'Không được để trống mô tả'})
            case !price:
                return res.status(500).send({error: 'Không được để trống giá cả'})
            case !category:
                return res.status(500).send({error: 'Không được để trống danh mục'})
            case !quantity:
                return res.status(500).send({error: 'Không được để trống số lượng'})
            case photo && photo.size > 1000000:
                return res.status(500).send({error: 'Không được để trống ảnh sản phẩm và phải ít hơn 1mb'})
        }
        const products = await productModel.findByIdAndUpdate(req.params.pid,
            {...req.fields, slug: slugify(name)},
            { new: true }
            )
        if (photo) {
            products.photo.data = fs.readFileSync(photo.path)
            products.photo.contentType = photo.type
        }
        await products.save()
        res.status(201).send({
            success: true,
            message: "Sửa thành công",
            products
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: 'Lỗi khi sửa sản phẩm'
        })
    }
}

// filter product
export const productFiltersController = async (req, res) => {
    try {
        const { checked, radio } = req.body
        let args = {}
        if (checked.length > 0) args.category = checked 
        if (radio.length) args.price = {$gte: radio[0], $lte: radio[1]}
        const products = await productModel.find(args)
        res.status(200).send({
            success: true,
            products,
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Có lỗi xảy ra',
            error
        })
    }
}

// filter product by price
export const productFiltersPriceController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({slug: req.params.slug})
        const { radio } = req.body
        let args = {}
        if (radio.length) {
            args.price = {$gte: radio[0], $lte: radio[1]}
            args.category = category._id; // add the category filter
        }
        const products = await productModel.find(args).populate({
            path: 'category',
            select: 'name' 
        })
        res.status(200).send({
            success: true,
            products,
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Có lỗi xảy ra',
            error
        })
    }
}

export const productCountController = async (req, res) => {
    try {
      const total = await productModel.find({}).estimatedDocumentCount()
      res.status(200).send({
        success: true,
        total,

      })  
    } catch (error) {
        console.log(error)
        res.status(400).send({
            message: "Có lỗi xảy ra",
            error,
            success: false
        })
    }
}

// product list base on page
export const productListController = async (req, res) => {
    try {
        const perPage = 6
        const page = req.params.page? req.params.page : 1 
        const products = await productModel
            .find({})
            .select("-photo")
            .skip((page-1) * perPage)
            .limit(perPage)
            .sort({createdAt: -1});
        res.status(200).send({
            success: true,
            products
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Có lỗi xảy ra',
            error
        })
    }
}

export const productNewController = async (req, res) => {
    try {
        const perPage = 8
        const page = req.params.page? req.params.page : 1 
        const products = await productModel
            .find({})
            .select("-photo")
            .skip((page-1) * perPage)
            .limit(perPage)
            .sort({createdAt: -1});
        res.status(200).send({
            success: true,
            products
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Có lỗi xảy ra',
            error
        })
    }
}

// search product
export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params
        const results = await productModel.find({
            $or: [
                { name: {$regex: keyword, $options: "i"}},
                { description: {$regex: keyword, $options: "i"}},
            ]
        })
        .select("-photo");
        res.json(results);
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Có lỗi xảy ra',
            error
        })
    }
}

// similar product
export const realtedProductController = async (req, res) => {
    try {
        const {pid, cid} = req.params
        const products = await productModel.find({
            category: cid,
            _id: {$ne: pid}
        }).select("-photo").limit(4).populate("category")
        res.status(200).send({
            success: true,
            products,
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: "Có lỗi xảy ra",
            error
        })
    }
}

// get product by category id
export const productByCategoryController = async (req, res, next) => {
    let categoryId = req.params.category
    let limit = 4
    try {
        let products = await productModel.find({
            limit: limit,
            where: {
                category: categoryId
            }
        }).select("-photo")
        .sort({createdAt: -1});

        res.status(200).json({
            success: true,
            products
        })
    } catch (e) {
        console.log(e)
        res.status(500)
    }
}

// get product by category 
export const productCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({slug: req.params.slug})
        const product = await productModel.find({category}).populate('category')
        res.status(200).send({
            success: true,
            category,
            product
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            error,
            message: 'Có lỗi xảy ra'
        })
    }
}

// payment gateway api
export const braintreeTokenController = async (req, res) => {
    try {
        gateway.clientToken.generate({}, function (err, response) {
            if (err) {
                res.status(500).send(err)
            } else {
                res.send(response)
            }
        })
    } catch (error) {
        console.log(error)
    }
}

// payment 
export const braintreePaymentController = async (req, res) => {
    try {
        const {cart, nonce} = req.body
        let total = 0
        cart.map((i) => {
            total += i.price
        })
        let newTransaction = gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true
            }
        },
        function(error, result) {
            if (result) {
                const order = new orderModel({
                    products: cart,
                    payment: result,
                    buyer: req.user._id 
                }).save()
                res.json({ok:true})
            } else {
                res.status(500).send(error)
            }
        }
        )
    } catch (error) {
        console.log(error)
    }
}

