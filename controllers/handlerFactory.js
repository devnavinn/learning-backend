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

exports.updateOne = Model => catchAsync(async (req, res, next) => {

    const { id } = req.params
    const doc = await Model.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    })

    if (!doc) {
        return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })

})

exports.CreateOne = Model => catchAsync(async (req, res, next) => {
    // const newTour = new Tour({})
    // newTour.save()
    // Example of uploading an image to Cloudinary
    const doc = await Model.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    })

});

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id)
    if (populateOptions) query.populate(populateOptions)
    const doc = await query;
    if (!doc) {
        return next(new AppError('No document found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    })
})