import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

interface ChatUser {
  id: string
  name: string
  avatar: string
  socketId: string
  currentChannel: string
}

interface ChatMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar: string
  channelId: string
  timestamp: string
  reactions: { emoji: string; users: string[] }[]
  attachments: string[]
}

const connectedUsers = new Map<string, ChatUser>()
const channelMessages = new Map<string, ChatMessage[]>()

const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36)

// Pre-populate with sample messages
const sampleMessages: ChatMessage[] = [
  {
    id: 'm-1',
    content: 'Hey team! Just pushed the latest changes to staging. Can someone review?',
    senderId: 'u-1',
    senderName: 'Alex Thompson',
    senderAvatar: '',
    channelId: 'ch-1',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    reactions: [{ emoji: '👍', users: ['u-2', 'u-3'] }],
    attachments: [],
  },
  {
    id: 'm-2',
    content: "On it! I'll review the API changes this afternoon.",
    senderId: 'u-3',
    senderName: 'Marcus Rivera',
    senderAvatar: '',
    channelId: 'ch-1',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    reactions: [],
    attachments: [],
  },
  {
    id: 'm-3',
    content: 'The new dashboard looks amazing! Great work on the charts 🎉',
    senderId: 'u-2',
    senderName: 'Sarah Chen',
    senderAvatar: '',
    channelId: 'ch-1',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
    reactions: [{ emoji: '🔥', users: ['u-1', 'u-4'] }],
    attachments: [],
  },
  {
    id: 'm-4',
    content: 'Thanks! I used Recharts for the data visualization. Let me know if you want to add more chart types.',
    senderId: 'u-1',
    senderName: 'Alex Thompson',
    senderAvatar: '',
    channelId: 'ch-1',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(),
    reactions: [],
    attachments: [],
  },
  {
    id: 'm-5',
    content: 'Can we schedule a quick sync about the mobile app timeline?',
    senderId: 'u-4',
    senderName: 'Emily Watson',
    senderAvatar: '',
    channelId: 'ch-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reactions: [],
    attachments: [],
  },
  {
    id: 'm-6',
    content: 'Homepage mockup is ready for review. Check the Figma link.',
    senderId: 'u-2',
    senderName: 'Sarah Chen',
    senderAvatar: '',
    channelId: 'ch-2',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    reactions: [{ emoji: '👀', users: ['u-1'] }],
    attachments: [],
  },
  {
    id: 'm-7',
    content: 'Looking at it now. The hero section is 🔥',
    senderId: 'u-1',
    senderName: 'Alex Thompson',
    senderAvatar: '',
    channelId: 'ch-2',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
    reactions: [],
    attachments: [],
  },
  {
    id: 'm-8',
    content: 'The API endpoints for the mobile app are ready for integration testing.',
    senderId: 'u-3',
    senderName: 'Marcus Rivera',
    senderAvatar: '',
    channelId: 'ch-3',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    reactions: [],
    attachments: [],
  },
  {
    id: 'm-9',
    content: 'Great! I will start the integration tomorrow morning.',
    senderId: 'u-5',
    senderName: 'David Kim',
    senderAvatar: '',
    channelId: 'ch-3',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    reactions: [{ emoji: '👍', users: ['u-3'] }],
    attachments: [],
  },
  {
    id: 'm-10',
    content: 'CI/CD pipeline is configured. Waiting for approval to merge.',
    senderId: 'u-7',
    senderName: 'James Wilson',
    senderAvatar: '',
    channelId: 'ch-4',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    reactions: [],
    attachments: [],
  },
]

// Initialize channel messages
sampleMessages.forEach((msg) => {
  const existing = channelMessages.get(msg.channelId) || []
  existing.push(msg)
  channelMessages.set(msg.channelId, existing)
})

// Ensure all channels have an array
for (let i = 1; i <= 7; i++) {
  const chId = `ch-${i}`
  if (!channelMessages.has(chId)) {
    channelMessages.set(chId, [])
  }
}

function getMessagesForChannel(channelId: string): ChatMessage[] {
  return channelMessages.get(channelId) || []
}

function addMessageToChannel(channelId: string, message: ChatMessage) {
  const messages = channelMessages.get(channelId) || []
  messages.push(message)
  // Keep only last 50 messages per channel
  if (messages.length > 50) {
    channelMessages.set(channelId, messages.slice(-50))
  } else {
    channelMessages.set(channelId, messages)
  }
}

io.on('connection', (socket) => {
  console.log(`[Chat] User connected: ${socket.id}`)

  // User joins the chat
  socket.on('join', (data: { userId: string; userName: string; userAvatar: string; channel: string }) => {
    const { userId, userName, userAvatar, channel } = data

    const user: ChatUser = {
      id: userId,
      name: userName,
      avatar: userAvatar,
      socketId: socket.id,
      currentChannel: channel,
    }

    connectedUsers.set(socket.id, user)

    // Join the channel room
    socket.join(channel)

    // Send existing messages for the channel
    const messages = getMessagesForChannel(channel)
    socket.emit('channel_messages', { channelId: channel, messages })

    // Notify others in the channel
    socket.to(channel).emit('user_joined', {
      user: { id: userId, name: userName, avatar: userAvatar },
      channel,
    })

    // Send connected users list
    const usersList = Array.from(connectedUsers.values()).map((u) => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
    }))
    io.emit('connected_users', { users: usersList })

    console.log(`[Chat] ${userName} joined channel ${channel}`)
  })

  // Switch channel
  socket.on('switch_channel', (data: { channel: string }) => {
    const user = connectedUsers.get(socket.id)
    if (!user) return

    // Leave old channel room
    socket.leave(user.currentChannel)
    // Join new channel room
    socket.join(data.channel)
    user.currentChannel = data.channel

    // Send existing messages for the new channel
    const messages = getMessagesForChannel(data.channel)
    socket.emit('channel_messages', { channelId: data.channel, messages })
  })

  // New message
  socket.on('send_message', (data: { channelId: string; content: string }) => {
    const user = connectedUsers.get(socket.id)
    if (!user || !data.content.trim()) return

    const message: ChatMessage = {
      id: generateId(),
      content: data.content.trim(),
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      channelId: data.channelId,
      timestamp: new Date().toISOString(),
      reactions: [],
      attachments: [],
    }

    addMessageToChannel(data.channelId, message)

    // Broadcast to all users in the channel
    io.to(data.channelId).emit('new_message', message)

    console.log(`[Chat] ${user.name}: ${data.content.trim()} (in ${data.channelId})`)
  })

  // Typing indicator
  socket.on('typing', (data: { channelId: string }) => {
    const user = connectedUsers.get(socket.id)
    if (!user) return

    socket.to(data.channelId).emit('user_typing', {
      userId: user.id,
      userName: user.name,
      channelId: data.channelId,
    })
  })

  // Stop typing
  socket.on('stop_typing', (data: { channelId: string }) => {
    const user = connectedUsers.get(socket.id)
    if (!user) return

    socket.to(data.channelId).emit('user_stop_typing', {
      userId: user.id,
      channelId: data.channelId,
    })
  })

  // Disconnect
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id)
    if (user) {
      connectedUsers.delete(socket.id)

      // Notify others
      socket.to(user.currentChannel).emit('user_left', {
        user: { id: user.id, name: user.name, avatar: user.avatar },
        channel: user.currentChannel,
      })

      // Update connected users list
      const usersList = Array.from(connectedUsers.values()).map((u) => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
      }))
      io.emit('connected_users', { users: usersList })

      console.log(`[Chat] ${user.name} disconnected`)
    } else {
      console.log(`[Chat] User disconnected: ${socket.id}`)
    }
  })

  socket.on('error', (error) => {
    console.error(`[Chat] Socket error (${socket.id}):`, error)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`[Chat] WebSocket chat service running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Chat] Received SIGTERM signal, shutting down...')
  httpServer.close(() => {
    console.log('[Chat] Chat service closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[Chat] Received SIGINT signal, shutting down...')
  httpServer.close(() => {
    console.log('[Chat] Chat service closed')
    process.exit(0)
  })
})
