import { GameInfo } from "../GameInfo";
import { GameData } from "../GameData";

export default class OptionsScene extends Phaser.Scene {
  constructor(){ super({ key: "OptionsScene" }) }
  private _background: Phaser.GameObjects.Image;
  private _title: Phaser.GameObjects.Text;
  private _backArrow: Phaser.GameObjects.Text;
  private _menuItems: any[] = [];
  private _selectedIndex = 0;

  preload(){
    this.load.image("bg-03", "assets/images/backgrounds/bg-03.svg");
    this.load.audio('menuSelect', 'assets/sounds/menuSelect.mp3');
  }

  init(){
    GameInfo.options.items['Music'] = localStorage.getItem('musicEnabled') === 'true';
    GameInfo.options.items['Sound Effects'] = localStorage.getItem('soundEffectsEnabled') === 'true';
    this._backArrow = this.add.text(50, 75, "<").setAlpha(1)
      .setDepth(1001)
      .setOrigin(0.5, 1)
      .setColor("#fff")
      .setWordWrapWidth(1000)
      .setFontSize(Math.min(this.scale.width / 25, 50))
      .setFontFamily(GameInfo.default.font)
      .setInteractive()
      .on('pointerdown', () => { this.goBack() });

    this._title = this.add
      .text(this.scale.width / 2, this.scale.height * 0.2, "")
      .setAlpha(1)
      .setDepth(1001)
      .setOrigin(0.5, 1)
      .setColor('#fff')
      .setWordWrapWidth(1000)
      .setAlign(GameInfo.gameTitle.align)
      .setFontSize(Math.min(this.scale.width / 15, 100))
      .setFontFamily(GameInfo.gameTitle.font);
  }

  create(){
    this._background = this.add.image(0, 0, "bg-03").setOrigin(0, 0);
    // Scale background to cover entire screen
    const scaleX = this.scale.width / this._background.width;
    const scaleY = this.scale.height / this._background.height;
    const scale = Math.max(scaleX, scaleY);
    this._background.setScale(scale);
    
    this._title.setText("Options");

    this._menuItems = [];
    this._selectedIndex = 0;
    this.createMenu();

    this.input.keyboard.on('keydown-ESC', () => { 
      if (localStorage.getItem('soundEffectsEnabled') === 'true') {
        this.sound.play('menuSelect');
      }
      this.goBack(); 
    });
  }

  createMenu() {
    const keys = Object.keys(GameInfo.options.items);
    const values = Object.values(GameInfo.options.items);

    for (let i = 0; i < keys.length; i++) {
      const item = `${keys[i]}: ${values[i] === true ? 'ON' : 'OFF'}`;
      const x = this.scale.width / 2;
      const y = this.scale.height * 0.4 + i * Math.min(this.scale.height / 10, 75);

      let menuItem = this.add.text(x, y, item, {
        fontSize: `${Math.min(this.scale.width / 25, GameInfo.options.fontSize)}px`,
        fontFamily: GameInfo.options.font,
        color: '#fff'
      })
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
  }

  updateMenu() {
    const keys = Object.keys(GameInfo.options.items);
    const values = Object.values(GameInfo.options.items);

    for (let i = 0; i < this._menuItems.length; i++) {
      const item = `${keys[i]}: ${values[i] === true ? 'ON' : 'OFF'}`;

      if (i === this._selectedIndex) {
        this._menuItems[i].setText(`> ${item} <`);
      } else {
        this._menuItems[i].setText(item);
      }
    }
  }

selectItem(index: number) {
    const keys = Object.keys(GameInfo.options.items);
    const selectedKey = keys[index];

    switch (selectedKey) {
        case 'Music':
            const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
            localStorage.setItem('musicEnabled', (!musicEnabled).toString());
            GameInfo.options.items[selectedKey] = !musicEnabled;
            break;

        case 'Sound Effects':
            const soundEffectsEnabled = localStorage.getItem('soundEffectsEnabled') === 'true';
            localStorage.setItem('soundEffectsEnabled', (!soundEffectsEnabled).toString());
            GameInfo.options.items[selectedKey] = !soundEffectsEnabled;
            break;

        case 'Exit':
            this.game.destroy(true);
            break;
    }

    this.updateMenu();
  }

  goBack(){
    this.scene.stop(this);
    this.scene.start("MainMenuScene");
  }
}