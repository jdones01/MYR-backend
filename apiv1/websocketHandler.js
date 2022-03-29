let Conns = require("./models/ConnectionModel");
const SceneSaveEventHandlers = require("./websocketEvents/sceneSave");

/**
 * 
 * @param {} sockets 
 */
function setupSockets(sockets) {
    sockets.on("connection", (socket) => {
        socket_route(socket, "save", SceneSaveEventHandlers.save, sockets.sockets);
        socket_route(socket, "scene", SceneSaveEventHandlers.scene, sockets.sockets);
        socket_route(socket, "disconnect", SceneSaveEventHandlers.disconnect, sockets.sockets);
    });
    Conns.deleteMany({}).catch((err) => {
        console.error(`Error cleaning connection database: ${err}`);
    });
}

function socket_route(socket, event, fn, socketList) {
    socket.on(event, async (payload) => {
        console.log(`Hit ${event}!`);
        await fn(socket, payload, socketList);
    });
}

module.exports = setupSockets;