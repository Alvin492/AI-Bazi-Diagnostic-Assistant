const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function runMigrations() {
    const connection = await mysql.createConnection({
        host: '112.125.122.139',
        user: 'root',
        password: 'Root#2025!',
        database: 'ai',
        multipleStatements: true
    });

    try {
        console.log('开始执行数据库迁移...');

        // 读取并执行 users 表迁移
        const usersSql = await fs.readFile(path.join(__dirname, '../migrations/000_create_users.sql'), 'utf8');
        await connection.query(usersSql);
        console.log('✅ users 表迁移完成');

        // 读取并执行 chat_sessions 表迁移
        const chatSessionsSql = await fs.readFile(path.join(__dirname, '../migrations/001_create_chat_sessions.sql'), 'utf8');
        await connection.query(chatSessionsSql);
        console.log('✅ chat_sessions 表迁移完成');

        console.log('所有迁移执行完成！');
    } catch (error) {
        console.error('迁移执行失败:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigrations().catch(console.error); 