'use client';

import Image from 'next/image';
import styles from './page.module.css';
import React, { FormEvent, useState, useEffect } from 'react';
import { useSocket } from './socket';
import { useRouter } from 'next/navigation';
type JoinRoom = {
  nickname: string;
};
export default function Home() {
  const socket = useSocket();

  const router = useRouter();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const formJson: JoinRoom = Object.fromEntries(formData.entries());

    socket.emit('join', { nickname: formJson.nickname }, (error) => {
      if (error) {
        alert(error);
      }
      else {
        router.push('/chat');
      }
    });
  };

  return (
    <>
      <div className={styles.centeredForm}>
        <div className={styles.centeredForm__box}>
          <h1>Join Chat</h1>
          <form onSubmit={handleSubmit}>
            <label>Display name</label>
            <input
              type="text"
              name="nickname"
              placeholder="Display name"
              required
              autoComplete="false"
            />
            <button type="submit">Join</button>
          </form>
        </div>
      </div>
    </>
  );
}
