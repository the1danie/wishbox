import React from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity, Animated,
} from 'react-native';
import { ItemOut } from '../api/wishlists';
import ProgressBar from './ProgressBar';
import { colors, spacing, radius, typography } from '../theme';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../constants';

interface Props {
    item: ItemOut;
    isOwner: boolean;
    onReserve?: (item: ItemOut) => void;
    onContribute?: (item: ItemOut) => void;
    onDelete?: (item: ItemOut) => void;
}

export default function ItemCard({ item, isOwner, onReserve, onContribute, onDelete }: Props) {
    const scale = React.useRef(new Animated.Value(1)).current;
    const handlePressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
    const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    const progress = item.target_amount && Number(item.target_amount) > 0
        ? Number(item.total_contributed) / Number(item.target_amount)
        : 0;

    const priceLabel = item.price ? `₽${Number(item.price).toLocaleString()}` : null;
    const priorityColor = PRIORITY_COLORS[item.priority] || colors.textMuted;

    return (
        <Animated.View style={[styles.card, { transform: [{ scale }] }, item.is_reserved && styles.cardReserved]}>
            {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
            ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                    <Text style={{ fontSize: 28 }}>🎁</Text>
                </View>
            )}
            <View style={styles.content}>
                {/* Priority badge */}
                <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '22' }]}>
                    <Text style={[styles.priorityText, { color: priorityColor }]}>{PRIORITY_LABELS[item.priority]}</Text>
                </View>

                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>

                {priceLabel && <Text style={styles.price}>{priceLabel}</Text>}

                {item.description ? (
                    <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                ) : null}

                {/* Group gift progress */}
                {item.is_group_gift && item.target_amount ? (
                    <View style={styles.progressSection}>
                        <ProgressBar value={progress} height={6} color={progress >= 1 ? colors.success : colors.accent} />
                        <Text style={styles.progressLabel}>
                            ₽{Number(item.total_contributed).toLocaleString()} / ₽{Number(item.target_amount).toLocaleString()}
                            {item.contributors_count > 0 ? ` · ${item.contributors_count} contributors` : ''}
                        </Text>
                    </View>
                ) : null}

                {/* Reserved status */}
                {item.is_reserved && !item.is_group_gift && (
                    <View style={styles.reservedBadge}>
                        <Text style={styles.reservedText}>✓ Reserved</Text>
                    </View>
                )}

                {/* Actions */}
                {!isOwner && (
                    <View style={styles.actions}>
                        {!item.is_group_gift && !item.is_reserved && (
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => onReserve?.(item)}
                                onPressIn={handlePressIn}
                                onPressOut={handlePressOut}
                                activeOpacity={0.8}>
                                <Text style={styles.actionBtnText}>Reserve 🎁</Text>
                            </TouchableOpacity>
                        )}
                        {item.is_group_gift && progress < 1 && (
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: colors.success + '22' }]}
                                onPress={() => onContribute?.(item)}
                                activeOpacity={0.8}>
                                <Text style={[styles.actionBtnText, { color: colors.success }]}>Contribute 💰</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {isOwner && (
                    <View style={styles.actions}>
                        {item.url ? (
                            <Text style={styles.url} numberOfLines={1}>🔗 {item.url}</Text>
                        ) : null}
                        <TouchableOpacity onPress={() => onDelete?.(item)} style={styles.deleteBtn} activeOpacity={0.7}>
                            <Text style={styles.deleteBtnText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardReserved: {
        opacity: 0.7,
        borderColor: colors.success + '44',
    },
    image: {
        width: '100%',
        height: 180,
        backgroundColor: colors.surfaceHigh,
    },
    imagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 120,
    },
    content: { padding: spacing.md },
    priorityBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.full,
        marginBottom: spacing.sm,
    },
    priorityText: { fontSize: 11, fontWeight: '700' },
    name: { ...typography.h3, marginBottom: spacing.xs },
    price: { fontSize: 18, fontWeight: '700', color: colors.accentLight, marginBottom: spacing.xs },
    desc: { ...typography.bodySmall, marginBottom: spacing.sm },
    progressSection: { marginTop: spacing.xs, marginBottom: spacing.sm },
    progressLabel: { ...typography.caption, marginTop: 4, color: colors.textSecondary },
    reservedBadge: {
        backgroundColor: colors.success + '22',
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginBottom: spacing.sm,
    },
    reservedText: { color: colors.success, fontSize: 13, fontWeight: '600' },
    actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: spacing.xs },
    actionBtn: {
        backgroundColor: colors.accent + '22',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
    },
    actionBtnText: { color: colors.accentLight, fontWeight: '700', fontSize: 13 },
    url: { ...typography.caption, flex: 1, color: colors.textMuted },
    deleteBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    deleteBtnText: { color: colors.danger, fontWeight: '600', fontSize: 13 },
});
