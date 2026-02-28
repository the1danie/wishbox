import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
    value: number;   // 0–1
    height?: number;
    color?: string;
}

export default function ProgressBar({ value, height = 6, color = colors.accent }: Props) {
    const clampedValue = Math.min(Math.max(value, 0), 1);
    return (
        <View style={[styles.track, { height }]}>
            <View style={[styles.fill, { width: `${clampedValue * 100}%`, backgroundColor: color, height }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        backgroundColor: colors.border,
        borderRadius: radius.full,
        overflow: 'hidden',
        width: '100%',
    },
    fill: {
        borderRadius: radius.full,
    },
});
