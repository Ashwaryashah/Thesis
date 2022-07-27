const express = require("express");

const router = express.Router();
const { body } = require('express-validator/check');


const adminColtroller = require("../controllers/admin");
const isAuth = require('../middleware/is-auth');


// /admin/add-product => GET
router.get("/add-product", isAuth, adminColtroller.getAddProduct);

// // // /admin/add-product => GET
router.get("/products", isAuth, adminColtroller.getProducts);

// /admin/add-product => POST
router.post("/add-product",
    body('title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('price').isFloat(),
    body('description')
        .isLength({ min: 5, max: 255 })
        .trim()
    , isAuth, adminColtroller.postAddProduct);

router.get("/edit-product/:productId", isAuth, adminColtroller.getEditProduct);

router.post("/edit-product",
    body('title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('price').isFloat(),
    body('description')
        .isLength({ min: 5, max: 255 })
        .trim()
    , isAuth, adminColtroller.postEditProduct);

router.delete("/product/:productId", isAuth, adminColtroller.deleteProduct);

module.exports = router;
// exports.routes = router;
// exports.products = products;
