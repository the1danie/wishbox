import React, { useState } from 'react';
import {
    Modal, View, Text, TextInput, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { wishlistApi } from '../api/wishlists';
import { colors, spacing, radius, typography } from '../theme';
import { EMOJIS } from '../constants';

interface Props {
    visible: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateWishlistModal({ visible, onClose, onCreated }: Props) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [emoji, setEmoji] = useState('🎁');
    const [isPublic, setIsPublic] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const reset = () => { setTitle(''); setDescription(''); setEmoji('🎁'); setIsPublic(true); setError(''); };

    const handleCreate = async () => {
        if (!title.trim()) { setError('Title is required'); return; }
        setSaving(true); setError('');
        try {
            await wishlistApi.create({ title: title.trim(), description: description.trim() || undefined, cover_emoji: emoji, is_public: isPublic });
            reset(); onCreated(); onClose();
        } catch (e: any) {
            setError(e?.response?.data?.detail || 'Failed to create wishlist');
        } finally { setSaving(false); }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={styles.handle} />
                    <Text style={styles.title}>New Wishlist</Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Emoji picker */}
                        <Text style={styles.label}>Choose an emoji</Text>
                        <View style={styles.emojiRow}>
                            {EMOJIS.map(e => (
                                <TouchableOpacity key={e} onPress={() => setEmoji(e)}
                                    style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}>
                                    <Text style={{ fontSize: 24 }}>{e}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Title *</Text>
                        <TextInput style={styles.input} value={title} onChangeText={setTitle}
                            placeholder="Birthday, New Year..." placeholderTextColor={colors.textMuted} />

                        <Text style={styles.label}>Description</Text>
                        <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            value={description} onChangeText={setDescription} multiline
                            placeholder="Optional note for your friends" placeholderTextColor={colors.textMuted} />

                        <View style={styles.toggleRow}>
                            <View>
                                <Text style={styles.label}>Public</Text>
                                <Text style={styles.toggleHint}>Friends can open it via link</Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsPublic(v => !v)}
                                style={[styles.toggle, isPublic && styles.toggleActive]}>
                                <Text style={{ color: isPublic ? colors.white : colors.textMuted, fontWeight: '700', fontSize: 13 }}>
                                    {isPublic ? 'ON' : 'OFF'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {error ? <Text style={styles.error}>{error}</Text> : null}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => { reset(); onClose(); }}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={saving}>
                            {saving ? <ActivityIndicator color={colors.white} size="small" />
                                : <Text style={styles.saveBtnText}>Create</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
    sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '85%' },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md },
    title: { ...typography.h2, marginBottom: spacing.md },
    label: { ...typography.label, marginBottom: spacing.xs, marginTop: spacing.sm },
    input: { backgroundColor: colors.surfaceHigh, borderRadius: radius.md, color: colors.textPrimary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 15, borderWidth: 1, borderColor: colors.border },
    emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
    emojiBtn: { padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceHigh, borderWidth: 2, borderColor: 'transparent' },
    emojiBtnActive: { borderColor: colors.accent, backgroundColor: colors.accent + '22' },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
    toggle: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surfaceHigh },
    toggleActive: { backgroundColor: colors.accent },
    toggleHint: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    error: { color: colors.danger, marginTop: spacing.sm, fontSize: 13 },
    footer: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
    cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceHigh, alignItems: 'center' },
    cancelText: { color: colors.textSecondary, fontWeight: '600' },
    saveBtn: { flex: 2, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center' },
    saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
