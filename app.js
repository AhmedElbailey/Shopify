const express = require("express");
const app = express();

require("dotenv").config();
// const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.trguitc.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
const MONGODB_URI = `mongodb+srv://Ahmed_Adel:Ahmed_123456789@cluster0.trguitc.mongodb.net/shop?retryWrites=true&w=majority`;
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
// ac-b8rmipw-shard-00-01.trguitc.mongodb.net:27017
// mongodb+srv://Ahmed_Adel:Ahmed_123456789@cluster0.trguitc.mongodb.net/todo-V2?retryWrites=true&w=majority

const path = require("path");
const fs = require("fs");

const errorController = require("./controllers/error");

// HTML => EJS ///////////////////////////////////
app.set("view engine", "ejs");
app.set("views", "views");

// CSS //////////////////////////////////////////
app.use(express.static(path.join(__dirname, "public")));

// Input formats //////////////////////////////////
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(path.join(__dirname, "images"))) {
      fs.mkdirSync(path.join(__dirname, "images"), { recursive: true });
    }
    cb(null, "images");
  },

  filename: (req, file, cb) => {
    cb(null, Math.trunc(Math.random() * 10000) + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

// Sessions & Cookies //////////////////////////////////
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);

const store = new mongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { maxAge: 12 * 60 * 60 * 1000 },
  })
);

// CSRF Protection //////////////////////////////
const csrf = require("csurf");
const csrfProtection = csrf();

app.use(csrfProtection);

// Flash //////////////////////////////////////
const flash = require("connect-flash");

app.use(flash());

// Initial Middlewares //////////////////////////////////////
const User = require("./models/user");

// for secured headers
app.use(helmet());
//to compress files
app.use(compression());
//to store loggings
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

// for authentication
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Middlewares //////////////////////////////////////
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  res.redirect("/500");
});

// DATABASE //////////////////////////////////

const mongoose = require("mongoose");
const { error } = require("console");
// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(process.env.PORT || 3000);
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
