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
            enableVad: true,
            outputFormat: 'mp3',
            outputSampleRate: 24000,
        };
        playAiSocket.send(JSON.stringify(setupMessage));
    };

    playAiSocket.onmessage = (message) => {
        // Forward Play.AI response to the client
        ws.send(message.data);
    };

    playAiSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    playAiSocket.onclose = () => {
        console.log('WebSocket connection closed');
    };
    
    ws.on('message', function incoming(message) {
        // Forward client message to Play.AI
        playAiSocket.send(message);
    });
    
    ws.on('close', () => {
        playAiSocket.close();
    });
});

server.listen(3000, function listening() {
    console.log('Listening on %d', server.address().port);
});