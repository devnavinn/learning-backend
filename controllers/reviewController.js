const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')

const AppError = require('../utils/appError')

exports.getReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find()

    res.status(200).json({
        status: 'success',
        result: reviews.length,
        data: {
            reviews
        }
    })
})


exports.createReview = catchAsync(async (req, res, next) => {
    const review = await Review.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            review
        }
    })
})