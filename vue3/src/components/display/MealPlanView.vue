<template>
    <v-row class="h-100 meal-plan-page">
        <v-col class="pb-0">
            <v-card class="h-100 meal-plan-card" :loading="useMealPlanStore().loading">
                <section v-if="smAndDown" class="mobile-meal-plan" aria-label="Meal plan">
                    <header class="mobile-plan-header">
                        <div>
                            <div class="text-overline text-medium-emphasis">{{ $t('Meal_Plan') }}</div>
                            <div class="text-h6 mobile-week-label">{{ mobileWeekLabel }}</div>
                        </div>
                        <div class="mobile-plan-nav">
                            <v-btn icon="fa-solid fa-chevron-left" variant="text" size="small"
                                   :aria-label="$t('Previous_Period')" @click="changeMobileWeek(-1)"></v-btn>
                            <v-btn variant="tonal" size="small" @click="goToToday">{{ $t('Today') }}</v-btn>
                            <v-btn icon="fa-solid fa-chevron-right" variant="text" size="small"
                                   :aria-label="$t('Next_Period')" @click="changeMobileWeek(1)"></v-btn>
                        </div>
                    </header>

                    <div class="mobile-date-strip" :aria-label="$t('Calendar')" role="list">
                        <button
                            v-for="day in mobileWeekDays"
                            :key="day.key"
                            type="button"
                            class="mobile-date-chip"
                            :class="{'is-selected': day.isSelected, 'is-today': day.isToday}"
                            :aria-pressed="day.isSelected"
                            @click="selectMobileDate(day.date)">
                            <span class="mobile-date-weekday">{{ day.weekday }}</span>
                            <span class="mobile-date-number">{{ day.dayNumber }}</span>
                            <span class="mobile-date-count" v-if="day.planCount">{{ day.planCount }}</span>
                        </button>
                    </div>

                    <v-divider></v-divider>

                    <div class="mobile-plan-list">
                        <div class="mobile-plan-list-header">
                            <div>
                                <div class="text-subtitle-1 font-weight-medium">{{ mobileSelectedDateLabel }}</div>
                                <div class="text-body-2 text-medium-emphasis">
                                    {{ selectedDayPlans.length }} {{ $t('Meal_Plan') }}
                                </div>
                            </div>
                            <v-btn color="create" prepend-icon="$add" size="small" @click="openNewPlanDialog(mobileSelectedDate)">
                                {{ $t('Add') }}
                            </v-btn>
                        </div>

                        <v-sheet v-if="selectedDayPlans.length === 0" class="mobile-empty-state" rounded="lg" border>
                            <v-icon icon="$mealplan" size="32" color="primary"></v-icon>
                            <div class="text-body-1 mt-2">{{ $t('No_meals_planned') }}</div>
                            <v-btn class="mt-3" color="create" variant="tonal" prepend-icon="$add"
                                   @click="openNewPlanDialog(mobileSelectedDate)">
                                {{ $t('Add_meal_plan') }}
                            </v-btn>
                        </v-sheet>

                        <v-card
                            v-for="plan in selectedDayPlans"
                            :key="plan.id"
                            class="mobile-plan-entry"
                            variant="outlined"
                            :style="{'--meal-plan-color': plan.mealType?.color || '#b98766'}"
                            role="button"
                            tabindex="0"
                            @click="openMobilePlan(plan)"
                            @keydown.enter="openMobilePlan(plan)">
                            <recipe-image v-if="plan.recipe" :recipe="plan.recipe" height="64px" width="64px"></recipe-image>
                            <div v-else class="mobile-plan-placeholder">
                                <v-icon icon="$mealplan" color="primary"></v-icon>
                            </div>
                            <v-card-text class="py-3 pe-1">
                                <div class="text-body-1 font-weight-medium mobile-plan-entry-title">
                                    {{ mobilePlanTitle(plan) }}
                                </div>
                                <div class="text-body-2 text-medium-emphasis mobile-plan-entry-meta">
                                    <span>{{ plan.mealTypeName }}</span>
                                    <span v-if="plan.shopping"><v-icon icon="$shopping" size="12"></v-icon> {{ $t('Shopping') }}</span>
                                </div>
                                <div v-if="plan.toDate && !sameDate(plan.fromDate, plan.toDate)" class="text-caption text-medium-emphasis">
                                    {{ mobilePlanDateLabel(plan) }}
                                </div>
                            </v-card-text>
                            <v-icon icon="fa-solid fa-chevron-right" class="align-self-center me-4" aria-hidden="true"></v-icon>
                        </v-card>
                    </div>
                </section>

                <calendar-view
                    v-else
                    :locale="locale"
                    :show-date="calendarDate"
                    :items="planItems"
                    class="theme-default"
                    :item-content-height="calendarItemHeight"
                    :enable-drag-drop="true"
                    @dropOnDate="dropCalendarItemOnDate"
                    :display-period-uom="useUserPreferenceStore().deviceSettings.mealplan_displayPeriod"
                    :display-period-count="useUserPreferenceStore().deviceSettings.mealplan_displayPeriodCount"
                    :starting-day-of-week="useUserPreferenceStore().deviceSettings.mealplan_startingDayOfWeek"
                    :display-week-numbers="useUserPreferenceStore().deviceSettings.mealplan_displayWeekNumbers"
                    :current-period-label="$t('Today')"
                    @click-date="(date: Date) => openNewPlanDialog(date)">
                    <template #header="{ headerProps }">
                        <meal-plan-calendar-header :header-props="headerProps" @input="(d:Date) => calendarDate = d"></meal-plan-calendar-header>
                    </template>
                    <template #item="{ value, top }">
                        <meal-plan-calendar-item
                            :item-height="calendarItemHeight"
                            :value="value"
                            :item-top="top"
                            @onDragStart="currentlyDraggedMealplan = value"
                            @delete="(arg: MealPlan) => {useMealPlanStore().plans.delete(arg.id)}"
                            :detailed-items="lgAndUp"
                        ></meal-plan-calendar-item>
                    </template>
                </calendar-view>
            </v-card>

            <model-edit-dialog model="MealPlan" v-model="newPlanDialog" :itemDefaults="newPlanDialogDefaultItem" :close-after-create="false"
                               @create="(arg: any) => useMealPlanStore().plans.set(arg.id, arg)"></model-edit-dialog>
            <model-edit-dialog v-if="mobileSelectedPlan" model="MealPlan" v-model="mobilePlanDialog" :item="mobileSelectedPlan"
                               @delete="handleMobileDelete"></model-edit-dialog>
        </v-col>
    </v-row>
</template>


<script setup lang="ts">
import {CalendarView} from "vue-simple-calendar"
import "vue-simple-calendar/dist/style.css"
import "vue-simple-calendar/dist/css/default.css"

import MealPlanCalendarItem from "@/components/display/MealPlanCalendarItem.vue";
import {IMealPlanCalendarItem, IMealPlanNormalizedCalendarItem} from "@/types/MealPlan";
import {computed, onMounted, ref, watch} from "vue";
import {DateTime} from "luxon";
import {useDisplay} from "vuetify";
import {useMealPlanStore} from "@/stores/MealPlanStore";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import {MealPlan} from "@/openapi";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore";
import MealPlanCalendarHeader from "@/components/display/MealPlanCalendarHeader.vue";
import {useI18n} from "vue-i18n";

const {lgAndUp, smAndDown} = useDisplay()
const {locale} = useI18n()

const calendarDate = ref(new Date())
const mobileSelectedDate = ref(new Date())
const mobileSelectedPlan = ref<MealPlan | null>(null)
const mobilePlanDialog = ref(false)

const currentlyDraggedMealplan = ref({} as IMealPlanNormalizedCalendarItem)

const newPlanDialog = ref(false)
const newPlanDialogDefaultItem = ref({} as MealPlan)

const mobileWeekDays = computed(() => {
    const weekStart = DateTime.fromJSDate(getWeekStart(mobileSelectedDate.value))
    return Array.from({length: 7}, (_, index) => {
        const date = weekStart.plus({days: index})
        const jsDate = date.toJSDate()
        return {
            key: date.toISODate(),
            date: jsDate,
            weekday: date.toLocaleString({weekday: 'short'}),
            dayNumber: date.day,
            isToday: sameDate(jsDate, new Date()),
            isSelected: sameDate(jsDate, mobileSelectedDate.value),
            planCount: useMealPlanStore().planList.filter(plan => isPlanOnDate(plan, jsDate)).length,
        }
    })
})

const selectedDayPlans = computed(() => {
    return useMealPlanStore().planList
        .filter(plan => isPlanOnDate(plan, mobileSelectedDate.value))
        .sort((a, b) => a.fromDate.getTime() - b.fromDate.getTime())
})

const mobileWeekLabel = computed(() => {
    const first = DateTime.fromJSDate(mobileWeekDays.value[0].date)
    const last = DateTime.fromJSDate(mobileWeekDays.value[6].date)
    return `${first.toLocaleString(DateTime.DATE_MED)} – ${last.toLocaleString(DateTime.DATE_MED)}`
})

const mobileSelectedDateLabel = computed(() => {
    return DateTime.fromJSDate(mobileSelectedDate.value).toLocaleString(DateTime.DATE_FULL)
})

/**
 * computed property that converts array of MealPlan object to
 * array of CalendarItems (format required/extended from vue-simple-calendar)
 */
const planItems = computed(() => {
    let items = [] as IMealPlanCalendarItem[]
    useMealPlanStore().planList.forEach(mp => {
        items.push({
            startDate: mp.fromDate,
            endDate: mp.toDate ? mp.toDate : mp.fromDate,
            id: mp.id,
            mealPlan: mp,
        } as IMealPlanCalendarItem)
    })
    return items
})

/**
 * determine item height (one or two rows) based on how much space is available and how many days are shown
 */
const calendarItemHeight = computed(() => {
    if (lgAndUp.value && useUserPreferenceStore().deviceSettings.mealplan_displayPeriod == 'week') {
        return '3.5rem'
    } else {
        return '1.6rem'
    }
})

/**
 * watch calendar date and load entries accordingly
 */
watch(calendarDate, () => {
    refreshVisiblePeriod(false)
})

onMounted(() => {
    refreshVisiblePeriod(true)
})

/**
 * refresh data for the currently visible period
 * @param startDateUnknown when the calendar initially loads the date is set to today but the visible period might be larger. If set loads the period day count for the past as well
 */
function refreshVisiblePeriod(startDateUnknown: boolean) {
    let daysInPeriod = 7
    if (useUserPreferenceStore().deviceSettings.mealplan_displayPeriod == 'month') {
        daysInPeriod = 31
    } else if (useUserPreferenceStore().deviceSettings.mealplan_displayPeriod == 'year') {
        daysInPeriod = 365
    }

    let days = useUserPreferenceStore().deviceSettings.mealplan_displayPeriodCount * daysInPeriod

    // load backwards to as on initial
    if (startDateUnknown) {
        useMealPlanStore().refreshFromAPI(DateTime.fromJSDate(calendarDate.value).minus({days: days}).toJSDate(), DateTime.fromJSDate(calendarDate.value).plus({days: days}).toJSDate())
    } else {
        useMealPlanStore().refreshFromAPI(calendarDate.value, DateTime.fromJSDate(calendarDate.value).plus({days: days}).toJSDate())
    }
}

function getWeekStart(date: Date) {
    const startingDay = useUserPreferenceStore().deviceSettings.mealplan_startingDayOfWeek ?? 1
    const dayOffset = (date.getDay() - startingDay + 7) % 7
    return DateTime.fromJSDate(date).startOf('day').minus({days: dayOffset}).toJSDate()
}

function sameDate(first: Date, second: Date) {
    return DateTime.fromJSDate(first).hasSame(DateTime.fromJSDate(second), 'day')
}

function isPlanOnDate(plan: MealPlan, date: Date) {
    const selected = DateTime.fromJSDate(date).startOf('day')
    const start = DateTime.fromJSDate(plan.fromDate).startOf('day')
    const end = DateTime.fromJSDate(plan.toDate || plan.fromDate).startOf('day')
    return selected >= start && selected <= end
}

function selectMobileDate(date: Date) {
    mobileSelectedDate.value = date
}

function changeMobileWeek(direction: number) {
    mobileSelectedDate.value = DateTime.fromJSDate(mobileSelectedDate.value).plus({days: direction * 7}).toJSDate()
    calendarDate.value = mobileSelectedDate.value
}

function goToToday() {
    mobileSelectedDate.value = new Date()
    calendarDate.value = mobileSelectedDate.value
}

function mobilePlanTitle(plan: MealPlan) {
    return plan.title || plan.recipe?.name || plan.recipeName || 'Meal plan'
}

function mobilePlanDateLabel(plan: MealPlan) {
    const start = DateTime.fromJSDate(plan.fromDate).toLocaleString(DateTime.DATE_MED)
    const end = plan.toDate ? DateTime.fromJSDate(plan.toDate).toLocaleString(DateTime.DATE_MED) : start
    return `${start} – ${end}`
}

function openNewPlanDialog(date: Date) {
    const planDate = DateTime.fromJSDate(date).set({hour: 12, minute: 0, second: 0, millisecond: 0}).toJSDate()
    newPlanDialogDefaultItem.value = {fromDate: planDate, toDate: planDate} as MealPlan
    newPlanDialog.value = true
}

function openMobilePlan(plan: MealPlan) {
    mobileSelectedPlan.value = plan
    mobilePlanDialog.value = true
}

function handleMobileDelete(plan?: MealPlan) {
    const planId = plan?.id ?? mobileSelectedPlan.value?.id
    if (planId != undefined) {
        useMealPlanStore().plans.delete(planId)
    }
    mobilePlanDialog.value = false
}

/**
 * handle drop event for calendar items on fields
 * @param undefinedItem
 * @param targetDate
 * @param event
 */
function dropCalendarItemOnDate(undefinedItem: IMealPlanNormalizedCalendarItem, targetDate: Date, event: DragEvent) {
    //The item argument (first) is undefined because our custom calendar item cannot manipulate the calendar state so the item is unknown to the calendar (probably fixable by somehow binding state to the item)
    if (currentlyDraggedMealplan.value.originalItem.mealPlan.id != undefined) {
        let mealPlan = useMealPlanStore().plans.get(currentlyDraggedMealplan.value.originalItem.mealPlan.id)
        if (mealPlan != undefined) {
            let fromToDiff = {days: 0}
            if (mealPlan.toDate && mealPlan.toDate > mealPlan.fromDate) {
                fromToDiff = DateTime.fromJSDate(mealPlan.toDate).diff(DateTime.fromJSDate(mealPlan.fromDate), 'days')
            }

            const existingTime = DateTime.fromJSDate(mealPlan.fromDate)
            const newFrom = DateTime.fromJSDate(targetDate).set({
                hour: existingTime.hour, minute: existingTime.minute, second: existingTime.second
            }).toJSDate()
            const newTo = DateTime.fromJSDate(targetDate).plus(fromToDiff).set({
                hour: existingTime.hour, minute: existingTime.minute, second: existingTime.second
            }).toJSDate()

            // create copy of item if control is pressed
            if (event.ctrlKey) {
                let new_entry = Object.assign({}, mealPlan)
                new_entry.fromDate = newFrom
                new_entry.toDate = newTo
                new_entry.addshopping = mealPlan.shopping
                useMealPlanStore().createObject(new_entry)
            } else {
                mealPlan.fromDate = newFrom
                mealPlan.toDate = newTo
                useMealPlanStore().updateObject(mealPlan)
            }
        }
    }
}

</script>


<style scoped>
/* TODO remove unused styles */

.slide-fade-enter-active {
    transition: all 0.3s ease;
}

.slide-fade-leave-active {
    transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
    transform: translateY(10px);
    opacity: 0;
}

.calender-row {
    height: calc(100vh - 140px);
}

.calender-parent {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-x: hidden;
    overflow-y: hidden;
    height: 100%
}

.cv-item {
    white-space: inherit !important;
    padding: 0;
    border-radius: 3px !important;
}


.isHovered {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.cv-day.draghover {
    box-shadow: inset 0 0 0.2em 0.2em rgb(221, 191, 134) !important;
}

.modal-backdrop {
    opacity: 0.5;
}

/*
**************************************************************
This theme is the default shipping theme, it includes some
decent defaults, but is separate from the calendar component
to make it easier for users to implement their own themes w/o
having to override as much.
**************************************************************
*/

/* Header */

.theme-default .cv-header,
.theme-default .cv-header-day {
    background-color: #f0f0f0;
}

.theme-default .cv-header .periodLabel {
    font-size: 1.5em;
}

/* Grid */

.theme-default .cv-weeknumber {
    background-color: #e0e0e0;
    border-color: #ccc;
    color: #808080;
}

.theme-default .cv-weeknumber span {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.theme-default .cv-day.past {
    background-color: #fafafa;
}

.theme-default .cv-day.outsideOfMonth {
    background-color: #f7f7f7;
}

.theme-default .cv-day.today {
    background-color: #ffe;
}

.theme-default .cv-day[aria-selected] {
    background-color: #ffc;
}

/* Events */

.theme-default .cv-item {
    border-color: #e0e0f0;
    border-radius: 0.5em;
    background-color: #fff;
    text-overflow: ellipsis;
}

.theme-default .cv-item.purple {
    background-color: #f0e0ff;
    border-color: #e7d7f7;
}

.theme-default .cv-item.orange {
    background-color: #ffe7d0;
    border-color: #f7e0c7;
}

.theme-default .cv-item.continued::before,
.theme-default .cv-item.toBeContinued::after {
    /*
    removed because it breaks a line and would increase item size
    content: " \21e2 ";
    color: #999;
     */
    content: "";
}

.theme-default .cv-item.toBeContinued {
    border-right-style: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.theme-default .cv-item.isHovered.hasUrl {
    text-decoration: underline;
}

.theme-default .cv-item.continued {
    border-left-style: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.cv-item.span3,
.cv-item.span4,
.cv-item.span5,
.cv-item.span6,
.cv-item.span7 {
    text-align: center;
}

/* Event Times */

.theme-default .cv-item .startTime,
.theme-default .cv-item .endTime {
    font-weight: bold;
    color: #666;
}

/* Drag and drop */

.theme-default .cv-day.draghover {
    box-shadow: inset 0 0 0.2em 0.2em yellow;
}

.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}

@media (max-width: 767.9px) {
    .periodLabel {
        font-size: 18px !important;
    }
}

.b-calendar-grid-help {
    padding: 0.25rem;
}

.meal-plan-page,
.meal-plan-page > .v-col,
.meal-plan-card {
    min-height: 0;
}

.mobile-meal-plan {
    min-height: 100%;
    background: rgb(var(--v-theme-background));
}

.mobile-plan-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1rem 1rem 0.75rem;
}

.mobile-week-label {
    white-space: nowrap;
}

.mobile-plan-nav {
    display: flex;
    align-items: center;
    gap: 0.1rem;
}

.mobile-date-strip {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding: 0.25rem 1rem 1rem;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
}

.mobile-date-strip::-webkit-scrollbar {
    display: none;
}

.mobile-date-chip {
    position: relative;
    display: flex;
    flex: 0 0 3.25rem;
    min-height: 4.25rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.15rem;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.16);
    border-radius: 0.9rem;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    cursor: pointer;
    font: inherit;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.mobile-date-chip:focus-visible,
.mobile-plan-entry:focus-visible {
    outline: 3px solid rgba(var(--v-theme-primary), 0.35);
    outline-offset: 2px;
}

.mobile-date-chip.is-today:not(.is-selected) {
    border-color: rgb(var(--v-theme-primary));
}

.mobile-date-chip.is-selected {
    border-color: rgb(var(--v-theme-primary));
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
}

.mobile-date-weekday {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.mobile-date-number {
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1;
}

.mobile-date-count {
    position: absolute;
    top: 0.25rem;
    right: 0.35rem;
    min-width: 1rem;
    border-radius: 1rem;
    background: rgb(var(--v-theme-secondary));
    color: rgb(var(--v-theme-on-secondary));
    font-size: 0.65rem;
    line-height: 1rem;
    text-align: center;
}

.mobile-plan-list {
    padding: 0 1rem 1rem;
}

.mobile-plan-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1rem 0 0.75rem;
}

.mobile-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 11rem;
    padding: 1.5rem;
    text-align: center;
}

.mobile-plan-entry {
    display: flex;
    align-items: stretch;
    min-height: 4.5rem;
    margin-bottom: 0.65rem;
    overflow: hidden;
    border-left: 4px solid var(--meal-plan-color) !important;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.mobile-plan-entry:active {
    transform: scale(0.99);
}

.mobile-plan-entry-title,
.mobile-plan-entry-meta {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.mobile-plan-entry-meta {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

.mobile-plan-placeholder {
    display: grid;
    flex: 0 0 4rem;
    place-items: center;
    background: rgba(var(--v-theme-primary), 0.08);
}

@media (max-width: 420px) {
    .mobile-plan-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .mobile-plan-nav {
        width: 100%;
        justify-content: space-between;
    }
}
</style>
