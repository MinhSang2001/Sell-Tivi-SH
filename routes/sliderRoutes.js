import express from 'express'
import { isAdmin, requireSignIn } from './../middlewares/authMiddleware.js'
import { 
    createSliderController,
    sliderController,
    sliderPhotoController,
    deleteSliderController,
    sliderStatusController,
} from '../controllers/sliderController.js'
import formidable from 'express-formidable'

const router = express.Router()

// routes
// create slider
router.post('/create-slider', requireSignIn, isAdmin, formidable(), createSliderController)

// getall slider
router.get('/get-slider', sliderController)

// get photo
router.get('/slider-photo/:pid', sliderPhotoController)

// slider status
router.put('/slider-status/:sliderId', requireSignIn, isAdmin, sliderStatusController)

// delete slider
router.delete('/delete-slider/:id', requireSignIn, isAdmin, deleteSliderController)
export default router