import express from 'express'
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js'
import { 
    createNewController,
    getNewController,
    updateNewController,
    newPhotoController,
    singleNewController,
    deleteNewController,
    getSomeNewController
} from '../controllers/newController.js'
import formidable from 'express-formidable'

const router = express.Router()

// routes
router.post('/create-new', requireSignIn, isAdmin, formidable() ,createNewController)

// get products
router.get('/get-new', getNewController)

// get products
router.get('/some-new', getSomeNewController)

// update category
router.put('/update-new/:pid', requireSignIn, isAdmin,formidable(), updateNewController)

// get photo
router.get('/new-photo/:pid', newPhotoController)

// single category
router.get('/single-new/:slug', singleNewController)

// delete category
router.delete('/delete-new/:id', requireSignIn, isAdmin, deleteNewController)

export default router