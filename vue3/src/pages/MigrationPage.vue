<template>
    <v-container class="table-fade-up">
        <v-card class="migration-hero mb-5">
            <v-card-text class="pa-6 pa-md-10">
                <div class="text-overline text-primary">{{ $t('MigrationEyebrow') }}</div>
                <h1 class="text-h3 mt-2">{{ $t('MigrationTitle') }}</h1>
                <p class="text-body-1 mt-4 migration-copy">{{ $t('MigrationSubtitle') }}</p>

                <v-row class="mt-5" dense>
                    <v-col cols="12" md="4">
                        <v-card variant="outlined" class="migration-step h-100">
                            <v-card-title><v-avatar color="primary" size="30" class="me-2">1</v-avatar>{{ $t('MigrationStepOneTitle') }}</v-card-title>
                            <v-card-text>{{ $t('MigrationStepOne') }}</v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-card variant="outlined" class="migration-step h-100">
                            <v-card-title><v-avatar color="primary" size="30" class="me-2">2</v-avatar>{{ $t('MigrationStepTwoTitle') }}</v-card-title>
                            <v-card-text>{{ $t('MigrationStepTwo') }}</v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-card variant="outlined" class="migration-step h-100">
                            <v-card-title><v-avatar color="primary" size="30" class="me-2">3</v-avatar>{{ $t('MigrationStepThreeTitle') }}</v-card-title>
                            <v-card-text>{{ $t('MigrationStepThree') }}</v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-card class="table-settings-card" :loading="fileApiLoading">
            <v-card-title>{{ $t('MigrationUploadTitle') }}</v-card-title>
            <v-card-subtitle>{{ $t('MigrationUploadHelp') }}</v-card-subtitle>
            <v-card-text>
                <v-file-upload v-model="file" accept=".zip" :multiple="false" :clearable="true">
                    <template #icon><v-icon icon="fa-solid fa-file-zipper" size="x-large"></v-icon></template>
                </v-file-upload>
                <v-checkbox v-model="includeDuplicates" :label="$t('MigrationDuplicates')"
                            :hint="$t('MigrationDuplicatesHelp')" persistent-hint></v-checkbox>
            </v-card-text>
            <v-card-actions>
                <v-btn :to="{name: 'RecipeImportPage'}" variant="text">{{ $t('MoreImportOptions') }}</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="success" prepend-icon="fa-solid fa-cloud-arrow-up" :loading="fileApiLoading"
                       :disabled="file == null" @click="startImport">{{ $t('StartMigration') }}</v-btn>
            </v-card-actions>
        </v-card>

        <v-card v-if="importLog" class="table-settings-card mt-5">
            <v-card-title>{{ $t('MigrationProgress') }}</v-card-title>
            <v-card-text><import-log-viewer :import-log="importLog"></import-log-viewer></v-card-text>
            <v-card-actions v-if="!importLog.running && importLog.keyword">
                <v-btn color="success" :to="{name: 'SearchPage', query: {keywords: importLog.keyword.id}}">{{ $t('ViewImportedRecipes') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">

import {onBeforeUnmount, ref} from "vue";
import {ImportLog} from "@/openapi";
import {VFileUpload} from "vuetify/labs/VFileUpload";
import ImportLogViewer from "@/components/display/ImportLogViewer.vue";
import {useFileApi} from "@/composables/useFileApi.ts";
import {ApiApi} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";

const {doAppImport, fileApiLoading} = useFileApi()
const file = ref<File | null>(null)
const includeDuplicates = ref(false)
const importLog = ref<ImportLog | null>(null)
let pollTimeout: ReturnType<typeof setTimeout> | null = null

onBeforeUnmount(() => {
    if (pollTimeout) clearTimeout(pollTimeout)
})

async function startImport() {
    if (file.value == null) return
    try {
        const importId = await doAppImport([file.value], 'DEFAULT', includeDuplicates.value, false, false)
        await loadImportLog(importId)
    } catch (error) {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, error)
    }
}

async function loadImportLog(importId: number) {
    try {
        importLog.value = await new ApiApi().apiImportLogRetrieve({id: importId})
        if (importLog.value.running) {
            pollTimeout = setTimeout(() => loadImportLog(importId), 900)
        }
    } catch (error) {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, error)
    }
}

</script>

<style scoped>
.migration-hero {
    overflow: hidden;
    background: radial-gradient(circle at 90% 10%, rgba(255, 255, 255, .7), transparent 35%), linear-gradient(135deg, rgba(221, 191, 134, .24), rgba(185, 135, 102, .08));
}

.migration-copy {
    max-width: 760px;
}

.migration-step {
    background: rgba(255, 255, 255, .34);
}
</style>
