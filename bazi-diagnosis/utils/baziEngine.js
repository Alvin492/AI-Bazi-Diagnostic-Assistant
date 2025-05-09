// 引入 lunar-calendar 和日志
const lunar = require('lunar-calendar');
const logger = require('../config/logger');

// 五行能量计算矩阵（简化版，实际项目需扩展）
const WUXING_MATRIX = {
    '甲': { element: '木', power: 1.2 },
    '乙': { element: '木', power: 0.8 },
    '丙': { element: '火', power: 1.1 },
    '丁': { element: '火', power: 0.9 },
    // 其他天干地支配置...
};

// 农历转换（带误差补偿）
function convertSolarToLunar(date) {
    try {
        const lunarDate = lunar.solarToLunar(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        );
        // 误差补偿（简化版，实际需调用历史黄历 API）
        if (lunarDate.lunarDay > 30) {
            logger.warn(`农历转换可能存在误差，日期: ${date}`);
            // 假设调用历史黄历 API 校准
            lunarDate.lunarDay = 30; // 临时修正
        }
        return lunarDate;
    } catch (error) {
        logger.error(`农历转换失败，日期: ${date}, 错误: ${error.message}`);
        throw error;
    }
}

// 计算八字（简化版，实际需完整天干地支算法）
function calculateBazi(birthDate) {
    const lunarDate = convertSolarToLunar(birthDate);
    // 假设八字为固定值（实际需根据年月日时计算）
    const bazi = ['甲', '子', '丙', '寅', '戊', '辰', '庚', '申'];
    return bazi;
}

// 计算五行能量
function calculateElementBalance(bazi) {
    let elements = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
    bazi.forEach(char => {
        const data = WUXING_MATRIX[char] || { element: '木', power: 0 };
        elements[data.element] += data.power;
    });
    return elements;
}

// 计算五行生克冲突
function calculateElementConflict(userElements) {
    const conflicts = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
    // 简化版生克逻辑
    conflicts.金 = userElements.木 * 0.5; // 木克金
    conflicts.木 = userElements.土 * 0.5; // 土克木
    conflicts.水 = userElements.火 * 0.5; // 火克水
    conflicts.火 = userElements.金 * 0.5; // 金克火
    conflicts.土 = userElements.水 * 0.5; // 水克土
    return conflicts;
}

// AI 解读（简化版，实际需集成 AI 模型）
function generateAIComment(elements, conflicts) {
    const strengths = [];
    const advices = [];
    // 简单规则生成解读
    if (elements.木 > 1.5) {
        strengths.push('木元素较强，创造力突出');
        advices.push('建议从事创意相关行业，如设计或写作');
    }
    if (conflicts.金 > 0.5) {
        advices.push('注意金木冲突，可能有决策压力');
    }
    return { strengths, advices };
}

module.exports = { calculateBazi, calculateElementBalance, calculateElementConflict, generateAIComment };