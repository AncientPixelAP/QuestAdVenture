import TextButton from "./button.js";
import Quest from "./quest.js";

export default class Hero{
    constructor(_scene, _id, _pos, _data) {
        this.scene = _scene;
        this.pos = _pos;
        this.data = _data;
        this.id = _id;

        /*
        this object manages fighting on a quest and has a personal seperate quest object called timer if it levels up or is healing
        the three buttons btnA, btnB and btnC get shown depending on its state and allow for the different interactions
        */

        this.atk = this.data.stats.atk;
        this.def = this.data.stats.def;
        this.hp = this.data.stats.hp;
        this.maxHp = this.data.stats.maxHp;
        this.upgradeCost = {
            gold: this.data.cost.upgrade.gold,
            loot: this.data.cost.upgrade.loot,
            food: this.data.cost.upgrade.food,
        }
        this.level = 1;

        this.upgradeGrowth = 0.9;
        this.levelGrowth = 9;

        this.unlocked = false;
        this.assigned = false;
        this.knockedOut = false;
        this.showsOptions = false;
        this.quest = null;
        this.questId = -1;//used for the savegame as a shorthand for the questobject from which to read

        //a personal quest object use as a timer for healing and upgrades
        this.timer = new Quest(this.scene, 999, { x: (this.scene.game.config.width * 2), y: (this.scene.game.config.height * -0.5) + 128 }, {
            name: "Heal a Hero",
            asset: "sprQuestTavern",
            description: "Heal a Hero",
            stats: {
                atk: 0,
                def: 0,
                time: 60
            },
            cost: {
                quest: {
                    gold: 0,
                    loot: 0,
                    food: 0
                },
                unlock: {
                    gold: 0,
                    loot: 0,
                    food: 0
                }
            },
            reward: {
                gold: 0,
                loot: 0,
                food: 0
            },
            levelRequirement: 0
        });

        this.states = {
            forHire: 0,
            idle: 1,
            onQuest: 2,
            knockedOut: 3
        }
        this.state = this.states.forHire;

        this.name = this.scene.add.text(this.pos.x, this.pos.y + 76, _data.name, TEXTSTYLENAME).setOrigin(0.5);
        this.sprite = this.scene.add.sprite(this.pos.x, this.pos.y+64, this.data.asset).setOrigin(0.5, 1);
        this.spriteHire = this.scene.add.sprite(this.pos.x, this.pos.y+64, "sprBtnHire").setOrigin(0.5, 1);

        this.description = this.scene.add.text(0, -16, _data.description + "\n" + this.getStatsString(), TEXTSTYLEDESCRIPTION).setOrigin(0.5, 1);
        this.description.alpha = 0;
        this.statsText = this.scene.add.text(0, 0, this.atk, TEXTSTYLEDESCRIPTION).setOrigin(0.5);
        this.statsText.alpha = 0;

        this.healthBar = this.scene.add.graphics({ x: 0, y: 16 });
        this.healthBar.fillStyle(0xfff1e8);
        this.healthBar.fillRect(-128, -6, 256, 12);
        this.healthBar.alpha = 0;

        this.progressBar = this.scene.add.graphics({ x: 0, y: 32 });
        this.progressBar.fillStyle(0xfff1e8);
        this.progressBar.fillRect(-128, -6, 256, 12);
        this.progressBar.alpha = 0;
        this.damage(0);

        this.btnA = new TextButton(this.scene, { x: -96, y: 72 }, "sprBtnLowWood", "Quest", () => {
            this.scene.player.lastHero = this;
            this.scene.showMap();
        });
        this.btnA.setActive(false, true);

        this.btnB = new TextButton(this.scene, { x: 0, y: 72 }, "sprBtnLowWood", "upgrade", () => {
            this.upgrade();
            console.log(this);
        });
        this.btnB.setActive(false, true);

        this.btnC = new TextButton(this.scene, { x: 96, y: 72 }, "sprBtnLowWood", "heal", () => {
            this.heal();
            this.showOptions();
        });
        this.btnC.setActive(false, true);

        //SETUP INTERACTIONS
        this.sprite.setInteractive();
        this.sprite.on("pointerdown", () => {
            this.scene.description.alpha = 0;
            //this.tweenPortraitFadeOut.restart();
            for(let h of this.scene.heroes){
                h.hideOptions();
            }
            this.showOptions();
        }, this);
    }

    update(){
        this.timer.update();

        this.progressBar.clear();
        if(this.quest !== null){
            this.progressBar.fillStyle(0xfff1e8);
            this.progressBar.fillRect(-128, -6, 256, 12);
            this.progressBar.fillStyle(0x008751);
            this.progressBar.fillRect(-128, -6, this.quest.progress * 256, 12);
        }
    }

    showOptions(){
        //this.scene.description.alpha = 0;

        this.showsOptions = true;
        this.description.alpha = 1;
        this.sprite.setScale(1.5);
        this.spriteHire.setScale(1.5);
        
        this.healthBar.alpha = 1;
        if(this.quest !== null){
            this.progressBar.alpha = 1;
        }

        if(this.unlocked === false){
            this.description.setText(this.data.description + "\n" + String(this.data.cost.hire.gold) + "GD");
        }else{
            this.description.setText(this.data.description + "\n" + this.getStatsString());
        }

        this.btnA.setActive(true, false);
        this.btnC.setActive(false, true);
        switch(this.state){
            case this.states.forHire:
                this.btnA.setText("hire");
                this.btnA.setFunction(() => {
                    if(this.scene.player.ressources.gold >= this.data.cost.hire.gold){
                        this.scene.player.buy({gold: this.data.cost.hire.gold, loot: 0, food: 0});
                        this.unlock();
                        this.showOptions();
                        this.state = this.states.idle;
                    }else{
                        console.warn("not enough gold to hire that hero")
                    }
                });
                this.btnB.setActive(false, true);
            break;
            case this.states.idle:
                //show quest button
                this.btnA.setText("quest");
                this.btnA.setFunction(() => {
                    this.scene.player.lastHero = this;
                    for(let q of this.scene.quests){
                        q.checkLevelRequirement(this.level);
                    }
                    this.scene.showMap();
                });
                //show upgrade button
                this.btnB.setActive(false, true);
                this.description.setText(this.data.description + "\n" + this.getStatsString() + "\n" + this.getUpgradeString() + " to upgrade");
                if (this.scene.player.checkCost(this.upgradeCost) === true) {
                    this.btnB.setActive(true, false);
                    this.btnB.setText("upgrade");
                    this.btnB.setFunction(() => {
                        this.upgrade();
                        this.showOptions();
                    });
                }
                ///show heal button
                if(this.hp < this.maxHp){
                    this.btnC.setActive(true, false);
                }
            break;
            case this.states.onQuest:
                this.btnA.setText("map");
                this.btnA.setFunction(() => {
                    this.scene.player.lastHero = this;
                    this.scene.showMap();
                });
                if(this.quest !== null){
                    this.btnB.setActive(true, false);
                    this.btnB.setText(this.quest.toStop === false ? "stop" : "wait");
                    this.btnB.setFunction(() => {
                        this.quest.stop();
                        this.btnB.setActive(false, false);
                        this.btnB.setText("wait");
                        this.showOptions();
                    });
                }
            break;
            case this.states.knockedOut:
                this.btnA.setText("heal");
                this.btnA.setFunction(() => {
                    this.heal();
                    this.showOptions();
                });
                this.btnB.setActive(false, true);
            break;
            default:
            break;
        }

    }

    hideOptions() {
        this.showsOptions = false;
        this.description.alpha = 0;
        this.sprite.setScale(0.5);
        this.spriteHire.setScale(1);

        this.healthBar.alpha = 0;
        this.progressBar.alpha = 0;
        this.btnA.setActive(false, true);
        this.btnB.setActive(false, true);
        this.btnC.setActive(false, true);
    }

    unlock(){
        this.unlocked = true;
        this.spriteHire.alpha = 0;
        this.state = this.states.idle;
    }

    upgrade(){
        this.level += 1;
        //this.hp = this.data.stats.hp * this.level; //<--uncomment to heal on upgrade
        this.maxHp = this.data.stats.maxHp * this.level;
        this.atk = this.data.stats.atk * this.level;
        this.def = this.data.stats.def * this.level;
        
        let modifier = (this.level * this.upgradeGrowth);
        this.upgradeCost.gold = Math.floor(this.data.cost.upgrade.gold * modifier);
        this.upgradeCost.loot = Math.floor(this.data.cost.upgrade.loot * modifier);
        this.upgradeCost.food = Math.floor(this.data.cost.upgrade.food * modifier);
        this.damage(0);

        this.timer.data.stats.time = this.level * this.levelGrowth;
        this.timer.assignHero(this);
        this.timer.stop();
    }

    heal() {
        this.knockedOut = false;
        this.hp = this.maxHp;
        this.state = this.states.idle;
        this.damage(0);

        this.timer.data.stats.time = 1;//(this.maxHp - this.hp) * 3;
        this.timer.assignHero(this);
        this.timer.stop();
    }

    damage(_dmg) {
        this.hp = Math.max(0, this.hp - Math.max(0, _dmg - this.def));
        this.description.setText(this.data.description + "\n" + this.getStatsString());

        let pct = this.hp / this.maxHp;
        this.healthBar.clear();
        this.healthBar.fillStyle(0xfff1e8);
        this.healthBar.fillRect(-128, -6, 256, 12);
        this.healthBar.fillStyle(0xff004d);
        this.healthBar.fillRect(-128, -6, pct * 256, 12);

        if (this.hp <= 0) {
            this.knockedOut = true;
            this.state = this.states.knockedOut;
            //TODO show Options but only if it is thec current shown hero
            if (this.showsOptions === true) {
                this.showOptions();
            }
        }
    }

    getStatsString() {
        let hp = this.hp  % 1 === 0 ? this.hp : this.hp.toFixed(1);
        return numeral(this.atk).format("0,000a") + " ATK | " + numeral(this.def).format("0,000a") + " DEF | " + numeral(hp).format("0,000a") + " HP | " + numeral(this.level).format("0,000a") + " LVL";
    }

    getUpgradeString(){
        let g = this.upgradeCost.gold > 0 ? numeral(this.upgradeCost.gold).format("0,000a") + " GD | " : "";
        let l = this.upgradeCost.loot > 0 ? numeral(this.upgradeCost.loot).format("0,000a") + " LT | " : "";
        let f = this.upgradeCost.gold > 0 ? numeral(this.upgradeCost.food).format("0,000a") + " FD " : "";
        return g + l + f;
    }

    assignQuest(_quest){
        this.assigned = true;
        this.quest = _quest;
        this.questId = _quest.id;
        this.state = this.states.onQuest;
        this.showOptions();
    }

    unassignQuest(){
        this.assigned = false;
        this.quest = null;
        this.questId = -1;
        this.state = this.states.idle;
        if(this.hp <= 0){
            this.state = this.states.knockedOut;
        }
        if(this.showsOptions === true){
            this.showOptions();
        }
    }

    load(_data){
        if(_data.unlocked === true){
            this.unlock();
            //upgrade to the appropiate saved level
            this.level = _data.level;
            this.maxHp = this.data.stats.maxHp * this.level;
            this.hp = _data.hp;
            this.atk = this.data.stats.atk * this.level;
            this.def = this.data.stats.def * this.level;

            let modifier = (this.level * this.upgradeGrowth);
            this.upgradeCost.gold = Math.floor(this.data.cost.upgrade.gold * modifier);
            this.upgradeCost.loot = Math.floor(this.data.cost.upgrade.loot * modifier);
            this.upgradeCost.food = Math.floor(this.data.cost.upgrade.food * modifier);
            this.damage(0);

            this.timer.data.stats.time = this.level * this.levelGrowth;
            this.timer.load(_data.timer);
        }
    }
    
}