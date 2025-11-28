import { useEffect, useRef, memo } from "react";
import { Message } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageListProps {
    messages: Message[];
    currentUsername: string;
    typingUsers?: string[];
}

export const MessageList = memo(function MessageList({ messages, currentUsername, typingUsers = [] }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typingUsers]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((message) => {
                const isOwn = message.username === currentUsername;
                const isSystem = message.user_id === "system";

                if (isSystem) {
                    return (
                        <div key={message.id} className="flex justify-center my-4">
                            <span className="bg-muted/50 text-muted-foreground text-xs py-1 px-3 rounded-full">
                                {message.content}
                            </span>
                        </div>
                    );
                }

                return (
                    <div
                        key={message.id}
                        className={cn(
                            "flex gap-3 max-w-[85%] md:max-w-[75%]",
                            isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <img
                                src={`https://api.dicebear.com/9.x/bottts/svg?seed=${message.username}`}
                                alt={message.username}
                                className="w-8 h-8 rounded-full bg-muted border"
                            />
                        </div>

                        <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
                            {/* <span className="text-xs text-muted-foreground mb-1 px-1">
                                {message.username}
                            </span> */}
                            <div
                                className={cn(
                                    "rounded-lg px-4 py-2 text-sm prose prose-sm dark:prose-invert max-w-none break-words",
                                    isOwn
                                        ? "bg-primary text-primary-foreground prose-p:text-primary-foreground prose-a:text-primary-foreground"
                                        : "bg-muted text-foreground"
                                )}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
                <div className="text-xs text-muted-foreground italic px-4 animate-pulse">
                    {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
});
