import type { SettingsPageViewModel } from "./types";

/** Replace this object (or fetch + transform) when wiring the backend. */
export const SETTINGS_PAGE_MOCK: SettingsPageViewModel = {
  topBar: {
    searchPlaceholder: "Search preferences...",
    avatarAlt: "Profile avatar",
  },
  header: {
    eyebrow: "SETTINGS",
    title: "Workspace & Recovery",
    subtitle: "",
  },
  profile: {
    cardTitle: "Profile & Account",
    cardSubtitle: "",
    editLabel: "Edit Profile",
    fullNameLabel: "FULL NAME",
    fullName: "Dr. Elena Sterling",
    commuteLabel: "COMMUTE DURATION",
    commuteMinutes: 45,
    clinicalRoleLabel: "CLINICAL ROLE",
    roleBadge: "PGY-1 Resident",
    roleSpecialty: "Internal Medicine",
    emailLabel: "EMAIL",
    email: "e.sterling@metrohealth.edu",
  },
  sleep: {
    cardTitle: "Sleep Preferences",
    chronotype: {
      columnLabel: "Chronotype Alignment",
      title: "Night Owl",
      description:
        "Optimized for late shifts. Your cognitive peak is between 19:00 - 23:00.",
    },
    duration: {
      columnLabel: "Preferred Sleep Duration",
      hoursLabel: "7.5 Hours",
      sliderFillRatio: 0.72,
    },
    anchor: {
      columnLabel: "'Anchor Sleep' Window",
      startLabel: "START",
      startTime: "02:00 AM",
      endLabel: "END",
      endTime: "06:00 AM",
      note:
        "A stable anchor window helps keep circadian rhythms aligned even when shift timing varies.",
    },
  },
  wearables: {
    cardTitle: "Wearable Sync",
    items: [
      {
        id: "oura",
        name: "Oura Ring",
        detail: "Last synced 14m ago",
        status: "synced",
        syncedBadgeLabel: "Synced",
      },
      {
        id: "whoop",
        name: "Whoop 4.0",
        detail: "Not connected",
        status: "connect",
        connectLabel: "Connect",
      },
      {
        id: "apple",
        name: "Apple Health",
        detail: "Sync enabled for Sleep & Steps",
        status: "synced",
        syncedBadgeLabel: "Synced",
      },
    ],
  },
  privacy: {
    cardTitle: "Data & Privacy",
    intro:
      "Your recovery data is encrypted and HIPAA-compliant. You control who sees your scores and when they expire.",
    actions: [
      { id: "export", label: "Export my health record (.json)", kind: "export" },
      {
        id: "perms",
        label: "Manage clinical permissions",
        kind: "permissions",
      },
      { id: "delete", label: "Request account deletion", kind: "delete" },
    ],
    policyVersionLabel: "PRIVACY POLICY V2.4",
    secureNodeLabel: "Secure Node Connected",
  },
  footer: {
    brandLine: "Noxturn 2026 @ HackASU",
    links: [
      { label: "Developer API", href: "/" },
      { label: "Terms of Care", href: "/" },
      { label: "Contact Lab", href: "/" },
    ],
  },
};
