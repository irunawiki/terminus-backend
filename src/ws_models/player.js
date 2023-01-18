import PLAYER_STATE from "../states/player.js";


export default class Player {
    constructor(playerId) {
        this.playerId = playerId;
        this.username = "";
        this.state = PLAYER_STATE.WAITING;

        this.fighters = [];
        this.supports = [];

        this.activeFighter = null;
        this.lockedFighter = false;
        this.activeFighterIndex = -1;

        this.turn = -1; // turn 0 = defending, turn 1 = attacking

        this.numberOfSupportDraw = 0;

        this.connection = null;
    }


    useSupport(supportCardIndex) {
        this.numberOfSupportDraw += 1;
        const supportScript = [this.supports[supportCardIndex]];
        this.supports.splice(supportCardIndex, 1);
        this.activeFighter.loadSupportItems(supportScript);
    }


    /**
     * When new match start, refresh
     */
    refreshNewPhase() {
        this.lockedFighter = false;
        this.numberOfSupportDraw = 0;
        this.turn = -1;
        this.activeFighter = null;
        this.activeFighterIndex = -1;
    }

    toJSON() {
        return {
            playerId: this.playerId,
            state: this.state,
            username: this.username,
            fighters: this.getFighterJSON(),
            supports: this.supports,
            activeFighter: this.activeFighter ? this.activeFighter.toJSON() : null,
            isAttacking: this.isAttacking()
        }
    }

    getFighterJSON() {
        let tempJSON = [];
        this.fighters.forEach((fighter) => {
            tempJSON.push(fighter.toJSON());
        })
        return tempJSON;
    }
    /**
     * set player name in this specified room only
     */
    setRoomPlayerName(username) {
        this.username = username;
    }

    setPlayerState(state) {
        this.state = state;
    }

    hasState(state) {
        return this.state === state;
    }

    setFighters(fighters) {
        fighters.forEach((fighter) => {
            fighter.connection = this.connection;
        })
        this.fighters = fighters
    }

    setSupports(supports) {
        this.supports = supports;
    }

    setActiveFighterByIndex(index) {
        this.activeFighterIndex = index;
        this.setActiveFighter(this.fighters[index]);
    }

    setActiveFighter(fighter) {
        this.activeFighter = fighter;
    }

    lockFighter() {
        this.lockedFighter = true;
        this.fighters = this.fighters.splice(this.activeFighterIndex, 1); // remove fighter
    }

    setAttacking(bool) {
        if(bool) {
            this.turn = 1;
            return;
        }
        this.turn = 0;
        return
    }

    isAttacking() {
        return this.turn === 1;
    }
}