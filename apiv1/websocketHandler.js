let Conns = require("./models/ConnectionModel");
const CanvasMap = require("./models/CanvasMapping");
const SceneSaveEventHandlers = require("./websocketEvents/sceneSave");
const CanvasEventHandlers = require("./websocketEvents/canvasComms");
const io = require("socket.io");


/**
 * 
 * @param {io.Sockets} sockets 
 */
function setupSockets(sockets) {
    sockets.on("connection", (socket) => {
        socket_route(socket, "save", SceneSaveEventHandlers.save, sockets.sockets);
        socket_route(socket, "scene", SceneSaveEventHandlers.scene, sockets.sockets);
        socket_route(socket, "disconnect", SceneSaveEventHandlers.disconnect, sockets.sockets);

        socket_route(socket, "render", CanvasEventHandlers.send_data, socket.sockets);
        socket_route(socket, "canvas_error", CanvasEventHandlers.send_data, socket.sockets);
        socket_route(socket, "disconnect", CanvasEventHandlers.remove_socket, socket.sockets);
        socket_route(socket, "canvas_pair", CanvasEventHandlers.register_canvas, socket.sockets);
    });
    Conns.deleteMany({}).catch((err) => {
        console.error(`Error cleaning connection database: ${err}`);
    });
    CanvasMap.deleteMany({}).catch((err) => {
        console.error(`Error cleaning CanvasMap database: ${err}`);
    });
}

function socket_route(socket, event, fn, socketList) {
    socket.on(event, async (payload) => { await fn(socket, payload, socketList); });
}

module.exports = setupSockets;