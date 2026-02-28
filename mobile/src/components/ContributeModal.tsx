import React, { useState } from 'react';
import {
    Modal, View, Text, TextInput, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { contributionsApi } from '../api/contributions';
import { ItemOut } from '../api/wishlists';
import ProgressBar from './ProgressBar';
import { colors, spacing, radius, typography } from '../theme';

interface Props {
    visible: boolean;
    slug: string;
    item: ItemOut | null;
    onClose: () => void;
    onContributed: () => void;
}

export default function ContributeModal({ visible, slug, item, onClose, onContributed }: Props) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const reset = () => { setName(''); setAmount(''); setError(''); };

    const progress = item && item.target_amount && Number(item.target_amount) > 0
        ? Number(item.total_contributed) / Number(item.target_amount) : 0;
    const remaining = item && item.target_amount
        ? Math.max(0, Number(item.target_amount) - Number(item.total_contributed)) : null;

    const handleContribute = async () => {
        if (!name.trim()) { setError('Your name is required'); return; }
        const amtNum = parseFloat(amount);
        if (!amtNum || amtNum <= 0) { setError('Enter a valid amount'); return; }
        if (!item) return;
        setSaving(true); setError('');
        try {
            await contributionsApi.contribute(slug, item.id, { contributor_name: name.trim(), amount: amtNum });
            reset(); onContributed(); onClose();
        } catch (e: any) {
            setError(e?.response?.data?.detail || 'Failed to contribute');
        } finally { setSaving(false); }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={styles.handle} />
                    <Text style={styles.emoji}>💰</Text>
                    <Text style={styles.title}>Contribute to "{item?.name}"</Text>

                    {item && item.target_amount ? (
                        <View style={styles.progressSection}>
                            <ProgressBar value={progress} height={8} color={progress >= 1 ? colors.success : colors.accent} />
                            <Text style={styles.progressLabel}>
                                ₽{Number(item.total_contributed).toLocaleString()} of ₽{Number(item.target_amount).toLocaleString()}
                                {remaining !== null && remaining > 0 ? ` · ₽${remaining.toLocaleString()} remaining` : ' · Goal reached! 🎉'}
                            </Text>
                        </View>
                    ) : null}

                    <Text style={styles.label}>Your name *</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName}
                        placeholder="e.g. Alex" placeholderTextColor={colors.textMuted} />

                    <Text style={styles.label}>Amount (₽) *</Text>
                    <TextInput style={styles.input} value={amount} onChangeText={setAmount}
                        placeholder="e.g. 500" placeholderTextColor={colors.textMuted} keyboardType="numeric" />

                    <Text style={styles.hint}>The wishlist owner won't see who contributed how much.</Text>

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => { reset(); onClose(); }}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleContribute} disabled={saving}>
                            {saving ? <ActivityIndicator color={colors.white} size="small" />
                                : <Text style={styles.saveBtnText}>Contribute!</Text>}
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
    title: { ...typography.h2, textAlign: 'center', marginBottom: spacing.md },
    progressSection: { marginBottom: spacing.md },
    progressLabel: { color: colors.textSecondary, fontSize: 13, marginTop: 6, textAlign: 'center' },
    label: { ...typography.label, marginBottom: spacing.xs, marginTop: spacing.sm },
    input: { backgroundColor: colors.surfaceHigh, borderRadius: radius.md, color: colors.textPrimary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 15, borderWidth: 1, borderColor: colors.border },
    hint: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm, textAlign: 'center' },
    error: { color: colors.danger, marginTop: spacing.sm, fontSize: 13 },
    footer: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
    cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceHigh, alignItems: 'center' },
    cancelText: { color: colors.textSecondary, fontWeight: '600' },
    saveBtn: { flex: 2, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.success, alignItems: 'center' },
    saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
