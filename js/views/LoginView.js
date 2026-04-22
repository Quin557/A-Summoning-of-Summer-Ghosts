import { bindInteractivePress } from '../utils/interactions.js';

const LoginView = {
    render: (container, engine, params = {}) => {
        const L = engine.localization;
        const authState = engine.saveManager.getAuthFormState();
        const initialUsername = params.registeredUsername || authState.username || '';
        const initialPassword = params.registeredUsername
            ? engine.saveManager.getRememberedPassword(params.registeredUsername)
            : authState.password;
        const initialRememberPassword = Boolean(initialUsername && initialPassword && authState.rememberPassword);
        const rememberedAccountsOptions = authState.rememberedAccounts
            .map((username) => `<option value="${username}"></option>`)
            .join('');

        container.innerHTML = `
            <div class="view auth-view auth-view--login" id="login-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>
                <div class="auth-backdrop"></div>

                <div class="auth-layout">
                    <section class="auth-hero">
                        <p class="auth-kicker">Moonlit Entrance</p>
                        <h1 class="auth-title">夏夜唤灵簿</h1>
                        <p class="auth-subtitle">ゆうれいのしょうかん</p>
                    </section>

                    <section class="auth-panel">
                        <div class="auth-form">
                            <img src="./assets/img/menuBox/paper.png" class="auth-form-img" alt="">
                            <div class="auth-form-body">
                                <datalist id="remembered-usernames">${rememberedAccountsOptions}</datalist>

                                <div class="auth-form-line">
                                    <label class="auth-form-label" for="username">${L.get('ui.username')}</label>
                                    <input type="text" id="username" name="username" autocomplete="username" list="remembered-usernames" value="${initialUsername}">
                                </div>
                                <div class="auth-form-line">
                                    <label class="auth-form-label" for="password">${L.get('ui.password')}</label>
                                    <input type="password" id="password" name="password" autocomplete="current-password" value="${initialPassword}">
                                </div>

                                <div class="auth-option-row">
                                    <label class="auth-check">
                                        <input type="checkbox" id="remember-account" ${authState.rememberAccount || params.registeredUsername ? 'checked' : ''}>
                                        <span>记住账号</span>
                                    </label>
                                    <label class="auth-check">
                                        <input type="checkbox" id="remember-password" ${initialRememberPassword ? 'checked' : ''}>
                                        <span>记住密码</span>
                                    </label>
                                </div>

                                <p class="auth-message ${params.flashMessage ? 'auth-message--info' : ''}" id="login-message">${params.flashMessage || ''}</p>
                            </div>
                        </div>

                        <div class="auth-button-group">
                            <button type="button" class="auth-button" id="login-btn">
                                <img src="./assets/img/button.png" alt="">
                                <span class="auth-button-label">${L.get('ui.login')}</span>
                            </button>
                            <button type="button" class="auth-button" id="register-nav-btn">
                                <img src="./assets/img/button.png" alt="">
                                <span class="auth-button-label">${L.get('ui.register')}</span>
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
        const rememberAccountInput = document.getElementById('remember-account');
        const rememberPasswordInput = document.getElementById('remember-password');
        const messageElement = document.getElementById('login-message');

        const setMessage = (message, type = 'info') => {
            messageElement.textContent = message;
            messageElement.className = `auth-message auth-message--${type}`;
        };

        const fillRememberedPassword = () => {
            const currentUsername = usernameInput.value.trim();
            if (!rememberPasswordInput.checked) {
                return;
            }

            const rememberedPassword = engine.saveManager.getRememberedPassword(currentUsername);
            passwordInput.value = rememberedPassword || '';
        };

        const submitLogin = () => {
            const user = usernameInput.value.trim();
            const pass = passwordInput.value;

            if (!user || !pass) {
                setMessage('请输入用户名和密码。', 'error');
                return;
            }

            if (engine.saveManager.login(user, pass, {
                rememberAccount: rememberAccountInput.checked || rememberPasswordInput.checked,
                rememberPassword: rememberPasswordInput.checked,
            })) {
                engine.audioManager.playSoundEffect('titleClick');
                setMessage('登录成功，正在进入主菜单……', 'success');
                engine.showView('MainMenu');
            } else {
                setMessage('登录失败，请检查用户名和密码。', 'error');
            }
        };

        bindInteractivePress(document.getElementById('login-btn'), {
            onHover: () => engine.audioManager.playSoundEffect('titleHover'),
            onClick: submitLogin,
        });

        bindInteractivePress(document.getElementById('register-nav-btn'), {
            onHover: () => engine.audioManager.playSoundEffect('titleHover'),
            onClick: () => {
                engine.audioManager.playSoundEffect('titleClick');
                engine.showView('Register');
            },
        });

        rememberAccountInput.addEventListener('change', () => {
            if (!rememberAccountInput.checked) {
                rememberPasswordInput.checked = false;
            }
        });

        rememberPasswordInput.addEventListener('change', () => {
            if (rememberPasswordInput.checked) {
                rememberAccountInput.checked = true;
                fillRememberedPassword();
            }
        });

        usernameInput.addEventListener('input', () => {
            if (rememberPasswordInput.checked) {
                fillRememberedPassword();
            }
        });

        usernameInput.addEventListener('change', fillRememberedPassword);

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
