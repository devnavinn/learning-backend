// review /rating /createdAt /ref to tour // ref to user who wrote review

const mongoose = require('mongoose')

const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cant not be empty']
    },
    rating: {
        type: Number,
        required: [true, 'A review should have rating'],
        min: 1,
        max: 5
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// reviewSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: 'tour',
//         select: 'name'
//     }).populate({
//         path: 'user',
//         select: 'name photo'
//     })

//     next()
// })

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })

    next()
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    // this refer to modal 
    const stats = await this.aggregate([
        {
            $match: {
                tour: tourId
            },
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }

    ])
    await Tour.findByIdAndUpdate(tourId, {
        ratingAverage: stats[0].nRating,
        ratingQuantity: stats[0].avgRating
    })
}

reviewSchema.post('save', function () {
    //this points to current doucuments
    this.constructor.calcAverageRatings(this.tour)

})
const Review = mongoose.model('Review', reviewSchema)

module.exports = Review;