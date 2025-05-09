// 引入 node-cache 和日志
const NodeCache = require('node-cache');
const logger = require('../config/logger');

// 初始化缓存
const cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL, 10) });

// 获取或设置缓存
async function getOrSetCache(key, fetchData) {
    try {
        let data = cache.get(key);
        if (data) {
            logger.info(`缓存命中，键: ${key}`);
            return data;
        }
        data = await fetchData();
        cache.set(key, data);
        logger.info(`缓存设置成功，键: ${key}`);
        return data;
    } catch (error) {
        logger.error(`缓存操作失败，键: ${key}, 错误: ${error.message}`);
        throw error;
    }
}

module.exports = { getOrSetCache };