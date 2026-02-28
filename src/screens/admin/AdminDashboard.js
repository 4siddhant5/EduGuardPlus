// src/screens/admin/AdminDashboard.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../services/AuthContext';
import {
  getAllTeachers, getAllStudents, getAllClasses,
  getAllNotices, getAttendance,
} from '../../services/api';
import {
  DashboardHeader, StatCard, SectionHeader,
  NoticeCard, Card, RiskBadge, EmptyState,
  LoadingScreen, ErrorBox, Badge,
} from '../../components';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

const toArray = (obj) =>
  obj ? Object.entries(obj).map(([id, val]) => ({ id, ...val })) : [];

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview | classes | students | notices

  const fetchAll = useCallback(async () => {
    try {
      setError('');
      const [td, sd, cd, nd, ad] = await Promise.all([
        getAllTeachers(token),
        getAllStudents(token),
        getAllClasses(token),
        getAllNotices(token),
        getAttendance(token),
      ]);
      setTeachers(toArray(td));
      setStudents(toArray(sd));
      setClasses(toArray(cd));
      setNotices(toArray(nd).reverse());
      setAttendance(ad ?? {});
    } catch {
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <LoadingScreen message="Loading Admin data…" />;

  const highRiskCount = students.filter(s => s.riskLevel === 'HIGH').length;

  // ── Tab: Overview ────────────────────────────────────────────────────────
  const OverviewTab = () => (
    <>
      <SectionHeader title="📊 Quick Stats" />
      <View style={styles.statsGrid}>
        <StatCard label="Teachers" value={teachers.length} icon="👩‍🏫" color={COLORS.success} />
        <StatCard label="Students" value={students.length} icon="🎓" color={COLORS.info} />
      </View>
      <View style={styles.statsGrid}>
        <StatCard label="Classes" value={classes.length} icon="🏫" color={COLORS.primary} />
        <StatCard label="High Risk" value={highRiskCount} icon="⚠️" color={COLORS.danger} />
      </View>

      {/* Attendance heatmap by class */}
      <SectionHeader title="📅 Attendance Summary" subtitle="Last recorded sessions" />
      {Object.entries(attendance).map(([classId, dates]) => {
        const cls = classes.find(c => c.id === classId);
        const dateKeys = Object.keys(dates).sort().reverse();
        return (
          <Card key={classId}>
            <Text style={styles.nameText}>
              {cls ? `${cls.className} - ${cls.section}` : classId}
            </Text>
            {dateKeys.map(date => {
              const present = Object.values(dates[date]).filter(Boolean).length;
              const total = Object.values(dates[date]).length;
              const pct = total ? Math.round((present / total) * 100) : 0;
              const color = pct >= 75 ? COLORS.success : pct >= 50 ? COLORS.warning : COLORS.danger;
              return (
                <View key={date} style={styles.attRow}>
                  <Text style={styles.metaText}>{date}</Text>
                  <View style={styles.attBarBg}>
                    <View style={[styles.attBar, { width: `${pct}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={[styles.pctText, { color }]}>{pct}%</Text>
                </View>
              );
            })}
          </Card>
        );
      })}
    </>
  );

  // ── Tab: Classes ─────────────────────────────────────────────────────────
  const ClassesTab = () => (
    <>
      <SectionHeader title="🏫 All Classes" subtitle={`${classes.length} classes`} />
      {classes.length === 0
        ? <EmptyState icon="🏫" message="No classes found." />
        : classes.map(c => {
          const teacher = teachers.find(t => t.id === c.teacherId);
          const classStudents = students.filter(s => s.classId === c.id);
          return (
            <Card key={c.id}>
              <View style={styles.rowBetween}>
                <Text style={styles.nameText}>{c.className} - Section {c.section}</Text>
                <Badge label={`${classStudents.length} students`} color={COLORS.primary} />
              </View>
              <Text style={styles.metaText}>👩‍🏫 {teacher?.name ?? c.teacherEmail}</Text>
              <Text style={styles.metaText}>📧 {c.teacherEmail}</Text>
              {classStudents.length > 0 && (
                <Text style={styles.metaText}>
                  ⚠️ High Risk: {classStudents.filter(s => s.riskLevel === 'HIGH').length}
                </Text>
              )}
            </Card>
          );
        })
      }
    </>
  );

  // ── Tab: Students ────────────────────────────────────────────────────────
  const StudentsTab = () => (
    <>
      <SectionHeader title="🎓 All Students" subtitle={`${students.length} enrolled`} />
      {students.length === 0
        ? <EmptyState icon="🎓" message="No students found." />
        : students.map(s => (
          <Card key={s.id}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nameText}>{s.name}</Text>
                <Text style={styles.metaText}>🏫 {s.className}</Text>
                <Text style={styles.metaText}>👨‍👩‍👧 {s.parentEmail}</Text>
                <View style={styles.metricsRow}>
                  {s.marks !== undefined && <Text style={styles.metric}>📝 {Math.round(s.marks)}%</Text>}
                  {s.attendance !== undefined && <Text style={styles.metric}>📅 {s.attendance}%</Text>}
                  {s.riskScore !== undefined && <Text style={styles.metric}>🎯 Score: {s.riskScore}</Text>}
                </View>
              </View>
              <RiskBadge level={s.riskLevel} />
            </View>
          </Card>
        ))
      }
    </>
  );

  // ── Tab: Notices ─────────────────────────────────────────────────────────
  const NoticesTab = () => (
    <>
      <SectionHeader title="📢 Notices" subtitle={`${notices.length} total`} />
      {notices.length === 0
        ? <EmptyState icon="📢" message="No notices posted." />
        : notices.map(n => (
          <NoticeCard
            key={n.id}
            title={n.title}
            message={n.message}
            createdBy={n.createdBy}
            createdAt={n.createdAt}
          />
        ))
      }
    </>
  );

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'classes', label: '🏫 Classes' },
    { key: 'students', label: '🎓 Students' },
    { key: 'notices', label: '📢 Notices' },
  ];

  return (
    <View style={styles.root}>
      <DashboardHeader
        name="Admin"
        role="Administrator"
        onLogout={logout}
        color={COLORS.primary}
      />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} />}
      >
        {error ? <ErrorBox message={error} /> : null}

        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'classes' && <ClassesTab />}
        {activeTab === 'students' && <StudentsTab />}
        {activeTab === 'notices' && <NoticesTab />}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SIZES.padding, paddingTop: 12 },

  tabBar: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: SIZES.xs, color: COLORS.medium },
  tabTextActive: { color: COLORS.primary, fontWeight: FONTS.bold },

  statsGrid: { flexDirection: 'row', marginHorizontal: -6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  nameText: { fontSize: SIZES.md, fontWeight: FONTS.bold, color: COLORS.dark },
  metaText: { fontSize: SIZES.sm, color: COLORS.medium, marginTop: 2 },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 8 },
  metric: { fontSize: SIZES.xs, color: COLORS.dark, backgroundColor: COLORS.light, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },

  attRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  attBarBg: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  attBar: { height: 8, borderRadius: 4 },
  pctText: { width: 36, fontSize: SIZES.xs, fontWeight: FONTS.bold, textAlign: 'right' },
});
