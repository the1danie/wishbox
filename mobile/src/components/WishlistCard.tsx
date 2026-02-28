import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { WishlistOut } from '../api/wishlists';
import { colors, spacing, radius, typography } from '../theme';

interface Props {
    wishlist: WishlistOut;
    onPress: () => void;
}

export default function WishlistCard({ wishlist, onPress }: Props) {
    const scale = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
    const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    return (
        <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1}>
            <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
                <View style={styles.emojiContainer}>
                    <Text style={styles.emoji}>{wishlist.cover_emoji || '🎁'}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>{wishlist.title}</Text>
                    {wishlist.description ? (
                        <Text style={styles.desc} numberOfLines={1}>{wishlist.description}</Text>
                    ) : null}
                    <Text style={styles.meta}>
                        {wishlist.item_count} {wishlist.item_count === 1 ? 'item' : 'items'} · {wishlist.is_public ? '🔗 Public' : '🔒 Private'}
                    </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    emojiContainer: {
        width: 52,
        height: 52,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceHigh,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    emoji: { fontSize: 28 },
    info: { flex: 1 },
    title: { ...typography.h3, marginBottom: 2 },
    desc: { ...typography.bodySmall, marginBottom: 4 },
    meta: { ...typography.caption, color: colors.textMuted },
    chevron: { fontSize: 22, color: colors.textMuted, paddingLeft: spacing.sm },
});
