const express = require('express');

const router = express.Router()

const authController = require('./../controllers/authController');

const { createReview, getReviews } = require('../controllers/reviewController')

router.route('/').post(authController.protect, authController.restrictTo('user'), createReview).get(getReviews)



module.exports = router;
