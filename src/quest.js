import TextButton from "./button.js";

export default class Quest{
    constructor(_scene, _id, _pos, _data){
        this.scene = _scene;
        this.pos = _pos;
        this.data = _data;
        this.id = _id;

        /*
        this object receives a hero object, checks if the player object has enough ressources to go on the quest
        and may damage the hero, it manages all timing related to it and eventually stops the hero
        */

        this.hero = null;
        this.heroId = -1;//used by the savegame as a shorthand for the assigned hero
        this.lastClicked = 0;//is a timestamp of the last time this quest got clicked and used for progression calculations
        this.inProgress = false;
        this.prograss = 0;
        this.toStop = false;

        //some sprite for fluff to make the quest screen more appealing, this let the quests appear like they are connected on a map
        this.mapPath = this.scene.add.sprite(this.pos.x, this.pos.y + 64, "sprMapPath");
        this.mapPath.angle = -35 + (Math.random() * 70);
        this.mapPath.setScale(Math.random() < 0.5 ? 1 : -1, 1);

        this.name = this.scene.add.text(this.pos.x, this.pos.y + 76, _data.name, TEXTSTYLENAME).setOrigin(0.5);
        this.description = this.scene.add.text(this.pos.x + 256, this.pos.y - 32, _data.description, TEXTSTYLEDESCRIPTION).setOrigin(0.5, 1);
        
        this.timerText = this.scene.add.text(this.pos.x + 256, this.pos.y, this.getRewardString(), TEXTSTYLENAME).setOrigin(0.5);
        this.timerText.setColor("#1d2b53");
        this.timerText.depth = 10;
        this.sprite = this.scene.add.sprite(this.pos.x, this.pos.y, _data.asset);
        this.hideSprite = this.scene.add.sprite(this.pos.x, this.pos.y, "sprHideOverlay");
        this.heroSprite = this.scene.add.sprite(this.pos.x + 64, this.pos.y+48, _data.asset).setScale(0.5);
        this.heroSprite.alpha = 0;

        this.heroHealthBar = this.scene.add.graphics({ x: this.heroSprite.x, y: this.heroSprite.y + 32 });
        this.heroHealthBar.fillStyle(0xfff1e8);
        this.heroHealthBar.fillRect(-32, -6, 64, 12);
        this.heroHealthBar.alpha = 0;

        this.progressBar = this.scene.add.graphics({x: this.pos.x + 256, y: this.pos.y});
        this.progressBar.fillStyle(0xfff1e8);
        this.progressBar.fillRect(-128, -12, 256, 24);

        this.btnSend = new TextButton(this.scene, { x: this.pos.x + 172, y: this.pos.y + 46 }, "sprBtnLowWood", "send", () => {
            if(this.hero === null){
                this.assignHero(this.scene.player.lastHero);
            }else{
                this.stop();
            }
        });
        this.btnSend.setActive(false, true);

        //you can click on the btnSend or the image of the quest to start
        this.sprite.setInteractive();
        this.sprite.on("pointerdown", () => {
            //this.sprite.removeInteractive();
            //this.clicked();
            if (this.hero === null) {
                this.assignHero(this.scene.player.lastHero);
            }
        }, this);
    }

    update(){
        if(this.inProgress === true){
            let currentTime = Date.now();
            let diffTime = currentTime - this.lastClicked;

            //checks if enough time went by to determine the quest outcome by running the catchup function
            if(diffTime < this.data.stats.time * 1000){
                this.timerText.setText(String(this.data.stats.time - Math.floor(diffTime / 1000)));

                let pct = diffTime / (this.data.stats.time * 1000);
                this.progress = pct;
                this.progressBar.clear();
                this.progressBar.fillStyle(0xfff1e8);
                this.progressBar.fillRect(-128, -12, 256, 24);
                this.progressBar.fillStyle(0x008751);
                this.progressBar.fillRect(-128, -12, pct * 256, 24);
            }else{
                this.inProgress = false;
                this.progress = 0;
                this.progressBar.clear();
                this.progressBar.fillStyle(0xfff1e8);
                this.progressBar.fillRect(-128, -12, 256, 24);

                this.catchup(this.lastClicked);
            }
        }else{

        }
    }

    catchup(_oldTime){
        //checks how many time the quest was completet since the last time it got clicked
        let catchupTime = Date.now() - _oldTime;
        let secs = catchupTime / 1000;
        let amts = secs / this.data.stats.time;
        //console.log("catching up " + Math.floor(amts) + "x");
        stop: for(let i = 0 ; i < Math.floor(amts) ; i++){
            //do quest and damage hero
            //break if knocked out
            this.inProgress = false;
            this.resolve();
            if(this.hero === null){
                break stop;
            }
        }
    }

    refreshHeroHealthBar(){
        let pct = this.hero.hp / this.hero.maxHp;
        this.heroHealthBar.clear();
        this.heroHealthBar.fillStyle(0xfff1e8);
        this.heroHealthBar.fillRect(-32, -6, 64, 12);
        this.heroHealthBar.fillStyle(0xff004d);
        this.heroHealthBar.fillRect(-32, -6, pct * 64, 12);
    }

    clicked(){
        if(this.inProgress === false){
            if(this.scene.player.checkCost(this.data.cost.quest) === true){
                this.scene.player.buy(this.data.cost.quest);
                this.inProgress = true;
                this.lastClicked = Date.now();
            }else{
                this.toStop = true;
                this.unassignHero();
                this.timerText.setText(this.getRewardString());
            }
        }
    }

    resolve(){
        if (this.toStop === true) {
            this.toStop = false;
            this.unassignHero();
        }

        if (this.hero !== null) {
            this.hero.damage(this.data.stats.atk);
            this.refreshHeroHealthBar();

            if (this.hero.knockedOut === false) {
                this.clicked();
                this.scene.player.earnReward(this.data.reward);
            } else {
                this.unassignHero();
                this.timerText.setText(this.getRewardString());
            }
        } else {
            this.timerText.setText(this.getRewardString());
        }
    }

    assignHero(_hero){
        if(_hero !== null && _hero.assigned === false && _hero.state === _hero.states.idle){
            this.hero = _hero;
            this.heroId = _hero.id;
            this.hero.assignQuest(this);
            this.heroSprite.setTexture(_hero.sprite.texture.key);
            this.heroSprite.alpha = 1;
            this.refreshHeroHealthBar();
            this.heroHealthBar.alpha = 1;

            this.btnSend.setText("stop");
            this.clicked();
        }else{
            console.warn("no hero selected!");
        }
    }

    unassignHero(){
        this.hero.unassignQuest();
        this.hero = null;
        this.heroId = -1;
        this.heroSprite.alpha = 0;
        this.heroHealthBar.alpha = 0;
        this.btnSend.setText("send");
    }

    stop(){
        this.btnSend.setText("wait");
        this.toStop = true;
    }

    checkLevelRequirement(_level){
        if (_level < this.data.levelRequirement){
            this.hideSprite.alpha = 1;
            this.btnSend.setActive(false, true);
            this.description.setText("Locked: LVL " + String(this.data.levelRequirement));
        }else{
            this.hideSprite.alpha = 0;
            this.btnSend.setActive(true, false);

            //assess difficulty
            let hero = this.scene.player.lastHero
            let res = Math.max(0, hero.hp - Math.max(0, this.data.stats.atk - hero.def));
            let pct = 1 - (res / hero.maxHp);
            let diff = "easy";
            if(pct > 0.33){
                diff = "medium";
            }else if(pct >= 0.5){
                diff = "hard";
            }else if (pct >= 0.8) {
                diff = "very hard";
            } else if (pct >= 1) {
                diff = "deadly";
            }

            this.description.setText(this.data.description + "\n" + "Difficulty: " + diff);
        }
    }

    load(_data){
        this.lastClicked = _data.lastClicked;
        if(_data.heroId !== -1){
            let hero = this.scene.heroes.find(h => h.id === _data.heroId);
            //assign hero withouth issuing a click
            this.hero = hero;
            this.heroId = hero.id;
            this.hero.assignQuest(this);
            this.heroSprite.setTexture(hero.sprite.texture.key);
            this.heroSprite.alpha = 1;
            this.refreshHeroHealthBar();
            this.heroHealthBar.alpha = 1;

            this.inProgress = true;
            this.toStop = _data.toStop;

            this.catchup(_data.lastClicked);
        }

    }

    getRewardString() {
        return String(this.data.reward.gold) + " GD | " + String(this.data.reward.loot) + " LT | " + String(this.data.reward.food) + " FD";
    }
}