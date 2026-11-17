

export type Integration = {
    id: string,
    name: string,
    import: boolean,
    export: boolean,
    helpUrl: string,
    imgSrc?: string,
}

export const INTEGRATIONS: Array<Integration> = [
    {id: 'DEFAULT', name: "Table", import: true, export: true, helpUrl: '/help', imgSrc: '/static/assets/table_logo.svg'},
    {id: 'CHEFTAP', name: "Cheftap", import: true, export: false, helpUrl: '/help'},
    {id: 'CHOWDOWN', name: "Chowdown", import: true, export: true, helpUrl: '/help'},
    {id: 'COOKBOOKAPP', name: "CookBookApp", import: true, export: false, helpUrl: '/help'},
    {id: 'COOKLANG', name: "Cooklang Markdown", import: true, export: true, helpUrl: '/help'},
    {id: 'COOKMATE', name: "Cookmate", import: true, export: false, helpUrl: '/help'},
    {id: 'COPYMETHAT', name: "CopyMeThat", import: true, export: false, helpUrl: '/help'},
    {id: 'DOMESTICA', name: "Domestica", import: true, export: false, helpUrl: '/help'},
    {id: 'MEALIE', name: "Mealie 0.x", import: true, export: false, helpUrl: '/help'},
    {id: 'MEALIE1', name: "Mealie 1.x", import: true, export: false, helpUrl: '/help'},
    {id: 'MEALMASTER', name: "Mealmaster", import: true, export: false, helpUrl: '/help'},
    {id: 'MELARECIPES', name: "Melarecipes", import: true, export: false, helpUrl: '/help'},
    {id: 'NEXTCLOUD', name: "Nextcloud Cookbook", import: true, export: true, helpUrl: '/help'},
    {id: 'OPENEATS', name: "Openeats", import: true, export: false, helpUrl: '/help'},
    {id: 'PAPRIKA', name: "Paprika", import: true, export: false, helpUrl: '/help'},
    {id: 'PEPPERPLATE', name: "Pepperplate", import: true, export: false, helpUrl: '/help'},
    {id: 'PLANTOEAT', name: "Plantoeat", import: true, export: false, helpUrl: '/help'},
    {id: 'RECETTETEK', name: "RecetteTek", import: true, export: false, helpUrl: '/help'},
    {id: 'RECIPEKEEPER', name: "Recipekeeper", import: true, export: false, helpUrl: '/help'},
    {id: 'RECIPESAGE', name: "Recipesage", import: true, export: true, helpUrl: '/help'},
    {id: 'REZKONV', name: "Rezkonv", import: true, export: false, helpUrl: '/help'},
    {id: 'SAFFRON', name: "Saffron", import: true, export: true, helpUrl: '/help'},
    {id: 'REZEPTSUITEDE', name: "Rezeptsuite.de", import: true, export: false, helpUrl: '/help'},
    {id: 'GOURMET', name: "Gourmet", import: true, export: false, helpUrl: '/help'},
    {id: 'PESTLE', name: "Pestle", import: true, export: false, helpUrl: '/help'},
]
