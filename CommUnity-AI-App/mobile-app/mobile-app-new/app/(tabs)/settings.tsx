import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// ================= DESIGN TOKENS =================
// Same maroon/wine system as HomePage — deep gradient hero, white cards,
// crimson reserved for destructive/urgent actions (logout, remove contact).
const COLORS = {
  bg: "#F8F5F6",
  surface: "#FFFFFF",
  heroFrom: "#4A0E2A",
  heroTo: "#8B1E4A",
  primary: "#7A1B41",
  primarySoft: "#FBEAF0",
  textPrimary: "#20141C",
  textSecondary: "#8A7C86",
  border: "#F1E9EC",
  danger: "#D6295E",
  dangerSoft: "#FDEAF0",
};

// Define types for props
interface CardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

interface SwitchRowProps {
  label: string;
  value: boolean;
  setValue: (value: boolean) => void;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

export default function SettingsPage() {
  const router = useRouter();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [journeyAlerts, setJourneyAlerts] = useState(true);
  const [buddyRequests, setBuddyRequests] = useState(true);

  const [liveLocation, setLiveLocation] = useState(true);
  const [voiceSOS, setVoiceSOS] = useState(true);
  const [inAppOnly, setInAppOnly] = useState(true);

  // ---- Emergency contacts: now a proper Name + Number list ----
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: "1", name: "", phone: "" },
  ]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [savingContacts, setSavingContacts] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Load previously saved contacts when the page opens.
  // (Old code never did this, so the fields always looked empty even after saving.)
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const stored = await AsyncStorage.getItem("emergencyContacts");
        if (stored) {
          const parsed = JSON.parse(stored);

          // Support both the old format ({ mother, father, friend })
          // and the new format ([{ id, name, phone }, ...])
          if (Array.isArray(parsed)) {
            if (parsed.length > 0) setContacts(parsed);
          } else if (parsed && typeof parsed === "object") {
            const migrated: EmergencyContact[] = [
              { id: "mother", name: "Mother", phone: parsed.mother || "" },
              { id: "father", name: "Father", phone: parsed.father || "" },
              { id: "friend", name: "Friend", phone: parsed.friend || "" },
            ].filter((c) => c.phone);
            if (migrated.length > 0) setContacts(migrated);
          }
        }
      } catch (error) {
        console.log("Load contacts error:", error);
      } finally {
        setLoadingContacts(false);
      }
    };
    loadContacts();
  }, []);

  const addContactRow = () => {
    setContacts((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", phone: "" },
    ]);
  };

  const removeContactRow = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const updateContact = (id: string, field: "name" | "phone", value: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const logoutUser = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await AsyncStorage.multiRemove(["user", "userProfile", "emergencyContacts"]);
      // Just replace the stack with /login — no dismissAll().
      // Calling dismissAll() right after replace() was throwing (there's nothing
      // left on the stack to dismiss once we've already replaced it), and that
      // error was getting silently swallowed by the catch block, so the button
      // looked like it did nothing.
      router.replace("/login");
    } catch (error) {
      console.log("Logout error:", error);
      Alert.alert("Logout failed", "Something went wrong. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogout = () => {
    // Alert.alert with multiple buttons doesn't render a real confirm
    // dialog on web — it silently no-ops in most setups, so the "Are you
    // sure?" popup (and therefore the onPress that triggers logoutUser)
    // never fires. Use the browser's native confirm() on web instead.
    if (Platform.OS === "web") {
      const confirmed = typeof window !== "undefined" && window.confirm("Are you sure you want to logout?");
      if (confirmed) {
        logoutUser();
      }
      return;
    }

    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logoutUser },
    ]);
  };

  const saveEmergencyContacts = async () => {
    // Keep only rows that actually have both a name and a number filled in
    const validContacts = contacts.filter(
      (c) => c.name.trim().length > 0 && c.phone.trim().length >= 10
    );

    if (validContacts.length === 0) {
      Alert.alert(
        "Add a contact",
        "Please add at least one contact with both a name and a valid phone number."
      );
      return;
    }

    setSavingContacts(true);
    try {
      await AsyncStorage.setItem("emergencyContacts", JSON.stringify(validContacts));
      Alert.alert("Success", "Emergency contacts saved successfully!");
    } catch (error) {
      console.log("Save contacts error:", error);
      Alert.alert("Error", "Failed to save contacts. Please try again.");
    } finally {
      setSavingContacts(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.heroFrom} barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ================= HERO HEADER ================= */}
        <LinearGradient
          colors={[COLORS.heroFrom, COLORS.heroTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerIconWrap}>
            <Ionicons name="settings-outline" size={22} color="#FFF" />
          </View>
          <Text style={styles.heading}>Settings</Text>
          <Text style={styles.subHeading}>Customize your safety experience</Text>
        </LinearGradient>

        {/* NOTIFICATIONS */}
        <Card title="Notifications" icon="notifications-outline">
          <SwitchRow
            label="Push Notifications"
            value={pushNotifications}
            setValue={setPushNotifications}
          />
          <SwitchRow
            label="Emergency Alerts"
            value={emergencyAlerts}
            setValue={setEmergencyAlerts}
          />
          <SwitchRow
            label="Journey Alerts"
            value={journeyAlerts}
            setValue={setJourneyAlerts}
          />
          <SwitchRow
            label="Buddy Requests"
            value={buddyRequests}
            setValue={setBuddyRequests}
          />
        </Card>

        {/* SAFETY */}
        <Card title="Safety Features" icon="shield-checkmark-outline">
          <SwitchRow
            label="Live Location Sharing"
            value={liveLocation}
            setValue={setLiveLocation}
          />
          <SwitchRow label="Voice SOS" value={voiceSOS} setValue={setVoiceSOS} />
          <SwitchRow
            label="In-App Only Mode"
            value={inAppOnly}
            setValue={setInAppOnly}
          />
        </Card>

        {/* EMERGENCY CONTACTS */}
        <Card title="Emergency Contacts" icon="call-outline">
          {loadingContacts ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 10 }} />
          ) : (
            <>
              {contacts.map((contact, index) => (
                <View key={contact.id} style={styles.contactRow}>
                  <View style={styles.contactInputs}>
                    <TextInput
                      style={styles.input}
                      placeholder={`Contact ${index + 1} Name (e.g. Mother)`}
                      placeholderTextColor={COLORS.textSecondary}
                      value={contact.name}
                      onChangeText={(v) => updateContact(contact.id, "name", v)}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Phone Number"
                      placeholderTextColor={COLORS.textSecondary}
                      value={contact.phone}
                      onChangeText={(v) => updateContact(contact.id, "phone", v)}
                      keyboardType="phone-pad"
                    />
                  </View>

                  {contacts.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeContactRow(contact.id)}
                      style={styles.removeBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity style={styles.addContactBtn} onPress={addContactRow}>
                <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
                <Text style={styles.addContactText}>Add another contact</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={saveEmergencyContacts} disabled={savingContacts}>
                <LinearGradient
                  colors={[COLORS.heroFrom, COLORS.heroTo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.saveButton, savingContacts && { opacity: 0.7 }]}
                >
                  {savingContacts ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Ionicons name="save-outline" size={20} color="#fff" />
                  )}
                  <Text style={styles.saveButtonText}>
                    {savingContacts ? "Saving..." : "Save Contacts"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </Card>

        {/* LOGOUT */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}
          activeOpacity={0.8}
          disabled={loggingOut}
        >
          <LinearGradient
            colors={[COLORS.danger, COLORS.heroFrom]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoutGradient}
          >
            {loggingOut ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="log-out-outline" size={20} color="#fff" />
            )}
            <Text style={styles.logoutText}>
              {loggingOut ? "Logging out..." : "Logout"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

/* CARD COMPONENT — defined OUTSIDE SettingsPage so it keeps a stable
   reference across re-renders. Defining it inside the component body
   was the cause of the "jumps to top after every keystroke" bug: each
   re-render created a brand-new Card function, so React unmounted and
   remounted the TextInputs inside it (losing focus) on every letter. */
const Card = ({ title, icon, children }: CardProps) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.cardIconWrap}>
        <Ionicons name={icon as any} size={17} color={COLORS.primary} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

/* SWITCH ROW COMPONENT with proper typing */
const SwitchRow = ({ label, value, setValue }: SwitchRowProps) => (
  <View style={styles.switchRow}>
    <Text style={styles.switchText}>{label}</Text>
    <Switch
      value={value}
      onValueChange={setValue}
      trackColor={{ false: "#E5DFE2", true: COLORS.primary }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="#E5DFE2"
    />
  </View>
);

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  header: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 10,
  },

  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
  },

  subHeading: {
    color: "rgba(255,255,255,0.75)",
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#5A3A46",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },

  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  switchText: {
    fontSize: 13.5,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  contactInputs: {
    flex: 1,
  },

  removeBtn: {
    marginLeft: 8,
    padding: 10,
    backgroundColor: COLORS.dangerSoft,
    borderRadius: 12,
  },

  input: {
    backgroundColor: COLORS.primarySoft,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  addContactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginBottom: 10,
    gap: 6,
  },

  addContactText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 13,
  },

  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
    borderRadius: 15,
    marginTop: 5,
  },

  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },

  logoutBtn: {
    marginTop: 10,
    shadowColor: COLORS.danger,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 8,
  },

  logoutGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },
});