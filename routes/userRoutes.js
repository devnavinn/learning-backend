const express = require('express')

const router = express.Router()
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')


router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.patch('/verifyEmail/:token', authController.verifyEmail)
router.post('/resendVerifyEmail', authController.resendVerifyEmail)
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

// Protect all route after this
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword)

router.get('/me', userController.getMe, userController.getUser)
router.patch('/updateMe', userController.updateMe)
router.delete('/deleteMe', userController.deleteMe)

// Operation allowed to admin only
router.use(authController.restrictTo('admin'))
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.checkBody, userController.createUser)

router
    .route('/:id')
    .get(userController.getUser)
    .delete(userController.deleteUser)
    .patch(userController.updateUser)

module.exports = router;