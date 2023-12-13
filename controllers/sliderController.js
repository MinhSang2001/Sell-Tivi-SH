import sliderModel from "../models/sliderModel.js"

import fs from "fs"

export const createSliderController = async (req, res) => {
    try {
        const {name, status} = req.fields
        const {photo} = req.files
        // alidation
        switch (true) {
            case !name:
                return res.status(500).send({error: 'Không được để trống tên quảng cáo'})
            case photo && photo.size > 1000000:
                return res.status(500).send({error: 'Không được để trống ảnh quảng cáo và phải ít hơn 1mb'})
        }

        const sliders = new sliderModel({...req.fields})

        if (photo) {
            sliders.photo.data = fs.readFileSync(photo.path)
            sliders.photo.contentType = photo.type
        }
        await sliders.save()
        res.status(201).send({
            success: true,
            message: "Thêm thành công",
            sliders
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

export const sliderStatusController = async (req, res) => {
    try {
        const { sliderId } = req.params;
        const { status } = req.body;
        const slider = await sliderModel.findByIdAndUpdate(sliderId, {status}, {new: true})
        res.json(slider)
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Có lỗi xảy ra",
            error
        })
    }
}

export const sliderController = async (req, res) => {
    try {
        const sliders = await sliderModel
        .find({})
        .select("-photo")
        .sort({ createdAt: -1 })
        res.status(200).send({
            success: true, 
            countTotal: sliders.length,
            message: 'Toàn bộ sản phẩm',
            sliders,
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

export const sliderPhotoController = async (req, res) => {
    try {
        const slider = await sliderModel.findById(req.params.pid).select("photo")
        if(slider.photo.data) {
            res.set('Content-type', slider.photo.contentType)
            return res.status(200).send(slider.photo.data)
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

export const deleteSliderController = async (req, res) => {
    try{
        const slider = await sliderModel.findByIdAndDelete(req.params.id).select("-photo")
        res.status(200).send({
            success: true,
            message: "Xóa sản phẩm thành công",
            slider
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
