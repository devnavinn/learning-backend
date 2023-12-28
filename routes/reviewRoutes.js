const express = require('express');
const authController = require('./../controllers/authController');
const { createReview, getReviews } = require('../controllers/reviewController')

const router = express.Router({ mergeParams: true })

// Post /tour/73434347/reviews
// /reviews

router
    .route('/')
    .post(
        authController.protect,
        authController.restrictTo('user'),
        createReview
    )
    .get(getReviews)



module.exports = router;
