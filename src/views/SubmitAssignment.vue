<template>
  <div class="container-fluid ">
    <div class="assignment-container" v-if="assignmentDescription">
      <h4>{{ assignmentDescription.title }}</h4>
      <div class="assignment-description">
        <div ref="description" class="description-text" v-html="format(assignmentDescription.content)"></div>
      </div>
    </div>
    <div v-else>
      <p>Đang tải dữ liệu...</p>
    </div>
    <div v-if="isStatus">
      <div v-if="assignmentDescription?.type === 'EXERCISES'">
        <div class="d-flex justify-content-end">
          <button class="btn btn-outline-primary" type="button" @click="viewSolution">
            {{ active ? 'Đóng tham khảo' : 'Tham khảo' }}</button>
        </div>
        <div v-if="active">
          <div class="assignment-description">
            <div ref="description" class="description-text" v-html="format(assignmentDescription?.contentRefer)"></div>
          </div>
        </div>
        <div class="submit-container">
          <p>Nộp bài tập:</p>
          <div class="input-container mt-3">
            <input v-on:change="validInputLink()" type="text" placeholder="Thêm link github tại đây"
              v-model="githubLink" required />
            <button @click="submitAssignment" :disabled="isLoading || isPassed"
              :class="{ 'button-disabled': isPassed }">
              <span v-if="isLoading">
                <div class="spinner"></div>
              </span>
              <span v-else>Nộp bài</span>
            </button>
          </div>
          <span class="text-danger">{{ errorgithubLink }}</span>

        </div>
        <div class="result-container mt-3">
          <div class="result-header">
            <p>Kết quả:</p>
            <button @click="openModal" class="m-0">Xem lịch sử nộp bài</button>
          </div>
          <div v-if="lastResult" class="result-AI-container">
            <div class="time-container">
              <p>Nộp bài {{ formatDateString(lastResult.createdDate) }}</p>
            </div>
            <div class="response-AI-text" v-html="format(lastResult.review)"></div>
          </div>
        </div>
        <div class="modal fade" id="historyModal" tabindex="-1" aria-labelledby="historyModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-xl">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="historyModalLabel" style="font-weight: 600; font-size: 25px">
                  Lịch sử nộp bài
                </h5>
              </div>
              <div class="modal-body">
                <div v-if="result.length > 0">
                  <div class="accordion" id="accordionExample">
                    <div class="accordion-item" v-for="(res, index) in result" :key="index">
                      <h2 class="accordion-header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse"
                          :data-bs-target="'#collapse' + res.id" aria-expanded="true"
                          :aria-controls="'#collapse' + res.id">
                          <p style="font-size: 18px; font-weight: 550; margin-bottom: 15px">
                            Lần nộp thứ {{ index + 1 }}
                          </p>
                          <p class="ms-3">Thời gian nộp: {{ formatDateString(res.createdDate) }}</p>
                        </button>
                      </h2>
                      <div :id="'collapse' + res.id" class="accordion-collapse collapse "
                        data-bs-parent="#accordionExample">
                        <div class="accordion-body">
                          <div class="response-AI-text" v-html="format(res.review)"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <p>Chưa có lịch sử nộp bài.</p>
                </div>
              </div>
              <div class="modal-footer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, reactive, computed } from "vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { toast } from "vue3-toastify";

const route = useRoute();
const router = useRouter();
const store = useStore();

const assignmentDescription = ref(null);
const githubLink = ref("");
var errorgithubLink = ref("");
var result = ref([]);
const isLoading = ref(false);
const rootApi = process.env.VUE_APP_ROOT_API;
const description = ref(null);
const lastResult = ref();
const userID = computed(() => store.getters.user);
const assignmentId = route.params.id;
const isPassed = ref(false);
const active = ref(false);
const studentCourse = reactive({});
const errorCode = {
  1301: "Link github được để trống",
  1302: "Link github không được tìm thấy hoặc không đúng định dạng",
  1303: "Lỗi khi gọi API Github",
  1901: "Vượt quá số lượng file cho phép đọc",
}

function validInputLink() {
  if (githubLink.value == "") {
    errorgithubLink.value = "Vui lòng nhập link github bài tập !"
    return false
  } else if (!githubLink.value.startsWith("https://github.com")) {
    errorgithubLink.value = "Vui lòng đúng định dạng link github bài tập !"
    return false
  }
  errorgithubLink.value = ""
  return true;
}

const openModal = async () => {
  const modal = new bootstrap.Modal(document.getElementById("historyModal"));
  modal.show();
  result.value.splice(0, result.value.length);
  try {
    console.log(userID.value.id);
    console.log(assignmentId);

    const response = await axios.get(
      `${rootApi}/reviews?id=${userID.value.id}&assignment=${assignmentId}&pageSize=30`
    );
    response.data.result.items.map((rev, index) => {

      result.value.push(rev);
    });
  } catch (error) { }
};

const fetchLastResult = async () => {
  try {
    const response = await axios.get(
      `${rootApi}/reviews/${assignmentId}?id=${userID.value.id}`
    );
    lastResult.value = response.data.result;
    isPassed.value = response.data.result.status === "PASS" ? true : false;
  } catch (error) { }
};

const fetchAssignments = async () => {
  try {
    const response = await axios.get(
      `${rootApi}/lessons/${assignmentId}`
    );
    assignmentDescription.value = response.data.result.data;
    console.log(assignmentDescription.value);

  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
  }
};

const submitAssignment = async () => {
  if (!validInputLink()) {
    return false;
  }
  try {
    isLoading.value = true;
    const response = await axios.post(
      `${rootApi}/reviews/fetch-repo-content`,
      {
        github_link: githubLink.value,
        exerciseTitle: assignmentDescription.value.content,
        idUser: userID.value.id,
        idAssignment: assignmentId
      }
    );
    const data = response.data;
    await fetchLastResult();
    isLoading.value = false;
    console.log(isPassed.value);
    console.log(data);


  } catch (error) {
    console.log(error.response.data.message);
    isLoading.value = false;
    toast.error(errorCode[error.response.data.code], {
      autoClose: 2000,
    });
  }
};

const format = (result) => {
  return result.replace(/\n/g, "<br>");
};

const formatDateString = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
};

const goBack = () => {
  router.go(-1);
};

const viewSolution = () => {
  active.value = !active.value;
};

const isStatus = computed(() => studentCourse.status === 'TRIAL' || studentCourse.status === 'PAID');

onMounted(async () => {
  await fetchAssignments();
  await fetchLastResult();
  if (route.query.studentCourse) {
    Object.assign(studentCourse, JSON.parse(route.query.studentCourse)); 
    console.log("StudentCourse:", studentCourse);
    console.log("Status:", studentCourse.status);
  }
});
</script>

<style scoped>
.container {
  margin: 30px;
}

.button-disabled {
  background-color: #d8bebe !important;
  color: #999999;
  cursor: not-allowed;
  border: 1px solid #d3d3d3;
}

.description-text {
  font-size: 17px;
  /* margin-left: 12px; */
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin-top: 15px;
  margin-bottom: 20px;
}

.submit-container p,
.result-container p {
  font-weight: 600;
  font-size: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.result-header button {
  /* padding: 10px; */
  border-radius: 8px;
  background-color: #1872db;
  color: white;
  outline: none;
  border: none;
  margin-right: 30px;
  height: 40px;
}

.input-container {
  outline: solid 1px #9b9b9b;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  /* margin-right: 30px;
  margin-left: 15px; */
}

.input-container input {
  outline: none;
  border: none;
  flex-grow: 1;
  padding: 8px;
}

.input-container button {
  border: none;
  outline: none;
  background-color: #1872db;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  color: white;
  width: 120px;
}

.result-container p {
  margin-top: 20px;
}

.result-container textarea {
  width: 96%;
  height: auto;
  min-height: 100px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #9b9b9b;
  resize: none;
  overflow-y: hidden;
  margin-left: 15px;
}

.result-AI-container p {
  font-weight: 600;
  font-size: 16px;
}

.time-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-left: 25px;
}

.response-AI-text {
  border: 1px solid #d3bfbf;
  border-radius: 10px;
  padding: 13px;
  margin-left: 12px;
  margin-right: 27px;
  margin-bottom: 15px;
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
