import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  created_at: string;
  messages: Message[];
}

export const ConversationsSection: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all conversations
  useEffect(() => {
    fetch("/api/conversations/")
      .then((r) => r.json())
      .then(setConversations);
  }, []);

  // Fetch messages if a conversation is selected
  useEffect(() => {
    if (selectedId) {
      fetch(`/api/conversations/${selectedId}/messages`)
        .then((r) => r.json())
        .then(setMessages);
    } else {
      setMessages([]);
    }
  }, [selectedId]);

  const startConversation = async () => {
    setLoading(true);
    const res = await fetch("/api/conversations/", { method: "POST" });
    const conv = await res.json();
    setConversations((prev) => [conv, ...prev]);
    setSelectedId(conv.id);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedId) return;
    setLoading(true);
    await fetch(`/api/conversations/${selectedId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "user", text: input }),
    });
    setInput("");
    // reload messages
    fetch(`/api/conversations/${selectedId}/messages`)
      .then((r) => r.json())
      .then(setMessages);
    setLoading(false);
  };

  return (
    <section className="w-full max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Conversazioni Chatbot</h2>
      <div className="flex gap-6">
        {/* Lista conversazioni */}
        <aside className="w-1/3 border rounded p-2 bg-zinc-50 dark:bg-zinc-900">
          <Button onClick={startConversation} disabled={loading} className="mb-2 w-full">
            Nuova conversazione
          </Button>
          <ul className="space-y-2">
            {conversations.map((c) => (
              <li key={c.id}>
                <Button
                  variant={selectedId === c.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedId(c.id)}
                >
                  {c.id} - {new Date(c.created_at).toLocaleString()}
                </Button>
              </li>
            ))}
          </ul>
        </aside>
        {/* Dettaglio conversazione */}
        <main className="flex-1 border rounded p-4 flex flex-col bg-white dark:bg-zinc-800 min-h-[400px]">
          {selectedId ? (
            <>
              <div className="flex-1 overflow-y-auto mb-4">
                {messages.length === 0 ? (
                  <p className="text-zinc-400">Nessun messaggio</p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`mb-2 ${m.sender === "user" ? "text-right" : "text-left"}`}>
                      <span
                        className={`inline-block px-3 py-2 rounded-lg ${
                          m.sender === "user"
                            ? "bg-blue-500 text-white ml-auto"
                            : "bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white"
                        }`}
                      >
                        {m.text}
                      </span>
                      <div className="text-xs text-zinc-400 mt-1">
                        {new Date(m.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 mt-auto">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Scrivi un messaggio..."
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  disabled={loading}
                />
                <Button onClick={sendMessage} disabled={loading || !input.trim()}>
                  Invia
                </Button>
              </div>
            </>
          ) : (
            <p className="text-zinc-400">Seleziona una conversazione</p>
          )}
        </main>
      </div>
    </section>
  );
};

export default ConversationsSection;
