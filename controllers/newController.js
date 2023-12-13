import slugify from 'slugify'

import fs from "fs"
import newsModel from "../models/newsModel.js"

export const createNewController = async (req, res) => {
    try {
        const { title, slug, detail } = req.fields
        const {photo} = req.files
        switch (true) {
            case !title:
                return res.status(500).send({error: 'Không được để trống tên tiêu đề'})
            case !detail:
                return res.status(500).send({error: 'Không được để trống chi tiết'})
            case photo && photo.size > 1000000:
                return res.status(500).send({error: 'Không được để trống ảnh sản phẩm và phải ít hơn 1mb'})
        }
        
        const news = new newsModel({...req.fields, slug: slugify(title)})

        if (photo) {
            news.photo.data = fs.readFileSync(photo.path)
            news.photo.contentType = photo.type
        }
        await news.save()
        res.status(201).send({
            success: true,
            message: 'Đã tạo tin tức mới',
            news
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false, 
            error,
            message: 'Lỗi trong phần tin tức'
        })
    }
}

export const getNewController = async (req, res) => {
    try {
        const news = await newsModel.find({})
        .select("-photo")
        .sort({ createdAt: -1 })
        res.status(200).send({
            success: true,
            message: 'Toàn bộ tin tức',
            news
        })
    } catch (error) {
        console.error(error)
        res.status(500).send({
            success: false,
            error,
            message: 'Lỗi khi lấy toàn bộ'
        })
    }
}

export const getSomeNewController = async (req, res) => {
    try {
        const news = await newsModel.find({})
        .select("-photo")
        .sort({ createdAt: -1 })
        .limit(5)
        res.status(200).send({
            success: true,
            message: 'Toàn bộ tin tức',
            news
        })
    } catch (error) {
        console.error(error)
        res.status(500).send({
            success: false,
            error,
            message: 'Lỗi khi lấy toàn bộ'
        })
    }
}

export const updateNewController = async (req, res) => {
    try {
        const { title, slug, detail } = req.fields;

        // Validation
        switch (true) {
            case !title:
                return res.status(500).send({ error: 'Không được để trống tên tiêu đề' });
            case !detail:
                return res.status(500).send({ error: 'Không được để trống chi tiết' });
        }

        let news = await newsModel.findByIdAndUpdate(
            req.params.pid,
            { ...req.fields, slug: slugify(title) },
            { new: true }
        );

        if (req.files && req.files.photo && req.files.photo.size) {
            const { photo } = req.files;
            news.photo.data = fs.readFileSync(photo.path);
            news.photo.contentType = photo.type;
        }

        await news.save();

        res.status(201).send({
            success: true,
            message: 'Sửa thành công',
            news,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Lỗi khi sửa danh mục',
        });
    }
}

export const newPhotoController = async (req, res) => {
    try {
        const news = await newsModel.findById(req.params.pid).select("photo")
        if(news.photo.data) {
            res.set('Content-type', news.photo.contentType)
            return res.status(200).send(news.photo.data)
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

export const singleNewController = async (req, res) => {
    try {
        const news = await newsModel.findOne({ slug: req.params.slug})
        res.status(200).send({
            success: true,
            message: 'Đã tìm thấy tin tức',
            news
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

export const deleteNewController = async (req, res) => { 
    try {
        const { id } = req.params
        await newsModel.findByIdAndDelete(id)
        res.status(200).send({
            success: true,
            message: "Xóa thành công"
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