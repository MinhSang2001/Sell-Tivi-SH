import categoryModel from "../models/categoryModel.js"
import slugify from 'slugify'

import fs from "fs"

export const createCategoryController = async (req, res) => {
    try {
        const { name, slug } = req.fields
        const {photo} = req.files
        switch (true) {
            case !name:
                return res.status(500).send({error: 'Không được để trống tên danh mục'})
            case photo && photo.size > 1000000:
                return res.status(500).send({error: 'Không được để trống ảnh sản phẩm và phải ít hơn 1mb'})
        }
        
        const existingCategory = await categoryModel.findOne({name})
        if(existingCategory) {
            return res.status(200).send({
                success: true,
                message: 'Danh mục đã tồn tại'
            })
        }
        const products = new categoryModel({...req.fields, slug: slugify(name)})

        if (photo) {
            products.photo.data = fs.readFileSync(photo.path)
            products.photo.contentType = photo.type
        }
        await products.save()
        res.status(201).send({
            success: true,
            message: 'Đã tạo danh mục mới',
            products
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false, 
            error,
            message: 'Lỗi trong phần danh mục'
        })
    }
}

// update category
export const updateCategoryController = async (req, res) => {
    try {
        const { name, slug } = req.fields;

        // Validation
        switch (true) {
            case !name:
                return res.status(500).send({ error: 'Không được để trống tên sản phẩm' });
        }

        let category = await categoryModel.findByIdAndUpdate(
            req.params.pid,
            { ...req.fields, slug: slugify(name) },
            { new: true }
        );

        if (req.files && req.files.photo && req.files.photo.size) {
            const { photo } = req.files;
            category.photo.data = fs.readFileSync(photo.path);
            category.photo.contentType = photo.type;
        }

        await category.save();

        res.status(201).send({
            success: true,
            message: 'Sửa danh mục thành công',
            category,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Lỗi khi sửa danh mục',
        });
    }
};

// get categpry photo
export const categoryPhotoController = async (req, res) => {
    try {
        const category = await categoryModel.findById(req.params.pid).select("photo")
        if(category.photo.data) {
            res.set('Content-type', category.photo.contentType)
            return res.status(200).send(category.photo.data)
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

// get all category
export const categoryController = async (req, res) => {
    try {
        const category = await categoryModel.find({})
        .select("-photo")
        .sort({ createdAt: -1 })
        res.status(200).send({
            success: true,
            message: 'Toàn bộ danh mục',
            category
        })
    } catch (error) {
        console.error(error)
        res.status(500).send({
            success: false,
            error,
            message: 'Lỗi khi lấy toàn bộ danh mục'
        })
    }
}

// get single category
export const singleCategory = async (req, res) => {
    try {
        const category = await categoryModel.findOne({ slug: req.params.slug})
        res.status(200).send({
            success: true,
            message: 'Đã tìm thấy danh mục',
            category
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false, 
            error,
            message: 'Lỗi khi tìm danh mục'
        })
    }
}

// delete category
export const deleteCategoryController = async (req, res) => {
    try {
        const { id } = req.params
        await categoryModel.findByIdAndDelete(id)
        res.status(200).send({
            success: true,
            message: "Xóa danh mục thành công"
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Có lỗi xảy ra khi xóa',
            error
        })
    }
}