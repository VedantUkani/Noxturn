/** View model for the settings page — swap mock for API responses later. */

export type SettingsHeaderModel = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export type ProfileAccountModel = {
  cardTitle: string;
  cardSubtitle: string;
  editLabel: string;
  fullNameLabel: string;
  fullName: string;
  commuteLabel: string;
  commuteMinutes: number;
  clinicalRoleLabel: string;
  roleBadge: string;
  roleSpecialty: string;
  emailLabel: string;
  email: string;
};

export type ChronotypeModel = {
  columnLabel: string;
  title: string;
  description: string;
};

export type SleepDurationModel = {
  columnLabel: string;
  hoursLabel: string;
  /** 0–1 for slider thumb position */
  sliderFillRatio: number;
};

export type AnchorSleepModel = {
  columnLabel: string;
  startLabel: string;
  startTime: string;
  endLabel: string;
  endTime: string;
  note: string;
};

export type SleepPreferencesModel = {
  cardTitle: string;
  chronotype: ChronotypeModel;
  duration: SleepDurationModel;
  anchor: AnchorSleepModel;
};

export type WearableStatus = "synced" | "connect";

export type WearableIntegrationModel = {
  id: string;
  name: string;
  detail: string;
  status: WearableStatus;
  /** Shown when status is synced */
  syncedBadgeLabel?: string;
  /** Shown when status is connect */
  connectLabel?: string;
};

export type WearableSyncModel = {
  cardTitle: string;
  items: WearableIntegrationModel[];
};

export type PrivacyActionModel = {
  id: string;
  label: string;
  /** visual variant for icon */
  kind: "export" | "permissions" | "delete";
};

export type DataPrivacyModel = {
  cardTitle: string;
  intro: string;
  actions: PrivacyActionModel[];
  policyVersionLabel: string;
  secureNodeLabel: string;
};

export type FooterLinkModel = {
  label: string;
  href: string;
};

export type SettingsFooterModel = {
  brandLine: string;
  links: FooterLinkModel[];
};

export type SettingsTopBarModel = {
  searchPlaceholder: string;
  /** Alt text for avatar */
  avatarAlt: string;
};

export type SettingsPageViewModel = {
  topBar: SettingsTopBarModel;
  header: SettingsHeaderModel;
  profile: ProfileAccountModel;
  sleep: SleepPreferencesModel;
  wearables: WearableSyncModel;
  privacy: DataPrivacyModel;
  footer: SettingsFooterModel;
};
