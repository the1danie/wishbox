import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import WishlistDetailScreen from '../screens/wishlist/WishlistDetailScreen';
import PublicWishlistScreen from '../screens/wishlist/PublicWishlistScreen';
import { colors } from '../theme';
import { View, Text } from 'react-native';

export type RootStackParamList = {
    AuthStack: undefined;
    MainTabs: undefined;
    WishlistDetail: { slug: string };
    PublicWishlist: { slug: string };
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type MainTabsParamList = {
    Home: undefined;
    Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
}

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
            }}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Wishlists',
                    tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🎁</Text>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>👤</Text>,
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { token, hydrated } = useAuthStore();

    if (!hydrated) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: colors.accent, fontSize: 40 }}>🎁</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {token ? (
                    <>
                        <RootStack.Screen name="MainTabs" component={MainTabs} />
                        <RootStack.Screen name="WishlistDetail" component={WishlistDetailScreen} />
                        <RootStack.Screen name="PublicWishlist" component={PublicWishlistScreen} />
                    </>
                ) : (
                    <>
                        <RootStack.Screen name="AuthStack" component={AuthNavigator} />
                        <RootStack.Screen name="PublicWishlist" component={PublicWishlistScreen} />
                    </>
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
}
