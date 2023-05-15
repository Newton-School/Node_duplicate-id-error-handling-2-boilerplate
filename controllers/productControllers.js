const Product = require('../models/Product');


const handleAsyncErrors = (asyncFn) => {
  return async (req, res, next) => {
    try {
      await asyncFn(req, res, next);
    } catch (err) {
      if (err instanceof MongooseError.CastError) {
        if (err.kind === 'ObjectId') {
          return res.status(404).json({
            status: 'Error',
            message: 'Invalid ID',
          });
        }
      }

      if (err instanceof DocumentNotFoundError) {
        return res.status(404).json({
          status: 'Error',
          message: 'Resource not found',
        });
      }

      if (err instanceof MongooseError.ValidationError) {
        return res.status(400).json({
          status: 'Error',
          message: err.message,
        });
      }

      return res.status(500).json({
        status: 'Error',
        message: 'Internal Server Error',
        error: err.message,
      });
    }
  };
};

/*
Write a function to handle Duplicate Key Errors: 
  - If the error is a duplicate key error,
  return res.status(409).json({
            status: 'Error',
            message: `A resource with the same ${duplicatedField} '${duplicatedValue}' already exists`,
  });

  Modify the createProduct Function accordingly
*/
const createProduct = handleAsyncErrors(async (req, res) => {
  const { name, description, price, category } = req.body;

  const product = new Product({
    name,
    description,
    price,
    category,
  });
  await product.save();
  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
});

const searchProducts = handleAsyncErrors(async (req, res) => {
  const { page = 1, limit = 10, search, category, sort, minPrice, maxPrice } = req.query;
  const query = {};
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  if (category) {
    query.category = category;
  }
  if (minPrice && maxPrice) {
    query.price = { $gte: minPrice, $lte: maxPrice };
  } else if (minPrice) {
    query.price = { $gte: minPrice };
  } else if (maxPrice) {
    query.price = { $lte: maxPrice };
  }
  const sortOrder = sort === 'asc' ? 'price' : '-price';

  const products = await Product.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort(sortOrder);
  const count = await Product.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      count,
      products,
    },
  });
});

const getProductByID = handleAsyncErrors(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      status: 'Error',
      message: 'Product Not Found',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});


module.exports = { searchProducts, getProductByID, createProduct };
