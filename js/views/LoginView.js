import { bindInteractivePress } from '../utils/interactions.js';

const LoginView = {
    render: (container, engine) => {
        const L = engine.localization;
        container.innerHTML = `
            <div class="view auth-view auth-view--login" id="login-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>

                <div class="auth-stage">
                    <div class="auth-form">
                        <img src="./assets/img/login/paper.png" class="auth-form-img" alt="">
                        <div class="auth-form-body">
                            <div class="auth-form-line">
                                <label class="auth-form-label" for="username">${L.get('ui.username')}</label>
                                <input type="text" id="username" name="username" autocomplete="username">
                            </div>
                            <div class="auth-form-line">
                                <label class="auth-form-label" for="password">${L.get('ui.password')}</label>
                                <input type="password" id="password" name="password" autocomplete="current-password">
                            </div>
                        </div>
                    </div>

                    <div class="auth-button-group">
                        <button type="button" class="auth-button" id="login-btn">
                            <img src="./assets/img/login/button.png" alt="">
                            <span class="auth-button-label">${L.get('ui.login')}</span>
                        </button>
                        <button type="button" class="auth-button" id="register-nav-btn">
                            <img src="./assets/img/login/button.png" alt="">
                            <span class="auth-button-label">${L.get('ui.register')}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    attachEventListeners: (container, engine) => {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        const submitLogin = () => {
            const user = usernameInput.value.trim();
            const pass = passwordInput.value;
            if (engine.saveManager.login(user, pass)) {
                engine.audioManager.playSoundEffect('click');
                engine.showView('MainMenu');
            } else {
                alert('登录失败，请检查用户名和密码。');
            }
        };

        bindInteractivePress(document.getElementById('login-btn'), {
            onHover: () => engine.audioManager.playSoundEffect('hover'),
            onClick: submitLogin,
        });

        bindInteractivePress(document.getElementById('register-nav-btn'), {
            onHover: () => engine.audioManager.playSoundEffect('hover'),
            onClick: () => {
                engine.audioManager.playSoundEffect('click');
                engine.showView('Register');
            },
        });

        [usernameInput, passwordInput].forEach((input) => {
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    submitLogin();
                }
            });
        });
    }
};

export default LoginView;
