const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
// const cloudinary = require('./../utils/cloudnary')
const catchAsync = require('./../utils/catchAsync');

const factory = require('./handlerFactory')

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}



exports.getTours = catchAsync(async (req, res, next) => {

    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const tours = await features.query;

    res.status(200).json({
        status: 'success',
        result: tours.length,

        data: {
            tours: tours
        }
    })
})
exports.getTour = catchAsync(async (req, res, next) => {

    const { id } = req.params
    const tour = await Tour.findById(id).populate('reviews');
    if (!tour) {
        return next(new AppError('No tour found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour: tour
        }
    })
})
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)


exports.createTour = factory.CreateOne(Tour)

exports.getTourStats = catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate([
        {
            $match: { ratingAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingQuantity' },
                avgRating: { $avg: '$ratingAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        },
        // {
        //     $match: { _id: { $ne: 'EASY' } }
        // }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })

})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
            // Unwind the startDates array
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
            // Add a new field called month
        },
        {
            $project: {
                _id: 0
                // Exclude the _id field
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
            // Limit the results to 12
        }
    ])
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    })

})