// 系统配置
const SYSTEM_CONFIG = {
    // 行为配置
    behaviors: {
        good: [
            { id: 'eat_clean', name: '吃饭吃干净', tokens: 3, icon: 'fas fa-utensils', color: '#2ecc71' },
            { id: 'tidy_toys', name: '自己收拾玩具', tokens: 2, icon: 'fas fa-box-open', color: '#3498db' },
            { id: 'sleep_on_time', name: '按时睡觉', tokens: 3, icon: 'fas fa-bed', color: '#9b59b6' },
            { id: 'help_family', name: '帮助家人', tokens: 4, icon: 'fas fa-hands-helping', color: '#e74c3c' },
            { id: 'study_hard', name: '认真学习', tokens: 5, icon: 'fas fa-book', color: '#f39c12' },
            { id: 'be_polite', name: '有礼貌', tokens: 2, icon: 'fas fa-smile', color: '#1abc9c' },
            { id: 'wash_hands', name: '饭前洗手', tokens: 2, icon: 'fas fa-hands-wash', color: '#16a085' },
            { id: 'share_toys', name: '分享玩具', tokens: 3, icon: 'fas fa-share-alt', color: '#e67e22' }
        ],
        bad: [
            { id: 'throw_things', name: '乱扔东西', tokens: -2, icon: 'fas fa-ban', color: '#e74c3c' },
            { id: 'late_sleep', name: '不按时睡觉', tokens: -3, icon: 'fas fa-moon', color: '#8e44ad' },
            { id: 'tantrum', name: '发脾气', tokens: -2, icon: 'fas fa-angry', color: '#d35400' },
            { id: 'impolite', name: '不礼貌', tokens: -1, icon: 'fas fa-frown', color: '#7f8c8d' },
            { id: 'not_listen', name: '不听话', tokens: -2, icon: 'fas fa-volume-mute', color: '#95a5a6' },
            { id: 'waste_food', name: '浪费食物', tokens: -2, icon: 'fas fa-apple-alt', color: '#c0392b' },
            { id: 'fight_sibling', name: '和兄弟姐妹打架', tokens: -3, icon: 'fas fa-user-times', color: '#2c3e50' }
        ]
    },
    
    // 兑换配置
    exchanges: [
        { 
            id: 'watch_tv', 
            name: '看电视', 
            description: '兑换15分钟看电视时间', 
            tokens: 10, 
            duration: 15, 
            icon: 'fas fa-tv',
            color: '#3498db'
        },
        { 
            id: 'play_game', 
            name: '玩游戏', 
            description: '兑换15分钟玩游戏时间', 
            tokens: 15, 
            duration: 15, 
            icon: 'fas fa-gamepad',
            color: '#e74c3c'
        },
        { 
            id: 'extra_story', 
            name: '多听一个故事', 
            description: '让爸爸妈妈多讲一个睡前故事', 
            tokens: 8, 
            duration: 10, 
            icon: 'fas fa-book-reader',
            color: '#9b59b6'
        },
        { 
            id: 'special_snack', 
            name: '特别零食', 
            description: '兑换一份特别的小零食', 
            tokens: 20, 
            duration: 0, 
            icon: 'fas fa-cookie-bite',
            color: '#f39c12'
        }
    ],
    
    // 系统限制
    limits: {
        maxDailyTokens: 10,      // 每天最多获得代币数
        maxWeeklyUsage: 120,     // 每周最多兑换分钟数（2小时）
        minTokensForExchange: 5  // 兑换所需最低代币数
    },
    
    // 奖励规则
    rewards: {
        streakBonus: 5,          // 连续3天好行为额外奖励
        streakDays: 3
    }
};

// 应用状态
let appState = {
    tokens: 0,
    todayTokens: 0,
    weekUsage: 0,
    history: [],
    lastReset: new Date().toDateString(),
    streakDays: 0,
    lastGoodDay: new Date().toDateString()
};

// DOM元素
let tokenAmountElement, todayRewardsElement, weekUsageElement;
let goodBehaviorsElement, badBehaviorsElement, exchangeOptionsElement, historyListElement;

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    tokenAmountElement = document.getElementById('tokenAmount');
    todayRewardsElement = document.getElementById('todayRewards');
    weekUsageElement = document.getElementById('weekUsage');
    goodBehaviorsElement = document.getElementById('goodBehaviors');
    badBehaviorsElement = document.getElementById('badBehaviors');
    exchangeOptionsElement = document.getElementById('exchangeOptions');
    historyListElement = document.getElementById('historyList');

    // 添加移动端适配
    addMobileAdaptations();
    
    // 加载保存的数据
    loadState();
    
    // 初始化UI
    initBehaviors();
    initExchanges();
    updateUI();
    
    // 检查是否需要重置每日数据
    checkDailyReset();
    
    // 添加音效（可选）
    initSounds();
    
    // 添加Cordova设备就绪事件（如果可用）
    if (typeof device !== 'undefined') {
        document.addEventListener('deviceready', onDeviceReady, false);
    }
});

// 加载保存的状态
function loadState() {
    const saved = localStorage.getItem('kidRewardSystem');
    if (saved) {
        const parsed = JSON.parse(saved);
        appState = { ...appState, ...parsed };
        
        // 确保历史记录存在
        if (!appState.history) {
            appState.history = [];
        }
    }
}

// 保存状态
function saveState() {
    localStorage.setItem('kidRewardSystem', JSON.stringify(appState));
}

// 检查每日重置
function checkDailyReset() {
    const today = new Date().toDateString();
    if (appState.lastReset !== today) {
        resetDailyData();
    }
}

// 重置每日数据
function resetDailyData() {
    const today = new Date().toDateString();
    appState.todayTokens = 0;
    appState.lastReset = today;
    saveState();
    updateUI();
}

// 初始化行为按钮
function initBehaviors() {
    // 清空现有内容
    goodBehaviorsElement.innerHTML = '';
    badBehaviorsElement.innerHTML = '';
    
    // 创建好行为按钮
    SYSTEM_CONFIG.behaviors.good.forEach(behavior => {
        const button = createBehaviorButton(behavior, 'good');
        goodBehaviorsElement.appendChild(button);
    });
    
    // 创建坏行为按钮
    SYSTEM_CONFIG.behaviors.bad.forEach(behavior => {
        const button = createBehaviorButton(behavior, 'bad');
        badBehaviorsElement.appendChild(button);
    });
}

// 创建行为按钮
function createBehaviorButton(behavior, type) {
    const button = document.createElement('button');
    button.className = `behavior-btn ${type}`;
    button.innerHTML = `
        <i class="${behavior.icon}" style="color: ${behavior.color}"></i>
        <span>${behavior.name}</span>
        <div class="behavior-tokens">
            ${behavior.tokens > 0 ? '+' : ''}${behavior.tokens} 星星币
        </div>
    `;
    
    button.addEventListener('click', () => {
        handleBehavior(behavior, type);
    });
    
    return button;
}

// 处理行为
function handleBehavior(behavior, type) {
    // 检查每日上限
    if (type === 'good' && appState.todayTokens >= SYSTEM_CONFIG.limits.maxDailyTokens) {
        showMessage('今天已经获得太多星星币了，明天再继续努力吧！', 'info');
        return;
    }
    
    // 更新代币
    const oldTokens = appState.tokens;
    appState.tokens += behavior.tokens;
    
    // 如果是好行为，更新今日代币
    if (type === 'good') {
        appState.todayTokens += behavior.tokens;
        
        // 检查连续好行为
        checkStreakBonus();
    }
    
    // 确保代币不为负数
    if (appState.tokens < 0) {
        appState.tokens = 0;
    }
    
    // 添加历史记录
    const historyItem = {
        type: type,
        behavior: behavior.name,
        tokens: behavior.tokens,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toDateString()
    };
    
    appState.history.unshift(historyItem);
    
    // 限制历史记录数量
    if (appState.history.length > 20) {
        appState.history = appState.history.slice(0, 20);
    }
    
    // 保存状态并更新UI
    saveState();
    updateUI();
    
    // 显示反馈
    const message = behavior.tokens > 0 
        ? `太棒了！${behavior.name}，获得 ${behavior.tokens} 个星星币！✨`
        : `注意哦！${behavior.name}，扣除 ${-behavior.tokens} 个星星币。下次要加油！`;
    
    showMessage(message, type);
    playSound(type === 'good' ? 'good' : 'bad');
    
    // 显示代币变化动画
    showTokenChange(behavior.tokens, oldTokens);
}

// 检查连续好行为奖励
function checkStreakBonus() {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    if (appState.lastGoodDay === yesterdayStr) {
        appState.streakDays++;
        
        if (appState.streakDays >= SYSTEM_CONFIG.rewards.streakDays) {
            appState.tokens += SYSTEM_CONFIG.rewards.streakBonus;
            appState.todayTokens += SYSTEM_CONFIG.rewards.streakBonus;
            appState.streakDays = 0;
            
            showMessage(`连续好行为奖励！额外获得 ${SYSTEM_CONFIG.rewards.streakBonus} 个星星币！🎉`, 'success');
        }
    } else if (appState.lastGoodDay !== today) {
        appState.streakDays = 1;
    }
    
    appState.lastGoodDay = today;
}

// 初始化兑换选项
function initExchanges() {
    exchangeOptionsElement.innerHTML = '';
    
    SYSTEM_CONFIG.exchanges.forEach(exchange => {
        const item = createExchangeItem(exchange);
        exchangeOptionsElement.appendChild(item);
    });
}

// 创建兑换项目
function createExchangeItem(exchange) {
    const item = document.createElement('div');
    item.className = 'exchange-item';
    item.innerHTML = `
        <i class="${exchange.icon}" style="color: ${exchange.color}"></i>
        <h3>${exchange.name}</h3>
        <p class="exchange-details">${exchange.description}</p>
        <div class="exchange-cost">${exchange.tokens} 星星币</div>
        <button class="btn-primary" data-exchange-id="${exchange.id}">
            <i class="fas fa-exchange-alt"></i> 立即兑换
        </button>
    `;
    
    const button = item.querySelector('button');
    button.addEventListener('click', () => {
        handleExchange(exchange);
    });
    
    return item;
}

// 处理兑换
function handleExchange(exchange) {
    // 检查代币是否足够
    if (appState.tokens < exchange.tokens) {
        showMessage(`星星币不够哦！还需要 ${exchange.tokens - appState.tokens} 个星星币。`, 'warning');
        return;
    }
    
    // 检查每周使用限制
    if (appState.weekUsage + exchange.duration > SYSTEM_CONFIG.limits.maxWeeklyUsage) {
        showMessage(`本周兑换时间已用完，下周再兑换吧！`, 'warning');
        return;
    }
    
    // 显示确认对话框
    document.getElementById('confirmTitle').textContent = `确认兑换 ${exchange.name}`;
    document.getElementById('confirmMessage').textContent = 
        `确定要花费 ${exchange.tokens} 个星星币兑换${exchange.description}吗？`;
    
    const confirmModal = document.getElementById('confirmModal');
    confirmModal.style.display = 'flex';
    confirmModal.dataset.exchangeId = exchange.id;
}

// 确认兑换
function confirmExchange() {
    const exchangeId = document.getElementById('confirmModal').dataset.exchangeId;
    const exchange = SYSTEM_CONFIG.exchanges.find(e => e.id === exchangeId);
    
    if (!exchange) return;
    
    // 扣除代币
    appState.tokens -= exchange.tokens;
    appState.weekUsage += exchange.duration;
    
    // 添加历史记录
    const historyItem = {
        type: 'exchange',
        behavior: `兑换 ${exchange.name}`,
        tokens: -exchange.tokens,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toDateString()
    };
    
    appState.history.unshift(historyItem);
    
    // 限制历史记录数量
    if (appState.history.length > 20) {
        appState.history = appState.history.slice(0, 20);
    }
    
    // 保存状态并更新UI
    saveState();
    updateUI();
    
    // 关闭确认对话框
    cancelExchange();
    
    // 显示成功消息
    showMessage(`兑换成功！${exchange.description} ✅`, 'success');
    playSound('exchange');
    
    // 显示兑换成功动画
    showExchangeSuccess(exchange);
}

// 取消兑换
function cancelExchange() {
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'none';
    delete modal.dataset.exchangeId;
}

// 更新UI
function updateUI() {
    // 更新代币显示
    tokenAmountElement.textContent = appState.tokens;
    todayRewardsElement.textContent = appState.todayTokens;
    weekUsageElement.textContent = appState.weekUsage;
    
    // 更新历史记录
    updateHistory();
    
    // 更新兑换按钮状态
    updateExchangeButtons();
    
    // 更新代币显示动画
    updateTokenAnimation();
}

// 更新历史记录
function updateHistory() {
    historyListElement.innerHTML = '';
    
    if (appState.history.length === 0) {
        historyListElement.innerHTML = '<div class="history-item"><div class="history-content"><p>今天还没有记录，开始行动吧！</p></div></div>';
        return;
    }
    
    // 只显示今天的历史记录
    const today = new Date().toDateString();
    const todayHistory = appState.history.filter(item => item.date === today);
    
    if (todayHistory.length === 0) {
        historyListElement.innerHTML = '<div class="history-item"><div class="history-content"><p>今天还没有记录，开始行动吧！</p></div></div>';
        return;
    }
    
    todayHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${item.type}`;
        
        const tokenSymbol = item.tokens > 0 ? '+' : '';
        const tokenClass = item.tokens > 0 ? 'good' : item.tokens < 0 ? 'bad' : '';
        
        historyItem.innerHTML = `
            <div class="history-content">
                <p>${item.behavior}</p>
                <div class="history-time">${item.timestamp}</div>
            </div>
            <div class="history-tokens ${tokenClass}">
                ${tokenSymbol}${item.tokens} 星星币
            </div>
        `;
        
        historyListElement.appendChild(historyItem);
    });
}

// 更新兑换按钮状态
function updateExchangeButtons() {
    const buttons = document.querySelectorAll('.exchange-item button');
    
    buttons.forEach(button => {
        const exchangeId = button.dataset.exchangeId;
        const exchange = SYSTEM_CONFIG.exchanges.find(e => e.id === exchangeId);
        
        if (exchange) {
            const canAfford = appState.tokens >= exchange.tokens;
            const withinWeeklyLimit = appState.weekUsage + exchange.duration <= SYSTEM_CONFIG.limits.maxWeeklyUsage;
            
            button.disabled = !canAfford || !withinWeeklyLimit;
            button.style.opacity = button.disabled ? '0.6' : '1';
            button.style.cursor = button.disabled ? 'not-allowed' : 'pointer';
            
            if (button.disabled) {
                if (!canAfford) {
                    button.title = `需要 ${exchange.tokens} 星星币，目前只有 ${appState.tokens} 个`;
                } else {
                    button.title = '本周兑换时间已用完';
                }
            } else {
                button.title = '';
            }
        }
    });
}

// 更新代币动画
function updateTokenAnimation() {
    const tokenIcon = document.querySelector('.token-icon');
    if (appState.tokens > 0) {
        tokenIcon.style.animation = 'spin 20s linear infinite, bounce 2s infinite';
    } else {
        tokenIcon.style.animation = 'bounce 2s infinite';
    }
}

// 显示代币变化动画
function showTokenChange(change, oldTokens) {
    const changeElement = document.createElement('div');
    changeElement.className = 'token-change';
    changeElement.textContent = change > 0 ? `+${change}` : change;
    changeElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4rem;
        font-weight: bold;
        color: ${change > 0 ? '#2ecc71' : '#e74c3c'};
        z-index: 1000;
        text-shadow: 0 0 10px rgba(0,0,0,0.3);
        animation: floatUp 2s ease-out forwards;
        pointer-events: none;
    `;
    
    document.body.appendChild(changeElement);
    
    // 创建CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -150%) scale(1.5);
            }
        }
    `;
    document.head.appendChild(style);
    
    // 移除元素
    setTimeout(() => {
        changeElement.remove();
        style.remove();
    }, 2000);
}

// 显示兑换成功动画
function showExchangeSuccess(exchange) {
    const successElement = document.createElement('div');
    successElement.className = 'exchange-success';
    successElement.innerHTML = `
        <i class="${exchange.icon}" style="font-size: 5rem; color: ${exchange.color}"></i>
        <div style="font-size: 2rem; margin-top: 20px; font-weight: bold;">兑换成功！</div>
    `;
    successElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 0 50px rgba(0,0,0,0.3);
        z-index: 1000;
        text-align: center;
        animation: popIn 0.5s ease-out, fadeOut 1s ease-out 2s forwards;
    `;
    
    document.body.appendChild(successElement);
    
    // 创建CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
        }
    `;
    document.head.appendChild(style);
    
    // 移除元素
    setTimeout(() => {
        successElement.remove();
        style.remove();
    }, 3000);
}

// 显示消息
function showMessage(message, type) {
    // 检查是否已有消息
    const existing = document.querySelector('.message-alert');
    if (existing) {
        existing.remove();
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message-alert ${type}`;
    messageElement.textContent = message;
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'good' || type === 'success' ? '#2ecc71' : 
                      type === 'bad' ? '#e74c3c' : 
                      type === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 1000;
        font-size: 1.2rem;
        animation: slideInRight 0.5s ease-out, slideOutRight 0.5s ease-out 3s forwards;
        max-width: 400px;
    `;
    
    document.body.appendChild(messageElement);
    
    // 创建CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 移除元素
    setTimeout(() => {
        messageElement.remove();
        style.remove();
    }, 3500);
}

// 初始化音效（简单版本）
function initSounds() {
    // 这里可以添加音效，但为了简单起见，我们使用控制台日志代替
    console.log('音效系统已初始化');
}

// 播放音效
function playSound(type) {
    // 在实际应用中，这里会播放真正的音效
    // 现在只用控制台日志模拟
    const sounds = {
        good: '✨ 好行为音效',
        bad: '⚠️ 需要改进音效',
        exchange: '🎉 兑换成功音效'
    };
    
    console.log(sounds[type] || '🎵 默认音效');
}

// 重置今日数据
function resetDay() {
    if (confirm('确定要重置今日数据吗？这不会影响星星币总数。')) {
        resetDailyData();
        showMessage('今日数据已重置！', 'info');
    }
}

// 重置所有数据
function resetAllData() {
    if (confirm('确定要重置所有数据吗？这将清除所有星星币和记录！')) {
        appState = {
            tokens: 0,
            todayTokens: 0,
            weekUsage: 0,
            history: [],
            lastReset: new Date().toDateString(),
            streakDays: 0,
            lastGoodDay: new Date().toDateString()
        };
        
        saveState();
        updateUI();
        showMessage('所有数据已重置！', 'info');
    }
}

// 显示帮助
function showHelp() {
    document.getElementById('helpModal').style.display = 'flex';
}

// 关闭帮助
function closeHelp() {
    document.getElementById('helpModal').style.display = 'none';
}

// 移动端适配功能
function addMobileAdaptations() {
    // 检测是否是移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log('移动设备检测到，应用移动端优化');
        
        // 添加移动端CSS类
        document.body.classList.add('mobile-device');
        
        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // 防止长按菜单
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
        
        // 添加触摸反馈
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
                this.style.opacity = '0.9';
            });
            
            button.addEventListener('touchend', function() {
                this.style.transform = '';
                this.style.opacity = '';
            });
        });
        
        // 监听返回按钮（Cordova环境）
        if (typeof cordova !== 'undefined') {
            document.addEventListener('backbutton', handleBackButton, false);
        }
    }
}

// 处理返回按钮
function handleBackButton(e) {
    e.preventDefault();
    
    // 检查是否有打开的模态框
    const helpModal = document.getElementById('helpModal');
    const confirmModal = document.getElementById('confirmModal');
    
    if (helpModal.style.display === 'flex') {
        closeHelp();
        return;
    }
    
    if (confirmModal.style.display === 'flex') {
        cancelExchange();
        return;
    }
    
    // 默认行为：退出应用确认
    if (confirm('确定要退出小星星奖励系统吗？')) {
        if (typeof navigator !== 'undefined' && navigator.app) {
            navigator.app.exitApp();
        }
    }
}

// Cordova设备就绪事件
function onDeviceReady() {
    console.log('Cordova设备就绪');
    
    // 设置状态栏（如果插件可用）
    if (typeof StatusBar !== 'undefined') {
        StatusBar.overlaysWebView(false);
        StatusBar.backgroundColorByHexString('#4a90e2');
        StatusBar.styleDefault();
    }
    
    // 初始化其他Cordova插件
    if (typeof device !== 'undefined') {
        console.log('设备信息:', device.platform, device.version);
    }
}

// 添加重置所有数据的按钮事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 在页面加载后添加一个隐藏的重置所有数据按钮（用于调试）
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = 'position: fixed; bottom: 10px; left: 10px; z-index: 9999; opacity: 0.3;';
    debugDiv.innerHTML = '<button onclick="resetAllData()" style="padding: 5px 10px; font-size: 12px;">重置所有数据</button>';
    document.body.appendChild(debugDiv);
});

// 添加键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl+H 显示帮助
    if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        showHelp();
    }
    
    // Ctrl+R 重置今日数据
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        resetDay();
    }
    
    // Ctrl+Shift+R 重置所有数据（仅用于调试）
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        if (confirm('调试功能：确定要重置所有数据吗？')) {
            resetAllData();
        }
    }
});