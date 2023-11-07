/* eslint-disable import/no-extraneous-dependencies */

// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        trim: true,
        unique: true,
        maxLength: [40, 'A tour name must have less or equal than 40 characters'],
        minLength: [10, 'A tour name must have more or equal than 10 characters'],
        // validator: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    priceDiscount: {
        type: Number,
        validate: {
            // this only points to current doc on NEW document creation
            validator: function (val) {
                // this only points to current doc on NEW document creation
                return val < this.price
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summery']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: true
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})

//Document middleware : run before .save() and .create() 
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

// tourSchema.pre('save', function (next) {
//     console.log('will save document...')
//     next()
// })

// tourSchema.post('save', function (doc, next) {
//     console.log(doc)
//     next()
// })

//Query middleware
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } })
    // this.start = Date.now()
    next()
})

tourSchema.post(/^find/, function (docs, next) {
    console.log(docs);
    // console.log(`Query took ${Date.now() - this.start} milliseconds!`);

    next()
})

// Aggregate middleware
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    // console.log(this.pipeline());
    next();
});


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;