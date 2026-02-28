// src/screens/admin/AdminDashboard.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Added Icon Import
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
  const [activeTab, setActiveTab] = useState('overview');

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
      <SectionHeader title="Quick Stats" />
      <View style={styles.statsGrid}>
        <StatCard
          label="Teachers"
          value={teachers.length}
          icon={<Icon name="account-tie" size={24} color={COLORS.success} />}
          color={COLORS.success}
        />
        <StatCard
          label="Students"
          value={students.length}
          icon={<Icon name="school" size={24} color={COLORS.info} />}
          color={COLORS.info}
        />
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          label="Classes"
          value={classes.length}
          icon={<Icon name="google-classroom" size={24} color={COLORS.primary} />}
          color={COLORS.primary}
        />
        <StatCard
          label="High Risk"
          value={highRiskCount}
          icon={<Icon name="alert-decagram" size={24} color={COLORS.danger} />}
          color={COLORS.danger}
        />
      </View>

      <SectionHeader title="Attendance Summary" subtitle="Last recorded sessions" />
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
                  <Icon name="calendar-clock" size={14} color={COLORS.medium} />
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
      <SectionHeader title="All Classes" subtitle={`${classes.length} classes`} />
      {classes.length === 0
        ? <EmptyState icon={<Icon name="home-city-outline" size={50} color={COLORS.medium} />} message="No classes found." />
        : classes.map(c => {
          const teacher = teachers.find(t => t.id === c.teacherId);
          const classStudents = students.filter(s => s.classId === c.id);
          return (
            <Card key={c.id}>
              <View style={styles.rowBetween}>
                <Text style={styles.nameText}>{c.className} - Section {c.section}</Text>
                <Badge label={`${classStudents.length} students`} color={COLORS.primary} />
              </View>
              <View style={styles.infoRow}>
                <Icon name="account-star-outline" size={16} color={COLORS.medium} />
                <Text style={styles.metaText}> {teacher?.name ?? c.teacherEmail}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="email-outline" size={16} color={COLORS.medium} />
                <Text style={styles.metaText}> {c.teacherEmail}</Text>
              </View>
              {classStudents.length > 0 && (
                <View style={styles.infoRow}>
                  <Icon name="alert-circle-outline" size={16} color={COLORS.danger} />
                  <Text style={[styles.metaText, { color: COLORS.danger }]}>
                    High Risk Students: {classStudents.filter(s => s.riskLevel === 'HIGH').length}
                  </Text>
                </View>
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
      <SectionHeader title="All Students" subtitle={`${students.length} enrolled`} />
      {students.length === 0
        ? <EmptyState icon={<Icon name="account-off-outline" size={50} color={COLORS.medium} />} message="No students found." />
        : students.map(s => (
          <Card key={s.id}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nameText}>{s.name}</Text>
                <View style={styles.infoRow}>
                  <Icon name="book-outline" size={14} color={COLORS.medium} />
                  <Text style={styles.metaText}> {s.className}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="human-male-female" size={14} color={COLORS.medium} />
                  <Text style={styles.metaText}> {s.parentEmail}</Text>
                </View>
                <View style={styles.metricsRow}>
                  {s.marks !== undefined && (
                    <View style={styles.metric}>
                      <Icon name="file-document-edit-outline" size={12} color={COLORS.dark} />
                      <Text style={styles.metricText}> {Math.round(s.marks)}%</Text>
                    </View>
                  )}
                  {s.attendance !== undefined && (
                    <View style={styles.metric}>
                      <Icon name="calendar-check" size={12} color={COLORS.dark} />
                      <Text style={styles.metricText}> {s.attendance}%</Text>
                    </View>
                  )}
                  {s.riskScore !== undefined && (
                    <View style={styles.metric}>
                      <Icon name="target" size={12} color={COLORS.dark} />
                      <Text style={styles.metricText}> Score: {s.riskScore}</Text>
                    </View>
                  )}
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
      <SectionHeader title="Notices" subtitle={`${notices.length} total`} />
      {notices.length === 0
        ? <EmptyState icon={<Icon name="bell-off-outline" size={50} color={COLORS.medium} />} message="No notices posted." />
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
    { key: 'overview', label: 'Overview', icon: 'view-dashboard-outline' },
    { key: 'classes', label: 'Classes', icon: 'google-classroom' },
    { key: 'students', label: 'Students', icon: 'account-group-outline' },
    { key: 'notices', label: 'Notices', icon: 'bullhorn-outline' },
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
            <Icon
              name={t.icon}
              size={20}
              color={activeTab === t.key ? COLORS.primary : COLORS.medium}
            />
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
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 10, color: COLORS.medium, marginTop: 4 },
  tabTextActive: { color: COLORS.primary, fontWeight: FONTS.bold },

  statsGrid: { flexDirection: 'row', marginHorizontal: -6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  nameText: { fontSize: SIZES.md, fontWeight: FONTS.bold, color: COLORS.dark },
  metaText: { fontSize: SIZES.sm, color: COLORS.medium },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 },
  metric: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.light, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  metricText: { fontSize: SIZES.xs, color: COLORS.dark, fontWeight: FONTS.medium },

  attRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  attBarBg: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  attBar: { height: 6, borderRadius: 3 },
  pctText: { width: 36, fontSize: SIZES.xs, fontWeight: FONTS.bold, textAlign: 'right' },
});