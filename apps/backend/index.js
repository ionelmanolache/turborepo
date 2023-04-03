import https from "node:https";
import fs from "node:fs";
import { WebSocketServer } from "ws";
import { Buffer, transcode } from "node:buffer";

const host = "localhost";
const port = 8000;

const ssl = {
  key: fs.readFileSync("_cert.pem"),
  cert: fs.readFileSync("_cert.pem"),
};

const books = JSON.stringify([{ "id": "books" }]);

const authors = JSON.stringify([{ "id": "authors" }]);

const requestListener = function (req, res) {
  switch (req.url) {
    case "/myapp/login":
      res.writeHead(302, {
        Location: "https://localhost:5173/",
        //add other headers here...
      });
      res.end();
      console.log("[Backend] login");
      break;
    case "/books":
      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end(books);
      break;
    case "/authors":
      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end(authors);
      break;
    case "/":
      res.writeHead(200);
      res.end("My first server!");
      break;
    default:
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Resource not found" }));
  }
};

const server = https.createServer(ssl, requestListener);

const wss = new WebSocketServer({ server });
wss.on("connection", function connection(connection) {
  connection.on("error", console.error);

  connection.on("message", function message(msg) {
    console.log(`received [${msg.type}] %s`, msg);

    // https://nodejs.org/api/buffer.html#buffertranscodesource-fromenc-toenc
    // const newBuf = transcode(Buffer.from(msg), 'utf8', 'ascii');
    // console.log(newBuf.toString('ascii'));

    const s = Buffer.from(msg).toString();
    console.log(s);

    connection.send(msg);
  });

  connection.send("connected");
});

server.listen(port, host, () => {
  console.log(`Backend is running on https://${host}:${port}`);
});

server.on("upgrade", function (req, socket) {
  console.log("[backend] upgrade", req.url);
});

/*
const wsServer = new ws.WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
*/

/*
const json = function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    res.end(`{"message": "This is a JSON response"}`);
};

const html = () => {
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(`<html><body><h1>This is HTML</h1></body></html>`);
}


const csv = (req, res)  => {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment;filename=oceanpals.csv");
    res.writeHead(200);
    res.end(`id,name,email\n1,Sammy Shark,shark@ocean.com`);
};

const htmlfile = function (req, res) {
    fs.readFile(__dirname + "/index.html")
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
            res.writeHead(500);
            res.end(err);
            return;
        });
};
*/
