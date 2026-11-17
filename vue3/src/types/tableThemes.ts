export type TableThemeId =
    | 'TABLE'
    | 'ROSE'
    | 'PEACH'
    | 'LEMON'
    | 'MINT'
    | 'SKY'
    | 'LAVENDER'
    | 'BLUSH'
    | 'SAGE'
    | 'BUTTER'
    | 'POWDER'
    | 'LILAC'
    | 'SAND'
    | 'GREY'
    | 'SOCIAL'
    | 'TABLE_DARK'

export interface TableThemeColors {
    background: string
    surface: string
    primary: string
    secondary: string
    table: string
    success: string
    info: string
    warning: string
    error: string
    onBackground: string
    onSurface: string
    onPrimary: string
    onSecondary: string
}

export interface TableThemePreset {
    id: TableThemeId
    labelKey: string
    descriptionKey: string
    colors: TableThemeColors
}

const sharedLightColors = {
    success: '#7fa58a',
    info: '#6688a3',
    warning: '#d39a46',
    error: '#bd625e',
    onBackground: '#3f3b3a',
    onSurface: '#3f3b3a',
    onPrimary: '#ffffff',
    onSecondary: '#3f3b3a',
} as const

export const TABLE_THEME_PRESETS: readonly TableThemePreset[] = [
    {
        id: 'TABLE',
        labelKey: 'TableThemeTable',
        descriptionKey: 'TableThemeTableDescription',
        colors: {
            background: '#fff9f0', surface: '#fffdf9', primary: '#b87b54', secondary: '#db9b83', table: '#e3c09e',
            ...sharedLightColors,
        },
    },
    {
        id: 'ROSE',
        labelKey: 'TableThemeRose',
        descriptionKey: 'TableThemeRoseDescription',
        colors: {
            background: '#fff4f7', surface: '#fffafd', primary: '#c47893', secondary: '#e8a7b7', table: '#f1c6d0',
            ...sharedLightColors,
        },
    },
    {
        id: 'PEACH',
        labelKey: 'TableThemePeach',
        descriptionKey: 'TableThemePeachDescription',
        colors: {
            background: '#fff6ef', surface: '#fffaf5', primary: '#d98562', secondary: '#f0af8b', table: '#f5c7a2',
            ...sharedLightColors,
        },
    },
    {
        id: 'LEMON',
        labelKey: 'TableThemeLemon',
        descriptionKey: 'TableThemeLemonDescription',
        colors: {
            background: '#fffbea', surface: '#fffef8', primary: '#b79a48', secondary: '#e4c96b', table: '#f3dc94',
            ...sharedLightColors,
        },
    },
    {
        id: 'MINT',
        labelKey: 'TableThemeMint',
        descriptionKey: 'TableThemeMintDescription',
        colors: {
            background: '#f0fbf7', surface: '#fbfffd', primary: '#5d9f8a', secondary: '#9bcab4', table: '#bce1cf',
            ...sharedLightColors,
        },
    },
    {
        id: 'SKY',
        labelKey: 'TableThemeSky',
        descriptionKey: 'TableThemeSkyDescription',
        colors: {
            background: '#f1f8fd', surface: '#fcfeff', primary: '#5e91b5', secondary: '#9bc3dd', table: '#bedbed',
            ...sharedLightColors,
        },
    },
    {
        id: 'LAVENDER',
        labelKey: 'TableThemeLavender',
        descriptionKey: 'TableThemeLavenderDescription',
        colors: {
            background: '#f7f3fc', surface: '#fdfbff', primary: '#8a74ad', secondary: '#b7a4d6', table: '#d6c9ec',
            ...sharedLightColors,
        },
    },
    {
        id: 'BLUSH',
        labelKey: 'TableThemeBlush',
        descriptionKey: 'TableThemeBlushDescription',
        colors: {
            background: '#fff5f1', surface: '#fffaf8', primary: '#b87679', secondary: '#dca0a0', table: '#efc0b2',
            ...sharedLightColors,
        },
    },
    {
        id: 'SAGE',
        labelKey: 'TableThemeSage',
        descriptionKey: 'TableThemeSageDescription',
        colors: {
            background: '#f3f7f1', surface: '#fcfefb', primary: '#718d72', secondary: '#9eb39a', table: '#cbd8c4',
            ...sharedLightColors,
        },
    },
    {
        id: 'BUTTER',
        labelKey: 'TableThemeButter',
        descriptionKey: 'TableThemeButterDescription',
        colors: {
            background: '#fff9e9', surface: '#fffdf7', primary: '#b8894c', secondary: '#e4ba77', table: '#f0d19b',
            ...sharedLightColors,
        },
    },
    {
        id: 'POWDER',
        labelKey: 'TableThemePowder',
        descriptionKey: 'TableThemePowderDescription',
        colors: {
            background: '#f2f6f9', surface: '#fcfdff', primary: '#6689a8', secondary: '#9fb5cc', table: '#c7d6e4',
            ...sharedLightColors,
        },
    },
    {
        id: 'LILAC',
        labelKey: 'TableThemeLilac',
        descriptionKey: 'TableThemeLilacDescription',
        colors: {
            background: '#faf5fc', surface: '#fffaff', primary: '#a277b5', secondary: '#c1a0cc', table: '#dec8e6',
            ...sharedLightColors,
        },
    },
    {
        id: 'SAND',
        labelKey: 'TableThemeSand',
        descriptionKey: 'TableThemeSandDescription',
        colors: {
            background: '#f8f4ee', surface: '#fffdf9', primary: '#a6815e', secondary: '#c9ab89', table: '#dfc7a6',
            ...sharedLightColors,
        },
    },
    {
        id: 'GREY',
        labelKey: 'TableThemeGrey',
        descriptionKey: 'TableThemeGreyDescription',
        colors: {
            background: '#f3f4f6', surface: '#ffffff', primary: '#626b78', secondary: '#8b95a4', table: '#c5cad2',
            success: '#6d9a83', info: '#607d98', warning: '#bd914e', error: '#b85d62',
            onBackground: '#30343b', onSurface: '#30343b', onPrimary: '#ffffff', onSecondary: '#ffffff',
        },
    },
    {
        id: 'SOCIAL',
        labelKey: 'TableThemeSocial',
        descriptionKey: 'TableThemeSocialDescription',
        colors: {
            background: '#f0f2f5', surface: '#ffffff', primary: '#1877f2', secondary: '#42b72a', table: '#1877f2',
            success: '#42b72a', info: '#216fdb', warning: '#f0a11a', error: '#d9534f',
            onBackground: '#1c1e21', onSurface: '#1c1e21', onPrimary: '#ffffff', onSecondary: '#ffffff',
        },
    },
    {
        id: 'TABLE_DARK',
        labelKey: 'TableThemeNight',
        descriptionKey: 'TableThemeNightDescription',
        colors: {
            background: '#191714', surface: '#24211e', primary: '#d5a980', secondary: '#df8c78', table: '#765b47',
            success: '#82aa8b', info: '#82a8c4', warning: '#e2b15e', error: '#e48a82',
            onBackground: '#f7f1e9', onSurface: '#f7f1e9', onPrimary: '#2d2119', onSecondary: '#2d2119',
        },
    },
]

export const TABLE_VUETIFY_THEMES = Object.fromEntries(
    TABLE_THEME_PRESETS.map((preset) => [preset.id, {
        dark: preset.id === 'TABLE_DARK',
        colors: {
            ...preset.colors,
            save: preset.colors.success,
            create: preset.colors.success,
            edit: preset.colors.info,
            delete: preset.colors.error,
            cancel: preset.colors.warning,
            recipeImagePlaceholderBg: preset.colors.surface,
        },
    }]),
)

const legacyThemeMap: Record<string, TableThemeId> = {
    TANDOOR: 'SOCIAL',
    TANDOOR_DARK: 'TABLE_DARK',
    BOOTSTRAP: 'TABLE',
    DARKLY: 'TABLE_DARK',
    FLATLY: 'TABLE',
    SUPERHERO: 'TABLE_DARK',
}

export function resolveTableTheme(themeId?: string | null): TableThemeId {
    if (TABLE_THEME_PRESETS.some((preset) => preset.id === themeId)) {
        return themeId as TableThemeId
    }
    return legacyThemeMap[themeId || ''] || 'SOCIAL'
}
