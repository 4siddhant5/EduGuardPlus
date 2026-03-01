// src/screens/teacher/tabs/StudentsTab.js

import React, { useState } from 'react';
import { View, Text, Modal, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SectionHeader, Card, RiskBadge, EmptyState, PrimaryButton } from '../../../components';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../../constants/theme';

const MetricChip = ({ icon, label }) => (
    <View style={{ backgroundColor: COLORS.light, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
        <Text style={{ fontSize: SIZES.xs, color: COLORS.dark, fontWeight: FONTS.semiBold }}>
            {icon === 'edit' ? '📝' : '📅'} {label}
        </Text>
    </View>
);
import { addStudent } from '../../../services/api';

export default function StudentsTab({ myStudents, myClasses, onRefresh, token }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedClass, setSelectedClass] = useState(myClasses?.length > 0 ? myClasses[0].id : null);
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [parentEmail, setParentEmail] = useState('');
    const [saving, setSaving] = useState(false);

    const handleAdd = async () => {
        if (!selectedClass || !name || !rollNumber || !parentEmail) {
            Alert.alert("Error", "Please fill all fields.");
            return;
        }
        setSaving(true);
        try {
            const classRef = myClasses.find(c => c.id === selectedClass);
            await addStudent({
                name,
                rollNumber,
                parentEmail,
                classId: selectedClass,
                className: classRef ? classRef.className : '',
                teacherId: classRef ? classRef.teacherId : '',
                attendance: 100, // default dummy stat
                marks: 0, // default dummy stat
                riskLevel: 'LOW',
                createdAt: new Date().toISOString()
            }, token);
            Alert.alert("Success", "Student added successfully!");
            setModalVisible(false);
            setName('');
            setRollNumber('');
            setParentEmail('');
            if (onRefresh) onRefresh();
        } catch (err) {
            Alert.alert("Error", err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <SectionHeader title="My Students" subtitle={`${myStudents.length} students`} />
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {myStudents.length === 0 ? (
                <EmptyState icon="people" message="No students assigned." />
            ) : myStudents.map(s => (
                <Card key={s.id}>
                    <Text style={styles.studentName}>{s.name} (Roll: {s.rollNumber || 'N/A'})</Text>

                    <View style={{ flexDirection: 'row', gap: 6, marginVertical: 8 }}>
                        <MetricChip icon="edit" label={`${s.marks || 0}%`} />
                        <MetricChip icon="calendar" label={`${s.attendance || 100}%`} />
                    </View>

                    <RiskBadge level={s.riskLevel || 'LOW'} />
                </Card>
            ))}

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalBg}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Add New Student</Text>

                        <Text style={styles.label}>Select Class</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classScroll}>
                            {myClasses && myClasses.map(c => (
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

                        <Text style={styles.label}>Student Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={styles.label}>Roll Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 101"
                            value={rollNumber}
                            onChangeText={setRollNumber}
                            keyboardType="numeric"
                        />

                        <Text style={styles.label}>Parent Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="parent@example.com"
                            value={parentEmail}
                            onChangeText={setParentEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <PrimaryButton
                            title="Save Student"
                            onPress={handleAdd}
                            loading={saving}
                            style={styles.saveBtn}
                        />
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingBottom: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 10 },
    addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    addBtnText: { color: COLORS.white, fontWeight: FONTS.bold, fontSize: SIZES.sm },
    studentName: { fontSize: SIZES.md, fontWeight: FONTS.bold, color: COLORS.dark },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalCard: { width: '90%', backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: 20, ...SHADOWS.card },
    modalTitle: { fontSize: SIZES.lg, fontWeight: FONTS.bold, color: COLORS.dark, marginBottom: 16 },
    label: { fontSize: SIZES.sm, color: COLORS.medium, marginBottom: 8, marginTop: 12 },
    input: { backgroundColor: COLORS.background, padding: 12, borderRadius: SIZES.radiusSm, borderWidth: 1, borderColor: COLORS.border, fontSize: SIZES.md },
    classScroll: { marginBottom: 10, maxHeight: 40 },
    classChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.background, marginRight: 10, borderWidth: 1, borderColor: COLORS.border },
    classChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    classChipText: { color: COLORS.medium, fontWeight: FONTS.semiBold, fontSize: SIZES.sm },
    classChipTextActive: { color: COLORS.white },
    saveBtn: { marginTop: 24 },
    cancelBtn: { marginTop: 12, alignItems: 'center', padding: 10 },
    cancelBtnText: { color: COLORS.danger, fontWeight: FONTS.bold }
});