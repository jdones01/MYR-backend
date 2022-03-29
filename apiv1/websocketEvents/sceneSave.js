let Conns = require("../models/ConnectionModel");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports = {
    save: async (socket, _, socketList) => {
        let conns;
        try{
            conns = await Conns.findOne({clientIDs: socket.id});
        }catch(err){
            socket.emit("error", err);
            return;
        }
        conns.clientIDs.forEach(id => {
            if(id !== socket.id){
                console.log(`Updating ${socket.id}`);
                let remote = socketList.get(id);
                remote.emit("update");
            }
        });
    },
    scene: async (socket, sceneID, _) => {
        if(typeof(sceneID) !== "string"){
            return;
        }
    
        let connDoc;
        try{
            connDoc = await Conns.findOne({sceneID: ObjectID(sceneID)});
        }catch(err){
            socket.emit("error", err);
        }
    
        if(!connDoc){
            try{
                await Conns.create({
                    sceneID: ObjectID(sceneID),
                    clientIDs: [
                        socket.id
                    ]
                });
            }catch(err){
                socket.emit("error", err);
            }
        } else {
    
            try{
                await connDoc.update({
                    "$push": {
                        "clientIDs": socket.id
                    }
                });
            }catch(err){
                socket.emit("error", err);
            }
        }
        return;
    },
    disconnect: async (socket, _, __) => {
        try{
            await Conns.updateOne({
                clientIDs: socket.id
            }, {
                "$pull": {
                    clientIDs: socket.id
                }
            });
        }catch(err){
            console.error(`Could not remove connection ${socket.id} from the database: ${err}`);
        }
    }
};