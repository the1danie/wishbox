import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    SafeAreaView, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { wishlistApi, WishlistOut } from '../../api/wishlists';
import WishlistCard from '../../components/WishlistCard';
import EmptyState from '../../components/EmptyState';
import CreateWishlistModal from '../../components/CreateWishlistModal';
import { colors, spacing, radius, typography } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function HomeScreen({ navigation }: any) {
    const [wishlists, setWishlists] = useState<WishlistOut[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const user = useAuthStore(s => s.user);

    const load = useCallback(async () => {
        try {
            const res = await wishlistApi.list();
            setWishlists(res.data);
        } catch {
            // ignore
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const onRefresh = () => { setRefreshing(true); load(); };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
                    <Text style={styles.subGreeting}>Your wishlists</Text>
                </View>
                <TouchableOpacity onPress={() => setShowCreate(true)} style={styles.fab} activeOpacity={0.8}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={colors.accent} size="large" />
                </View>
            ) : wishlists.length === 0 ? (
                <EmptyState
                    title="No wishlists yet"
                    message="Create your first wishlist and share it with friends — they'll know exactly what to gift you!"
                    actionLabel="Create Wishlist ✨"
                    onAction={() => setShowCreate(true)}
                />
            ) : (
                <FlatList
                    data={wishlists}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
                    renderItem={({ item }) => (
                        <WishlistCard
                            wishlist={item}
                            onPress={() => navigation.navigate('WishlistDetail', { slug: item.slug })}
                        />
                    )}
                />
            )}

            <CreateWishlistModal
                visible={showCreate}
                onClose={() => setShowCreate(false)}
                onCreated={load}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    greeting: { ...typography.h2 },
    subGreeting: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: spacing.lg },
    fab: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
    fabText: { color: colors.white, fontSize: 24, fontWeight: '600', lineHeight: 28 },
});
