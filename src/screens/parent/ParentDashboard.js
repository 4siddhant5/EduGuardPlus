// src/screens/parent/ParentDashboard.js

import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useAuth } from '../../services/AuthContext';
import { getAllStudents, getAllHomework, getAllNotices, getAttendance } from '../../services/api';

import { DashboardHeader, LoadingScreen, ErrorBox } from '../../components';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

import ChildrenTab from './components/ChildrenTab';
import HomeworkTab from './components/HomeworkTab';
import NoticesTab from './components/NoticesTab';

const toArray = (obj) =>
  obj ? Object.entries(obj).map(([id, val]) => ({ id, ...val })) : [];

export default function ParentDashboard() {

  const { user, token, logout } = useAuth();

  const [myChildren, setMyChildren] = useState([]);
  const [homework, setHomework] = useState([]);
  const [notices, setNotices] = useState([]);
  const [attendance, setAttendance] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('children');
  const [selected, setSelected] = useState(null);

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
      const children = allStudents.filter(s => s.parentId === uid);
      setMyChildren(children);

      const hw = [];

      if (hd) {
        children.forEach(child => {
          const classHW = hd[child.classId];
          if (classHW) {
            toArray(classHW).forEach(h =>
              hw.push({
                ...h,
                childName: child.name,
                classId: child.classId
              })
            );
          }
        });
      }

      setHomework(hw);
      setNotices(toArray(nd).reverse());
      setAttendance(ad ?? {});

      if (children.length > 0 && !selected)
        setSelected(children[0].id);

    } catch {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

  }, [token, uid]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <LoadingScreen message="Loading your child's data…" />;

  const tabs = [
    { key: 'children', label: 'My Child', icon: 'account-child' },
    { key: 'homework', label: 'Homework', icon: 'book-open' },
    { key: 'notices', label: 'Notices', icon: 'bullhorn' },
  ];

  return (
    <View style={styles.root}>

      <DashboardHeader
        name="Parent"
        role="Parent / Guardian"
        onLogout={logout}
        color={COLORS.warning}
      />

      {/* TAB BAR */}
      <View style={styles.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <MaterialCommunityIcons
              name={t.icon}
              size={18}
              color={activeTab === t.key ? COLORS.warning : COLORS.medium}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchAll();
          }} />
        }
      >
        {error ? <ErrorBox message={error} /> : null}

        {activeTab === 'children' && (
          <ChildrenTab
            myChildren={myChildren}
            selected={selected}
            setSelected={setSelected}
            attendance={attendance}
            homework={homework}
          />
        )}

        {activeTab === 'homework' && (
          <HomeworkTab
            myChildren={myChildren}
            selected={selected}
            setSelected={setSelected}
            homework={homework}
          />
        )}

        {activeTab === 'notices' && (
          <NoticesTab notices={notices} />
        )}

        <View style={{ height: 40 }} />

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({

  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SIZES.padding, paddingTop: 12 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4
  },

  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.warning
  },

  tabText: { fontSize: SIZES.xs, color: COLORS.medium },

  tabTextActive: {
    color: COLORS.warning,
    fontWeight: FONTS.bold
  },

});