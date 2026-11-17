<template>
    <v-container class="table-home">
        <v-row class="table-home-hero" align="stretch">
            <v-col cols="12" md="8">
                <v-card class="table-hero" elevation="0">
                    <v-card-text>
                        <div class="table-eyebrow">
                            <span class="table-eyebrow-dot"></span>
                            TABLE 1.0 · YOUR KITCHEN, IN ONE PLACE
                        </div>
                        <h1 class="table-hero-title">Recipes worth coming back to.</h1>
                        <p class="table-hero-copy">
                            Keep your recipes, plans, and shopping workflow close at hand—beautifully organized on desktop and mobile.
                        </p>
                        <div class="table-hero-actions">
                            <v-btn color="primary" size="large" prepend-icon="$recipes" :to="{name: 'SearchPage', params: {query: ''}}">
                                {{ $t('View_Recipes') }}
                            </v-btn>
                            <v-btn variant="text" size="large" prepend-icon="$mealplan" :to="{name: 'MealPlanPage'}">
                                {{ $t('Meal_Plan') }}
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" md="4">
                <v-card class="table-contact-card" elevation="0">
                    <v-card-text>
                        <div class="table-contact-icon"><i class="fa-solid fa-utensils"></i></div>
                        <p class="text-overline mb-2">TABLE 1.0</p>
                        <h2 class="text-h5 mb-2">Built for real households.</h2>
                        <p class="text-body-2 text-medium-emphasis mb-5">
                            Shopping carts are on the roadmap, so planned groceries can eventually be pre-populated for checkout.
                        </p>
                        <a class="table-contact-link" href="mailto:highlandn@gmail.com">
                            <i class="fa-solid fa-envelope"></i>
                            highlandn@gmail.com
                        </a>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <horizontal-meal-plan-window v-if="useUserPreferenceStore().userSettings.showMealplanOnStart !== false"></horizontal-meal-plan-window>

        <v-card v-if="totalRecipes == 0" class="mt-5 mb-5">
            <v-card-title class="text-center"><i class="fa-solid fa-eye-slash"></i> {{ $t('search_no_recipes') }}</v-card-title>
            <v-card-text>
                <v-card
                    :title="$t('Create Recipe')"
                    variant="outlined"
                    :to="{name: 'ModelEditPage', params: {model: 'Recipe'}}"
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
                    :to="{name: 'RecipeImportPage', params: {}}"
                    prepend-icon="$import"
                    append-icon="fa-solid fa-arrow-right">
                    <template #subtitle>
                        <p class="text-wrap">
                            {{ $t('ImportFirstRecipe') }}
                        </p>
                    </template>
                </v-card>
            </v-card-text>
        </v-card>
        <template v-if="totalRecipes > 0">
            <horizontal-recipe-scroller :skeletons="4" mode="recent" v-if="totalRecipes > 10"></horizontal-recipe-scroller>
            <horizontal-recipe-scroller :skeletons="4" mode="new" v-if="totalRecipes > 10"></horizontal-recipe-scroller>
            <horizontal-recipe-scroller :skeletons="4" mode="keyword" v-if="totalRecipes > 10"></horizontal-recipe-scroller>
            <horizontal-recipe-scroller :skeletons="4" mode="random" v-if="totalRecipes > 0"></horizontal-recipe-scroller>
            <horizontal-recipe-scroller :skeletons="4" mode="created_by" v-if="totalRecipes > 10"></horizontal-recipe-scroller>
            <horizontal-recipe-scroller :skeletons="2" mode="rating" v-if="totalRecipes > 10"></horizontal-recipe-scroller>
            <horizontal-recipe-scroller :skeletons="4" mode="keyword" v-if="totalRecipes > 25"></horizontal-recipe-scroller>
            <horizontal-recipe-scroller :skeletons="4" mode="random" v-if="totalRecipes > 25"></horizontal-recipe-scroller>

            <v-row>
                <v-col class="text-center">
                    <v-btn size="x-large" rounded="xl" prepend-icon="$search" variant="tonal" :to="{name: 'SearchPage', params: {query: ''}}">{{ $t('View_Recipes') }}</v-btn>
                </v-col>
            </v-row>

        </template>


    </v-container>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue"
import {ApiApi} from "@/openapi"
import HorizontalRecipeScroller from "@/components/display/HorizontalRecipeWindow.vue"
import HorizontalMealPlanWindow from "@/components/display/HorizontalMealPlanWindow.vue"
import SearchPage from "@/pages/SearchPage.vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import {useRouter} from "vue-router";

const totalRecipes = ref(-1)

onMounted(() => {
    const api = new ApiApi()

    api.apiRecipeList({pageSize: 1}).then((r) => {
        totalRecipes.value = r.count
    })
})
</script>

<style scoped>
.table-home-hero {
    margin-bottom: 18px;
}

.table-hero,
.table-contact-card {
    height: 100%;
    overflow: hidden;
    position: relative;
}

.table-hero {
    color: #fff;
    background:
        radial-gradient(circle at 88% 12%, rgba(255, 255, 255, 0.2), transparent 12rem),
        linear-gradient(135deg, #9e6348 0%, #b98766 55%, #d9825b 100%);
}

.table-hero::after {
    content: '';
    position: absolute;
    width: 13rem;
    height: 13rem;
    right: -5rem;
    bottom: -5rem;
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: 50%;
    box-shadow: 0 0 0 22px rgba(255, 255, 255, 0.05), 0 0 0 44px rgba(255, 255, 255, 0.04);
}

.table-hero .v-card-text,
.table-contact-card .v-card-text {
    position: relative;
    z-index: 1;
    padding: clamp(24px, 5vw, 48px);
}

.table-eyebrow {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    opacity: 0.82;
}

.table-eyebrow-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #f6d9a8;
    box-shadow: 0 0 0 5px rgba(246, 217, 168, 0.16);
}

.table-hero-title {
    max-width: 640px;
    margin: 22px 0 14px;
    font-size: clamp(2.1rem, 5vw, 4.4rem);
    line-height: 0.98;
    letter-spacing: -0.055em;
}

.table-hero-copy {
    max-width: 560px;
    margin: 0;
    font-size: clamp(1rem, 2vw, 1.2rem);
    line-height: 1.55;
    opacity: 0.88;
}

.table-hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 28px;
}

.table-hero-actions .v-btn:first-child {
    color: #3d2b23 !important;
    background: #ffe4bd !important;
}

.table-contact-card {
    background: linear-gradient(155deg, rgba(255, 255, 255, 0.94), rgba(255, 246, 236, 0.92));
}

.table-contact-icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    margin-bottom: 24px;
    border-radius: 15px;
    color: #fff;
    background: #82aa8b;
    box-shadow: 0 10px 22px rgba(130, 170, 139, 0.3);
}

.table-contact-link {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    font-weight: 700;
    color: #9e6348 !important;
}

@media (max-width: 600px) {
    .table-home-hero {
        margin-top: -4px;
    }

    .table-hero-title {
        font-size: 2.65rem;
    }

    .table-hero-actions {
        align-items: stretch;
        flex-direction: column;
    }

    .table-hero-actions .v-btn {
        width: 100%;
    }
}
</style>
