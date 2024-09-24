<template>
    <div class="student-calendar">
        <div class="container">
            <div class="row">
                <div class="col-md-3 mb-4">
                    <div class="card student-info">
                        <div class="card-body d-flex flex-column align-items-center">
                            <img class="rounded-circle mb-3"
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuRDPL-ilJiALdTZrZuxx2V50RIvKMz34CBA&s"
                                alt="Student avatar" width="100" height="100">
                            <h5 class="card-title mb-1">{{ user?.name }}</h5>
                            <p class="card-text text-muted mb-2">Học viên</p>
                            <p class="card-text text-muted small mb-3">{{ user?.email }}</p>
                            <button @click="toggleCalendarForm" :class="['btn', 'w-100', stateButtonFormStudent ? 'btn-danger' : 'btn-primary']">
                                <i v-if="!stateButtonFormStudent" class="fas fa-plus me-2"></i>
                                <i v-else class="fas fa-times me-2"></i>
                                {{ stateButtonFormStudent ? 'Đóng form' : 'Tạo lịch' }}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="col-md-9">
                    <div v-if="stateButtonFormStudent" class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title mb-4">Tìm kiếm lịch</h5>
                            <form @submit.prevent="searchCalendar" class="calendar-search-form">
                                <div class="row g-3 align-items-end">
                                    <div class="col-md-4">
                                        <label class="form-label" for="course">Khóa học</label>
                                        <select class="form-select" name="course" v-model="course" @change="onCourseChange">
                                            <option :value="null" disabled selected hidden>Chọn Khóa học</option>
                                            <option class="modify-option" v-for="course in listCourse" :key="course.id" :value="course">
                                                {{ course.name }}
                                            </option>
                                        </select>
                                        <small class="text-danger">{{ courseError }}</small>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label" for="chapter">Chương</label>
                                        <select class="form-select" id="chapter" v-model="chapter" @change="onChuongChange">
                                            <option :value="null" disabled selected hidden>Chọn chương</option>
                                            <option class="modify-option" v-for="chapter in listChapters" :key="chapter.id" :value="chapter">
                                                {{ chapter.name }}
                                            </option>
                                        </select>
                                        <small class="text-danger">{{ chapterError }}</small>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label" for="teacher">Mentor</label>
                                        <select class="form-select" id="teacher" v-model="teacher">
                                            <option :value="null" disabled selected>Chọn giảng viên</option>
                                            <option class="modify-option" v-for="teacher in teachers" :key="teacher.Id" :value="teacher">
                                                {{ teacher.OwnerText }}
                                            </option>
                                        </select>
                                        <small class="text-danger">{{ teacherError }}</small>
                                    </div>
                                    <div class="col-md-2">
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
                            <h5 class="card-title mb-4">
                                {{ !stateButtonFormStudent ? 'Lịch học' : 'Lịch giảng viên / Người hướng dẫn' }}
                            </h5>
                            <Calendar :url="stateButtonFormStudent ? url : urlCalendarOfStudent"
                                :calendarType="stateButtonFormStudent ? 'other' : 'mine'" />
                        </div>
                    </div>
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

const rootApi = process.env.VUE_APP_ROOT_API;
const store = useStore();

const stateButtonFormStudent = ref(false);
const accessToken = localStorage.getItem("accessToken");

const { handleSubmit, resetForm } = useForm({
    initialValues: {
        course: null,
        chapter: null,
        teacher: null,
    },
    validationSchema: yup.object({
        course: yup
            .object().nullable()
            .required('*bắt buộc'),
        chapter: yup
            .object().nullable()
            .required('*bắt buộc'),
        teacher: yup
            .object().nullable()
            .required('*bắt buộc')
    }),
});

const { value: course, errorMessage: courseError } = useField('course');
const { value: chapter, errorMessage: chapterError } = useField('chapter');
const { value: teacher, errorMessage: teacherError } = useField('teacher');
const url = ref("");
const urlCalendarOfStudent = ref("");
const teachers = ref([]);
const idGV = ref();
const listCourse = ref([]);
const listChapters = ref([]);
const user = computed(() => store.getters.user);

const toggleCalendarForm = () => {
    stateButtonFormStudent.value = !stateButtonFormStudent.value;

    if (stateButtonFormStudent.value) {
        // tạm thời để test, sau sẽ thay thế bằng lấy lịch của giảng viên và lọc
        url.value = `${rootApi}/teacher/5bb75f1d-7956-11ef-8bc5-005056c00001/calendar`;
    }
};

const getAllCalendars = () => {
    urlCalendarOfStudent.value = `${rootApi}/student/${user.value.id}/calendar`;
};

const onCourseChange = async () => {
    await getChapters();
    await getTeachers();
}

const getChapters = async () => {
    try {
        const res = await axios.get(`${rootApi}/chapters?idCourse=${course._value.id}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        listChapters.value = res.data.result.listChapter;
    } catch (error) {
        console.log(error);
    }
}

const getTeachers = async () => {
    try {
        const res = await axios.get(`${rootApi}/teachers/course/${course.value.id}`, {
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
        const { course, chapter, teacher } = formData;

        const teacherName = teacher ? teacher.OwnerText : null;
        const technicalTeacherName = course;
        const chapterName = chapter;

        let res = await axios.get(`${rootApi}/teacher/find-calendars`, {
            params: {
                teacherName, technicalTeacherName, chapterName
            },

            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (res.status === 200) {
            resetForm();
            getTeachers();
        }
    } catch (error) {
        toast.error("Không có khung giờ giảng viên trong ngày hôm nay!");
    }
});

const fetchCoursesByUser = async () => {
    try {
        const res = await axios.get(`${rootApi}/courses`, {
            params: { id: user.value.id, page: 1, pageSize: 10 },
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (res.status === 200) {
            listCourse.value = res.data.result.items;
        } else {
            console.error("Error fetching courses");
            toast.error("Không thể lấy danh sách khóa học");
        }
    } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Lỗi khi lấy danh sách khóa học");
    }
};

const fetchChaptersByCourseId = async (courseId) => {
    try {
        const res = await axios.get(`${rootApi}/chapters`, {
            params: { idCourse: courseId },
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (res.status === 200) {
            listChapters.value = res.data.result.listChapter;
        } else {
            console.error("Error fetching chapters");
            toast.error("Không thể lấy danh sách chương");
        }
    } catch (error) {
        console.error("Error fetching chapters:", error);
        toast.error("Lỗi khi lấy danh sách chương");
    }
};

watch(course, (newCourse) => {
    if (newCourse) {
        const selectedCourse = listCourse.value.find(c => c.name === newCourse);
        if (selectedCourse) {
            fetchChaptersByCourseId(selectedCourse.id);
        }
    }
});

watch(user, (newUser) => {
    if (newUser) {
        fetchCoursesByUser();
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
.student-info {
    transition: all 0.3s ease;
}

.student-info:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.btn-primary {
    background-color: #31D2F2;
    border-color: #31D2F2;
}

.btn-primary:hover {
    background-color: #28b8d8;
    border-color: #28b8d8;
}

.form-select:focus,
.form-control:focus {
    border-color: #31D2F2;
    box-shadow: 0 0 0 0.2rem rgba(49, 210, 242, 0.25);
}

@media (max-width: 767.98px) {
    .student-info {
        margin-bottom: 2rem;
    }
}
</style>