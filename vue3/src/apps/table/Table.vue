<template>
    <v-app class="table-app">
        <v-app-bar color="primary" class="table-topbar" flat density="comfortable" v-if="!store.isAuthenticated && !store.isPrintMode">
            <router-link :to="{name: 'StartPage'}" aria-label="Table" class="table-brand-link">
                <v-avatar color="white" size="38" class="table-brand-mark">
                    <v-icon icon="fa-solid fa-table-cells-large" color="primary" size="20"></v-icon>
                </v-avatar>
                <span class="table-brand-word">Table</span>
            </router-link>
        </v-app-bar>
        <v-app-bar :color="navBarColor"
                   class="table-topbar" flat density="comfortable" v-if="store.isAuthenticated && !store.isPrintMode"
                   :absolute="!store.userSettings.navSticky"
                   :scroll-behavior="store.userSettings.navSticky ? 'elevate' : ''">
            <router-link :to="{ name: 'StartPage', params: {} }" class="table-brand-link">
                <div v-if="store.userSettings.navShowLogo && activeNavLogo" class="table-custom-logo">
                    <v-img :src="activeNavLogo" width="118" height="34" contain></v-img>
                </div>
                <template v-else-if="store.userSettings.navShowLogo">
                    <v-avatar color="white" size="38" class="table-brand-mark">
                        <v-icon icon="fa-solid fa-table-cells-large" color="primary" size="20"></v-icon>
                    </v-avatar>
                    <span class="table-brand-word">{{ brandName }}</span>
                </template>
            </router-link>

            <v-spacer></v-spacer>
            <global-search-dialog></global-search-dialog>
            <v-btn icon="$add" class="d-print-none">
                <v-icon icon="$add" class="fa-fw"></v-icon>
                <v-menu activator="parent">
                    <v-list>
                        <v-list-item prepend-icon="$add" :to="{ name: 'ModelEditPage', params: {model: 'recipe'} }">{{ $t('Create Recipe') }}</v-list-item>
                        <v-list-item prepend-icon="fa-solid fa-globe" :to="{ name: 'RecipeImportPage', params: {} }">{{ $t('Import Recipe') }}</v-list-item>
                    </v-list>
                </v-menu>
            </v-btn>

            <v-avatar color="secondary" class="me-2 cursor-pointer d-print-none table-user-avatar">{{ store.userSettings.user.displayName.charAt(0) }}
                <v-menu activator="parent">

                    <v-list density="compact">
                        <menu-user-info></menu-user-info>
                        <v-divider></v-divider>

                        <component :is="item.component" :="item" :key="item.title" v-for="item in useNavigation().getUserNavigation()"></component>
                        <v-list-item prepend-icon="fa-solid fa-arrow-right-from-bracket" @click="logout()">{{ $t('Logout') }}</v-list-item>
                    </v-list>
                </v-menu>
            </v-avatar>

        </v-app-bar>
        <v-app-bar color="info"
                   v-if="useUserPreferenceStore().isAuthenticated && useUserPreferenceStore().activeSpace.maxRecipes == 10 && useUserPreferenceStore().serverSettings.hosted">
            <p class="text-center w-100">
                {{ $t('HostedFreeVersion') }}
                <v-btn color="success" size="small" variant="flat" :to="{name: 'EnterpriseSettingsBillingSubscription'}">{{ $t('UpgradeNow') }}</v-btn>
            </p>
        </v-app-bar>
        <v-app-bar color="warning" v-if="useUserPreferenceStore().isAuthenticated && isSpaceAboveLimit(useUserPreferenceStore().activeSpace)">
            <p class="text-center w-100">
                {{ $t('SpaceLimitExceeded') }}
                <v-btn color="success" size="small" variant="flat" :to="{name: 'SpaceSettings'}">{{ $t('SpaceSettings') }}</v-btn>
            </p>
        </v-app-bar>

        <v-app-bar color="info" density="compact"
                   v-if="useUserPreferenceStore().isAuthenticated && useUserPreferenceStore().activeSpace.message != '' && !useUserPreferenceStore().isPrintMode">
            <p class="text-center w-100">
                {{ useUserPreferenceStore().activeSpace.message }}
            </p>
        </v-app-bar>

        <v-main class="table-main">
            <router-view></router-view>
        </v-main>

        <!-- completely hide in print mode because setting d-print-node keeps layout -->
        <v-navigation-drawer class="table-sidebar" width="264" elevation="10" v-if="lgAndUp && store.isAuthenticated && !store.isPrintMode">
            <v-list class="table-sidebar-list" nav>
                <div class="table-sidebar-profile">
                    <menu-user-info></menu-user-info>
                </div>
                <v-list-subheader class="table-nav-label">{{ $t('YourKitchen') }}</v-list-subheader>
                <component :is="item.component" :="item" :key="item.title" v-for="item in useNavigation().getNavigationDrawer()"></component>

                <navigation-drawer-context-menu></navigation-drawer-context-menu>
            </v-list>

            <template #append>
                <v-list nav class="table-sidebar-footer">
                    <v-list-item prepend-icon="fas fa-sliders" :title="$t('Settings')" :to="{ name: 'SettingsPage', params: {} }"></v-list-item>
                    <v-list-item prepend-icon="fa-solid fa-heart" link>
                        Table {{ useUserPreferenceStore().serverSettings.version }}
                        <help-dialog></help-dialog>
                    </v-list-item>
                </v-list>
            </template>

        </v-navigation-drawer>

        <v-bottom-navigation grow v-if="store.isAuthenticated && !lgAndUp && !store.isPrintMode">
            <v-btn value="recent" :to="{ name: 'StartPage', params: {} }">
                <v-icon icon="fa-fw fas fa-book "/>
            </v-btn>

            <v-btn value="favorites" to="/mealplan">
                <v-icon icon="fa-fw fas fa-calendar-alt"></v-icon>
            </v-btn>

            <v-btn value="nearby" to="/shopping">
                <v-icon icon="fa-fw fas fa-shopping-cart"></v-icon>
            </v-btn>

            <v-btn value="nearby">
                <v-icon icon="fa-fw fas fa-bars"></v-icon>
                <v-bottom-sheet activator="parent" close-on-content-click>
                    <v-list nav>
                        <menu-user-info></menu-user-info>
                        <component :is="item.component" :="item" :key="item.title" v-for="item in useNavigation().getBottomNavigation()"></component>
                    </v-list>
                </v-bottom-sheet>
            </v-btn>
        </v-bottom-navigation>

        <v-snackbar-queued
            :vertical="true"
            location="top center"
        ></v-snackbar-queued>

    </v-app>

</template>

<script lang="ts" setup>
import GlobalSearchDialog from "@/components/inputs/GlobalSearchDialog.vue"

import {useDisplay, useLocale} from "vuetify"
import {toVuetifyLocale} from "@/vuetify"
import VSnackbarQueued from "@/components/display/VSnackbarQueued.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import NavigationDrawerContextMenu from "@/components/display/NavigationDrawerContextMenu.vue";
import {computed, nextTick, onMounted} from "vue";
import {isSpaceAboveLimit} from "@/utils/logic_utils";
import {useTitle} from "@vueuse/core";
import HelpDialog from "@/components/dialogs/HelpDialog.vue";
import {useNavigation} from "@/composables/useNavigation.ts";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import MenuUserInfo from "@/components/display/MenuUserInfo.vue";
import {AuthenticationCurrentSessionApi} from "@/authapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";

const {lgAndUp} = useDisplay()
const {t} = useI18n()
const store = useUserPreferenceStore()

const brandName = computed(() => store.activeSpace.appName || store.activeSpace.name || 'Table')
const activeNavLogo = computed(() => store.activeSpace.navLogo?.preview || '')
const navBarColor = computed(() => store.activeSpace.navBgColor || store.userSettings.navBgColor || 'primary')

const title = useTitle()
const router = useRouter()

onMounted(() => {
    init()
})

function init() {
    useUserPreferenceStore().init().then(() => {
        if (useUserPreferenceStore().activeSpace.spaceSetupCompleted != undefined && useUserPreferenceStore().isAuthenticated && !useUserPreferenceStore().activeSpace.spaceSetupCompleted) {
            router.push({name: 'WelcomePage'})
        } else if (router.currentRoute.value.name == 'LoginPage' && useUserPreferenceStore().isAuthenticated) {
            router.push({name: 'StartPage'})
        }
    })


    const {current} = useLocale()
    let locale = document.querySelector('html')!.getAttribute('lang')
    if (locale != null) {
        current.value = toVuetifyLocale(locale.toLowerCase())
    }
}

/**
 * global title update handler, might be overridden by page specific handlers
 */
router.afterEach((to, from) => {
    if (to.name == 'StartPage' && useUserPreferenceStore().initCompleted && useUserPreferenceStore().isAuthenticated && !useUserPreferenceStore().activeSpace.spaceSetupCompleted != undefined && !useUserPreferenceStore().activeSpace.spaceSetupCompleted && useUserPreferenceStore().activeSpace.createdBy.id! == useUserPreferenceStore().userSettings.user.id!) {
        router.push({name: 'WelcomePage'})
    } else if (to.name == 'StartPage' &&
        useUserPreferenceStore().initCompleted &&
        useUserPreferenceStore().activeSpace.spaceSetupCompleted &&
        !useUserPreferenceStore().activeSpace.householdSetupCompleted != undefined &&
        !useUserPreferenceStore().activeSpace.householdSetupCompleted &&
        useUserPreferenceStore().activeSpace.createdBy.id! == useUserPreferenceStore().userSettings.user.id! &&
        useUserPreferenceStore().activeUserSpace?.household == undefined) {
        router.push({name: 'HouseholdPage'})
    } else if (to.name == 'LoginPage' && useUserPreferenceStore().initCompleted && useUserPreferenceStore().isAuthenticated) {
        router.push({name: 'StartPage'})
    }

    if (from.fullPath.startsWith('/account/') && !to.fullPath.startsWith('/account/')) {
        init()
    }

    nextTick(() => {
        if (to.meta.title) {
            title.value = t(to.meta.title)
        } else {
            title.value = 'Table'
        }
    })
})

function logout() {
    let authenticationCurrentSessionApi = new AuthenticationCurrentSessionApi()

    authenticationCurrentSessionApi.allauthClientV1AuthSessionDelete({client: "browser"}).then(r => {
    }).catch(err => {

    }).finally(() => {
        useUserPreferenceStore().isAuthenticated = false
        router.push({name: 'LoginPage'})
    })
}

</script>

<style>

.v-theme--dark {

    a:not([class]) {
        color: #b98766;
        text-decoration: none;
        background-color: transparent
    }

    a:hover {
        color: #fff;
        text-decoration: none
    }

    a:not([href]):not([tabindex]), a:not([href]):not([tabindex]):focus, a:not([href]):not([tabindex]):hover {
        color: inherit;
        text-decoration: none
    }

    a:not([href]):not([tabindex]):focus {
        outline: 0
    }

    /* Meal-Plan */

    .cv-header {
        background-color: #303030 !important;
    }

    .cv-weeknumber, .cv-header-day {
        background-color: #303030 !important;
        color: #fff !important;
    }

    .cv-day.past {
        background-color: #333333 !important;
    }

    .cv-day.today {
        background-color: rgba(185, 135, 102, 0.2) !important;
    }

    .cv-day.outsideOfMonth {
        background-color: #0d0d0d !important;
    }

    .cv-item {
        background-color: #4E4E4E !important;
    }

    .d01 .cv-day-number {
        background-color: #b98766 !important;
    }

    /* mavon-editor link/image dialog */

    .add-image-link {
        background-color: #212121 !important;
        color: #fff !important;
    }

    .add-image-link > i {
        color: rgba(255, 255, 255, 0.7) !important;
    }

    .add-image-link .input-wrapper {
        border-color: #555 !important;
    }

    .add-image-link .input-wrapper input {
        background-color: #212121 !important;
        color: #fff !important;
    }

    .add-image-link .op-btn {
        color: #fff !important;
    }

    /* mavon-editor dark mode — container + toolbar */

    .v-note-wrapper {
        background-color: #212121 !important;
        border-color: #555 !important;
    }

    .v-note-wrapper .v-note-op {
        background-color: #303030 !important;
        border-bottom-color: #555 !important;
    }

    /* mavon-editor dark mode — toolbar icons */

    .v-note-wrapper .op-icon {
        color: rgba(255, 255, 255, 0.7) !important;
    }

    .v-note-wrapper .op-icon:hover {
        color: #fff !important;
        background-color: rgba(255, 255, 255, 0.1) !important;
    }

    .v-note-wrapper .op-icon.selected {
        color: #fff !important;
        background-color: rgba(255, 255, 255, 0.15) !important;
    }

    .v-note-wrapper .op-icon-divider {
        border-left-color: #555 !important;
    }

    /* mavon-editor dark mode — textarea and wrappers */

    .auto-textarea-input,
    .content-input-wrapper,
    .auto-textarea-wrapper {
        color: #e0e0e0 !important;
        background-color: #212121 !important;
    }

    .v-note-wrapper .v-show-content,
    .v-note-wrapper .v-show-content-html,
    .v-note-wrapper .v-note-read-model {
        background-color: #212121 !important;
    }

    .v-note-wrapper .v-note-navigation-wrapper {
        background-color: rgba(33, 33, 33, 0.98) !important;
    }

    .v-note-wrapper .op-header.popup-dropdown {
        background-color: #303030 !important;
        border-color: #555 !important;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3) !important;
    }

    /* mavon-editor dark mode — preview panel */

    .v-note-wrapper .markdown-body {
        color: #e0e0e0 !important;
    }

    .v-note-wrapper .markdown-body a {
        color: #b98766 !important;
    }

    .v-note-wrapper .markdown-body h1,
    .v-note-wrapper .markdown-body h2 {
        border-bottom-color: #555 !important;
    }

    .v-note-wrapper .markdown-body h6 {
        color: #999 !important;
    }

    .v-note-wrapper .markdown-body hr {
        background-color: #555 !important;
    }

    .v-note-wrapper .markdown-body blockquote {
        color: #999 !important;
        border-left-color: #555 !important;
        background-color: rgba(255, 255, 255, 0.05) !important;
    }

    .v-note-wrapper .markdown-body table tr {
        background-color: #212121 !important;
        border-top-color: #555 !important;
    }

    .v-note-wrapper .markdown-body table tr:nth-child(2n) {
        background-color: #2a2a2a !important;
    }

    .v-note-wrapper .markdown-body table td,
    .v-note-wrapper .markdown-body table th {
        border-color: #555 !important;
    }

    .v-note-wrapper .markdown-body code {
        background-color: rgba(255, 255, 255, 0.1) !important;
        color: #e0e0e0 !important;
    }

    .v-note-wrapper .markdown-body .highlight pre,
    .v-note-wrapper .markdown-body pre {
        background-color: #2a2a2a !important;
        color: #e0e0e0 !important;
    }

    .v-note-wrapper .markdown-body kbd {
        color: #e0e0e0 !important;
        background-color: #333 !important;
        border-color: #555 !important;
        box-shadow: inset 0 -1px 0 #444 !important;
    }

    .v-note-wrapper .markdown-body img {
        background-color: transparent !important;
    }

    /* mavon-editor dark mode — dropdown menus */

    .v-note-wrapper .op-icon.dropdown-wrapper .dropdown-item {
        color: #e0e0e0 !important;
        background-color: #303030 !important;
    }

    .v-note-wrapper .op-icon.dropdown-wrapper .dropdown-item:hover {
        color: #fff !important;
        background-color: #424242 !important;
    }

    /* mavon-editor dark mode — scrollbar */

    .v-note-wrapper .scroll-style::-webkit-scrollbar {
        background-color: #333 !important;
    }

    .v-note-wrapper .scroll-style::-webkit-scrollbar-thumb {
        background-color: #555 !important;
    }

    /* markdown display (read-only view in StepView) */

    .markdown-body {
        color: #e0e0e0 !important;
    }

    .markdown-body a {
        color: #b98766 !important;
    }

    .markdown-body blockquote {
        background: rgba(255, 255, 255, 0.05) !important;
        border-left-color: #555 !important;
    }

    .markdown-body code {
        background-color: rgba(255, 255, 255, 0.1) !important;
        color: #e0e0e0 !important;
    }
}

.v-theme--light {
    a:not([class]) {
        color: #b98766;
        text-decoration: none;
        background-color: transparent
    }

    a:hover {
        color: #000;
        text-decoration: none
    }

    a:not([href]):not([tabindex]), a:not([href]):not([tabindex]):focus, a:not([href]):not([tabindex]):hover {
        color: inherit;
        text-decoration: none
    }

    a:not([href]):not([tabindex]):focus {
        outline: 0
    }

}

/* Global Link Styles */
a {
    color: rgb(var(--v-theme-primary));
    text-decoration: none;
    background-color: transparent;
    transition: color 0.15s ease-in-out, opacity 0.15s ease-in-out;
}

a:hover {
    color: rgb(var(--v-theme-primary));
    text-decoration: underline;
    opacity: 0.85;
}

/* Table 1.0 visual system */
:root {
    --table-ink: rgb(var(--v-theme-on-background));
    --table-muted: rgba(var(--v-theme-on-background), .66);
    --table-surface: rgba(var(--v-theme-surface), .94);
    --table-surface-strong: rgb(var(--v-theme-surface));
    --table-border: rgba(var(--v-theme-primary), .13);
    --table-shadow: 0 24px 64px rgba(25, 35, 55, .13);
    --table-radius: 28px;
}

.table-app {
    font-family: "Avenir Next", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: rgb(var(--v-theme-on-background));
    background:
        radial-gradient(circle at 8% 0%, rgba(var(--v-theme-primary), .13), transparent 26rem),
        radial-gradient(circle at 92% 14%, rgba(var(--v-theme-secondary), .12), transparent 28rem),
        rgb(var(--v-theme-background));
}

.v-theme--TABLE_DARK.table-app,
.v-theme--dark.table-app {
    --table-ink: #f7efe8;
    --table-muted: #c0b3aa;
    --table-surface: rgba(var(--v-theme-surface), .94);
    --table-surface-strong: rgb(var(--v-theme-surface));
    --table-border: rgba(var(--v-theme-primary), .18);
    --table-shadow: 0 24px 64px rgba(0, 0, 0, .28);
    background:
        radial-gradient(circle at 8% 0%, rgba(var(--v-theme-primary), .12), transparent 26rem),
        radial-gradient(circle at 92% 14%, rgba(var(--v-theme-secondary), .1), transparent 28rem),
        rgb(var(--v-theme-background));
}

.table-main {
    position: relative;
    min-height: 100vh;
    isolation: isolate;
}

.table-main::before {
    position: fixed;
    z-index: -1;
    inset: 0;
    pointer-events: none;
    content: '';
    opacity: 0.35;
    background-image: linear-gradient(rgba(var(--v-theme-primary), .04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(var(--v-theme-primary), .04) 1px, transparent 1px);
    background-size: 34px 34px;
    mask-image: linear-gradient(to bottom, black, transparent 75%);
}

.table-app .v-app-bar {
    min-height: 68px;
    margin: 12px 16px 0;
    width: calc(100% - 32px) !important;
    border: 1px solid rgba(255, 255, 255, .24) !important;
    border-radius: 22px !important;
    box-shadow: 0 16px 38px rgba(var(--v-theme-primary), .22) !important;
    backdrop-filter: blur(18px);
}

.table-brand-link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: inherit;
    text-decoration: none;
}

.table-brand-mark {
    box-shadow: 0 6px 16px rgba(0, 0, 0, .12);
}

.table-brand-word {
    max-width: 260px;
    overflow: hidden;
    color: inherit;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: .01em;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.table-custom-logo {
    display: flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 14px;
    background: rgba(255, 255, 255, .94);
    box-shadow: 0 5px 16px rgba(0, 0, 0, .12);
}

.table-user-avatar {
    box-shadow: 0 5px 14px rgba(0, 0, 0, .14);
}

.table-app .v-navigation-drawer {
    top: 94px !important;
    height: calc(100% - 108px) !important;
    margin-left: 14px;
    border: 1px solid var(--table-border) !important;
    border-radius: 26px !important;
    background: var(--table-surface) !important;
    box-shadow: 0 24px 58px rgba(25, 35, 55, .12) !important;
    backdrop-filter: blur(18px);
}

.table-sidebar-list {
    padding: 12px 8px 8px;
}

.table-sidebar-profile {
    margin: 2px 0 14px;
    padding: 6px;
    border: 1px solid rgba(var(--v-theme-primary), .12);
    border-radius: 20px;
    background: rgba(var(--v-theme-primary), .07);
}

.table-nav-label {
    padding-inline: 14px !important;
    color: rgb(var(--v-theme-primary)) !important;
    font-size: .68rem !important;
    font-weight: 800 !important;
    letter-spacing: .12em;
    text-transform: uppercase;
}

.table-sidebar .v-list-item--active {
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), .12);
    font-weight: 700;
}

.table-sidebar-footer {
    padding: 8px;
}

.v-theme--TABLE_DARK.table-app .v-navigation-drawer,
.v-theme--dark.table-app .v-navigation-drawer,
.v-theme--dark.table-app .v-bottom-navigation {
    background: rgba(var(--v-theme-surface), .94) !important;
}

.table-app .v-card {
    border: 1px solid var(--table-border);
    border-radius: var(--table-radius);
    box-shadow: var(--table-shadow);
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.table-app .v-card:not(.v-card--flat):hover {
    border-color: rgba(var(--v-theme-primary), .3);
    box-shadow: 0 28px 72px rgba(25, 35, 55, .18);
    transform: translateY(-2px);
}

.table-app .v-btn {
    min-height: 42px;
    border-radius: 13px;
    text-transform: none;
    letter-spacing: 0.01em;
    transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
}

.table-app .v-btn:hover {
    filter: saturate(1.08);
    transform: translateY(-1px);
}

.table-app .v-list-item {
    margin: 3px 8px;
    border-radius: 13px;
    transition: background-color 160ms ease, transform 160ms ease;
}

.table-app .v-list-item:hover {
    transform: translateX(2px);
}

.table-app .v-data-table,
.table-app .v-data-table-server {
    overflow: hidden;
    border-radius: 16px;
}

.table-app .v-field {
    border-radius: 13px;
}

.table-app .v-bottom-navigation {
    border-top: 1px solid var(--table-border);
    box-shadow: 0 -10px 32px rgba(76, 47, 29, 0.1);
    backdrop-filter: blur(18px);
}

@keyframes table-fade-up {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.table-main > .v-container,
.table-main > .v-container-fluid {
    animation: table-fade-up 420ms ease both;
}

@media (max-width: 600px) {
    .table-app .v-container {
        padding: 14px;
    }

    .table-app .v-card {
        border-radius: 18px;
    }

    .table-app .v-card-title {
        font-size: 1.08rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .table-app *,
    .table-app *::before,
    .table-app *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 0.001ms !important;
    }
}

</style>
