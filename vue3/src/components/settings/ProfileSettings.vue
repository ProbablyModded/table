<template>
    <v-form>
        <p class="text-h6">{{ $t('Profile') }}</p>
        <v-divider class="mb-3"></v-divider>

        <!--                    <v-label>Avatar</v-label><br/>-->
        <!--                    <v-avatar class="mt-3 mb-3" style="height: 10vh; width: 10vh" color="info">V</v-avatar> Feature coming in a future version.-->

        <v-text-field class="mt-3" :label="$t('First_name')" v-model="user.firstName"></v-text-field>
        <v-text-field :label="$t('Last_name')" v-model="user.lastName"></v-text-field>
        <v-btn color="success" prepend-icon="$save" @click="save()">{{ $t('Save') }}</v-btn>

        <v-divider class="my-5"></v-divider>
        <p class="text-h6">{{ $t('Preferences') }}</p>
        <v-checkbox v-model="store.userSettings.showMealplanOnStart"
                    :label="$t('ShowMealPlanOnStartPage')"></v-checkbox>
        <v-checkbox v-model="store.userSettings.showPantry"
                    :label="$t('ShowPantry')"
                    :hint="$t('ShowPantryHelp')"
                    persistent-hint></v-checkbox>
        <v-btn color="success" class="mt-2" prepend-icon="$save" @click="save()">{{ $t('Save') }}</v-btn>

    </v-form>
</template>


<script setup lang="ts">

import {onMounted, ref} from "vue";
import {ApiApi, User} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";

const user = ref({} as User)
const store = useUserPreferenceStore()

onMounted(() => {
    let api = new ApiApi()

    api.apiUserRetrieve({id: useUserPreferenceStore().userSettings.user.id}).then(r => {
        user.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
})

async function save() {
    let api = new ApiApi()
    try {
        const [savedUser] = await Promise.all([
            api.apiUserPartialUpdate({id: user.value.id!, patchedUser: user.value}),
            store.updateUserSettings(true),
        ])
        user.value = savedUser
        useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
    } catch (err) {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    }
}

</script>

<style scoped>

</style>
