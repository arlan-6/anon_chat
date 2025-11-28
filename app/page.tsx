"use client";

import { ChatLayout } from "@/components/chat/ChatLayout";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";

export default function Home() {
  const { messages, sendMessage, username } = useChat();

  return (
    <ChatLayout>
      <MessageList messages={messages} currentUsername={username} />
      <ChatInput onSendMessage={sendMessage} />
    </ChatLayout>
  );
}
