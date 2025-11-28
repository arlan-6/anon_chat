import { useState, KeyboardEvent, useEffect } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
    onSendMessage: (content: string) => void;
    onTyping?: (isTyping: boolean) => void;
    disabled?: boolean;
}

export function ChatInput({ onSendMessage, onTyping, disabled }: ChatInputProps) {
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isTyping) {
                setIsTyping(false);
                onTyping?.(false);
            }
        }, 1000);

        return () => clearTimeout(timeout);
    }, [input, isTyping, onTyping]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        if (!isTyping) {
            setIsTyping(true);
            onTyping?.(true);
        }
    };

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input);
            setInput("");
            setIsTyping(false);
            onTyping?.(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t bg-background p-4">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-base md:text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={disabled}
                />
                <button
                    onClick={handleSend}
                    disabled={disabled || !input.trim()}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 w-9"
                >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                </button>
            </div>
        </div>
    );
}
