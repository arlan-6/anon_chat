import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

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
    const [onlineCount, setOnlineCount] = useState(0);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const channelRef = useRef<RealtimeChannel | null>(null);

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

        // Generate a random username if not set
        const currentUsername = username || `Anon-${Math.floor(Math.random() * 10000)}`;
        if (!username) setUsername(currentUsername);

        // Subscribe to new messages and presence
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
            .on("presence", { event: "sync" }, () => {
                const newState = channel.presenceState();
                setOnlineCount(Object.keys(newState).length);
            })
            .on("broadcast", { event: "typing" }, (payload) => {
                const { username: typingUser, isTyping } = payload.payload;
                if (typingUser === currentUsername) return; // Ignore self

                setTypingUsers((prev) => {
                    if (isTyping) {
                        return prev.includes(typingUser) ? prev : [...prev, typingUser];
                    } else {
                        return prev.filter((u) => u !== typingUser);
                    }
                });
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({
                        online_at: new Date().toISOString(),
                        username: currentUsername,
                    });
                }
            });

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, username]); // Added username to dependencies to re-run if it changes

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        // Command Parser
        if (content.startsWith("/")) {
            const [command, ...args] = content.slice(1).split(" ");

            switch (command.toLowerCase()) {
                case "clear":
                    setMessages([]);
                    return;

                case "nick":
                    const newNick = args.join(" ");
                    if (newNick) {
                        setUsername(newNick);
                        // Re-track presence with new name
                        channelRef.current?.track({
                            online_at: new Date().toISOString(),
                            username: newNick,
                        });

                        // Optional: Add system message
                        setMessages(prev => [...prev, {
                            id: crypto.randomUUID(),
                            content: `Nickname changed to ${newNick}`,
                            user_id: "system",
                            username: "System",
                            created_at: new Date().toISOString()
                        }]);
                    }
                    return;

                case "shrug":
                    content = `${args.join(" ")} ¯\\_(ツ)_/¯`;
                    break; // Continue to send message

                case "help":
                    setMessages(prev => [...prev, {
                        id: crypto.randomUUID(),
                        content: "Commands: /clear, /nick <name>, /shrug, /help",
                        user_id: "system",
                        username: "System",
                        created_at: new Date().toISOString()
                    }]);
                    return;

                default:
                    // Unknown command, just send as text or warn? 
                    // Let's just send as text for now or do nothing.
                    break;
            }
        }

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

    const sendTypingEvent = (isTyping: boolean) => {
        channelRef.current?.send({
            type: "broadcast",
            event: "typing",
            payload: { username, isTyping },
        });
    };

    return {
        messages,
        sendMessage,
        username,
        setUsername,
        onlineCount,
        typingUsers,
        sendTypingEvent,
    };
}
