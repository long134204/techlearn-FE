<template>

    <div class="teacher-tab">
        <b-tabs content-class="mt-3">
            <b-tab title="Lịch bận" active>
                <Calendar v-if="url" :url="url" :key="url" calendarType="mine" />
            </b-tab>
            <b-tab title="Lịch rảnh">
                <Calendar v-if="url" :url="url" :key="url" calendarType="mine" />
            </b-tab>
        </b-tabs>
    </div>

</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue';
import Calendar from '../Calendar/Calendar.vue';
import { useStore } from 'vuex';

const rootApi = process.env.VUE_APP_ROOT_API;

const store = useStore();
const user = computed(() => store.getters.user);
const url = ref('');

const updateUrl = () => {
    if (user.value) {
        url.value = `${rootApi}/teacher/${user.value.id}/calendar`;
    }
};

onMounted(async () => {
    await store.dispatch('fetchUser');
    updateUrl();
});

watch(user, updateUrl);
</script>

<style>
.teacher-tab .nav-link {
    color: black !important;
}

.teacher-tab .active {
    color: #E3165B !important;
}
</style>
