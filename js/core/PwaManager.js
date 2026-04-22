export default class PwaManager {
    constructor({ basePath = '/' } = {}) {
        this.basePath = basePath;
        this.deferredPrompt = null;
        this.hasReloadedForSw = false;
        this.installButton = document.getElementById('pwa-install-btn');
        this.guideButton = document.getElementById('pwa-guide-btn');
        this.tip = document.getElementById('ios-install-tip');
        this.tipBody = document.getElementById('install-tip-body');
        this.tipClose = document.getElementById('ios-tip-close');
        this.isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;
        this.isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        this.isAndroid = /android/i.test(navigator.userAgent);
        this.isChrome = /chrome|crios|chromium/i.test(navigator.userAgent);
        this.isSafari = /safari/i.test(navigator.userAgent) && !this.isChrome;
    }

    init() {
        this.bindInstallUi();
        this.bindServiceWorker();
        this.bindViewVisibility();
        this.updateGuideLabel();
    }

    bindInstallUi() {
        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            this.deferredPrompt = event;
            this.syncVisibility(document.body.dataset.currentView || '');
        });

        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            this.hideGuideButton();
            this.hideInstallButton();
            this.hideTip();
        });

        this.installButton?.addEventListener('click', async () => {
            if (!this.deferredPrompt) return;

            try {
                this.deferredPrompt.prompt();
                await this.deferredPrompt.userChoice;
            } catch (error) {
                console.warn('Install prompt failed:', error);
            } finally {
                this.deferredPrompt = null;
                this.hideInstallButton();
                this.syncVisibility(document.body.dataset.currentView || '');
            }
        });

        this.guideButton?.addEventListener('click', () => {
            if (this.tipBody) {
                this.tipBody.innerHTML = this.getGuideHtml();
            }
            if (this.deferredPrompt && !this.isIOS) {
                this.showInstallButton();
            } else {
                this.hideInstallButton();
            }
            this.showTip();
        });

        this.tipClose?.addEventListener('click', () => {
            this.hideTip();
            this.syncVisibility(document.body.dataset.currentView || '');
        });
    }

    bindViewVisibility() {
        document.addEventListener('app:viewchange', (event) => {
            this.syncVisibility(event.detail?.viewName || '');
        });

        window.addEventListener('load', () => {
            this.syncVisibility(document.body.dataset.currentView || '');
        });
    }

    getGuideHtml() {
        if (this.isSafari) {
            return `当前环境：<strong>${this.isIOS ? 'iOS' : 'Safari'}</strong> / <strong>Safari</strong><br>请点浏览器里的<strong>分享</strong>，再选<strong>添加到主屏幕</strong>。`;
        }
        if (this.isChrome) {
            return this.isIOS
                ? '当前环境：<strong>iOS</strong> / <strong>Chrome</strong><br>请点<strong>分享</strong>后尝试<strong>添加到主屏幕</strong>；如果没有该入口，请改用 Safari。'
                : `当前环境：<strong>${this.isAndroid ? 'Android' : '桌面端'}</strong> / <strong>Chrome</strong><br>可点右上角<strong>菜单</strong>选择<strong>安装应用</strong>；也可以直接点下方安装按钮。`;
        }
        return '当前浏览器未识别为 Safari 或 Chrome。Safari 可通过<strong>分享 → 添加到主屏幕</strong>安装；Chrome 可通过<strong>菜单 → 安装应用</strong>安装。';
    }

    bindServiceWorker() {
        if (!('serviceWorker' in navigator)) return;

        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register(`${this.basePath}sw.js`, {
                    scope: this.basePath,
                });

                const requestSkipWaiting = (worker) => {
                    if (!worker) return;
                    try {
                        worker.postMessage({ type: 'SKIP_WAITING' });
                    } catch (error) {
                        console.warn('skipWaiting failed:', error);
                    }
                };

                requestSkipWaiting(registration.waiting);

                registration.addEventListener('updatefound', () => {
                    const installing = registration.installing;
                    if (!installing) return;
                    installing.addEventListener('statechange', () => {
                        if (installing.state === 'installed') {
                            requestSkipWaiting(registration.waiting);
                        }
                    });
                });

                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (this.hasReloadedForSw) return;
                    this.hasReloadedForSw = true;
                    window.location.reload();
                });
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        });
    }

    showGuideButton() {
        if (this.guideButton) this.guideButton.style.display = 'inline-flex';
    }

    hideGuideButton() {
        if (this.guideButton) this.guideButton.style.display = 'none';
    }

    showInstallButton() {
        if (this.installButton) this.installButton.style.display = 'inline-flex';
    }

    hideInstallButton() {
        if (this.installButton) this.installButton.style.display = 'none';
    }

    showTip() {
        if (this.tip) this.tip.style.display = 'block';
    }

    hideTip() {
        if (this.tip) this.tip.style.display = 'none';
    }

    syncVisibility(viewName) {
        const shouldShow = !this.isStandalone && viewName === 'MainMenu';

        if (!shouldShow) {
            this.hideGuideButton();
            this.hideInstallButton();
            this.hideTip();
            return;
        }

        this.showGuideButton();
    }

    updateGuideLabel() {
        if (!this.guideButton) return;
        if (this.isSafari) {
            this.guideButton.textContent = 'Safari 安装';
        } else if (this.isChrome) {
            this.guideButton.textContent = 'Chrome 安装';
        } else {
            this.guideButton.textContent = '安装指引';
        }
    }
}
