'use client';

import React, { useEffect, useState } from 'react';
import { Conversation } from '../types/message';
import { getConversations } from '../services/messaging';
import styles from './conversationsList.module.css';

interface Props { onSelect: (c: Conversation)=>void; selectedId?: string }

const ConversationsList = ({ onSelect, selectedId }: Props) => {
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let mounted = true;
    getConversations().then(cs=>{ if(mounted){ setItems(cs); setLoading(false);} });
    return ()=>{ mounted=false; };
  },[]);

  return (
    <div className={styles.listContainer}>
      {loading? <div className={styles.placeholder}>Cargando conversaciones...</div> : (
        items.map(c=> (
          <div key={c.id} className={`${styles.item} ${c.id===selectedId?styles.active:''}`} onClick={()=>onSelect(c)}>
            <div className={styles.title}>{c.title}</div>
            <div className={styles.last}>{c.lastMessage}</div>
            {c.unreadCount? <div className={styles.badge}>{c.unreadCount}</div> : null}
          </div>
        ))
      )}
    </div>
  );
}

export default ConversationsList;
