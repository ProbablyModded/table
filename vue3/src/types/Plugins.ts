import {RouteRecordRaw} from "vue-router";
import {Component} from "vue";

export type TablePlugin = {
    name: string,
    basePath: string,
    defaultLocale: any,
    localeFiles: any,

    routes: RouteRecordRaw[]
    settingRoutes?: RouteRecordRaw[],

    navigationDrawer: any[],
    bottomNavigation: any[],
    userNavigation: any[],

    buildInputs?: string[],

    databasePageComponent?: Component,
    settingsComponent?: Component,

    disabled?: boolean
}

export type PluginModule = {
  plugin: TablePlugin
}

const pluginModules = import.meta.glob('@/plugins/*/plugin.ts', { eager: true })
export let TABLE_PLUGINS = [] as TablePlugin[]
Object.values(pluginModules).forEach(module => {
    if(!module.plugin.disabled){
        TABLE_PLUGINS.push(module.plugin)
    }
})
