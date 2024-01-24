const express = require('express');
const authController = require('./../controllers/authController');
const { createReview, getReviews, deleteReview, updateReview, setTourUserIds, getReview } = require('../controllers/reviewController')

const router = express.Router({ mergeParams: true })

// Post /tour/73434347/reviews
// /reviews

router.use(authController.protect)

router
    .route('/')
    .get(getReviews)
    .post(
        authController.restrictTo('user'),
        setTourUserIds,
        createReview
    )

router.route('/:id')
    .get(getReview)
    .patch(authController.restrictTo('user', 'admin'), updateReview)
    .delete(authController.restrictTo('user', 'admin'), deleteReview)

module.exports = router;
