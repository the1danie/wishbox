import React, { useState } from 'react';
import {
    Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
    KeyboardAvoidingView, Platform, ActivityIndicator, Switch,
} from 'react-native';
import { itemsApi } from '../api/items';
import { scraperApi } from '../api/scraper';
import { colors, spacing, radius, typography } from '../theme';

interface Props {
    visible: boolean;
    slug: string;
    onClose: () => void;
    onAdded: () => void;
}

export default function AddItemModal({ visible, slug, onClose, onAdded }: Props) {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState(2);
    const [isGroup, setIsGroup] = useState(false);
    const [targetAmount, setTargetAmount] = useState('');
    const [scraping, setScraping] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const reset = () => {
        setName(''); setUrl(''); setPrice(''); setImageUrl('');
        setDescription(''); setPriority(2); setIsGroup(false);
        setTargetAmount(''); setError('');
    };

    const handleScrape = async () => {
        if (!url.trim()) return;
        setScraping(true);
        try {
            const res = await scraperApi.scrapeUrl(url.trim());
            if (res.data.name) setName(res.data.name);
            if (res.data.price) setPrice(String(res.data.price));
            if (res.data.image_url) setImageUrl(res.data.image_url);
            if (res.data.description) setDescription(res.data.description);
        } catch {
            setError('Could not fetch URL info');
        } finally {
            setScraping(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) { setError('Name is required'); return; }
        setSaving(true);
        setError('');
        try {
            await itemsApi.add(slug, {
                name: name.trim(),
                url: url.trim() || undefined,
                price: price ? Number(price) : undefined,
                image_url: imageUrl.trim() || undefined,
                description: description.trim() || undefined,
                priority,
                is_group_gift: isGroup,
                target_amount: isGroup && targetAmount ? Number(targetAmount) : undefined,
            });
            reset();
            onAdded();
            onClose();
        } catch (e: any) {
            setError(e?.response?.data?.detail || 'Failed to add item');
        } finally {
            setSaving(false);
        }
    };

    const PRIORITIES = [{ v: 1, l: 'Low' }, { v: 2, l: 'Medium' }, { v: 3, l: 'High' }];

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={styles.handle} />
                    <Text style={styles.title}>Add Item</Text>
                    <ScrollView showsVerticalScrollIndicator={false}>

                        {/* URL + scrape */}
                        <Text style={styles.label}>Product URL</Text>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={url} onChangeText={setUrl}
                                placeholder="https://..." placeholderTextColor={colors.textMuted}
                                autoCapitalize="none" keyboardType="url"
                            />
                            <TouchableOpacity style={styles.scrapeBtn} onPress={handleScrape} disabled={scraping}>
                                {scraping ? <ActivityIndicator color={colors.white} size="small" />
                                    : <Text style={styles.scrapeBtnText}>Fetch</Text>}
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Name *</Text>
                        <TextInput style={styles.input} value={name} onChangeText={setName}
                            placeholder="Item name" placeholderTextColor={colors.textMuted} />

                        <Text style={styles.label}>Price (₽)</Text>
                        <TextInput style={styles.input} value={price} onChangeText={setPrice}
                            placeholder="0" placeholderTextColor={colors.textMuted} keyboardType="numeric" />

                        <Text style={styles.label}>Image URL</Text>
                        <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl}
                            placeholder="https://..." placeholderTextColor={colors.textMuted}
                            autoCapitalize="none" keyboardType="url" />

                        <Text style={styles.label}>Description</Text>
                        <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            value={description} onChangeText={setDescription} multiline
                            placeholder="Optional description" placeholderTextColor={colors.textMuted} />

                        <Text style={styles.label}>Priority</Text>
                        <View style={styles.row}>
                            {PRIORITIES.map(p => (
                                <TouchableOpacity key={p.v} onPress={() => setPriority(p.v)}
                                    style={[styles.priorityBtn, priority === p.v && styles.priorityBtnActive]}>
                                    <Text style={[styles.priorityBtnText, priority === p.v && styles.priorityBtnTextActive]}>{p.l}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.switchRow}>
                            <Text style={styles.label}>Group gift (collect from friends)</Text>
                            <Switch value={isGroup} onValueChange={setIsGroup}
                                trackColor={{ false: colors.border, true: colors.accent }} />
                        </View>

                        {isGroup && (
                            <>
                                <Text style={styles.label}>Target amount (₽)</Text>
                                <TextInput style={styles.input} value={targetAmount} onChangeText={setTargetAmount}
                                    placeholder="e.g. 5000" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
                            </>
                        )}

                        {error ? <Text style={styles.error}>{error}</Text> : null}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => { reset(); onClose(); }}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                            {saving ? <ActivityIndicator color={colors.white} size="small" />
                                : <Text style={styles.saveBtnText}>Add Item</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
    sheet: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        padding: spacing.lg,
        maxHeight: '90%',
    },
    handle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md,
    },
    title: { ...typography.h2, marginBottom: spacing.md },
    label: { ...typography.label, marginBottom: spacing.xs, marginTop: spacing.sm },
    input: {
        backgroundColor: colors.surfaceHigh,
        borderRadius: radius.md,
        color: colors.textPrimary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: 15,
        borderWidth: 1,
        borderColor: colors.border,
    },
    row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
    scrapeBtn: {
        backgroundColor: colors.accent,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        height: 46,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 64,
    },
    scrapeBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
    priorityBtn: {
        flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md,
        backgroundColor: colors.surfaceHigh, alignItems: 'center',
        borderWidth: 1, borderColor: colors.border,
    },
    priorityBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
    priorityBtnText: { color: colors.textSecondary, fontWeight: '600', fontSize: 13 },
    priorityBtnTextActive: { color: colors.white },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
    error: { color: colors.danger, marginTop: spacing.sm, fontSize: 13 },
    footer: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
    cancelBtn: {
        flex: 1, paddingVertical: spacing.md, borderRadius: radius.md,
        backgroundColor: colors.surfaceHigh, alignItems: 'center',
    },
    cancelText: { color: colors.textSecondary, fontWeight: '600' },
    saveBtn: {
        flex: 2, paddingVertical: spacing.md, borderRadius: radius.md,
        backgroundColor: colors.accent, alignItems: 'center',
    },
    saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
