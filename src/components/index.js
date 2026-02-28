// src/components/index.js
import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, ScrollView,
} from 'react-native';
import { COLORS, SIZES, SHADOWS, FONTS } from '../constants/theme';

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export const LoadingScreen = ({ message = 'Loading…' }) => (
  <View style={styles.center}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

// ─── ErrorBox ────────────────────────────────────────────────────────────────
export const ErrorBox = ({ message }) => (
  <View style={styles.errorBox}>
    <Text style={styles.errorText}>⚠️  {message}</Text>
  </View>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, color = COLORS.primary }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── SectionHeader ───────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
  </View>
);

// ─── Badge ───────────────────────────────────────────────────────────────────
export const Badge = ({ label, color = COLORS.primary }) => (
  <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

// ─── RiskBadge ───────────────────────────────────────────────────────────────
export const RiskBadge = ({ level }) => {
  const colorMap = { LOW: COLORS.success, MEDIUM: COLORS.warning, HIGH: COLORS.danger };
  const color = colorMap[level] ?? COLORS.medium;
  return <Badge label={level ?? 'N/A'} color={color} />;
};

// ─── PrimaryButton ───────────────────────────────────────────────────────────
export const PrimaryButton = ({ title, onPress, loading, color, style }) => (
  <TouchableOpacity
    style={[styles.primaryBtn, { backgroundColor: color ?? COLORS.primary }, style]}
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
  >
    {loading
      ? <ActivityIndicator color="#fff" />
      : <Text style={styles.primaryBtnText}>{title}</Text>}
  </TouchableOpacity>
);

// ─── ListRow ─────────────────────────────────────────────────────────────────
export const ListRow = ({ left, right, onPress }) => (
  <TouchableOpacity style={styles.listRow} onPress={onPress} activeOpacity={0.7}>
    <View style={{ flex: 1 }}>{left}</View>
    {right && <View>{right}</View>}
  </TouchableOpacity>
);

// ─── EmptyState ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', message = 'Nothing here yet.' }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

// ─── DashboardHeader ─────────────────────────────────────────────────────────
export const DashboardHeader = ({ name, role, onLogout, color }) => (
  <View style={[styles.dashHeader, { backgroundColor: color ?? COLORS.primary }]}>
    <View>
      <Text style={styles.dashGreeting}>Welcome back 👋</Text>
      <Text style={styles.dashName}>{name}</Text>
      <Text style={styles.dashRole}>{role?.toUpperCase()}</Text>
    </View>
    <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  </View>
);

// ─── NoticeCard ──────────────────────────────────────────────────────────────
export const NoticeCard = ({ title, message, createdBy, createdAt }) => (
  <Card style={{ marginBottom: 10 }}>
    <Text style={styles.noticeTitle}>{title}</Text>
    <Text style={styles.noticeMsg}>{message}</Text>
    <Text style={styles.noticeMeta}>
      By {createdBy}  •  {createdAt ? new Date(createdAt).toLocaleDateString() : ''}
    </Text>
  </Card>
);

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { marginTop: 12, color: COLORS.medium, fontSize: SIZES.md },

  errorBox: { backgroundColor: '#FEF2F2', borderRadius: SIZES.radiusSm, padding: 12, margin: 16, borderLeftWidth: 4, borderLeftColor: COLORS.danger },
  errorText: { color: COLORS.danger, fontSize: SIZES.md },

  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: 14, marginBottom: 12, ...SHADOWS.card },

  statCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: 14, margin: 6, borderLeftWidth: 4, alignItems: 'flex-start', ...SHADOWS.card,
  },
  statIcon:  { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: SIZES.xxl, fontWeight: FONTS.bold },
  statLabel: { fontSize: SIZES.sm, color: COLORS.medium, marginTop: 2 },

  sectionHeader: { marginBottom: 10, marginTop: 16 },
  sectionTitle:  { fontSize: SIZES.lg, fontWeight: FONTS.bold, color: COLORS.dark },
  sectionSubtitle: { fontSize: SIZES.sm, color: COLORS.medium, marginTop: 2 },

  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, alignSelf: 'flex-start' },
  badgeText: { fontSize: SIZES.xs, fontWeight: FONTS.semiBold },

  primaryBtn: { borderRadius: SIZES.radius, padding: 14, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#fff', fontWeight: FONTS.bold, fontSize: SIZES.md },

  listRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 14, borderRadius: SIZES.radiusSm, marginBottom: 8, ...SHADOWS.card },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: COLORS.medium, fontSize: SIZES.md },

  dashHeader: { padding: 20, paddingTop: 50, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  dashGreeting: { color: 'rgba(255,255,255,0.8)', fontSize: SIZES.sm },
  dashName:     { color: '#fff', fontSize: SIZES.xxl, fontWeight: FONTS.bold, marginTop: 2 },
  dashRole:     { color: 'rgba(255,255,255,0.7)', fontSize: SIZES.xs, marginTop: 2, letterSpacing: 1 },
  logoutBtn:    { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  logoutText:   { color: '#fff', fontSize: SIZES.sm, fontWeight: FONTS.semiBold },

  noticeTitle: { fontSize: SIZES.md, fontWeight: FONTS.bold, color: COLORS.dark },
  noticeMsg:   { fontSize: SIZES.sm, color: COLORS.medium, marginTop: 4 },
  noticeMeta:  { fontSize: SIZES.xs, color: COLORS.medium, marginTop: 8 },
});
