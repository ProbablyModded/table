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
                        <v-text-field class="mt-4" v-model="draft.name" :label="$t('SpaceName')"
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
                                <v-col v-for="mark in brandMarks" :key="mark.value" cols="4">
                                    <v-item v-slot="{ isSelected, toggle }" :value="mark.value">
                                        <v-card variant="outlined" class="brand-mark-card pa-3 text-center" :class="{'brand-mark-selected': isSelected}" @click="toggle">
                                            <v-img :src="mark.src" height="54" class="brand-mark-art"></v-img>
                                            <div class="text-caption mt-2">{{ $t(mark.label) }}</div>
                                        </v-card>
                                    </v-item>
                                </v-col>
                            </v-row>
                        </v-item-group>

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
    const initials = escapeXml(getInitials(brandTitle.value))
    const background = draft.value.navBgColor || '#ddbf86'
    const foreground = draft.value.navTextColor === 'LIGHT' ? '#ffffff' : '#271a14'
    const mark = markGraphic(draft.value.brandMark || 'recipe', foreground)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="180" viewBox="0 0 560 180"><rect width="560" height="180" rx="36" fill="${background}"/><circle cx="92" cy="90" r="58" fill="${foreground}" fill-opacity=".16"/>${mark}<text x="178" y="102" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="${foreground}">${title}</text><text x="178" y="130" font-family="Arial, sans-serif" font-size="18" letter-spacing="3" fill="${foreground}" fill-opacity=".72">${initials} FAMILY TABLE</text></svg>`
}

function markGraphic(mark: string, foreground: string) {
    const style = `fill="none" stroke="${foreground}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`
    if (mark === 'meal') {
        return `<g ${style} transform="translate(42 39) scale(.42)"><path d="M20 81h80"/><path d="M29 81c2-30 60-30 62 0"/><path d="M43 50c5-15 29-15 34 0"/><path d="M60 35v-7"/><path d="M13 94h94"/></g>`
    }
    if (mark === 'utensils') {
        return `<g ${style} transform="translate(42 39) scale(.42)"><path d="M29 17v35M19 17v18M39 17v18M29 52v53"/><path d="M77 17v88M77 17c16 10 19 30 0 45"/></g>`
    }
    return `<g ${style} transform="translate(42 39) scale(.42)"><rect x="23" y="15" width="74" height="90" rx="8"/><path d="M39 39h42M39 57h42M39 75h28"/><path d="M76 87l8 8 15-17"/></g>`
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
</style>
