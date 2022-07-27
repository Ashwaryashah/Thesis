const path = require("path");

const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require('mongoose');
const session = require('express-session');
const MongodbSessionStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const errorColtroller = require("./controllers/error");
// const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://node-database:lczluF2pM4wM9eKR@ecommercetestdatabase.zh8uwqf.mongodb.net/shop?retryWrites=true&w=majority';


const app = express();
const store = new MongodbSessionStore({
    uri: MONGODB_URI,
    collection: 'session'
});

const csrfProtecttion = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '_' + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};


app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");


// const { nextTick } = require("process");


// db.execute("SELECT * FROM products")
// 	.then(result => {
// 		console.log(result[0], result[1]);
// 	})
// 	.catch(err => {
// 		console.log(err);
// 	});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

// Static route using path from express.js framework
app.use(express.static(path.join(__dirname, "public")));
app.use('/first_server/images', express.static(path.join(__dirname, "images")));

app.use(session({ secret: 'My secret', resave: false, saveUninitialized: false, store: store }));
app.use(csrfProtecttion);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});


app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err));
        });
});



app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500', errorColtroller.get500);

app.use(errorColtroller.get404);

app.use((error, req, res, next) => {
    // res.render();
    // res.redirect('/500');
    res.status(500).render("500", { pageTitle: "Error!", path: "/500", isAuthenticated: req.isLoggedIn });
});



//MongoDb Direct connect
/*
mongoConnect(() => {
    app.listen(3000);
});
*/

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        console.log('CONNECTED');

        // User.findOne().then(user => {
        //     if (!user) {
        //         const user = new User({
        //             name: 'Max',
        //             email: 'max@testmail.com',
        //             cart: {
        //                 items: []
        //             }
        //         });
        //         user.save();
        //     }
        // })
        app.listen(3000);
    })
    .catch(err => console.log(err));

// SQL Code
/*

const sequelize = require("./util/database");
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");


Product.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE'
});

User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });


sequelize
    // .sync({ force: true })
    .sync()
    .then(result => {
        // console.log(result);
        return User.findByPk(1);
    })
    .then(user => {
        if (!user) {
            return User.create({ name: 'Max', email: 'test@test.com' });
        }
        return user;
    })
    .then(user => {
        // console.log(user);
        return user.createCart();
    })
    .then(cart => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })
*/

// const server = http.createServer(app);

// server.listen(3000);
