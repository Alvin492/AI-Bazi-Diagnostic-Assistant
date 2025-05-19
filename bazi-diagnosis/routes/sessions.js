var express = require('express');
var router = express.Router();
var ChatSession = require('../models/ChatSession');

/* GET all chat sessions */
router.get('/', async function (req, res, next) {
    try {
        const sessions = await ChatSession.find({}).sort({ updatedAt: -1 }).select('-files.content');
        res.json(sessions);
    } catch (error) {
        next(error);
    }
});

/* GET a specific chat session */
router.get('/:id', async function (req, res, next) {
    try {
        const session = await ChatSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ error: '会话不存在' });
        }
        res.json(session);
    } catch (error) {
        next(error);
    }
});

/* POST create a new chat session */
router.post('/', async function (req, res, next) {
    try {
        const { title, model, messages, files } = req.body;
        const newSession = new ChatSession({
            title: title || '新对话',
            model: model || 'deepseek-chat',
            messages: messages || [],
            files: files || []
        });

        const savedSession = await newSession.save();
        res.status(201).json(savedSession);
    } catch (error) {
        next(error);
    }
});

/* PUT update an existing chat session */
router.put('/:id', async function (req, res, next) {
    try {
        const { title, model, messages, files } = req.body;
        const session = await ChatSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ error: '会话不存在' });
        }

        if (title) session.title = title;
        if (model) session.model = model;
        if (messages) session.messages = messages;
        if (files) session.files = files;

        const updatedSession = await session.save();
        res.json(updatedSession);
    } catch (error) {
        next(error);
    }
});

/* PATCH add a message to a chat session */
router.patch('/:id/messages', async function (req, res, next) {
    try {
        const { role, content } = req.body;

        if (!role || !content) {
            return res.status(400).json({ error: '角色和内容是必需的' });
        }

        const session = await ChatSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ error: '会话不存在' });
        }

        session.messages.push({
            role,
            content,
            timestamp: new Date()
        });

        const updatedSession = await session.save();
        res.json(updatedSession);
    } catch (error) {
        next(error);
    }
});

/* DELETE a chat session */
router.delete('/:id', async function (req, res, next) {
    try {
        const result = await ChatSession.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: '会话不存在' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

module.exports = router; 