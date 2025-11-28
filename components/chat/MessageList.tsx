import { useEffect, useRef, memo } from "react";
import { Message } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

interface MessageListProps {
    messages: Message[];
    currentUsername: string;
}

export const MessageList = memo(function MessageList({ messages, currentUsername }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
                const isOwn = message.username === currentUsername;
                return (
                    <div
                        key={message.id}
                        className={cn(
                            "flex flex-col max-w-[85%] md:max-w-[75%]",
                            isOwn ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                    >
                        {/* don't need username */}
                        {/* <span className="text-xs text-muted-foreground mb-1 px-1">
                            {message.username}
                        </span> */}
                        <div
                            className={cn(
                                "rounded-lg px-4 py-2 text-sm",
                                isOwn
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground"
                            )}
                        >
                            {message.content}
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
});
