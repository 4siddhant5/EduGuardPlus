// src/screens/parent/ParentDashboard.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../services/AuthContext';
import {
  getAllStudents, getAllHomework, getAllNotices,
  getAttendance,
} from '../../services/api';
import {
  DashboardHeader, SectionHeader, Card,
  RiskBadge, NoticeCard, EmptyState,
  LoadingScreen, ErrorBox, Badge, StatCard,
} from '../../components';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

const toArray = (obj) =>
  obj ? Object.entries(obj).map(([id, val]) => ({ id, ...val })) : [];

export default function ParentDashboard() {
  const { user, token, logout } = useAuth();

  const [myChildren, setMyChildren] = useState([]);
  const [homework,   setHomework]   = useState([]);
  const [notices,    setNotices]    = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');
  const [activeTab,  setActiveTab]  = useState('children');
  const [selected,   setSelected]   = useState(null); // selected child id

  const uid = user?.uid;

  const fetchAll = useCallback(async () => {
    try {
      setError('');
      const [sd, hd, nd, ad] = await Promise.all([
        getAllStudents(token),
        getAllHomework(token),
        getAllNotices(token),
        getAttendance(token),
      ]);

      const allStudents = toArray(sd);
      const children    = allStudents.filter(s => s.parentId === uid);
      setMyChildren(children);

      // Collect homework for children's classes
      const hw = [];
      if (hd) {
        children.forEach(child => {
          const classHW = hd[child.classId];
          if (classHW) {
            toArray(classHW).forEach(h => hw.push({ ...h, childName: child.name, classId: child.classId }));
          }
        });
      }
      setHomework(hw);
      setNotices(toArray(nd).reverse());
      setAttendance(ad ?? {});
      if (children.length > 0 && !selected) setSelected(children[0].id);
    } catch {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, uid]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <LoadingScreen message="Loading your child's data…" />;

  const selectedChild = myChildren.find(c => c.id === selected);

  // ── Child Selector ────────────────────────────────────────────────────────
  const ChildSelector = () => (
    myChildren.length > 1 ? (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorWrap}>
        {myChildren.map(child => (
          <TouchableOpacity
            key={child.id}
            style={[styles.selectorChip, selected === child.id && styles.selectorChipActive]}
            onPress={() => setSelected(child.id)}
          >
            <Text style={[styles.selectorText, selected === child.id && styles.selectorTextActive]}>
              🎓 {child.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    ) : null
  );

  // ── Children Tab ──────────────────────────────────────────────────────────
  const ChildrenTab = () => (
    <>
      <ChildSelector />
      {!selectedChild
        ? <EmptyState icon="👶" message="No children linked to your account." />
        : (
          <>
            {/* Profile Card */}
            <Card style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{selectedChild.name?.[0]?.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.nameText}>{selectedChild.name}</Text>
                  <Text style={styles.metaText}>🏫 {selectedChild.className}</Text>
                  <Text style={styles.metaText}>📧 {selectedChild.parentEmail}</Text>
                  <View style={{ marginTop: 8 }}>
                    <RiskBadge level={selectedChild.riskLevel} />
                  </View>
                </View>
              </View>
            </Card>

            {/* Metrics */}
            <SectionHeader title="📊 Performance" />
            <View style={styles.statsGrid}>
              <StatCard
                label="Marks"
                value={selectedChild.marks !== undefined ? `${Math.round(selectedChild.marks)}%` : 'N/A'}
                icon="📝" color={COLORS.info}
              />
              <StatCard
                label="Attendance"
                value={selectedChild.attendance !== undefined ? `${selectedChild.attendance}%` : 'N/A'}
                icon="📅" color={COLORS.success}
              />
            </View>
            <View style={styles.statsGrid}>
              <StatCard
                label="Behavior"
                value={selectedChild.behavior ?? selectedChild.behaviour ?? 'N/A'}
                icon="😊" color={COLORS.warning}
              />
              <StatCard
                label="Risk Score"
                value={selectedChild.riskScore ?? 'N/A'}
                icon="🎯"
                color={selectedChild.riskScore > 50 ? COLORS.danger : COLORS.success}
              />
            </View>
            <View style={styles.statsGrid}>
              <StatCard
                label="Assignments"
                value={selectedChild.assignments ?? 'N/A'}
                icon="📚" color={COLORS.secondary}
              />
              <StatCard
                label="Fees"
                value={selectedChild.feesPaid ? '✅ Paid' : '❌ Due'}
                icon="💳"
                color={selectedChild.feesPaid ? COLORS.success : COLORS.danger}
              />
            </View>

            {/* Attendance records */}
            <SectionHeader title="📅 Recent Attendance" />
            {(() => {
              const classAtt = attendance[selectedChild.classId];
              if (!classAtt) return <Card><Text style={styles.metaText}>No attendance records.</Text></Card>;
              const dates = Object.keys(classAtt).sort().reverse();
              return (
                <Card>
                  {dates.map(date => {
                    const record = classAtt[date];
                    const present = record[selectedChild.id];
                    return (
                      <View key={date} style={styles.attRow}>
                        <Text style={styles.dateText}>{date}</Text>
                        <View style={[styles.statusDot,
                          { backgroundColor: present ? COLORS.success : COLORS.danger }]} />
                        <Text style={[styles.statusText,
                          { color: present ? COLORS.success : COLORS.danger }]}>
                          {present ? 'Present' : 'Absent'}
                        </Text>
                      </View>
                    );
                  })}
                </Card>
              );
            })()}
          </>
        )
      }
    </>
  );

  // ── Homework Tab ──────────────────────────────────────────────────────────
  const HomeworkTab = () => (
    <>
      <ChildSelector />
      <SectionHeader title="📚 Homework & Assignments" subtitle={`${homework.filter(h => !selected || h.classId === selectedChild?.classId).length} assignments`} />
      {homework.length === 0
        ? <EmptyState icon="📚" message="No homework assigned yet." />
        : homework
            .filter(h => !selected || h.classId === selectedChild?.classId)
            .map(hw => (
              <Card key={hw.id}>
                <View style={styles.rowBetween}>
                  <Text style={styles.nameText}>{hw.subject?.toUpperCase()}</Text>
                  <Badge label={`#${hw.assignmentNo}`} color={COLORS.info} />
                </View>
                <Text style={styles.metaText}>👶 {hw.childName}</Text>
                <Text style={styles.metaText}>📅 Due: {hw.dueDate}</Text>
              </Card>
            ))
      }
    </>
  );

  // ── Notices Tab ───────────────────────────────────────────────────────────
  const NoticesTab = () => (
    <>
      <SectionHeader title="📢 School Notices" subtitle={`${notices.length} notices`} />
      {notices.length === 0
        ? <EmptyState icon="📢" message="No notices at this time." />
        : notices.map(n => (
            <NoticeCard key={n.id} title={n.title} message={n.message} createdBy={n.createdBy} createdAt={n.createdAt} />
          ))
      }
    </>
  );

  const tabs = [
    { key: 'children', label: '👶 My Child'  },
    { key: 'homework', label: '📚 Homework'  },
    { key: 'notices',  label: '📢 Notices'   },
  ];

  return (
    <View style={styles.root}>
      <DashboardHeader
        name="Parent"
        role="Parent / Guardian"
        onLogout={logout}
        color={COLORS.warning}
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
        {activeTab === 'children' && <ChildrenTab />}
        {activeTab === 'homework' && <HomeworkTab />}
        {activeTab === 'notices'  && <NoticesTab />}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: COLORS.background },
  scroll:  { flex: 1 },
  content: { padding: SIZES.padding, paddingTop: 12 },

  tabBar:        { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab:           { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive:     { borderBottomWidth: 2, borderBottomColor: COLORS.warning },
  tabText:       { fontSize: SIZES.xs, color: COLORS.medium },
  tabTextActive: { color: COLORS.warning, fontWeight: FONTS.bold },

  selectorWrap: { marginBottom: 12 },
  selectorChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.border, marginRight: 8 },
  selectorChipActive: { backgroundColor: COLORS.warning },
  selectorText:       { fontSize: SIZES.sm, color: COLORS.dark },
  selectorTextActive: { color: '#fff', fontWeight: FONTS.bold },

  profileCard:   { marginBottom: 4 },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar:        { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.warning, justifyContent: 'center', alignItems: 'center' },
  avatarText:    { fontSize: SIZES.xxl, color: '#fff', fontWeight: FONTS.bold },

  statsGrid:  { flexDirection: 'row', marginHorizontal: -6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  nameText:   { fontSize: SIZES.md, fontWeight: FONTS.bold, color: COLORS.dark },
  metaText:   { fontSize: SIZES.sm, color: COLORS.medium, marginTop: 2 },

  attRow:     { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 },
  dateText:   { width: 90, fontSize: SIZES.sm, color: COLORS.medium },
  statusDot:  { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: SIZES.sm, fontWeight: FONTS.semiBold },
});
