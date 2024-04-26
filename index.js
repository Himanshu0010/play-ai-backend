const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const API_KEY = 'Bearer ak-11a540091f994b2fbbdfac05c61f63b1';
const AGENT_ID = 'My-AI-api-maplw-RLOeYdc7spH-rH_';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
    const playAiSocket = new WebSocket(`wss://api.play.ai/v1/agent-conversation?agentId=${AGENT_ID}`);

    playAiSocket.onopen = () => {
      console.log('Connected to Play.AI');
      const setupMessage = {
          type: 'setup',
          apiKey: API_KEY,
          enableVad: true, // Ensure VAD is enabled
          outputFormat: 'mp3', // Ensure output format is as expected
          outputSampleRate: 24000,
      };
      playAiSocket.send(JSON.stringify(setupMessage));
  };

  playAiSocket.onmessage = (message) => {
    console.log('Receiving from Play.AI:', message.data); // Console log from Play.AI
      ws.send(message.data);  // Forwarding to client
  };

  playAiSocket.onerror = (error) => {
      console.error('WebSocket error from Play.AI:', error);
  };

  playAiSocket.onclose = () => {
      console.log('WebSocket connection with Play.AI closed');
  };

  function sendAudioData(base64Data) {
    const audioMessage = {
        type: 'audioIn',
        data: base64Data
    };
    playAiSocket.send(JSON.stringify(audioMessage));
    console.log('Sent audio data');
   //console.log(JSON.stringify(audioMessage))
    
}
  ws.on('message', function incoming(message) {
    // console.log(message.toString('base64')); // Console log from client
    baseToString = message.toString('base64')
      sendAudioData(baseToString); // Sending to Play.AI
  });
  
  ws.on('close', () => {
      console.log('WebSocket connection with client closed');
      playAiSocket.close();
  });
});

server.listen(3000, function listening() {
  console.log('Proxy server listening on port', server.address().port);
});