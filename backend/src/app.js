const express = require("express");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const cors = require("cors");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:4200";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true
  })
);

app.use(express.json());

const sessionOptions = {
  name: "nsm.sid",
  secret: process.env.SESSION_SECRET || "unsafe-dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  }
};

if (process.env.MONGO_URI) {
  sessionOptions.store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions"
  });
}

app.use(
  session(sessionOptions)
);

app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
