import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';

interface Props {
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: string;
}

export default function EmptyState({ title, message, actionLabel, onAction, icon = '🎁' }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {actionLabel && onAction && (
                <TouchableOpacity style={styles.btn} onPress={onAction} activeOpacity={0.8}>
                    <Text style={styles.btnText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    icon: { fontSize: 64, marginBottom: spacing.md },
    title: { ...typography.h2, textAlign: 'center', marginBottom: spacing.sm },
    message: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
    btn: {
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.full,
    },
    btnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
