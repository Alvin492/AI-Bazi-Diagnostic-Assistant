const pool = require('../config/database');
const logger = require('../config/logger'); // 假设您需要日志

// Helper function to fetch messages and files for a session
async function fetchSessionDetails(sessionId) {
    const [messages] = await pool.query('SELECT role, content, timestamp FROM session_messages WHERE session_id = ? ORDER BY timestamp ASC', [sessionId]);
    const [files] = await pool.query('SELECT name, type, size, content FROM session_files WHERE session_id = ?', [sessionId]);
    return { messages, files };
}

const ChatSession = {
    // 查找所有聊天会话
    async find({}) {
        try {
            // 仅查询主会话信息，不包含messages和files的content
            const [sessions] = await pool.query('SELECT id, title, model, created_at AS createdAt, updated_at AS updatedAt FROM chat_sessions ORDER BY updated_at DESC');
            
            // 对于每个会话，获取其消息和文件（不含大内容）
            // 注意：这里为了模拟Mongoose的select('-files.content')，files.content不返回
            // 但实际上需要messages和files的结构，所以这里需要另外查询
            // 更好的做法是在需要messages和files完整内容的地方单独查询
            
            // 简单起见，这里只返回主会话信息，如果需要messages和files，需要单独方法或在findById中获取
            // 如果需要messages/files的数量或部分信息，可以在主查询中join或子查询
            
            // 暂不包含messages和files，如果前端需要，需要调整API或模型方法
            return sessions;

        } catch (error) {
            logger.error(`查找所有会话失败: ${error.message}`);
            throw error;
        }
    },

    // 根据 ID 查找特定聊天会话
    async findById(id) {
        try {
            const [sessions] = await pool.query(
                'SELECT id, title, model, created_at AS createdAt, updated_at AS updatedAt FROM chat_sessions WHERE id = ?',
                [id]
            );
            const session = sessions[0];

            if (!session) {
                return null; // 会话不存在
            }

            // 获取会话的messages和files
            const details = await fetchSessionDetails(id);
            session.messages = details.messages;
            session.files = details.files;

            return session;

        } catch (error) {
            logger.error(`根据ID查找会话失败，ID: ${id}, 错误: ${error.message}`);
            throw error;
        }
    },

    // 创建新的聊天会话
    async create({ title, model, messages = [], files = [] }) {
        console.log('创建会话', title, model, messages, files);
        
        let connection;
        
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            console.log(connection);
            
            const [result] = await connection.query(
                'INSERT INTO chat_sessions (title, model) VALUES (?, ?)',
                [title, model]
            );
            const sessionId = result.insertId;

            // 插入 messages
            if (messages.length > 0) {
                const messageValues = messages.map(msg => [
                    sessionId,
                    msg.role,
                    msg.content,
                    msg.content, // message_text 字段，内容与 content 相同
                    msg.timestamp || new Date(),
                    msg.type || 'text'
                ]);
                await connection.query(
                    'INSERT INTO session_messages (session_id, role, content, message_text, timestamp, type) VALUES ?',
                    [messageValues]
                );
            }

            // 插入 files
            if (files.length > 0) {
                 const fileValues = files.map(file => [sessionId, file.name, file.type, file.size, file.content]);
                 await connection.query(
                    'INSERT INTO session_files (session_id, name, type, size, content) VALUES ?',
                    [fileValues]
                 );
            }

            await connection.commit();

            // 返回创建的会话，可能需要重新查询以获取完整结构（含默认值等）
             const [newSessionRows] = await pool.query('SELECT * FROM chat_sessions WHERE id = ?', [sessionId]);
             const newSession = newSessionRows[0];
             const details = await fetchSessionDetails(sessionId);
             newSession.messages = details.messages;
             newSession.files = details.files;
             
            return newSession;

        } catch (error) {
            if (connection) await connection.rollback();
            // logger.error(`创建会话失败，错误: ${error.message}`);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    // 更新现有聊天会话 (这里只支持更新title和model)
     async update(id, { title, model }) {
        try {
            // 注意：messages和files的更新需要单独的逻辑（如patch或put到子资源）
            // 这里的update只处理chat_sessions表的主字段
            const [result] = await pool.query(
                'UPDATE chat_sessions SET title = ?, model = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [title, model, id]
            );
             if (result.affectedRows === 0) {
                 return null; // 没有找到会话或没有更新
             }
            // 返回更新后的会话信息（可能需要重新查询）
            const [updatedSessionRows] = await pool.query('SELECT * FROM chat_sessions WHERE id = ?', [id]);
            const updatedSession = updatedSessionRows[0];
            const details = await fetchSessionDetails(id);
            updatedSession.messages = details.messages;
            updatedSession.files = details.files;
            return updatedSession;

        } catch (error) {
            logger.error(`更新会话失败，ID: ${id}, 错误: ${error.message}`);
            throw error;
        }
    },

    // 添加消息到聊天会话 (对应PATCH /:id/messages)
     async addMessage(sessionId, { role, content, type }) {
         try {
             const [result] = await pool.query(
                 'INSERT INTO session_messages (session_id, role, content, message_text, type) VALUES (?, ?, ?, ?, ?)',
                 [sessionId, role, content, content, type || 'text']
             );
             // 更新主会话的 updated_at 字段
             await pool.query('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [sessionId]);
             // 返回新插入的消息ID
             return result.insertId;
         } catch (error) {
             logger.error(`添加消息到会话失败，会话ID: ${sessionId}, 错误: ${error.message}`);
             throw error;
         }
     },

    // 根据 ID 删除聊天会话
    async findByIdAndDelete(id) {
        console.log('删除会话', id);
        
        try {
            // 由于使用了FOREIGN KEY ... ON DELETE CASCADE，删除主会话会自动删除关联的消息和文件
            const [result] = await pool.query('DELETE FROM chat_sessions WHERE id = ?', [id]);
            return result.affectedRows > 0; // 返回是否成功删除

        } catch (error) {
            logger.error(`删除会话失败，ID: ${id}, 错误: ${error.message}`);
            throw error;
        }
    }
};

// 将 ChatSession 对象包装成可构造的函数，以兼容旧模式（new ChatSession({...}).save()）
function ChatSessionModel(data) {
    this.title = data.title;
    this.model = data.model;
    this.messages = data.messages || [];
    this.files = data.files || [];
}
// 静态方法绑定
ChatSessionModel.find = ChatSession.find.bind(ChatSession);
ChatSessionModel.findById = ChatSession.findById.bind(ChatSession);
ChatSessionModel.create = ChatSession.create.bind(ChatSession);
ChatSessionModel.update = ChatSession.update.bind(ChatSession);
ChatSessionModel.addMessage = ChatSession.addMessage.bind(ChatSession);
ChatSessionModel.findByIdAndDelete = ChatSession.findByIdAndDelete.bind(ChatSession);
// 实例方法 save
ChatSessionModel.prototype.save = function() {
    return ChatSession.create({
        title: this.title,
        model: this.model,
        messages: this.messages,
        files: this.files
    });
};
module.exports = ChatSessionModel; 