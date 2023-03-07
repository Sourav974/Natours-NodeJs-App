const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    slug: String,

    duration: {
      type: Number,
      required: [true, 'A tour must have a duratio']
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a groupSize']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty']
    },

    ratingsAverage: {
      type: Number,
      default: 4.5
    },

    ratingsQuantity: {
      type: Number,
      default: 0
    },

    rating: {
      type: Number,
      default: 4.5
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },

    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },

    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
      select: false
    },

    startDates: [Date],

    secretTour: {
      type: Boolean,
      default: false
    }
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durartionWeeks').get(function() {
  return this.duration / 7;
});

//Document Middlewar: runs before .save() and  .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log('will save document... ');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// Query Middleware

// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took  ${Date.now() - this.start} milliseconds`);

  next();
});

// Aggregation Middleware

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = new mongoose.model('Tour', tourSchema);

module.exports = Tour;
