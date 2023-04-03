require("dotenv").config();

exports.serverPort = 8080;
exports.sessionSecret = process.env.SESSION_SECRET;
exports.rate = {
  windowMs: 5 * 60 * 1000,
  max: 100,
};

exports.proxies = {
  "/myapp/login/": {
    //protected: true,
    target: "https://localhost:8000/", // backend
    changeOrigin: true,
    secure: false,
    logger: console,
  },
  "/datasocket": {
    target: "wss://localhost:8000/", //backend
    // pathRewrite: {
    //  '^/websocket' : '/socket',        // rewrite path.
    //  '^/removepath' : ''               // remove path.
    // },
    changeOrigin: true, // for vhosted sites, changes host header to match to target's host
    ws: true, // enable websocket proxy
    secure: false,
    logger: console,
  },
};
