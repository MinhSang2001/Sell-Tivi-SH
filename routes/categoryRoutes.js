import express from 'express'
import { isAdmin, requireSignIn } from './../middlewares/authMiddleware.js'
import { 
    createCategoryController,
    updateCategoryController,
    categoryController,
    singleCategory,
    deleteCategoryController,
    categoryPhotoController
} from '../controllers/categoryController.js'

import formidable from 'express-formidable'

const router = express.Router()

// routes
// create category
router.post('/create-category', requireSignIn, isAdmin, formidable(), createCategoryController)

// update category
router.put('/update-category/:pid', requireSignIn, isAdmin,formidable(), updateCategoryController)

// getall category
router.get('/get-category', categoryController)

// get photo
router.get('/category-photo/:pid', categoryPhotoController)

// single category
router.get('/single-category/:slug', singleCategory)

// delete category
router.delete('/delete-category/:id', requireSignIn, isAdmin, deleteCategoryController)
export default router