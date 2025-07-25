import { GameData } from "../GameData";
import { GameInfo } from "../GameInfo";
import WebFontFile from "../scenes/webFontFile";

export default class Preloader extends Phaser.Scene {
  constructor(){ super({ key: "Preloader" }) }
  private _loading: Phaser.GameObjects.Text;
  private _progress: Phaser.GameObjects.Graphics;
  private _image: Phaser.GameObjects.Image;
  private _background: Phaser.GameObjects.Image;
  private _gameTitle: Phaser.GameObjects.Text;
  private _backToMenu: Phaser.GameObjects.Text;
  private _subtitle: Phaser.GameObjects.Text;

  preload(){
    this.cameras.main.setBackgroundColor(GameData.globals.bgColor);
    this._progress = this.add.graphics();
    GameData.sounds.forEach((sound) => { this.load.audio(sound.name, sound.paths) });
    this.loadAssets();
  }

  init(){
    this._background = this.add.image(0, 0, "bootscreen-bg").setOrigin(0, 0);
    // Scale background to cover entire screen
    const scaleX = this.scale.width / this._background.width;
    const scaleY = this.scale.height / this._background.height;
    const scale = Math.max(scaleX, scaleY);
    this._background.setScale(scale);
    
    this._gameTitle = this.add
      .text(this.scale.width / 2, this.scale.height * 0.3, GameInfo.gameTitle.text)
      .setAlpha(1)
      .setDepth(1001)
      .setOrigin(0.5, 1)
      .setColor('#fff')
      .setWordWrapWidth(1000)
      .setAlign(GameInfo.gameTitle.align)
      .setFontSize(Math.min(this.scale.width / 15, 100))
      .setFontFamily(GameInfo.gameTitle.font);

    GameData.sounds.forEach((sound) => {
      this.load.audio(sound.name, sound.paths);
    });

    if(localStorage.getItem('score') === null) localStorage.setItem('score', '0');
    else{
      this._subtitle = this.add.text(this.scale.width / 2, this.scale.height * 0.35, "")
        .setDepth(1001)
        .setOrigin(0.5, 1)
        .setColor('#0099DB')
        .setFontSize(Math.min(this.scale.width / 30, 40))
        .setFontFamily(GameInfo.default.font);
    }

    this._backToMenu = this.add.text(75, this.scale.height * 0.08, "Menu").setAlpha(1)
      .setDepth(1001)
      .setOrigin(0.5, 1)
      .setColor("#fff")
      .setWordWrapWidth(1000)
      .setFontSize(Math.min(this.scale.width / 35, 35))
      .setFontFamily(GameInfo.default.font)
      .setInteractive()
      .on('pointerdown', () => { this.goToMenu() });

    this.tweens.add({
      targets: [this._image],
      alpha: 1,
      duration: 500,
    });

    this._loading = this.add
      .text(this.scale.width / 2, this.scale.height * 0.85, "")
      .setAlpha(1)
      .setDepth(1001)
      .setOrigin(0.5, 1)
      .setColor('#fff')
      .setFontSize(Math.min(this.scale.width / 30, 40))
      .setFontFamily(GameData.preloader.loadingTextFont);

    if(localStorage.getItem('gameMode') === 'arcade'){
      this._subtitle.setText(`High Score: ${localStorage.getItem('score')}`);
    }
    else this._subtitle.setText(`Level ${parseInt(localStorage.getItem('selectedLevel'))+1}`);
  }

  create() {
    const music = this.sound.add('arcadeMusic', { loop: true, volume: 0.5 });
    const musicEnabled = localStorage.getItem('musicEnabled');
    if (musicEnabled === null || musicEnabled === 'true') {
      music.play();
    }
    this.registry.set('backgroundMusic', music);
    this.input.keyboard.on('keydown-ESC', () => { this.goToMenu(); });
  }

  private goToMenu() {
    const music = this.registry.get('backgroundMusic') as Phaser.Sound.BaseSound;

    if(music && music.isPlaying) music.stop();

    this.scene.stop("Preloader");
    this.scene.start("MainMenuScene");
  }

  loadAssets(): void {
    this.load.on("start", () => {});
    // this.load.on("fileprogress", (file: any, value: any) => {});
    // this.load.on("progress", (value: number) => {
    //   this._progress.clear();
    //   this._progress.fillStyle(GameData.preloader.loadingBarColor, 1);
    //   this._progress.fillRect(0, this.scale.height * 0.8, this.scale.width * value, 70);
    //   this._loading.setText(GameData.preloader.loadingText + " " + Math.round(value * 100) + "%");
    // });

    this.load.on("complete", () => {
      this._progress.clear();
      this._loading.setText(GameData.preloader.loadingTextComplete);

      this.input.keyboard.on('keydown-ESC', () => {
        this.scene.stop("Preloader");
        this.scene.start("MainMenuScene");
      });

      this.input.keyboard.on("keydown", () => {
        this.tweens.add({
          targets: [this._image, this._loading],
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.scene.stop("Preloader");
            this.scene.start("MinimapOverlay");
            this.scene.start("GameScene");
          },
        });
      });
    });

    //-------------------------- Assets Load

    //WEB FONT
    if(GameData.webfonts != null){
      let _fonts: Array<string> = [];
      GameData.webfonts.forEach((element: FontAsset) => {
        _fonts.push(element.key);
      });
      this.load.addFile(new WebFontFile(this.load, _fonts));
    }

    // local FONT
    if (GameData.fonts != null) {
      let _fonts: Array<string> = [];
      GameData.fonts.forEach((element: FontAsset) => {
        this.load.font(element.key, element.path, element.type);
      });
    }

    // SCRIPT
    if (GameData.scripts != null)
      GameData.scripts.forEach((element: ScriptAsset) => {
        this.load.script(element.key, element.path);
      });

    // IMAGES
    if (GameData.images != null)
      GameData.images.forEach((element: ImageAsset) => {
        this.load.image(element.name, element.path);
      });

    // TILEMAPS
    if (GameData.tilemaps != null)
      GameData.tilemaps.forEach((element: TileMapsAsset) => {
        this.load.tilemapTiledJSON(element.key, element.path);
      });

    // ATLAS
    if (GameData.atlas != null)
      GameData.atlas.forEach((element: AtlasAsset) => {
        this.load.atlas(element.key, element.imagepath, element.jsonpath);
      });

    // SPRITESHEETS
    if (GameData.spritesheets != null)
      GameData.spritesheets.forEach((element: SpritesheetsAsset) => {
        this.load.spritesheet(element.name, element.path, { frameWidth: element.width, frameHeight: element.height, endFrame: element.frames });
      });

    // video
    if (GameData.videos != null) {
      GameData.videos.forEach((element: VideoAsset) => {
        this.load.video(element.name, element.path, true);
      });
    }

    // bitmap fonts
    if (GameData.bitmapfonts != null)
      GameData.bitmapfonts.forEach((element: BitmapfontAsset) => {
        this.load.bitmapFont(element.name, element.imgpath, element.xmlpath);
      });

    // SOUNDS
    if (GameData.sounds != null)
      GameData.sounds.forEach((element: SoundAsset) => {
        this.load.audio(element.name, element.paths);
      });

    // Audio
    if(GameData.audios != null){
      GameData.audios.forEach((element: AudioSpriteAsset) => {
        this.load.audioSprite(element.name, element.jsonpath, element.paths, element.instance);
      });
    }

  }
}