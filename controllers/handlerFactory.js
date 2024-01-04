const catchAsync = require('./../utils/catchAsync')

const AppError = require('./../utils/appError')

exports.deleteOne = Model => catchAsync(async (req, res, next) => {

    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);

    if (!doc) {
        return next(new AppError('No document found with that ID', 404))
    }

    // If the tour was successfully deleted, respond with a 204 status and a success message.
    res.status(204).json({
        status: 'success',
        message: 'Deleted successfully'
    });

});

