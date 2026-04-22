import { bindInteractivePress } from '../utils/interactions.js';

const SettingsView = {
    render: (container, engine) => {
        const audioManager = engine.audioManager;

        container.innerHTML = `
            <style>
                .settings-view {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: calc(var(--app-vh, 1vh) * 100);
                    padding: calc(var(--safe-top, 0px) + 24px) 18px calc(var(--safe-bottom, 0px) + 24px);
                    overflow: auto;
                }

                .settings-panel {
                    position: relative;
                    width: min(92vw, 720px);
                    padding: 30px 22px 26px;
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    background: linear-gradient(180deg, rgba(14, 16, 26, 0.9), rgba(8, 10, 18, 0.86));
                    box-shadow: 0 24px 56px rgba(0, 0, 0, 0.34);
                    backdrop-filter: blur(12px);
                }

                .settings-panel h2 {
                    margin: 0 0 24px;
                    text-align: center;
                    font-family: var(--font-title);
                    font-size: clamp(28px, 4vw, 42px);
                }

                .settings-list {
                    display: grid;
                    gap: 18px;
                }

                .setting-item {
                    display: grid;
                    grid-template-columns: minmax(96px, 140px) 1fr;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 18px;
                    border-radius: 18px;
                    background: rgba(255, 255, 255, 0.05);
                }

                .setting-item label {
                    font-family: var(--font-title);
                    font-size: clamp(17px, 2vw, 24px);
                }

                .setting-item input[type="range"] {
                    width: 100%;
                    accent-color: #d7c48f;
                }

                .settings-buttons {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px;
                    margin-top: 24px;
                }

                .settings-button {
                    position: relative;
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    touch-action: manipulation;
                }

                .settings-button .button-img {
                    width: 100%;
                    display: block;
                    transition: transform 160ms ease, filter 160ms ease;
                }

                .settings-button a {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 82%;
                    margin: auto;
                    font-family: var(--font-button);
                    font-size: clamp(17px, 2vw, 24px);
                    color: #fff;
                    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
                    pointer-events: none;
                }

                .settings-button:hover .button-img,
                .settings-button:focus-visible .button-img {
                    transform: scale(1.04);
                    filter: brightness(1.06);
                }

                .settings-button.pressed .button-img,
                .settings-button:active .button-img {
                    transform: translateY(4px) scale(0.985);
                }

                .settings-close {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    width: 42px;
                    height: 42px;
                    border: none;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    font-size: 28px;
                    cursor: pointer;
                }

                body.compact-landscape .settings-panel {
                    width: min(92vw, 720px);
                    transform: scale(var(--mobile-panel-scale));
                    transform-origin: center center;
                }

                body.compact-landscape .settings-view {
                    padding: calc(var(--safe-top, 0px) + 8px) 10px calc(var(--safe-bottom, 0px) + 8px);
                }
            </style>

            <div class="view settings-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>
                <div class="settings-panel">
                    <button id="settings-close" class="settings-close" aria-label="关闭">×</button>
                    <h2>设置</h2>

                    <div class="settings-list">
                        <div class="setting-item">
                            <label for="bgm-volume">背景音乐</label>
                            <input type="range" id="bgm-volume" min="0" max="1" step="0.01" value="${audioManager.volumes.indexBgm}">
                        </div>
                        <div class="setting-item">
                            <label for="voice-volume">人物语音</label>
                            <input type="range" id="voice-volume" min="0" max="1" step="0.01" value="${audioManager.volumes.voice}">
                        </div>
                    </div>

                    <div class="settings-buttons">
                        <button type="button" id="logout-btn" class="settings-button">
                            <img class="button-img" src="./assets/img/button.png" alt="">
                            <a>退出登录</a>
                        </button>
                        <button type="button" id="back-to-menu-btn" class="settings-button">
                            <img class="button-img" src="./assets/img/button.png" alt="">
                            <a>返回</a>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    attachEventListeners: (container, engine, params = {}) => {
        const bgmSlider = document.getElementById('bgm-volume');
        const voiceSlider = document.getElementById('voice-volume');

        const goBack = async () => {
            engine.audioManager.playSoundEffect('click');
            if (params.from === 'Game') {
                await engine.resumeGame();
                return;
            }
            engine.showView('MainMenu');
        };

        bgmSlider.addEventListener('input', () => {
            engine.audioManager.setVolume('indexBgm', bgmSlider.value);
            engine.audioManager.setVolume('gameBgm', bgmSlider.value);
        });

        voiceSlider.addEventListener('input', () => {
            engine.audioManager.setVolume('voice', voiceSlider.value);
        });

        bindInteractivePress(document.getElementById('logout-btn'), {
            onHover: () => engine.audioManager.playSoundEffect('hover'),
            onClick: () => {
                engine.audioManager.playSoundEffect('click');
                if (confirm('您确定要退出登录吗？')) {
                    engine.logout();
                }
            },
        });

        bindInteractivePress(document.getElementById('back-to-menu-btn'), {
            onHover: () => engine.audioManager.playSoundEffect('hover'),
            onClick: goBack,
        });

        bindInteractivePress(document.getElementById('settings-close'), {
            onClick: goBack,
            keyboard: true,
        });
    }
};

export default SettingsView;
