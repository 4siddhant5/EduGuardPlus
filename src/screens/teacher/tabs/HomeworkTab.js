// src/screens/teacher/tabs/HomeworkTab.js

import React, { useState } from 'react';
import { View, Text, Modal, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SectionHeader, Card, EmptyState, PrimaryButton } from '../../../components';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../../constants/theme';
import { addHomework } from '../../../services/api';

export default function HomeworkTab({ homework, myClasses, onRefresh, token }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedClass, setSelectedClass] = useState(myClasses.length > 0 ? myClasses[0].id : null);
    const [subject, setSubject] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [saving, setSaving] = useState(false);

    const handleAdd = async () => {
        if (!selectedClass || !subject || !dueDate) {
            Alert.alert("Error", "Please fill all fields.");
            return;
        }
        setSaving(true);
        try {
            await addHomework(selectedClass, {
                subject,
                dueDate,
                createdAt: new Date().toISOString()
            }, token);
            Alert.alert("Success", "Assignment added successfully!");
            setModalVisible(false);
            setSubject('');
            setDueDate('');
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
                <SectionHeader title="Assignments" subtitle={`${homework.length}`} />
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {homework.length === 0 ? (
                <EmptyState icon="book" message="No assignments posted." />
            ) : homework.map(hw => (
                <Card key={hw.id}>
                    <Text style={styles.hwClass}>{hw.className}</Text>
                    <Text style={styles.hwSubject}>{hw.subject}</Text>
                    <Text style={styles.hwDue}>Due: {hw.dueDate}</Text>
                </Card>
            ))}

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalBg}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Add Assignment</Text>

                        <Text style={styles.label}>Select Class</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classScroll}>
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

                        <Text style={styles.label}>Subject & Details</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Math Ch-5 Exercise"
                            value={subject}
                            onChangeText={setSubject}
                        />

                        <Text style={styles.label}>Due Date</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="YYYY-MM-DD"
                            value={dueDate}
                            onChangeText={setDueDate}
                        />

                        <PrimaryButton
                            title="Save Assignment"
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
    hwClass: { fontSize: SIZES.xs, color: COLORS.primary, fontWeight: FONTS.bold, marginBottom: 4 },
    hwSubject: { fontSize: SIZES.md, color: COLORS.dark, fontWeight: FONTS.semiBold },
    hwDue: { fontSize: SIZES.sm, color: COLORS.medium, marginTop: 4 },
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