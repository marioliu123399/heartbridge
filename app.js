// 全局状态
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

// 页面切换
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

// 开始诊断
function startDiagnosis() {
    showPage('page-role');
}

// 选择角色
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

// 选择选项
function selectOption(btn, field, value) {
    userData[field] = value;
    
    // 同一组内取消其他选中
    const parent = btn.parentElement;
    parent.querySelectorAll('.option-btn').forEach(b => {
        b.classList.remove('selected');
    });
    btn.classList.add('selected');
}

// 更新滑块值
function updateSliderValue(slider, valueId, suffix = '') {
    const value = slider.value;
    document.getElementById(valueId).textContent = value + suffix;
    
    // 更新userData
    const field = slider.id;
    userData[field] = parseInt(value);
}

// 切换情绪标签
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

// 跳转到情感评估
function goToEmotionAssessment() {
    if (!userData.marriageYears || !userData.remoteYears || !userData.meetFrequency || !userData.hasChildren) {
        alert('请完成所有问题的选择');
        return;
    }
    showPage('page-emotion');
}

// 跳转到认知评估
function goToCognition() {
    showPage('page-cognition');
}

// 跳转到对话分析
function goToDialogue() {
    if (!userData.attribution) {
        alert('请选择问题归因');
        return;
    }
    showPage('page-dialogue');
}

// 生成报告
function generateReport() {
    // 收集对话数据
    userData.situation = document.getElementById('situation').value;
    userData.partnerDialogue = document.getElementById('partnerDialogue').value;
    userData.myResponse = document.getElementById('myResponse').value;
    
    if (!userData.partnerDialogue.trim()) {
        alert('请填写对方的对话内容，以便进行分析');
        return;
    }
    
    // 计算分数
    const scores = calculateScores();
    
    // 生成报告内容
    generateReportContent(scores);
    
    // 显示报告页面
    showPage('page-report');
}

// 计算分数
function calculateScores() {
    const satisfaction = userData.satisfaction;
    const lovePerceived = userData.lovePerceived;
    const confidence = userData.confidence;
    const communication = userData.communication;
    
    // 情感连接度
    const connection = Math.round((satisfaction + lovePerceived) / 2 * 10);
    
    // 沟通质量
    const commScore = communication * 10;
    
    // 冲突处理（基于归因和沟通）
    let conflictScore = communication * 8;
    if (userData.attribution === '双方都有责任') {
        conflictScore += 20;
    } else if (userData.attribution === '主要是外部环境因素') {
        conflictScore += 10;
    }
    conflictScore = Math.min(100, conflictScore);
    
    // 亲密度
    const intimacy = Math.round((lovePerceived + confidence) / 2 * 10);
    
    // 整体健康度
    const overall = Math.round((connection + commScore + conflictScore + intimacy) / 4);
    
    return {
        overall,
        connection,
        communication: commScore,
        conflict: conflictScore,
        intimacy
    };
}

// 生成报告内容
function generateReportContent(scores) {
    // 设置日期
    document.getElementById('reportDate').textContent = new Date().toLocaleDateString('zh-CN');
    
    // 设置分数
    document.querySelector('#overallScore .score-number').textContent = scores.overall;
    
    // 设置各项分数和进度条
    setScoreBar('connection', scores.connection);
    setScoreBar('communication', scores.communication);
    setScoreBar('conflict', scores.conflict);
    setScoreBar('intimacy', scores.intimacy);
    
    // 生成问题诊断
    generateProblems(scores);
    
    // 生成依恋分析
    generateAttachmentAnalysis();
    
    // 生成对话分析
    generateDialogueAnalysis();
    
    // 生成解决方案
    generateSolutions(scores);
}

// 设置分数条
function setScoreBar(type, score) {
    document.getElementById(type + 'Score').textContent = score;
    const bar = document.getElementById(type + 'Bar');
    bar.style.width = score + '%';
    
    // 设置颜色
    bar.className = 'score-fill';
    if (score >= 70) {
        bar.classList.add('high');
    } else if (score >= 50) {
        bar.classList.add('medium');
    } else {
        bar.classList.add('low');
    }
}

// 生成问题诊断
function generateProblems(scores) {
    const problemsList = document.getElementById('problemsList');
    problemsList.innerHTML = '';
    
    const problems = [];
    
    // 付出感失衡
    const effortDiff = Math.abs(userData.selfEffort - userData.partnerEffort);
    if (effortDiff > 20 || (userData.selfEffort + userData.partnerEffort > 120)) {
        problems.push({
            title: '付出感失衡',
            desc: `你认为自己付出了${userData.selfEffort}%，对方付出了${userData.partnerEffort}%。双方都容易高估自己的付出、低估对方的付出，这是"心理账户偏差"。`,
            tags: ['社会交换理论', '认知偏差']
        });
    }
    
    // 沟通问题
    if (scores.communication < 60) {
        problems.push({
            title: '沟通质量待提升',
            desc: '你们的沟通可能存在障碍。一方可能在指责，另一方可能在回避，形成"追逃模式"。',
            tags: ['萨提亚模式', '追逃模式']
        });
    }
    
    // 归因偏差
    if (userData.attribution === '主要是对方的问题' || userData.attribution === '主要是我自己的问题') {
        problems.push({
            title: '归因偏差',
            desc: '将问题完全归因于一方，容易陷入对抗。关系问题是双方互动的结果。',
            tags: ['认知行为理论']
        });
    }
    
    // 情感连接弱
    if (scores.connection < 60) {
        problems.push({
            title: '情感连接减弱',
            desc: '异地导致日常互动减少，共同经历变少，情感账户需要持续存款。',
            tags: ['依恋理论', '情感账户']
        });
    }
    
    // 如果没有明显问题
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

// 生成依恋分析
function generateAttachmentAnalysis() {
    const container = document.getElementById('attachmentAnalysis');
    
    // 根据用户角色和回答判断依恋类型
    let myType, partnerType;
    
    if (userData.role === 'husband') {
        // 丈夫倾向于回避型（从对话分析）
        myType = { name: '回避型', desc: '重视独立，情感表达较含蓄，面对冲突倾向于理性分析或回避', icon: '🛡️' };
        partnerType = { name: '焦虑型', desc: '渴望亲密，需要反复确认被爱，容易感到被忽视', icon: '💝' };
    } else if (userData.role === 'wife') {
        myType = { name: '焦虑型', desc: '渴望亲密，需要反复确认被爱，容易感到被忽视', icon: '💝' };
        partnerType = { name: '回避型', desc: '重视独立，情感表达较含蓄，面对冲突倾向于理性分析或回避', icon: '🛡️' };
    } else {
        myType = { name: '焦虑型', desc: '渴望亲密，需要反复确认被爱', icon: '💝' };
        partnerType = { name: '回避型', desc: '重视独立，情感表达较含蓄', icon: '🛡️' };
    }
    
    // 根据沟通评分调整
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

// 生成对话分析
function generateDialogueAnalysis() {
    const container = document.getElementById('dialogueAnalysis');
    
    if (!userData.partnerDialogue.trim()) {
        container.innerHTML = '<p style="color: var(--text-light);">未提供对话内容</p>';
        return;
    }
    
    // 分析对话内容
    const dialogue = userData.partnerDialogue.toLowerCase();
    const hasAnger = dialogue.includes('妈') || dialogue.includes('烦') || dialogue.includes('怨');
    const hasComplaint = dialogue.includes('不是') || dialogue.includes('才') || dialogue.includes('都');
    const hasHurt = dialogue.includes('心寒') || dialogue.includes('受伤') || dialogue.includes('委屈');
    
    // 判断沟通姿态
    let posture = '指责型';
    if (dialogue.includes('随便') || dialogue.includes('无所谓')) {
        posture = '打岔/回避型';
    } else if (dialogue.includes('逻辑') || dialogue.includes('应该') || dialogue.includes('道理')) {
        posture = '超理智型';
    }
    
    // 判断情绪
    let emotions = [];
    if (hasAnger) emotions.push('愤怒');
    if (hasComplaint) emotions.push('委屈');
    if (hasHurt) emotions.push('伤心');
    if (emotions.length === 0) emotions = ['不满', '失望'];
    
    // 判断深层需求
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

// 生成解决方案
function generateSolutions(scores) {
    const container = document.getElementById('solutionsList');
    container.innerHTML = '';
    
    const solutions = [];
    
    // 付出感失衡方案
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
    
    // 沟通改善方案
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
    
    // 情感连接方案
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
    
    // 通用建议
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

// 显示行动计划
function showActionPlan() {
    showPage('page-action');
}

// 返回首页
function goHome() {
    // 重置数据
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
    
    // 重置UI
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
    
    showPage('page-home');
}

// 重新开始
function restart() {
    goHome();
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 可以在这里添加更多初始化逻辑
    console.log('心桥 HeartBridge 已加载');
});
