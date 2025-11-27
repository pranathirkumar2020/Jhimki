"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { Loader2, ArrowUp } from "lucide-react";
import { UIMessage } from "ai";
import { useEffect, useState, useRef } from "react";
import { AI_NAME, OWNER_NAME, CLEAR_CHAT_TEXT, WELCOME_MESSAGE } from "@/config";
import Image from "next/image";
import Link from "next/link";

/* ---------------------- Form Schema ---------------------- */
const formSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message must be at most 2000 characters."),
});

/* ---------------------- Storage Keys ---------------------- */
const STORAGE_KEY = "chat-messages";

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

const loadMessagesFromStorage = (): StorageData => {
  if (typeof window === "undefined") return { messages: [], durations: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { messages: [], durations: {} };

    const parsed = JSON.parse(stored);
    return {
      messages: parsed.messages || [],
      durations: parsed.durations || {},
    };
  } catch (error) {
    console.error("Failed to load messages:", error);
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (
  messages: UIMessage[],
  durations: Record<string, number>
) => {
  if (typeof window === "undefined") return;
  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save messages:", error);
  }
};

/* ---------------------- Main Component ---------------------- */
export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeShownRef = useRef(false);

  const stored = typeof window !== "undefined"
    ? loadMessagesFromStorage()
    : { messages: [], durations: {} };

  const [initialMessages] = useState<UIMessage[]>(stored.messages);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: initialMessages,
  });

  /* Load on mount */
  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations);
    setMessages(stored.messages);
  }, []);

  /* Save to storage on change */
  useEffect(() => {
    if (isClient) {
      saveMessagesToStorage(messages, durations);
    }
  }, [messages, durations, isClient]);

  /* Show welcome message */
  useEffect(() => {
    if (isClient && initialMessages.length === 0 && !welcomeShownRef.current) {
      const welcomeMessage: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        parts: [
          {
            type: "text",
            text: WELCOME_MESSAGE,
          },
        ],
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage], {});
      welcomeShownRef.current = true;
    }
  }, [isClient, initialMessages, setMessages]);

  /* Handle timings */
  const handleDurationChange = (key: string, duration: number) => {
    setDurations((prev) => ({ ...prev, [key]: duration }));
  };

  /* Form Setup */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    sendMessage({ text: data.message });
    form.reset();
  };

  /* Clear Chat */
  const clearChat = () => {
    setMessages([]);
    setDurations({});
    saveMessagesToStorage([], {});
    toast.success("Chat cleared");
  };

  /* ---------------------- UI ---------------------- */

  return (
    <div className="flex h-screen items-center justify-center bg-[#FAF5EF] font-sans">
      <div className="w-full max-w-4xl h-[90vh] bg-white border border-[#C9B8A8] rounded-3xl shadow-lg flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="w-full border-b border-[#C9B8A8] p-6 flex flex-col items-center">
          <Image src="/logo.png" width={60} height={60} alt="Logo" />
          <h1 className="mt-2 text-xl font-semibold text-[#6B4F3F]">
            Jhimki Stock Assistant
          </h1>
          <Button
            variant="outline"
            className="absolute right-6 top-6 text-xs border-[#C9B8A8]"
            onClick={clearChat}
          >
            {CLEAR_CHAT_TEXT}
          </Button>
        </div>

        {/* ASSISTANT BUBBLE */}
        <div className="p-6">
          <div className="inline-block bg-[#F5ECE4] text-[#6B4F3F] px-4 py-2 rounded-xl shadow-sm">
            Hello, I'm <b>Jhimki Assistant</b>
          </div>
        </div>

        {/* LARGE GREETING */}
        <div className="px-6 -mt-4">
          <h2 className="text-2xl font-semibold text-[#6B4F3F]">Hello, I'm Jhimki Assistant</h2>
          <p className="text-[#8B6E59] mb-4">How can I help you?</p>
        </div>

        {/* PRODUCT CARDS LIKE YOUR IMAGE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 pb-4 overflow-y-auto">

          {/* CARD 1 */}
          <div className="border border-[#E6D9CE] rounded-xl p-4 bg-white shadow-sm">
            <h3 className="font-semibold text-[#6B4F3F]">Chanderi Suit – Emerald Floral</h3>
            <p><b>Color:</b> Emerald</p>
            <p><b>Fabric:</b> Chanderi</p>
            <p><b>Technique:</b> Handwoven</p>
            <p><b>Pattern:</b> Floral</p>
            <p className="text-sm text-muted mt-2">
              Three-piece chanderi suit set crafted in chanderi with hand-woven work in emerald tones.
            </p>
          </div>

          {/* CARD 2 */}
          <div className="border border-[#E6D9CE] rounded-xl p-4 bg-white shadow-sm">
            <h3 className="font-semibold text-[#6B4F3F]">Chanderi Dupatta – Emerald</h3>
            <p><b>Color:</b> Emerald</p>
            <p><b>Fabric:</b> Chanderi</p>
            <p><b>Technique:</b> Handwoven</p>
            <p><b>Pattern:</b> Border</p>
            <p className="text-sm text-muted mt-2">
              Lightweight chanderi dupatta in emerald with border patterns.
            </p>
          </div>

          {/* CARD 3 */}
          <div className="border border-[#E6D9CE] rounded-xl p-4 bg-white shadow-sm">
            <h3 className="font-semibold text-[#6B4F3F]">Chanderi Suit – Steel Solid</h3>
            <p><b>Color:</b> Steel Grey</p>
            <p><b>Fabric:</b> Chanderi</p>
            <p><b>Technique:</b> Handwoven</p>
            <p><b>Pattern:</b> Solid</p>
            <p className="text-sm text-muted mt-2">
              Three-piece chanderi suit set crafted in steel grey tones.
            </p>
          </div>

        </div>

        {/* MESSAGE BOX */}
        <div className="mt-auto border-t border-[#C9B8A8] p-4 bg-white">
          <form className="w-full flex" onSubmit={form.handleSubmit(onSubmit)}>
            <Input
              {...form.register("message")}
              placeholder="What are you looking for today?"
              className="flex-1 bg-[#F7F2ED] border-[#D7C7BA] rounded-full px-5 py-3"
            />
            <Button type="submit" className="ml-3 rounded-full bg-[#6B4F3F] hover:bg-[#5A4335]">
              <ArrowUp className="w-4 h-4" />
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}
