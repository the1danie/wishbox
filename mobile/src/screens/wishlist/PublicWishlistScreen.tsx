import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    SafeAreaView, ActivityIndicator, RefreshControl, TextInput, Alert,
} from 'react-native';
import { wishlistApi, WishlistWithItems, ItemOut } from '../../api/wishlists';
import ItemCard from '../../components/ItemCard';
import EmptyState from '../../components/EmptyState';
import ReserveModal from '../../components/ReserveModal';
import ContributeModal from '../../components/ContributeModal';
import { useWebSocket, WsEvent } from '../../hooks/useWebSocket';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, radius, typography } from '../../theme';

export default function PublicWishlistScreen({ route, navigation }: any) {
    const passedSlug: string | undefined = route?.params?.slug;
    const [inputSlug, setInputSlug] = useState('');
    const [slug, setSlugToLoad] = useState<string | null>(passedSlug || null);
    const [wishlist, setWishlist] = useState<WishlistWithItems | null>(null);
    const [loading, setLoading] = useState(!!passedSlug);
    const [selectedItem, setSelectedItem] = useState<ItemOut | null>(null);
    const [showReserve, setShowReserve] = useState(false);
    const [showContribute, setShowContribute] = useState(false);
    const user = useAuthStore(s => s.user);

    const load = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        try {
            const res = await wishlistApi.get(slug);
            setWishlist(res.data);
        } catch (e: any) {
            Alert.alert('Not found', e?.response?.data?.detail || 'Wishlist not found');
            setWishlist(null);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => { load(); }, [load]);

    useWebSocket({
        slug,
        onEvent: useCallback((event: WsEvent) => {
            setWishlist(prev => {
                if (!prev) return prev;
                const items = [...prev.items];
                if (event.type === 'item_added') return { ...prev, items: [...items, event.item] };
                if (event.type === 'item_updated') return { ...prev, items: items.map(i => i.id === event.item.id ? event.item : i) };
                if (event.type === 'item_deleted') return { ...prev, items: items.filter(i => i.id !== event.item_id) };
                if (event.type === 'item_reserved') return { ...prev, items: items.map(i => i.id === event.item_id ? { ...i, is_reserved: true } : i) };
                if (event.type === 'item_unreserved') return { ...prev, items: items.map(i => i.id === event.item_id ? { ...i, is_reserved: false } : i) };
                if (event.type === 'contribution_added') return { ...prev, items: items.map(i => i.id === event.item_id ? { ...i, total_contributed: event.total_contributed, contributors_count: event.contributors_count } : i) };
                return prev;
            });
        }, []),
    });

    const isOwner = !!(user && wishlist && user.id === wishlist.user_id);

    if (!slug) {
        // Standalone screen to enter a slug manually when no deep link was passed
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.manualContainer}>
                    <Text style={styles.manualEmoji}>🔗</Text>
                    <Text style={styles.manualTitle}>Open a Wishlist</Text>
                    <Text style={styles.manualSubtitle}>Enter the wishlist code (slug) from the share link</Text>
                    <TextInput style={styles.manualInput} value={inputSlug} onChangeText={setInputSlug}
                        placeholder="e.g. birthday-2025" placeholderTextColor={colors.textMuted}
                        autoCapitalize="none" autoCorrect={false} />
                    <TouchableOpacity style={styles.manualBtn} onPress={() => setSlugToLoad(inputSlug.trim())} activeOpacity={0.8}>
                        <Text style={styles.manualBtnText}>Open Wishlist</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (loading) {
        return <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={colors.accent} size="large" /></View>;
    }

    if (!wishlist) {
        return (
            <SafeAreaView style={styles.safe}>
                <EmptyState title="Wishlist not found" message="The link may have expired or the wishlist was made private." icon="🔒"
                    actionLabel="Go Back" onAction={() => navigation.goBack()} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <FlatList
                data={wishlist.items}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListHeaderComponent={() => (
                    <View style={styles.listHeader}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Text style={styles.backText}>‹ Back</Text>
                        </TouchableOpacity>
                        <View style={styles.titleRow}>
                            <Text style={styles.emoji}>{wishlist.cover_emoji || '🎁'}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.title}>{wishlist.title}</Text>
                                {wishlist.owner_name ? <Text style={styles.ownerName}>by {wishlist.owner_name}</Text> : null}
                                {wishlist.description ? <Text style={styles.desc}>{wishlist.description}</Text> : null}
                            </View>
                        </View>
                        {isOwner && (
                            <View style={styles.ownerBanner}>
                                <Text style={styles.ownerBannerText}>👀 This is your wishlist — friends see this view</Text>
                            </View>
                        )}
                        <Text style={styles.sectionLabel}>{wishlist.items.length} {wishlist.items.length === 1 ? 'item' : 'items'}</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <ItemCard
                        item={item}
                        isOwner={isOwner}
                        onReserve={i => { setSelectedItem(i); setShowReserve(true); }}
                        onContribute={i => { setSelectedItem(i); setShowContribute(true); }}
                    />
                )}
                ListEmptyComponent={() => (
                    <EmptyState title="Nothing here yet" message="The wishlist owner hasn't added any items yet." icon="✨" />
                )}
                refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.accent} />}
            />

            <ReserveModal
                visible={showReserve} slug={slug} item={selectedItem}
                onClose={() => setShowReserve(false)}
                onReserved={() => { setWishlist(prev => prev ? { ...prev, items: prev.items.map(i => i.id === selectedItem?.id ? { ...i, is_reserved: true } : i) } : prev); }}
            />
            <ContributeModal
                visible={showContribute} slug={slug} item={selectedItem}
                onClose={() => setShowContribute(false)}
                onContributed={load}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    list: { paddingBottom: 40 },
    listHeader: { padding: spacing.lg, paddingBottom: 0 },
    backBtn: { marginBottom: spacing.md },
    backText: { color: colors.accentLight, fontSize: 16, fontWeight: '600' },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
    emoji: { fontSize: 40 },
    title: { ...typography.h1, flexShrink: 1 },
    ownerName: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
    desc: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
    sectionLabel: { ...typography.label, paddingBottom: spacing.sm, paddingTop: spacing.xs },
    ownerBanner: { backgroundColor: colors.warning + '22', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md },
    ownerBannerText: { color: colors.warning, fontSize: 13, fontWeight: '600' },
    // Manual slug entry
    manualContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    manualEmoji: { fontSize: 60, marginBottom: spacing.md },
    manualTitle: { ...typography.h2, marginBottom: spacing.sm },
    manualSubtitle: { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
    manualInput: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: 15, width: '100%', marginBottom: spacing.md },
    manualBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, alignItems: 'center' },
    manualBtnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
