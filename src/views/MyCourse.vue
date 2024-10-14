<template>
  <div class="container">
    <p class="title">Khóa học của tôi</p>
    <div class="card-container relative">
      <div class="card relative shadow card-hover" v-for="(studentCourse, index) in student_courses" :key="index"
        style="width: 18rem">
        <template v-if="getCourseDetails(studentCourse.idCourse)">
          <p class="trying p-1" v-if="studentCourse.status === 'TRIAL'">
            Đang học thử
          </p>
          <img :src="getCourseDetails(studentCourse.idCourse).thumbnailUrl" class="card-img-top" alt="..." />
          <div class="card-body p-3" @click="navigateToAssignment(studentCourse.idCourse)">
            <h5>{{ getCourseDetails(studentCourse.idCourse)?.name }}</h5>
            <p class="course-des card-text">
              {{ getCourseDetails(studentCourse.idCourse)?.description }}
            </p>
          </div>
          <div class="c-footer py-1">
            <img class="avatar" :src="avatar" alt="" />
            <p class="my-auto">
              {{
                getCourseDetails(studentCourse.idCourse).teacher.length > 1
                  ? getCourseDetails(studentCourse.idCourse).teacher[0]?.name +
                  "..."
                  : getCourseDetails(studentCourse.idCourse).teacher[0]?.name
              }}
            </p>
          </div>
          <div v-if="loadingStates[index]" class="d-flex justify-content-center pb-3">
            <div class="spinner"></div>
          </div>
          <button v-else class="btn btn-primary mx-3 my-2 btn-buy"
            @click="navigateToAssignment(studentCourse.idCourse)">
            <!-- @click="handleClick(studentCourse, index)" -->
            <!-- {{ studentCourse.status === "PAID" ? "Học" : "Mua" }} -->
            Học
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, computed } from "vue";
import avatar from "../../public/avatar.jpg";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { toast } from "vue3-toastify";

const router = useRouter();
const store = useStore();

const rootApi = process.env.VUE_APP_ROOT_API;
const courses = ref([]);
const student_courses = ref([]);
const loadingStates = ref([]);
const userID = computed(() => store.getters.user);

const fetchStudentCourses = async () => {
  const res = await axios.get(
    `${rootApi}/student-courses?id=${userID.value.id}`
  );
  student_courses.value = res.data.result;
  loadingStates.value = Array(student_courses.value.length).fill(false);
};

const fetchCourses = async () => {
  const response = await axios.get(`${rootApi}/courses?id=${userID.value.id}`);
  courses.value = response.data.result.data.items;
};

const getCourseDetails = (idCourse) => {
  return courses.value.find((course) => course.id === idCourse);
};

const navigateToAssignment = (courseId) => {
  router.push({
    name: "courseDetail",
    params: { id: courseId },
  });
};

// const handleClick = async (studentCourse, index) => {
//   try {
//     loadingStates.value[index] = true;
//     if (studentCourse.status === "TRIAL") {
//       const response = await axios.post(
//         `${rootApi}/buy_course?idUser=${userID.value.id}&idCourse=${studentCourse.idCourse}`
//       );
//       await fetchStudentCourses();
//       toast.success("Mua khóa học thành công!");
//     }
//   } catch (error) {
//     console.log(error);
//   } finally {
//     loadingStates.value[index] = false;
//   }
// };

onMounted(async () => {
  await fetchCourses();
  await fetchStudentCourses();
});
</script>

<style scoped>
.card-container {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.card-container img {
  width: 100%;
  height: 150px;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.card-hover {
  transition: 0.5s;
}

.card-hover:hover {
  transform: translate(10px, -10px);
}

.title {
  margin-top: 8px;
  font-weight: 650;
  font-size: 24px;
}

.card-title {
  font-weight: 580;
}

.card {
  cursor: pointer;
  border-radius: 15px;
}

.quantity-exercise {
  font-size: 14px;
  color: rgb(175, 154, 154);
}

.card-text {
  font-weight: 400;
  font-size: 14px;
  color: rgb(120, 88, 88);
}

.c-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  margin-left: 15px;
  align-items: center;
}

.c-footer img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.avatar {
  object-fit: cover;
}

.relative {
  position: relative;
}

.trying {
  position: absolute;
  display: inline-block;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  clip-path: polygon(20px 0px, 100% 0px, 100% 100%, 0% 100%, 0% 20px);
  background: yellow;
  padding: 16px 40px;
  margin: 0 8px;
  font-weight: 600;
  font-size: 13px;
  color: red;
  top: 10px;
  right: 0;
  width: 105px;
  text-align: right;
}

.trying:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  background: rgb(211, 211, 0);
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 6px 0;
  transition: transform 500ms;
}

.lesson-number {
  color: #00000080;
  font-size: 15px;
}

.course-des {
  font-size: 14px;
  color: #333;
  line-height: 1.2rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.btn-buy {
  background-color: #007aff6b;
  border: none;
  color: #333;
  font-weight: 500;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left: 4px solid white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
