const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')

const AppError = require('../utils/appError')

exports.getReviews = catchAsync(async (req, res, next) => {
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    const newReview = await Review.find(filter)

    res.status(200).json({
        status: 'success',
        result: newReview.length,
        data: {
            newReview
        }
    })
})


exports.createReview = catchAsync(async (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    const review = await Review.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            review
        }
    })
})