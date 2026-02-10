import React, { useEffect, useState, useRef } from "react";
import {
  Send,
  Smile,
  Info,
  MoreVertical,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setMessages, setSelectedUser } from "../store/slices/chatSlice";
import { getSocket } from "../lib/socket";
import { api } from "../lib/axios";
import { User, Message } from "../types";
import { formatDistanceToNow } from "date-fns";
const EmojiPicker = React.lazy(() => import("emoji-picker-react"));
import { EmojiClickData, Theme } from "emoji-picker-react";

interface ChatWindowProps {
  selectedUser: User | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUser }) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.chat.messages);
  const typingUsers = useAppSelector((state) => state.chat.typingUsers);
  const [messageInput, setMessageInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      setMessageInput("");
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser]);

  const fetchMessages = async (): Promise<void> => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const response = await api.get<{ messages: Message[] }>(
        `/messages/${selectedUser.id}`,
      );
      dispatch(
        setMessages({
          userId: selectedUser.id,
          messages: response.data.messages,
        }),
      );
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e?: React.FormEvent): void => {
    e?.preventDefault();

    if (!messageInput.trim() || !selectedUser) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit("message:send", {
      receiverId: selectedUser.id,
      content: messageInput.trim(),
    });

    setMessageInput("");
    handleStopTyping();
  };

  const handleTyping = (): void => {
    if (!selectedUser) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit("typing:start", { receiverId: selectedUser.id });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = (): void => {
    if (!selectedUser) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit("typing:stop", { receiverId: selectedUser.id });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const getInitials = (username: string): string => {
    return username.substring(0, 2).toUpperCase();
  };

  const formatTime = (date: Date): string => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  if (!selectedUser) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-bg-primary text-center">
        <div className="animate-bounce rounded-full bg-bg-secondary p-8 text-primary shadow-2xl">
          <MessageSquare size={64} />
        </div>
        <h2 className="mt-8 text-3xl font-bold text-text-primary">
          Your Conversations
        </h2>
        <p className="mt-4 max-w-sm text-text-secondary">
          Choose a user from the sidebar to start a real-time conversation and
          share your thoughts.
        </p>
      </div>
    );
  }

  const currentMessages = messages[selectedUser.id] || [];
  const isTyping = typingUsers.includes(selectedUser.id);

  return (
    <div className="flex h-screen w-full flex-col bg-bg-primary">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-border-primary bg-bg-secondary/50 px-4 py-4 backdrop-blur-md lg:px-6">
        <div className="flex items-center gap-2 lg:gap-4">
          <button
            onClick={() => dispatch(setSelectedUser(null))}
            className="rounded-full p-2 text-text-tertiary transition-colors hover:bg-bg-hover hover:text-primary lg:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-base font-bold text-white shadow-lg lg:h-12 lg:w-12 lg:text-lg">
              {getInitials(selectedUser.username)}
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-bg-secondary ${
                selectedUser.isOnline
                  ? "animate-pulse bg-success"
                  : "bg-text-tertiary"
              }`}
            ></div>
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              {selectedUser.username}
            </h3>
            <p className="text-xs text-text-secondary">
              {selectedUser.isOnline
                ? "Active now"
                : `Last active ${formatTime(selectedUser.lastSeen)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-full p-2 text-text-tertiary transition-colors hover:bg-bg-hover hover:text-primary">
            <Info size={20} />
          </button>
          <button className="rounded-full p-2 text-text-tertiary transition-colors hover:bg-bg-hover hover:text-primary">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar space-y-6">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-md"></div>
            <p className="text-sm font-medium text-text-tertiary">
              Loading messages...
            </p>
          </div>
        ) : currentMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
            <div className="mb-4 rounded-full bg-bg-secondary p-6 text-text-tertiary">
              <MessageSquare size={48} />
            </div>
            <p className="text-base font-medium text-text-secondary">
              No messages yet
            </p>
            <p className="text-sm text-text-tertiary">
              Say hi to get the conversation started!
            </p>
          </div>
        ) : (
          currentMessages.map((message) => {
            const isSentByMe = message.sender.id === currentUser?.id;
            return (
              <div
                key={message.id}
                className={`flex w-full animate-fadeIn ${isSentByMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[70%] space-y-1 rounded-2xl px-5 py-3 shadow-lg ${
                    isSentByMe
                      ? "bg-gradient-to-br from-primary to-primary-dark text-white rounded-tr-none"
                      : "bg-bg-secondary text-text-primary rounded-tl-none border border-border-primary"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <div
                    className={`text-[10px] font-medium opacity-70 ${
                      isSentByMe ? "text-white" : "text-text-tertiary"
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-center gap-3 animate-fadeIn">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-secondary text-xs font-bold text-text-secondary border border-border-primary">
              {getInitials(selectedUser.username)}
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-bg-secondary px-4 py-2 border border-border-primary">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border-primary bg-bg-secondary/50 p-6 backdrop-blur-md">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <div className="relative flex-shrink-0" ref={emojiPickerRef}>
            <button
              type="button"
              className={`rounded-full p-2.5 transition-all duration-200 ${
                showEmojiPicker
                  ? "bg-primary text-white"
                  : "bg-bg-tertiary text-text-tertiary hover:bg-bg-hover hover:text-primary"
              }`}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile size={24} />
            </button>
            <div
              className={`absolute bottom-full left-0 mb-4 transition-all duration-300 ${
                showEmojiPicker
                  ? "translate-y-0 opacity-100 visible"
                  : "translate-y-8 opacity-0 invisible"
              }`}
            >
              <React.Suspense fallback={null}>
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme={Theme.DARK}
                  lazyLoadEmojis={true}
                  autoFocusSearch={false}
                />
              </React.Suspense>
            </div>
          </div>

          <div className="relative flex-1">
            <textarea
              rows={1}
              className="input max-h-32 min-h-[48px] w-full resize-none py-3 pr-12 custom-scrollbar"
              placeholder="Type your message here..."
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                if (e.target.value.trim()) {
                  handleTyping();
                } else {
                  handleStopTyping();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              onBlur={handleStopTyping}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary h-[48px] w-[48px] flex-shrink-0 rounded-full p-0 shadow-xl transition-all duration-200 enabled:hover:scale-110 active:scale-95"
            disabled={!messageInput.trim()}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
