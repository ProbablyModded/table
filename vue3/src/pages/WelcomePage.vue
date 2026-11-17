<template>
    <v-container>


        <v-stepper editable v-model="stepper" class="welcome-stepper">
            <v-stepper-window>
                <v-stepper-window-item value="1">
                    <v-card flat>
                        <v-card-title class="text-h4">Welcome to Table, <span class="text-table">{{ useUserPreferenceStore().userSettings.user.displayName }}</span>
                        </v-card-title>
                        <v-card-text v-if="space">
                            <p class="text-subtitle-1 mb-4">{{ $t('WelcomeSettingsHelp') }}</p>

                            <v-text-field v-model="space.name" :label="$t('Name')"></v-text-field>

                            <v-select :label="$t('Theme')" v-model="useUserPreferenceStore().userSettings.theme"
                                      :items="themeOptions">
                            </v-select>

                            <v-text-field v-model="useUserPreferenceStore().userSettings.defaultUnit" :label="$t('Default_Unit')" :hint="$t('DefaultUnitHelp')" persistent-hint></v-text-field>

                        </v-card-text>
                    </v-card>

                    <v-stepper-actions>
                        <template #prev>
                            <v-spacer></v-spacer>
                        </template>
                        <template #next>
                            <v-btn @click="finishWelcome()" color="warning" class="me-2" :loading="loading">{{ $t('Skip') }}</v-btn>
                            <v-btn @click="updateSpaceAndUserSettings()" :loading="loading" color="success">{{ $t('Next') }}</v-btn>
                        </template>
                    </v-stepper-actions>

                </v-stepper-window-item>

                <v-stepper-window-item value="2">
                    <v-card flat>
                        <v-card-text>
                            <open-data-import-settings></open-data-import-settings>
                        </v-card-text>
                    </v-card>

                    <v-stepper-actions>
                        <template #prev>
                            <v-btn @click="stepper = '1'">{{ $t('Back') }}</v-btn>
                        </template>
                        <template #next>
                            <v-btn @click="stepper = '3'" color="success">{{ $t('Next') }}</v-btn>
                        </template>
                    </v-stepper-actions>

                </v-stepper-window-item>

                <v-stepper-window-item value="3">
                    <v-card flat>
                        <v-card-text class="text-center">
                            <v-row class="mt-2" v-if="useUserPreferenceStore().activeUserSpace?.household == undefined">
                                <v-col>
                                    <p class="text-h4 mb-2">{{ $t('Household') }}</p>
                                    <p class="text-body-1">{{ $t('HouseholdWelcome') }}</p>
                                    <v-text-field v-model="householdName" :label="$t('Household')"></v-text-field>
                                </v-col>
                            </v-row>

                            <v-btn size="x-large" class="mt-4" variant="outlined">{{ $t('CreateInvitation') }}
                                <model-edit-dialog model="InviteLink" :close-after-create="false" :close-after-save="false"></model-edit-dialog>
                            </v-btn>
                        </v-card-text>
                    </v-card>

                    <v-stepper-actions>
                        <template #prev>
                            <v-btn @click="stepper = '2'" color="success">{{ $t('Back') }}</v-btn>
                        </template>
                        <template #next>
                            <v-btn @click="householdAndNext('4')" color="success" :loading="loading">{{ $t('Next') }}</v-btn>
                        </template>
                    </v-stepper-actions>
                </v-stepper-window-item>

                <v-stepper-window-item value="4">
                    <v-card flat>

                        <v-card-text>

                            <v-card
                                :title="$t('Create Recipe')"
                                variant="outlined"
                                @click="finishWelcome({name: 'ModelEditPage', params: {model: 'Recipe'}})"
                                prepend-icon="$recipes"
                                append-icon="fa-solid fa-arrow-right"
                                class="mb-4">
                                <template #subtitle>
                                    <p class="text-wrap">
                                        {{ $t('CreateFirstRecipe') }}
                                    </p>
                                </template>
                            </v-card>

                            <v-card
                                :title="$t('Import')"
                                variant="outlined"
                                @click="finishWelcome({name: 'RecipeImportPage', params: {}})"
                                prepend-icon="$import"
                                append-icon="fa-solid fa-arrow-right">
                                <template #subtitle>
                                    <p class="text-wrap">
                                        {{ $t('ImportFirstRecipe') }}
                                    </p>
                                </template>
                            </v-card>

                            <v-card
                                :title="$t('Migration')"
                                variant="outlined"
                                :to="{name: 'MigrationPage'}"
                                prepend-icon="fa-solid fa-file-import"
                                append-icon="fa-solid fa-arrow-right"
                                class="mt-4">
                                <template #subtitle>
                                    <p class="text-wrap">{{ $t('MigrationWelcomeHelp') }}</p>
                                </template>
                            </v-card>

                            <v-card
                                :title="$t('BrandStudio')"
                                variant="outlined"
                                :to="{name: 'BrandingSettings'}"
                                prepend-icon="fa-solid fa-wand-magic-sparkles"
                                append-icon="fa-solid fa-arrow-right"
                                class="mt-4">
                                <template #subtitle>
                                    <p class="text-wrap">{{ $t('BrandStudioWelcomeHelp') }}</p>
                                </template>
                            </v-card>


                        </v-card-text>
                    </v-card>

                    <v-stepper-actions>
                        <template #prev>
                            <v-btn @click="stepper = '3'" color="success">{{ $t('Back') }}</v-btn>
                        </template>
                        <template #next>
                            <v-btn @click="finishWelcome()" color="success" :disabled="false">{{ $t('Finish') }}</v-btn>
                        </template>
                    </v-stepper-actions>

                </v-stepper-window-item>

            </v-stepper-window>

        </v-stepper>

    </v-container>
</template>

<script setup lang="ts">


import {ApiApi, Space} from "@/openapi";
import {computed, onMounted, ref} from "vue";
import {ErrorMessageType, MessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import OpenDataImportSettings from "@/components/settings/OpenDataImportSettings.vue";
import {TABLE_THEME_PRESETS} from "@/types/tableThemes";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {RouteLocationRaw, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";

const router = useRouter()
const {t} = useI18n()

const space = ref<undefined | Space>(undefined)
const householdName = ref("")
const stepper = ref("1")
const loading = ref(false)
const themeOptions = computed(() => TABLE_THEME_PRESETS.map(theme => ({title: t(theme.labelKey), value: theme.id})))

onMounted(() => {
    loadSpace()
})

/**
 * save setup completion and redirect to target page
 * @param target
 */
function finishWelcome(target: RouteLocationRaw = {name: 'StartPage'}) {
    if (space.value) {
        space.value.spaceSetupCompleted = true
        space.value.householdSetupCompleted = true
        loading.value = true
        updateSpace().then(() => {
            router.push(target)
            loading.value = false
        })
    } else {
        useMessageStore().addMessage(MessageType.ERROR, "Space not loaded yet", 5000)
    }
}

/**
 * load active space data
 */
function loadSpace() {
    let api = new ApiApi()

    api.apiSpaceCurrentRetrieve().then(r => {
        space.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

/**
 * update both the space and user settings
 */
function updateSpaceAndUserSettings() {
    let promises = [] as Promise<any>[]
    loading.value = true

    promises.push(updateSpace())
    promises.push(useUserPreferenceStore().updateUserSettings(true))

    Promise.allSettled(promises).then(r => {
        loading.value = false
        stepper.value = "2"
    })
}

function householdAndNext(nextStep: string) {
    let api = new ApiApi()
    let userSpace = useUserPreferenceStore().activeUserSpace

    if (householdName.value != "" && userSpace != null && userSpace.household == undefined) {
        loading.value = true

        api.apiHouseholdCreate({household: {name: householdName.value}}).then(r => {
            userSpace.household = r

            api.apiUserSpaceUpdate({id: userSpace.id!, userSpace: userSpace}).then(r => {
                stepper.value = nextStep
            }).catch(err => {
                useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
            }).finally(() => {
                loading.value = false
            })
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
            loading.value = false
        })
    } else {
        stepper.value = nextStep
    }

}

/**
 * update space in database
 */
function updateSpace() {
    let api = new ApiApi()
    return api.apiSpacePartialUpdate({id: space.value.id, patchedSpace: space.value}).then(r => {
        space.value = r
        useUserPreferenceStore().activeSpace = Object.assign({}, space.value)
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    })
}

</script>

<style scoped>


</style>
