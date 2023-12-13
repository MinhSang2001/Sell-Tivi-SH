import express from 'express'
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js'
import { 
    createProductController, 
    getProductController, 
    singleProductController, 
    productPhotoController,
    deleteProductController,
    updateProductController,
    productFiltersController,
    productCountController,
    productListController,
    productFiltersPriceController,
    productNewController,
    searchProductController,
    realtedProductController,
    productByCategoryController,
    productCategoryController,
    braintreeTokenController,
    braintreePaymentController
} from '../controllers/productController.js'
import formidable from 'express-formidable'

const router = express.Router()

// routes
router.post('/create-product', requireSignIn, isAdmin, formidable() ,createProductController)

// get products
router.get('/get-product', getProductController)

// single product
router.get('/single-product/:slug', singleProductController)

// get photo
router.get('/product-photo/:pid', productPhotoController)

// delete product
router.delete('/delete-product/:pid', requireSignIn, isAdmin, deleteProductController)

// update product
router.put('/update-product/:pid', requireSignIn, isAdmin, formidable() ,updateProductController)

// filter product
router.post('/product-filters', productFiltersController)

// filter by price
router.post('/product-price/:slug', productFiltersPriceController)

// product count
router.get('/product-count', productCountController)

// product per page
router.get('/product-list/:page', productListController)

// new product
router.get('/product-new/:page', productNewController)

// search product
router.get('/search/:keyword', searchProductController)

// similar product
router.get(`/related-product/:pid/:cid`, realtedProductController)

// get product by cat id 
router.get(`/product-cat`, productByCategoryController)

// category wise product
router.get('/product-category/:slug', productCategoryController) 


export default router