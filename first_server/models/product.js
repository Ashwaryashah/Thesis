/* const db = require("../util/database");

const Cart = require("./cart");

module.exports = class product {
	constructor(id, Title, imageUrl, price, description) {
		this.id = id;
		this.title = Title;
		this.imageUrl = imageUrl;
		this.price = price;
		this.description = description;
	}

	save() {
		return db.execute(
			"INSERT INTO products (title, price,description,imageUrl) VALUES (?, ?, ?, ?)",
			[this.title, this.price, this.description, this.imageUrl]
		);
	}

	static deleteById(id) { }
	static fetchAll() {
		return db.execute("SELECT * FROM products");
	}

	static findById(id) {
		return db.execute("SELECT * FROM products WHERE products.id = ?", [id]);
	}
}; */


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	imageUrl: {
		type: String,
		required: true
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
});

module.exports = mongoose.model('Product', productSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// class Product {
// 	constructor(title, price, description, imageUrl, id, userId) {
// 		this.title = title;
// 		this.price = price;
// 		this.description = description;
// 		this.imageUrl = imageUrl;
// 		this._id = id ? new mongodb.ObjectId(id) : null
// 		this.userId = userId;
// 	}

// 	save() {
// 		const db = getDb();
// 		let dbOp;
// 		if (this._id) {
// 			// Update the Product
// 			dbOp = db.collection('products').updateOne({ _id: this._id }, { $set: this });
// 		} else {
// 			dbOp = db.collection('products').insertOne(this);
// 		}
// 		return dbOp
// 			.then(products => {
// 				console.log(products);
// 				return products;
// 			})
// 			.catch(err => {
// 				console.log(err);
// 			});
// 	}

// 	static fetchAll() {
// 		const db = getDb();
// 		return db.collection('products')
// 			.find()
// 			.toArray()
// 			.then(products => {
// 				console.log(products);
// 				return products;
// 			})
// 			.catch(err => {
// 				console.log(err);
// 			});
// 	}

// 	static findById(prodId) {
// 		const db = getDb();
// 		return db.collection('products')
// 			.find({ _id: new mongodb.ObjectId(prodId) })
// 			.next()
// 			.then(product => {
// 				console.log(product);
// 				return product;
// 			}).catch(err => {
// 				console.log(err);
// 			});
// 	}

// 	static deleteById(prodId) {
// 		const db = getDb();
// 		return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(prodId) })
// 			.then(result => {
// 				console.log('DELETED');
// 			})
// 			.catch(err => {
// 				console.log(err);
// 			});
// 	}
// }

// module.exports = Product;

// // SQL Sequelize code
// /*
// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const Product = sequelize.define('product', {
// 	id: {
// 		type: Sequelize.INTEGER,
// 		autoIncrement: true,
// 		allowNull: false,
// 		primaryKey: true,
// 	},
// 	title: Sequelize.STRING,
// 	price: {
// 		type: Sequelize.DOUBLE,
// 		allowNull: false,
// 	},
// 	imageUrl: {
// 		type: Sequelize.STRING,
// 		allowNull: false,
// 	},
// 	description: {
// 		type: Sequelize.STRING,
// 		allowNull: false,
// 	}
// });

// module.exports = Product;
// */


