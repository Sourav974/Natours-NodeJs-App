const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must have less or equal then 40  characters'],
      minlength: [10, 'A tour must have more or equal then 10  characters'],
      validate: [validator.isAlpha, 'Tour name is only contain characters']
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
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty must be either easy, medium or hard'
      }
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A tour must have be above 1.0'],
      max: [5, 'A tour must have be below 5.0']
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
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on New document creation
          return val < this.price;
        },

        message: 'The price ({VALUE}) must be less than the regular price'
      }
    },

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
