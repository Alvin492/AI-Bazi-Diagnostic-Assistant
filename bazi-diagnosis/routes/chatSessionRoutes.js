const express = require('express');
const router = express.Router();
const chatSessionController = require('../controllers/chatSessionController');

// 假设你有中间件验证用户身份并挂载到 req.user
router.post('/', chatSessionController.create);
router.get('/', chatSessionController.list);
router.put('/:id', chatSessionController.update);

module.exports = router;
