const Tour = require('./../models/tourModel');

exports.getTours = async (req, res) => {
    try {
        const tours = await Tour.find();
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
