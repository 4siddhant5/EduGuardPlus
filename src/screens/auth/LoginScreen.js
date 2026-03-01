import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, useWindowDimensions
} from 'react-native';
import { useAuth } from '../../services/AuthContext';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function LoginScreen() {
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768; // Tablet/Web Breakpoint

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHero = () => (
    <View style={isLargeScreen ? styles.heroLarge : styles.heroMobile}>
      <MaterialCommunityIcons name="school" size={isLargeScreen ? 80 : 56} color={isLargeScreen ? '#fff' : COLORS.primary} />
      <Text style={[styles.appName, isLargeScreen && styles.appNameLarge]}>EduGuard</Text>
      <Text style={[styles.tagline, isLargeScreen && styles.taglineLarge]}>
        Smart School Management
      </Text>
    </View>
  );

  const renderForm = () => (
    <View style={[styles.card, isLargeScreen && styles.cardLarge]}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Use your school account</Text>

      {error ? (
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="alert-circle" size={20} color={COLORS.danger} style={{ marginRight: 8 }} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Email</Text>
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.medium} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="you@school.com"
          placeholderTextColor={COLORS.medium}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <Text style={styles.label}>Password</Text>
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.medium} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={COLORS.medium}
          secureTextEntry={!showPass}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
          <MaterialCommunityIcons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.medium} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.loginBtn, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.loginBtnText}>Sign In →</Text>}
      </TouchableOpacity>
    </View>
  );

  if (isLargeScreen) {
    return (
      <View style={styles.splitRoot}>
        <View style={styles.leftPane}>
          {renderHero()}
          <Text style={styles.footerLarge}>© 2026 EduGuard · All rights reserved</Text>
        </View>
        <View style={styles.rightPane}>
          <KeyboardAvoidingView behavior="padding" style={styles.formContainerCenter}>
            {renderForm()}
          </KeyboardAvoidingView>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {renderHero()}
        {renderForm()}
        <Text style={styles.footer}>© 2026 EduGuard · All rights reserved</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Mobile Layout
  root: { flex: 1, backgroundColor: COLORS.light },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SIZES.padding },
  heroMobile: { alignItems: 'center', marginBottom: 28 },

  // Split Screen Layout
  splitRoot: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.light },
  leftPane: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  rightPane: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light
  },
  heroLarge: { alignItems: 'center' },
  formContainerCenter: { width: '100%', maxWidth: 440 },

  // Typography & Branding
  appName: { fontSize: SIZES.h1, fontWeight: FONTS.bold, color: COLORS.primary, letterSpacing: 1, marginTop: 12 },
  appNameLarge: { color: COLORS.white, fontSize: 36, marginTop: 16 },
  tagline: { fontSize: SIZES.md, color: COLORS.medium, marginTop: 4 },
  taglineLarge: { color: 'rgba(255,255,255,0.8)', fontSize: SIZES.lg, marginTop: 8 },

  // Card & Form
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    ...SHADOWS.card,
    elevation: 5,
  },
  cardLarge: {
    padding: 32,
    borderRadius: 24,
    width: '100%',
  },
  title: { fontSize: SIZES.xxl, fontWeight: FONTS.bold, color: COLORS.dark },
  subtitle: { fontSize: SIZES.sm, color: COLORS.medium, marginBottom: 24, marginTop: 4 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: SIZES.radiusSm,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger
  },
  errorText: { color: COLORS.danger, fontSize: SIZES.sm, flex: 1 },

  label: { fontSize: SIZES.sm, fontWeight: FONTS.semiBold, color: COLORS.dark, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: SIZES.radius,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: SIZES.md,
    color: COLORS.dark,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  eyeBtn: { padding: 8 },

  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: { color: '#fff', fontSize: SIZES.lg, fontWeight: FONTS.bold },

  // Role Hints (Badges)
  roleHintsContainer: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  hintTitle: { fontSize: 11, color: COLORS.medium, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, fontWeight: FONTS.semiBold },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 11, fontWeight: FONTS.semiBold },

  // Footers
  footer: { textAlign: 'center', color: COLORS.medium, fontSize: SIZES.xs, marginTop: 24 },
  footerLarge: { position: 'absolute', bottom: 30, color: 'rgba(255,255,255,0.6)', fontSize: SIZES.sm },
});
