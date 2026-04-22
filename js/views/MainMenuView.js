import { bindInteractivePress } from '../utils/interactions.js';

const MainMenuView = {
    render: (container, engine) => {
        const L = engine.localization;
        const hasActiveGame = engine.gameState.currentSave !== null;

        container.innerHTML = `
            <style>
                .main-menu-view {
                    position: relative;
                    width: 100vw;
                    height: calc(var(--app-vh, 1vh) * 100);
                    overflow: hidden;
                }

                .main-menu-view::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, rgba(5, 7, 17, 0.1) 0%, rgba(6, 7, 16, 0.34) 28%, rgba(8, 10, 18, 0.1) 48%, rgba(8, 10, 18, 0.02) 100%);
                    pointer-events: none;
                }

                .menu-stack {
                    --menu-width: clamp(220px, 19vw, 330px);
                    --menu-scale: 1;
                    position: absolute;
                    top: 50%;
                    left: 75vw;
                    transform: translate(-50%, -50%) scale(var(--menu-scale));
                    transform-origin: center center;
                    width: var(--menu-width);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 2;
                    max-height: 84vh;
                }

                .menu-title {
                    width: 100%;
                    margin: 0 0 18px;
                    font-family: var(--font-title);
                    font-size: clamp(26px, 3.7vw, 54px);
                    line-height: 1.08;
                    text-align: center;
                    color: #fff;
                    text-shadow: 0 4px 18px rgba(0, 0, 0, 0.42);
                    white-space: nowrap;
                    animation: menu-title-flicker 3.6s ease-in-out infinite;
                }

                @keyframes menu-title-flicker {
                    0%, 100% {
                        opacity: 1;
                        text-shadow:
                            0 4px 18px rgba(0, 0, 0, 0.42),
                            0 0 9px rgba(255, 236, 176, 0.24);
                    }
                    48% {
                        opacity: 0.94;
                        text-shadow:
                            0 4px 18px rgba(0, 0, 0, 0.42),
                            0 0 16px rgba(255, 239, 180, 0.44);
                    }
                    52% {
                        opacity: 0.88;
                        text-shadow:
                            0 4px 18px rgba(0, 0, 0, 0.42),
                            0 0 22px rgba(255, 234, 156, 0.62);
                    }
                    56% {
                        opacity: 0.96;
                        text-shadow:
                            0 4px 18px rgba(0, 0, 0, 0.42),
                            0 0 12px rgba(255, 238, 182, 0.36);
                    }
                }

                .menu-actions {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0;
                }

                .main-menu-button {
                    position: relative;
                    width: 100%;
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    transition: transform 160ms ease, filter 160ms ease;
                    touch-action: manipulation;
                }

                .main-menu-button .button-img {
                    display: block;
                    width: 100%;
                    height: auto;
                    transition: transform 160ms ease, filter 160ms ease;
                }

                .main-menu-button + .main-menu-button {
                    margin-top: -8px;
                }

                .main-menu-button-label {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: 72%;
                    transform: translate(-50%, -50%);
                    display: block;
                    text-align: center;
                    font-family: var(--font-button);
                    font-size: clamp(16px, 1.7vw, 25px);
                    line-height: 1;
                    color: #fff;
                    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    pointer-events: none;
                }

                .main-menu-button:hover .button-img,
                .main-menu-button:focus-visible .button-img {
                    transform: scale(1.04);
                    filter: brightness(1.08);
                }

                .main-menu-button:hover .main-menu-button-label,
                .main-menu-button:focus-visible .main-menu-button-label {
                    color: #f6e7b4;
                }

                .main-menu-button.pressed .button-img,
                .main-menu-button:active .button-img {
                    transform: translateY(4px) scale(0.985);
                }

                .main-menu-button.pressed .main-menu-button-label,
                .main-menu-button:active .main-menu-button-label {
                    transform: translate(-50%, calc(-50% + 2px));
                }

                @media (max-width: 900px) and (pointer: coarse) {
                    .menu-stack {
                        --menu-width: clamp(228px, 36vw, 298px);
                        --menu-scale: 1;
                        left: clamp(63vw, 73vw, calc(100vw - 156px));
                        top: 46%;
                        max-height: 86vh;
                    }

                    .menu-title {
                        margin-bottom: 14px;
                        font-size: clamp(22px, 3.6vw, 34px);
                    }

                    .main-menu-button-label {
                        width: 72%;
                        font-size: clamp(15px, 2.5vw, 20px);
                    }

                    .main-menu-button + .main-menu-button {
                        margin-top: -8px;
                    }
                }

                @media (max-width: 600px) and (pointer: coarse) {
                    .menu-stack {
                        --menu-width: min(48vw, 248px);
                        left: clamp(61vw, 72vw, calc(100vw - 132px));
                        top: 47%;
                        max-height: 86vh;
                    }

                    .menu-title {
                        margin-bottom: 12px;
                        font-size: clamp(20px, 5vw, 28px);
                    }

                    .main-menu-button-label {
                        width: 72%;
                        font-size: clamp(14px, 3.5vw, 18px);
                    }
                }

                @media (max-height: 760px) {
                    .menu-stack {
                        --menu-scale: 0.88;
                    }
                }

                @media (max-height: 540px) and (pointer: coarse) {
                    .menu-stack {
                        --menu-scale: 0.74;
                        top: 49%;
                    }
                }

                @media (max-width: 980px) and (max-height: 520px) and (orientation: landscape) {
                    .menu-stack {
                        --menu-width: clamp(188px, 24vw, 230px);
                        --menu-scale: 0.84;
                        left: clamp(64vw, 73vw, calc(100vw - 128px));
                        top: 48%;
                        max-height: 88vh;
                    }

                    .menu-title {
                        margin-bottom: 8px;
                        font-size: clamp(18px, 2.6vw, 26px);
                    }

                    .main-menu-button + .main-menu-button {
                        margin-top: -12px;
                    }

                    .main-menu-button-label {
                        width: 70%;
                        font-size: clamp(12px, 1.8vw, 16px);
                    }
                }
            </style>

            <div class="view main-menu-view">
                <div class="bg" style="background-image:url('./assets/img/bgr/mainmenu.png');"></div>

                <div class="menu-stack">
                    <h1 class="menu-title">夏夜唤灵簿</h1>
                    <div class="menu-actions">
                        ${hasActiveGame ? `
                            <button type="button" class="main-menu-button" data-action="continue">
                                <img class="button-img" src="./assets/img/button.png" alt="">
                                <span class="main-menu-button-label">${L.get('ui.continue')}</span>
                            </button>
                        ` : ''}
                        <button type="button" class="main-menu-button" data-action="start">
                            <img class="button-img" src="./assets/img/button.png" alt="">
                            <span class="main-menu-button-label">${L.get('ui.start')}</span>
                        </button>
                        <button type="button" class="main-menu-button" data-action="load">
                            <img class="button-img" src="./assets/img/button.png" alt="">
                            <span class="main-menu-button-label">${L.get('ui.load')}</span>
                        </button>
                        <button type="button" class="main-menu-button" data-action="achievement">
                            <img class="button-img" src="./assets/img/button.png" alt="">
                            <span class="main-menu-button-label">${L.get('ui.achievement')}</span>
                        </button>
                        <button type="button" class="main-menu-button" data-action="settings">
                            <img class="button-img" src="./assets/img/button.png" alt="">
                            <span class="main-menu-button-label">设置</span>
                        </button>
                        <button type="button" class="main-menu-button" data-action="about">
                            <img class="button-img" src="./assets/img/button.png" alt="">
                            <span class="main-menu-button-label">${L.get('ui.about')}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        engine.audioManager.playBgm('./assets/bgm/test.m4a', true);
    },

    attachEventListeners: (container, engine) => {
        container.querySelectorAll('.main-menu-button').forEach((button) => {
            bindInteractivePress(button, {
                onHover: () => engine.audioManager.playSoundEffect('titleHover'),
                onClick: async () => {
                    engine.audioManager.playSoundEffect('titleClick');
                    await engine.animation.play('fadeOutBlack');

                    switch (button.dataset.action) {
                        case 'continue':
                            engine.resumeGame();
                            break;
                        case 'start':
                            engine.startNewGame();
                            break;
                        case 'load':
                            engine.showView('Load', { from: 'MainMenu' });
                            break;
                        case 'settings':
                            engine.showView('Settings', { from: 'MainMenu' });
                            break;
                        case 'achievement':
                            engine.showView('Achievement');
                            break;
                        case 'about':
                            engine.showView('About');
                            break;
                    }
                },
            });
        });
    }
};

export default MainMenuView;
