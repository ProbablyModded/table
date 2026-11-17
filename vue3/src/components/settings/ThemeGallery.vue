<template>
    <section class="theme-gallery" aria-labelledby="theme-gallery-title">
        <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
            <div>
                <p id="theme-gallery-title" class="text-h6 mb-1">{{ $t('ThemeGallery') }}</p>
                <p class="text-body-2 text-medium-emphasis mb-0">{{ $t('ThemeGalleryHelp') }}</p>
            </div>
            <v-chip color="primary" variant="tonal" prepend-icon="fa-solid fa-sparkles">
                {{ presets.length }} {{ $t('Themes') }}
            </v-chip>
        </div>

        <v-row dense>
            <v-col v-for="preset in presets" :key="preset.id" cols="12" sm="6" lg="4">
                <button
                    type="button"
                    class="theme-card"
                    :class="{'theme-card-selected': selectedTheme === preset.id}"
                    :aria-pressed="selectedTheme === preset.id"
                    @click="selectTheme(preset.id)">
                    <div class="theme-preview" :style="previewStyle(preset)">
                        <div class="theme-preview-topbar">
                            <span class="theme-preview-dot"></span>
                            <span class="theme-preview-word">Table</span>
                            <span class="theme-preview-actions"></span>
                        </div>
                        <div class="theme-preview-body">
                            <div class="theme-preview-sidebar">
                                <span></span><span></span><span></span><span></span>
                            </div>
                            <div class="theme-preview-content">
                                <span class="theme-preview-heading"></span>
                                <div class="theme-preview-cards">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex align-center justify-space-between mt-3 text-start">
                        <div>
                            <div class="theme-card-title">{{ $t(preset.labelKey) }}</div>
                            <div class="theme-card-description">{{ $t(preset.descriptionKey) }}</div>
                        </div>
                        <v-icon v-if="selectedTheme === preset.id" icon="fa-solid fa-circle-check" color="primary" size="22"></v-icon>
                    </div>
                    <div class="theme-swatches mt-3" aria-hidden="true">
                        <span v-for="color in swatches(preset)" :key="color" :style="{backgroundColor: color}"></span>
                    </div>
                </button>
            </v-col>
        </v-row>
    </section>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {resolveTableTheme, TABLE_THEME_PRESETS, type TableThemeId, type TableThemePreset} from '@/types/tableThemes'

const props = defineProps<{modelValue?: string | null}>()
const emit = defineEmits<{(event: 'update:modelValue', value: TableThemeId): void}>()
const presets = TABLE_THEME_PRESETS
const selectedTheme = computed(() => resolveTableTheme(props.modelValue))

function selectTheme(theme: TableThemeId) {
    emit('update:modelValue', theme)
}

function swatches(preset: TableThemePreset) {
    return [preset.colors.primary, preset.colors.secondary, preset.colors.table, preset.colors.background]
}

function previewStyle(preset: TableThemePreset) {
    return {
        '--theme-preview-background': preset.colors.background,
        '--theme-preview-surface': preset.colors.surface,
        '--theme-preview-primary': preset.colors.primary,
        '--theme-preview-secondary': preset.colors.secondary,
        '--theme-preview-ink': preset.colors.onSurface,
    }
}
</script>

<style scoped>
.theme-card {
    width: 100%;
    padding: 12px;
    border: 1px solid rgba(var(--v-theme-primary), .12);
    border-radius: 22px;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    cursor: pointer;
    text-align: left;
    transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
}

.theme-card:hover {
    transform: translateY(-3px);
    border-color: rgba(var(--v-theme-primary), .42);
    box-shadow: 0 18px 38px rgba(25, 35, 55, .12);
}

.theme-card:focus-visible {
    outline: 3px solid rgba(var(--v-theme-primary), .32);
    outline-offset: 3px;
}

.theme-card-selected {
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 18px 42px rgba(var(--v-theme-primary), .18);
}

.theme-preview {
    overflow: hidden;
    border-radius: 16px;
    background: var(--theme-preview-background);
    color: var(--theme-preview-ink);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .05);
}

.theme-preview-topbar {
    display: flex;
    align-items: center;
    gap: 7px;
    height: 30px;
    padding: 0 11px;
    background: var(--theme-preview-primary);
    color: #fff;
    font-size: 9px;
    font-weight: 700;
}

.theme-preview-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: rgba(255, 255, 255, .9);
}

.theme-preview-actions {
    width: 23px;
    height: 5px;
    margin-left: auto;
    border-radius: 999px;
    background: rgba(255, 255, 255, .48);
}

.theme-preview-body {
    display: flex;
    min-height: 72px;
    gap: 8px;
    padding: 9px;
}

.theme-preview-sidebar {
    display: flex;
    width: 23%;
    flex-direction: column;
    gap: 6px;
    padding: 5px;
    border-radius: 7px;
    background: var(--theme-preview-surface);
}

.theme-preview-sidebar span,
.theme-preview-heading,
.theme-preview-cards span {
    display: block;
    border-radius: 999px;
    background: var(--theme-preview-secondary);
}

.theme-preview-sidebar span {
    height: 4px;
}

.theme-preview-content {
    flex: 1;
    padding: 4px;
}

.theme-preview-heading {
    width: 48%;
    height: 7px;
    margin-bottom: 10px;
    background: var(--theme-preview-primary);
}

.theme-preview-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
}

.theme-preview-cards span {
    height: 36px;
    border-radius: 7px;
    background: var(--theme-preview-surface);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .05);
}

.theme-card-title {
    font-size: .95rem;
    font-weight: 700;
}

.theme-card-description {
    color: rgba(var(--v-theme-on-surface), .62);
    font-size: .75rem;
}

.theme-swatches {
    display: flex;
    gap: 6px;
}

.theme-swatches span {
    width: 22px;
    height: 10px;
    border-radius: 999px;
}
</style>
