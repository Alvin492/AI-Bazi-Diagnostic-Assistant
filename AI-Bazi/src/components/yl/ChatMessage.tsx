import React from 'react'
import { Avatar, Button } from 'antd'
import { UserOutlined, RobotOutlined, CopyOutlined, CheckCircleOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import { ChatMessage as ChatMessageType } from '../../../src/types'

interface Props {
  message: ChatMessageType
}

const ChatMessage: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user'
  const [showCopyTip, setShowCopyTip] = React.useState(false)

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setShowCopyTip(true)
      setTimeout(() => setShowCopyTip(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const CopyTip = () => (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(135deg, #52c41a, #85ce61)',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: showCopyTip ? 1 : 0,
        visibility: showCopyTip ? 'visible' : 'hidden',
        transition: 'all 0.3s ease-in-out',
        zIndex: 1000
      }}
    >
      <CheckCircleOutlined style={{ fontSize: '18px' }} />
      <span style={{ fontSize: '14px', fontWeight: 500 }}>复制成功</span>
    </div>
  )

  const CodeBlock = ({ children, language }: { children: string, language?: string }) => {
    return (
      <div style={{
        position: 'relative',
        backgroundColor: '#f6f8fa',
        borderRadius: '6px',
        padding: '16px',
        marginTop: '8px',
        marginBottom: '8px'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: '#e1e4e8',
          color: '#24292e',
          padding: '2px 8px',
          fontSize: '12px',
          borderTopLeftRadius: '6px',
          borderBottomRightRadius: '6px'
        }}>
          {language || 'text'}
        </div>
        <Button
          icon={<CopyOutlined />}
          size="small"
          type="text"
          onClick={() => handleCopy(children)}
          style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            opacity: 0.6,
            ':hover': {
              opacity: 1
            }
          }}
        >
          复制
        </Button>
        <pre style={{
          margin: 0,
          padding: '24px 0 8px',
          overflow: 'auto'
        }}>
          <code style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: 1.4
          }}>
            {children}
          </code>
        </pre>
      </div>
    )
  }

  return (
    <>
      <CopyTip />
      <div
        style={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          marginBottom: '16px',
          padding: '0 12px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            maxWidth: '85%',
            backgroundColor: isUser ? '#e6f4ff' : 'transparent',
            borderRadius: isUser ? '18px' : '0',
            padding: isUser ? '12px 16px' : '0',
            boxShadow: isUser ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          <Avatar
            icon={isUser ? <UserOutlined /> : <RobotOutlined />}
            style={{
              backgroundColor: isUser ? '#1677ff' : '#22c55e',
              flexShrink: 0
            }}
          />
          <div style={{ flex: 1, fontSize: '14px', lineHeight: 1.6 }}>
            {isUser ? (
              <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
            ) : (
              <ReactMarkdown
                components={{
                  code: ({ children, className }) => {
                    const language = className ? className.replace('language-', '') : undefined;
                    return <CodeBlock language={language}>{children as string}</CodeBlock>;
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ChatMessage