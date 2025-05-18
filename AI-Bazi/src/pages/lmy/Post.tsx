import React from 'react';
import { Input, Button, Upload, message, Card, List, Tabs, Popover, Popconfirm } from 'antd';
import { UploadOutlined, LikeOutlined, LikeFilled, SendOutlined, SmileOutlined, DeleteOutlined, AudioOutlined, PauseOutlined, SoundOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import Picker, { EmojiClickData } from 'emoji-picker-react';


const { TextArea } = Input;
const { TabPane } = Tabs;

const LOCAL_KEY = 'tarot_posts';

interface Topic {
  id: number;
  name: string;
  description: string;
}

interface Comment {
  id: string;
  user: string;
  content: string;
  time: string;
  audioSrc?: string; // 语音评论的音频数据
  audioDuration?: number; // 语音时长（秒）
}

interface PostData {
  content: string;
  images: string[]; // Ensure this is string[]
  videoUrl?: string; // Optional: URL of the uploaded video
  videoUploadProgress?: number; // Optional: Video upload progress (0-100)
  time: string;
  user: string;
  comments: Comment[];
  likes: number;
  liked: boolean;
  topicId: number;
}

// mock话题数据
const mockTopics: Topic[] = [
  { id: 1, name: '八字命理', description: '八字相关讨论' },
  { id: 2, name: '风水玄学', description: '风水相关讨论' },
  { id: 3, name: '塔罗牌', description: '塔罗牌体验分享' },
];

const Post: React.FC = () => {
  const [content, setContent] = React.useState('');
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);
  const [videoFileList, setVideoFileList] = React.useState<UploadFile[]>([]); // For video
  const [uploadProgress, setUploadProgress] = React.useState<{[key: string]: number}>({}); // For video progress
  const [posts, setPosts] = React.useState<PostData[]>([]);
  const [activeTab, setActiveTab] = React.useState('display');
  const [commentValue, setCommentValue] = React.useState('');
  const [commentingIndex, setCommentingIndex] = React.useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = React.useState<number>(mockTopics[0].id);
  const [showEmojiPickerForPost, setShowEmojiPickerForPost] = React.useState<number | null>(null);
  
  // 语音录制相关状态
  const [isRecording, setIsRecording] = React.useState(false);
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = React.useState<Blob[]>([]);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const recordingTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // 处理图片上传，转换为 Base64 (或将来上传到服务器)
  // 注意：此函数当前未在 handlePost 中被调用
  const handleImageUpload = (file: UploadFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file || !file.originFileObj) {
        reject(new Error('无效的文件对象'));
        return;
      }
      // 如果已经是 base64 (例如，来自之前的预览或操作)，直接返回
      if (file.thumbUrl && file.thumbUrl.startsWith('data:')) {
        resolve(file.thumbUrl);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file.originFileObj as Blob); // originFileObj should be File which is a Blob
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // 初始化加载本地内容
  React.useEffect(() => {
    console.log('Attempting to load posts from localStorage...');
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      try {
        const parsedPosts: PostData[] = JSON.parse(saved);
        if (Array.isArray(parsedPosts)) {
          // Log details of video URLs from loaded posts
          parsedPosts.forEach((post, index) => {
            if (post.videoUrl) {
              console.log(`Loaded post[${index}] video URL (Blob URL):`, post.videoUrl);
              // console.log(`Loaded post[${index}] video URL length:`, post.videoUrl.length); // Length of Blob URL isn't very informative
            }
          });
          setPosts(parsedPosts);
          console.log('Successfully loaded posts from localStorage:', parsedPosts);
        } else {
          console.error('Loaded data from localStorage is not an array:', parsedPosts);
          localStorage.removeItem(LOCAL_KEY);
        }
      } catch (error) {
        console.error('Failed to parse posts from localStorage:', error);
        localStorage.removeItem(LOCAL_KEY);
      }
    } else {
      console.log('No posts found in localStorage.');
    }
  }, []);

  // 每次posts变化都保存到本地
  React.useEffect(() => {
    const wasInitiallyEmpty = posts.length === 0 && localStorage.getItem(LOCAL_KEY) === null;
    if (!wasInitiallyEmpty || posts.length > 0) {
      console.log('Attempting to save/update posts in localStorage:', posts);
      try {
        if (posts.length > 0) {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(posts));
          console.log('Successfully saved posts to localStorage.');
        } else if (localStorage.getItem(LOCAL_KEY) !== null) {
          console.log('Posts array is empty, removing item from localStorage.');
          localStorage.removeItem(LOCAL_KEY);
        }
      } catch (error) {
        console.error('Failed to save posts to localStorage:', error);
      }
    }
  }, [posts]);

  // 发布帖子
  const handlePost = () => {
    console.log('handlePost called');
    if (!content && fileList.length === 0 && videoFileList.length === 0) {
      message.warning('请输入内容或上传文件');
      return;
    }

    const currentImageUrls: string[] = [];
    for (const file of fileList) { // file here is UploadFile
      if (file.thumbUrl) {
        currentImageUrls.push(file.thumbUrl);
      }
    }

    // For now, let's assume the video is "uploaded" when selected.
    // A real implementation would upload to a server and get a URL.
    const videoToPost = videoFileList.length > 0 ? videoFileList[0] : null;
    const videoUrl = videoToPost ? (videoToPost.url || videoToPost.thumbUrl) : undefined;

    // Log for debugging
    if (videoUrl) {
        // console.log('Video URL being prepared for post (first 100 chars):', videoUrl.substring(0, 100) + '...');
        // console.log('Video URL length for post:', videoUrl.length);
        console.log('Video URL being prepared for post (Blob URL):', videoUrl);
    } else {
        console.log('No video URL to prepare for post.');
    }

    const newPost: PostData = {
      content,
      images: currentImageUrls,
      videoUrl: videoUrl, // Add video URL
      time: new Date().toLocaleString(),
      user: '塔罗小助手',
      comments: [],
      likes: 0,
      liked: false,
      topicId: selectedTopic,
    };
    console.log('New post created:', newPost);
    setPosts(prevPosts => {
      const updatedPosts = [newPost, ...prevPosts];
      console.log('Updating posts state with:', updatedPosts);
      return updatedPosts;
    });
    setContent('');
    setFileList([]);
    setVideoFileList([]); // Clear video file list
    setUploadProgress({}); // Clear progress
    setActiveTab('display');
    console.log('Post submitted, content and fileList cleared.');
  };

  // 点赞
  const handleLike = (postIndex: number) => {
    console.log(`handleLike called for index: ${postIndex}`);
    setPosts(currentPosts => currentPosts.map((item, i) => i === postIndex ? {
      ...item,
      likes: item.liked ? item.likes - 1 : item.likes + 1,
      liked: !item.liked
    } : item));
  };

  // 评论
  const handleComment = (postIndex: number) => {
    if (!commentValue.trim() && !audioUrl) {
      message.warning('请输入评论内容或录制语音');
      return;
    }

    const newComment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user: '热心网友',
      content: commentValue,
      time: new Date().toLocaleString(),
      audioSrc: audioUrl || undefined,
      audioDuration: recordingTime || undefined
    };

    setPosts(currentPosts => currentPosts.map((item, i) => i === postIndex ? {
      ...item,
      comments: [...item.comments, newComment]
    } : item));

    setCommentValue('');
    setAudioUrl(null);
    setAudioBlob(null);
    setAudioChunks([]);
    setRecordingTime(0);
    setShowEmojiPickerForPost(null);
  };

  const onEmojiClick = (emojiObject: EmojiClickData) => {
    setCommentValue(prevInput => prevInput + emojiObject.emoji);
  };
  
  const toggleEmojiPicker = (postIndex: number) => {
    if (showEmojiPickerForPost === postIndex) {
      setShowEmojiPickerForPost(null);
    } else {
      setShowEmojiPickerForPost(postIndex);
      setCommentingIndex(postIndex);
    }
  };

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioChunks(chunks);
        
        // 计算音频时长
        const audio = new Audio(url);
        audio.addEventListener('loadedmetadata', () => {
          setRecordingTime(audio.duration);
        });
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      // 开始计时
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      message.error('无法访问麦克风');
      console.error('录音失败:', err);
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      // 停止计时
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // 取消录音
  const cancelRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setAudioBlob(null);
      setAudioUrl(null);
      setAudioChunks([]);
      setRecordingTime(0);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mock video upload handler with progress (simulating chunk upload)
  // In a real app, this would involve a resumable upload protocol (e.g., TUS) and backend communication.
  const handleVideoUpload = async (options: any) => {
    const { onSuccess, onError, file, onProgress } = options; // file is the File object from selection
    const fileName = (file as File).name; // file is a File object

    setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));

    // Simulate chunked upload - can be very brief for Blob URL creation
    const totalSteps = 5; // Simplified steps for quick feedback
    for (let i = 0; i < totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 50)); // Shorter delay
      const currentProgress = Math.round(((i + 1) / totalSteps) * 100);
      setUploadProgress(prev => ({ ...prev, [fileName]: currentProgress }));
      if (onProgress) {
          onProgress({ percent: currentProgress }, file); // Pass file back
      }
    }
    
    try {
      // Create a Blob URL directly from the selected file object
      const blobUrl = URL.createObjectURL(file as Blob); 
      console.log(`Created Blob URL for ${fileName}: ${blobUrl}`);
      if (onSuccess) {
        // Pass the blobUrl as the "server response" to Ant Design Upload
        // The second argument to onSuccess is the XHR object, we can pass the file itself or a mock.
        onSuccess(blobUrl, file as any);
      }
    } catch (error) {
      console.error(`Failed to create Blob URL for ${fileName}:`, error);
      message.error(`创建视频预览失败: ${fileName}`);
      if (onError) {
        onError(error);
      }
      setUploadProgress(prev => {
          const newState = { ...prev };
          delete newState[fileName];
          return newState;
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 话题广场选择 */}
      <div className="mb-6">
        <div className="text-lg font-bold text-white mb-2">话题广场</div>
        <div className="flex flex-wrap gap-3">
          {mockTopics.map(topic => (
            <Button
              key={topic.id}
              type={selectedTopic === topic.id ? 'primary' : 'default'}
              onClick={() => setSelectedTopic(topic.id)}
              className={selectedTopic === topic.id ? 'bg-blue-600 border-none' : 'bg-gray-700 border-gray-600 text-white'}
            >
              {topic.name}
            </Button>
          ))}
        </div>
        <div className="text-gray-400 mt-2">
          {mockTopics.find(t => t.id === selectedTopic)?.description}
        </div>
      </div>
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        centered
        className="custom-tabs"
        tabBarStyle={{ 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '24px'
        }}
      >
        <TabPane tab={
          <span className={`text-lg font-medium transition-colors ${
            activeTab === 'publish' ? 'text-blue-500' : 'text-gray-400 hover:text-white'
          }`}>
            发布内容
          </span>
        } key="publish">
          <Card 
            className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow"
            title={
              <div className="text-xl font-medium text-white">发布{mockTopics.find(t => t.id === selectedTopic)?.name}内容</div>
            }
          >
            <TextArea
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={`分享你在${mockTopics.find(t => t.id === selectedTopic)?.name}的话题体验吧~`}
              className="bg-gray-700 border-gray-600 text-Gray placeholder-gray-400 rounded-lg"
              style={{ resize: 'none' }}
            />
            <div className="mt-4">
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                beforeUpload={() => false}
                className="custom-upload"
              >
                {fileList.length < 3 && (
                  <div className="flex flex-col items-center justify-center text-gray-400 hover:text-white">
                    <UploadOutlined className="text-2xl" />
                    <span className="mt-2">上传图片 (最多3张)</span>
                  </div>
                )}
              </Upload>
            </div>
            {/* Video Upload Section */}
            <div className="mt-4">
              <div className="text-md font-medium text-white mb-2">上传视频 (最多1个)</div>
              <Upload
                accept="video/*"
                fileList={videoFileList}
                customRequest={handleVideoUpload}
                onRemove={(file) => {
                  setVideoFileList(current => current.filter(f => f.uid !== file.uid));
                  setUploadProgress(prev => {
                    const newState = { ...prev };
                    if (file.name) delete newState[file.name];
                    return newState;
                  });
                  return true;
                }}
                onChange={({ file, fileList: newFileList }) => {
                  // We only allow one video
                  setVideoFileList(newFileList.slice(-1)); 
                  
                  if (file.status === 'uploading' && file.percent !== undefined) {
                    setUploadProgress(prev => ({ ...prev, [file.name]: file.percent! }));
                  } else if (file.status === 'done') {
                     // Here, file.response would be the blobUrl from customRequest's onSuccess
                     const blobUrlFromResult = file.response as string;
                     console.log('Video processing done, response (blobUrl):', blobUrlFromResult);
                     setVideoFileList(prevList => prevList.map(f => {
                         if (f.uid === file.uid) {
                             // Store the blobUrl as the primary URL for this file item
                             return { ...f, url: blobUrlFromResult, thumbUrl: blobUrlFromResult, status: 'done' }; 
                         }
                         return f;
                     }));
                    setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
                    message.success(`${file.name} 视频准备就绪 (Blob URL).`);
                  } else if (file.status === 'error') {
                    message.error(`${file.name} 上传失败.`);
                    setUploadProgress(prev => {
                        const newState = { ...prev };
                        delete newState[file.name];
                        return newState;
                    });
                  }
                }}
                className="custom-upload"
              >
                {videoFileList.length < 1 && (
                  <div className="flex flex-col items-center justify-center text-gray-400 hover:text-white w-full h-[102px] border border-dashed border-gray-600 rounded-md">
                    <UploadOutlined className="text-2xl" />
                    <span className="mt-2">选择视频</span>
                  </div>
                )}
              </Upload>
              {/* Video Preview Area */}
              {videoFileList.length > 0 && (videoFileList[0].url || videoFileList[0].thumbUrl) && (
                <div className="mt-3">
                  <div className="text-sm font-medium text-white mb-1">视频预览:</div>
                  <video 
                    controls 
                    src={videoFileList[0].url || videoFileList[0].thumbUrl} 
                    className="w-full max-h-72 rounded-lg bg-black"
                  >
                    您的浏览器不支持视频标签。
                  </video>
                </div>
              )}
              {videoFileList.map(file => {
                const progress = uploadProgress[file.name];
                if (progress !== undefined && progress < 100 && file.status === 'uploading') {
                  return (
                    <div key={file.uid} className="mt-2">
                      <div className="text-white">{file.name} - {progress}%</div>
                      <div className="w-full bg-gray-600 rounded-full h-2.5">
                        <div 
                          className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
               <p className="text-xs text-gray-500 mt-2">
                注意: 当前为模拟上传。真正的断点续传需要后端支持。
              </p>
            </div>
            <Button 
              type="primary" 
              onClick={handlePost} 
              className="mt-4 w-full h-10 text-lg font-medium bg-blue-600 hover:bg-blue-700 border-none"
            >
              发布
            </Button>
          </Card>
        </TabPane>
        
        <TabPane tab={
          <span className={`text-lg font-medium transition-colors ${
            activeTab === 'display' ? 'text-blue-500' : 'text-gray-400 hover:text-white'
          }`}>
            内容展示
          </span>
        } key="display">
          {posts.filter(p => p.topicId === selectedTopic).length === 0 ? (
            <div className="text-center text-gray-400 py-10">暂无内容，请发布新帖子</div>
          ) : (
            <List
              itemLayout="vertical"
              dataSource={posts.filter(p => p.topicId === selectedTopic)}
              renderItem={(item: PostData, indexInFilteredList: number) => {
                // IMPORTANT: Get the actual index in the original 'posts' array
                const originalPostIndex = posts.findIndex(p => p === item);
                if (originalPostIndex === -1) return null; // Should not happen if item is from posts

                return (
                  <Card 
                    key={originalPostIndex}
                    className="mb-6 bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-gray-400 text-sm">
                        {item.user} · {item.time}
                      </div>
                      <Popconfirm
                        title="确定要删除这条帖子吗?"
                        description="删除后将无法恢复"
                        onConfirm={() => {
                          setPosts(currentPosts => 
                            currentPosts.filter((_, index) => index !== originalPostIndex)
                          );
                          message.success('帖子已删除');
                        }}
                        okText="确定"
                        cancelText="取消"
                        placement="topRight"
                      >
                        <Button 
                          type="text" 
                          icon={<DeleteOutlined className="text-gray-400 hover:text-red-500 transition-colors" />}
                          size="small"
                        />
                      </Popconfirm>
                    </div>
                    <div className="text-white text-lg mb-4 leading-relaxed">
                      {item.content}
                    </div>
                    {item.images && item.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.images.map((img: string, i: number) => (
                          <img 
                            key={i} 
                            src={img} 
                            alt="用户上传图片" 
                            className="w-24 h-24 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer" 
                          />
                        ))}
                      </div>
                    )}
                    {/* Display Video */}
                    {item.videoUrl && (
                      <div className="mb-4">
                        <video controls src={item.videoUrl} className="w-full max-h-96 rounded-lg bg-black">
                          Your browser does not support the video tag.
                        </video>
                        {item.videoUploadProgress !== undefined && item.videoUploadProgress < 100 && (
                           <div className="mt-2">
                             <div className="text-white text-sm">视频上传中: {item.videoUploadProgress}%</div>
                             <div className="w-full bg-gray-600 rounded-full h-1.5">
                               <div 
                                 className="bg-blue-500 h-1.5 rounded-full" 
                                 style={{ width: `${item.videoUploadProgress}%` }}
                               ></div>
                             </div>
                           </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center space-x-6 text-gray-400">
                      <button 
                        onClick={() => handleLike(originalPostIndex)} 
                        className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                      >  
                        {item.liked ? 
                          <LikeFilled className="text-blue-500" /> : 
                          <LikeOutlined />
                        }
                        <span>{item.likes}</span>
                      </button>
                      <button 
                        onClick={() => {
                          setCommentingIndex(originalPostIndex);
                          // If emoji picker was open for another post, close it
                          if (showEmojiPickerForPost !== null && showEmojiPickerForPost !== originalPostIndex) {
                            setShowEmojiPickerForPost(null);
                          }
                        }}
                        className="hover:text-blue-500 transition-colors"
                      >
                        评论
                      </button>
                    </div>
                    
                    {commentingIndex === originalPostIndex && (
                      <div className="mt-4 flex items-center space-x-2">
                        <Input
                          value={commentValue}
                          onChange={e => setCommentValue(e.target.value)}
                          placeholder="写下你的评论..."
                          className="bg-gray-700 border-gray-600 text-black placeholder-gray-400 flex-grow"
                          onPressEnter={() => handleComment(originalPostIndex)}
                          autoFocus
                        />
                        <Popover
                          content={
                            <Picker onEmojiClick={onEmojiClick} />
                          }
                          trigger="click"
                          open={showEmojiPickerForPost === originalPostIndex}
                          onOpenChange={(visible) => {
                            if (visible) {
                              setShowEmojiPickerForPost(originalPostIndex);
                            } else {
                              setShowEmojiPickerForPost(null);
                            }
                          }}
                        >
                          <Button icon={<SmileOutlined />} onClick={() => toggleEmojiPicker(originalPostIndex)} />
                        </Popover>
                        
                        {/* 语音录制按钮 */}
                        {!isRecording && !audioUrl && (
                          <Button 
                            icon={<AudioOutlined />} 
                            onClick={startRecording}
                            className="bg-blue-600 hover:bg-blue-700 border-none"
                          />
                        )}
                        
                        {/* 录音中状态 */}
                        {isRecording && (
                          <div className="flex items-center space-x-2">
                            <span className="text-red-500 animate-pulse">录音中 {formatTime(recordingTime)}</span>
                            <Button 
                              icon={<PauseOutlined />} 
                              onClick={stopRecording}
                              className="bg-red-600 hover:bg-red-700 border-none"
                            />
                          </div>
                        )}
                        
                        {/* 录音预览 */}
                        {audioUrl && !isRecording && (
                          <div className="flex items-center space-x-2">
                            <audio src={audioUrl} controls className="w-32" />
                            <Button 
                              icon={<DeleteOutlined />} 
                              onClick={cancelRecording}
                              className="bg-red-600 hover:bg-red-700 border-none"
                            />
                          </div>
                        )}
                        
                        <Button 
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={() => handleComment(originalPostIndex)}
                          className="bg-blue-600 hover:bg-blue-700 border-none"
                          disabled={!commentValue.trim() && !audioUrl}
                        />
                      </div>
                    )}
                    
                    {/* 在评论列表中显示语音 */}
                    {item.comments && item.comments.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {item.comments.map((c: Comment) => (
                          <div 
                            key={c.id}
                            className="bg-gray-700 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-blue-400">{c.user}</span>
                              <span className="text-gray-500">{c.time}</span>
                            </div>
                            <div className="text-white">{c.content}</div>
                            {c.audioSrc && (
                              <div className="mt-2 flex items-center space-x-2">
                                <SoundOutlined className="text-blue-400" />
                                <audio 
                                  src={c.audioSrc} 
                                  controls 
                                  className="w-full max-w-md"
                                />
                                {c.audioDuration && (
                                  <span className="text-gray-400 text-sm">
                                    {formatTime(c.audioDuration)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              }}
            />
          )}
        </TabPane>
      </Tabs>
      
    </div>
  );
};

export default Post;