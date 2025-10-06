'use client';

import React from 'react';
import styles from './messageBubble.module.css';
import { Message } from '../types/message';

interface Props { message: Message; currentUserId: string }

const MessageBubble = ({ message, currentUserId }: Props) => {
  const isMe = message.senderId === currentUserId;
  return (
    <div className={`${styles.bubble} ${isMe?styles.me:styles.they}`}>
      <div className={styles.text}>{message.text}</div>
      <div className={styles.meta}>{new Date(message.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} {isMe? (message.status === 'sending' ? '⏳' : '✓') : ''}</div>
    </div>
  );
};

export default MessageBubble;
