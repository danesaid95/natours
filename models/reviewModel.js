const mongoose = require('mongoose');
const Tour = require('./tourModel');

// review / rating / createdAt / ref to Tour / ref to User

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review is required'],
    },
    rating: {
      type: Number,
      required: [true, 'A rating is required'],
      max: [5, 'A rating must have a maximum of 5.0 rating.'],
      min: [1, 'A rating must have a minimum of 1.0 rating.'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user '],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calculateAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // Use a cloned query or the model to avoid "Query was already executed" errors
  this.r = await this.findOne().clone();
  next();
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  // `this` is the query; `doc` is the document returned by the operation
  // prefer the doc if available, otherwise fall back to the one we saved on `this`
  const reviewDoc = doc || this.r;
  if (reviewDoc) {
    await reviewDoc.constructor.calculateAverageRating(reviewDoc.tour);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
