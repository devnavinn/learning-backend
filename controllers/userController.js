const User = require('./../models/userModel');
// const AppError = require('./../utils/appError');
// const APIFeatures = require('./../utils/apiFeatures');

// const catchAsync = require('./../utils/catchAsync');

exports.getAllUsers = async (req, res) => {
    const users = await User.find()

    res.status(200).json({
        status: 'success',
        result: users.length,

        data: {
            users: users
        }
    })
}
exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
}
exports.addUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
}
exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
}
exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
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