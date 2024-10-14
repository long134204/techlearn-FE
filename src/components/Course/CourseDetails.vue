<template>
  <div class="container">
    <div class="container text-center">
      <div class="row">
        <div class="col-lg-5 mb-3 col-md-12">
          <img class="img-fluid" :src="dataCourse.course.thumbnailUrl" alt="" />
        </div>
        <div class="col-lg-7 col-md-12 text-start">
          <p class="title">
            <span class="fw-bold">Tên khoá học:</span>
            {{ dataCourse.course.name }}
          </p>
          <p class="title">
            <span class="fw-bold">Mô tả khoá học:</span>
            {{ dataCourse.course.description }}
          </p>
          <p class="title">
            <span class="fw-bold">Công nghệ: </span>
            <span v-if="techStackNames">
              {{ techStackNames }}
            </span>
            <span v-else>N/A</span>
          </p>
          <p class="title">
            <span class="fw-bold">Giảng viên: </span>
            <span v-if="teachers">
              {{ teachers }}
            </span>
            <span v-else>N/A</span>
          </p>
          <div v-if="isTrial">
            <p class="title">
              <span class="fw-bold">Giá khoá học:</span>
              {{
                formatCurrency(
                  dataCourse.course.price,
                  dataCourse.course.currencyUnit
                )
              }}
              {{ dataCourse.course.currencyUnit }}
            </p>
          </div>
          <div v-if="isOtherStatus">
            <p class="title">
              <span class="fw-bold">Giá khoá học:</span>
              {{
                formatCurrency(
                  dataCourse.course.price,
                  dataCourse.course.currencyUnit
                )
              }}
              {{ dataCourse.course.currencyUnit }}
            </p>
            <div class="d-grid gap-2 d-md-block" v-if="studentCourse?.status === ''">
              <button
                class="btn btn-primary custom-button btn-buy w-40"
                type="button"
                @click="handleRegisterCourse"
                :disabled="isLoadingBuy"
              >
                <!-- <span v-if="isLoadingBuy">
                  <div class="spinner"></div>
                </span> -->
                <span >Đăng ký học thử </span>
              </button>
            </div>
            <!-- <div class="d-grid gap-2 d-md-block">
              <button
                class="btn btn-primary custom-button btn-buy w-40"
                type="button"
                @click="handleBuyCourse"
                :disabled="isLoadingBuy"
              >
                <span v-if="isLoadingBuy">
                  <div class="spinner"></div>
                </span>
                <span v-else>Mua</span>
              </button>
              <button class="btn btn-primary custom-button btn-try w-40" type="button" @click="handleRegisterCourse"
                :disabled="isLoadingTrial">
                <span v-if="isLoadingTrial">
                  <div class="spinner"></div>
                </span>
                <span v-else>Đăng kí dùng thử</span>
              </button>
            </div> -->
          </div>
        </div>
      </div>
    </div>
    <div class="assignment-wrapper row col-12 h-100" v-if="courseData">
      <div class="content-header">
        <h3 class="content-title">Nội dung khóa học</h3>
        <p class="courseData-time">
          • {{ filteredChapters.length }} chương • {{ lessons?.length }} bài học
        </p>
      </div>
      <div class="content-body mt-3">
        <div id="accordion">
          <div class="card body-wrapper list-chapter" v-for="(chapter, index) in filteredChapters" :key="index">
            <div v-if="studentCourse.status === 'PAID'">
              <div class="card-header" :id="'heading' + index">
                <h5 class="mb-0">
                  <button class="btn chapter-title w-100 d-flex justify-content-left" type="button"
                    data-toggle="collapse" :data-target="'#collapse' + index" :aria-controls="'collapse' + index">
                    <span>
                      <i class="fas fa-angle-down"></i>&nbsp;
                      <strong> {{ index + 1 }}.</strong> {{ chapter.name }}
                    </span>
                  </button>
                </h5>
              </div>
              <div :id="'collapse' + index" :class="index === 0 ? 'collapse show' : 'collapse'"
                :aria-labelledby="'heading' + index">
                <div v-for="(item, itemIndex) in lessons" :key="itemIndex">
                  <div class="card-body assignment-card border-bottom"
                    v-if="Number(item?.chapter) === Number(chapter?.id)" @click="goToAssignmentDetail(item.id)">
                    <div class="assignment">
                      <p class="assignment-title">
                        {{ item.title }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <div v-if="chapter.isPublic === false">
                <div class="card-header bg-col" :id="'heading' + index">
                  <h5 class="mb-0">
                    <button class="btn chapter-title w-100 d-flex justify-content-between align-items-center"
                      type="button" data-toggle="collapse" :data-target="'#collapse' + index"
                      :aria-controls="'collapse' + index">
                      <span>
                        <i class="fas fa-angle-down"></i>&nbsp;
                        <strong> {{ index + 1 }}.</strong> {{ chapter.name }}
                      </span>
                      <i class="fa fa-lock" aria-hidden="true"></i>
                    </button>
                  </h5>
                </div>
                <div :id="'collapse' + index" :class="index === 0 ? 'collapse show' : 'collapse'"
                  :aria-labelledby="'heading' + index">
                  <div v-for="(item, itemIndex) in lessons" :key="itemIndex">
                    <div class="card-body" v-if="Number(item?.chapter) === Number(chapter?.id)">
                      <div class="assignment d-flex justify-content-between align-items-center w-100"
                        style="cursor: context-menu">
                        <p>
                          {{ item.title }}
                        </p>
                        <i class="fa fa-lock" aria-hidden="true"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="card-header bg-col" :id="'heading' + index">
                  <h5 class="mb-0">
                    <button class="btn chapter-title w-100 d-flex justify-content-left" type="button"
                      data-toggle="collapse" :data-target="'#collapse' + index" :aria-controls="'collapse' + index">
                      <span>
                        <i class="fas fa-angle-down"></i>&nbsp;
                        <strong> {{ index + 1 }}.</strong> {{ chapter.name }}
                      </span>
                    </button>
                  </h5>
                </div>
                <div :id="'collapse' + index" :class="index === 0 ? 'collapse show' : 'collapse'"
                  :aria-labelledby="'heading' + index">
                  <div v-for="(item, itemIndex) in lessons" :key="itemIndex">
                    <div class="card-body assignment-card border-bottom"
                      v-if="Number(item?.chapter) === Number(chapter?.id)" @click="goToAssignmentDetail(item.id)">
                      <div class="assignment">
                        <p class="assignment-title">
                          {{ item.title }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useStore } from "vuex";
import { toast } from "vue3-toastify";

const router = useRouter();
const route = useRoute();
const store = useStore();
const rootApi = process.env.VUE_APP_ROOT_API;
const userID = computed(() => store.getters.user);
const courseId = route.params.id;

const courseData = ref();
const filteredChapters = ref([]);
const lessons = ref();
const isLoadingBuy = ref(false);
const isLoadingTrial = ref(false);

const dataCourse = reactive({
  course: {},
});

const studentCourse = reactive({status:''});

const totalLessons = ref(0);

const fetchCourseData = async () => {
  try {
    const response = await axios.get(
      `${rootApi}/chapters?idCourse=${courseId}`
    );
    courseData.value = response.data.result.data;

    filteredChapters.value = courseData.value;
    totalLessons.value = calculateTotalLessons(courseData.value);
  } catch (error) {
    console.error("Error when fetching courses: ", error);
  }
};

const fetchLessons = async () => {
  try {
    const response = await axios.get(`${rootApi}/lessons`);
    lessons.value = response.data.result.data.items.map((item) => {
      let titleUpdated = item.title;
      switch (item.type) {
        case "LECTURES":
          titleUpdated = `[Bài giảng] - ${item.title}`;
          break;
        case "READINGS":
          titleUpdated = `[Bài đọc] - ${item.title}`;
          break;
        case "EXERCISES":
          titleUpdated = `[Bài tập] - ${item.title}`;
          break;
      }

      return {
        ...item,
        title: titleUpdated,
      };
    });
  } catch (error) { }
};

const fetchCourse = async () => {
  try {
    const response = await axios.get(`${rootApi}/courses/${courseId}`);
    dataCourse.course = response.data.result.data;
  } catch (error) { }
};

const fetchStudentCourses = async () => {
  try {
    const response = await axios.get(`${rootApi}/student-courses/user`, {
      params: {
        idCourse: courseId,
        idUser: userID.value.id,
      },
    });
    Object.assign(studentCourse, response.data.result);
  } catch (error) {
    console.error("Error when fetching student courses: ", error);
    if (error.response && error.response.status === 400) {
      Object.assign(studentCourse, { status: '' });
    }
  }
};


const calculateTotalLessons = (chapters) => {
  return chapters ? chapters.length : 0;
};

const formatCurrency = (value, unit) => {
  const currencyUnit = unit || "USD";
  const locale = unit === "USD" ? "en-US" : "vi-VN";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyUnit,
  })
    .format(value)
    .replace(unit === "VND" ? "₫" : "", "");
};

const techStackNames = computed(() => {
  return dataCourse.course?.techStack?.length
    ? dataCourse.course.techStack.map((stack) => stack.name).join(", ")
    : null;
});

const teachers = computed(() => {
  return dataCourse.course?.teacher?.length
    ? dataCourse.course.teacher.map((teacher) => teacher.name).join(", ")
    : null;
});

const isTrial = computed(() => studentCourse.status === "TRIAL");
const isOtherStatus = computed(
  () => studentCourse.status !== "TRIAL" && studentCourse.status !== "PAID"
);

const goToAssignmentDetail = (id) => {
  router.push({
    name: 'submitAssignment',
    params: { id: id },
    query: { studentCourse: JSON.stringify(studentCourse) }
  });
};

onMounted(async () => {
  await Promise.all([
    fetchCourseData(),
    fetchLessons(),
    fetchCourse(),
    fetchStudentCourses(),
  ]);
});

// const handleBuyCourse = async () => {
//   try {
//     isLoadingBuy.value = true;
//     const response = await axios.post(
//       `${rootApi}/buy_course?idUser=${userID.value.id}&idCourse=${dataCourse.course.id}`
//     );
//     store.dispatch("fetchSupportPoints", userID.value.id);
//     toast.success("Mua khóa học thành công!!");
//     await Promise.all([
//       fetchCourseData(),
//       fetchLessons(),
//       fetchCourse(),
//       fetchStudentCourses(),
//     ]);
//   } catch (error) {
//     console.log(error);
//     toast.error("Có lỗi xảy ra");
//   } finally {
//     isLoadingBuy.value = false;
//   }
// };

const handleRegisterCourse = async () => {
  try {
    isLoadingTrial.value = true;
    const response = await axios.post(
      `${rootApi}/register_trials?idUser=${userID.value.id}&idCourse=${dataCourse.course.id}`
    );
    store.dispatch("fetchSupportPoints", userID.value.id);
    toast.success("Đăng kí dùng thử khóa học thành công!!");
    await Promise.all([
      fetchCourseData(),
      fetchLessons(),
      fetchCourse(),
      fetchStudentCourses(),
    ]);
  } catch (error) {
    console.log(error);
    toast.error("Có lỗi xảy ra");
  } finally {
    isLoadingTrial.value = false;
  }
};
</script>

<style>
p {
  margin: 0 !important;
}

.assignment-wrapper {
  padding: 0 0;
}

.assignment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.body {
  height: 100%;
}

.courseData-intro {
  margin-top: 30px;
  padding: 20px;
  border: solid 2px;
}

.list-intro.row.col-12 {
  margin: 0;
}

.item {
  display: flex;
  align-items: center;
  padding: 10px 10px 0;
}

.separate {
  margin-top: 30px;
  border: 1px dashed rgb(223, 223, 223);
}

.content-title {
  margin-top: 30px;
}

.courseData-time {
  font-size: 16px;
}

.content-body {
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.1);
}

.assignment-card:hover {
  background-color: #eee;
  text-decoration: underline;
}

.assignment {
  display: flex;
  align-items: center;
  height: 30px;
  padding-left: 12px;
  cursor: pointer;
}

.body-wrapper {
  border-radius: 0;
}

.card.body-wrapper.list-chapter {
  border-radius: 0;
}

.chapter-title:focus {
  box-shadow: none;
  border: none;
}

assignment-title {
  font-size: 16px;
  line-height: 30px;
}

button.btn.chapter-title.collapsed:active {
  border: none;
}

.button.btn.chapter-title.collapsed {
  border: none;
}

img {
  border-radius: 10px;
  max-width: auto;
  height: 100%;
}

.title {
  margin-bottom: 10px !important;
}

.custom-button.btn-buy.w-40 {
  width: 30%;
  background-color: rgba(212, 28, 37, 0.541);
  border-color: white;
  margin-right: 2rem;
  color: rgba(0, 0, 0, 1);
}

.custom-button.btn-buy.w-40:hover {
  background-color: rgba(190, 47, 47, 0.651);
  border-color: white;
  color: white;
}

.bg-col {
  background-color: #e0e0e000 !important;
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
