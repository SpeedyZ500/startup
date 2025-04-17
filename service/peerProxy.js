const { WebSocketServer } = require('ws');
const { getCards, getDisplayable, getGraph, getOptions, mapOptionsMap, displayableMap, cardsMap} = require('./database')

const socketHandlers = {
    async getCards(socket, message){
        try{
            const collection = message.collection.replace(/\//g, '');
            const params = cardsMap[message.collection]
            if(!params){
                return socket.send(JSON.stringify({
                    type:message.type,
                    requestId: message.requestId,
                    commandId:message.commandId,
                    success:false,
                    error: `Cant map cards for ${message.collection}`
                }))
            }
            const data = await getCards(message.collection, {
                //query:message.query,
                projectionFields:params.projectionFields,
                fields:params.fields,
                lookupFields:params.lookupFields,
            })
            socket.send(JSON.stringify({
                type: message.type,
                requestId: message.requestId,
                commandId:message.commandId,
                success: true,
                data,
              }));
        
        }
        catch(err){
            socket.send(JSON.stringify({
                type:message.type,
                requestId: message.requestId,
                commandId:message.commandId,
                success:false,
                error: err.message
            }))
        }
    },
    async getDisplayable(socket, message){
        try{
            const collection = message.collection.replace(/\//g, '');

            const params = displayableMap[collection]
            if(!params){
                return socket.send(JSON.stringify({
                    type:message.type,
                    requestId: message.requestId,
                    commandId:message.commandId,
                    success:false,
                    error: `Cant map displayable for ${message.collection}`
                }))
            }
            const data = await getDisplayable(message.collection, message.id,{
                projectionFields:params.projectionFields,
                fields:params.fields,
                lookupFields:params.lookupFields,
            })
            socket.send(JSON.stringify({
                type: message.type,
                requestId: message.requestId,
                commandId:message.commandId,
                success: true,
                data,
              }));
        
        }
        catch(err){
            socket.send(JSON.stringify({
                type:message.type,
                requestId: message.requestId,
                commandId:message.commandId,
                success:false,
                error: err.message
            })
            )
        }
    },
    async getGraph(socket, message){
        try{
            const data = await getGraph(message.id, message.filter )
            socket.send(JSON.stringify({
                type: message.type,
                requestId: message.requestId,
                commandId:message.commandId,
                success: true,
                data,
              }));
        
        }
        catch(err){
            socket.send(JSON.stringify({
                type:message.type,
                requestId: message.requestId,
                commandId:message.commandId,
                success:false,
                error: err.message
            }))
        }
    },
    async getOptions(socket, message){
        try{
            const collection = message.collection.replace(/\//g, '');

            const data = await getOptions(collection, {
                query:message.query,
                
            })
            socket.send(JSON.stringify({
                type: message.type,
                requestId: message.requestId,
                commandId:message.commandId,
                success: true,
                data,
              }));
        
        }
        catch(err){
            socket.send(JSON.stringify({
                type:message.type,
                requestId: message.requestId,
                commandId:message.commandId,
                success:false,
                error: err.message
            }))
        }
    },
    async mapOptions(socket, message){
        try{
            const collection = message.collection.replace(/\//g, '');

            const map = mapOptionsMap[collection]
            if(!map){
                return socket.send(JSON.stringify({
                    type:message.type,
                    requestId: message.requestId,
                    commandId:message.commandId,
                    success:false,
                    error: `Cant map options for ${message.collection}`
                }))
            }
            const data = await getCards(map.collection, {
                query:message.query,
                projectionFields:map.projectionFields,
                fields:map.fields
            })
            const flattened = data.flatMap(dat =>
                (dat.options || []).map(opt => ({
                    ...opt,
                    qualifier: dat.id  // make sure it's still your displayable id
                }))
            );
            socket.send(JSON.stringify({
                type: message.type,
                requestId: message.requestId,
                commandId:message.commandId,
                success: true,
                flattened,
              }));
        
        }
        catch(err){
            socket.send(JSON.stringify({
                type:message.type,
                requestId: message.requestId,
                commandId:message.commandId,
                success:false,
                error: err.message
            }))
        }
    }
}

function peerProxy(httpServer) {
  // Create a websocket object
  //const socketServer = new WebSocketServer({ server: httpServer });
  const socketServer = new WebSocketServer({ noServer:true });

  httpServer.on('upgrade', (req, socket, head) => {
    if (req.url === '/ws') {
      socketServer.handleUpgrade(req, socket, head, (ws) => {
        socketServer.emit('connection', ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  socketServer.on('connection', (socket) => {
    socket.isAlive = true;
    socket.subscriptions = new Map();

    // Forward messages to everyone except the sender
    socket.on('message', function message(data) {
        let parsedMessage;
        try{
            parsedMessage = JSON.parse(data)
        }
        catch (error){
            console.error('Invalid JSON received:', error);
            return; // Early exit if message is invalid    
        }  
        const { url, commandId } = parsedMessage;
        if (parsedMessage.type === "UNSUBSCRIBE"){
            const subs = socket.subscriptions.get(url);
            if(subs){
                if(commandId){
                    subs.delete(commandId);
                    if (subs.size === 0) socket.subscriptions.delete(url);
                }
                else{
                    socket.subscriptions.delete(url)
                }
            }
            else{
                socket.subscriptions.clear()
            }
        }
        else if(socketHandlers[parsedMessage.type]){
            if(!socket.subscriptions.has(url)){
                socket.subscriptions.set(url, new Map());
            }
            socket.subscriptions.get(url).set(commandId, data)
            socketHandlers[parsedMessage.type](socket, parsedMessage, socketServer);
        }
        else {
            if (parsedMessage.type === 'POST' || parsedMessage.type === 'PUT' || parsedMessage.type === 'PATCH') {
                socketServer.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        // Check the client's path or any other relevant conditions here
                        // For example, we check if client is subscribed to the same path/endpoint
                        for (const [url, commands] of client.subscriptions || []){
                            if (urlMatchesUpdate(url, parsedMessage)){
                                for (const [commandId, commandData] of commands) {
                                    const parsedData = JSON.parse(commandData)
                                    if(socketHandlers[parsedData.type]){ //technically redundant safety check
                                        parsedData.requestId = parsedMessage.requestId; // Ensure it's set or valid if needed
                                        socketHandlers[parsedData.type](client, parsedData, socketServer);
                                    }
                                }
                            }
                        }
                    }
                });
            } 
            else {
                // For any other type of message (non-update), just forward it to all other clients
                socketServer.clients.forEach((client) => {
                    if (client !== socket && client.readyState === WebSocket.OPEN) {
                        client.send(data);
                    }
                });
            }
        
        }
        
    });

    // Respond to pong messages by marking the connection alive
    socket.on('pong', () => {
      socket.isAlive = true;
    });
  });

  // Periodically send out a ping message to make sure clients are alive
  setInterval(() => {
    socketServer.clients.forEach(function each(client) {
      if (client.isAlive === false) return client.terminate();

      client.isAlive = false;
      client.ping();
    });
  }, 10000);
}

function urlMatchesUpdate(url, updateMessage){
    const { collection, id, storyID, chapterID } = updateMessage;
    if (url === `${collection}`) return true;
    if (id && url === `${collection}/${id}`) return true;
    if (storyID && url === `${collection}/${storyID}`) return true;
    if (storyID && chapterID && url === `${collection}/${storyID}/${chapterID}`) return true;
    return false
}

module.exports = { peerProxy };
