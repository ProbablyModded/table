<template>
    <v-form @submit.prevent="saveBrand">
        <v-card class="table-settings-card">
            <v-card-title class="d-flex align-center ga-3">
                <v-icon icon="fa-solid fa-wand-magic-sparkles" color="primary"></v-icon>
                <span>{{ $t('BrandStudio') }}</span>
            </v-card-title>
            <v-card-subtitle>{{ $t('BrandStudioHelp') }}</v-card-subtitle>

            <v-card-text>
                <v-row>
                    <v-col cols="12" md="7">
                        <v-text-field v-model="draft.appName" :label="$t('CookbookName')"
                                      :hint="$t('CookbookNameHelp')" persistent-hint></v-text-field>
                        <v-text-field class="mt-4" v-model="draft.name" :label="$t('SpaceNameOptional')"
                                      :hint="$t('SpaceNameHelp')" persistent-hint></v-text-field>

                        <v-label class="mt-5 mb-2">{{ $t('BrandColor') }}</v-label>
                        <v-color-picker v-model="draft.navBgColor" mode="hex" :modes="['hex']" show-swatches
                                        :swatches="[['#ddbf86'], ['#b98766'], ['#b55e4f'], ['#82aa8b'], ['#385f84']]">
                        </v-color-picker>

                        <v-select class="mt-4" v-model="draft.navTextColor" :label="$t('BrandTextColor')"
                                  :items="[{title: $t('Light'), value: 'LIGHT'}, {title: $t('Dark'), value: 'DARK'}]"></v-select>

                        <v-label class="mt-2 mb-2">{{ $t('BrandMark') }}</v-label>
                        <v-item-group v-model="draft.brandMark" mandatory selected-class="brand-mark-selected">
                            <v-row dense>
                                <v-col v-for="mark in brandMarks" :key="mark.value" cols="6" sm="4">
                                    <v-item v-slot="{ isSelected, toggle }" :value="mark.value">
                                        <v-card variant="outlined" class="brand-mark-card pa-3 text-center" :class="{'brand-mark-selected': isSelected}" @click="toggle">
                                            <v-img :src="mark.src" height="54" class="brand-mark-art"></v-img>
                                            <div class="text-caption mt-2">{{ $t(mark.label) }}</div>
                                        </v-card>
                                    </v-item>
                                </v-col>
                            </v-row>
                        </v-item-group>

                        <div class="logo-design-grid mt-5">
                            <v-select v-model="draft.brandLayout" :label="$t('LogoLayout')" :items="logoLayoutOptions"
                                      item-title="title" item-value="value"></v-select>
                            <v-select v-model="draft.brandFrame" :label="$t('LogoFrame')" :items="logoFrameOptions"
                                      item-title="title" item-value="value"></v-select>
                            <v-select v-model="draft.brandFont" :label="$t('LogoFont')" :items="logoFontOptions"
                                      item-title="title" item-value="value"></v-select>
                        </div>

                        <v-label class="mt-2 mb-2">{{ $t('LogoColor') }}</v-label>
                        <v-color-picker v-model="draft.brandColor" mode="hex" :modes="['hex']" show-swatches
                                        :swatches="[['#ffffff'], ['#111827'], ['#f8fafc'], ['#f5d0fe'], ['#bfdbfe']]">
                        </v-color-picker>
                        <div class="text-caption text-medium-emphasis mt-1">{{ $t('LogoColorHelp') }}</div>

                        <v-switch class="mt-2" color="primary" v-model="useGeneratedLogo"
                                  :label="$t('GenerateLogo')" :hint="$t('GenerateLogoHelp')" persistent-hint></v-switch>

                        <user-file-field v-if="!useGeneratedLogo" v-model="draft.navLogo"
                                         :label="$t('CustomLogo')" :hint="$t('CustomNavLogoHelp')" persistent-hint>
                        </user-file-field>
                    </v-col>

                    <v-col cols="12" md="5">
                        <v-card class="brand-preview-card" variant="outlined" :style="previewCardStyle">
                            <v-card-subtitle class="pt-4">{{ $t('Preview') }}</v-card-subtitle>
                            <v-card-text class="d-flex flex-column align-center justify-center brand-preview-body">
                                <v-img :src="previewUrl" max-width="280" max-height="100" contain class="brand-preview-logo"></v-img>
                                <div class="text-h6 mt-4 text-center">{{ brandTitle }}</div>
                                <div class="text-body-2 opacity-75 text-center">{{ draft.name || $t('Space') }}</div>
                            </v-card-text>
                        </v-card>
                        <v-alert class="mt-4" variant="tonal" color="info" icon="fa-solid fa-circle-info">
                            {{ $t('BrandStudioStorageHelp') }}
                        </v-alert>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn type="submit" color="success" prepend-icon="$save" :loading="loading">{{ $t('Save') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import {ApiApi, Space} from "@/openapi";
import UserFileField from "@/components/inputs/UserFileField.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import {useFileApi} from "@/composables/useFileApi.ts";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore.ts";
import {useI18n} from "vue-i18n";
import recipeMark from "@/assets/brand_marks/recipe.svg?url";
import mealMark from "@/assets/brand_marks/meal.svg?url";
import utensilsMark from "@/assets/brand_marks/utensils.svg?url";
import bowlMark from "@/assets/brand_marks/bowl.svg?url";
import potMark from "@/assets/brand_marks/pot.svg?url";
import whiskMark from "@/assets/brand_marks/whisk.svg?url";
import rollingPinMark from "@/assets/brand_marks/rolling-pin.svg?url";
import cakeMark from "@/assets/brand_marks/cake.svg?url";
import leafMark from "@/assets/brand_marks/leaf.svg?url";

const {t} = useI18n()
const store = useUserPreferenceStore()
const {createOrUpdateUserFile} = useFileApi()

const draft = ref({} as Space)
const loading = ref(false)
const useGeneratedLogo = ref(true)
const brandMarks = [
    {value: 'recipe', label: 'RecipeMark', src: recipeMark},
    {value: 'meal', label: 'MealMark', src: mealMark},
    {value: 'utensils', label: 'UtensilMark', src: utensilsMark},
    {value: 'bowl', label: 'BowlMark', src: bowlMark},
    {value: 'pot', label: 'PotMark', src: potMark},
    {value: 'whisk', label: 'WhiskMark', src: whiskMark},
    {value: 'rolling-pin', label: 'RollingPinMark', src: rollingPinMark},
    {value: 'cake', label: 'CakeMark', src: cakeMark},
    {value: 'leaf', label: 'LeafMark', src: leafMark},
]
const logoLayoutOptions = [
    {value: 'left', title: t('LogoLayoutLeft')},
    {value: 'right', title: t('LogoLayoutRight')},
    {value: 'both', title: t('LogoLayoutBoth')},
]
const logoFrameOptions = [
    {value: 'none', title: t('LogoFrameNone')},
    {value: 'box', title: t('LogoFrameBox')},
    {value: 'underline', title: t('LogoFrameUnderline')},
]
const logoFontOptions = [
    {value: 'sans', title: t('LogoFontSans')},
    {value: 'serif', title: t('LogoFontSerif')},
    {value: 'script', title: t('LogoFontScript')},
]

const brandTitle = computed(() => draft.value.appName || draft.value.name || 'Table')
const previewUrl = computed(() => {
    if (!useGeneratedLogo.value && draft.value.navLogo?.preview) {
        return draft.value.navLogo.preview
    }
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildLogoSvg())}`
})
const previewCardStyle = computed(() => ({
    background: draft.value.navBgColor || '#ddbf86',
    color: draft.value.navTextColor === 'LIGHT' ? '#ffffff' : '#271a14',
}))

onMounted(() => {
    draft.value = JSON.parse(JSON.stringify(store.activeSpace.valueOf())) as Space
    draft.value.brandMark = draft.value.brandMark || 'recipe'
    draft.value.brandLayout = draft.value.brandLayout || 'left'
    draft.value.brandFrame = draft.value.brandFrame || 'none'
    draft.value.brandFont = draft.value.brandFont || 'sans'
    draft.value.brandColor = draft.value.brandColor || '#ffffff'
    useGeneratedLogo.value = !draft.value.navLogo
})

function escapeXml(value: string) {
    return value.replace(/[<>&'\"]/g, character => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;',
    }[character] || character))
}

function getInitials(value: string) {
    const words = value.trim().split(/\s+/).filter(Boolean)
    return (words.slice(0, 2).map(word => word.charAt(0)).join('') || 'T').toUpperCase()
}

function buildLogoSvg() {
    const title = escapeXml(brandTitle.value)
    const background = safeColor(draft.value.navBgColor || '#1877f2', '#1877f2')
    const foreground = safeColor(draft.value.brandColor || '#ffffff', '#ffffff')
    const layout = draft.value.brandLayout || 'left'
    const fontFamily = logoFontFamily(draft.value.brandFont || 'sans')
    const titleSize = brandTitle.value.length > 20 ? 50 : 62
    const textX = layout === 'right' ? 830 : layout === 'left' ? 235 : 450
    const textAnchor = layout === 'right' ? 'end' : layout === 'left' ? 'start' : 'middle'
    const mark = draft.value.brandMark || 'recipe'
    const marks = [
        layout === 'left' || layout === 'both' ? markGraphic(mark, foreground, 42, 70, 120) : '',
        layout === 'right' || layout === 'both' ? markGraphic(mark, foreground, 738, 70, 120) : '',
    ].join('')
    const frame = draft.value.brandFrame === 'box'
        ? `<rect x="22" y="22" width="856" height="216" rx="28" fill="none" stroke="${foreground}" stroke-width="5" opacity=".92"/>`
        : draft.value.brandFrame === 'underline'
            ? `<path d="M${layout === 'left' ? 230 : layout === 'right' ? 340 : 270} 190 H${layout === 'left' ? 670 : layout === 'right' ? 670 : 630}" fill="none" stroke="${foreground}" stroke-width="5" stroke-linecap="round" opacity=".92"/>`
            : ''
    return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="260" viewBox="0 0 900 260"><rect width="900" height="260" rx="34" fill="${background}"/>${frame}${marks}<text x="${textX}" y="151" text-anchor="${textAnchor}" font-family="${fontFamily}" font-size="${titleSize}" font-weight="700" letter-spacing="-.8" fill="${foreground}">${title}</text></svg>`
}

function safeColor(value: string, fallback: string) {
    return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback
}

function logoFontFamily(font: string) {
    if (font === 'serif') return 'Georgia, Times New Roman, serif'
    if (font === 'script') return 'Brush Script MT, Segoe Script, cursive'
    return 'Inter, Arial, sans-serif'
}

function markGraphic(mark: string, foreground: string, x: number, y: number, size: number) {
    const style = `fill="none" stroke="${foreground}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`
    const transform = `transform="translate(${x} ${y}) scale(${size / 128})"`
    if (mark === 'meal') {
        return `<g ${style} ${transform}><path d="M20 81h80"/><path d="M29 81c2-30 60-30 62 0"/><path d="M43 50c5-15 29-15 34 0"/><path d="M60 35v-7"/><path d="M13 94h94"/></g>`
    }
    if (mark === 'utensils') {
        return `<g ${style} ${transform}><path d="M29 17v35M19 17v18M39 17v18M29 52v53"/><path d="M77 17v88M77 17c16 10 19 30 0 45"/></g>`
    }
    if (mark === 'bowl') {
        return `<g ${style} ${transform}><path d="M18 52h92c-5 39-27 58-46 58S23 91 18 52Z"/><path d="M10 52h108"/><path d="M36 38c8-17 48-17 56 0"/></g>`
    }
    if (mark === 'pot') {
        return `<g ${style} ${transform}><path d="M25 40h78l-7 62H32Z"/><path d="M18 40h92"/><path d="M46 25h36"/><path d="M58 25v-9h12v9"/><path d="M16 55h96"/></g>`
    }
    if (mark === 'whisk') {
        return `<g ${style} ${transform}><path d="M73 21c-9 9-9 23 0 32s23 9 32 0"/><path d="M73 21c-12 0-22 10-22 22s10 22 22 22"/><path d="M73 53 32 105"/><path d="M22 115 42 95"/></g>`
    }
    if (mark === 'rolling-pin') {
        return `<g ${style} ${transform}><path d="M25 28 104 107"/><path d="M17 20 31 34M97 94l14 14"/><path d="m38 44 50 50"/><path d="M12 17 25 30M103 95l13 13"/></g>`
    }
    if (mark === 'cake') {
        return `<g ${style} ${transform}><path d="M23 65c0-14 18-20 26-7 8-17 22-17 30 0 8-13 26-7 26 7v35H23Z"/><path d="M23 83h82M23 101h82"/><path d="M45 40v-12M64 40V24M83 40V28"/></g>`
    }
    if (mark === 'leaf') {
        return `<g ${style} ${transform}><path d="M96 18C50 18 19 42 25 82c31 8 61-8 71-34 4-10 4-20 0-30Z"/><path d="M25 106 79 48"/><path d="M44 84 28 75M59 68 43 57M73 53 59 42"/></g>`
    }
    return `<g ${style} ${transform}><rect x="23" y="15" width="74" height="90" rx="8"/><path d="M39 39h42M39 57h42M39 75h28"/><path d="M76 87l8 8 15-17"/></g>`
}

async function svgToPngFile(svg: string) {
    const objectUrl = URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}))
    const image = new Image()
    image.src = objectUrl
    await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error('Unable to render the generated logo.'))
    })

    const canvas = document.createElement('canvas')
    canvas.width = 1120
    canvas.height = 360
    const context = canvas.getContext('2d')
    if (!context) {
        URL.revokeObjectURL(objectUrl)
        throw new Error('Your browser could not create a logo preview.')
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(objectUrl)

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(result => result ? resolve(result) : reject(new Error('Unable to create the logo file.')), 'image/png')
    })
    return new File([blob], `${getInitials(brandTitle.value).toLowerCase()}-cookbook-logo.png`, {type: 'image/png'})
}

async function saveBrand() {
    loading.value = true
    try {
        if (useGeneratedLogo.value) {
            const logo = await createOrUpdateUserFile(`${brandTitle.value} logo`, await svgToPngFile(buildLogoSvg()))
            draft.value.navLogo = logo as any
        }

        const api = new ApiApi()
        const saved = await api.apiSpacePartialUpdate({id: draft.value.id!, patchedSpace: draft.value as any})
        store.activeSpace = saved
        useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
    } catch (error) {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, error)
    } finally {
        loading.value = false
    }
}

</script>

<style scoped>
.brand-preview-card {
    min-height: 300px;
    overflow: hidden;
}

.brand-preview-body {
    min-height: 235px;
}

.brand-preview-logo {
    filter: drop-shadow(0 12px 22px rgba(43, 30, 22, .18));
}

.brand-mark-card {
    cursor: pointer;
    transition: transform .2s ease, border-color .2s ease, background .2s ease;
}

.brand-mark-card:hover {
    transform: translateY(-2px);
}

.brand-mark-selected {
    border-color: rgb(var(--v-theme-primary)) !important;
    background: rgba(var(--v-theme-primary), .1);
}

.brand-mark-art {
    color: var(--table-ink);
}

.logo-design-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
}

@media (max-width: 700px) {
    .logo-design-grid {
        grid-template-columns: 1fr;
    }
}
</style>
