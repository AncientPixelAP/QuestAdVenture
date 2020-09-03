export default function () {

    // Preloader scene
    return new Phaser.Class({
        Extends: Phaser.Scene,
        initialize: function Preloader() {
            Phaser.Scene.call(this, { key: 'Preloader' })

            this.loadTxt;
        },

        preload: function () {
            this.cameras.main.setBackgroundColor(0x1d2b53);
            
            this.load.setBaseURL('./assets/');

            //json files with the start values for heroes and quests
            this.load.json("questData", "jsons/quests.json");
            this.load.json("heroData", "jsons/heroes.json");

            //ui images
            this.load.image("sprRessGold", "sprites/ressGold.png");
            this.load.image("sprRessLoot", "sprites/ressLoot.png");
            this.load.image("sprRessFood", "sprites/ressFood.png");

            this.load.image("sprHideOverlay", "sprites/hideOverlay.png");

            //images for buttons
            this.load.image("sprLocked", "sprites/locked.png");
            this.load.image("sprBtnHire", "sprites/hireButton.png");
            this.load.image("sprBtnWood", "sprites/woodButton.png");
            this.load.image("sprBtnLowWood", "sprites/woodButtonLow.png");

            //remaining assets
            this.load.image("sprMapPath", "sprites/mapPath.png");
            this.load.image("sprQuestTavern", "sprites/questTavern00.png");
            this.load.image("sprQuestRatCellar", "sprites/questRatCellar01.png");

            this.load.image("sprPortraitInnkeeper", "sprites/heroes/portraitInnkeeper.png");
            this.load.image("sprPortraitAdventurer", "sprites/heroes/portraitAdventurer.png");
            this.load.image("sprPortraitWarrior", "sprites/heroes/portraitWarrior.png");
            this.load.image("sprPortraitPaladin", "sprites/heroes/portraitPaladin.png");
            this.load.image("sprPortraitWizard", "sprites/heroes/portraitWizard.png");
            this.load.image("sprPortraitThief", "sprites/heroes/portraitThief.png");
            this.load.image("sprPortraitTinkerer", "sprites/heroes/portraitTinkerer.png");
            this.load.image("sprPortraitChef", "sprites/heroes/portraitChef.png");

            this.loadTxt = this.add.text(this.game.config.width * 0.5, this.game.config.height * 0.5, "LOADING...", TEXTSTYLENAME).setOrigin(0.5);
        },

        create: function () {
            this.scene.start("ScnMain");
        }
    })

}