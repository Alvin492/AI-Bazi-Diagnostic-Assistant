import { useState, useEffect } from 'react'
import { Layout, Input, Button, Select, message, Modal, Upload, Spin } from 'antd'
import { SendOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleFilled, MenuFoldOutlined, MenuUnfoldOutlined,  InboxOutlined } from '@ant-design/icons'
import ChatMessage from './components/yl/ChatMessage'
import { ChatMessage as ChatMessageType, ModelType, ChatSession } from './types'
import { sendMessage, getChatSessions, getChatSession, createChatSession, updateChatSessionTitle, deleteChatSession } from './api'

const { Header, Content, Footer, Sider } = Layout

function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [model, setModel] = useState<ModelType>('deepseek-chat')
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [tempTitle, setTempTitle] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [fileList, setFileList] = useState<any[]>([])
  const [uploadCollapsed, setUploadCollapsed] = useState(false)
  const [initialCheckComplete, setInitialCheckComplete] = useState(false)

  // 加载会话列表
  useEffect(() => {
    const fetchSessions = async () => {
      setLoadingSessions(true);
      try {
        const sessions = await getChatSessions();
        setSessions(sessions);
        
        // 如果没有会话，自动创建一个新会话
        if (sessions.length === 0) {
          const newSession = await createChatSession('新会话 1', model);
          setSessions([newSession]);
          setCurrentSessionId(newSession._id);
          
          // 创建本地会话对象
          const localConversation = {
            id: newSession._id,
            title: newSession.title,
            messages: [],
            model: newSession.model
          };
          
          setConversations([localConversation]);
          setCurrentConversation(newSession._id);
        } else {
          // 如果有会话，设置第一个会话为当前会话
          setCurrentSessionId(sessions[0]._id);
        }
      } catch (error) {
        console.error('加载会话失败', error);
        message.error('加载会话失败');
      } finally {
        setLoadingSessions(false);
      }
    };
    
    fetchSessions();
  }, [model]); // 添加 model 作为依赖

  // 当模型变化但不是初始加载时
  useEffect(() => {
    // 如果初始检查已完成，则在模型变化时不创建新会话
    if (initialCheckComplete) {
      // 只更新当前会话的模型，不创建新会话
      if (currentSessionId) {
        const updateSessionModel = async () => {
          try {
            // 获取当前会话
            const currentSession = await getChatSession(currentSessionId);
            
            // 如果模型不同，则需要更新
            if (currentSession.model !== model) {
              // 这里可以添加更新会话模型的逻辑
              // 例如: await updateSessionModel(currentSessionId, model);
            }
          } catch (error) {
            console.error('更新会话模型失败', error);
          }
        };
        
        updateSessionModel();
      }
    }
  }, [model, initialCheckComplete, currentSessionId]);

  // 当选择会话时，保存会话ID到本地存储
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('lastSessionId', currentSessionId);
    }
  }, [currentSessionId]);

  // 当选择会话时，加载会话详情
  useEffect(() => {
    if (!currentSessionId) return;
    
    const fetchSessionDetail = async () => {
      try {
        const session = await getChatSession(currentSessionId);
        // 创建本地会话对象
        const localConversation = {
          id: session._id,
          title: session.title,
          messages: session.messages,
          model: session.model
        };
        
        // 更新会话列表和当前会话
        setConversations([localConversation]);
        setCurrentConversation(localConversation.id);
        setModel(session.model);
      } catch (error) {
        console.error('加载会话详情失败', error);
        message.error('加载会话详情失败');
      }
    };
    
    fetchSessionDetail();
  }, [currentSessionId]);

  const currentMessages = currentConversation 
    ? conversations.find(conv => conv.id === currentConversation)?.messages || []
    : [];

  // 修改创建新会话的函数
  const createNewConversation = async () => {
    try {
      // 获取当前时间并格式化
      const now = new Date();
      const formattedDate = `${now.getMonth() + 1}月${now.getDate()}日`;
      const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const sessionTitle = `${formattedDate} ${formattedTime}`;

      const newSession = await createChatSession(sessionTitle, model);
      setSessions([...sessions, newSession]);
      setCurrentSessionId(newSession._id);
      
      const localConversation = {
        id: newSession._id,
        title: newSession.title,
        messages: [],
        model: newSession.model
      };
      
      setConversations([localConversation]);
      setCurrentConversation(localConversation.id);
    } catch (error) {
      console.error('创建新会话失败', error);
      message.error('创建新会话失败');
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() && fileList.length === 0) {
      message.warning('请输入内容或上传文件')
      return
    }

    // 保存用户输入，因为后面会清空
    const userInput = inputValue.trim();
    
    // 创建用户消息对象
    const userMessage: ChatMessageType = {
      role: 'user',
      content: userInput
    };

    // 清空输入框并设置加载状态
    setInputValue('');
    setLoading(true);

    try {
      let sessionId = currentSessionId;
      let conversationId = currentConversation;

      // 如果没有当前会话，创建新会话
      if (!sessionId) {
        try {
          const now = new Date();
          const formattedDate = `${now.getMonth() + 1}月${now.getDate()}日`;
          const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          const sessionTitle = `${formattedDate} ${formattedTime}`;

          const newSession = await createChatSession(sessionTitle, model);
          sessionId = newSession._id;
          conversationId = newSession._id;

          const localConversation = {
            id: newSession._id,
            title: newSession.title,
            messages: [],
            model: newSession.model
          };

          setSessions([...sessions, newSession]);
          setConversations([localConversation]);
          setCurrentSessionId(newSession._id);
          setCurrentConversation(newSession._id);
        } catch (error) {
          console.error('创建新会话失败', error);
          message.error('创建新会话失败');
          setLoading(false);
          return;
        }
      }

      const updatedConversations = conversations.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, userMessage]
          }
        }
        return conv
      })
      setConversations(updatedConversations)

      try {
        const files = await Promise.all(
          fileList.map(async (file) => {
            const content = await new Promise((resolve) => {
              const reader = new FileReader()
              reader.onload = (e) => resolve(e.target?.result)
              reader.readAsText(file.originFileObj)
            })
            return {
              name: file.name,
              type: file.type,
              size: file.size,
              content: content as string
            }
          })
        )

        const stream = await sendMessage(userMessage.content, model, files, sessionId);
        setFileList([])
        const reader = stream.getReader()
        const decoder = new TextDecoder()
        let assistantMessage: ChatMessageType = {
          role: 'assistant',
          content: ''
        }
        
        let responseSessionId: string | null = null;

        try {
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              break
            }
            
            const text = decoder.decode(value)
            const lines = text.split('\n\n')
            
            for (const line of lines) {
              if (line.trim() === '') continue
              if (line.trim() === 'data: [DONE]') continue
              
              if (line.startsWith('data: ')) {
                try {
                  const json = JSON.parse(line.substring(6))
                  
                  // 处理心跳信息
                  if (json.heartbeat) continue
                  
                  // 处理会话ID
                  if (json.sessionId) {
                    responseSessionId = json.sessionId;
                    continue;
                  }
                  
                  // 处理内容
                  if (json.content) {
                    assistantMessage.content += json.content
                    
                    setConversations(conversations.map(conv => {
                      if (conv.id === conversationId) {
                        const msgs = [...conv.messages]
                        if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
                          msgs[msgs.length - 1] = assistantMessage
                        } else {
                          msgs.push(assistantMessage)
                        }
                        return { ...conv, messages: msgs }
                      }
                      return conv
                    }))
                  }
                } catch (e) {
                  console.error('解析SSE消息失败', e, line)
                }
              }
            }
          }
          
          // 如果服务器返回了新的会话ID，更新当前会话
          if (responseSessionId && responseSessionId !== sessionId) {
            setCurrentSessionId(responseSessionId);
            
            // 更新会话列表
            try {
              const sessions = await getChatSessions();
              setSessions(sessions);
            } catch (error) {
              console.error('更新会话列表失败', error);
            }
          }
        } catch (error) {
          console.error('处理响应流失败', error)
          message.error('处理响应失败')
        }
      } catch (error) {
        console.error('发送消息失败', error)
        message.error(error instanceof Error ? error.message : '发送失败')
      } finally {
        setLoading(false)
      }
    } catch (error) {
      console.error('消息处理失败', error);
      message.error('消息处理失败');
      setLoading(false);
    }
  }

  const handleTitleEdit = async (conv: any) => {
    if (!tempTitle.trim()) {
      message.warning('标题不能为空')
      return
    }
    
    try {
      await updateChatSessionTitle(conv.id, tempTitle);
      
      // 更新本地会话列表
      setSessions(sessions.map(session => {
        if (session._id === conv.id) {
          return { ...session, title: tempTitle }
        }
        return session
      }))
      
      // 更新本地对话
      setConversations(conversations.map(c => {
        if (c.id === conv.id) {
          return { ...c, title: tempTitle }
        }
        return c
      }))
      
      setEditingTitle(null)
    } catch (error) {
      console.error('更新标题失败', error);
      message.error('更新标题失败');
    }
  }

  const handleDeleteSession = async (id: string) => {
    Modal.confirm({
      title: '确定要删除这个会话吗？',
      icon: <ExclamationCircleFilled style={{ color: '#ff4d4f' }} />,
      content: (
        <div style={{ padding: '12px 0' }}>
          <p style={{ margin: 0, color: '#666' }}>删除后将无法恢复此会话的所有内容。</p>
        </div>
      ),
      okText: '删除会话',
      cancelText: '取消',
      okButtonProps: { 
        danger: true,
        style: { borderRadius: '6px' }
      },
      cancelButtonProps: {
        style: { borderRadius: '6px' }
      },
      centered: true,
      maskClosable: false,
      onOk: async () => {
        try {
          await deleteChatSession(id);
          
          // 更新本地会话列表
          const updatedSessions = sessions.filter(session => session._id !== id);
          setSessions(updatedSessions);
          
          // 更新本地对话
          setConversations(conversations.filter(c => c.id !== id));
          
          // 如果删除的是当前会话，设置新的当前会话
          if (currentSessionId === id) {
            if (updatedSessions.length > 0) {
              setCurrentSessionId(updatedSessions[0]._id);
            } else {
              setCurrentSessionId(null);
              setCurrentConversation(null);
            }
          }
          
          message.success('删除成功');
        } catch (error) {
          console.error('删除会话失败', error);
          message.error('删除会话失败');
        }
      }
    });
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider 
        width={250} 
        collapsible 
        collapsed={collapsed} 
        trigger={null}
        style={{ 
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          overflow: 'auto',
          transition: 'all 0.2s'
        }}
      >
        <div style={{ padding: '16px' }}>
          <Button 
            type="dashed" 
            icon={<PlusOutlined />} 
            onClick={createNewConversation}
            style={{ width: '100%' }}
          >
            {!collapsed && '新建会话'}
          </Button>
        </div>
        {!collapsed && (
          <div style={{ padding: '0 8px' }}>
            {loadingSessions ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size="small" />
              </div>
            ) : Array.isArray(sessions) ? (
              sessions.map(session => (
                <div
                  key={session._id}
                  onClick={() => setCurrentSessionId(session._id)}
                  style={{
                    padding: '12px',
                    margin: '4px 0',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    background: currentSessionId === session._id ? '#e6f4ff' : 'transparent',
                    transition: 'all 0.3s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {editingTitle === session._id ? (
                    <div 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        width: '100%' 
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        size="small"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onPressEnter={() => handleTitleEdit(session)}
                        onBlur={() => setEditingTitle(null)}
                        autoFocus
                        style={{ flex: 1 }}
                      />
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => handleTitleEdit(session)}
                        style={{ marginLeft: '4px' }}
                      >
                        保存
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div 
                        style={{ 
                          flex: 1, 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          marginRight: '8px'
                        }}
                      >
                        {session.title}
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTempTitle(session.title);
                            setEditingTitle(session._id);
                          }}
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session._id);
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                暂无会话记录
              </div>
            )}
          </div>
        )}
      </Sider>
      
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
          height: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button 
              type="text" 
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 500, 
              background: 'linear-gradient(to right, #1677ff, #22c55e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              DeepSeek Chat
            </div>
          </div>
          <Select
            value={model}
            onChange={(value: ModelType) => setModel(value)}
            style={{ width: 180 }}
            options={[
              { value: 'deepseek-chat', label: 'Deepseek Chat' },
              { value: 'deepseek-coder', label: 'Deepseek Coder' },
              { value: 'deepseek-reasoner', label: 'Deepseek Reasoner' }
            ]}
          />
        </Header>
        <Content style={{ 
          padding: '24px', 
          overflowY: 'auto',
          backgroundColor: '#fafafa'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {currentMessages.length === 0 ? (
              <>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '50px 0', 
                  color: '#999'
                }}>
                  {currentSessionId ? '开始新的对话吧！' : '请选择或创建一个会话'}
                </div>
                {/* 测试消息 */}
                <ChatMessage message={{ role: 'user', content: '你好，这是一条测试消息' }} />
              </>
            ) : (
              currentMessages.filter((msg: ChatMessageType) => msg.role !== 'system').map((msg: ChatMessageType, index: number) => (
                <ChatMessage key={index} message={msg} />
              ))
            )}
          </div>
        </Content>
        
        <Footer style={{ 
          padding: '16px', 
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                  type="text"
                  icon={uploadCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setUploadCollapsed(!uploadCollapsed)}
                  style={{ padding: '4px 8px' }}
                >
                  {uploadCollapsed ? '展开文件上传' : '收起文件上传'}
                </Button>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                height: uploadCollapsed ? 0 : 'auto',
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
                opacity: uploadCollapsed ? 0 : 1
              }}>
                <Upload.Dragger
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  multiple={true}
                  beforeUpload={(file) => {
                    const isText = file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.jsx') || file.name.endsWith('.tsx') || file.name.endsWith('.css') || file.name.endsWith('.html');
                    if (!isText) {
                      message.error('只支持上传文本文件');
                      return Upload.LIST_IGNORE;
                    }
                    return false;
                  }}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px dashed #e5e7eb'
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ color: '#1677ff', fontSize: '32px' }} />
                  </p>
                  <p className="ant-upload-text" style={{ color: '#666' }}>
                    点击或拖拽文本文件到此区域上传
                  </p>
                  <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                    支持 .txt, .md, .json, .js, .ts, .jsx, .tsx, .css, .html 等文本文件
                  </p>
                </Upload.Dragger>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPressEnter={handleSend}
                  placeholder="输入消息..."
                  disabled={loading}
                  style={{ 
                    borderRadius: '12px',
                    fontSize: '14px',
                    padding: '12px 16px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease'
                  }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                  loading={loading}
                  style={{ 
                    borderRadius: '12px',
                    width: '80px',
                    height: '44px',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(to right, #1677ff, #22c55e)',
                    border: 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  发送
                </Button>
              </div>
            </div>
          </div>
        </Footer>
      </Layout>
    </Layout>
  )
}

export default App
