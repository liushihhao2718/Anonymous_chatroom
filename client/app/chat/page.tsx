'use client';

import chat from './chat.module.css';
import compose from './compose.module.css';
import { useSocket } from '../socket';
import { useEffect, useState, useCallback } from 'react';

export default function Home() {
  const socket = useSocket();
  const [messages, setMessage] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const onMessage = useCallback((message) => {
    console.log('message', message);
    setMessage([...messages, message]);
  }, [messages]);

  useEffect(() => {
    socket.on('message', onMessage);

    return () => {
      socket.off('message', onMessage);
    };
  }, [socket, onMessage]);

  const sendMessage = (newMessage: '') => {
    socket.emit('sendMessage', newMessage, (error) => {
      setNewMessage('');

      // Acknowledgement
      if (error) {
        return console.log(error);
      }
    });
  };
  return (
    <>
      <div className={chat.chat}>
        <div className={chat.chatMain}>
          <div className={chat.chatMessages}>
            {messages.map((x) => {
              return (
                <div className={chat.message} key={x.timestamp}>
                  <p>
                    <span className={chat.messageName}>{x.user}</span>
                    <span className={chat.messageMeta}>
                      {new Date(x.timestamp).toISOString()}
                    </span>
                  </p>
                  <p>{x.text}</p>
                </div>
              );
            })}
          </div>

          <div className={compose.compose}>
            <input
              name="message"
              placeholder="Enter message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={() => sendMessage(newMessage)}>Send</button>
          </div>
        </div>
      </div>
    </>
  );
}
