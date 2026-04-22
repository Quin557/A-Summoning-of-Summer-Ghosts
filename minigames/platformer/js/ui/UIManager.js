import { gameEvents } from '../core/EventBus.js';

export class UIManager {
    constructor(canvas, config, game) { 
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.game = game; 
        this.playerHealth = { current: 100, max: 100 };
        this.healthIcon = game.assetManager.getImage('health_mask');
        
        this.collectedOrbs = 0;
        this.totalOrbs = config.winCondition.value;

        gameEvents.on('healthChanged', (payload) => {
            if (payload.gameObject.name === 'Player') {
                this.playerHealth.current = payload.currentHealth;
                this.playerHealth.max = payload.maxHealth;
            }
        });

        gameEvents.on('lightOrbCollected', () => {
            this.collectedOrbs++;
        });
    }

    getScaledSize(desktop, mobile) {
        return window.matchMedia('(pointer: coarse)').matches ? mobile : desktop;
    }

    draw() {
        this.drawHealthOrbs();
        this.drawOrbCounter();
        this.drawTimer();
        this.drawControlsHint();
    }

    drawHealthOrbs() {
        if (!this.healthIcon) return;

        const healthPerOrb = 20; 
        const numOrbs = Math.ceil(this.playerHealth.max / healthPerOrb);
        const orbSize = this.getScaledSize(50, 38);
        const padding = this.getScaledSize(12, 8);
        const startX = this.getScaledSize(20, 14);
        const startY = this.getScaledSize(20, 14);

        for (let i = 0; i < numOrbs; i++) {
            this.ctx.save();
            
            if (this.playerHealth.current <= i * healthPerOrb) {
                 this.ctx.globalAlpha = 0.3;
            } else {
                 this.ctx.globalAlpha = 1.0;
            }

            const x = startX + i * (orbSize + padding);
            
            this.ctx.shadowColor = 'black';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;

            this.ctx.drawImage(this.healthIcon, x, startY, orbSize, orbSize);

            this.ctx.restore();
        }
    }

    drawOrbCounter() {
        const x = this.canvas.width - 20;
        const y = 30;
        
        this.ctx.fillStyle = '#efe8ff'; 
        this.ctx.font = `700 ${this.getScaledSize(28, 18)}px 'lilyshow', 'Microsoft YaHei', sans-serif`;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        
        this.ctx.shadowColor = '#FFD700'; 
        this.ctx.shadowBlur = 8; 
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        this.ctx.fillText(`光芒: ${this.collectedOrbs} / ${this.totalOrbs}`, x, y);

        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }

    drawTimer() {
        const secondsLeft = Math.max(0, Math.ceil(this.game.levelTimer / 1000));
        
        const x = this.canvas.width / 2;
        const y = this.getScaledSize(30, 22);

        this.ctx.fillStyle = secondsLeft <= 10 ? '#bd504fff' : 'white';
        this.ctx.font = `700 ${this.getScaledSize(28, 18)}px 'lilyshow', 'Microsoft YaHei', sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        this.ctx.fillText(`时间: ${secondsLeft}`, x, y);

        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }

    drawControlsHint() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const hintText = "A / D : 移动  |  W : 跳跃  |  J : 攻击";
        
        const x = this.canvas.width / 2;
        const y = this.canvas.height - 30;

        this.ctx.fillStyle = 'rgba(237, 230, 255, 0.82)';
        this.ctx.font = "18px 'lilyshow', 'Microsoft YaHei', sans-serif";
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = 4;
        
        this.ctx.fillText(hintText, x, y);

        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }
}
