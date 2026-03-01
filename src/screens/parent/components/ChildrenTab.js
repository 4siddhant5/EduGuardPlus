
// src/screens/parent/components/ChildrenTab.js

import React from 'react';
import { View, Text } from 'react-native';

import { Card, SectionHeader, StatCard, RiskBadge, EmptyState } from '../../../components';
import { COLORS } from '../../../constants/theme';

import ChildSelector from './ChildSelector';

export default function ChildrenTab({ myChildren, selected, setSelected, attendance }) {

    const selectedChild = myChildren.find(c => c.id === selected);

    return (
        <>
            <ChildSelector
                myChildren={myChildren}
                selected={selected}
                setSelected={setSelected}
            />

            {!selectedChild ? (
                <EmptyState icon="account-child" message="No children linked to your account." />
            ) : (
                <>
                    <Card>
                        <Text>{selectedChild.name}</Text>
                        <RiskBadge level={selectedChild.riskLevel} />
                    </Card>

                    <SectionHeader title="Performance" />

                    <StatCard label="Marks" value={`${selectedChild.marks ?? 'N/A'}`} color={COLORS.info} />
                    <StatCard label="Attendance" value={`${selectedChild.attendance ?? 'N/A'}`} color={COLORS.success} />
                </>
            )}
        </>
    );
}
