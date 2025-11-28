import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export type Message = {
    id: string;
    content: string;
    user_id: string | null;
    username: string;
    created_at: string;
};

export function useChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [username, setUsername] = useState<string>("");
    const [supabase] = useState(() => createClient());
    const messagesRef = useRef<Message[]>([]);

    // Keep ref in sync for deduplication in callbacks
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        // Load initial messages (last 50)
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) {
                console.error("Error fetching messages:", error);
            }

            if (data) {
                // Reverse to show oldest to newest
                setMessages(data.reverse());
            }
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel("realtime messages")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    // Check if we already have this message (optimistic update)
                    if (!messagesRef.current.some(m => m.id === newMessage.id)) {
                        setMessages((prev) => [...prev, newMessage]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        const currentUsername = username || `Anon-${Math.floor(Math.random() * 10000)}`;
        if (!username) setUsername(currentUsername);

        const id = crypto.randomUUID();
        const newMessage: Message = {
            id,
            content,
            user_id: null,
            username: currentUsername,
            created_at: new Date().toISOString(),
        };

        // Optimistic update
        setMessages((prev) => [...prev, newMessage]);

        const { error } = await supabase.from("messages").insert(newMessage);

        if (error) {
            console.error("Error sending message:", error);
            // Rollback if error (optional, but good practice)
            setMessages((prev) => prev.filter(m => m.id !== id));
            alert("Failed to send message");
        }
    };

    return {
        messages,
        sendMessage,
        username,
        setUsername,
    };
}
