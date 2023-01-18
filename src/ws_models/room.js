import PLAYER_STATE from "../states/player.js";
import ROOM_STATE from "../states/room.js";
import Player from "./player.js";

import fighterJSON from "../../game_data/fighter.js";
import supportJSON from "../../game_data/support.js";
import Fighter from "./fighter.js";

class Room {
    constructor(roomId) {
        this.roomId = roomId;
        this.connections = [];
        this.players = [];
        this.state = ROOM_STATE.WAITING_FOR_PLAYER;
        this.roomIdCounter = 0;

        this.messages = [];
        this.playerTurnIndex = -1;

    }

    toJSON() {
        const tempPlayer = [];

        [...this.players].forEach((player) => {
            tempPlayer.push(player.toJSON());
        })

        return {
            "roomId": this.roomId,
            "state": this.state,
            "players": tempPlayer,
            "messages": this.messages
        }
    }

    /**
     * 
     * @param {*} connection 
     * @returns player or null indicate if successful or not
     */
    addPlayer(connection) {
        if (this.players.length === 2) {
            return null;
        }
        this.connections.push(connection)
        const player = new Player(connection.clientId)
        player.connection = connection;
        player.setRoomPlayerName(`Player ${this.roomIdCounter + 1}`);

        this.roomIdCounter += 1;
        this.players.push(player);
        return player;
    }


    addMessage(message) {
        this.connections.forEach((connection) => {
            connection.send(JSON.stringify({
                "type": "room:message",
                "params": {message: message}
            }))
        })
    }


    /**
     * All player must be ready before rolling card
     * @param {*} ws 
     */
    setPlayerReady(ws) {
        this.players.forEach((player) => {
            if(player.playerId === ws.clientId) {
                player.setPlayerState(PLAYER_STATE.READY);
            }
        });

        if (this.isAllPlayerReady()) {
            this.drawPlayerFighterCard();
            this.drawPlayerSupportCard();

            this.setGameState(ROOM_STATE.DECK_READY);

            this.updateAllPlayerState(PLAYER_STATE.PREPARE_DECK);

            this.emitRoomStatus();
            this.emitRoomState();
            this.emitRoomPlayerUpdate();
        }
    }

    /**
     * All Player must have view their deck and ready to play
     */
    setPlayerDeckReady(ws) {
        
        this.players.forEach((player) => {
            if(player.playerId === ws.clientId) {
                player.setPlayerState(PLAYER_STATE.DECK_READY);
            }
        });
        if(this.isAllPlayerDeckReady()) {
            this.setGameState(ROOM_STATE.PLAYING);
            this.updateAllPlayerState(PLAYER_STATE.PICK_FIGHTER);
            this.update()
        }
       
    }

    updateAllPlayerState(state) {
        this.players[0].setPlayerState(state);
        this.players[1].setPlayerState(state);
    }

    /**
     * Draw fighter card for both player
     */
    drawPlayerFighterCard() {
        let fighters = this.drawFighterCard();
        this.players[0].setFighters(fighters);

        fighters = this.drawFighterCard();
        this.players[1].setFighters(fighters);
    }


    drawPlayerSupportCard() {
        let supports = this.drawSupportCard();
        this.players[0].setSupports(supports);

        supports = this.drawSupportCard();
        this.players[1].setSupports(supports);
    }

    /**
     * Chech if all player are ready before match start
     * @returns 
     */
    isAllPlayerReady() {
        for(const player of this.players) {
            if (player.state !== PLAYER_STATE.READY) {
                return false;
            }
        }
        return true;
    }

    /**
     * Chech if all player are ready before first phase pick
     * @returns 
     */
    isAllPlayerDeckReady() {
        for(const player of this.players) {
            if (player.state !== PLAYER_STATE.DECK_READY) {
                return false;
            }
        }
        return true;
    }

    drawFighterCardByRarity(rarity) {
        const fighters = fighterJSON.filter((fighter) => fighter.rarity === rarity);
        const randIndex = Math.floor(Math.random() * fighters.length);
        const fighter = new Fighter(fighters[randIndex]);
        return fighter;
    }

    drawFighterCard() {
        /*const rarityProbability = {
            3: 0.05,
            2: 0.25,
            1: 0.7
        }*/
        const fighterMax = 3;
        const fighterChosen = [];
        for(let i = 0; i < fighterMax; i++) {
            const rand = Math.random();
            if(rand < 0.05) {
                const fighter = this.drawFighterCardByRarity(3);
                fighterChosen.push(fighter)
            } else if (rand < 0.25) {
                const fighter = this.drawFighterCardByRarity(2);
                fighterChosen.push(fighter)
            } else {
                const fighter = this.drawFighterCardByRarity(1);
                fighterChosen.push(fighter)
            }
        }

        return fighterChosen;
        
    }

    drawSupportCard() {
        let supportCards = [];
        for(let i = 0; i < 7; i++) {
            const randIndex = Math.floor(Math.random() * supportJSON.length);
            const card = supportJSON[randIndex];
            supportCards.push(card);
        }
        return supportCards;
    }

    setPlayerFighter(ws, fighterIndex) {
        const player = this.usePlayer(ws);
        if (!player.lockedFighter) {
            this.addMessage(`${player.username} picked ${player.fighters[fighterIndex].name}`)
            player.setActiveFighterByIndex(fighterIndex);
        }
        this.update()
    }

    /**
     * Return player of this connection
     * @param {*} ws 
     */
    usePlayer(ws) {
        for(const player of this.players) {
            if(player.playerId === ws.clientId) {
                return player;
            }
        }
    }

    usePlayerSupport(ws, supportIndex) {
        const player = this.usePlayer(ws);
        this.addMessage(`${player.username} used ${player.supports[supportIndex].name} support card!`);
        player.useSupport(supportIndex);
        this.update()
        if (player.numberOfSupportDraw === 3) {
            this.setPlayerMatchReady(ws);
        }

    }

    useEnemy(ws) {
        for(const player of this.players) {
            if(player.playerId !== ws.clientId) {
                return player;
            }
        }
    }

    useFighterSkill(ws, skillIndex) {
        const player = this.usePlayer(ws);
        const enemy = this.useEnemy(ws);
        player.activeFighter.useSkill(skillIndex, enemy.activeFighter);
        this.nextTurn();
        this.updatePlayerTurn();
        this.update();
    }

    isMatchReady() {
        for(const player of this.players) {
            if(!player.hasState(PLAYER_STATE.MATCH_READY)) {
                return false
            }
        }
        return true;
    }

    setPlayerMatchReady(ws) {
        const player = this.usePlayer(ws);
        player.setPlayerState(PLAYER_STATE.MATCH_READY);
        this.addMessage(`${player.username} is ready to play!`);
        this.update()
        if(this.isMatchReady()) {
            this.updateAllPlayerState(PLAYER_STATE.PLAYING);
            this.nextTurn();
            this.updatePlayerTurn();
            this.update();
        }
    }

    update() {
        this.emitRoomStatus();
        this.emitRoomPlayerUpdate();
    }


    lockPlayerFighter(ws) {
        const player = this.usePlayer(ws);

        if(!player.lockedFighter) {
            player.lockFighter();
            this.addMessage(`${player.username} locked fighter`)
            player.setPlayerState(PLAYER_STATE.PICK_SUPPORT);
            this.emitRoomStatus();
            this.emitRoomPlayerUpdate();
        }
    }


    emitRoomState() {
        this.connections.forEach((connection) => {
            connection.send(JSON.stringify(
                {
                    type: "room:state",
                    params: {state: this.state}
                }
            ))
        })
    }

    emitRoomPlayerUpdate() {
        this.connections.forEach((connection) => {
            this.players.forEach((player) => {
                if (connection.clientId === player.playerId) {
                    connection.send(JSON.stringify({
                        "type": "player:update",
                        "params": {playerData: player.toJSON()}
                    }))
                }
            })
        })
    }

    /**
     * Send socket request to all player updated room data
     */
    emitRoomStatus() {
        this.connections.forEach((connection) => {
            connection.send(JSON.stringify(
                {
                    type: "room:status",
                    params: {roomData: this.toJSON()}
                }
            ))
        })
    }

    setGameState(state) {
        this.state = state;
    }

    updatePlayerTurn() {
        this.players[this.playerTurnIndex].setAttacking(true) // attacking
        if(this.playerTurnIndex === 1) {
            this.players[0].setAttacking(false);
            return
        }
        this.players[1].setAttacking(false);
        return
    }

    nextTurn() {
        if(this.playerTurnIndex === -1) { // initial roll
            const rand = Math.random();
            if(rand < 0.5) {
                this.playerTurnIndex = 0;
                return;
            } 
            this.playerTurnIndex = 1;
            return
        }

        if(this.playerTurnIndex === 1) {
            this.playerTurnIndex = 0;
            return
        }
        this.playerTurnIndex = 1;
        return
    }
}

export default Room;