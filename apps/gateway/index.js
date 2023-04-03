// import all the required packages
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const expressWinston = require("express-winston");
const helmet = require("helmet");
const { createProxyMiddleware } = require("http-proxy-middleware");
const responseTime = require("response-time");
const winston = require("winston");
const config = require("./config");
const fs = require("fs");
const https = require("https");

// configure the application
const app = express();
const port = config.serverPort;
const secret = config.sessionSecret;
const store = new session.MemoryStore();

const alwaysAllow = (_1, _2, next) => {
  next();
};
const protect = (req, res, next) => {
  const { authenticated } = req.session;

  if (!authenticated) {
    res.sendStatus(401);
  } else {
    next();
  }
};

app.disable("x-powered-by");

app.use(helmet());

app.use(responseTime());

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.json(),
    statusLevels: true,
    meta: false,
    level: "debug",
    msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
    expressFormat: true,
    ignoreRoute() {
      return false;
    },
  })
);

app.use(cors());

app.use(rateLimit(config.rate));

app.use(
  session({
    secret,
    resave: false,
    saveUninitialized: true,
    store,
  })
);

app.get("/login", (req, res) => {
  const { authenticated } = req.session;

  if (!authenticated) {
    req.session.authenticated = true;
    res.send("Successfully authenticated");
  } else {
    res.send("Already authenticated");
  }
});

/*
const wsProxy = createProxyMiddleware({
  target: 'wss://localhost:8000/',
  // pathRewrite: {
  //  '^/websocket' : '/socket',        // rewrite path.
  //  '^/removepath' : ''               // remove path.
  // },
  changeOrigin: true, // for vhosted sites, changes host header to match to target's host
  ws: true, // enable websocket proxy
  logger: console,
  secure: false,
});

app.use(wsProxy);
*/

const wssProxies = {};

Object.keys(config.proxies).forEach((path) => {
  const { protected, ...options } = config.proxies[path];
  const check = protected ? protect : alwaysAllow;
  const proxy = createProxyMiddleware(options);
  if (options.ws) {
    wssProxies["wss"] = proxy;
  }
  app.use(path, check, proxy);
});

app.get("/logout", protect, (req, res) => {
  req.session.destroy(() => {
    res.send("Successfully logged out");
  });
});

// app.get("/", (req, res) => {
//   const { name = "user" } = req.query;
//   res.send(`Hello ${name}!`);
// });

// app.get("/protected", protect, (req, res) => {
//   const { name = "user" } = req.query;
//   res.send(`Hello ${name}!`);
// });

const ssl = {
  key: fs.readFileSync("_cert.pem"),
  cert: fs.readFileSync("_cert.pem"),
};

const server = https.createServer(ssl, app);

server.listen(port, () => {
  console.log(`Gateway running at https://localhost:${port}`);
});

server.on("upgrade", function (req, socket) {
  console.log("upgrade", req.url);
  const proxy = wssProxies["wss"];
  proxy.upgrade(req, socket);
});
