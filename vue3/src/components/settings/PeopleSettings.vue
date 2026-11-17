<template>
    <div v-if="canManage">
        <v-card class="table-settings-card">
            <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-3">
                <span><v-icon icon="fa-solid fa-people-group" class="me-2" color="primary"></v-icon>{{ $t('PeopleAndAccess') }}</span>
                <v-btn color="primary" prepend-icon="fa-solid fa-user-plus" @click="inviteDialog = true">{{ $t('InvitePerson') }}</v-btn>
            </v-card-title>
            <v-card-subtitle>{{ $t('PeopleAndAccessHelp') }}</v-card-subtitle>
            <v-card-text>
                <v-alert variant="tonal" color="info" class="mb-4">{{ $t('PeopleAccessSimpleHelp') }}</v-alert>
                <v-list lines="two" class="bg-transparent">
                    <v-list-item v-for="member in members" :key="member.id" class="table-list-row">
                        <template #prepend>
                            <v-avatar color="primary" class="me-3">{{ memberInitials(member) }}</v-avatar>
                        </template>
                        <v-list-item-title>{{ member.user?.displayName || member.user?.username }}</v-list-item-title>
                        <v-list-item-subtitle>
                            {{ member.user?.username }} · {{ member.groups?.map(group => group.name).join(', ') }}
                            <span v-if="member.household?.name"> · {{ member.household.name }}</span>
                        </v-list-item-subtitle>
                        <template #append>
                            <v-chip v-if="member.user?.id === store.userSettings.user?.id" color="success" size="small" class="me-2">{{ $t('You') }}</v-chip>
                            <v-btn icon="$edit" variant="text" :aria-label="$t('Edit')" @click="editingMember = member"></v-btn>
                            <v-btn icon="$delete" color="error" variant="text" :aria-label="$t('RemoveAccess')"
                                   v-if="member.user?.id !== store.activeSpace.createdBy?.id" @click="removeMember(member)"></v-btn>
                        </template>
                    </v-list-item>
                    <v-list-item v-if="members.length === 0">
                        <v-list-item-title>{{ $t('NoMembersYet') }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>

        <v-card class="table-settings-card mt-5">
            <v-card-title>{{ $t('OpenInvitations') }}</v-card-title>
            <v-card-subtitle>{{ $t('OpenInvitationsHelp') }}</v-card-subtitle>
            <v-card-text>
                <v-list lines="two" class="bg-transparent">
                    <v-list-item v-for="invite in invites" :key="invite.id" class="table-list-row">
                        <template #prepend><v-icon icon="fa-solid fa-link" color="primary" class="me-4"></v-icon></template>
                        <v-list-item-title>{{ invite.email || $t('AnyoneWithLink') }}</v-list-item-title>
                        <v-list-item-subtitle>{{ $t('Expires') }}: {{ invite.validUntil?.toLocaleDateString?.() || invite.validUntil }}</v-list-item-subtitle>
                        <template #append>
                            <v-btn icon="fa-solid fa-copy" variant="text" :aria-label="$t('Copy Link')" @click="copyInvite(invite)"></v-btn>
                            <v-btn icon="$delete" color="error" variant="text" :aria-label="$t('Delete')" @click="deleteInvite(invite)"></v-btn>
                        </template>
                    </v-list-item>
                    <v-list-item v-if="invites.length === 0">
                        <v-list-item-title>{{ $t('NoOpenInvitations') }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>

        <v-dialog v-model="inviteDialog" max-width="850">
            <invite-link-editor dialog @save="inviteSaved" @close="inviteDialog = false"></invite-link-editor>
        </v-dialog>
        <v-dialog :model-value="editingMember != null" max-width="850" @update:model-value="value => { if (!value) editingMember = null }">
            <user-space-editor v-if="editingMember" :item-id="editingMember.id" dialog @save="memberSaved" @close="editingMember = null"></user-space-editor>
        </v-dialog>
    </div>
    <v-alert v-else type="warning" variant="tonal">{{ $t('PeopleOwnerOnly') }}</v-alert>
</template>

<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import {ApiApi, InviteLink, UserSpace} from "@/openapi";
import InviteLinkEditor from "@/components/model_editors/InviteLinkEditor.vue";
import UserSpaceEditor from "@/components/model_editors/UserSpaceEditor.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import {ErrorMessageType, MessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore.ts";
import {useDjangoUrls} from "@/composables/useDjangoUrls.ts";

const store = useUserPreferenceStore()
const {getFullUrl} = useDjangoUrls()
const api = new ApiApi()

const members = ref<UserSpace[]>([])
const invites = ref<InviteLink[]>([])
const editingMember = ref<UserSpace | null>(null)
const inviteDialog = ref(false)
const loading = ref(false)

const canManage = computed(() => {
    const userId = store.userSettings.user?.id
    const ownerId = store.activeSpace.createdBy?.id
    const isAdmin = store.activeUserSpace?.groups?.some(group => group.name === 'admin')
    return userId != null && (userId === ownerId || isAdmin || store.userSettings.user?.isSuperuser)
})

onMounted(loadData)

function loadData() {
    if (!canManage.value) return
    loading.value = true
    Promise.all([
        api.apiUserSpaceList({page: 1, pageSize: 100}).then(response => members.value = response.results),
        api.apiInviteLinkList({page: 1, pageSize: 100}).then(response => invites.value = response.results),
    ]).catch(error => useMessageStore().addError(ErrorMessageType.FETCH_ERROR, error)).finally(() => loading.value = false)
}

function memberInitials(member: UserSpace) {
    const name = member.user?.displayName || member.user?.username || '?'
    return name.split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase()
}

function inviteSaved() {
    inviteDialog.value = false
    loadData()
}

function memberSaved() {
    editingMember.value = null
    store.loadUserSpaces()
    loadData()
}

function removeMember(member: UserSpace) {
    if (!window.confirm('Remove this person from the cookbook?')) return
    api.apiUserSpaceDestroy({id: member.id!}).then(() => {
        useMessageStore().addPreparedMessage(PreparedMessage.DELETE_SUCCESS)
        loadData()
    }).catch(error => useMessageStore().addError(ErrorMessageType.DELETE_ERROR, error))
}

function inviteLink(invite: InviteLink) {
    return getFullUrl(`/invite/${invite.uuid}`)
}

function copyInvite(invite: InviteLink) {
    navigator.clipboard.writeText(inviteLink(invite)).then(() => useMessageStore().addMessage(MessageType.SUCCESS, {title: 'Copied', text: ''}, 1500))
}

function deleteInvite(invite: InviteLink) {
    if (!window.confirm('Delete this invitation?')) return
    api.apiInviteLinkDestroy({id: invite.id!}).then(() => loadData()).catch(error => useMessageStore().addError(ErrorMessageType.DELETE_ERROR, error))
}

</script>
