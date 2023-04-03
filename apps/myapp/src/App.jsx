import { useState } from 'react'
import './App.css'

//const fetcher = (...args) => fetch(...args).then(res => res.json())

function App() {
  const [loggedin, setLoggedin] = useState(false)

  const doWebsocket = function () {
    const ws = new WebSocket('wss://localhost:5173/datasocket');
    ws.binaryType = "arraybuffer";

    ws.onopen = (event) => {
      console.log('Connection opened [Websocket]')
      ws.send("Hello!");
    };

    ws.onmessage = (event) => {

      if (event.data instanceof ArrayBuffer) {
        const s = String.fromCharCode.apply(null, new Uint8Array(event.data));
        // var enc = new TextDecoder("utf-8");
        // const s = enc.decode(event.data);
        console.log('[ArrayBuffer] received: ', s);
      } else 
      if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('[Blob] received: ', reader.result);
        };
        reader.readAsText(event.data);
      } else {
        console.log("received: " + event.data);
      }

    };

    ws.onerror = (event) => {
      console.log('ERROR:', event);
    };
  }

  const doLogin = function () {
    fetch('/myapp/login')
      // .then(res => res.json())
      .then(data => {
        console.log('login response', data);
        setLoggedin(true);
      });
  }

  if (loggedin) {
    console.log('Logged in');
  }

  return (
    <div className="App">
      <button onClick={ doWebsocket }>Websocket</button>
      <button onClick={ doLogin }>login</button>
    </div>
  )
}

export default App
