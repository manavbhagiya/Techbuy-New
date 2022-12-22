var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var path = require('path');
var Cart = require('../models/cart');
var Razorpay = require('razorpay');

var instance = new Razorpay({  
  key_id: 'rzp_test_hINoPTh0fToW4T',  
  key_secret: 'YmvPfi4h6Gmm7hhRnLR8Wemy',
});

router.get('/checkout', function(req, res, next) {
  var options = {
    amount: 50000,  // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11"
  };
  instance.orders.create(options, function(err, order) {
    console.log(order);
  });
});

/* GET home page. */
router.get('/', function (req, res, next) {
  Product.find(function (err, docs) {
    res.render('shop/index', { title: 'TechBuy', active: { home: true }, products: docs });
  }).lean();
});
router.get('/home', function (req, res, next) {
  Product.find(function (err, docs) {
    res.render('shop/index', { title: 'TechBuy', active: { home: true }, products: docs });
  }).lean();
});

/* GET product page. */
router.get('/product', function (req, res, next) {
  res.render('shop/product', { title: 'TechBuy' });
});

/* GET laptop page. */
router.get('/laptops', function (req, res, next) {
  Product.find({ category: 'Laptops' }, function (err, docs) {
    res.render('shop/laptops', { title: 'TechBuy', active: { laptops: true }, products: docs });
  }).lean();
});

/* GET desktops page. */
router.get('/desktops', function (req, res, next) {
  Product.find({ category: 'Desktops' }, function (err, docs) {
    res.render('shop/desktops', { title: 'TechBuy', active: { desktops: true }, products: docs });
  }).lean();
});

/* GET accessories page. */
router.get('/accessories', function (req, res, next) {
  Product.find({ category: 'Accessories' }, function (err, docs) {
    res.render('shop/accessories', { title: 'TechBuy', active: { accessories: true }, products: docs });
  }).lean();
});

/* GET admin-dashboard page. */
router.get('/admin', function (req, res, next) {
  res.render('admin/dashboard', { title: 'TechBuy' });
});

/* GET admin-customers page. */
router.get('/admin/customers', function (req, res, next) {
  res.render('admin/customers', { title: 'TechBuy' });
});

/* GET admin-products page. */
router.get('/admin/products', function (req, res, next) {
  Product.find(function (err, docs) {
    res.render('admin/products', { title: 'TechBuy', products: docs });
  }).lean();
});

/* GET admin-orders page. */
router.get('/admin/orders', function (req, res, next) {
  res.render('admin/orders', { title: 'TechBuy' });
});

router.get('/admin/addOrEditProduct', function (req, res, next) {
  res.render('admin/addorEditProduct', { title: 'TechBuy', viewTitle: 'Add Product' });
});

router.post('/admin/addOrEditProduct', (req, res) => {
  if (req.body._id == '') {
    insertRecord(req, res);
  }
  else {
    updateRecord(req, res);
  }
});

function insertRecord(req, res) {
  var products = new Product();
  products.image = req.body.image;
  products.title = req.body.title;
  products.description = req.body.description;
  products.price = req.body.price;
  products.category = req.body.category;

  products.save((err, docs) => {
    if (!err) {
      res.redirect('/admin/products')
    }
  });
}

function updateRecord(req, res) {
  Product.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, docs) => {
    res.redirect('admin/products', { title: 'TechBuy', viewTitle: 'Update Product' });
  });
}

router.get('/admin/addOrEditProduct/:id', (req, res) => {
  Product.findById(req.params.id, (err, docs) => {
    res.render('admin/addorEditProduct', { title: 'TechBuy', viewTitle: 'Update Product', products: docs });
  });
});



router.get('/admin/deleteProduct/:id', (req, res) => {
  Product.findByIdAndRemove(req.params.id, (err, docs) => {
    res.redirect('/admin/products');
  });
});

router.get('/product/:id', function (req, res, next) {
  var productId = req.params.id;
  Product.findById(productId, function (err, docs) {
    res.render('shop/product', { title: 'TechBuy', active: { home: true }, products: docs });
  }).lean();
});

router.get('/add-to-cart/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, function (err, product) {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  });
});


/* GET cart page */
router.get('/cart', function (req, res, next) {
  if (!req.session.cart) {
    return res.render('shop/cart', { products: null });
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/cart', { products: cart.generateArray(), totalPrice: cart.totalPrice });
});

module.exports = router;
