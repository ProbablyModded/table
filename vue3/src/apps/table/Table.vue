<template>
    <v-app class="table-app">
        <v-app-bar color="table" flat density="comfortable" v-if="!useUserPreferenceStore().isAuthenticated && !useUserPreferenceStore().isPrintMode">
            <router-link :to="{name: 'StartPage'}" aria-label="Table">
                <v-img src="../../assets/table_logo.svg" width="140px" class="ms-2"></v-img>
            </router-link>
        </v-app-bar>
        <v-app-bar :color="useUserPreferenceStore().activeSpace.navBgColor ? useUserPreferenceStore().activeSpace.navBgColor : useUserPreferenceStore().userSettings.navBgColor"
                   flat density="comfortable" v-if="useUserPreferenceStore().isAuthenticated && !useUserPreferenceStore().isPrintMode"
                   :absolute="!useUserPreferenceStore().userSettings.navSticky"
                   :scroll-behavior="useUserPreferenceStore().userSettings.navSticky ? 'elevate' : ''">
            <router-link :to="{ name: 'StartPage', params: {} }">
                <v-img src="../../assets/table_logo.svg" width="140px" class="ms-2"
                       v-if="useUserPreferenceStore().userSettings.navShowLogo && !useUserPreferenceStore().activeSpace.navLogo"></v-img>
                    <v-img :src="useUserPreferenceStore().activeSpace.navLogo.preview" width="140px" class="ms-2"
                       v-if="useUserPreferenceStore().userSettings.navShowLogo && useUserPreferenceStore().activeSpace.navLogo != undefined"></v-img>
                    <span class="table-brand-name ms-3" v-if="useUserPreferenceStore().userSettings.navShowLogo && !useUserPreferenceStore().activeSpace.navLogo">
                        {{ useUserPreferenceStore().activeSpace.appName || useUserPreferenceStore().activeSpace.name || 'Table' }}
                    </span>
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

            <v-avatar color="primary" class="me-2 cursor-pointer d-print-none">{{ useUserPreferenceStore().userSettings.user.displayName.charAt(0) }}
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
        <v-navigation-drawer v-if="lgAndUp && useUserPreferenceStore().isAuthenticated && !useUserPreferenceStore().isPrintMode">
            <v-list>
                <menu-user-info></menu-user-info>
                <v-divider></v-divider>
                <component :is="item.component" :="item" :key="item.title" v-for="item in useNavigation().getNavigationDrawer()"></component>

                <navigation-drawer-context-menu></navigation-drawer-context-menu>
            </v-list>

            <template #append>
                <v-list nav>
                    <v-list-item prepend-icon="fas fa-sliders" :title="$t('Settings')" :to="{ name: 'SettingsPage', params: {} }"></v-list-item>
                    <v-list-item prepend-icon="fa-solid fa-heart" link>
                        Table {{ useUserPreferenceStore().serverSettings.version }}
                        <help-dialog></help-dialog>
                    </v-list-item>
                </v-list>
            </template>

        </v-navigation-drawer>

        <v-bottom-navigation grow v-if="useUserPreferenceStore().isAuthenticated && !lgAndUp && !useUserPreferenceStore().isPrintMode">
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
import {nextTick, onMounted} from "vue";
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
    --table-ink: #2e2925;
    --table-muted: #756b63;
    --table-surface: rgba(255, 252, 248, 0.88);
    --table-surface-strong: #fffdfb;
    --table-border: rgba(122, 89, 63, 0.14);
    --table-shadow: 0 18px 48px rgba(76, 47, 29, 0.1);
    --table-radius: 22px;
}

.table-app {
    font-family: "Avenir Next", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: var(--table-ink);
    background:
        radial-gradient(circle at 8% 0%, rgba(217, 130, 91, 0.14), transparent 26rem),
        radial-gradient(circle at 92% 14%, rgba(130, 170, 139, 0.16), transparent 28rem),
        #f8f4ef;
}

.v-theme--dark.table-app {
    --table-ink: #f7efe8;
    --table-muted: #c0b3aa;
    --table-surface: rgba(43, 35, 31, 0.88);
    --table-surface-strong: #2b231f;
    --table-border: rgba(255, 230, 210, 0.13);
    --table-shadow: 0 18px 48px rgba(0, 0, 0, 0.24);
    background:
        radial-gradient(circle at 8% 0%, rgba(217, 130, 91, 0.12), transparent 26rem),
        radial-gradient(circle at 92% 14%, rgba(130, 170, 139, 0.1), transparent 28rem),
        #1f1a18;
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
    background-image: linear-gradient(rgba(122, 89, 63, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(122, 89, 63, 0.035) 1px, transparent 1px);
    background-size: 34px 34px;
    mask-image: linear-gradient(to bottom, black, transparent 75%);
}

.table-app .v-app-bar {
    border-bottom: 1px solid rgba(255, 255, 255, 0.16) !important;
    box-shadow: 0 8px 28px rgba(56, 37, 24, 0.08) !important;
    backdrop-filter: blur(18px);
}

.table-app .v-navigation-drawer {
    border-right: 1px solid var(--table-border) !important;
    background: rgba(255, 252, 248, 0.86) !important;
    backdrop-filter: blur(18px);
}

.v-theme--dark.table-app .v-navigation-drawer,
.v-theme--dark.table-app .v-bottom-navigation {
    background: rgba(35, 29, 26, 0.9) !important;
}

.table-app .v-card {
    border: 1px solid var(--table-border);
    border-radius: var(--table-radius);
    box-shadow: var(--table-shadow);
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.table-app .v-card:not(.v-card--flat):hover {
    border-color: rgba(185, 135, 102, 0.3);
    box-shadow: 0 22px 58px rgba(76, 47, 29, 0.14);
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
