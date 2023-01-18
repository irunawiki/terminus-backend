const SkillJSON = [
    {
        "name": "Slash",
        "level": 1,
        "script": "dmg_100",
        "description": "Slash!",
        "element": 0,
        "energy": 1
    },
    {
        "name": "Fireball",
        "level": 1,
        "script": "dmg_100",
        "description": "Shoot a fireball",
        "element": 1,
        "energy": 1
    },
    {
        "name": "Fireball",
        "level": 2,
        "script": "dmg_110",
        "description": "Shoot a fireball",
        "element": 1,
        "energy": 1
    },
    {
        "name": "Fireball",
        "level": 3,
        "script": "dmg_120",
        "description": "Shoot a fireball",
        "element": 1,
        "energy": 2
    },
    {
        "name": "Bless",
        "level": 1,
        "script": "heal_20",
        "element": 0,
        "description": "Heal 20 HP",
        "energy": 1
    },
    {
        "name": "Bless",
        "level": 2,
        "script": "heal_40",
        "element": 0,
        "description": "Heal 40 HP",
        "energy": 2
    },
    {
        "name": "Bless",
        "level": 3,
        "script": "heal_50",
        "element": 0,
        "description": "Heal 50 HP",
        "energy": 3
    },
    {
        "name": "Fire Shot",
        "level": 1,
        "script": "dmg_120",
        "element": 1,
        "description": "Shoot a powerful fire shot",
        "energy": 2
    },
    {
        "name": "Fire Shot",
        "level": 2,
        "script": "dmg_150",
        "element": 1,
        "description": "Shoot a powerful fire shot",
        "energy": 3
    },
    {
        "name": "Fire Blast",
        "level": 1,
        "script": "dmgCut_30",
        "element": 1,
        "description": "Target HP reduce by 30%",
        "energy": 2
    },
    {
        "name": "Fire Blast",
        "level": 2,
        "script": "dmgCut_40",
        "element": 1,
        "description": "Target HP reduce by 40%",
        "energy": 3
    },
    {
        "name": "Max Guard",
        "level": 1,
        "element": 0,
        "script": "runChange_3_2_0,def_6,def_6",
        "description": "Increase Defense in the next 2 turns",
        "energy": 4
    },
    {
        "name": "Guard",
        "level": 1,
        "element": 0,
        "script": "runChange_3_1_0,def_8",
        "description": "Increase Defense next turn",
        "energy": 1
    },
    {
        "name": "Guard",
        "level": 2,
        "script": "runChange_3_1_0,def_15",
        "description": "Increase Defense next turn",
        "energy": 2
    },
    {
        "name": "Lightning Bolt",
        "level": 1,
        "element": 3,
        "script": "dmg_60,runChange_1_1_1,atk_-5",
        "description": "Decrease target attack next turn",
        "energy": 2
    },
    {
        "name": "Lightning Bolt",
        "level": 2,
        "element": 3,
        "script": "dmg_70,runChange_1_1_1,atk_-5",
        "description": "Decrease target attack next turn",
        "energy": 4
    },
    {
        "name": "Curse",
        "level": 1,
        "element": 0,
        "script": "dmg_50,runChange_2_1_0,def_5,atk_5",
        "description": "Deal significantly less damage but...",
        "energy": 5
    },
    {
        "name": "Power Up",
        "level": 1,
        "script": "atk_20",
        "element": 0,
        "description": "power has been strengthened!",
        "energy": 5
    },
    {
        "name": "Miracle Eye",
        "level": 1,
        "script": "dmg_70",
        "element": 0,
        "description": "Stare at you.",
        "energy": 1
    },
    {
        "name": "Bite",
        "level": 1,
        "script": "dmg_100",
        "element": 0,
        "description": "Bite!",
        "energy": 1
    },
    {
        "name": "Water Boom",
        "level": 1,
        "script": "dmg_100",
        "element": 2,
        "description": "Summon water",
        "energy": 1
    },
    {
        "name": "Holy Light",
        "level": 1,
        "script": "dmg_100",
        "element": 5,
        "description": "Summon holy light",
        "energy": 1
    },
    {
        "name": "Spell Boost",
        "level": 1,
        "element": 0,
        "script": "runChange_7_1_0,atkRate_40",
        "description": "Increase atk next turn",
        "energy": 3,
    },
    {
        "name": "Dark Blast",
        "level": 1,
        "element": 6,
        "description": "Summon Dark Power",
        "energy": 1,
        "script": "dmg_100"
    },
    {
        "name": "Earthquake",
        "level": 1,
        "element": 4,
        "description": "Shake the ground",
        "energy": 2,
        "script": "dmg_130"
    },
    {
        "name": "Tsunami",
        "level": 1,
        "element": 2,
        "description": "Create a huge wave",
        "energy": 4,
        "script": "dmg_150"
    }
]

export default SkillJSON;