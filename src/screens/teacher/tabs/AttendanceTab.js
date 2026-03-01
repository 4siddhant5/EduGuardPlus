import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SectionHeader, PrimaryButton, EmptyState, Card, StatCard } from '../../../components';
import { COLORS, SIZES, FONTS } from '../../../constants/theme';
import { markAttendance } from '../../../services/api';

export default function AttendanceTab({ myClasses, myStudents, attendance, onRefresh, token }) {
    const [selectedClass, setSelectedClass] = useState(myClasses.length > 0 ? myClasses[0].id : null);

    // Date Management
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);

    // View Type: 'daily' | 'monthly' | 'student'
    const [viewMode, setViewMode] = useState('daily');

    // Attendance State
    const [attendanceData, setAttendanceData] = useState({});
    const [saving, setSaving] = useState(false);

    const filteredStudents = myStudents.filter(s => s.classId === selectedClass);

    // Initialize attendance data when class or date changes based on existing data
    useEffect(() => {
        if (!selectedClass || !attendance) return;

        const existingData = attendance[selectedClass]?.[date] || {};
        const newData = {};

        filteredStudents.forEach(s => {
            if (existingData[s.id] !== undefined) {
                // Determine status based on boolean/string in DB
                newData[s.id] = existingData[s.id] === true || existingData[s.id] === 'Present' ? 'Present' :
                    existingData[s.id] === 'Late' ? 'Late' : 'Absent';
            } else {
                // If it's today, leave unassigned to show them they need to be marked. 
                // If it's the past, default to absent.
                newData[s.id] = date === today ? null : 'Absent';
            }
        });

        setAttendanceData(newData);
    }, [selectedClass, date, attendance, myStudents.length]);

    const changeDate = (days) => {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        setDate(d.toISOString().split('T')[0]);
    };

    const cycleAttendance = (studentId) => {
        setAttendanceData(prev => {
            const current = prev[studentId];
            let nextStatus = 'Present';
            if (current === 'Present') nextStatus = 'Absent';
            else if (current === 'Absent') nextStatus = 'Late';

            return { ...prev, [studentId]: nextStatus };
        });
    };

    const markAllPresent = () => {
        const newData = { ...attendanceData };
        filteredStudents.forEach(s => {
            newData[s.id] = 'Present';
        });
        setAttendanceData(newData);
    };

    const handleSave = async () => {
        if (!selectedClass) return;
        setSaving(true);
        try {
            // Fill missing as absent
            const finalData = { ...attendanceData };
            filteredStudents.forEach(s => {
                if (!finalData[s.id]) finalData[s.id] = 'Absent';
            });
            await markAttendance(selectedClass, date, finalData, token);
            Alert.alert("Success", "Attendance saved successfully!");
            if (onRefresh) onRefresh();
        } catch (err) {
            Alert.alert("Error", err.message);
        } finally {
            setSaving(false);
        }
    };

    // Monthly Analytics Calculation
    const getMonthlyStats = () => {
        if (!selectedClass || !attendance[selectedClass]) return { present: 0, absent: 0, total: 0, pct: 0 };

        const currentMonth = date.substring(0, 7); // YYYY-MM
        let totalPresent = 0;
        let totalRecords = 0;

        Object.entries(attendance[selectedClass]).forEach(([recordDate, records]) => {
            if (recordDate.startsWith(currentMonth)) {
                Object.values(records).forEach(val => {
                    totalRecords++;
                    if (val === true || val === 'Present' || val === 'Late') totalPresent++;
                });
            }
        });

        const totalAbsent = totalRecords - totalPresent;
        const pct = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

        return { present: totalPresent, absent: totalAbsent, total: totalRecords, pct };
    };

    const stats = getMonthlyStats();

    return (
        <View style={styles.container}>
            {myClasses.length === 0 ? (
                <EmptyState icon={() => <MaterialIcons name="class" size={48} color={COLORS.medium} />} message="No classes assigned." />
            ) : (
                <>
                    {/* Class Selector Scroll */}
                    <View style={styles.classSelector}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {myClasses.map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    style={[styles.classChip, selectedClass === c.id && styles.classChipActive]}
                                    onPress={() => setSelectedClass(c.id)}
                                >
                                    <Text style={[styles.classChipText, selectedClass === c.id && styles.classChipTextActive]}>
                                        {c.className} - {c.section}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* View Mode Toggle */}
                    <View style={styles.tabToggle}>
                        <TouchableOpacity style={[styles.toggleBtn, viewMode === 'daily' && styles.toggleBtnActive]} onPress={() => setViewMode('daily')}>
                            <Text style={[styles.toggleText, viewMode === 'daily' && styles.toggleTextActive]}>Daily Marking</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.toggleBtn, viewMode === 'monthly' && styles.toggleBtnActive]} onPress={() => setViewMode('monthly')}>
                            <Text style={[styles.toggleText, viewMode === 'monthly' && styles.toggleTextActive]}>Monthly Summary</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Date Navigator */}
                    <View style={styles.dateNavigator}>
                        <TouchableOpacity style={styles.dateBtn} onPress={() => changeDate(-1)}>
                            <MaterialIcons name="chevron-left" size={24} color={COLORS.primary} />
                        </TouchableOpacity>

                        <View style={{ alignItems: 'center' }}>
                            <Text style={styles.dateText}>
                                {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </Text>
                            {date === today && <Text style={styles.todayTag}>Today</Text>}
                        </View>

                        <TouchableOpacity style={styles.dateBtn} onPress={() => changeDate(1)} disabled={date >= today}>
                            <MaterialIcons name="chevron-right" size={24} color={date >= today ? COLORS.border : COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    {viewMode === 'daily' && (
                        <>
                            {filteredStudents.length === 0 ? (
                                <EmptyState icon={() => <MaterialIcons name="people" size={48} color={COLORS.medium} />} message="No students in this class." />
                            ) : (
                                <View style={styles.studentList}>
                                    <View style={styles.actionRow}>
                                        <Text style={styles.studentCountText}>{filteredStudents.length} Students</Text>
                                        <TouchableOpacity style={styles.markAllBtn} onPress={markAllPresent}>
                                            <MaterialIcons name="done-all" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
                                            <Text style={styles.markAllText}>Mark All Present</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {filteredStudents.map(s => {
                                        const status = attendanceData[s.id];
                                        let statusColor = COLORS.border;
                                        if (status === 'Present') statusColor = COLORS.success;
                                        if (status === 'Absent') statusColor = COLORS.danger;
                                        if (status === 'Late') statusColor = COLORS.warning;

                                        return (
                                            <Card key={s.id} style={styles.studentCard}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.studentName}>{s.name}</Text>
                                                    <Text style={styles.studentRoll}>Roll: {s.rollNumber || 'N/A'}</Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.statusBtn,
                                                        { backgroundColor: status ? statusColor : COLORS.light, borderWidth: status ? 0 : 1, borderColor: COLORS.border }
                                                    ]}
                                                    onPress={() => cycleAttendance(s.id)}
                                                >
                                                    <Text style={[styles.statusBtnText, { color: status ? COLORS.white : COLORS.medium }]}>
                                                        {status || 'Mark'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </Card>
                                        )
                                    })}

                                    <PrimaryButton
                                        title="Save Attendance"
                                        onPress={handleSave}
                                        loading={saving}
                                        style={{ marginTop: 20 }}
                                    />
                                </View>
                            )}
                        </>
                    )}

                    {viewMode === 'monthly' && (
                        <View style={styles.summaryContainer}>
                            <SectionHeader title="Monthly Overview" subtitle={new Date(date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} />

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                                <StatCard label="Overall %" value={`${stats.pct}%`} color={stats.pct >= 75 ? COLORS.success : COLORS.warning} />
                                <StatCard label="Total Records" value={stats.total} color={COLORS.primary} />
                            </View>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <StatCard label="Total Present" value={stats.present} color={COLORS.success} />
                                <StatCard label="Total Absent" value={stats.absent} color={COLORS.danger} />
                            </View>

                            <SectionHeader title="Student Monthly Details" />
                            {filteredStudents.map(s => {
                                // Calculate individual student stats
                                const currentMonth = date.substring(0, 7);
                                let sPresent = 0, sTotal = 0;

                                if (attendance[selectedClass]) {
                                    Object.entries(attendance[selectedClass]).forEach(([recordDate, records]) => {
                                        if (recordDate.startsWith(currentMonth) && records[s.id] !== undefined) {
                                            sTotal++;
                                            if (records[s.id] === true || records[s.id] === 'Present' || records[s.id] === 'Late') sPresent++;
                                        }
                                    });
                                }

                                const sPct = sTotal > 0 ? Math.round((sPresent / sTotal) * 100) : 0;

                                return (
                                    <View key={s.id} style={styles.monthlyStudentRow}>
                                        <Text style={styles.studentName}>{s.name}</Text>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={[styles.studentRoll, { color: sPct >= 75 ? COLORS.success : COLORS.danger, fontWeight: 'bold' }]}>{sPct}%</Text>
                                            <Text style={{ fontSize: 10, color: COLORS.medium }}>{sPresent}/{sTotal} Days</Text>
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    classSelector: { marginBottom: 15 },
    classChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        marginRight: 10,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    classChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary
    },
    classChipText: {
        color: COLORS.medium,
        fontWeight: FONTS.semiBold
    },
    classChipTextActive: {
        color: COLORS.white
    },

    // Tab Toggle
    tabToggle: { flexDirection: 'row', backgroundColor: COLORS.light, borderRadius: SIZES.radiusSm, padding: 4, marginBottom: 20 },
    toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: SIZES.radiusSm },
    toggleBtnActive: { backgroundColor: COLORS.white, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
    toggleText: { fontSize: SIZES.sm, fontWeight: FONTS.semiBold, color: COLORS.medium },
    toggleTextActive: { color: COLORS.primary },

    // Date Nav
    dateNavigator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, padding: 12, borderRadius: SIZES.radius, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
    dateBtn: { padding: 8, backgroundColor: COLORS.light, borderRadius: 20 },
    dateText: { fontSize: SIZES.md, fontWeight: FONTS.bold, color: COLORS.dark },
    todayTag: { fontSize: 10, color: COLORS.primary, fontWeight: 'bold', marginTop: 2, textTransform: 'uppercase' },

    studentList: { paddingBottom: 40 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
    studentCountText: { fontSize: SIZES.sm, color: COLORS.medium, fontWeight: FONTS.semiBold },
    markAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '15', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
    markAllText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: FONTS.bold },

    studentCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    studentName: { fontSize: SIZES.md, fontWeight: FONTS.bold, color: COLORS.dark },
    studentRoll: { fontSize: SIZES.sm, color: COLORS.medium, marginTop: 2 },
    statusBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        width: 90,
        alignItems: 'center'
    },
    statusBtnText: { fontWeight: FONTS.bold, fontSize: SIZES.sm },

    summaryContainer: { paddingBottom: 40 },
    monthlyStudentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border }
});