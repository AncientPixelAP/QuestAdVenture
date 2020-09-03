import Quest from "./quest.js";
import Hero from "./hero.js";
import Player from "./player.js";
import TextButton from "./button.js";

export default class ScnMain extends Phaser.Scene {

    constructor() {
        super("ScnMain");
    }

    create() {
        //console.log(this);
        this.cameras.main.setScroll(this.game.config.width * -0.5, this.game.config.height * -0.5);
        this.cameras.main.setBackgroundColor(0x1d2b53);

        this.player = new Player(this);

        let questDataStart = this.cache.json.get("questData");
        let heroDataStart = this.cache.json.get("heroData");
        //create heroes and quests with standard level 1 values
        this.heroes = [];
        let r = 320;
        for(let i = 0 ; i < 8 ; i++){
            let a = i * (Math.PI / 4);
            this.heroes.push(new Hero(this, i, { x: Math.cos(a) * r, y: Math.sin(a) * r}, heroDataStart.heroes[i]));
        }

        this.quests = [];
        for (let [i, q] of questDataStart.quests.entries()){
            this.quests.push(new Quest(this, i, { x: -128, y: this.game.config.height - 350 + (i * 180)}, q));
        }

        //INTERFACE
        this.description = this.add.text(0, 0, "click on a hero for more information", TEXTSTYLEDESCRIPTION).setOrigin(0.5, 0.5);

        this.btnQuestList = new TextButton(this, { x: 350, y: (this.game.config.height * 0.5) - 64 }, "sprBtnLowWood", "Map", () => {
            this.showMap();
        });
        this.btnHeroes = new TextButton(this, { x: 350, y: (this.game.config.height * 0.5) + 64 }, "sprBtnLowWood", "Heroes", () => {
            this.showHeroes();
        });
        //button to reset save and restart the game from scratch
        this.btnResetGame = new TextButton(this, { x: 350, y: (this.game.config.height * 1.5) - 64 }, "sprBtnLowWood", "reset Game", () => {
            localStorage.setItem("QuestAdVentures", "null");
            this.scene.restart();
        });

        //attempt to load game or create new save game
        let data = JSON.parse(localStorage.getItem("QuestAdVentures"));
        if(data === null){
            this.saveGame();
            console.warn("no save found - created new save");
            this.description.setText("click on a hero for more information")
        }else{
            this.loadGame(data);
            this.player.refreshRessourceUi();

            //show how many ressources the player earned while away
            let catchupRessources = {
                gold: this.player.ressources.gold - data.gold, 
                loot: this.player.ressources.loot - data.loot, 
                food: this.player.ressources.food - data.food};
            console.table(catchupRessources);

            if(catchupRessources.gold > 0){
                this.description.setText("welcome back! You have earned: " + catchupRessources.gold + " gold while you were away!");
            }
        }

        //deselect all heroes
        for (let h of this.heroes) {
            h.hideOptions();
        }
    }

    update() {
        this.player.update();
        for (let q of this.quests) {
            q.update();
        }
        for(let h of this.heroes){
            h.update();
        }

        this.saveGame();
    }

    showMap(){
        this.cameras.main.pan(0, this.game.config.height, 250, "Quad.easeIn");
    }

    showHeroes(){
        this.cameras.main.pan(0, 0, 250, "Quad.easeIn");
    }

    saveGame(){
        let heroData = [];
        for(let h of this.heroes){
            heroData.push({
                id: h.id,
                unlocked: h.unlocked,
                state: h.state,
                level: h.level,
                hp: h.hp,
                timer: {
                    id: h.timer.id,
                    heroId: h.timer.heroId,
                    lastClicked: h.timer.lastClicked,
                    toStop: h.timer.toStop
                },
                questId: h.questId
            })
        }

        let questData = [];
        for (let q of this.quests) {
            questData.push({
                id: q.id,
                heroId: q.heroId,
                lastClicked: q.lastClicked,
                toStop: q.toStop
            })
        }

        localStorage.setItem("QuestAdVentures", JSON.stringify({
            heroes: heroData,
            quests: questData,
            timeStamp: Date.now(),
            gold: this.player.ressources.gold,
            loot: this.player.ressources.loot,
            food: this.player.ressources.food
        }));
    }

    loadGame(_data){
        this.player.ressources.gold = _data.gold;
        this.player.ressources.loot = _data.loot;
        this.player.ressources.food = _data.food;

        for(let h of _data.heroes){
            this.heroes[h.id].load(h);
        }
        for(let q of _data.quests){
            this.quests[q.id].load(q);
        }
    }
}