// src/screens/teacher/tabs/AttendanceTab.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SectionHeader, PrimaryButton, EmptyState, Card } from '../../../components';
import { COLORS, SIZES, FONTS } from '../../../constants/theme';
import { markAttendance } from '../../../services/api';

export default function AttendanceTab({ myClasses, myStudents, onRefresh, token }) {
    const [selectedClass, setSelectedClass] = useState(myClasses.length > 0 ? myClasses[0].id : null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});
    const [saving, setSaving] = useState(false);

    const filteredStudents = myStudents.filter(s => s.classId === selectedClass);

    const toggleAttendance = (studentId) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
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

    return (
        <View style={styles.container}>
            <SectionHeader title="Mark Attendance" subtitle={`For ${date}`} />

            {myClasses.length === 0 ? (
                <EmptyState icon="class" message="No classes assigned." />
            ) : (
                <>
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

                    {filteredStudents.length === 0 ? (
                        <EmptyState icon="people" message="No students in this class." />
                    ) : (
                        <View style={styles.studentList}>
                            {filteredStudents.map(s => (
                                <Card key={s.id} style={styles.studentCard}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.studentName}>{s.name}</Text>
                                        <Text style={styles.studentRoll}>Roll: {s.rollNumber}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[
                                            styles.statusBtn,
                                            { backgroundColor: attendanceData[s.id] === 'Present' ? COLORS.success : COLORS.danger }
                                        ]}
                                        onPress={() => toggleAttendance(s.id)}
                                    >
                                        <Text style={styles.statusBtnText}>
                                            {attendanceData[s.id] === 'Present' ? 'Present' : 'Absent'}
                                        </Text>
                                    </TouchableOpacity>
                                </Card>
                            ))}

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    classSelector: { marginBottom: 20 },
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
    studentList: { paddingBottom: 40 },
    studentCard: { flexDirection: 'row', alignItems: 'center' },
    studentName: { fontSize: SIZES.md, fontWeight: FONTS.bold, color: COLORS.dark },
    studentRoll: { fontSize: SIZES.sm, color: COLORS.medium },
    statusBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    statusBtnText: { color: COLORS.white, fontWeight: FONTS.bold }
});