const Tour = require('./../models/tourModel');

exports.getTours = async (req, res) => {
    try {
        //Build query
        // 1A) Filtering
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 2B) Advance Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        let query = Tour.find(JSON.parse(queryStr));

        //3) Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        //4) Field Limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        //5) Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) throw new Error('This page does not exist')
        }
        //Execute Querry
        const tours = await query;
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
