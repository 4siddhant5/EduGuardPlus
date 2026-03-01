
// src/screens/parent/components/ChildrenTab.js

import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';

import { Card, SectionHeader, StatCard, RiskBadge, EmptyState } from '../../../components';
import { COLORS } from '../../../constants/theme';
import { calculateRiskScore } from '../../../utils/Algo';

import ChildSelector from './ChildSelector';

const screenWidth = Dimensions.get("window").width;

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

    const pieData = [
        {
            name: 'Marks',
            population: marks,
            color: COLORS.info,
            legendFontColor: '#7F7F7F',
            legendFontSize: 13,
        },
        {
            name: 'Attendance',
            population: attPercent,
            color: COLORS.success,
            legendFontColor: '#7F7F7F',
            legendFontSize: 13,
        },
        {
            name: 'Homework',
            population: hwPercent,
            color: COLORS.warning,
            legendFontColor: '#7F7F7F',
            legendFontSize: 13,
        },
    ];

    const barData = {
        labels: ["Marks", "Attendance", "Homework"],
        datasets: [
            {
                data: [marks, attPercent, hwPercent]
            }
        ]
    };

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

            <SectionHeader title="Risk Analysis Overview" />

            <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <PieChart
                    data={pieData}
                    width={screenWidth - 40}
                    height={200}
                    chartConfig={{
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    center={[10, 0]}
                    absolute
                />
            </View>

            <SectionHeader title="Factor Breakdown" />

            <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <BarChart
                    data={barData}
                    width={screenWidth - 40}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix="%"
                    chartConfig={{
                        backgroundColor: COLORS.white,
                        backgroundGradientFrom: COLORS.white,
                        backgroundGradientTo: COLORS.white,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(90, 103, 216, ${opacity})`, // Using primary color
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        barPercentage: 0.6,
                    }}
                    style={{
                        marginVertical: 8,
                        borderRadius: 16
                    }}
                    showValuesOnTopOfBars={true}
                />
            </View>

            <SectionHeader title="Performance Details" />

            <View style={{ flexDirection: 'row' }}>
                <StatCard label="Overall Risk" value={`${score}%`} color={riskLevel === 'HIGH' ? COLORS.danger : riskLevel === 'MEDIUM' ? COLORS.warning : COLORS.success} />
                <StatCard label="Marks" value={`${marks}%`} color={COLORS.info} />
            </View>
            <View style={{ flexDirection: 'row' }}>
                <StatCard label="Attendance" value={`${attPercent}%`} color={COLORS.success} />
                <StatCard label="Homework" value={`${hwPercent}%`} color={COLORS.warning} />
            </View>

            <SectionHeader title="Suggestions & Improvements" />
            <Card style={{ backgroundColor: riskLevel === 'HIGH' ? '#FEF2F2' : riskLevel === 'MEDIUM' ? '#FFFBEB' : '#F0FDF4', borderColor: riskLevel === 'HIGH' ? COLORS.danger : riskLevel === 'MEDIUM' ? COLORS.warning : COLORS.success, borderWidth: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.dark, marginBottom: 8 }}>Action Plan for {selectedChild.name}</Text>
                {riskLevel === 'HIGH' && (
                    <Text style={{ fontSize: 14, color: COLORS.medium, lineHeight: 22 }}>
                        • 🚨 <Text style={{ fontWeight: 'bold' }}>Critical:</Text> The current risk score is very high ({score}%). Immediate intervention is required.{"\n"}
                        • <Text style={{ fontWeight: 'bold' }}>Attendance:</Text> Ensure your child attends classes regularly. Attendance directly impacts comprehension.{"\n"}
                        • <Text style={{ fontWeight: 'bold' }}>Homework:</Text> Establish a strict daily routine for completing assignments.{"\n"}
                        • <Text style={{ fontWeight: 'bold' }}>Action:</Text> Please schedule a meeting with the teacher as soon as possible to discuss a recovery plan.
                    </Text>
                )}
                {riskLevel === 'MEDIUM' && (
                    <Text style={{ fontSize: 14, color: COLORS.medium, lineHeight: 22 }}>
                        • ⚠️ <Text style={{ fontWeight: 'bold' }}>Warning:</Text> The risk score ({score}%) indicates there is significant room for improvement.{"\n"}
                        • <Text style={{ fontWeight: 'bold' }}>Focus Areas:</Text> Review the factor breakdown chart above to see which specific area (Marks, Attendance, or Homework) is lagging.{"\n"}
                        • <Text style={{ fontWeight: 'bold' }}>Action:</Text> Dedicate an extra 30-45 minutes a day to reviewing class materials with your child.
                    </Text>
                )}
                {riskLevel === 'LOW' && (
                    <Text style={{ fontSize: 14, color: COLORS.medium, lineHeight: 22 }}>
                        • ✅ <Text style={{ fontWeight: 'bold' }}>Excellent:</Text> The risk score ({score}%) is incredibly low! Your child is performing very well.{"\n"}
                        • <Text style={{ fontWeight: 'bold' }}>Praise:</Text> Acknowledge their hard work in maintaining high marks, excellent attendance, and consistent homework completion.{"\n"}
                        • <Text style={{ fontWeight: 'bold' }}>Action:</Text> Keep up the great work and encourage them to maintain these positive habits!
                    </Text>
                )}
            </Card>
        </>
    );
}
