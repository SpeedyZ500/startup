export class WebSocketFacade {
    constructor() {
        let port = window.location.port;
        this.handlers = new Map();
        this.queue = [];
        const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
        this.socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws`);
        this.socket.onopen = () => {
            // flush queued messages
            for (const message of this.queue) {
                this.socket.send(message);
            }
            this.queue = [];
        };
        this.socket.onmessage = this.handleMessage.bind(this)

    }

    _safeSend(dataObj) {

        const message = JSON.stringify(dataObj);
        console.log(message)
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            this.queue.push(message);
        }
    }

    subscribe({ url, type, collection, commandId, query, id, storyID, chapterID, filter, setData }) {
        this.handlers.set(commandId, setData);
        this._safeSend({ type, url, collection, query, commandId, id, storyID, chapterID, filter });
    }

    notify({collection,type, id, storyID, chapterID}){
        this._safeSend({ type, collection, id, storyID, chapterID });
    }
    
    unsubscribe(url, commandId) {
        this.handlers.delete(commandId);
        this._safeSend({ type: 'UNSUBSCRIBE', url, commandId });
    }

    handleMessage(event) {
        const data = JSON.parse(event.data);
        const handler = this.handlers.get(data.commandId);
        if (handler) {
            console.log(JSON.stringify(data.data))
          handler(data.data);
        }
    }

    cleanup() {
        this._safeSend({ type: "UNSUBSCRIBE" });
        this.socket.close();
        this.handlers.clear();
    }

    
}
const webSocket = new WebSocketFacade()
export {webSocket}