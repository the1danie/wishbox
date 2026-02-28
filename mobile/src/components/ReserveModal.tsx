import React, { useState } from 'react';
import {
    Modal, View, Text, TextInput, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { reservationsApi } from '../api/reservations';
import { ItemOut } from '../api/wishlists';
import { colors, spacing, radius, typography } from '../theme';

interface Props {
    visible: boolean;
    slug: string;
    item: ItemOut | null;
    onClose: () => void;
    onReserved: () => void;
}

export default function ReserveModal({ visible, slug, item, onClose, onReserved }: Props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const reset = () => { setName(''); setEmail(''); setError(''); };

    const handleReserve = async () => {
        if (!name.trim()) { setError('Your name is required'); return; }
        if (!item) return;
        setSaving(true); setError('');
        try {
            await reservationsApi.reserve(slug, item.id, { reserver_name: name.trim(), reserver_email: email.trim() || undefined });
            reset(); onReserved(); onClose();
        } catch (e: any) {
            setError(e?.response?.data?.detail || 'Failed to reserve item');
        } finally { setSaving(false); }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={styles.handle} />
                    <Text style={styles.emoji}>🎁</Text>
                    <Text style={styles.title}>Reserve "{item?.name}"</Text>
                    <Text style={styles.subtitle}>The wishlist owner won't know who reserved it — it's a surprise!</Text>

                    <Text style={styles.label}>Your name *</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName}
                        placeholder="e.g. Alex" placeholderTextColor={colors.textMuted} />

                    <Text style={styles.label}>Email (optional)</Text>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail}
                        placeholder="For reminders" placeholderTextColor={colors.textMuted}
                        keyboardType="email-address" autoCapitalize="none" />

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => { reset(); onClose(); }}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleReserve} disabled={saving}>
                            {saving ? <ActivityIndicator color={colors.white} size="small" />
                                : <Text style={styles.saveBtnText}>Reserve!</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
    sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md },
    emoji: { fontSize: 40, textAlign: 'center', marginBottom: spacing.sm },
    title: { ...typography.h2, textAlign: 'center', marginBottom: spacing.xs },
    subtitle: { color: colors.textSecondary, textAlign: 'center', fontSize: 13, marginBottom: spacing.lg },
    label: { ...typography.label, marginBottom: spacing.xs, marginTop: spacing.sm },
    input: { backgroundColor: colors.surfaceHigh, borderRadius: radius.md, color: colors.textPrimary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 15, borderWidth: 1, borderColor: colors.border },
    error: { color: colors.danger, marginTop: spacing.sm, fontSize: 13 },
    footer: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
    cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceHigh, alignItems: 'center' },
    cancelText: { color: colors.textSecondary, fontWeight: '600' },
    saveBtn: { flex: 2, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center' },
    saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
