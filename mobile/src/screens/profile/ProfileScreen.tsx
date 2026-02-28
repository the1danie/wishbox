import React from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, radius, typography } from '../../theme';

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function ProfileScreen() {
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        Alert.alert('Log out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log out', style: 'destructive', onPress: logout },
        ]);
    };

    if (!user) return null;

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
                    </View>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.email}>{user.email}</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Name</Text>
                        <Text style={styles.rowValue}>{user.name}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Email</Text>
                        <Text style={styles.rowValue}>{user.email}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Member since</Text>
                        <Text style={styles.rowValue}>
                            {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        </Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>App version</Text>
                        <Text style={styles.rowValue}>1.0.0</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    container: { flex: 1, padding: spacing.lg },
    header: { alignItems: 'center', paddingVertical: spacing.xl },
    avatar: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: colors.accent,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatarText: { color: colors.white, fontSize: 28, fontWeight: '700' },
    name: { ...typography.h2, marginBottom: spacing.xs },
    email: { color: colors.textSecondary, fontSize: 14 },
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md },
    rowLabel: { ...typography.label },
    rowValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '500' },
    divider: { height: 1, backgroundColor: colors.border },
    logoutBtn: {
        backgroundColor: colors.danger + '22',
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    logoutText: { color: colors.danger, fontWeight: '700', fontSize: 16 },
});
