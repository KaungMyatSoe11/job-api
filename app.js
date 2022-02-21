require("dotenv").config();
require("express-async-errors");

//* security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

//*Swagger
const swaggerUI = require("swagger-ui-express");
const yaml = require("yamljs");
const swaggerDocument = yaml.load("./swagger.yaml");

const express = require("express");
const app = express();

const connectDb = require("./db/connect");

//routers
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const auth = require("./middleware/authentication");

app.use(express.json());

// extra packages
app.set("trust proxy", 1);

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 100,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());

app.get("/", (req, res) => {
  res.send('<h1>jobs API</h1> <a href="/api-docs">Document</a>');
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", auth, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    console.log(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port http://localhost:${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
