<template>
  <div class="container">
    <div class="row">
      <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 mb-4" v-for="(course, index) in courses" :key="index">
        <div class="card shadow mx-2 d-flex flex-column" style="width: 100%" @click="navigateToAssignment(course.id)">
          <img :src="course.thumbnailUrl" class="card-img-top" alt="Course thumbnail" />
          <p class="trying p-1" v-if="isTrial(course.id)" >
            Đang học thử
          </p>
          <div class="card-body d-flex flex-column flex-grow-1">
            <p class="card-name">{{ course.name }}</p>
            <p class="card-total-exercises">{{ course.totalExercises }}</p>
            <p class="card-text flex-grow-1">
              {{ truncatedDescriptions(course.description) }}
            </p>
          </div>
          <div class="c-footer pb-2" v-if="course.teacher.length > 1">
            <img class="avatar" :src="avatar" alt="Teacher avatar" />
            <p class="my-auto">{{ course?.teacher[0]?.name }}</p>
          </div>
          <div v-if="loadingStates[index]" class="d-flex justify-content-center pb-3">
            <div class="spinner"></div>
          </div>
          <div v-else class="d-flex gap-2 justify-content-center pb-3 container">
            <button v-if="isTrial(course.id)" type="button" class="btn btn-primary btn-buy-only px-2" @click="navigateToAssignment(course.id)"
              >
              Học
            </button>
            <!-- <button v-else="isPaid(course.id)" type="button" class="btn btn-primary btn-learn-only" @click="navigateToAssignment(course.id)">
              Học
            </button> -->
            <button v-else="course.status == ''" type="button" class="btn btn-primary btn-learn-only" @click.stop="handleTryCourse(course.id, userID, index)">
              Đăng ký học thử
            </button>
            <!-- <div v-else class="d-flex gap-2 justify-content-center w-100">
              <button type="button" class="btn btn-primary btn-buy w-40"
                @click.stop="handleBuyCourse(course.id, userID, index)">
                Mua
              </button> 
              <button type="button" class="btn btn-primary btn-try w-40"
                @click.stop="handleTryCourse(course.id, userID, index)">
                Học thử
              </button>
            </div> -->
          </div>
        </div>
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

const loadingStates = ref([]); // Array to hold loading states for each course
const rootApi = process.env.VUE_APP_ROOT_API;
const courses = ref([]);
const studentCourses = ref([]);
const userID = computed(() => store.getters.user);
console.log(userID);


const fetchCourses = async () => {
  const response = await axios.get(`${rootApi}/courses?id=${userID.value.id}`);
  courses.value = response.data.result.data.items;
  // Initialize loading states for each course
  loadingStates.value = Array(courses.value.length).fill(false);
};

const fetchStudentCourses = async () => {
  const response = await axios.get(
    `${rootApi}/student-courses?id=${userID.value.id}`
  );
  studentCourses.value = response.data.result;
};

const isTrial = (courseId) => {
  const studentCourse = studentCourses.value?.find(
    (sc) => sc.idCourse === courseId
  );
  return studentCourse && studentCourse.status === "TRIAL";
};

const isPaid = (courseId) => {
  const studentCourse = studentCourses.value?.find(
    (sc) => sc.idCourse === courseId
  );
  return studentCourse && studentCourse.status === "PAID";
};

const navigateToAssignment = (courseId) => {
  router.push({
    name: "courseDetail",
    params: { id: courseId },
  });
};

const truncatedDescriptions = (description) => {
  return description.length > 120
    ? description.substring(0, 120) + "..."
    : description;
};

/* const handleBuyCourse = async (IdCourse, userID, index) => {
  try {
    loadingStates.value[index] = true; // Set loading state for the specific button
    const response = await axios.post(
      `${rootApi}/buy_course?idUser=${userID.id}&idCourse=${IdCourse}`
    );
    studentCourses.status = "PAID";
    store.dispatch("fetchSupportPoints", userID.id);
    toast.success("Mua khóa học thành công!!");
    await fetchStudentCourses();
  } catch (error) {
    console.log(error);
    toast.error("Có lỗi xảy ra");
  } finally {
    loadingStates.value[index] = false; // Reset loading state after the request
  }
}; */

const handleTryCourse = async (IdCourse, userID, index) => {
  try {
    loadingStates.value[index] = true; // Set loading state for the specific button
    const response = await axios.post(`${rootApi}/register_trials?idUser=${userID.id}&idCourse=${IdCourse}`);
    toast.success("Đăng kí dùng thử khóa học thành công");
    studentCourses.status = "TRIAL";
    store.dispatch("fetchSupportPoints", userID.id);
    await fetchStudentCourses();
  } catch (error) {
    toast.error("Có lỗi xảy ra");
  } finally {
    loadingStates.value[index] = false; // Reset loading state after the request
  }
};

onMounted(async () => {
  await fetchCourses();
  await fetchStudentCourses();
});
</script>

<style scoped>
.card-container {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

/* .w-40 {
  width: 50%;
} */

.card-img-top {
  width: 100%;
  height: 190px;
  object-fit: cover;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
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
  display: flex;
  flex-direction: column;
  height: 370px;
}

.quantity-exercise {
  font-size: 14px;
  color: rgb(175, 154, 154);
}

.card-text {
  font-size: 10px;
  font-weight: 300;
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
  border: 2px solid rgba(0, 122, 255, 0.42);
  padding: 2px;
  background-color: white;
}

.avatar {
  object-fit: cover;
}

.card-name {
  font-size: 15px;
  font-weight: 500;
}

.card-total-exercises {
  font-weight: 300;
  font-size: 12px;
  opacity: 50%;
}

.btn {
  width: 100%;
  height: 29px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  text-align: center;
  font-size: 12px;
  font-weight: 400;
  transition: background-color 0.1s ease;
}
/* 
.btn-try {
  background-color: rgba(99, 151, 206, 0.42);
  color: rgba(0, 0, 0, 1);
}

.btn-try:hover {
  background-color: rgba(3, 125, 255, 0.568);
  color: rgba(0, 0, 0, 1);
} */

/* .btn-buy {
  background-color: rgba(212, 28, 37, 0.541);
  color: rgba(0, 0, 0, 1);
} */

.btn-buy-only {
  background-color: rgba(212, 28, 37, 0.541);
  color: rgba(0, 0, 0, 1);
  width: 100%;
  font-size: 14px;
  color: rgba(0, 0, 0, 1);
}

.btn-buy-only:hover {
  font-size: 14px;
  background-color: rgba(190, 47, 47, 0.651);
  color: white(0, 0, 0, 1);
  width: 100%;
}

.btn-learn-only {
  width: 100%;
  background-color: #00e3cc;
  color: rgba(0, 0, 0, 1);
  font-size: 14px;
}

.btn-learn-only:hover {
  width: 100%;
  background-color: #03b3a1;
  color: white(0, 0, 0, 1);
  font-size: 14px;
}

/* .btn-buy:hover,
.btn-buy-only:hover {
  background-color: rgba(190, 47, 47, 0.651);
  color: rgba(0, 0, 0, 1);
} */

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
