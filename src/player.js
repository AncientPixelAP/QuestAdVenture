export default class Player{
    constructor(_scene){
        this.scene = _scene;

        /*
        this object shows a ui overlay with its ressources and follows the camera
        */

        this.ressources = {
            gold: 5,
            loot: 0,
            food: 10
        }

        this.lastHero = null;

        this.uiBg = this.scene.add.graphics({ x: 0, y: -this.scene.game.config.height * 0.5 });
        this.uiBg.fillStyle(0xfff1e8);
        this.uiBg.fillRect(this.scene.game.config.width * -0.25, -2, this.scene.game.config.width * 0.5, 32);
        this.uiBg.depth = 100;

        this.ressGold = this.scene.add.sprite(this.uiBg.x - (this.scene.game.config.width * 0.125) + 32, this.uiBg.y + 16, "sprRessGold");
        this.ressGold.depth = 105;
        this.ressGoldText = this.scene.add.text(this.ressGold.x - 16, this.ressGold.y, this.ressources.gold, TEXTSTYLENAME).setOrigin(1, 0.5);
        this.ressGoldText.setColor("#1d2b53");
        this.ressGoldText.depth = 110;

        this.ressLoot = this.scene.add.sprite(this.uiBg.x + 32, this.uiBg.y + 16, "sprRessLoot");
        this.ressLoot.depth = 105;
        this.ressLootText = this.scene.add.text(this.ressLoot.x - 16, this.ressLoot.y, this.ressources.loot, TEXTSTYLENAME).setOrigin(1, 0.5);
        this.ressLootText.setColor("#1d2b53");
        this.ressLootText.depth = 110;

        this.ressFood = this.scene.add.sprite(this.uiBg.x + (this.scene.game.config.width * 0.125) + 32, this.uiBg.y + 16, "sprRessFood");
        this.ressFood.depth = 105;
        this.ressFoodText = this.scene.add.text(this.ressFood.x - 16, this.ressFood.y, this.ressources.food, TEXTSTYLENAME).setOrigin(1, 0.5);
        this.ressFoodText.setColor("#1d2b53");
        this.ressFoodText.depth = 110;
        
        this.refreshRessourceUi();
    }

    update(){
        this.uiBg.y = this.scene.cameras.main.scrollY;
        this.ressGold.y = this.scene.cameras.main.scrollY + 16;
        this.ressGoldText.y = this.scene.cameras.main.scrollY + 16;
        this.ressLoot.y = this.scene.cameras.main.scrollY + 16;
        this.ressLootText.y = this.scene.cameras.main.scrollY + 16;
        this.ressFood.y = this.scene.cameras.main.scrollY + 16;
        this.ressFoodText.y = this.scene.cameras.main.scrollY + 16;
    }

    refreshRessourceUi(){
        this.ressGoldText.setText(numeral(this.ressources.gold).format("0,000a"));
        this.ressLootText.setText(numeral(this.ressources.loot).format("0,000a"));
        this.ressFoodText.setText(numeral(this.ressources.food).format("0,000a"));
    }

    checkCost(_cost){
        if(this.ressources.gold >= _cost.gold &&
        this.ressources.loot >= _cost.loot &&
        this.ressources.food >= _cost.food){
            return true; 
        }else{
            console.warn("not enough ressources to do this quest");
            return false;
        }
    }

    buy(_cost){
        this.ressources.gold -= _cost.gold;
        this.ressources.loot -= _cost.loot;
        this.ressources.food -= _cost.food;
        this.refreshRessourceUi();
    }

    earnReward(_data){
        this.ressources.gold += _data.gold;
        this.ressources.loot += _data.loot;
        this.ressources.food += _data.food;
        this.refreshRessourceUi();
    }
}