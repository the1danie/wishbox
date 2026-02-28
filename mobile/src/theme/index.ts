export const colors = {
    bg: '#0F0F13',
    surface: '#1A1A24',
    surfaceHigh: '#22223A',
    border: '#2D2D45',
    accent: '#7C5CFC',
    accentLight: '#A78BFA',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    textPrimary: '#F8F8FF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    white: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.7)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const typography = {
    h1: { fontSize: 28, fontWeight: '700' as const, color: colors.textPrimary },
    h2: { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary },
    h3: { fontSize: 18, fontWeight: '600' as const, color: colors.textPrimary },
    body: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary },
    bodySmall: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary },
    caption: { fontSize: 11, fontWeight: '500' as const, color: colors.textMuted },
    label: { fontSize: 13, fontWeight: '600' as const, color: colors.textSecondary },
};
