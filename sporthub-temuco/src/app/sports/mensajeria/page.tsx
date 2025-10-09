'use client';

import React, { useState } from 'react';
import ConversationsList from '../../../components/ConversationsList';
import ChatWindow from '../../../components/ChatWindow';
import Sidebar from '../../../components/layout/Sidebar';
import styles from './mensajeria.module.css';

export default function MensajeriaPage(){
  const [selected, setSelected] = useState<any>(null);
  // current user id hardcoded for mock
  const currentUserId = 'u1';

  return (
    <div className={styles.pageWrapper}>
      <Sidebar userRole={'usuario'} />
      <div className={styles.pageContainer}>
        <div className={styles.sidebarColumn}><ConversationsList onSelect={(c:any)=>setSelected(c)} selectedId={selected?.id} /></div>
        <div className={styles.chatColumn}><ChatWindow conversation={selected} currentUserId={currentUserId} /></div>
      </div>
    </div>
  );
}
