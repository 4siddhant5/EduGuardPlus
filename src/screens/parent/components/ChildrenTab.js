
// src/screens/parent/components/ChildrenTab.js

import React from 'react';
import { View, Text } from 'react-native';

import { Card, SectionHeader, StatCard, RiskBadge, EmptyState, Graph } from '../../../components';
import { COLORS } from '../../../constants/theme';
import { calculateRiskScore } from '../../../utils/Algo';

import ChildSelector from './ChildSelector';

export default function ChildrenTab({ myChildren, selected, setSelected, attendance, homework }) {

    const selectedChild = myChildren.find(c => c.id === selected);

    if (!selectedChild) {
        return (
            <>
                <ChildSelector
                    myChildren={myChildren}
                    selected={selected}
                    setSelected={setSelected}
                />
                <EmptyState icon="account-child" message="No children linked to your account." />
            </>
        );
    }

    const marks = Number(selectedChild.marks) || 0;
    const attPercent = Number(selectedChild.attendance) || 0;

    const childHw = homework?.filter(h => h.classId === selectedChild.classId) || [];
    const hwPercent = Number(selectedChild.homeworkScore) || (childHw.length > 0 ? 80 : 0);

    const { score, riskLevel } = calculateRiskScore(marks, attPercent, hwPercent);

    const graphData = [
        { label: 'Marks', value: marks, color: COLORS.info },
        { label: 'Attendance', value: attPercent, color: COLORS.success },
        { label: 'Homework', value: hwPercent, color: COLORS.primary },
    ];

    return (
        <>
            <ChildSelector
                myChildren={myChildren}
                selected={selected}
                setSelected={setSelected}
            />

            <Card>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>{selectedChild.name}</Text>
                <RiskBadge level={riskLevel} />
            </Card>

            <SectionHeader title="Performance Overview" />
            <Graph data={graphData} />

            <SectionHeader title="Performance Details" />

            <View style={{ flexDirection: 'row' }}>
                <StatCard label="Overall Score" value={score} color={COLORS.primary} />
                <StatCard label="Marks" value={marks} color={COLORS.info} />
            </View>
            <View style={{ flexDirection: 'row' }}>
                <StatCard label="Attendance" value={`${attPercent}%`} color={COLORS.success} />
                <StatCard label="Homework" value={`${hwPercent}%`} color={COLORS.warning} />
            </View>
        </>
    );
}
