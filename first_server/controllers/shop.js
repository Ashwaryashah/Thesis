const fs = require('fs');
const path = require('path');

const stripe = require('stripe')('sk_test_51LX1LnSBov6eVxpMfX6IT9trca81ocnLHxhJUDEwR4ZfkbGcqgQIgl8lxR3hZhhPdnMBKrO3fw4m3dyFbVKwijpz00MN4CFzVt');
const PDFDocument = require('pdfkit');

const Order = require("../models/order");
const Product = require("../models/product");

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
	const page = +req.query.page || 1;
	let totalItems;

	Product.find()
		.countDocuments()
		.then(numberProducts => {
			totalItems = numberProducts;
			return Product.find()
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE)
		}).then(products => {
			res.render("shop/product-list", {
				prods: products,
				pageTitle: "Products",
				path: "/products",
				currentPage: page,
				hasNextPage: ITEMS_PER_PAGE * page < totalItems,
				hasPreviousPage: page > 1,
				nextPage: page + 1,
				previousPage: page - 1,
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
			});

		}).catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	Product.findById(prodId)
		.then(product => {
			res.render("shop/product-detail", {
				product: product,
				pageTitle: product.title,
				path: "/products",
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getIndex = (req, res, next) => {
	const page = +req.query.page || 1;
	let totalItems;

	Product.find()
		.countDocuments()
		.then(numberProducts => {
			totalItems = numberProducts;
			return Product.find()
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE)
		}).then(product => {
			res.render("shop/index", {
				prods: product,
				pageTitle: "Shop",
				path: "/",
				currentPage: page,
				hasNextPage: ITEMS_PER_PAGE * page < totalItems,
				hasPreviousPage: page > 1,
				nextPage: page + 1,
				previousPage: page - 1,
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
			});

		}).catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getCart = (req, res, next) => {
	req.user
		.populate('cart.items.productId')
		.then(user => {
			const products = user.cart.items;
			res.render("shop/cart", {
				path: "/cart",
				pageTitle: "Your Cart",
				products: products,
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
	// Cart.getCart(cart => {
	// 	Product.fetchAll(products => {
	// 		const cartProducts = [];
	// 		for (productCart of products) {
	// 			/* IF There is a error like(TypeError: Assignment to constant variable.) 
	// 	then simply change the name of the variable */
	// 			const cartProductData = cart.products.find(
	// 				prod => prod.id === productCart.id
	// 			);
	// 			if (cartProductData) {
	// 				cartProducts.push({
	// 					productData: productCart,
	// 					qty: cartProductData.qty,
	// 				});
	// 			}
	// 		}
	// 		res.render("shop/cart", {
	// 			path: "/cart",
	// 			pageTitle: "Your Cart",
	// 			products: cartProducts,
	// 		});
	// 	});
	// }); 
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId).then(product => {
		return req.user.addToCart(product);
	}).then(result => {
		console.log(result);
		res.redirect('/cart');
	});

	// SQL Code
	/*
		let fetchedCart;
		let newQuantity = 1;
		req.user
			.getCart()
			.then(cart => {
				fetchedCart = cart;
				return cart.getProducts({ where: { id: prodId } });
			})
			.then(products => {
				let product;
				if (products.length > 0) {
					product = products[0];
				}
	
				if (product) {
					const oldQuantity = product.cartItem.quantity;
					newQuantity = oldQuantity + 1;
					return product;
				}
				return Product.findById(prodId);
			})
			.then(product => {
				return fetchedCart.addProduct(product, {
					through: { quantity: newQuantity }
				});
			})
			.then(() => {
				res.redirect('/cart')
			})
			.catch(err => console.log(err)); */
	/* Product.findById(prodId, product => {
		Cart.addProduct(prodId, product.price);
	});
	res.redirect("/cart"); */
};

exports.postCartDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.removeFromCart(prodId)
		.then(result => {
			res.redirect('/cart');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
	/* Product.findById(prodId, product => {
		Cart.deleteProduct(prodId, product.price);
		res.redirect("/cart");
	}); */
};


exports.getCheckout = (req, res, next) => {
	let products;
	let total = 0;
	req.user
		.populate('cart.items.productId')
		.then(user => {
			products = user.cart.items;
			total = 0;
			products.forEach(p => {
				total += p.quantity * p.productId.price;
			});
			return stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				line_items:
					products.map(p => {
						return {
							// name: p.productId.title,
							// description: p.productId.description,
							// price: p.productId.price * 100,
							// // currency: 'usd',
							// quantity: p.quantity
							price_data: {
								currency: "usd",
								product_data: {
									name: p.productId.title,
								},
								unit_amount: p.productId.price * 100,
							},
							quantity: p.quantity,
						}
					}),
				mode: 'payment',
				// success_url: req.protocal + '://' + req.get('host') + '/checkout/success',
				success_url: 'http://localhost:3000/checkout/success',
				// cancel_url: req.protocal + '://' + req.get('host') + '/checkout/cancel'
				cancel_url: 'http://localhost:3000/checkout/cancel'
			});

		}).then(session => {
			res.render("shop/checkout", {
				path: "/checkout",
				pageTitle: "Checkout",
				products: products,
				totalSum: total,
				sessionId: session.id
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			// console.log(err);
			return next(error);
		});
};



exports.getCheckoutSuccess = (req, res, next) => {
	req.user
		.populate('cart.items.productId')
		.then(user => {
			const products = user.cart.items.map(i => {
				return { quantity: i.quantity, product: { ...i.productId._doc } };
			});
			const order = new Order({
				user: {
					email: req.user.email,
					userId: req.user
				},
				products: products
			});
			return order.save();
		})
		.then(result => {
			return req.user.clearCart();
		}).then(() => {
			res.redirect('/orders');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postOrder = (req, res, next) => {
	req.user
		.populate('cart.items.productId')
		.then(user => {
			const products = user.cart.items.map(i => {
				return { quantity: i.quantity, product: { ...i.productId._doc } };
			});
			const order = new Order({
				user: {
					email: req.user.email,
					userId: req.user
				},
				products: products
			});
			return order.save();
		})
		.then(result => {
			return req.user.clearCart();
		}).then(() => {
			res.redirect('/orders');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};


exports.getOrders = (req, res, next) => {
	Order.find({ 'user.userId': req.session.user._id })
		.then(orders => {
			res.render("shop/orders", {
				path: "/orders",
				pageTitle: "Your Orders",
				orders: orders,
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};


exports.getInvoice = (req, res, next) => {
	const orderId = req.params.orderId;
	Order.findById(orderId).then(order => {
		if (!order) {
			return next(new Error('No order found.'));
		}
		if (order.user.userId.toString() !== req.user._id.toString()) {
			return next(new Error('Unauthorized'));
		}
		const invoiceName = 'invoice-' + orderId + '.pdf';
		const invoicePath = path.join('data', 'invoices', invoiceName);

		const pdfDoc = new PDFDocument();
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', 'inline; filename= "' + invoiceName + '"');

		pdfDoc.pipe(fs.createWriteStream(invoicePath));
		pdfDoc.pipe(res);

		pdfDoc.fontSize(26).text('Invoice', {
			underline: true
		});

		pdfDoc.fontSize(12).text('-----------------------------------------------------------');
		let totalPrice = 0;
		order.products.forEach(prod => {
			totalPrice += prod.quantity * prod.product.price;
			pdfDoc.fontSize(12).text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price);
		});
		pdfDoc.fontSize(12).text('-----------------------------------------------------------');

		pdfDoc.fontSize(12).text('Total Price: $' + totalPrice);
		pdfDoc.end();

		// fs.readFile(invoicePath, (err, data) => {
		// 	if (err) {
		// 		return next(err);
		// 	}
		// 	res.setHeader('Content-Type', 'application/pdf');
		// 	res.setHeader('Content-Disposition', 'inline; filename= "' + invoiceName + '"');
		// 	res.send(data);
		// });

		// const file = fs.createReadStream(invoicePath);

		// file.pipe(res);
	});
};


