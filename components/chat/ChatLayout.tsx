import { ReactNode, useEffect, useState } from "react";

interface ChatLayoutProps {
    children: ReactNode;
    onlineCount: number;
    typingUsers: string[];
}

const SINGLE_PHRASES = [
    "Someone is typing...",
    "A ghost is typing...",
    "Secrets are being typed...",
    "Furious typing detected...",
    "Something is happening...",
    "Words are forming...",
    "A message is incoming...",
];

const MULTIPLE_PHRASES = [
    "Multiple people are typing...",
    "It's getting loud in here...",
    "Everyone has something to say...",
    "Chaos is brewing...",
    "So much typing...",
];

export function ChatLayout({ children, onlineCount, typingUsers }: ChatLayoutProps) {
    const [typingText, setTypingText] = useState<string | null>(null);

    useEffect(() => {
        if (typingUsers.length === 0) {
            setTypingText(null);
            return;
        }

        const phrases = typingUsers.length === 1 ? SINGLE_PHRASES : MULTIPLE_PHRASES;
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        setTypingText(randomPhrase);
    }, [typingUsers.length]);

    return (
        <div className="flex h-dvh w-full bg-background flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="flex items-center justify-between border-b p-4 md:hidden">
                <h1 className="text-lg font-bold">AnonChat</h1>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        {onlineCount} online
                    </span>
                    {typingText && (
                        <span className="text-xs text-muted-foreground italic animate-pulse">
                            {typingText}
                        </span>
                    )}
                </div>
            </header>

            {/* Sidebar - Hidden on mobile */}
            <aside className="hidden w-64 border-r bg-muted/40 p-4 md:block">
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h1 className="text-xl font-bold">AnonChat</h1>
                    </div>
                    <div className="flex-1 py-4 space-y-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                {onlineCount} online
                            </div>
                            {typingText && (
                                <span className="text-xs text-muted-foreground italic animate-pulse">
                                    {typingText}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Welcome to the anonymous chat. Messages are real-time.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {children}
            </main>
        </div>
    );
}
