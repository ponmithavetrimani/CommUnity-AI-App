import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
const COLORS = {
  bg: "#F8F5F6",
  surface: "#FFFFFF",
  heroFrom: "#4A0E2A",
  heroTo: "#8B1E4A",
  primary: "#7A1B41",
  primarySoft: "#FBEAF0",
  textPrimary: "#20141C",
  textSecondary: "#8A7C86",
  success: "#12B76A",
  successSoft: "#E7F9EF",
  sos: "#D6295E",
  bubbleReceived: "#FFFFFF",
  bubbleSent: "#7A1B41",
};

type ChatMessage = {
  id: string;
  from: "me" | "buddy";
  text: string;
  time: number;
};

export default function ChatPage() {
  const { buddyName, journeyId } = useLocalSearchParams();
  const buddy = String(buddyName || "Priya R.");
  const chatKey = String(journeyId || buddy).replace(/\s+/g, "_");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ===== load existing conversation (server first, cached fallback) =====
  useEffect(() => {
    loadMessages();

    // poll for buddy replies coming from the server every 4s
    pollRef.current = setInterval(loadMessages, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const loadMessages = async () => {
    try {
      const response = await api.get(`/messages`, { params: { chatKey } });
      const serverMessages: ChatMessage[] = response.data || [];
      if (serverMessages.length > 0) {
        setMessages(serverMessages);
        await AsyncStorage.setItem(`chat_${chatKey}`, JSON.stringify(serverMessages));
        return;
      }
    } catch (e) {
      console.log("Chat fetch failed, using local cache:", e);
    }

    // fallback: local cache, or a friendly opening message on first run
    try {
      const cached = await AsyncStorage.getItem(`chat_${chatKey}`);
      if (cached) {
        setMessages(JSON.parse(cached));
      } else {
        const seed: ChatMessage[] = [
          {
            id: "seed-1",
            from: "buddy",
            text: `Hi 👋 I'm ${buddy.split(" ")[0]}, connected and ready to travel safely with you.`,
            time: Date.now(),
          },
        ];
        setMessages(seed);
        await AsyncStorage.setItem(`chat_${chatKey}`, JSON.stringify(seed));
      }
    } catch (e) {
      console.log("Local chat cache failed:", e);
    }
  };

  const persist = async (updated: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(`chat_${chatKey}`, JSON.stringify(updated));
    } catch (e) {
      console.log("Chat persist failed:", e);
    }
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    const newMessage: ChatMessage = {
      id: `${Date.now()}`,
      from: "me",
      text,
      time: Date.now(),
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    setDraft("");
    persist(updated);
    setSending(true);

    try {
      await api.post("/messages", { chatKey, ...newMessage });
    } catch (e) {
      console.log("Send failed, message kept locally:", e);
    }

    // simulate buddy reply if the backend doesn't push one back in time
    setTimeout(async () => {
      const replies = [
        "Got it, thanks for the update!",
        "All good on my side too 🙂",
        "Sure, let's stay on this route.",
        "Okay, I'll keep an eye on the map.",
      ];
      const buddyReply: ChatMessage = {
        id: `${Date.now()}-buddy`,
        from: "buddy",
        text: replies[Math.floor(Math.random() * replies.length)],
        time: Date.now(),
      };
      setMessages((prev) => {
        const next = [...prev, buddyReply];
        persist(next);
        return next;
      });
      setSending(false);
    }, 1200 + Math.random() * 900);
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const initial = buddy?.trim()?.[0]?.toUpperCase() || "B";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* ================= HEADER ================= */}
        <LinearGradient
          colors={[COLORS.heroFrom, COLORS.heroTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heading}>{buddy}</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.subHeading}>Secure chat · Connected</Text>
              </View>
            </View>
            <Ionicons name="shield-checkmark" size={20} color="#FFF" />
          </View>
        </LinearGradient>

        {/* ================= STATUS STRIP ================= */}
        <View style={styles.statusCard}>
          <View style={styles.statusItem}>
            <View style={[styles.statusIconWrap, { backgroundColor: COLORS.successSoft }]}>
              <Ionicons name="lock-closed-outline" size={14} color={COLORS.success} />
            </View>
            <Text style={styles.statusText}>Secure</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusIconWrap, { backgroundColor: COLORS.primarySoft }]}>
              <Ionicons name="eye-off-outline" size={14} color={COLORS.primary} />
            </View>
            <Text style={styles.statusText}>Number hidden</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusIconWrap, { backgroundColor: "#E7F1FE" }]}>
              <Ionicons name="locate-outline" size={14} color="#2563EB" />
            </View>
            <Text style={styles.statusText}>Live tracking</Text>
          </View>
        </View>

        {/* ================= MESSAGES ================= */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={{ paddingBottom: 10, paddingTop: 4 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m) => (
            <View
              key={m.id}
              style={m.from === "me" ? styles.sentMessage : styles.receivedMessage}
            >
              <Text style={m.from === "me" ? styles.sentMessageText : styles.messageText}>
                {m.text}
              </Text>
              <Text style={m.from === "me" ? styles.sentTimeText : styles.timeText}>
                {formatTime(m.time)}
              </Text>
            </View>
          ))}
          {sending && (
            <View style={styles.receivedMessage}>
              <Text style={styles.messageText}>typing...</Text>
            </View>
          )}
        </ScrollView>

        {/* ================= INPUT ================= */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textSecondary}
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />

          <TouchableOpacity style={styles.sendButtonWrap} onPress={sendMessage}>
            <LinearGradient
              colors={[COLORS.heroFrom, COLORS.heroTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButton}
            >
              <Ionicons name="send" size={18} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // ================= HEADER =================
  header: {
    paddingTop: 55,
    paddingHorizontal: 22,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },

  avatarText: { color: "#FFF", fontWeight: "800", fontSize: 17 },

  heading: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },

  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ADE80",
  },

  subHeading: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "600",
  },

  // ================= STATUS STRIP =================
  statusCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: -16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  statusItem: {
    alignItems: "center",
    gap: 6,
  },

  statusIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  statusText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },

  // ================= MESSAGES =================
  chatArea: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 14,
  },

  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.bubbleReceived,
    padding: 14,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    marginBottom: 14,
    maxWidth: "80%",
    shadowColor: "#5A3A46",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.bubbleSent,
    padding: 14,
    borderRadius: 18,
    borderTopRightRadius: 4,
    marginBottom: 14,
    maxWidth: "80%",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  messageText: {
    color: COLORS.textPrimary,
    fontSize: 14.5,
  },

  sentMessageText: {
    color: "#FFF",
    fontSize: 14.5,
  },

  timeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 6,
    alignSelf: "flex-end",
  },

  sentTimeText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    marginTop: 6,
    alignSelf: "flex-end",
  },

  // ================= INPUT =================
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 25,
    paddingTop: 10,
    alignItems: "center",
    gap: 12,
  },

  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 22,
    fontSize: 14.5,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  sendButtonWrap: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
});