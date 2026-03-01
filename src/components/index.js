// src/components/index.js
import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, ScrollView, Modal, TextInput,
} from 'react-native';
import { COLORS, SIZES, SHADOWS, FONTS } from '../constants/theme';
import Graph from './Graph';

export { Graph };


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
    {typeof icon === 'string' ? <Text style={styles.statIcon}>{icon}</Text> : <View style={{ marginBottom: 4 }}>{icon}</View>}
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── SectionHeader ───────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, rightAction }) => (
  <View style={[styles.sectionHeader, rightAction && { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
    {rightAction && <View>{rightAction}</View>}
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
    {typeof icon === 'string' ? <Text style={styles.emptyIcon}>{icon}</Text> : <View style={{ marginBottom: 12 }}>{icon}</View>}
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
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: SIZES.xxl, fontWeight: FONTS.bold },
  statLabel: { fontSize: SIZES.sm, color: COLORS.medium, marginTop: 2 },

  sectionHeader: { marginBottom: 10, marginTop: 16 },
  sectionTitle: { fontSize: SIZES.lg, fontWeight: FONTS.bold, color: COLORS.dark },
  sectionSubtitle: { fontSize: SIZES.sm, color: COLORS.medium, marginTop: 2 },

  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, alignSelf: 'flex-start' },
  badgeText: { fontSize: SIZES.xs, fontWeight: FONTS.semiBold },

  primaryBtn: { borderRadius: SIZES.radius, padding: 14, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#fff', fontWeight: FONTS.bold, fontSize: SIZES.md },

  listRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 14, borderRadius: SIZES.radiusSm, marginBottom: 8, ...SHADOWS.card },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: COLORS.medium, fontSize: SIZES.md },

  dashHeader: { padding: 20, paddingTop: 20, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  dashGreeting: { color: 'rgba(255,255,255,0.8)', fontSize: SIZES.sm },
  dashName: { color: '#fff', fontSize: SIZES.xxl, fontWeight: FONTS.bold, marginTop: 2 },
  dashRole: { color: 'rgba(255,255,255,0.7)', fontSize: SIZES.xs, marginTop: 2, letterSpacing: 1 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  logoutText: { color: '#fff', fontSize: SIZES.sm, fontWeight: FONTS.semiBold },

  noticeTitle: { fontSize: SIZES.md, fontWeight: FONTS.bold, color: COLORS.dark },
  noticeMsg: { fontSize: SIZES.sm, color: COLORS.medium, marginTop: 4 },
  noticeMeta: { fontSize: SIZES.xs, color: COLORS.medium, marginTop: 8 },

  successBox: { backgroundColor: '#EcFDF5', borderRadius: SIZES.radiusSm, padding: 12, margin: 16, borderLeftWidth: 4, borderLeftColor: COLORS.success },
  successText: { color: COLORS.success, fontSize: SIZES.md },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: 20, ...SHADOWS.card, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: SIZES.lg, fontWeight: FONTS.bold, color: COLORS.dark },
  modalCloseBtn: { padding: 4 },
  modalCloseText: { fontSize: 24, color: COLORS.medium, lineHeight: 24 },

  inputContainer: { marginBottom: 14 },
  inputLabel: { fontSize: SIZES.sm, fontWeight: FONTS.semiBold, color: COLORS.dark, marginBottom: 6 },
  textInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: SIZES.radiusSm, padding: 12, fontSize: SIZES.md, color: COLORS.dark, backgroundColor: COLORS.light },
});

// ─── SuccessBox ──────────────────────────────────────────────────────────────
export const SuccessBox = ({ message }) => (
  <View style={styles.successBox}>
    <Text style={styles.successText}>{message}</Text>
  </View>
);

// ─── ModalForm ───────────────────────────────────────────────────────────────
export const ModalForm = ({ visible, title, children, onClose, onSubmit, loading }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
            <Text style={styles.modalCloseText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>

        <PrimaryButton
          title="Save"
          onPress={onSubmit}
          loading={loading}
          style={{ marginTop: 20 }}
        />
      </View>
    </View>
  </Modal>
);

// ─── TextInputField ──────────────────────────────────────────────────────────
export const TextInputField = ({ label, ...props }) => (
  <View style={styles.inputContainer}>
    {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
    <TextInput
      style={styles.textInput}
      placeholderTextColor={COLORS.medium}
      {...props}
    />
  </View>
);
