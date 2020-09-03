export default class TextButton {
    constructor(_scene, _pos, _asset, _text, _func) {
        this.scene = _scene;
        this.pos = _pos;
        this.func = _func;

        this.sprite = this.scene.add.sprite(this.pos.x, this.pos.y, _asset);
        this.sprite.setInteractive();
        this.sprite.on("pointerdown", () => {
            this.func();
        }, this);

        this.text = this.scene.add.text(this.pos.x, this.pos.y, _text, TEXTSTYLENAME).setOrigin(0.5);
        this.text.setColor("#fff1e8");
    }

    setActive(_bool, _hide){
        //_bool let this button be clickable or not
        //_hide determines the buttons visibility
        if(_bool === true){
            this.sprite.setInteractive();
        }else{
            this.sprite.removeInteractive();
        }
        if(_hide === true){
            this.sprite.alpha = 0;
            this.text.alpha = 0;
        }else{
            this.sprite.alpha = 1;
            this.text.alpha = 1;
        }
    }

    setText(_text){
        this.text.setText(_text);
    }

    setFunction(_func){
        this.func = _func;
    }
}