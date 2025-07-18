import { GameInfo } from "../GameInfo";
import { GameData } from "../GameData";
import WebFontFile from "../scenes/webFontFile";

export default class MainMenuScene extends Phaser.Scene {
  constructor(){ super({ key: "MainMenuScene" }) }
  private _background: Phaser.GameObjects.Image;
  private _gameTitle: Phaser.GameObjects.Text;
  private _arcadeMode: Phaser.GameObjects.Text;
  private _menuItems: any[] = [];
  private _selectedIndex = 0;

  private asteroidCountBackground = 6;

  private backgroundAsteroids: Phaser.GameObjects.Group;

  preload(){
    this.cameras.main.setBackgroundColor("000");
    this.load.image("bg-04", "assets/images/backgrounds/bg-04.svg");
    this.load.image("asteroid", "assets/images/asteroids/asteroid.svg");
    this.load.image("bootscreen-bg", "assets/images/backgrounds/bootscreen.svg");
    this.load.audio('menuSelect', 'assets/sounds/menuSelect.mp3');
    this.load.audio('menuClick', 'assets/sounds/menuSelect.mp3');
    this.load.addFile(new WebFontFile(this.load, 'Pixelify Sans')); // font preload
  }

  init(){
    this._gameTitle = this.add
      .text(this.scale.width / 2, this.scale.height * 0.3, "")
      .setAlpha(1)
      .setDepth(1001)
      .setOrigin(0.5, 1)
      .setColor('#fff')
      .setWordWrapWidth(1000)
      .setAlign(GameInfo.gameTitle.align)
      .setFontSize(Math.min(this.scale.width / 15, 100))
      .setFontFamily(GameInfo.gameTitle.font);

    if(localStorage.getItem('level') === null) localStorage.setItem('level', '4');

    if(localStorage.getItem('score') === null) localStorage.setItem('score', '0');

    if (localStorage.getItem('musicEnabled') === null) localStorage.setItem('musicEnabled', 'true');
    
    if (localStorage.getItem('soundEffectsEnabled') === null) localStorage.setItem('soundEffectsEnabled', 'true');

    if (localStorage.getItem('completedLevels') === null) localStorage.setItem('completedLevels', '[]');

    this._arcadeMode = this.add.text(this.scale.width - 175, this.scale.height - 50, "")
      .setDepth(1001)
      .setOrigin(0.5, 1)
      .setColor('#0099DB')
      .setFontSize(35)
      .setFontFamily(GameInfo.default.font)
      .setInteractive()
      .on("pointerdown", () => {
        localStorage.setItem('gameMode', 'arcade');
        this.scene.stop(this);
        this.scene.start('LevelSelectScene');
      });

    // if(localStorage.getItem('gameMode') === null) localStorage.setItem('gameMode', 'arcade');
  }

  create(){
    this._background = this.add.image(0, 0, "bg-04").setOrigin(0, 0);
    // Scale background to cover entire screen
    const scaleX = this.scale.width / this._background.width;
    const scaleY = this.scale.height / this._background.height;
    const scale = Math.max(scaleX, scaleY);
    this._background.setScale(scale);
    
    if(localStorage.getItem('score') != null) this._arcadeMode.setText("Arcade Mode");
    this._gameTitle.setText(GameInfo.gameTitle.text);

    this._menuItems = [];
    this._selectedIndex = 0;
    this.createMenu();

    this.backgroundAsteroids = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      createCallback: (go: Phaser.GameObjects.GameObject) => {
        const asteroid = go as Phaser.Physics.Arcade.Image;
        asteroid.setCollideWorldBounds(false);
      }
    });

    this.spawnBackgroundAsteroids();

    // Debug: Reset progress command (only during development)
    if (GameData.globals.debug) {
      (window as any).resetProgress = () => {
        localStorage.setItem('completedLevels', '[]');
        console.log('Progress reset - only level 1 is now available');
      };
      console.log('Debug mode enabled - use resetProgress() to reset level progression');
    }
  }

  createMenu() {
    for (let i = 0; i < GameInfo.menu.items.length; i++) {
        const item = GameInfo.menu.items[i];
        const x = this.scale.width / 2;
        const y = this.scale.height * 0.5 + i * 75;

        let menuItem = this.add.text(x, y, item, {
            fontSize: `${Math.min(this.scale.width / 25, GameInfo.menu.fontSize)}px`,
            fontFamily: GameInfo.menu.font,
            color: '#fff'
        })
        .setDepth(1001)
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => { 
            if (localStorage.getItem('soundEffectsEnabled') === 'true') {
                this.sound.play('menuSelect');
            }
            this.selectItem(i); 
        })
        .on('pointerover', () => { 
            this._selectedIndex = i; 
            this.updateMenu(); 
            if (localStorage.getItem('soundEffectsEnabled') === 'true') {
                this.sound.play('menuSelect');
            }
        });

        this._menuItems.push(menuItem);
    }

    this.input.keyboard.on('keydown-UP', () => {
        this._selectedIndex = (this._selectedIndex - 1 + this._menuItems.length) % this._menuItems.length;
        this.updateMenu();
        if (localStorage.getItem('soundEffectsEnabled') === 'true') {
            this.sound.play('menuSelect');
        }
    });

    this.input.keyboard.on('keydown-DOWN', () => {
        this._selectedIndex = (this._selectedIndex + 1) % this._menuItems.length;
        this.updateMenu();
        if (localStorage.getItem('soundEffectsEnabled') === 'true') {
            this.sound.play('menuSelect');
        }
    });

    this.input.keyboard.on('keydown-ENTER', () => { 
        if (localStorage.getItem('soundEffectsEnabled') === 'true') {
            this.sound.play('menuSelect');
        }
        this.selectItem(this._selectedIndex); 
    });

    this.input.keyboard.on('keydown-SPACE', () => { 
        if (localStorage.getItem('soundEffectsEnabled') === 'true') {
            this.sound.play('menuSelect');
        }
        this.selectItem(this._selectedIndex); 
    });
  }

  updateMenu() {
    for (let i = 0; i < this._menuItems.length; i++) {
      if (i === this._selectedIndex) {
        this._menuItems[i].setText(`> ${GameInfo.menu.items[i]} <`);
        if (localStorage.getItem('soundEffectsEnabled') === 'true') {
          this.sound.play('menuSelect'); 
        }
      } else {
        this._menuItems[i].setText(GameInfo.menu.items[i]);
      }
    }
  }

  selectItem(index: number) {
    switch (GameInfo.menu.items[index]) {
      case 'Start Game':
        localStorage.setItem('gameMode', 'levels')
        this.scene.stop(this)
        this.scene.start('LevelSelectScene');
        break;
      case 'Options':
        this.scene.stop(this)
        this.scene.start('OptionsScene');
        break;
      case 'Credits':
        this.scene.stop(this)
        this.scene.start('CreditsScene');
        break;
      case 'Exit':
        this.scene.stop(this)
        this.scene.start('ExitScene');
        // this.game.destroy(true);
        break;
    }
  }

  createBackgroundAsteroids(){
    const minSpeed = 10;
    const maxSpeed = 30;
    const minSize = 0.3;
    const maxSize = 0.8;

    this.backgroundAsteroids = this.physics.add.group();

    for(let i = 0; i < this.asteroidCountBackground; i++){
      let x, y;
      const margin = 150;

      if (Math.random() > 0.5) {
        x = Phaser.Math.Between(0, this.game.canvas.width);
        y = Math.random() > 0.5 ?
          Phaser.Math.Between(0, this.game.canvas.height/2 - margin) :
          Phaser.Math.Between(this.game.canvas.height/2 + margin, this.game.canvas.height);
      } else {
        x = Math.random() > 0.5 ?
          Phaser.Math.Between(0, this.game.canvas.width/2 - margin) :
          Phaser.Math.Between(this.game.canvas.width/2 + margin, this.game.canvas.width);
        y = Phaser.Math.Between(0, this.game.canvas.height);
      }

      const asteroid = this.physics.add.image(x, y, 'asteroid').setScale(Phaser.Math.FloatBetween(minSize, maxSize)).setAlpha(Phaser.Math.FloatBetween(0.2, 0.5));

      const speed = Phaser.Math.FloatBetween(minSpeed, maxSpeed);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      asteroid.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      asteroid.setAngularVelocity(Phaser.Math.FloatBetween(-10, 10));
      asteroid.setCollideWorldBounds(false);
      asteroid.body.allowGravity = false;

      this.backgroundAsteroids.add(asteroid);
    }
  }

  private spawnBackgroundAsteroids() {
    if(!this.backgroundAsteroids) return;

    for(let i = 0; i < this.asteroidCountBackground; i++){
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(0, this.scale.height);

      const asteroid = this.backgroundAsteroids.create(x, y, 'asteroid');

      asteroid.setScale(Phaser.Math.FloatBetween(0.3, 0.8)).setAlpha(Phaser.Math.FloatBetween(0.6, 0.9));

      const speed = Phaser.Math.FloatBetween(10, 30);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      asteroid.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      asteroid.setAngularVelocity(Phaser.Math.FloatBetween(-10, 10));
    }
  }

  update(){
    if(!this.backgroundAsteroids) return;
    this.backgroundAsteroids.getChildren().forEach((go: Phaser.GameObjects.GameObject) => {
      const asteroid = go as Phaser.Physics.Arcade.Image;
      if(asteroid.x < -50) asteroid.x = this.scale.width + 49;
      if(asteroid.x > this.scale.width + 50) asteroid.x = -49;
      if(asteroid.y < -50) asteroid.y = this.scale.height + 49;
      if(asteroid.y > this.scale.height + 50) asteroid.y = -49;
    });
  }

}