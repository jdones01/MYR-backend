const CanvasMap = require("../models/CanvasMapping");


module.exports = {
    register_canvas: async (socket, payload, socketList) => {
        const socketid = JSON.parse(payload)["scene_socket"];

        if(!socketList.get(socketid)) {
            socket.emit("error", "Could not find assocaited socket");
            return;
        }

        try {
            await CanvasMap.create({
                code_socket: socketid,
                canvas_socket: socket.id
            });
        }catch(err) {
            socket.emit("error", err);
        }
    },

    send_data: async (socket, payload, socketList) => {
        let canvas_socket;
        try {
            const socketMap = await CanvasMap.findOne({code_socket: socket.id});
            canvas_socket = socketList.get(socketMap.canvas_socket);
        }catch(err) {
            socket.emit("error", err);
            return;
        }

        if(!canvas_socket) {
            socket.emit("error", "No canvas socket assocated with this instance");
            return;
        }

        canvas_socket.emit("update", payload);
    },

    remove_socket: async (socket) => {
        await CanvasMap.deleteOne({
            "$or": [
                {canvas_socket: socket.id},
                {code_socket: socket.id}
            ],
        });
    }
};