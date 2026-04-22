import GameEngine from './core/GameEngine.js';
import PwaManager from './core/PwaManager.js';

// 等待DOM完全加载后再启动游戏
document.addEventListener('DOMContentLoaded', async () => {
    const pwaManager = new PwaManager({
        basePath: '/Summoning-of-Summer-Ghosts.github.io/',
    });
    pwaManager.init();

    const appContainer = document.getElementById('app-container');
    const game = new GameEngine(appContainer);
    
    await game.init();

    try {
        if (sessionStorage.getItem('jumpToAbout') === '1') {
            sessionStorage.removeItem('jumpToAbout');
            game.showView('About');
        }
    } catch (e) {}
});
