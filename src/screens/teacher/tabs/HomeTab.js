// src/screens/teacher/tabs/HomeTab.js

import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { StatCard, SectionHeader, Card, Badge, EmptyState } from '../../../components';
import { COLORS } from '../../../constants/theme';


export default function HomeTab({ myClasses, myStudents, homework }) {

    return (
        <>
            <SectionHeader title="My Overview" />

            <View style={{ flexDirection: 'row' }}>
                <StatCard label="My Classes" value={myClasses.length}
                    icon={<MaterialCommunityIcons name="school" size={22} color="#fff" />}
                    color={COLORS.success}
                />
                <StatCard label="My Students" value={myStudents.length}
                    icon={<MaterialIcons name="people" size={22} color="#fff" />}
                    color={COLORS.info}
                />
            </View>


            <SectionHeader title="My Classes" />

            {myClasses.length === 0 ? (
                <EmptyState icon="school" message="No classes assigned yet." />
            ) : myClasses.map(c => (
                <Card key={c.id}>
                    <Text>{c.className} — Section {c.section}</Text>
                    <Badge label={`${myStudents.length} students`} color={COLORS.success} />
                </Card>
            ))}
        </>
    );
}