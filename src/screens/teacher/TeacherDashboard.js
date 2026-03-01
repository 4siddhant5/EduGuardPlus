// src/screens/teacher/TeacherDashboard.js

import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useAuth } from '../../services/AuthContext';
import {
  getAllStudents, getAllClasses, getAttendance,
  getAllHomework, getAllNotices,
} from '../../services/api';

import { DashboardHeader, LoadingScreen, ErrorBox } from '../../components';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

import HomeTab from './tabs/HomeTab';
import StudentsTab from './tabs/StudentsTab';
import HomeworkTab from './tabs/HomeworkTab';
import AttendanceTab from './tabs/AttendanceTab';
import NoticesTab from './tabs/NoticesTab';


const toArray = (obj) =>
  obj ? Object.entries(obj).map(([id, val]) => ({ id, ...val })) : [];


export default function TeacherDashboard() {

  const { user, token, logout } = useAuth();

  const [data, setData] = useState({
    myClasses: [],
    myStudents: [],
    homework: [],
    notices: [],
    attendance: {},
  });

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
            Object.keys(classHW).forEach(hwKey => {
              myHW.push({
                ...classHW[hwKey],
                id: hwKey,
                classId: c.id,
                className: `${c.className} - ${c.section}`
              });
            });
          }
        });
      }

      setData({
        myClasses: myC,
        myStudents: myS,
        homework: myHW,
        notices: toArray(nd).reverse(),
        attendance: ad ?? {},
      });

    } catch {
      setError('Failed to load teacher data.');
    }
    finally {
      setLoading(false);
      setRefreshing(false);
    }

  }, [token, uid]);


  useEffect(() => { fetchAll(); }, [fetchAll]);


  if (loading) return <LoadingScreen message="Loading Teacher data…" />;


  const tabs = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'students', label: 'Students', icon: 'people' },
    { key: 'homework', label: 'Homework', icon: 'menu-book' },
    { key: 'attendance', label: 'Attendance', icon: 'calendar-today' },
    { key: 'notices', label: 'Notices', icon: 'campaign' },
  ];


  const renderTab = () => {

    switch (activeTab) {

      case 'home':
        return <HomeTab {...data} onRefresh={fetchAll} token={token} />;

      case 'students':
        return <StudentsTab {...data} onRefresh={fetchAll} token={token} />;

      case 'homework':
        return <HomeworkTab {...data} onRefresh={fetchAll} token={token} />;

      case 'attendance':
        return <AttendanceTab {...data} onRefresh={fetchAll} token={token} />;

      case 'notices':
        return <NoticesTab {...data} onRefresh={fetchAll} token={token} />;

      default:
        return null;
    }
  };


  return (
    <View style={styles.root}>

      <DashboardHeader
        name="Teacher"
        role="Educator"
        onLogout={logout}
        color={COLORS.success}
      />


      {/* TAB BAR */}

      <View style={styles.tabBarWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>

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

        </ScrollView>
      </View>


      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SIZES.padding }}
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

        {renderTab()}

      </ScrollView>

    </View>
  );
}



const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: COLORS.background
  },

  tabBarWrap: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 8
  },

  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center'
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

});