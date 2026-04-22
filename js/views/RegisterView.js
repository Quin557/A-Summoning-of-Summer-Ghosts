import { bindInteractivePress } from '../utils/interactions.js';

const RegisterView = {
    render: (container, engine) => {
        const L = engine.localization;
        container.innerHTML = `
            <div class="view auth-view auth-view--register" id="register-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>

                <div class="auth-stage">
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
                        </div>
                    </div>

                    <div class="auth-button-group">
                        <button type="button" class="auth-button" id="register-btn">
                            <img src="./assets/img/login/button.png" alt="">
                            <span class="auth-button-label">${L.get('ui.register')}</span>
                        </button>
                        <button type="button" class="auth-button" id="back-to-login-btn">
                            <img src="./assets/img/login/button.png" alt="">
                            <span class="auth-button-label">${L.get('ui.back')}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    attachEventListeners: (container, engine) => {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('password2');

        const submitRegister = () => {
            const user = usernameInput.value.trim();
            const pass1 = passwordInput.value;
            const pass2 = confirmInput.value;
            if (!user || !pass1) {
                alert('用户名和密码不能为空。');
                return;
            }
            if (pass1 !== pass2) {
                alert('两次输入的密码不一致。');
                return;
            }
            if (engine.saveManager.register(user, pass1)) {
                engine.audioManager.playSoundEffect('click');
                alert('注册成功！');
                engine.showView('Login');
            } else {
                alert('注册失败，用户名已存在。');
            }
        };

        bindInteractivePress(document.getElementById('register-btn'), {
            onHover: () => engine.audioManager.playSoundEffect('hover'),
            onClick: submitRegister,
        });

        bindInteractivePress(document.getElementById('back-to-login-btn'), {
            onHover: () => engine.audioManager.playSoundEffect('hover'),
            onClick: () => {
                engine.audioManager.playSoundEffect('click');
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
