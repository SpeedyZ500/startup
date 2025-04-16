const { WebSocketServer } = require('ws');
const { getCards, getDisplayable, getGraph, getOptions, mapOptionsMap, displayableMap, cardsMap} = require('./database')

const socketHandlers = {
    async getCards(socket, message){
        try{
            const params = cardsMap[message.collection]
            if(!params){
                return socket.send(JSON.stringify({
                    type:message.type,
                    requestId: message.requestId,
                    success:false,
                    error: `Cant map cards for ${message.collection}`
                }))
            }
            const data = await getCards(message.collection, {
                query:message.query,
                projectionFields:params.projectionFields,
                fields:params.fields,
                lookupFields:params.lookupFields,
            })
            socket.send(JSON.stringify({
                type: message.type,
                requestId: message.requestId,
                success: true,
                data,
              }));
        
        }
        catch(err){
            socket.send(JSON.stringify({
                type:message.type,
                requestId: message.requestId,
                success:false,
                error: err.message
            }))
        }
    },
    async getDisplayable(socket, message){
        try{
            const params = displayableMap[message.collection]
            if(!params){
                return socket.send(JSON.stringify({
                    type:message.type,
                    requestId: message.requestId,
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
                success: true,
                data,
              }));
        
        }
        catch(err){
            socket.send(JSON.stringify({
                type:message.type,
                requestId: message.requestId,
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
                success: true,
                data,
              }));
        
        }
        catch(err){
            socket.send(JSON.stringify({
                type:message.type,
                requestId: message.requestId,
                success:false,
                error: err.message
            }))
        }
    },
    async getOptions(socket, message){
        try{
            
            const data = await getOptions(message.collection, {
                query:message.query,
                
            })
            socket.send(JSON.stringify({
                type: message.type,
                requestId: message.requestId,
                success: true,
                data,
              }));
        
        }
        catch(err){
            socket.send(JSON.stringify({
                type:message.type,
                requestId: message.requestId,
                success:false,
                error: err.message
            }))
        }
    },
    async mapOptions(socket, message){
        try{
            const map = mapOptionsMap[message.collection]
            if(!map){
                return socket.send(JSON.stringify({
                    type:message.type,
                    requestId: message.requestId,
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
                success: true,
                flattened,
              }));
        
        }
        catch(err){
            socket.send(JSON.stringify({
                type:message.type,
                requestId: message.requestId,
                success:false,
                error: err.message
            }))
        }
    }
}

function peerProxy(httpServer) {
  // Create a websocket object
  const socketServer = new WebSocketServer({ server: httpServer });

  socketServer.on('connection', (socket) => {
    socket.isAlive = true;

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
        if(socketHandlers[parsedMessage.type]){
            socketHandlers[parsedMessage.type](socket, parsedMessage, socketServer);
        }else {
            if (parsedMessage.type === 'POST' || parsedMessage.type === 'PUT' || parsedMessage.type === 'PATCH') {
                socketServer.clients.forEach((client) => {
                    if (client !== socket && client.readyState === WebSocket.OPEN) {
                        // Check the client's path or any other relevant conditions here
                        // For example, we check if client is subscribed to the same path/endpoint
                        if (client.path === parsedMessage.collection ||  
                            (parsedMessage.storyID && client.path === `/${parsedMessage.collection}/${parsedMessage.storyID}` && parsedMessage.type === 'POST') ||
                            (parsedMessage.storyID && parsedMessage.chapterID && client.path === `/${parsedMessage.collection}/${parsedMessage.storyID}` && parsedMessage.type === 'PUT'  )

                        ) {
                            client.send({msg:"REDRAW"})
                        }
                        else if(client.path === `/${parsedMessage.collection}/${parsedMessage.id}`){
                            client.send(data);
                        }
                    }
                });
            } else {
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

module.exports = { peerProxy };
