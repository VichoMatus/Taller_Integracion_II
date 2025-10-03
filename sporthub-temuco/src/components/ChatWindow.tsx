'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Conversation, Message } from '../types/message';
import { getMessages, sendMessage, mockIncomingMessage } from '../services/messaging';
import MessageBubble from './MessageBubble';
import styles from './chatWindow.module.css';

interface Props { conversation: Conversation | null; currentUserId: string }

const ChatWindow = ({ conversation, currentUserId }: Props) => {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    let mounted = true;
    if (!conversation) { setMsgs([]); return; }
    getMessages(conversation.id).then(ms=>{ if(mounted){ setMsgs(ms); setTimeout(()=> bottomRef.current?.scrollIntoView({behavior:'smooth'}),50) } });
    return ()=>{ mounted=false; };
  },[conversation]);

  const doSend = async ()=>{
    if (!conversation || !input.trim()) return;
    setSending(true);
    const optimistic = await sendMessage(conversation.id, currentUserId, input.trim());
    setMsgs((s)=>[...s, optimistic]);
    setInput('');
    setSending(false);
    // mock incoming reply after a delay
    setTimeout(()=> mockIncomingMessage(conversation.id, conversation.participants.find(p=>p!==currentUserId) || 'u2', 'Respuesta automática :)'), 1500);
    setTimeout(()=> getMessages(conversation.id).then(ms=> setMsgs(ms)), 2000);
    setTimeout(()=> bottomRef.current?.scrollIntoView({behavior:'smooth'}),100);
  };

  return (
    <div className={styles.container}>
      {!conversation? (
        <div className={styles.empty}>Selecciona una conversación</div>
      ) : (
        <>
          <div className={styles.header}><div className={styles.title}>{conversation.title}</div></div>
          <div className={styles.messages}>
            {msgs.map(m=> <MessageBubble key={m.id} message={m} currentUserId={currentUserId} />)}
            <div ref={bottomRef} />
          </div>
          <div className={styles.composer}>
            <input value={input} onChange={e=>setInput(e.target.value)} className={styles.input} placeholder="Escribe un mensaje..." />
            <button className={styles.send} onClick={doSend} disabled={sending || !input.trim()}>Enviar</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
