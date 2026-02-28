// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../../services/AuthContext';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      // Navigation handled automatically by RootNavigator via role
    } catch (e) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.logo}>🎓</Text>
          <Text style={styles.appName}>EduGuard</Text>
          <Text style={styles.tagline}>Smart School Management</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Use your school account</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️  {error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@school.com"
            placeholderTextColor={COLORS.medium}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="••••••••"
              placeholderTextColor={COLORS.medium}
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
              <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
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

          {/* Role hints */}
          <View style={styles.roleHints}>
            <Text style={styles.hintTitle}>Role-based access:</Text>
            {[
              { role: 'Super Admin', color: COLORS.secondary },
              { role: 'Admin',       color: COLORS.primary },
              { role: 'Teacher',     color: COLORS.success },
              { role: 'Parent',      color: COLORS.warning },
            ].map(({ role, color }) => (
              <View key={role} style={styles.hintRow}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <Text style={styles.hintText}>{role}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>© 2026 EduGuard · All rights reserved</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SIZES.padding },

  hero: { alignItems: 'center', marginBottom: 28 },
  logo:    { fontSize: 56, marginBottom: 6 },
  appName: { fontSize: SIZES.h1, fontWeight: FONTS.bold, color: '#fff', letterSpacing: 1 },
  tagline: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  card: {
    backgroundColor: COLORS.white, borderRadius: 20,
    padding: 24, ...SHADOWS.card,
  },
  title:    { fontSize: SIZES.xxl, fontWeight: FONTS.bold, color: COLORS.dark },
  subtitle: { fontSize: SIZES.sm, color: COLORS.medium, marginBottom: 16, marginTop: 2 },

  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 8, padding: 10, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: COLORS.danger },
  errorText: { color: COLORS.danger, fontSize: SIZES.sm },

  label: { fontSize: SIZES.sm, fontWeight: FONTS.semiBold, color: COLORS.dark, marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: SIZES.radiusSm,
    padding: 12, fontSize: SIZES.md, color: COLORS.dark, backgroundColor: COLORS.light,
    marginBottom: 4,
  },
  passRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  eyeBtn:  { padding: 10, marginLeft: 6 },
  eyeIcon: { fontSize: 18 },

  loginBtn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius,
    padding: 15, alignItems: 'center', marginTop: 20,
  },
  loginBtnText: { color: '#fff', fontSize: SIZES.lg, fontWeight: FONTS.bold },

  roleHints: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  hintTitle: { fontSize: SIZES.xs, color: COLORS.medium, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  hintRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  dot:       { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  hintText:  { fontSize: SIZES.sm, color: COLORS.medium },

  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: SIZES.xs, marginTop: 20 },
});
