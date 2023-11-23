const express = require('express');

const router = express.Router()
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

router.route('/tour-stats').get(tourController.getTourStats)

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getTours)

router.route('/').get(authController.protect, tourController.getTours).post(tourController.createTour)

router.route('/:id').get(authController.protect, tourController.getTour).patch(authController.protect, tourController.updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour)

module.exports = router;