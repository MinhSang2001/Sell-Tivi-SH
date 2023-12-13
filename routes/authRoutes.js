import express from 'express'
import { 
    registerController, 
    loginController,
    testController,
    userController,
    userDeleteController,
    forgotPasswordController,
    updateProfileController,
    createOrderController,
    updateStatusController,
    getAllOrdersController,
    getOrderDetailsController,
    deleteOrderController
} from '../controllers/authController.js'

import { requireSignIn, isAdmin } from '../middlewares/authMiddleware.js'

// router object
const router = express.Router()

// routing
// REGISTER || METHOD POST
router.post('/register', registerController)

// Login || Post
router.post('/login', loginController)

// Forgot password || Post
router.post('/forgot-password', forgotPasswordController)

// test routes
router.get('/test', requireSignIn, isAdmin, testController)

// user list
router.get('/users', requireSignIn, isAdmin, userController)

// delete user
router.delete('/user-delete/:id', requireSignIn, isAdmin, userDeleteController)

// protected user route auth
router.get("/user-auth", requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
  });

// protected admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

// update profile
router.put('/profile', requireSignIn, updateProfileController)

// create order
router.post('/create-order', requireSignIn, createOrderController)

// update status
router.put('/order-status/:orderId', requireSignIn, updateStatusController)

// get all orders
router.get('/orders', requireSignIn, getAllOrdersController)

// get order detail
router.get('/order-detail', requireSignIn, getOrderDetailsController)

// delete order detail
router.delete('/order-delete/:orderId', requireSignIn, deleteOrderController)


export default router;