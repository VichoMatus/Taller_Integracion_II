import { Conversation, Message } from '../types/message';

// Mock data
let conversations: Conversation[] = [
  {
    id: 'c1',
    title: 'Amigos - Futbol',
    participants: ['u1', 'u2'],
    lastMessage: 'Nos vemos a las 18:00',
    unreadCount: 1,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'c2',
    title: 'Equipo Basquetbol',
    participants: ['u1', 'u3'],
    lastMessage: 'Buen partido!',
    unreadCount: 0,
    updatedAt: new Date().toISOString()
  }
];

let messages: Message[] = [
  { id: 'm1', conversationId: 'c1', senderId: 'u2', text: 'Hola! Listo para hoy?', createdAt: new Date(Date.now()-1000*60*60).toISOString(), status: 'sent' },
  { id: 'm2', conversationId: 'c1', senderId: 'u1', text: 'Sí, a las 18', createdAt: new Date(Date.now()-1000*60*55).toISOString(), status: 'sent' },
  { id: 'm3', conversationId: 'c2', senderId: 'u3', text: 'Gran día para entrenar', createdAt: new Date(Date.now()-1000*60*30).toISOString(), status: 'sent' }
];

export const getConversations = async (): Promise<Conversation[]> => {
  // simulate latency
  await new Promise((r) => setTimeout(r, 300));
  return conversations.slice().sort((a,b)=> new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  await new Promise((r) => setTimeout(r, 250));
  return messages.filter(m => m.conversationId === conversationId).sort((a,b)=> new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const sendMessage = async (conversationId: string, senderId: string, text: string): Promise<Message> => {
  // optimistic: create a message with status sending and then mark as sent
  const msg: Message = {
    id: `m_${Math.random().toString(36).slice(2,9)}`,
    conversationId,
    senderId,
    text,
    createdAt: new Date().toISOString(),
    status: 'sending'
  };
  messages.push(msg);
  // update conversation
  const conv = conversations.find(c=>c.id===conversationId);
  if (conv) { conv.lastMessage = text; conv.updatedAt = new Date().toISOString(); conv.unreadCount = (conv.unreadCount||0); }

  // simulate network
  await new Promise((r)=> setTimeout(r, 800));
  // mark as sent
  msg.status = 'sent';
  return msg;
};

export const mockIncomingMessage = (conversationId: string, senderId: string, text: string) => {
  const msg: Message = {
    id: `m_${Math.random().toString(36).slice(2,9)}`,
    conversationId,
    senderId,
    text,
    createdAt: new Date().toISOString(),
    status: 'sent'
  };
  messages.push(msg);
  const conv = conversations.find(c=>c.id===conversationId);
  if (conv) { conv.lastMessage = text; conv.updatedAt = new Date().toISOString(); conv.unreadCount = (conv.unreadCount||0)+1; }
};
