// src/screens/superadmin/SuperAdminDashboard.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, FlatList,
} from 'react-native';
import { useAuth } from '../../services/AuthContext';
import {
  getAllAdmins, getAllTeachers, getAllStudents,
  getAllClasses, getAllNotices, getAllUsers, getSuperAdmins,
} from '../../services/api';
import {
  DashboardHeader, StatCard, SectionHeader,
  NoticeCard, Card, Badge, EmptyState,
  LoadingScreen, ErrorBox, RiskBadge,
} from '../../components';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

export default function SuperAdminDashboard() {
  const { user, token, logout, role } = useAuth();

  const [stats, setStats] = useState(null);
  const [notices, setNotices] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const toArray = (obj) =>
    obj ? Object.entries(obj).map(([id, val]) => ({ id, ...val })) : [];

  const fetchAll = useCallback(async () => {
    try {
      setError('');
      const [adminsData, teachersData, studentsData,
        classesData, noticesData, usersData, superAdminsData] = await Promise.all([
          getAllAdmins(token),
          getAllTeachers(token),
          getAllStudents(token),
          getAllClasses(token),
          getAllNotices(token),
          getAllUsers(token),
          getSuperAdmins(token),
        ]);

      const adminsArr = toArray(adminsData);
      const teachersArr = toArray(teachersData);
      const studentsArr = toArray(studentsData);
      const classesArr = toArray(classesData);
      const noticesArr = toArray(noticesData);
      const superAdminsArr = toArray(superAdminsData);
      const usersObj = usersData ?? {};

      // Role counts
      const roleCounts = Object.values(usersObj).reduce((acc, u) => {
        acc[u.role] = (acc[u.role] ?? 0) + 1;
        return acc;
      }, {});

      setSuperAdmins(superAdminsArr);
      setAdmins(adminsArr);
      setTeachers(teachersArr);
      setStudents(studentsArr);
      setNotices(noticesArr.reverse());
      setUsers(usersObj);
      setStats({
        superAdmins: superAdminsArr.length,
        admins: adminsArr.length,
        teachers: teachersArr.length,
        students: studentsArr.length,
        classes: classesArr.length,
        parents: roleCounts['parent'] ?? 0,
        totalUsers: Object.keys(usersObj).length,
        highRisk: studentsArr.filter(s => s.riskLevel === 'HIGH').length,
        medRisk: studentsArr.filter(s => s.riskLevel === 'MEDIUM').length,
      });
    } catch (e) {
      console.error('Fetch Error:', e);
      setError('Failed to load data: ' + e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <LoadingScreen message="Loading Super Admin data…" />;

  return (
    <View style={styles.root}>
      <DashboardHeader
        name="Super Admin"
        role="Super Administrator"
        onLogout={logout}
        color={COLORS.secondary}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} />}
      >
        {error ? <ErrorBox message={error} /> : null}

        {/* ── Stats Grid ── */}
        <SectionHeader title="📊 Platform Overview" subtitle="Live stats from Firebase" />
        <View style={styles.statsGrid}>
          <StatCard label="Total Users" value={stats?.totalUsers} icon="👥" color={COLORS.secondary} />
          <StatCard label="Super Admins" value={stats?.superAdmins} icon="👑" color={COLORS.secondary} />
        </View>
        <View style={styles.statsGrid}>
          <StatCard label="Admins" value={stats?.admins} icon="🛡️" color={COLORS.primary} />
          <StatCard label="Teachers" value={stats?.teachers} icon="👩‍🏫" color={COLORS.success} />
        </View>
        <View style={styles.statsGrid}>
          <StatCard label="Students" value={stats?.students} icon="🎓" color={COLORS.info} />
          <StatCard label="Classes" value={stats?.classes} icon="🏫" color={COLORS.warning} />
        </View>
        <View style={styles.statsGrid}>
          <StatCard label="Parents" value={stats?.parents} icon="👨‍👩‍👧" color={COLORS.danger} />
          <View style={{ flex: 1, marginHorizontal: 6 }} />
        </View>

        {/* ── Risk Summary ── */}
        <SectionHeader title="⚠️ Risk Summary" />
        <Card>
          <View style={styles.riskRow}>
            <View style={styles.riskItem}>
              <Text style={[styles.riskNum, { color: COLORS.danger }]}>{stats?.highRisk}</Text>
              <Text style={styles.riskLabel}>High Risk</Text>
            </View>
            <View style={styles.riskItem}>
              <Text style={[styles.riskNum, { color: COLORS.warning }]}>{stats?.medRisk}</Text>
              <Text style={styles.riskLabel}>Medium Risk</Text>
            </View>
            <View style={styles.riskItem}>
              <Text style={[styles.riskNum, { color: COLORS.success }]}>
                {(stats?.students ?? 0) - (stats?.highRisk ?? 0) - (stats?.medRisk ?? 0)}
              </Text>
              <Text style={styles.riskLabel}>Low Risk</Text>
            </View>
          </View>
        </Card>

        {/* ── Super Admins List ── */}
        <SectionHeader title="👑 Super Admins" subtitle={`${superAdmins.length} super admins`} />
        {superAdmins.length === 0
          ? <EmptyState icon="👑" message="No super admins found." />
          : superAdmins.map(sa => (
            <Card key={sa.id}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.nameText}>{sa.name}</Text>
                  <Text style={styles.metaText}>{sa.email}</Text>
                </View>
                <Badge label="Super Admin" color={COLORS.secondary} />
              </View>
            </Card>
          ))
        }

        {/* ── Admins List ── */}
        <SectionHeader title="🛡️ Registered Admins" subtitle={`${admins.length} admins`} />
        {admins.length === 0
          ? <EmptyState icon="🛡️" message="No admins found." />
          : admins.map(a => (
            <Card key={a.id}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.nameText}>{a.name}</Text>
                  <Text style={styles.metaText}>{a.email}</Text>
                  {a.collegeName ? <Text style={styles.metaText}>🏫 {a.collegeName}</Text> : null}
                </View>
                {a.adminId ? <Badge label={a.adminId} color={COLORS.primary} /> : null}
              </View>
            </Card>
          ))
        }

        {/* ── Teachers List ── */}
        <SectionHeader title="👩‍🏫 Teachers" subtitle={`${teachers.length} teachers`} />
        {teachers.length === 0
          ? <EmptyState icon="👩‍🏫" message="No teachers found." />
          : teachers.map(t => (
            <Card key={t.id}>
              <Text style={styles.nameText}>{t.name}</Text>
              <Text style={styles.metaText}>{t.email}</Text>
              <Text style={styles.metaText}>📞 {t.phone}</Text>
            </Card>
          ))
        }

        {/* ── Students List ── */}
        <SectionHeader title="🎓 All Students" subtitle={`${students.length} students`} />
        {students.length === 0
          ? <EmptyState icon="🎓" message="No students found." />
          : students.map(s => (
            <Card key={s.id}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nameText}>{s.name}</Text>
                  <Text style={styles.metaText}>🏫 {s.className}</Text>
                  <Text style={styles.metaText}>📧 {s.parentEmail}</Text>
                  {s.marks !== undefined && (
                    <Text style={styles.metaText}>📝 Marks: {Math.round(s.marks)}</Text>
                  )}
                </View>
                <RiskBadge level={s.riskLevel} />
              </View>
            </Card>
          ))
        }

        {/* ── Notices ── */}
        <SectionHeader title="📢 All Notices" subtitle={`${notices.length} notices`} />
        {notices.length === 0
          ? <EmptyState icon="📢" message="No notices." />
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SIZES.padding, paddingTop: 12 },
  statsGrid: { flexDirection: 'row', marginHorizontal: -6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nameText: { fontSize: SIZES.md, fontWeight: FONTS.bold, color: COLORS.dark },
  metaText: { fontSize: SIZES.sm, color: COLORS.medium, marginTop: 2 },
  riskRow: { flexDirection: 'row', justifyContent: 'space-around' },
  riskItem: { alignItems: 'center' },
  riskNum: { fontSize: SIZES.xxl, fontWeight: FONTS.bold },
  riskLabel: { fontSize: SIZES.xs, color: COLORS.medium, marginTop: 2 },
});
