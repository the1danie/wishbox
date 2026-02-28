import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    SafeAreaView, ActivityIndicator, RefreshControl, Alert, Share,
} from 'react-native';
import { wishlistApi, WishlistWithItems, ItemOut } from '../../api/wishlists';
import { itemsApi } from '../../api/items';
import ItemCard from '../../components/ItemCard';
import EmptyState from '../../components/EmptyState';
import AddItemModal from '../../components/AddItemModal';
import { useWebSocket, WsEvent } from '../../hooks/useWebSocket';
import { colors, spacing, radius, typography } from '../../theme';

const WEB_URL = 'https://wishbox-flame.vercel.app';

export default function WishlistDetailScreen({ route, navigation }: any) {
    const { slug } = route.params;
    const [wishlist, setWishlist] = useState<WishlistWithItems | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await wishlistApi.get(slug);
            setWishlist(res.data);
        } catch {
            Alert.alert('Error', 'Could not load wishlist');
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        navigation.setOptions({ title: '' });
        load();
    }, [load, navigation]);

    // Realtime WebSocket
    useWebSocket({
        slug,
        onEvent: useCallback((event: WsEvent) => {
            setWishlist(prev => {
                if (!prev) return prev;
                const items = [...prev.items];
                if (event.type === 'item_added') {
                    return { ...prev, items: [...items, event.item] };
                }
                if (event.type === 'item_updated') {
                    return { ...prev, items: items.map(i => i.id === event.item.id ? event.item : i) };
                }
                if (event.type === 'item_deleted') {
                    return { ...prev, items: items.filter(i => i.id !== event.item_id) };
                }
                if (event.type === 'item_reserved') {
                    return { ...prev, items: items.map(i => i.id === event.item_id ? { ...i, is_reserved: true } : i) };
                }
                if (event.type === 'item_unreserved') {
                    return { ...prev, items: items.map(i => i.id === event.item_id ? { ...i, is_reserved: false } : i) };
                }
                if (event.type === 'contribution_added') {
                    return {
                        ...prev, items: items.map(i => i.id === event.item_id ? {
                            ...i,
                            total_contributed: event.total_contributed,
                            contributors_count: event.contributors_count,
                        } : i)
                    };
                }
                return prev;
            });
        }, []),
    });

    const handleDelete = async (item: ItemOut) => {
        Alert.alert('Delete item', `Remove "${item.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await itemsApi.remove(slug, item.id);
                        setWishlist(prev => prev ? { ...prev, items: prev.items.filter(i => i.id !== item.id) } : prev);
                    } catch {
                        Alert.alert('Error', 'Could not delete item.');
                    }
                }
            },
        ]);
    };

    const handleShare = async () => {
        if (!wishlist) return;
        await Share.share({
            message: `Check out my wishlist "${wishlist.title}" on WishBox: ${WEB_URL}/w/${slug}`,
            url: `${WEB_URL}/w/${slug}`,
        });
    };

    if (loading) {
        return <View style={[styles.safe, styles.center]}><ActivityIndicator color={colors.accent} size="large" /></View>;
    }

    if (!wishlist) {
        return <View style={styles.safe}><EmptyState title="Not found" message="This wishlist doesn't exist." /></View>;
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
                                {wishlist.description ? <Text style={styles.desc}>{wishlist.description}</Text> : null}
                            </View>
                            <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.8}>
                                <Text style={styles.shareBtnText}>Share 🔗</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.sectionLabel}>
                            {wishlist.items.length} {wishlist.items.length === 1 ? 'item' : 'items'}
                        </Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <ItemCard item={item} isOwner onDelete={handleDelete} />
                )}
                ListEmptyComponent={() => (
                    <EmptyState title="Empty wishlist" message="Add items so your friends know what to gift you!" icon="✨" />
                )}
                refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.accent} />}
            />

            {/* Floating Add Item Button */}
            <TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)} activeOpacity={0.8}>
                <Text style={styles.fabText}>+ Add Item</Text>
            </TouchableOpacity>

            <AddItemModal visible={showAdd} slug={slug} onClose={() => setShowAdd(false)} onAdded={load} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    center: { justifyContent: 'center', alignItems: 'center' },
    list: { paddingBottom: 100 },
    listHeader: { padding: spacing.lg, paddingBottom: 0 },
    backBtn: { marginBottom: spacing.md },
    backText: { color: colors.accentLight, fontSize: 16, fontWeight: '600' },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
    emoji: { fontSize: 40 },
    title: { ...typography.h1, flex: 0, flexShrink: 1 },
    desc: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
    shareBtn: { backgroundColor: colors.accent + '22', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignSelf: 'flex-start' },
    shareBtnText: { color: colors.accentLight, fontWeight: '600', fontSize: 13 },
    sectionLabel: { ...typography.label, paddingBottom: spacing.sm, paddingTop: spacing.xs },
    fab: { position: 'absolute', bottom: spacing.xl, alignSelf: 'center', backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, elevation: 8, shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
    fabText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
