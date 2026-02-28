// src/screens/teacher/TeacherDashboard.js

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, TouchableOpacity,
} from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';

import { useAuth } from '../../services/AuthContext';
import {
  getAllStudents, getAllClasses, getAttendance,
  getAllHomework, getAllNotices,
} from '../../services/api';

import {
  DashboardHeader, StatCard, SectionHeader,
  NoticeCard, Card, RiskBadge, EmptyState,
  LoadingScreen, ErrorBox, Badge,
} from '../../components';

import { COLORS, SIZES, FONTS } from '../../constants/theme';


const toArray = (obj) =>
  obj ? Object.entries(obj).map(([id, val]) => ({ id, ...val })) : [];


export default function TeacherDashboard() {

  const { user, token, logout } = useAuth();

  const [myClasses, setMyClasses] = useState([]);
  const [myStudents, setMyStudents] = useState([]);
  const [homework, setHomework] = useState([]);
  const [notices, setNotices] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('home');

  const uid = user?.uid;


  const fetchAll = useCallback(async () => {
    try {
      setError('');

      const [sd, cd, hd, nd, ad] = await Promise.all([
        getAllStudents(token),
        getAllClasses(token),
        getAllHomework(token),
        getAllNotices(token),
        getAttendance(token),
      ]);

      const allStudents = toArray(sd);
      const allClasses = toArray(cd);

      const myC = allClasses.filter(c => c.teacherId === uid);
      const myS = allStudents.filter(s => s.teacherId === uid);

      const myHW = [];

      if (hd) {
        myC.forEach(c => {
          const classHW = hd[c.id];
          if (classHW) {
            toArray(classHW).forEach(hw =>
              myHW.push({
                ...hw,
                classId: c.id,
                className: `${c.className} - ${c.section}`
              })
            );
          }
        });
      }

      setMyClasses(myC);
      setMyStudents(myS);
      setHomework(myHW);
      setNotices(toArray(nd).reverse());
      setAttendance(ad ?? {});

    } catch {
      setError('Failed to load teacher data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

  }, [token, uid]);


  useEffect(() => { fetchAll(); }, [fetchAll]);


  if (loading) return <LoadingScreen message="Loading Teacher data…" />;



  /* ================= HOME TAB ================= */

  const HomeTab = () => (
    <>
      <SectionHeader title="My Overview" />

      <View style={styles.statsGrid}>
        <StatCard
          label="My Classes"
          value={myClasses.length}
          icon={<MaterialCommunityIcons name="school" size={22} color="#fff" />}
          color={COLORS.success}
        />

        <StatCard
          label="My Students"
          value={myStudents.length}
          icon={<Ionicons name="people" size={22} color="#fff" />}
          color={COLORS.info}
        />
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          label="Assignments"
          value={homework.length}
          icon={<MaterialIcons name="menu-book" size={22} color="#fff" />}
          color={COLORS.warning}
        />

        <StatCard
          label="At Risk"
          value={myStudents.filter(s => s.riskLevel !== 'LOW').length}
          icon={<MaterialIcons name="warning" size={22} color="#fff" />}
          color={COLORS.danger}
        />
      </View>


      <SectionHeader title="My Classes" />

      {myClasses.length === 0 ? (
        <EmptyState
          icon={<MaterialCommunityIcons name="school-outline" size={40} color={COLORS.medium} />}
          message="No classes assigned yet."
        />
      ) : myClasses.map(c => {

        const cStudents = myStudents.filter(s => s.classId === c.id);

        return (
          <Card key={c.id}>

            <View style={styles.rowBetween}>
              <Text style={styles.nameText}>
                {c.className} — Section {c.section}
              </Text>

              <Badge
                label={`${cStudents.length} students`}
                color={COLORS.success}
              />
            </View>

            <Text style={styles.metaText}>
              <MaterialIcons name="email" size={14} /> {c.teacherEmail}
            </Text>

          </Card>
        );
      })}
    </>
  );



  /* ================= STUDENTS TAB ================= */

  const StudentsTab = () => (
    <>
      <SectionHeader title="My Students" subtitle={`${myStudents.length} students`} />

      {myStudents.length === 0 ? (
        <EmptyState
          icon={<Ionicons name="people-outline" size={40} color={COLORS.medium} />}
          message="No students assigned."
        />
      ) : myStudents.map(s => (
        <Card key={s.id}>

          <View style={styles.rowBetween}>

            <View style={{ flex: 1 }}>

              <Text style={styles.nameText}>{s.name}</Text>

              <Text style={styles.metaText}>
                <MaterialCommunityIcons name="school" size={14} /> {s.className}
              </Text>

              <Text style={styles.metaText}>
                <Ionicons name="people" size={14} /> {s.parentEmail}
              </Text>

              <View style={styles.metricsRow}>

                {s.marks !== undefined &&
                  <MetricChip icon="edit" label={`${Math.round(s.marks)}%`} />
                }

                {s.attendance !== undefined &&
                  <MetricChip icon="calendar" label={`${s.attendance}%`} />
                }

                {s.behavior !== undefined &&
                  <MetricChip icon="smile" label={`B:${s.behavior}`} />
                }

                {s.riskScore !== undefined &&
                  <MetricChip icon="target" label={`${s.riskScore}`} />
                }

              </View>
            </View>

            <RiskBadge level={s.riskLevel} />

          </View>

        </Card>
      ))}
    </>
  );



  /* ================= HOMEWORK TAB ================= */

  const HomeworkTab = () => (
    <>
      <SectionHeader title="Assignments" subtitle={`${homework.length} posted`} />

      {homework.length === 0 ? (
        <EmptyState
          icon={<MaterialIcons name="menu-book" size={40} color={COLORS.medium} />}
          message="No assignments posted."
        />
      ) : homework.map(hw => (
        <Card key={hw.id}>

          <View style={styles.rowBetween}>
            <Text style={styles.nameText}>
              {hw.subject?.toUpperCase()}
            </Text>

            <Badge
              label={`#${hw.assignmentNo}`}
              color={COLORS.info}
            />
          </View>

          <Text style={styles.metaText}>
            <MaterialCommunityIcons name="school" size={14} /> {hw.className}
          </Text>

          <Text style={styles.metaText}>
            <Feather name="calendar" size={14} /> Due: {hw.dueDate}
          </Text>

        </Card>
      ))}
    </>
  );



  /* ================= ATTENDANCE TAB ================= */

  const AttendanceTab = () => (
    <>
      <SectionHeader title="Attendance Records" />

      {myClasses.length === 0 ? (
        <EmptyState
          icon={<Feather name="calendar" size={40} color={COLORS.medium} />}
          message="No classes to show attendance for."
        />
      ) : myClasses.map(c => {

        const classAtt = attendance[c.id];

        if (!classAtt) {
          return (
            <Card key={c.id}>
              <Text style={styles.nameText}>
                {c.className} - {c.section}
              </Text>
              <Text style={styles.metaText}>
                No attendance records yet.
              </Text>
            </Card>
          );
        }

        const dates = Object.keys(classAtt).sort().reverse();

        return (
          <Card key={c.id}>

            <Text style={styles.nameText}>
              {c.className} — Section {c.section}
            </Text>

            {dates.map(date => {

              const record = classAtt[date];
              const present = Object.values(record).filter(Boolean).length;
              const total = Object.values(record).length;
              const pct = total ? Math.round((present / total) * 100) : 0;

              const color =
                pct >= 75 ? COLORS.success :
                  pct >= 50 ? COLORS.warning :
                    COLORS.danger;

              return (
                <View key={date} style={styles.attRow}>

                  <Text style={styles.dateText}>{date}</Text>

                  <View style={styles.attBarBg}>
                    <View
                      style={[
                        styles.attBar,
                        { width: `${pct}%`, backgroundColor: color }
                      ]}
                    />
                  </View>

                  <Text style={[styles.pctText, { color }]}>
                    {present}/{total}
                  </Text>

                </View>
              );
            })}

          </Card>
        );
      })}
    </>
  );



  /* ================= NOTICES TAB ================= */

  const NoticesTab = () => (
    <>
      <SectionHeader title="Notices" subtitle={`${notices.length} notices`} />

      {notices.length === 0 ? (
        <EmptyState
          icon={<MaterialIcons name="campaign" size={40} color={COLORS.medium} />}
          message="No notices."
        />
      ) : notices.map(n => (
        <NoticeCard
          key={n.id}
          title={n.title}
          message={n.message}
          createdBy={n.createdBy}
          createdAt={n.createdAt}
        />
      ))}
    </>
  );



  const tabs = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'students', label: 'Students', icon: 'people' },
    { key: 'homework', label: 'Homework', icon: 'menu-book' },
    { key: 'attendance', label: 'Attendance', icon: 'calendar' },
    { key: 'notices', label: 'Notices', icon: 'campaign' },
  ];



  return (
    <View style={styles.root}>

      <DashboardHeader
        name="Teacher"
        role="Educator"
        onLogout={logout}
        color={COLORS.success}
      />


      {/* TAB BAR */}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBarWrap}>
        <View style={styles.tabBar}>

          {tabs.map(t => (

            <TouchableOpacity
              key={t.key}
              style={[styles.tab, activeTab === t.key && styles.tabActive]}
              onPress={() => setActiveTab(t.key)}
            >

              <MaterialIcons
                name={t.icon}
                size={18}
                color={activeTab === t.key ? COLORS.success : COLORS.medium}
              />

              <Text style={[
                styles.tabText,
                activeTab === t.key && styles.tabTextActive
              ]}>
                {t.label}
              </Text>

            </TouchableOpacity>

          ))}

        </View>
      </ScrollView>



      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAll();
            }}
          />
        }
      >

        {error ? <ErrorBox message={error} /> : null}

        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'students' && <StudentsTab />}
        {activeTab === 'homework' && <HomeworkTab />}
        {activeTab === 'attendance' && <AttendanceTab />}
        {activeTab === 'notices' && <NoticesTab />}

        <View style={{ height: 40 }} />

      </ScrollView>

    </View>
  );
}



/* ================= METRIC CHIP ================= */

const MetricChip = ({ icon, label }) => (
  <View style={styles.metricChip}>
    <Feather name={icon} size={12} color={COLORS.dark} />
    <Text style={styles.metricText}>{label}</Text>
  </View>
);



/* ================= STYLES ================= */

const styles = StyleSheet.create({

  root: { flex: 1, backgroundColor: COLORS.background },

  scroll: { flex: 1 },

  content: {
    padding: SIZES.padding,
    paddingTop: 12
  },

  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: -6
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4
  },

  nameText: {
    fontSize: SIZES.md,
    fontWeight: FONTS.bold,
    color: COLORS.dark
  },

  metaText: {
    fontSize: SIZES.sm,
    color: COLORS.medium,
    marginTop: 2
  },

  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 6
  },

  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4
  },

  metricText: {
    fontSize: SIZES.xs,
    color: COLORS.dark
  },

  tabBarWrap: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    maxHeight: 56
  },

  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 8
  },

  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2
  },

  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.success
  },

  tabText: {
    fontSize: SIZES.xs,
    color: COLORS.medium
  },

  tabTextActive: {
    color: COLORS.success,
    fontWeight: FONTS.bold
  },

  attRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6
  },

  dateText: {
    width: 80,
    fontSize: SIZES.xs,
    color: COLORS.medium
  },

  attBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden'
  },

  attBar: {
    height: 8,
    borderRadius: 4
  },

  pctText: {
    width: 36,
    fontSize: SIZES.xs,
    fontWeight: FONTS.bold,
    textAlign: 'right'
  },

});