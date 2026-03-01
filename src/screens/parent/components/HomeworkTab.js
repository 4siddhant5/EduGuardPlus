
// src/screens/parent/components/HomeworkTab.js

import React from 'react';
import { Text } from 'react-native';

import { Card, SectionHeader, Badge, EmptyState } from '../../../components';
import { COLORS } from '../../../constants/theme';

import ChildSelector from './ChildSelector';

export default function HomeworkTab({ myChildren, selected, setSelected, homework }) {

    return (
        <>
            <ChildSelector
                myChildren={myChildren}
                selected={selected}
                setSelected={setSelected}
            />

            <SectionHeader title="Homework & Assignments" />

            {homework.length === 0 ? (
                <EmptyState icon="book" message="No homework assigned yet." />
            ) : (
                homework.map(hw => (
                    <Card key={hw.id}>
                        <Text>{hw.subject}</Text>
                        <Badge label={`#${hw.assignmentNo}`} color={COLORS.info} />
                    </Card>
                ))
            )}
        </>
    );
}
