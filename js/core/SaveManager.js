class User {
    constructor(username, password, userData = {}) {
        this.username = username;
        this.password = password;
        this.saveArray = userData.saveArray || new Array(30).fill(null);
        this.achievementArray = userData.achievementArray || [];
    }
}

class Save {
    constructor(saveData = {}) {
        this.saveDate = (saveData.saveDate ?? null);
        this.nodeId = saveData.nodeId || 101; 
        this.LoveValue = saveData.LoveValue || 0;
        this.choices = saveData.choices || {}; 
        this.name = saveData.name || ''; 
        
        this.dialogueHistory = saveData.dialogueHistory || []; 
    }
}

const AUTH_PREFS_KEY = 'summerghost.authPrefs.v1';
const MAX_USERNAME_LENGTH = 16;
const MIN_USERNAME_LENGTH = 2;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 32;

export default class SaveManager {
    constructor() {
        this.currentUser = null;
        this.authPrefs = this.loadAuthPrefs();
        this.loadCurrentUser();
    }

    loadAuthPrefs() {
        try {
            const rawPrefs = localStorage.getItem(AUTH_PREFS_KEY);
            if (!rawPrefs) {
                return {
                    rememberAccount: false,
                    rememberPassword: false,
                    lastUsername: '',
                    accounts: {},
                };
            }

            const parsedPrefs = JSON.parse(rawPrefs);
            return {
                rememberAccount: Boolean(parsedPrefs.rememberAccount),
                rememberPassword: Boolean(parsedPrefs.rememberPassword),
                lastUsername: typeof parsedPrefs.lastUsername === 'string' ? parsedPrefs.lastUsername : '',
                accounts: parsedPrefs.accounts && typeof parsedPrefs.accounts === 'object'
                    ? parsedPrefs.accounts
                    : {},
            };
        } catch (error) {
            console.warn('读取登录偏好失败，已回退默认值:', error);
            return {
                rememberAccount: false,
                rememberPassword: false,
                lastUsername: '',
                accounts: {},
            };
        }
    }

    persistAuthPrefs() {
        localStorage.setItem(AUTH_PREFS_KEY, JSON.stringify(this.authPrefs));
    }

    normalizeUsername(username) {
        return typeof username === 'string' ? username.trim() : '';
    }

    isSequentialString(password) {
        if (!password || password.length < MIN_PASSWORD_LENGTH) {
            return false;
        }

        let ascending = true;
        let descending = true;
        for (let index = 1; index < password.length; index += 1) {
            const previous = password.charCodeAt(index - 1);
            const current = password.charCodeAt(index);
            if (current - previous !== 1) {
                ascending = false;
            }
            if (previous - current !== 1) {
                descending = false;
            }
        }

        return ascending || descending;
    }

    validateUsername(username) {
        const normalizedUsername = this.normalizeUsername(username);

        if (!normalizedUsername) {
            return {
                valid: false,
                message: '用户名不能为空。',
            };
        }

        if (normalizedUsername.length < MIN_USERNAME_LENGTH || normalizedUsername.length > MAX_USERNAME_LENGTH) {
            return {
                valid: false,
                message: `用户名长度需为 ${MIN_USERNAME_LENGTH}-${MAX_USERNAME_LENGTH} 位。`,
            };
        }

        if (!/^[\u4e00-\u9fa5A-Za-z0-9_-]+$/.test(normalizedUsername)) {
            return {
                valid: false,
                message: '用户名仅支持中文、字母、数字、下划线和短横线。',
            };
        }

        return {
            valid: true,
            message: '',
            username: normalizedUsername,
        };
    }

    validatePassword(password, username = '') {
        if (!password) {
            return {
                valid: false,
                message: '密码不能为空。',
            };
        }

        if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
            return {
                valid: false,
                message: `密码长度需为 ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} 位。`,
            };
        }

        if (/\s/.test(password)) {
            return {
                valid: false,
                message: '密码不能包含空格。',
            };
        }

        const categoryCount = [
            /[A-Za-z]/.test(password),
            /\d/.test(password),
            /[^A-Za-z0-9]/.test(password),
        ].filter(Boolean).length;

        if (categoryCount < 2) {
            return {
                valid: false,
                message: '密码至少包含两种字符类型，例如字母+数字。',
            };
        }

        const lowercasePassword = password.toLowerCase();
        const commonPasswords = new Set([
            '123456',
            '123123',
            '111111',
            '000000',
            'abcdef',
            'abc123',
            'qwerty',
            'password',
            '654321',
        ]);

        if (commonPasswords.has(lowercasePassword) || /^(\d)\1+$/.test(password) || this.isSequentialString(password)) {
            return {
                valid: false,
                message: '密码过于简单，请避免连续数字、重复数字或常见弱密码。',
            };
        }

        const normalizedUsername = this.normalizeUsername(username).toLowerCase();
        if (normalizedUsername && lowercasePassword === normalizedUsername) {
            return {
                valid: false,
                message: '密码不能与用户名相同。',
            };
        }

        return {
            valid: true,
            message: '',
        };
    }

    validateRegistration(username, password) {
        const usernameResult = this.validateUsername(username);
        if (!usernameResult.valid) {
            return usernameResult;
        }

        const passwordResult = this.validatePassword(password, usernameResult.username);
        if (!passwordResult.valid) {
            return passwordResult;
        }

        return {
            valid: true,
            message: '',
            username: usernameResult.username,
        };
    }

    getAuthFormState() {
        const rememberedUsername = this.authPrefs.rememberAccount ? this.authPrefs.lastUsername : '';
        return {
            rememberAccount: Boolean(this.authPrefs.rememberAccount),
            rememberPassword: Boolean(this.authPrefs.rememberPassword),
            username: rememberedUsername,
            password: this.getRememberedPassword(rememberedUsername),
            rememberedAccounts: Object.keys(this.authPrefs.accounts || {}).sort((left, right) => left.localeCompare(right, 'zh-CN')),
        };
    }

    getRememberedPassword(username) {
        const normalizedUsername = this.normalizeUsername(username);
        if (!normalizedUsername || !this.authPrefs.rememberPassword) {
            return '';
        }

        return this.authPrefs.accounts?.[normalizedUsername]?.password || '';
    }

    saveLoginPreferences(username, password, options = {}) {
        const normalizedUsername = this.normalizeUsername(username);
        const rememberAccount = Boolean(options.rememberAccount);
        const rememberPassword = Boolean(options.rememberPassword) && rememberAccount;

        if (!rememberAccount) {
            this.authPrefs.rememberAccount = false;
            this.authPrefs.rememberPassword = false;
            this.authPrefs.lastUsername = '';
            this.persistAuthPrefs();
            return;
        }

        if (!this.authPrefs.accounts[normalizedUsername]) {
            this.authPrefs.accounts[normalizedUsername] = {};
        }

        this.authPrefs.rememberAccount = true;
        this.authPrefs.rememberPassword = rememberPassword;
        this.authPrefs.lastUsername = normalizedUsername;

        if (rememberPassword) {
            this.authPrefs.accounts[normalizedUsername].password = password;
        } else {
            delete this.authPrefs.accounts[normalizedUsername].password;
        }

        this.persistAuthPrefs();
    }

    loadCurrentUser() {
        const username = sessionStorage.getItem('loginUser');
        if (username) {
            const userData = JSON.parse(localStorage.getItem(username));
            if (userData) {
                this.currentUser = new User(username, userData.password, userData);
            }
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    login(username, password, options = {}) {
        const normalizedUsername = this.normalizeUsername(username);
        const userData = JSON.parse(localStorage.getItem(normalizedUsername));
        if (userData && userData.password === password) {
            sessionStorage.setItem('loginUser', normalizedUsername);
            this.saveLoginPreferences(normalizedUsername, password, options);
            this.loadCurrentUser();
            return true;
        }
        return false;
    }

    register(username, password) {
        const normalizedUsername = this.normalizeUsername(username);
        if (!normalizedUsername) {
            return false;
        }
        if (localStorage.getItem(normalizedUsername)) {
            return false;
        }
        const newUser = new User(normalizedUsername, password);
        localStorage.setItem(normalizedUsername, JSON.stringify(newUser));
        return true;
    }
    
    logout() {
        sessionStorage.removeItem('loginUser');
        this.currentUser = null;
    }

    createNewSave() {
        return new Save();
    }

    deleteSave(slotIndex) {
        if (!this.currentUser || slotIndex < 0 || slotIndex >= this.currentUser.saveArray.length) {
            return false;
        }

        this.currentUser.saveArray[slotIndex] = null;
        this.persistCurrentUser();
        return true;
    }

    saveGame(slotIndex, saveData, saveName) {
        if (!this.currentUser || slotIndex < 0 || slotIndex >= this.currentUser.saveArray.length) {
            return false;
        }
        const saveCopy = JSON.parse(JSON.stringify(saveData));
        
        saveCopy.saveDate = new Date().toLocaleString('zh-CN');
        saveCopy.name = saveName;
        this.currentUser.saveArray[slotIndex] = saveCopy;
        
        this.persistCurrentUser();
        return true;
    }

    loadGame(slotIndex) {
        if (!this.currentUser || !this.currentUser.saveArray[slotIndex]) {
            return null;
        }
        const saveDataCopy = JSON.parse(JSON.stringify(this.currentUser.saveArray[slotIndex]));
        return new Save(saveDataCopy);
    }
    
    persistCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem(this.currentUser.username, JSON.stringify(this.currentUser));
        }
    }

    unlockAchievement(achievementId) {
        if (!this.currentUser) return;
        
        if (!this.currentUser.achievementArray.includes(achievementId)) {
            this.currentUser.achievementArray.push(achievementId);
            this.persistCurrentUser();
            console.log(`成就已解锁: ${achievementId}`);
            const event = new CustomEvent('achievementUnlocked', {
                detail: { achievementId: achievementId }
            });
            
            window.dispatchEvent(event);
        }
    }
}
