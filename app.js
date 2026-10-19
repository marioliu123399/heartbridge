// ==================== 用户认证与数据存储系统 ====================

// 当前登录用户
let currentUser = null;

// 用户数据库（使用 localStorage 模拟）
const USER_DB_KEY = 'heartbridge_users';
const CURRENT_USER_KEY = 'heartbridge_current_user';

// 获取用户数据库
function getUserDB() {
    const db = localStorage.getItem(USER_DB_KEY);
    return db ? JSON.parse(db) : {};
}

// 保存用户数据库
function saveUserDB(db) {
    localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
}

// 获取当前用户
function getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

// 设置当前用户
function setCurrentUser(user) {
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
}

// 显示提示消息
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== 页面导航 ====================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

// ==================== 认证功能 ====================

// 显示登录页
function showLogin() {
    showPage('page-login');
}

// 显示注册页
function showRegister() {
    showPage('page-register');
}

// 选择注册角色
let regRole = '';
function selectRegRole(btn, role) {
    regRole = role;
    btn.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

// 注册
function register() {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;

    if (!username) {
        showToast('请输入用户名');
        return;
    }
    if (!password || password.length < 6) {
        showToast('密码至少6位');
        return;
    }
    if (password !== passwordConfirm) {
        showToast('两次密码不一致');
        return;
    }
    if (!regRole) {
        showToast('请选择你的角色');
        return;
    }

    const db = getUserDB();
    if (db[username]) {
        showToast('用户名已存在');
        return;
    }

    // 创建用户
    const user = {
        username,
        password, // 实际应用中应该加密
        role: regRole,
        createdAt: new Date().toISOString(),
        records: []
    };

    db[username] = user;
    saveUserDB(db);

    // 自动登录
    currentUser = { username, role: regRole };
    setCurrentUser(currentUser);

    showToast('注册成功！');
    updateUIForUser();
    goHome();
}

// 登录
function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showToast('请输入用户名和密码');
        return;
    }

    const db = getUserDB();
    const user = db[username];

    if (!user || user.password !== password) {
        showToast('用户名或密码错误');
        return;
    }

    currentUser = { username: user.username, role: user.role };
    setCurrentUser(currentUser);

    showToast('登录成功！');
    updateUIForUser();
    goHome();
}

// 游客模式
function guestLogin() {
    currentUser = null;
    setCurrentUser(null);
    showToast('以游客模式进入');
    updateUIForUser();
    goHome();
}

// 退出登录
function logout() {
    currentUser = null;
    setCurrentUser(null);
    showToast('已退出登录');
    updateUIForUser();
    showLogin();
}

// 更新UI显示
function updateUIForUser() {
    const topNav = document.getElementById('topNav');
    const navUser = document.getElementById('navUser');
    const navGuest = document.getElementById('navGuest');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userQuickActions = document.getElementById('userQuickActions');
    const guestStartBtn = document.getElementById('guestStartBtn');
    const healthOverview = document.getElementById('healthOverview');

    if (currentUser) {
        topNav.style.display = 'flex';
        navUser.style.display = 'flex';
        navGuest.style.display = 'none';
        userNameDisplay.textContent = currentUser.username;
        userQuickActions.style.display = 'block';
        guestStartBtn.style.display = 'none';
        healthOverview.style.display = 'block';
        updateHealthOverview();
    } else {
        topNav.style.display = 'none';
        navUser.style.display = 'none';
        navGuest.style.display = 'flex';
        userQuickActions.style.display = 'none';
        guestStartBtn.style.display = 'block';
        healthOverview.style.display = 'none';
    }
}

// ==================== 数据存储功能 ====================

// 保存诊断记录
function saveRecord(scores, reportContent) {
    if (!currentUser) return;

    const db = getUserDB();
    const user = db[currentUser.username];
    if (!user) return;

    const record = {
        id: Date.now(),
        date: new Date().toISOString(),
        scores: scores,
        userData: { ...userData },
        reportContent: reportContent
    };

    user.records.push(record);
    saveUserDB(db);
}

// 获取用户所有记录
function getUserRecords() {
    if (!currentUser) return [];
    const db = getUserDB();
    const user = db[currentUser.username];
    return user ? user.records : [];
}

// ==================== 历史记录页面 ====================

function showHistory() {
    const records = getUserRecords();
    
    // 更新统计
    document.getElementById('totalRecords').textContent = records.length;
    
    if (records.length > 0) {
        const first = new Date(records[0].date);
        const latest = new Date(records[records.length - 1].date);
        document.getElementById('firstRecord').textContent = first.toLocaleDateString('zh-CN');
        document.getElementById('latestRecord').textContent = latest.toLocaleDateString('zh-CN');
        
        const avgScore = Math.round(records.reduce((sum, r) => sum + r.scores.overall, 0) / records.length);
        document.getElementById('avgScore').textContent = avgScore;
    } else {
        document.getElementById('firstRecord').textContent = '-';
        document.getElementById('latestRecord').textContent = '-';
        document.getElementById('avgScore').textContent = '-';
    }

    // 绘制趋势图
    drawHistoryChart(records);

    // 生成列表
    const listContainer = document.getElementById('historyList');
    listContainer.innerHTML = '';
    
    if (records.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:40px;">暂无诊断记录，开始你的第一次诊断吧！</p>';
    } else {
        // 倒序显示
        [...records].reverse().forEach(record => {
            const date = new Date(record.date);
            const item = document.createElement('div');
            item.className = 'history-item';
            item.onclick = () => showHistoryDetail(record);
            item.innerHTML = `
                <div class="history-item-info">
                    <div class="history-item-date">${date.toLocaleDateString('zh-CN')} ${date.toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'})}</div>
                    <div class="history-item-score">健康度: ${record.scores.overall}/100</div>
                </div>
                <div class="history-item-arrow">→</div>
            `;
            listContainer.appendChild(item);
        });
    }

    showPage('page-history');
}

// 绘制历史趋势图
function drawHistoryChart(records) {
    const canvas = document.getElementById('historyChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // 设置canvas尺寸
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const w = canvas.width;
    const h = canvas.height;
    const padding = 40;
    
    ctx.clearRect(0, 0, w, h);
    
    if (records.length < 2) {
        ctx.fillStyle = '#999';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(records.length === 0 ? '暂无数据' : '至少需要2次记录才能显示趋势', w/2, h/2);
        return;
    }
    
    // 绘制坐标轴
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();
    
    // 绘制数据点和线
    const scores = records.map(r => r.scores.overall);
    const maxScore = 100;
    const minScore = 0;
    const xStep = (w - 2 * padding) / (records.length - 1);
    const yScale = (h - 2 * padding) / (maxScore - minScore);
    
    // 绘制线条
    ctx.strokeStyle = '#FF6B8A';
    ctx.lineWidth = 3;
    ctx.beginPath();
    scores.forEach((score, i) => {
        const x = padding + i * xStep;
        const y = h - padding - (score - minScore) * yScale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // 绘制数据点
    scores.forEach((score, i) => {
        const x = padding + i * xStep;
        const y = h - padding - (score - minScore) * yScale;
        
        ctx.fillStyle = '#FF6B8A';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 显示分数
        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(score, x, y - 12);
    });
    
    // Y轴标签
    ctx.fillStyle = '#999';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 100; i += 25) {
        const y = h - padding - i * yScale;
        ctx.fillText(i, padding - 8, y + 4);
    }
}

// 显示历史详情
function showHistoryDetail(record) {
    const date = new Date(record.date);
    document.getElementById('historyDetailDate').textContent = 
        `${date.toLocaleDateString('zh-CN')} ${date.toLocaleTimeString('zh-CN')}`;
    
    // 重新生成报告内容
    const scores = record.scores;
    const savedUserData = record.userData;
    
    // 临时恢复数据
    const originalUserData = { ...userData };
    Object.assign(userData, savedUserData);
    
    generateReportContent(scores);
    
    // 恢复当前数据
    Object.assign(userData, originalUserData);
    
    showPage('page-history-detail');
}

// ==================== 个人中心 ====================

function showProfile() {
    if (!currentUser) return;
    
    const db = getUserDB();
    const user = db[currentUser.username];
    if (!user) return;
    
    const records = user.records;
    
    document.getElementById('profileName').textContent = user.username;
    document.getElementById('profileRole').textContent = user.role === 'husband' ? '丈夫' : (user.role === 'wife' ? '妻子' : '双方');
    document.getElementById('profileJoinDate').textContent = '加入时间：' + new Date(user.createdAt).toLocaleDateString('zh-CN');
    
    document.getElementById('profileTotalRecords').textContent = records.length;
    
    if (records.length > 0) {
        const bestScore = Math.max(...records.map(r => r.scores.overall));
        document.getElementById('profileBestScore').textContent = bestScore;
    } else {
        document.getElementById('profileBestScore').textContent = '-';
    }
    
    // 计算连续记录天数
    document.getElementById('profileCurrentStreak').textContent = calculateStreak(records);
    
    showPage('page-profile');
}

// 计算连续记录天数
function calculateStreak(records) {
    if (records.length === 0) return 0;
    
    const dates = records.map(r => new Date(r.date).toDateString());
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 1;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
        return 0; // 断掉了
    }
    
    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i-1]);
        const currDate = new Date(uniqueDates[i]);
        const diff = (prevDate - currDate) / 86400000;
        
        if (diff === 1) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// 清除所有数据
function clearAllData() {
    if (!confirm('确定要清除所有数据吗？此操作不可恢复！')) return;
    
    const db = getUserDB();
    if (currentUser && db[currentUser.username]) {
        db[currentUser.username].records = [];
        saveUserDB(db);
        showToast('数据已清除');
        showProfile();
    }
}

// ==================== 首页健康度概览 ====================

function updateHealthOverview() {
    const records = getUserRecords();
    const canvas = document.getElementById('trendCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    if (records.length === 0) {
        document.getElementById('overviewText').textContent = '还没有诊断记录，开始第一次诊断吧！';
        return;
    }
    
    // 显示最近3次或全部
    const recentRecords = records.slice(-5);
    const scores = recentRecords.map(r => r.scores.overall);
    
    // 绘制迷你趋势图
    const padding = 10;
    const xStep = (w - 2 * padding) / (scores.length - 1 || 1);
    const yScale = (h - 2 * padding) / 100;
    
    ctx.strokeStyle = '#FF6B8A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    if (scores.length === 1) {
        const y = h - padding - scores[0] * yScale;
        ctx.moveTo(padding, y);
        ctx.lineTo(w - padding, y);
    } else {
        scores.forEach((score, i) => {
            const x = padding + i * xStep;
            const y = h - padding - score * yScale;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
    }
    ctx.stroke();
    
    // 数据点
    scores.forEach((score, i) => {
        const x = padding + i * (scores.length === 1 ? (w - 2 * padding) : xStep);
        const y = h - padding - score * yScale;
        ctx.fillStyle = '#FF6B8A';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 更新文字
    const latest = scores[scores.length - 1];
    const prev = scores.length > 1 ? scores[scores.length - 2] : latest;
    const change = latest - prev;
    
    let text = `最近健康度: ${latest}/100`;
    if (change > 0) text += ` (↑${change})`;
    else if (change < 0) text += ` (↓${Math.abs(change)})`;
    else text += ` (持平)`;
    
    document.getElementById('overviewText').textContent = text;
}

// ==================== 报告对比功能 ====================

function showComparison(scores) {
    const records = getUserRecords();
    const comparisonSection = document.getElementById('comparisonSection');
    const comparisonContent = document.getElementById('comparisonContent');
    
    if (records.length === 0) {
        comparisonSection.style.display = 'none';
        return;
    }
    
    comparisonSection.style.display = 'block';
    
    const lastRecord = records[records.length - 1];
    const lastScores = lastRecord.scores;
    
    const dimensions = [
        { key: 'overall', label: '整体健康度' },
        { key: 'connection', label: '情感连接度' },
        { key: 'communication', label: '沟通质量' },
        { key: 'intimacy', label: '亲密度' }
    ];
    
    comparisonContent.innerHTML = dimensions.map(dim => {
        const current = scores[dim.key];
        const previous = lastScores[dim.key];
        const change = current - previous;
        const changeClass = change > 0 ? 'up' : (change < 0 ? 'down' : '');
        const changeSymbol = change > 0 ? '↑' : (change < 0 ? '↓' : '→');
        
        return `
            <div class="comparison-item">
                <div class="comp-label">${dim.label}</div>
                <div class="comp-value">${current}</div>
                <div class="comp-change ${changeClass}">${changeSymbol} ${Math.abs(change)}</div>
            </div>
        `;
    }).join('');
}

// ==================== 原有功能（保持不变）====================

let userData = {
    role: '',
    marriageYears: '',
    remoteYears: '',
    meetFrequency: '',
    hasChildren: '',
    satisfaction: 5,
    lovePerceived: 5,
    confidence: 5,
    communication: 5,
    attribution: '',
    selfEffort: 50,
    partnerEffort: 50,
    situation: '',
    partnerDialogue: '',
    myResponse: '',
    emotions: []
};

function startDiagnosis() {
    showPage('page-role');
}

function selectRole(role) {
    userData.role = role;
    document.querySelectorAll('.role-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    setTimeout(() => {
        showPage('page-basic');
    }, 300);
}

function selectOption(btn, field, value) {
    userData[field] = value;
    const parent = btn.parentElement;
    parent.querySelectorAll('.option-btn').forEach(b => {
        b.classList.remove('selected');
    });
    btn.classList.add('selected');
}

function updateSliderValue(slider, valueId, suffix = '') {
    const value = slider.value;
    document.getElementById(valueId).textContent = value + suffix;
    const field = slider.id;
    userData[field] = parseInt(value);
}

function toggleEmotion(tag) {
    tag.classList.toggle('selected');
    const emotion = tag.textContent;
    
    if (tag.classList.contains('selected')) {
        if (!userData.emotions.includes(emotion)) {
            userData.emotions.push(emotion);
        }
    } else {
        userData.emotions = userData.emotions.filter(e => e !== emotion);
    }
}

function goToEmotionAssessment() {
    if (!userData.marriageYears || !userData.remoteYears || !userData.meetFrequency || !userData.hasChildren) {
        showToast('请完成所有问题的选择');
        return;
    }
    showPage('page-emotion');
}

function goToCognition() {
    showPage('page-cognition');
}

function goToDialogue() {
    if (!userData.attribution) {
        showToast('请选择问题归因');
        return;
    }
    showPage('page-dialogue');
}

function generateReport() {
    userData.situation = document.getElementById('situation').value;
    userData.partnerDialogue = document.getElementById('partnerDialogue').value;
    userData.myResponse = document.getElementById('myResponse').value;
    
    if (!userData.partnerDialogue.trim()) {
        showToast('请填写对方的对话内容，以便进行分析');
        return;
    }
    
    const scores = calculateScores();
    generateReportContent(scores);
    
    // 显示对比（如果有历史记录）
    showComparison(scores);
    
    // 保存记录（如果已登录）
    saveRecord(scores, null);
    
    showPage('page-report');
}

function calculateScores() {
    const satisfaction = userData.satisfaction;
    const lovePerceived = userData.lovePerceived;
    const confidence = userData.confidence;
    const communication = userData.communication;
    
    const connection = Math.round((satisfaction + lovePerceived) / 2 * 10);
    const commScore = communication * 10;
    
    let conflictScore = communication * 8;
    if (userData.attribution === '双方都有责任') {
        conflictScore += 20;
    } else if (userData.attribution === '主要是外部环境因素') {
        conflictScore += 10;
    }
    conflictScore = Math.min(100, conflictScore);
    
    const intimacy = Math.round((lovePerceived + confidence) / 2 * 10);
    const overall = Math.round((connection + commScore + conflictScore + intimacy) / 4);
    
    return {
        overall,
        connection,
        communication: commScore,
        conflict: conflictScore,
        intimacy
    };
}

function generateReportContent(scores) {
    document.getElementById('reportDate').textContent = new Date().toLocaleDateString('zh-CN');
    document.querySelector('#overallScore .score-number').textContent = scores.overall;
    
    setScoreBar('connection', scores.connection);
    setScoreBar('communication', scores.communication);
    setScoreBar('conflict', scores.conflict);
    setScoreBar('intimacy', scores.intimacy);
    
    generateProblems(scores);
    generateAttachmentAnalysis();
    generateDialogueAnalysis();
    generateSolutions(scores);
}

function setScoreBar(type, score) {
    document.getElementById(type + 'Score').textContent = score;
    const bar = document.getElementById(type + 'Bar');
    bar.style.width = score + '%';
    bar.className = 'score-fill';
    if (score >= 70) {
        bar.classList.add('high');
    } else if (score >= 50) {
        bar.classList.add('medium');
    } else {
        bar.classList.add('low');
    }
}

function generateProblems(scores) {
    const problemsList = document.getElementById('problemsList');
    problemsList.innerHTML = '';
    
    const problems = [];
    
    const effortDiff = Math.abs(userData.selfEffort - userData.partnerEffort);
    if (effortDiff > 20 || (userData.selfEffort + userData.partnerEffort > 120)) {
        problems.push({
            title: '付出感失衡',
            desc: `你认为自己付出了${userData.selfEffort}%，对方付出了${userData.partnerEffort}%。双方都容易高估自己的付出、低估对方的付出，这是"心理账户偏差"。`,
            tags: ['社会交换理论', '认知偏差']
        });
    }
    
    if (scores.communication < 60) {
        problems.push({
            title: '沟通质量待提升',
            desc: '你们的沟通可能存在障碍。一方可能在指责，另一方可能在回避，形成"追逃模式"。',
            tags: ['萨提亚模式', '追逃模式']
        });
    }
    
    if (userData.attribution === '主要是对方的问题' || userData.attribution === '主要是我自己的问题') {
        problems.push({
            title: '归因偏差',
            desc: '将问题完全归因于一方，容易陷入对抗。关系问题是双方互动的结果。',
            tags: ['认知行为理论']
        });
    }
    
    if (scores.connection < 60) {
        problems.push({
            title: '情感连接减弱',
            desc: '异地导致日常互动减少，共同经历变少，情感账户需要持续存款。',
            tags: ['依恋理论', '情感账户']
        });
    }
    
    if (problems.length === 0) {
        problems.push({
            title: '关系整体健康',
            desc: '你们的关系基础不错！继续保持良好的沟通和互动，定期检视关系状态。',
            tags: ['积极维护']
        });
    }
    
    problems.forEach(problem => {
        const card = document.createElement('div');
        card.className = 'problem-card';
        card.innerHTML = `
            <h4>${problem.title}</h4>
            <p>${problem.desc}</p>
            <div>${problem.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
        `;
        problemsList.appendChild(card);
    });
}

function generateAttachmentAnalysis() {
    const container = document.getElementById('attachmentAnalysis');
    
    let myType, partnerType;
    
    if (userData.role === 'husband') {
        myType = { name: '回避型', desc: '重视独立，情感表达较含蓄，面对冲突倾向于理性分析或回避', icon: '🛡️' };
        partnerType = { name: '焦虑型', desc: '渴望亲密，需要反复确认被爱，容易感到被忽视', icon: '💝' };
    } else if (userData.role === 'wife') {
        myType = { name: '焦虑型', desc: '渴望亲密，需要反复确认被爱，容易感到被忽视', icon: '💝' };
        partnerType = { name: '回避型', desc: '重视独立，情感表达较含蓄，面对冲突倾向于理性分析或回避', icon: '🛡️' };
    } else {
        myType = { name: '焦虑型', desc: '渴望亲密，需要反复确认被爱', icon: '💝' };
        partnerType = { name: '回避型', desc: '重视独立，情感表达较含蓄', icon: '🛡️' };
    }
    
    if (userData.communication >= 7) {
        myType = { name: '安全型', desc: '信任他人，能平衡亲密与独立，沟通较顺畅', icon: '✅' };
    }
    
    container.innerHTML = `
        <div class="attachment-types">
            <div class="attachment-type">
                <div class="type-icon">${myType.icon}</div>
                <h4>你的依恋类型</h4>
                <div class="type-label">${myType.name}</div>
                <p>${myType.desc}</p>
            </div>
            <div class="attachment-type">
                <div class="type-icon">${partnerType.icon}</div>
                <h4>对方的依恋类型</h4>
                <div class="type-label">${partnerType.name}</div>
                <p>${partnerType.desc}</p>
            </div>
        </div>
        <div class="attachment-risk warning">
            <h4>⚠️ 组合风险：追逃模式</h4>
            <p>焦虑型（追）越渴望连接，回避型（逃）越想保持距离，形成恶性循环。破解关键是：焦虑方学会自我安抚，回避方学会表达情感。</p>
        </div>
    `;
}

function generateDialogueAnalysis() {
    const container = document.getElementById('dialogueAnalysis');
    
    if (!userData.partnerDialogue.trim()) {
        container.innerHTML = '<p style="color: var(--text-light);">未提供对话内容</p>';
        return;
    }
    
    const dialogue = userData.partnerDialogue.toLowerCase();
    const hasAnger = dialogue.includes('妈') || dialogue.includes('烦') || dialogue.includes('怨');
    const hasComplaint = dialogue.includes('不是') || dialogue.includes('才') || dialogue.includes('都');
    const hasHurt = dialogue.includes('心寒') || dialogue.includes('受伤') || dialogue.includes('委屈');
    
    let posture = '指责型';
    if (dialogue.includes('随便') || dialogue.includes('无所谓')) {
        posture = '打岔/回避型';
    } else if (dialogue.includes('逻辑') || dialogue.includes('应该') || dialogue.includes('道理')) {
        posture = '超理智型';
    }
    
    let emotions = [];
    if (hasAnger) emotions.push('愤怒');
    if (hasComplaint) emotions.push('委屈');
    if (hasHurt) emotions.push('伤心');
    if (emotions.length === 0) emotions = ['不满', '失望'];
    
    let need = '被认可、被看见';
    if (dialogue.includes('关心') || dialogue.includes('爱')) {
        need = '被关心、被爱';
    } else if (dialogue.includes('理解')) {
        need = '被理解';
    }
    
    container.innerHTML = `
        <div class="dialogue-translation">
            <h4>📝 对话"翻译"</h4>
            <div class="translation-item">
                <div class="label">表面说的：</div>
                <div class="content">"${userData.partnerDialogue.substring(0, 80)}..."</div>
            </div>
            <div class="translation-item">
                <div class="label">实际想表达的：</div>
                <div class="content">"我需要${need}，我的付出希望被看见。"</div>
            </div>
            <div class="translation-item">
                <div class="label">情绪状态：</div>
                <div class="content">${emotions.join('、')}</div>
            </div>
            <div class="translation-item">
                <div class="label">沟通姿态：</div>
                <div class="content">${posture} - 通过${posture === '指责型' ? '攻击' : '回避'}来保护自己受伤的感受</div>
            </div>
            <div class="translation-item">
                <div class="label">深层需求：</div>
                <div class="content">${need}、被珍惜、安全感</div>
            </div>
        </div>
        <div class="tips-box">
            <h4>💡 给你的建议</h4>
            <ul>
                <li>不要急着反驳或解释，先看见TA的情绪</li>
                <li>试着说："我听到你说...，我想确认一下你是不是感到..."</li>
                <li>分享你的感受，而不是对TA的评判</li>
                <li>记住：TA的指责背后，是渴望被爱的呼唤</li>
            </ul>
        </div>
    `;
}

function generateSolutions(scores) {
    const container = document.getElementById('solutionsList');
    container.innerHTML = '';
    
    const solutions = [];
    
    if (Math.abs(userData.selfEffort - userData.partnerEffort) > 20) {
        solutions.push({
            title: '🎯 破解付出感失衡',
            items: [
                '每天记录对方1个具体的付出行为，培养感恩心态',
                '每周进行一次"感谢分享"，互相表达感激',
                '停止"谁付出更多"的比较，关注"我们如何一起变得更好"',
                '理解"隐性付出"：经济支持、情绪价值也是付出'
            ]
        });
    }
    
    if (scores.communication < 70) {
        solutions.push({
            title: '💬 改善沟通模式',
            items: [
                '练习"我"语句：将"你总是..."改为"当...发生时，我感到..."',
                '学会积极倾听：复述对方的话，确认理解正确',
                '使用"暂停技术"：情绪激动时说"我需要冷静一下，30分钟后再谈"',
                '每天15分钟深度对话：不谈孩子、工作，只谈彼此的感受'
            ]
        });
    }
    
    if (scores.connection < 70 || scores.intimacy < 70) {
        solutions.push({
            title: '❤️ 重建情感连接',
            items: [
                '创造共同经历：一起看电影、玩游戏、视频做饭',
                '增加确定性：明确的见面计划、未来规划',
                '表达爱的五种语言：肯定的言辞、服务的行动、接受礼物、高质量时间、身体接触',
                '每天分享1件小事和对应的感受，保持情感交流'
            ]
        });
    }
    
    solutions.push({
        title: '🌱 日常维护建议',
        items: [
            '每周进行一次"关系检视"：这周有什么开心的事？有什么需要改进的？',
            '学会识别"末日四骑士"：批评、蔑视、防御、冷战，及时止损',
            '建立"情感账户"：积极互动与消极互动的比例保持在5:1以上',
            '给自己和对方耐心：改变需要时间，每一次尝试都是进步'
        ]
    });
    
    solutions.forEach(solution => {
        const card = document.createElement('div');
        card.className = 'solution-card';
        card.innerHTML = `
            <h4>${solution.title}</h4>
            <ol>
                ${solution.items.map(item => `<li>${item}</li>`).join('')}
            </ol>
        `;
        container.appendChild(card);
    });
}

function showActionPlan() {
    showPage('page-action');
}

function goHome() {
    userData = {
        role: '',
        marriageYears: '',
        remoteYears: '',
        meetFrequency: '',
        hasChildren: '',
        satisfaction: 5,
        lovePerceived: 5,
        confidence: 5,
        communication: 5,
        attribution: '',
        selfEffort: 50,
        partnerEffort: 50,
        situation: '',
        partnerDialogue: '',
        myResponse: '',
        emotions: []
    };
    
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.emotion-tag').forEach(tag => tag.classList.remove('selected'));
    document.querySelectorAll('.role-card').forEach(card => card.classList.remove('selected'));
    document.querySelectorAll('textarea').forEach(ta => ta.value = '');
    document.querySelectorAll('.slider').forEach(slider => {
        slider.value = 5;
        const valueId = slider.id + 'Value';
        const el = document.getElementById(valueId);
        if (el) el.textContent = '5';
    });
    
    // 更新首页健康度概览
    updateHealthOverview();
    
    showPage('page-home');
}

function restart() {
    goHome();
}

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', function() {
    // 检查是否有已登录用户
    currentUser = getCurrentUser();
    updateUIForUser();
    
    console.log('心桥 HeartBridge 已加载');
});
