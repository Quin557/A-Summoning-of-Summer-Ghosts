import { Game as PlatformerGame } from '../../minigames/platformer/js/core/Game.js';

const MinigameView = {
    gameInstance: null,
    assetManager: null, 

    render: (container, engine, params) => {
        const node = params.nodeData;
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        
        container.innerHTML = `
            <style>
                .minigame-canvas { display: block; width: 100vw; height: 100vh; }
                .minigame-view {
                    position: relative;
                    width: 100vw;
                    height: calc(var(--app-vh, 1vh) * 100);
                    background:
                        radial-gradient(circle at top, rgba(122, 130, 186, 0.16), transparent 32%),
                        linear-gradient(180deg, #0d1020 0%, #151a2f 46%, #0a0d16 100%);
                    overflow: hidden;
                }
                
                /* 介绍和结果浮层的通用样式 */
                .minigame-overlay {
                    position: fixed; top: 0; left: 0;
                    width: 100%; height: 100%;
                    background-color: rgba(0, 0, 0, 0.85); color: white;
                    display: flex; justify-content: center; align-items: center;
                    text-align: center; z-index: 1001;
                    font-family: var(--font-title);
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                }
                .overlay-content {
                    max-width: 600px; padding: 40px;
                    border: 1px solid rgba(214, 219, 255, 0.24);
                    background: linear-gradient(180deg, rgba(21, 26, 47, 0.94), rgba(8, 10, 22, 0.92));
                    border-radius: 18px;
                    box-shadow: 0 18px 40px rgba(0,0,0,0.5);
                }
                .overlay-content h2 { font-size: clamp(30px, 4vw, 42px); margin-bottom: 18px; color: #d7dfff; }
                .overlay-content p { font-size: clamp(16px, 2vw, 22px); line-height: 1.7; margin-bottom: 24px; color: rgba(245,245,255,0.92); }
                .overlay-content .controls-hint { font-size: clamp(14px, 1.6vw, 18px); color: #b8c3f2; margin-bottom: 30px; }
                .overlay-content button {
                    padding: 15px 40px; font-size: clamp(18px, 2vw, 24px); cursor: pointer;
                    background: rgba(36, 43, 72, 0.9); color: white; border: 1px solid rgba(255,255,255,0.72);
                    border-radius: 12px; transition: all 0.3s ease;
                    font-family: var(--font-title);
                }
                .overlay-content button:hover { background-color: rgba(245, 246, 255, 0.95); color: #0a1022; }
                
                /* 特定样式 */
                #minigame-intro-overlay .overlay-content h2 { color: #5b6ba9ff; }
                #minigame-result-overlay { display: none; }

                /* 暂停按钮样式 */
                #minigame-pause-btn {
                    position: fixed;
                    top: calc(82px + var(--safe-top, 0px));
                    right: calc(16px + var(--safe-right, 0px));
                    z-index: 1002;
                    padding: 10px 20px;
                    font-size: clamp(14px, 1.6vw, 20px);
                    cursor: pointer;
                    background: rgba(18, 23, 42, 0.82);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.82);
                    border-radius: 12px;
                    font-family: var(--font-title);
                    display: none; /* 游戏开始前隐藏 */
                    transition: background-color 0.3s, color 0.3s;
                }
                #minigame-pause-btn:hover {
                    background-color: rgba(255, 255, 255, 0.9);
                    color: black;
                }

                /* 暂停菜单浮层样式 */
                #minigame-pause-overlay {
                    display: none; /* 默认隐藏 */
                }
                
                .pause-menu-content {
                    max-width: 750px;
                    padding: 25px 50px;
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                    align-items: center;
                }

                .pause-menu-buttons {
                    display: flex;
                    justify-content: space-around;
                    width: 100%;
                    gap: 20px;
                }

                .pause-menu-content button {
                    font-size: 1.3em;
                    padding: 12px 0;
                    width: 180px;
                    flex-shrink: 0;
                    text-align: center;
                }
                .mobile-controls {
                    position: fixed;
                    left: 0;
                    right: 0;
                    bottom: calc(12px + var(--safe-bottom, 0px));
                    display: none;
                    justify-content: space-between;
                    padding: 0 14px;
                    z-index: 1003;
                    pointer-events: none;
                }
                .mobile-controls.visible {
                    display: flex;
                }
                .mobile-controls-group {
                    display: flex;
                    gap: 12px;
                    pointer-events: auto;
                }
                .mobile-control-btn {
                    width: clamp(56px, 14vw, 78px);
                    height: clamp(56px, 14vw, 78px);
                    border-radius: 50%;
                    border: 1px solid rgba(255,255,255,0.55);
                    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.32), rgba(49, 55, 87, 0.9));
                    color: #fff;
                    font-family: var(--font-title);
                    font-size: clamp(14px, 3.2vw, 20px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.32);
                    pointer-events: auto;
                    touch-action: none;
                }
                .mobile-control-btn:active,
                .mobile-control-btn.pressed {
                    transform: scale(0.94);
                    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.42), rgba(80, 87, 125, 0.96));
                }
                @media (pointer: coarse) {
                    .overlay-content {
                        width: min(78vw, 420px);
                        padding: 18px 16px;
                    }
                    .pause-menu-buttons {
                        flex-direction: column;
                        align-items: center;
                        gap: 10px;
                    }
                    .pause-menu-content button {
                        width: min(52vw, 180px);
                        font-size: 15px;
                        padding: 10px 0;
                    }
                    #minigame-pause-btn {
                        top: calc(72px + var(--safe-top, 0px));
                        right: calc(12px + var(--safe-right, 0px));
                        padding: 8px 14px;
                        font-size: 14px;
                    }
                }
            </style>
            <div class="view minigame-view">
                <!-- 介绍浮层 -->
                <div id="minigame-intro-overlay" class="minigame-overlay">
                    <div class="overlay-content">
                        <h2>记忆碎片</h2>
                        <p>${node.introText || '收集所有光芒以继续。'}</p>
                        <div class="controls-hint">${isTouchDevice ? '点击左侧按钮移动，右侧按钮跳跃与攻击' : 'A / D : 移动  |  W : 跳跃  |  J : 攻击'}</div>
                        <button id="minigame-start-btn">开始</button>
                    </div>
                </div>

                <!-- 结果浮层 -->
                <div id="minigame-result-overlay" class="minigame-overlay">
                    <div class="overlay-content">
                        <h2 id="result-title"></h2>
                        <p id="result-text"></p>
                        <button id="minigame-continue-btn">继续</button>
                    </div>
                </div>
                
                <!-- 暂停按钮 -->
                <button id="minigame-pause-btn">暂停</button>

                <!-- 暂停菜单浮层 -->
                <div id="minigame-pause-overlay" class="minigame-overlay">
                    <div class="overlay-content pause-menu-content">
                        <h2>游戏已暂停</h2>
                        <div class="pause-menu-buttons">
                            <button id="minigame-resume-btn">继续游戏</button>
                            <button id="minigame-restart-btn">重新开始</button>
                            <button id="minigame-load-view-btn">存档/读档</button>
                        </div>
                    </div>
                </div>

                <canvas id="minigame-canvas" class="minigame-canvas"></canvas>
                <div id="minigame-mobile-controls" class="mobile-controls">
                    <div class="mobile-controls-group">
                        <button class="mobile-control-btn" data-key="ArrowLeft">左</button>
                        <button class="mobile-control-btn" data-key="ArrowRight">右</button>
                    </div>
                    <div class="mobile-controls-group">
                        <button class="mobile-control-btn" data-key="Space">跳</button>
                        <button class="mobile-control-btn" data-key="Attack">攻</button>
                    </div>
                </div>
                <div id="minigame-loading-overlay" class="minigame-overlay">正在加载小游戏资源...</div>
            </div>
        `;
    },

    attachEventListeners: async (container, engine, params) => {
        const node = params.nodeData;
        const canvas = document.getElementById('minigame-canvas');
        const introOverlay = document.getElementById('minigame-intro-overlay');
        const loadingOverlay = document.getElementById('minigame-loading-overlay');
        const startButton = document.getElementById('minigame-start-btn');

        const resultOverlay = document.getElementById('minigame-result-overlay');
        const resultTitle = document.getElementById('result-title');
        const resultText = document.getElementById('result-text');
        const continueButton = document.getElementById('minigame-continue-btn');
        
        const pauseButton = document.getElementById('minigame-pause-btn');
        const pauseOverlay = document.getElementById('minigame-pause-overlay');
        const resumeButton = document.getElementById('minigame-resume-btn');
        const restartButton = document.getElementById('minigame-restart-btn');
        const loadViewButton = document.getElementById('minigame-load-view-btn');
        const mobileControls = document.getElementById('minigame-mobile-controls');
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const onGameComplete = (result) => {
            console.log("MinigameView 收到完成回调:", result);
            pauseButton.style.display = 'none';
            mobileControls.classList.remove('visible');

            const resultData = node.onComplete[result.status];
            if (!resultData) {
                console.error("未找到对应的游戏结果数据:", result.status);
                engine.showView('MainMenu');
                return;
            }
            
            resultTitle.textContent = node.resultTitle || '任务结果';
            resultText.textContent = resultData.outroText;
            resultTitle.style.color = result.status === 'win' ? '#5b6ba9ff' : '#bd504fff';
            
            resultOverlay.style.display = 'flex';

            continueButton.addEventListener('click', async () => {
                await engine.animation.play('fadeInBlack');

                if (MinigameView.gameInstance) {
                    MinigameView.gameInstance.destroy();
                    MinigameView.gameInstance = null;
                }
                
                const nextNodeId = resultData.targetNode;

                engine.gameState.currentSave.nodeId = nextNodeId;

                await engine.returnToGame();

                await engine.animation.play('fadeOutBlack');

            }, { once: true });
        };

        const startGame = async () => {
            if (MinigameView.gameInstance) {
                MinigameView.gameInstance.destroy();
                MinigameView.gameInstance = null;
            }

            const gameConfig = {
                level: node.level, winCondition: node.winCondition,
                loseCondition: node.loseCondition, timeLimit: node.timeLimit
            };

            MinigameView.gameInstance = new PlatformerGame(canvas, gameConfig, onGameComplete);
            MinigameView.gameInstance.assetManager = MinigameView.assetManager; 
            
            try {
                await MinigameView.gameInstance.start();
                pauseButton.style.display = 'block';
                mobileControls.classList.toggle('visible', isTouchDevice);
            } catch (err) {
                console.error("小游戏启动失败:", err);
                onGameComplete({ status: 'lose' });
            }
        };

        if (!MinigameView.assetManager) {
            const tempGame = new PlatformerGame(canvas, {}, () => {});
            MinigameView.assetManager = tempGame.assetManager;
            try {
                 await MinigameView.assetManager.loadAll();
            } catch(err) {
                console.error("小游戏资源加载失败:", err);
                loadingOverlay.textContent = '资源加载失败，请刷新重试。';
                onGameComplete({ status: 'lose' });
                return;
            }
        }
        
        loadingOverlay.style.display = 'none';
        introOverlay.style.display = 'flex';

        mobileControls.classList.remove('visible');

        const bindVirtualButton = (button) => {
            const key = button.dataset.key;
            const setPressed = (value) => {
                button.classList.toggle('pressed', value);
                if (MinigameView.gameInstance?.inputHandler) {
                    MinigameView.gameInstance.inputHandler.setVirtualKey(key, value);
                }
            };
            button.addEventListener('pointerdown', (event) => {
                event.preventDefault();
                setPressed(true);
            });
            ['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
                button.addEventListener(eventName, () => setPressed(false));
            });
        };

        mobileControls.querySelectorAll('.mobile-control-btn').forEach(bindVirtualButton);

        startButton.addEventListener('click', async () => {
            introOverlay.style.display = 'none';
            await startGame();
        });

        pauseButton.addEventListener('click', () => {
            if (MinigameView.gameInstance) {
                MinigameView.gameInstance.pause();
            }
            mobileControls.classList.remove('visible');
            pauseOverlay.style.display = 'flex';
        });

        resumeButton.addEventListener('click', () => {
            pauseOverlay.style.display = 'none';
            if (MinigameView.gameInstance) {
                MinigameView.gameInstance.resume();
            }
            mobileControls.classList.toggle('visible', isTouchDevice);
        });

        restartButton.addEventListener('click', async () => {
            pauseOverlay.style.display = 'none';
            await startGame();
        });

        loadViewButton.addEventListener('click', () => {
            if (MinigameView.gameInstance) {
                MinigameView.gameInstance.pause();
            }
            engine.showView('Load', { from: 'Minigame' });
        });
    }
};

export default MinigameView;
