import SkillJSON from "../../game_data/skill.js";
import Skill from './skill.js';


export default class Fighter {
    constructor(data) {
        this.name = data.name;
        this.rarity = data.rarity;
        this.connection = null;

        this.maxhp = data.hp;
        this.hp = data.hp;
        this.def = data.def;
        this.atk = data.atk;
        this.image =  data.image;
        this.criticalRate = 10; // 10% crit
        this.resistance = 0 // dmg reduction rate


        this.energy = 20;
        this.maxEnergy = 20;

        this.bHp = data.hp;
        this.bDef = 0;
        this.bAtk = 0;
        this.bCriticalRate = 0;
        this.bResistance = 0;

        this.skills = this.loadSkill(data.skills);

        this.debuffs = [];
    }

    toJSON() {
        return {
            "name": this.name,
            "hp": this.hp,
            "maxhp": this.maxhp,
            "maxEnergy": this.maxEnergy,
            "energy": this.energy,
            "image": this.image,
            "skills": this.getSkillJSON()
        }
    }

    getSkillJSON() {
        let tempJSON = [];
        this.skills.forEach((skill => {
            tempJSON.push(skill.toJSON());
        }))
        return tempJSON;
    }

    getCurrentAtk() {
        let atk = this.atk + this.bAtk + this.getDebuffValueByName("atk");
        if (atk < 1) {
            atk = 1;
        }
        return atk;
    }

    getCurrentCriticalRate() {
        let rate = this.criticalRate + this.bCriticalRate + this.getDebuffValueByName("critical_rate");
        return rate;
    }

    getDebuffValueByName(value) {
        let result = 0;
        for(const debuff of this.debuffs) {
            if (debuff.script[value]) {
                result += debuff.script[value]
            }
        }
        return result;
    }

    nextTurn() {
        for(const [index, debuff] of this.debuffs.entries()) {
            this.debuffs[index].turn -= 1;
            if (this.debuffs[index].turn === 0) {
                this.debuffs.splice(index, 1);
            }
        }
    }

    getCurrentDef() {
        let def = this.def + this.bDef;
        if (def < 1) {
            def = 1;
        }
        return def;
    }

    getCurrentResistance() {
        let def = this.resistance + this.bResistance;
        return def;
    }


    addContinuousEffect(effects) {
        this.debuffs.push(effects);
    }

    /**
     * Format {"name": "hp protection", "description": "mydesc", "script": ""}
     * @param {*} supportScripts 
     */
    loadSupportItems(supportScripts) {
        supportScripts.forEach(script => {
            const skill = new Skill({script: script.script});
            skill.execute(this, {});
        });
    }


    /**
     * Load skill from skill.json
     * @param {*} skills 
     */
    loadSkill(skills) {
        let fighterSkills = []
        skills.forEach(skill => {
            const skillParams = skill.split("_");
            const skillName = skillParams[0];
            const skillLevel = skillParams[1];
            const skillObj = SkillJSON.find(skillJson => {
                return skillJson.name === skillName && skillJson.level == skillLevel;
            });

            fighterSkills.push(new Skill(skillObj));
        });
        return fighterSkills;
    }

    useSkill(skillIdx, target) {
        const skillEnergy = this.skills[skillIdx].energy
        if(this.energy >= skillEnergy) {
            this.skills[skillIdx].execute(this, target);
            this.energy -= skillEnergy
            this.checkContinuousEffect()
        }
    }

    /**
     * Remove effect when turn over
     */
    checkContinuousEffect() {
        for(const [index, debuff] of this.debuffs.entries()) {
            debuff.turn -= 1;
            if(debuff.turn === 0) {
                this.debuffs.splice(index, 0);
            }
        }
    }

}

/*const fighter = new Fighter({
    "name": "Agni",
    "image": "https://v1.irunawiki.com/images/monsters/agni.png",
    "rarity": 3,
    "hp": 250,
    "def": 20,
    "mdef": 20,
    "atk": 45,
    "matk": 30,
    "skills": ["Fireball_2", "Fire Blast_1"]
})

fighter.loadSupportItems("runChange_6_1_0,atk_10")
console.log(fighter.getCurrentAtk())

/*const exFighter = new Fighter({
    "name": "Enckels",
    "image": "https://v1.irunawiki.com/images/monsters/enckels.png",
    "rarity": 1,
    "hp": 80,
    "def": 5,
    "mdef": 5,
    "atk": 40,
    "matk": 40,
    "skills": ["Bite_1", "Lightning Bolt_1"]
})

exFighter.useSkill(1, fighter)*/
