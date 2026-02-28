import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, radius, typography } from '../../theme';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isLoading } = useAuthStore();

    const handleLogin = async () => {
        if (!email.trim() || !password) { setError('Please fill in all fields'); return; }
        setError('');
        try {
            await login(email.trim(), password);
        } catch (e: any) {
            setError(e?.response?.data?.detail || 'Invalid email or password');
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <Text style={styles.logoEmoji}>🎁</Text>
                        <Text style={styles.logo}>WishBox</Text>
                        <Text style={styles.tagline}>Share your dreams, receive perfect gifts</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.title}>Welcome back</Text>

                        <Text style={styles.label}>Email</Text>
                        <TextInput style={styles.input} value={email} onChangeText={setEmail}
                            placeholder="you@example.com" placeholderTextColor={colors.textMuted}
                            keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />

                        <Text style={styles.label}>Password</Text>
                        <TextInput style={styles.input} value={password} onChangeText={setPassword}
                            placeholder="••••••" placeholderTextColor={colors.textMuted} secureTextEntry />

                        {error ? <Text style={styles.error}>{error}</Text> : null}

                        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={isLoading} activeOpacity={0.85}>
                            {isLoading ? <ActivityIndicator color={colors.white} />
                                : <Text style={styles.btnText}>Log In</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkRow}>
                            <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Sign up</Text></Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    kav: { flex: 1 },
    container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
    header: { alignItems: 'center', marginBottom: spacing.xl },
    logoEmoji: { fontSize: 60, marginBottom: spacing.sm },
    logo: { fontSize: 34, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
    tagline: { color: colors.textSecondary, fontSize: 14, marginTop: spacing.xs, textAlign: 'center' },
    card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
    title: { ...typography.h2, marginBottom: spacing.lg },
    label: { ...typography.label, marginBottom: spacing.xs, marginTop: spacing.md },
    input: { backgroundColor: colors.surfaceHigh, borderRadius: radius.md, color: colors.textPrimary, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: 15, borderWidth: 1, borderColor: colors.border },
    error: { color: colors.danger, marginTop: spacing.md, fontSize: 13 },
    btn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
    btnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
    linkRow: { marginTop: spacing.lg, alignItems: 'center' },
    link: { color: colors.textSecondary, fontSize: 14 },
    linkBold: { color: colors.accentLight, fontWeight: '700' },
});
