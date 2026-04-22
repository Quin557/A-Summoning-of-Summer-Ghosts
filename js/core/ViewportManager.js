export default class ViewportManager {
    constructor() {
        this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        this.hasAttemptedImmersive = false;
        this.lastTouchEndAt = 0;
        this.boundUpdateViewport = this.updateViewportUnits.bind(this);
        this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
        this.boundPreventGesture = this.preventGesture.bind(this);
        this.boundHandleVisibility = this.updateOrientationState.bind(this);
        this.boundHandleFirstInteraction = this.handleFirstInteraction.bind(this);
        this.orientationOverlay = null;
    }

    init() {
        this.ensureOrientationOverlay();
        this.updateViewportUnits();
        this.updateOrientationState();

        window.addEventListener('resize', this.boundUpdateViewport, { passive: true });
        window.addEventListener('orientationchange', this.boundUpdateViewport, { passive: true });
        window.addEventListener('resize', this.boundHandleVisibility, { passive: true });
        window.addEventListener('orientationchange', this.boundHandleVisibility, { passive: true });
        document.addEventListener('visibilitychange', this.boundHandleVisibility, { passive: true });

        if (this.isTouchDevice) {
            document.addEventListener('pointerdown', this.boundHandleFirstInteraction, { passive: true });
            document.addEventListener('keydown', this.boundHandleFirstInteraction, { passive: true });
            document.addEventListener('touchend', this.boundHandleTouchEnd, { passive: false });
            document.addEventListener('gesturestart', this.boundPreventGesture, { passive: false });
            document.addEventListener('gesturechange', this.boundPreventGesture, { passive: false });
        }
    }

    updateViewportUnits() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const vh = height * 0.01;
        const vw = width * 0.01;
        const isLandscape = width >= height;
        const isCompactLandscape = this.isTouchDevice && isLandscape;
        const widthRatio = width / 932;
        const heightRatio = height / 483;
        const compactRatio = Math.min(widthRatio, heightRatio);
        const uiScale = isCompactLandscape
            ? Math.max(0.62, Math.min(0.88, compactRatio * 0.92))
            : 1;
        const panelScale = isCompactLandscape
            ? Math.max(0.58, Math.min(0.82, uiScale * 0.9))
            : 1;
        const galleryScale = isCompactLandscape
            ? Math.max(0.54, Math.min(0.78, uiScale * 0.86))
            : 1;

        document.documentElement.style.setProperty('--app-vh', `${vh}px`);
        document.documentElement.style.setProperty('--app-vw', `${vw}px`);
        document.documentElement.style.setProperty('--app-height', `${height}px`);
        document.documentElement.style.setProperty('--viewport-width', `${width}px`);
        document.documentElement.style.setProperty('--viewport-height', `${height}px`);
        document.documentElement.style.setProperty('--mobile-ui-scale', `${uiScale}`);
        document.documentElement.style.setProperty('--mobile-panel-scale', `${panelScale}`);
        document.documentElement.style.setProperty('--mobile-gallery-scale', `${galleryScale}`);
        document.body.classList.toggle('compact-landscape', isCompactLandscape);
    }

    ensureOrientationOverlay() {
        let overlay = document.getElementById('orientation-lock-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'orientation-lock-overlay';
            overlay.className = 'orientation-lock-overlay';
            overlay.innerHTML = `
                <div class="orientation-lock-card">
                    <h2>请横屏体验</h2>
                    <p>这是横屏游戏。将设备旋转到横向后，界面会自动继续。</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        this.orientationOverlay = overlay;
    }

    updateOrientationState() {
        if (!this.orientationOverlay) return;
        const isPortrait = window.innerHeight > window.innerWidth;
        this.orientationOverlay.classList.toggle('visible', this.isTouchDevice && isPortrait);
        document.body.classList.toggle('is-portrait-lock', this.isTouchDevice && isPortrait);
    }

    handleTouchEnd(event) {
        const now = Date.now();
        if (now - this.lastTouchEndAt < 280) {
            event.preventDefault();
        }
        this.lastTouchEndAt = now;
    }

    preventGesture(event) {
        event.preventDefault();
    }

    handleFirstInteraction() {
        if (this.hasAttemptedImmersive) return;
        this.hasAttemptedImmersive = true;
        this.enterImmersiveMode();
    }

    async enterImmersiveMode() {
        const root = document.documentElement;

        try {
            if (!document.fullscreenElement && root.requestFullscreen) {
                await root.requestFullscreen({ navigationUI: 'hide' });
            }
        } catch (error) {
            console.warn('进入全屏失败:', error);
        }

        try {
            if (screen.orientation?.lock) {
                await screen.orientation.lock('landscape');
            }
        } catch (error) {
            console.warn('锁定横屏失败:', error);
        }
    }

    async toggleFullscreen() {
        if (!document.fullscreenElement) {
            await this.enterImmersiveMode();
            return true;
        }

        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.warn('退出全屏失败:', error);
        }

        return false;
    }
}
