// 引入 Express
const express = require('express');
const router = express.Router();

// 默认路由
router.get('/', (req, res) => {
    res.json({ message: '欢迎使用 AI 八字诊断助手 API' });
});

module.exports = router;