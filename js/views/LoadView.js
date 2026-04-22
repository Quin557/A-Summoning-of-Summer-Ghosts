import { bindInteractivePress } from '../utils/interactions.js';

const LoadView = {
    totalSlots: 30,

    render: (container, engine, params = {}) => {
        const L = engine.localization;
        const saves = engine.saveManager.currentUser.saveArray;
        const from = params.from || 'MainMenu';

        container.innerHTML = `
            <style>
                .load-view {
                    position: relative;
                    width: 100vw;
                    min-height: calc(var(--app-vh, 1vh) * 100);
                    padding: calc(var(--safe-top, 0px) + 14px) 16px calc(var(--safe-bottom, 0px) + 18px);
                    display: flex;
                    flex-direction: column;
                }

                .load-shell {
                    width: min(1200px, 100%);
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    flex: 1;
                    min-height: 0;
                }

                .load-header {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) auto auto;
                    align-items: center;
                    gap: 12px;
                }

                .load-header-title {
                    min-width: 0;
                }

                .load-title {
                    margin: 0;
                    font-family: var(--font-title);
                    font-size: clamp(28px, 4vw, 40px);
                    color: #fff;
                    text-shadow: 0 4px 18px rgba(0, 0, 0, 0.42);
                }

                .load-subtitle {
                    margin: 4px 0 0;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: clamp(14px, 1.5vw, 18px);
                }

                .load-menu-btn {
                    position: relative;
                    width: min(220px, 42vw);
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    touch-action: manipulation;
                }

                .load-menu-btn img {
                    width: 100%;
                    display: block;
                    transition: transform 160ms ease, filter 160ms ease;
                }

                .load-menu-btn span {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 84%;
                    margin: auto;
                    font-family: var(--font-button);
                    font-size: clamp(16px, 2vw, 24px);
                    color: #fff;
                    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
                    pointer-events: none;
                }

                .load-menu-btn:hover img,
                .load-menu-btn:focus-visible img {
                    transform: scale(1.04);
                    filter: brightness(1.06);
                }

                .load-menu-btn.pressed img,
                .load-menu-btn:active img {
                    transform: translateY(4px) scale(0.985);
                }

                .save-slot-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 16px;
                    overflow-y: auto;
                    padding-right: 2px;
                    flex: 1;
                    min-height: 0;
                }

                .save-card {
                    position: relative;
                    display: grid;
                    grid-template-columns: minmax(0, 1.3fr) minmax(140px, 0.9fr);
                    gap: 16px;
                    min-height: 196px;
                    padding: 20px;
                    border-radius: 28px;
                    overflow: hidden;
                    color: #28170d;
                }

                .save-card-bg {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: 0.95;
                    z-index: -1;
                }

                .save-card-main {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }

                .save-card-name {
                    margin: 0 0 8px;
                    font-family: var(--font-title);
                    font-size: clamp(22px, 2.4vw, 30px);
                    color: #4a2a16;
                }

                .save-card-meta {
                    display: grid;
                    gap: 6px;
                    font-size: clamp(14px, 1.3vw, 18px);
                    color: rgba(44, 24, 13, 0.84);
                }

                .save-card-thumb {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .save-card-thumb img {
                    width: min(100%, 220px);
                    aspect-ratio: 16 / 9;
                    object-fit: cover;
                    border-radius: 18px;
                    border: 2px solid rgba(88, 52, 34, 0.12);
                    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.14);
                }

                .save-card-actions {
                    display: flex;
                    flex-wrap: nowrap;
                    justify-content: space-between;
                    gap: 16px;
                    margin-top: auto;
                    padding-top: 16px;
                    align-items: center;
                    width: min(286px, 100%);
                }

                .slot-action-btn {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 82px;
                    height: 54px;
                    padding: 0;
                    border: none;
                    border-radius: 16px;
                    background: transparent;
                    color: #402515;
                    font-family: var(--font-button);
                    cursor: pointer;
                    touch-action: manipulation;
                    flex: 0 0 auto;
                    animation: save-action-glow 3.8s ease-in-out infinite;
                }

                .slot-action-btn img {
                    width: 34px;
                    height: 34px;
                    object-fit: contain;
                    filter:
                        drop-shadow(0 0 6px rgba(255, 235, 174, 0.42))
                        drop-shadow(0 0 16px rgba(255, 223, 128, 0.26));
                }

                .slot-action-btn span {
                    display: none;
                }

                .slot-action-btn:hover,
                .slot-action-btn:focus-visible {
                    transform: translateY(-1px) scale(1.04);
                }

                .slot-action-btn.pressed,
                .slot-action-btn:active {
                    transform: scale(0.98);
                }

                @keyframes save-action-glow {
                    0%, 100% {
                        box-shadow:
                            0 0 0 rgba(255, 221, 150, 0),
                            0 0 16px rgba(255, 221, 150, 0.12);
                    }
                    50% {
                        box-shadow:
                            0 0 12px rgba(255, 229, 164, 0.36),
                            0 0 26px rgba(255, 215, 120, 0.26);
                    }
                }

                @media (max-width: 900px) {
                    .load-header {
                        grid-template-columns: 1fr;
                    }

                    .load-header .load-menu-btn {
                        width: min(72vw, 260px);
                    }

                    .save-slot-grid {
                        grid-template-columns: 1fr;
                    }

                    .save-card {
                        grid-template-columns: minmax(0, 1fr) minmax(138px, 0.96fr);
                        grid-template-areas:
                            "main thumb"
                            "actions actions";
                        gap: 12px 16px;
                        min-height: 228px;
                        padding: 18px 18px 14px;
                        border-radius: 26px;
                    }

                    .save-card-main {
                        grid-area: main;
                        justify-content: flex-start;
                    }

                    .save-card-thumb {
                        grid-area: thumb;
                        justify-content: center;
                        align-items: start;
                        min-height: 114px;
                        padding: 2px 10px 0;
                        border-radius: 22px;
                        background: rgba(255, 255, 255, 0.08);
                        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
                    }

                    .save-card-thumb img {
                        width: 100%;
                        max-width: 220px;
                        border-radius: 24px;
                    }

                    .save-card-name {
                        margin-bottom: 10px;
                        font-size: clamp(20px, 4vw, 28px);
                    }

                    .save-card-meta {
                        gap: 8px;
                        font-size: clamp(13px, 2.8vw, 18px);
                    }

                    .save-card-actions {
                        grid-area: actions;
                        width: 100%;
                        max-width: none;
                        display: grid;
                        grid-template-columns: minmax(132px, 1.15fr) repeat(2, minmax(98px, 1fr));
                        gap: 12px;
                        margin-top: 2px;
                        padding: 12px 10px 0;
                        align-items: stretch;
                        border-top: 1px solid rgba(118, 86, 140, 0.16);
                    }

                    .slot-action-btn {
                        width: 100%;
                        height: 70px;
                        border-radius: 20px;
                        background: rgba(255, 255, 255, 0.12);
                        border: 1px solid rgba(255, 255, 255, 0.12);
                        box-shadow:
                            inset 0 0 0 1px rgba(255, 255, 255, 0.05),
                            0 8px 18px rgba(64, 38, 82, 0.08);
                    }

                    .slot-action-btn img {
                        display: none;
                    }

                    .slot-action-btn span {
                        display: block;
                        position: static;
                        color: rgba(255, 250, 255, 0.96);
                        font-family: var(--font-button);
                        font-size: 16px;
                        line-height: 1;
                        letter-spacing: 0.08em;
                        text-shadow: 0 2px 8px rgba(48, 24, 62, 0.32);
                    }

                    .slot-action-btn--primary {
                        justify-content: center;
                        background: rgba(255, 255, 255, 0.12);
                    }

                    .slot-action-btn--primary::before {
                        content: '';
                        position: absolute;
                        left: 10px;
                        right: 10px;
                        height: 56px;
                        border-radius: 20px;
                        background: linear-gradient(180deg, rgba(255, 238, 247, 0.68), rgba(255, 221, 238, 0.28));
                        border: 1px solid rgba(255, 255, 255, 0.42);
                        box-shadow:
                            0 0 0 1px rgba(255, 255, 255, 0.28) inset,
                            0 8px 20px rgba(88, 52, 101, 0.12);
                    }

                    .slot-action-btn--primary span {
                        position: relative;
                        z-index: 1;
                        width: auto;
                        text-align: center;
                        color: #c64f77;
                        font-size: 18px;
                        text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
                    }

                    .slot-action-btn--primary img {
                        display: block;
                        position: relative;
                        z-index: 1;
                        width: 28px;
                        height: 28px;
                        margin-right: 8px;
                        filter:
                            drop-shadow(0 0 4px rgba(255, 255, 255, 0.52))
                            drop-shadow(0 0 8px rgba(198, 79, 119, 0.18));
                    }
                }

                @media (max-width: 640px) and (pointer: coarse) {
                    .save-card {
                        grid-template-columns: minmax(0, 1fr) minmax(124px, 0.92fr);
                        gap: 8px 12px;
                        min-height: 206px;
                        padding: 16px 14px 12px;
                    }

                    .save-card-name {
                        margin-bottom: 8px;
                        font-size: clamp(18px, 5.2vw, 24px);
                    }

                    .save-card-meta {
                        gap: 6px;
                        font-size: clamp(12px, 3.6vw, 16px);
                    }

                    .save-card-thumb {
                        min-height: 102px;
                        padding: 0 8px 0;
                    }

                    .save-card-thumb img {
                        border-radius: 20px;
                    }

                    .save-card-actions {
                        grid-template-columns: minmax(114px, 1.12fr) repeat(2, minmax(78px, 1fr));
                        gap: 8px;
                        padding-top: 8px;
                    }

                    .slot-action-btn {
                        height: 62px;
                    }

                    .slot-action-btn--primary {
                        padding: 0 8px;
                    }

                    .slot-action-btn--primary::before {
                        left: 8px;
                        right: 8px;
                        height: 50px;
                        border-radius: 18px;
                    }

                    .slot-action-btn--primary span {
                        font-size: 16px;
                    }

                    .slot-action-btn--primary img {
                        width: 24px;
                        height: 24px;
                        margin-right: 6px;
                    }

                    .slot-action-btn span {
                        font-size: 13px;
                    }
                }

                @media (max-width: 980px) and (max-height: 520px) and (orientation: landscape) {
                    .load-view {
                        padding: calc(var(--safe-top, 0px) + 10px) 12px calc(var(--safe-bottom, 0px) + 10px);
                    }

                    .load-shell {
                        gap: 10px;
                    }

                    .load-header {
                        grid-template-columns: minmax(0, 1fr) auto;
                        gap: 10px 12px;
                        align-items: center;
                    }

                    .load-title {
                        font-size: clamp(22px, 3vw, 30px);
                    }

                    .load-subtitle {
                        display: none;
                    }

                    .load-menu-btn {
                        width: min(170px, 24vw);
                    }

                    #resume-btn {
                        display: none;
                    }

                    .save-slot-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 10px;
                    }

                    .save-card {
                        grid-template-columns: minmax(0, 1.18fr) minmax(128px, 0.82fr);
                        gap: 10px 14px;
                        min-height: 158px;
                        padding: 12px 14px;
                        border-radius: 22px;
                    }

                    .save-card-main {
                        grid-area: auto;
                    }

                    .save-card-name {
                        margin-bottom: 6px;
                        font-size: clamp(17px, 2.5vw, 24px);
                    }

                    .save-card-meta {
                        gap: 4px;
                        font-size: clamp(11px, 1.65vw, 15px);
                    }

                    .save-card-thumb {
                        grid-area: auto;
                        justify-content: center;
                        min-height: 84px;
                        padding: 0;
                        border-radius: 18px;
                        align-items: start;
                        background: none;
                        box-shadow: none;
                    }

                    .save-card-thumb img {
                        width: min(100%, 180px);
                        max-width: 180px;
                        border-radius: 22px;
                    }

                    .save-card-actions {
                        display: grid;
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                        gap: 8px;
                        margin-top: auto;
                        padding: 10px 0 0;
                        width: min(320px, 100%);
                        border-top: none;
                    }

                    .slot-action-btn {
                        height: 46px;
                        border-radius: 18px;
                        background: rgba(255, 255, 255, 0.12);
                        border: 1px solid rgba(255, 255, 255, 0.12);
                        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
                    }

                    .slot-action-btn img,
                    .slot-action-btn--primary img {
                        display: none;
                    }

                    .slot-action-btn span,
                    .slot-action-btn--primary span {
                        display: block;
                        position: static;
                        width: auto;
                        margin: 0;
                        text-align: center;
                        font-size: 12px;
                        color: rgba(255, 250, 255, 0.98);
                        text-shadow: 0 1px 6px rgba(48, 24, 62, 0.28);
                    }

                    .slot-action-btn--primary {
                        background: rgba(255, 255, 255, 0.18);
                    }

                    .slot-action-btn--primary::before {
                        display: none;
                    }
                }
            </style>

            <div class="view load-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>
                <div class="load-shell">
                    <div class="load-header">
                        <div class="load-header-title">
                            <h1 class="load-title">存档系统</h1>
                            <p class="load-subtitle">保存、读取与管理当前账号的章节进度</p>
                        </div>

                        ${from === 'MainMenu' ? '' : `
                            <button type="button" id="resume-btn" class="load-menu-btn">
                                <img src="./assets/img/button.png" alt="">
                                <span>${L.get('ui.continue')}</span>
                            </button>
                        `}

                        <button type="button" id="back-to-menu" class="load-menu-btn">
                            <img src="./assets/img/button.png" alt="">
                            <span>${from === 'MainMenu' ? L.get('ui.title') : '返回'}</span>
                        </button>
                    </div>

                    <div class="save-slot-grid"></div>
                </div>
            </div>
        `;

        const slotGrid = container.querySelector('.save-slot-grid');
        for (let i = 0; i < LoadView.totalSlots; i++) {
            const save = saves[i] || null;
            const nodeData = save ? engine.dataManager.getNode(save.nodeId) : null;
            const thumbnail = nodeData?.bgr ? `./assets/img/bgr/${nodeData.bgr}.png` : './assets/img/bgr/test.png';
            const chapter = nodeData ? `章节 ${Math.floor(save.nodeId / 100)}` : '空槽位';
            const dateText = save ? save.saveDate : '尚未保存';
            const saveName = save?.name || `存档 ${i + 1}`;

            const card = document.createElement('article');
            card.className = 'save-card';
            card.innerHTML = `
                <img class="save-card-bg" src="./assets/img/menuBox/paper2.jpg" alt="">
                <div class="save-card-main">
                    <h2 class="save-card-name">${saveName}</h2>
                    <div class="save-card-meta">
                        <div>栏位：${i + 1}</div>
                        <div>章节：${chapter}</div>
                        <div>时间：${dateText}</div>
                    </div>
                    <div class="save-card-actions">
                        <button type="button" class="slot-action-btn slot-action-btn--primary" data-action="load" data-slot="${i}">
                            <img src="./assets/img/load.png" alt="load">
                            <span>LOAD</span>
                        </button>
                        <button type="button" class="slot-action-btn" data-action="save" data-slot="${i}">
                            <img src="./assets/img/save.png" alt="save">
                            <span>SAVE</span>
                        </button>
                        <button type="button" class="slot-action-btn" data-action="delete" data-slot="${i}">
                            <img src="./assets/img/delete.png" alt="delete">
                            <span>DELETE</span>
                        </button>
                    </div>
                </div>
                <div class="save-card-thumb">
                    <img src="${thumbnail}" alt="${chapter}">
                </div>
            `;
            slotGrid.appendChild(card);
        }

        LoadView.attachEventListeners(container, engine, params);
    },

    attachEventListeners: (container, engine, params = {}) => {
        const from = params.from || 'MainMenu';

        const handleBack = async () => {
            engine.audioManager.playSoundEffect('click');
            if (from === 'Game' || from === 'Submenu') {
                await engine.resumeGame();
                return;
            }
            engine.showView('MainMenu');
        };

        bindInteractivePress(document.getElementById('back-to-menu'), {
            onHover: () => engine.audioManager.playSoundEffect('hover'),
            onClick: handleBack,
        });

        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) {
            bindInteractivePress(resumeBtn, {
                onHover: () => engine.audioManager.playSoundEffect('hover'),
                onClick: async () => {
                    engine.audioManager.playSoundEffect('click');
                    if (typeof engine.resumeGame === 'function') {
                        try {
                            await engine.resumeGame();
                        } catch (error) {
                            console.error('resumeGame failed:', error);
                        }
                    }
                },
            });
        }

        LoadView.bindSlotButtons(container, engine, params);
    },

    bindSlotButtons: (container, engine, params = {}) => {
        container.querySelectorAll('.slot-action-btn').forEach((button) => {
            bindInteractivePress(button, {
                onHover: () => engine.audioManager.playSoundEffect('hover'),
                onClick: async () => {
                    engine.audioManager.playSoundEffect('click');
                    const action = button.dataset.action;
                    const slot = Number(button.dataset.slot);

                    if (action === 'load') {
                        const saveData = engine.saveManager.loadGame(slot);
                        if (saveData) {
                            await engine.startGame(saveData);
                        } else {
                            alert('空存档，无法读取。');
                        }
                        return;
                    }

                    if (action === 'save') {
                        if (!engine.gameState.currentSave) {
                            alert('没有正在进行的游戏可以存档。');
                            return;
                        }

                        const currentSave = engine.saveManager.currentUser.saveArray[slot];
                        const defaultName = currentSave?.name || `章节 ${Math.floor(engine.gameState.currentSave.nodeId / 100)}`;
                        const saveName = prompt('请输入存档名称：', defaultName);

                        if (saveName === null) return;
                        if (!saveName.trim()) {
                            alert('存档名称不能为空。');
                            return;
                        }

                        if (engine.saveManager.saveGame(slot, engine.gameState.currentSave, saveName.trim())) {
                            alert(`存档 "${saveName.trim()}" 已成功保存到栏位 ${slot + 1}。`);
                            LoadView.render(container, engine, params);
                        }
                        return;
                    }

                    if (action === 'delete') {
                        if (!engine.saveManager.currentUser.saveArray[slot]) {
                            alert('这是一个空存档，无需删除。');
                            return;
                        }
                        if (confirm(`您确定要删除存档 ${slot + 1} 吗？此操作不可恢复。`)) {
                            if (engine.saveManager.deleteSave(slot)) {
                                alert(`存档 ${slot + 1} 已被删除。`);
                                LoadView.render(container, engine, params);
                            }
                        }
                    }
                },
            });
        });
    }
};

export default LoadView;
