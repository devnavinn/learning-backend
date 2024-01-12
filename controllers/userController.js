const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
// const APIFeatures = require('./../utils/apiFeatures');

const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory')

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el]
        }
    })
    return newObj
}


exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user Posts password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError('This route is not for password updates. Please use /updateMyPassword', 400)
        )
    }

    // 2) update user document
    // Filter{{URL}}api/v1/reviews/658c18898deb31d6fa4b1e35ed out unwanted field names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true
        }
    )

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null
    })
})


exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined please use signup instead'
    })
}

exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.email) {
        return res.status(400).json({
            status: 'fail',
            message: 'Missing name or email'
        })
    }
    next()
}
// don not update user password with this
exports.updateUser = factory.updateOne(User)

exports.deleteUser = factory.deleteOne(User)

exports.getUser = factory.getOne(User)

exports.getAllUsers = factory.getAll(User)