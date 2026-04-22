import { bindInteractivePress } from '../utils/interactions.js';

const RegisterView = {
    render: (container, engine) => {
        const L = engine.localization;
        container.innerHTML = `
            <div class="view auth-view auth-view--register" id="register-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>
                <div class="auth-backdrop"></div>

                <div class="auth-layout">
                    <section class="auth-hero">
                        <p class="auth-kicker">New Moon Archive</p>
                        <h1 class="auth-title">注册新账号</h1>
                        <p class="auth-subtitle">为你的存档和故事留一个名字</p>
                    </section>

                    <section class="auth-panel">
                        <div class="auth-form">
                            <img src="./assets/img/menuBox/paper.png" class="auth-form-img" alt="">
                            <div class="auth-form-body">
                                <div class="auth-form-line">
                                    <label class="auth-form-label" for="username">${L.get('ui.username')}</label>
                                    <input type="text" id="username" name="username" autocomplete="username">
                                </div>
                                <div class="auth-form-line">
                                    <label class="auth-form-label" for="password">${L.get('ui.password')}</label>
                                    <input type="password" id="password" name="password" autocomplete="new-password">
                                </div>
                                <div class="auth-form-line">
                                    <label class="auth-form-label" for="password2">${L.get('ui.confirm')}</label>
                                    <input type="password" id="password2" name="password2" autocomplete="new-password">
                                </div>

                                <p class="auth-message" id="register-message"></p>
                            </div>
                        </div>

                        <div class="auth-button-group">
                            <button type="button" class="auth-button" id="register-btn">
                                <img src="./assets/img/button.png" alt="">
                                <span class="auth-button-label">${L.get('ui.register')}</span>
                            </button>
                            <button type="button" class="auth-button" id="back-to-login-btn">
                                <img src="./assets/img/button.png" alt="">
                                <span class="auth-button-label">${L.get('ui.back')}</span>
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        `;
    },

    attachEventListeners: (container, engine) => {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('password2');
        const messageElement = document.getElementById('register-message');

        const setMessage = (message, type = 'info') => {
            messageElement.textContent = message;
            messageElement.className = `auth-message auth-message--${type}`;
        };

        const submitRegister = () => {
            const user = usernameInput.value.trim();
            const pass1 = passwordInput.value;
            const pass2 = confirmInput.value;

            const validationResult = engine.saveManager.validateRegistration(user, pass1);
            if (!validationResult.valid) {
                setMessage(validationResult.message, 'error');
                return;
            }

            if (pass1 !== pass2) {
                setMessage('两次输入的密码不一致。', 'error');
                return;
            }

            if (engine.saveManager.register(validationResult.username, pass1)) {
                engine.audioManager.playSoundEffect('titleClick');
                engine.showView('Login', {
                    registeredUsername: validationResult.username,
                    flashMessage: '注册成功，现在可以直接登录了。',
                });
            } else {
                setMessage('注册失败，用户名已存在。', 'error');
            }
        };

        bindInteractivePress(document.getElementById('register-btn'), {
            onHover: () => engine.audioManager.playSoundEffect('titleHover'),
            onClick: submitRegister,
        });

        bindInteractivePress(document.getElementById('back-to-login-btn'), {
            onHover: () => engine.audioManager.playSoundEffect('titleHover'),
            onClick: () => {
                engine.audioManager.playSoundEffect('titleClick');
                engine.showView('Login');
            },
        });

        [usernameInput, passwordInput, confirmInput].forEach((input) => {
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    submitRegister();
                }
            });
        });
    }
};

export default RegisterView;
