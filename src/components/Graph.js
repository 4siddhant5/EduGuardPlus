// src/components/Graph.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

/**
 * A simple, cross-platform Bar Chart component.
 * @param {Array} data - Array of objects: { label: string, value: number, color: string }
 * @param {number} maxValue - Maximum value for the Y-axis scale (default: 100)
 */
export default function Graph({ data = [], maxValue = 100 }) {
    if (!data || data.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.chartArea}>
                {data.map((item, index) => {
                    const val = Number(item.value) || 0;
                    const validMax = Number(maxValue) || 100;
                    const heightPercent = Math.min(Math.max((val / validMax) * 100, 0), 100) || 0;

                    return (
                        <View key={index} style={styles.barContainer}>
                            <Text style={styles.valueText}>{Math.round(val)}</Text>
                            <View style={styles.barBackground}>
                                <View
                                    style={[
                                        styles.barFill,
                                        { height: `${heightPercent}%`, backgroundColor: item.color || COLORS.primary }
                                    ]}
                                />
                            </View>
                            <Text style={styles.labelText} numberOfLines={1}>{item.label}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: SIZES.padding,
        padding: SIZES.padding,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        width: '100%',
        alignSelf: 'stretch',
    },
    chartArea: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 150,
        paddingTop: 20,
        paddingBottom: 10,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
    },
    barBackground: {
        width: 30,
        height: 100,
        backgroundColor: COLORS.light,
        borderRadius: 4,
        justifyContent: 'flex-end',
        overflow: 'hidden',
        marginVertical: 5,
    },
    barFill: {
        width: '100%',
        borderRadius: 4,
    },
    valueText: {
        fontSize: SIZES.xs,
        color: COLORS.dark,
        fontWeight: FONTS.bold,
    },
    labelText: {
        fontSize: SIZES.xs,
        color: COLORS.medium,
        marginTop: 4,
        textAlign: 'center',
    }
});
