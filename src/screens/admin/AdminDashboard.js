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
  createTeacher, createClass, assignClassToTeacher
} from '../../services/api';
import {
  DashboardHeader, StatCard, SectionHeader,
  NoticeCard, Card, RiskBadge, EmptyState,
  LoadingScreen, ErrorBox, Badge,
  PrimaryButton, ModalForm, TextInputField, SuccessBox
} from '../../components';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import {
  FaChalkboardTeacher, FaUserGraduate, FaSchool, FaExclamationTriangle,
  FaCalendarAlt, FaUsers, FaBell, FaBullseye, FaEdit, FaBoxOpen, FaChartPie
} from 'react-icons/fa';

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
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview | classes | students | notices

  // Modal States
  const [teacherModal, setTeacherModal] = useState(false);
  const [classModal, setClassModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);

  // Form States
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '' });
  const [newClass, setNewClass] = useState({ className: '', section: '' });
  const [assignData, setAssignData] = useState({ classId: '', teacherId: '' });
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreateTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email) return setError("Name and Email required");
    setSubmitting(true);
    try {
      await createTeacher(newTeacher, token);
      setTeacherModal(false);
      setNewTeacher({ name: '', email: '' });
      setSuccess("Teacher created successfully!");
      fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateClass = async () => {
    if (!newClass.className || !newClass.section) return setError("Class Name and Section required");
    setSubmitting(true);
    try {
      await createClass(newClass, token);
      setClassModal(false);
      setNewClass({ className: '', section: '' });
      setSuccess("Class created successfully!");
      fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignClass = async () => {
    if (!assignData.classId || !assignData.teacherId) return setError("Class and Teacher required");
    setSubmitting(true);
    try {
      await assignClassToTeacher(assignData.classId, assignData.teacherId, token);
      setAssignModal(false);
      setAssignData({ classId: '', teacherId: '' });
      setSuccess("Class assigned successfully!");
      fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Tab: Overview ────────────────────────────────────────────────────────
  const OverviewTab = () => (
    <>
      <SectionHeader
        title="Quick Stats"
        rightAction={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <PrimaryButton title="Add Teacher" onPress={() => setTeacherModal(true)} style={{ paddingVertical: 8, paddingHorizontal: 12 }} />
            <PrimaryButton title="Create Class" onPress={() => setClassModal(true)} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: COLORS.success }} />
          </View>
        }
      />
      <View style={styles.statsGrid}>
        <StatCard label="Teachers" value={teachers.length} icon={<FaChalkboardTeacher size={24} color={COLORS.success} />} color={COLORS.success} />
        <StatCard label="Students" value={students.length} icon={<FaUserGraduate size={24} color={COLORS.info} />} color={COLORS.info} />
      </View>
      <View style={styles.statsGrid}>
        <StatCard label="Classes" value={classes.length} icon={<FaSchool size={24} color={COLORS.primary} />} color={COLORS.primary} />
        <StatCard label="High Risk" value={highRiskCount} icon={<FaExclamationTriangle size={24} color={COLORS.danger} />} color={COLORS.danger} />
      </View>

      {/* Attendance heatmap by class */}
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
        ? <EmptyState icon={<FaSchool size={48} color={COLORS.medium} />} message="No classes found." />
        : classes.map(c => {
          const teacher = teachers.find(t => t.id === c.teacherId);
          const classStudents = students.filter(s => s.classId === c.id);
          return (
            <Card key={c.id}>
              <View style={styles.rowBetween}>
                <Text style={styles.nameText}>{c.className} - Section {c.section}</Text>
                <Badge label={`${classStudents.length} students`} color={COLORS.primary} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <FaChalkboardTeacher color={COLORS.medium} style={{ marginRight: 6 }} />
                <Text style={styles.metaText}>{teacher?.name ?? c.teacherEmail ?? 'Not Assigned'}</Text>
              </View>
              {c.teacherEmail && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <FaBoxOpen color={COLORS.medium} style={{ marginRight: 6 }} />
                  <Text style={styles.metaText}>{c.teacherEmail}</Text>
                </View>
              )}
              {classStudents.length > 0 && (
                <Text style={[styles.metaText, { color: COLORS.danger, marginTop: 4 }]}>
                  High Risk: {classStudents.filter(s => s.riskLevel === 'HIGH').length}
                </Text>
              )}
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => {
                  setAssignData({ ...assignData, classId: c.id });
                  setAssignModal(true);
                }}
              >
                <Text style={styles.outlineBtnText}>Assign Teacher</Text>
              </TouchableOpacity>
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
        ? <EmptyState icon={<FaUserGraduate size={48} color={COLORS.medium} />} message="No students found." />
        : students.map(s => (
          <Card key={s.id}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nameText}>{s.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <FaSchool color={COLORS.medium} style={{ marginRight: 6 }} />
                  <Text style={styles.metaText}>{s.className}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <FaUsers color={COLORS.medium} style={{ marginRight: 6 }} />
                  <Text style={styles.metaText}>{s.parentEmail}</Text>
                </View>
                <View style={styles.metricsRow}>
                  {s.marks !== undefined && (
                    <View style={styles.metric}>
                      <FaEdit color={COLORS.dark} style={{ marginRight: 4 }} />
                      <Text style={styles.metricText}>{Math.round(s.marks)}%</Text>
                    </View>
                  )}
                  {s.attendance !== undefined && (
                    <View style={styles.metric}>
                      <FaCalendarAlt color={COLORS.dark} style={{ marginRight: 4 }} />
                      <Text style={styles.metricText}>{s.attendance}%</Text>
                    </View>
                  )}
                  {s.riskScore !== undefined && (
                    <View style={styles.metric}>
                      <FaBullseye color={COLORS.dark} style={{ marginRight: 4 }} />
                      <Text style={styles.metricText}>Score: {s.riskScore}</Text>
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
        ? <EmptyState icon={<FaBell size={48} color={COLORS.medium} />} message="No notices posted." />
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
    { key: 'overview', label: 'Overview', icon: <FaChartPie size={16} /> },
    { key: 'classes', label: 'Classes', icon: <FaSchool size={16} /> },
    { key: 'students', label: 'Students', icon: <FaUserGraduate size={16} /> },
    { key: 'notices', label: 'Notices', icon: <FaBell size={16} /> },
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ opacity: activeTab === t.key ? 1 : 0.6 }}>
                {t.icon}
              </View>
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} />}
      >
        {success ? <SuccessBox message={success} /> : null}
        {error ? <ErrorBox message={error} /> : null}

        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'classes' && <ClassesTab />}
        {activeTab === 'students' && <StudentsTab />}
        {activeTab === 'notices' && <NoticesTab />}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      <ModalForm
        visible={teacherModal}
        title="Add Teacher"
        onClose={() => setTeacherModal(false)}
        onSubmit={handleCreateTeacher}
        loading={submitting}
      >
        <TextInputField
          label="Name"
          placeholder="Teacher Name"
          value={newTeacher.name}
          onChangeText={(t) => setNewTeacher({ ...newTeacher, name: t })}
        />
        <TextInputField
          label="Email"
          placeholder="teacher@school.com"
          value={newTeacher.email}
          onChangeText={(t) => setNewTeacher({ ...newTeacher, email: t })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </ModalForm>

      <ModalForm
        visible={classModal}
        title="Create Class"
        onClose={() => setClassModal(false)}
        onSubmit={handleCreateClass}
        loading={submitting}
      >
        <TextInputField
          label="Class Name"
          placeholder="e.g. 10th Grade"
          value={newClass.className}
          onChangeText={(t) => setNewClass({ ...newClass, className: t })}
        />
        <TextInputField
          label="Section"
          placeholder="e.g. A"
          value={newClass.section}
          onChangeText={(t) => setNewClass({ ...newClass, section: t })}
        />
      </ModalForm>

      <ModalForm
        visible={assignModal}
        title="Assign Teacher to Class"
        onClose={() => setAssignModal(false)}
        onSubmit={handleAssignClass}
        loading={submitting}
      >
        <Text style={styles.inputLabel}>Select Teacher</Text>
        <View style={styles.teacherList}>
          {teachers.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.teacherListItem,
                assignData.teacherId === t.id && styles.teacherListItemActive
              ]}
              onPress={() => setAssignData({ ...assignData, teacherId: t.id })}
            >
              <Text style={[
                styles.teacherListName,
                assignData.teacherId === t.id && styles.teacherListNameActive
              ]}>{t.name}</Text>
              <Text style={styles.teacherListEmail}>{t.email}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ModalForm>
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
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 },
  metric: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.light, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  metricText: { fontSize: SIZES.xs, color: COLORS.dark },

  attRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  attBarBg: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  attBar: { height: 8, borderRadius: 4 },
  pctText: { width: 36, fontSize: SIZES.xs, fontWeight: FONTS.bold, textAlign: 'right' },

  outlineBtn: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 12, borderColor: COLORS.primary, borderWidth: 1, borderRadius: SIZES.radiusSm, alignSelf: 'flex-start' },
  outlineBtnText: { color: COLORS.primary, fontSize: SIZES.sm, fontWeight: FONTS.semiBold },
  inputLabel: { fontSize: SIZES.sm, fontWeight: FONTS.semiBold, color: COLORS.dark, marginBottom: 6 },
  teacherList: { maxHeight: 200, borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radiusSm, overflow: 'hidden', backgroundColor: COLORS.white },
  teacherListItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  teacherListItemActive: { backgroundColor: COLORS.primary + '10' },
  teacherListName: { fontSize: SIZES.md, fontWeight: FONTS.semiBold, color: COLORS.dark },
  teacherListNameActive: { color: COLORS.primary },
  teacherListEmail: { fontSize: SIZES.sm, color: COLORS.medium, marginTop: 2 },
});
