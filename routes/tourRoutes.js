const express = require('express');

const router = express.Router()
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes')


router.use('/:tourId/reviews', reviewRouter)


router.route('/tour-stats').get(tourController.getTourStats)

router.route('/monthly-plan/:year').get(authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan)

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getTours)

router.route('/')
    .get(tourController.getTours)
    .post(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.createTour)

router.route('/:id')
    .get(authController.protect, tourController.getTour)
    .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour)




module.exports = router;