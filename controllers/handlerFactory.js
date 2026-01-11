const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('There is no document with that ID', 404));
    }
    res.status(204).send();
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('There is no document with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, option) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (option) query = query.populate(option);
    const doc = await query;
    if (!doc) {
      return next(new AppError('There is no document with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //to allow nested get Tour review
    const filter = {};
    if (req.params.tourId) filter.tour = req.params.tourId;

    //EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const docs = await features.query.explain();
    const docs = await features.query;
    //Querying DB
    //db.tours.find({difficulty: "easy", price: {$lte: 500}})
    //{ duration: { gt: '5' } }
    //$lte,$gte,$lt,$gt

    // const query = Tour.find()
    //   .where('durations')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    //SEND RESPONSE
    res.status(200).json({
      message: 'success!',
      result: docs.length,
      data: {
        data: docs,
      },
    });
  });
