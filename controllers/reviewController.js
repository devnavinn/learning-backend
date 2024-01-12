const Review = require('../models/reviewModel')
// const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')
// const AppError = require('../utils/appError')

exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next()
}

exports.getReviews = factory.getAll(Review)
exports.getReview = factory.getOne(Review)
exports.createReview = factory.CreateOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)