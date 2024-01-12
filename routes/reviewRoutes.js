const express = require('express');
const authController = require('./../controllers/authController');
const { createReview, getReviews, deleteReview, updateReview, setTourUserIds, getReview } = require('../controllers/reviewController')

const router = express.Router({ mergeParams: true })

// Post /tour/73434347/reviews
// /reviews

router
    .route('/')
    .get(getReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        setTourUserIds,
        createReview
    )

router.route('/:id')
    .get(getReview)
    .patch(updateReview)
    .delete(deleteReview)

module.exports = router;
