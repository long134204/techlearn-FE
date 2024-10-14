<template>
  <div class="student-calendar">
    <div class="container">
      <div class="row mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <h2 class="mb-0">{{ !stateButtonFormStudent ? 'Lịch học' : 'Lịch giảng viên' }}</h2>
          <button @click="toggleCalendarForm" :class="['btn', stateButtonFormStudent ? 'btn-danger' : 'btn-primary']">
            <i v-if="!stateButtonFormStudent" class="fas fa-plus me-2"></i>
            <i v-else class="fas fa-times me-2"></i>
            {{ stateButtonFormStudent ? 'Đóng form' : 'Tạo lịch' }}
          </button>
        </div>
      </div>

      <div v-if="stateButtonFormStudent" class="card mb-4">
        <div class="card-body">
          <h5 class="card-title mb-4">Tìm kiếm lịch</h5>
          <form @submit.prevent="searchCalendar" class="calendar-search-form">
            <div class="row g-3 align-items-end">
              <div class="col-md-4">
                <label class="form-label" for="chapter">Chương</label>
                <select class="form-select" id="chapter" v-model="chapter" @change="onChapterChange">
                  <option :value="null" disabled selected hidden>Chọn chương</option>
                  <option class="modify-option" v-for="chap in listChapters" :key="chap.id" :value="chap">
                    {{ chap.name }}
                  </option>
                </select>
                <small class="text-danger">{{ chapterError }}</small>
              </div>
              <div class="col-md-4">
                <label class="form-label" for="teacher">Giảng viên</label>
                <select class="form-select" id="teacher" v-model="teacher">
                  <option :value="null" selected>Chọn giảng viên</option>
                  <option class="modify-option" v-for="teach in teachers" :key="teach.Id" :value="teach">
                    {{ teach.OwnerText }}
                  </option>
                </select>
                <small class="text-danger">{{ teacherError }}</small>
              </div>
              <div class="col-md-4">
                <button type="submit" class="btn btn-primary w-100">
                  <i class="fas fa-filter"></i> &nbsp; Lọc
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <Calendar :url="url" :clickable="isFilterApplied"
            :calendarType="stateButtonFormStudent ? 'other' : 'mine'" :ownerId="ownerId" />
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import axios from 'axios';
import { useField, useForm } from 'vee-validate';
import { onMounted, watch, ref, computed } from 'vue';
import { toast } from 'vue3-toastify';
import * as yup from 'yup';
import Calendar from '../Calendar/Calendar.vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
const rootApi = process.env.VUE_APP_ROOT_API;
const store = useStore();

const stateButtonFormStudent = ref(false);
const accessToken = localStorage.getItem("accessToken");
const calendarUrl = ref();
const { handleSubmit, resetForm } = useForm({
  initialValues: {
    chapter: null,
    teacher: null,
  },
  validationSchema: yup.object({
    chapter: yup
      .object().nullable()
      .required('*bắt buộc'),
      teacher: yup
      .object().nullable()
      .required('*bắt buộc')
  }),
});

const { value: chapter, errorMessage: chapterError } = useField('chapter');
const { value: teacher, errorMessage: teacherError } = useField('teacher');
const url = ref("");
const urlCalendarOfStudent = ref("");
const teachers = ref([]);
const ownerId = ref();
const listChapters = ref([]);
const user = computed(() => store.getters.user);
const isFilterApplied = ref(false);
const route = useRoute();
const courseId = route.params.id;

const toggleCalendarForm = () => {
  stateButtonFormStudent.value = !stateButtonFormStudent.value;
  if (!stateButtonFormStudent.value) {
    isFilterApplied.value = false;
    resetForm();
    getAllCalendars();
  }
  
};

const getAllCalendars = () => {
  url.value = `${rootApi}/student/${user.value.id}/calendar`;
};

const getChapters = async () => {
  try {
    const res = await axios.get(`${rootApi}/chapters?idCourse=${courseId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    listChapters.value = res.data.result.data;
  } catch (error) {
    console.log(error);
  }
}

const getTeachers = async () => {
  try {
    const res = await axios.get(`${rootApi}/teachers/course/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    teachers.value = res.data.result;
  } catch (error) {
    console.error("Error fetching teachers:", error);
    toast.error("Không thể lấy danh sách giảng viên");
  }
};

const searchCalendar = handleSubmit(async (formData) => {

  try {
        isFilterApplied.value = true;
        const { course, chapter, teacher } = formData;

        if (teacher === null) {
            url.value = `${rootApi}/teacher/calendar/${course.id}/chapter/${chapter.id}/`;
        } else {
            url.value = `${rootApi}/teacher/${teacher.Id}/calendar`;
            ownerId.value = teacher.Id;
        }

    } catch (error) {
        isFilterApplied.value = false;
        toast.error("Không có khung giờ giảng viên!");
    }
});


watch(user, (newUser) => {
    if (newUser) {
       getChapters();
       getTeachers();
       getAllCalendars();
    }
}, { immediate: true });

onMounted(() => {
  if (!store.getters.isLoggedIn) {
    store.dispatch('fetchUser');
  }

  watch(user, (newUser) => {
    if (newUser) {
      getAllCalendars();
    }
  }, { immediate: true });
});

</script>

<style scoped>
.student-calendar {
  margin-top: 2rem;
}

.calendar-search-form .row {
  position: relative;
}

.calendar-search-form .text-danger {
  position: absolute;
  top: 100%;
  left: 0;
}

.calendar-search-form .col-md-3 {
  display: flex;
  flex-direction: column;
}

@media (max-width: 767.98px) {
  .student-calendar h2 {
    font-size: 1.5rem;
  }
}
</style>