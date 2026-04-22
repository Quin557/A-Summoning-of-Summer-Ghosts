// 成就界面视图对象
const AchievementView = {
    totalSlots: 52, // 固定成就槽数量

    render: (container, engine) => {
        const L = engine.localization;
        const allAchievements = engine.dataManager.getAllAchievements();
        const unlockedIds = engine.saveManager.currentUser.achievementArray;
        const lockedIcon = engine.dataManager.getLockedAchievementIcon();

        // 获取要显示的成就（最多 totalSlots 个）
        const achievementsToRender = allAchievements.slice(0, AchievementView.totalSlots);
        while (achievementsToRender.length < AchievementView.totalSlots) achievementsToRender.push(null);

        // 生成 HTML
        const itemsHTML = achievementsToRender.map((ach) => {
            if (ach) {
                const isUnlocked = unlockedIds.includes(ach.id);
                const statusClass = isUnlocked ? 'unlocked' : 'locked';
                const iconSrc = isUnlocked ? ach.icon : lockedIcon;
                const name = isUnlocked ? `<h3>${ach.name}</h3>` : '<h3>？？？</h3>';
                const description = isUnlocked ? `<p>${ach.description}</p>` : '<p>解锁条件未达成</p>';
                return `
                    <div class="achievement-item ${statusClass}" title="${isUnlocked ? ach.name : '未解锁'}">
                        <img class="achievement-icon" src="${iconSrc}" alt="${isUnlocked ? ach.name : '未解锁'}">
                        <div class="achievement-info">
                            ${name}
                            ${description}
                        </div>
                    </div>
                `;
            } else {
                return `<div class="achievement-item empty"></div>`;
            }
        }).join('');

        container.innerHTML = `
            <style>
                .achievement-view {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow: hidden;
                }

                .navbar {
                    height: 100px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 40px;
                    position: sticky;
                    top: 0;
                    z-index: 20;
                    background: transparent; /* 由用户要求改为透明 */
                    backdrop-filter: none; /* 禁用额外的模糊遮罩 */
                }

                .menu-button {
                    position: relative;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-family: var(--font-button);
                    padding: 0;
                }

                .menu-button img { display: block; }

                .menu-button span {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: clamp(20px, 2vw, 40px);
                    color: #fff;
                    white-space: nowrap;
                    pointer-events: none;
                }

                .achievement-grid-container {
                    padding: 20px 40px;
                    box-sizing: border-box;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr); /* 每行固定 4 个格子 */
                    gap: 25px;
                    justify-items: center;
                }
                .achievement-grid-viewport {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .achievement-grid-viewport::-webkit-scrollbar { display: none; }

                .achievement-item {
                    background-color: rgba(0, 0, 0, 0.4);
                    border-radius: 15px;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    width: 100%;
                    max-width: 300px;
                    height: 300px;
                    box-sizing: border-box;
                    text-align: center;
                }

                .achievement-item.empty {
                    background: transparent;
                    border: none;
                }

                .achievement-item.unlocked {
                    border-color: #ffd700;
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
                }

                .achievement-item:hover {
                    transform: translateY(-5px);
                    background-color: rgba(255, 255, 255, 0.1);
                }

                .achievement-icon {
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #fff;
                    margin-bottom: 10px;
                }

                .achievement-item.locked .achievement-icon {
                    filter: grayscale(100%) brightness(0.7);
                }

                .achievement-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }

                .achievement-info h3 {
                    margin: 0 0 8px 0;
                    font-size: 1.5em;
                    color: #fff;
                }

                .achievement-item.locked .achievement-info h3 { color: #aaa; }

                .achievement-info p {
                    margin: 0;
                    font-size: 1.2em;
                    color: #ccc;
                    line-height: 1.4;
                }
                body.compact-landscape .achievement-view {
                    min-height: calc(var(--app-vh, 1vh) * 100);
                }
                body.compact-landscape .navbar {
                    height: 74px;
                    padding: calc(var(--safe-top, 0px) + 6px) 12px 0;
                }
                body.compact-landscape .menu-button {
                    width: min(34vw, 140px);
                }
                body.compact-landscape .menu-button img {
                    width: 100%;
                }
                body.compact-landscape .menu-button span {
                    font-size: clamp(12px, 2.2vw, 16px);
                }
                body.compact-landscape .achievement-grid-container {
                    --achievement-scale: var(--mobile-ui-scale);
                    width: calc(100% / var(--achievement-scale));
                    margin-left: calc((100% - (100% / var(--achievement-scale))) / 2);
                    padding: 12px 20px 40px;
                    transform: scale(var(--achievement-scale));
                    transform-origin: top center;
                    gap: 22px;
                }
                body.compact-landscape .achievement-grid-viewport {
                    padding-bottom: 56px;
                }
                @media (max-width: 900px) and (pointer: coarse) {
                    .achievement-view {
                        min-height: calc(var(--app-vh, 1vh) * 100);
                        overflow: hidden;
                    }
                    .navbar {
                        height: 74px;
                        padding: calc(var(--safe-top, 0px) + 6px) 12px 0;
                    }
                    .menu-button {
                        width: min(34vw, 140px);
                    }
                    .menu-button img {
                        width: 100%;
                    }
                    .menu-button span {
                        font-size: clamp(12px, 2.2vw, 16px);
                    }
                    .achievement-grid-container {
                        padding: 10px 12px 20px;
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                        gap: 10px;
                        align-items: start;
                    }
                    .achievement-item {
                        max-width: none;
                        min-width: 0;
                        height: 152px;
                        padding: 10px 8px;
                        border-radius: 12px;
                    }
                    .achievement-icon {
                        width: min(100%, 74px);
                        height: min(100%, 74px);
                        margin-bottom: 8px;
                        border-width: 2px;
                    }
                    .achievement-info h3 {
                        margin-bottom: 4px;
                        font-size: clamp(11px, 1.8vw, 14px);
                        line-height: 1.2;
                    }
                    .achievement-info p {
                        font-size: clamp(9px, 1.45vw, 12px);
                        line-height: 1.25;
                    }
                }

                @media (max-width: 980px) and (max-height: 520px) and (orientation: landscape) {
                    .achievement-grid-container {
                        padding: 8px 12px 18px;
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                        gap: 8px;
                    }
                    .achievement-item {
                        height: 126px;
                        padding: 8px 6px;
                    }
                    .achievement-icon {
                        width: 56px;
                        height: 56px;
                        margin-bottom: 6px;
                    }
                    .achievement-info h3 {
                        font-size: 11px;
                    }
                    .achievement-info p {
                        font-size: 9px;
                    }
                }
            </style>

            <div class="view achievement-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>

                <nav class="navbar" id="achievement-navbar">
                    <button class="menu-button">
                        <img class="button-img" src="./assets/img/button.png">
                        <span>${L.get('ui.achievement')}</span>
                    </button>

                    <button id="back-to-menu" class="menu-button">
                        <img class="button-img" src="./assets/img/button.png">
                        <span>${L.get('ui.title')}</span>
                    </button>
                </nav>

                <div class="achievement-grid-viewport">
                    <div class="achievement-grid-container">
                        ${itemsHTML}
                    </div>
                </div>
            </div>
        `;

        AchievementView.attachEventListeners(container, engine);
    },

    attachEventListeners: (container, engine) => {
        document.getElementById('back-to-menu').addEventListener('click', () => {
            engine.audioManager.playSoundEffect('click');
            engine.showView('MainMenu');
        });
    }
};

export default AchievementView;
