export default class Skill {
    constructor(data) {
        this.name = data.name;
        this.level = data.level;
        this.energy = data.energy;
        this.element = data.element;
        this.script = data.script;
        this.description = data.description;
    }

    toJSON() {
        return {
            "name": this.name,
            "level": this.level,
            "energy": this.energy,
            "description": this.description
        }
    }

    applyParams(scripts) {
        let stats = {}
        for(const script of scripts) {
            const scriptParams = script.split("_");
            switch(scriptParams[0]) {
                case "atk":
                    stats.atk = parseInt(scriptParams[1])
                    break;
                case "def":
                    stats.def = parseInt(scriptParams[1])
                    break;
            }
        }

        return stats;

    }
    execute(self, target) {
        const scriptCommand = this.script.split(',');
        for(const [index, script] of scriptCommand.entries()) {
            const scriptParams = script.split("_");

            var percentage;
            var atk;
            var dmgReceive;
            switch(scriptParams[0]) {
                case "dmg":
                    percentage = parseInt(scriptParams[1]);
                    atk = self.getCurrentAtk() * percentage / 100;
                    let critFlag = false;
                    dmgReceive = atk * (atk + 100) * 0.05 / (target.getCurrentDef() + 5);
                    if (dmgReceive < 1) {
                        dmgReceive = 1;
                    }
                    dmgReceive = dmgReceive - (dmgReceive * target.getCurrentResistance() / 100);

                    let rand = Math.random();
                    if(rand <= self.getCurrentCriticalRate() / 100) {
                        critFlag = true;
                        dmgReceive = dmgReceive * 1.5
                    }

                    dmgReceive = Math.floor(dmgReceive);

                    target.hp -= dmgReceive
                    if(target.hp < 0) {
                        target.hp = 0;
                    }

                    self.connection.send(JSON.stringify({
                        type: "room:message",
                        params: {message:  `You dealt ${dmgReceive}${critFlag ? ' critical': ''} damages to ${target.name}`}
                    }));


                    target.connection.send(JSON.stringify({
                        type: "room:message",
                        params: {message:  `You received ${dmgReceive}${critFlag ? ' critical': ''} damages from ${self.name}`}
                    }))
                    break;

                case "dmgCut":
                    percentage = parseInt(scriptParams[1]);
                    atk = target.maxhp * percentage / 100;
                    dmgReceive = atk;
                    target.hp -= dmgReceive
                    if(target.hp < 0) {
                        target.hp = 0;
                    }
                    break;

                case "runChange":
                    let continuous_script = scriptCommand.slice(index + 1);
                    let continuous_effects = this.applyParams(continuous_script);
                    let scriptObj = {
                        id: parseInt(scriptParams[1]),
                        turns: parseInt(scriptParams[2]),
                        script: continuous_effects
                    }
                    if (scriptParams[3] == 0) {
                        self.addContinuousEffect(scriptObj);
                        return;
                    } else {
                        target.addContinuousEffect(scriptObj);
                        return;
                    }
                case "atk":
                    self.bAtk += parseInt(scriptParams[1])
                    break;
                case "def":
                    self.bDef += parseInt(scriptParams[1])
                    break;
                case "hpRate":
                    self.maxhp += Math.floor(self.maxhp * parseInt(scriptParams[1]) / 100)
                    break;
                case "maxEnergy":
                    self.maxEnergy += parseInt(scriptParams[1]);
                    break;
                case "heal":
                    self.hp += parseInt(scriptParams[1]);
                    if(self.hp > self.maxhp) {
                        self.hp = self.maxhp
                    }
                    break;
                case "revive":
                    // recover full hp, mp
                    self.hp = self.maxhp;
                    self.energy = self.maxEnergy;
                    break;
            }
        }
    }
}