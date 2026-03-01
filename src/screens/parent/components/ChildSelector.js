// src/screens/parent/components/ChildSelector.js

import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from '../../../constants/theme';

export default function ChildSelector({ myChildren, selected, setSelected }) {

    if (myChildren.length <= 1) return null;

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorWrap}>
            {myChildren.map(child => (
                <TouchableOpacity
                    key={child.id}
                    style={[styles.selectorChip, selected === child.id && styles.selectorChipActive]}
                    onPress={() => setSelected(child.id)}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MaterialCommunityIcons
                            name="account-school"
                            size={16}
                            color={selected === child.id ? '#fff' : COLORS.dark}
                        />
                        <Text style={[styles.selectorText, selected === child.id && styles.selectorTextActive]}>
                            {child.name}
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({

    selectorWrap: { marginBottom: 12 },

    selectorChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.border,
        marginRight: 8
    },

    selectorChipActive: { backgroundColor: COLORS.warning },

    selectorText: { fontSize: SIZES.sm, color: COLORS.dark },

    selectorTextActive: {
        color: '#fff',
        fontWeight: FONTS.bold
    },

});
