import { ReactNode } from "react";

interface ChatLayoutProps {
    children: ReactNode;
    onlineCount: number;
}

export function ChatLayout({ children, onlineCount }: ChatLayoutProps) {
    return (
        <div className="flex h-dvh w-full bg-background flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="flex items-center justify-between border-b p-4 md:hidden">
                <h1 className="text-lg font-bold">AnonChat</h1>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {onlineCount} online
                </span>
            </header>

            {/* Sidebar - Hidden on mobile */}
            <aside className="hidden w-64 border-r bg-muted/40 p-4 md:block">
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h1 className="text-xl font-bold">AnonChat</h1>
                    </div>
                    <div className="flex-1 py-4 space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            {onlineCount} online
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
