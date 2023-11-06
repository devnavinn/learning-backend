const Tour = require('./../models/tourModel');

const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}



exports.getTours = async (req, res) => {
    try {

        const features = new APIFeatures(Tour.find(), req.query)
            .filter().sort().limitFields().paginate();
        const tours = await features.query;
        res.status(200).json({
            status: 'success',
            result: tours.length,

            data: {
                tours: tours
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            error: err
        })
    }

}
exports.getTour = async (req, res) => {
    try {
        const { id } = req.params
        const tour = await Tour.findById(id)
        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            error: err
        })
    }
}

exports.updateTour = async (req, res) => {
    try {
        const { id } = req.params
        const tour = await Tour.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        })
        if (!tour) {
            return res.status(404).json({
                status: 'failed',
                message: 'Not found'
            })
        }
        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            error: err
        })
    }
}
exports.deleteTour = async (req, res) => {
    try {
        const { id } = req.params;
        const tour = await Tour.findByIdAndDelete(id);

        if (!tour) {
            // If tour is not found, respond with a 404 status and an error message.
            return res.status(404).json({
                status: 'failed',
                message: 'Tour not found'
            });
        }


        // If the tour was successfully deleted, respond with a 204 status and a success message.
        res.status(204).json({
            status: 'success',
            message: 'Deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            error: err
        });
    }
};


exports.createTour = async (req, res) => {
    try {
        // const newTour = new Tour({})
        // newTour.save()
        const newTour = await Tour.create(req.body)

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            error: err
        })
    }

};

exports.getTourStats = async (req, res) => {
    try {
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
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            message: err
        })
    }
}

exports.getMonthlyPlan = async (req, res) => {
    try {
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
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            message: err
        })
    }
}