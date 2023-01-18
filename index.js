import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import Room from './src/ws_models/room.js';

const wss = new WebSocketServer({ port: 5000 });
const activeRoom = [];


function generateRoomId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function findPlayerRoom(ws) {
    if (!ws.roomId) return null;
    for (const room of activeRoom) {
        if(room.roomId == ws.roomId) {
            return room;
        }
    }
    return null;
}

wss.on('connection', function connection(ws) {

    /**
     * Declaration of custom attributes
     */
    ws.clientId = uuidv4();
    ws.inRoom = false;
    ws.roomId = null;

    ws.sendJSON = (obj) => {
        ws.send(JSON.stringify(obj))
    }




    const handleRoomCreateSuccess = () => {
        const room = new Room(generateRoomId(6))
        activeRoom.push(room)
        
        const response = {
            type: "room:create_success",
            params: {roomId: room.roomId}
        }
        ws.send(JSON.stringify(response))
    }

    const handleRoomJoin = (data) => {
        if (ws.inRoom) {
            ws.sendJSON({
                type: "room:join",
                params: {error: true, message: "Unable to join new room"}
            })
            return;
        }
        for (const room of activeRoom) {
            if(room.roomId == data.params.roomId) {
                const player = room.addPlayer(ws);
                if (player) {
                    ws.inRoom = true;
                }
                ws.roomId = data.params.roomId
                ws.sendJSON({
                    type: "room:join",
                    params: {
                        error: false, 
                        message: "Successfully join room",
                        playerData: player.toJSON(),
                        roomData: room.toJSON()
                    }
                })
                room.emitRoomStatus()
                return;
            }
        }
        return;
    }

    const handlePlayerReady = () => {
        const room = findPlayerRoom(ws);
        if (!room) return;
        room.setPlayerReady(ws);

    }

    const handlePlayerDeckReady = () => {
        const room = findPlayerRoom(ws);
        if (!room) return;
        room.setPlayerDeckReady(ws);
    }

    const handlePlayerPickFighter = (data) => {
        const fighterIdx = data.params.fighter;
        const room = findPlayerRoom(ws);
        if (!room) return;
        room.setPlayerFighter(ws, fighterIdx);
    }

    const handlePlayerPickSupport = (data) => {
        const supportIdx = data.params.support;
        const room = findPlayerRoom(ws);
        if (!room) return;
        room.usePlayerSupport(ws, supportIdx);
    }

    const handlePlayerMatchReady = () => {
        const room = findPlayerRoom(ws);
        if (!room) return;
        room.setPlayerMatchReady(ws)
    }

    const handlePlayerLockFighter = () => {
        const room = findPlayerRoom(ws);
        if (!room) return;
        room.lockPlayerFighter(ws);
    }

    const handlePlayerUseSkill = (data) => {
        const skillIdx = data.params.skill;
        const room = findPlayerRoom(ws);
        if (!room) return;
        room.useFighterSkill(ws, skillIdx)
    }

    ws.on('message', function message(data) {
        data = JSON.parse(data)
        switch(data.type) {
            case "player:create":
                break;

            case "room:create":
                if (ws.inRoom) {
                    ws.sendJSON({
                        type: "room:join",
                        params: {error: true, message: "Unable to join new room"}
                    })
                    break;
                }
                handleRoomCreateSuccess() // send back room create success
                break;

            case "room:join":
                handleRoomJoin(data);
                break;
            
            case "player:ready":
                handlePlayerReady()
                break;
            case "player:deck-ready":
                handlePlayerDeckReady();
                break;
            case "player:pick-fighter":
                handlePlayerPickFighter(data);
                break;
            case "player:lock-fighter":
                handlePlayerLockFighter();
                break;
            case "player:pick-support":
                handlePlayerPickSupport(data)
                break;
            case "player:match-ready":
                handlePlayerMatchReady()
                break;
            case "player:use-skill":
                handlePlayerUseSkill(data)
                break;
        }
    });
});