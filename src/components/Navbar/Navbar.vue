<template>
  <div class="wrapper">
    <nav id="sidebar" :class="{ active: isSidebarCollapsed }">
      <div class="sidebar-header">
        <h3>TechLearn</h3>
      </div>
      <ul class="list-unstyled components">
        <li v-if="isTeacher || isMentor" @click="changeActive(1)">
          <router-link to="/teacher" :class="isActive == 1 ? 'nav-link active' : 'nav-link'" exact>Lịch cá
            nhân</router-link>
        </li>
        <!-- <li v-if="isUser">
          <router-link to="/student" class="nav-link">Đặt lịch học</router-link>
        </li> -->
        <li v-if="isTeacher" @click="changeActive(2)">
          <router-link to="/listPrompt" :class="isActive == 2 ? 'nav-link active router-link-active' : 'nav-link'"
            exact>Cấu
            hình
            AI</router-link>
        </li>
        <li v-if="isUser" @click="changeActive(3)">
          <router-link to="/coursePage" :class="isActive == 3 ? 'nav-link active router-link-active' : 'nav-link'"
            exact>Khóa
            học</router-link>
        </li>
        <li v-if="isUser" @click="changeActive(4)">
          <router-link to="/myCoursePage" :class="isActive == 4 ? 'nav-link active router-link-active' : 'nav-link'"
            exact>
            Khóa học của tôi
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { inject } from "vue";
import { useStore } from "vuex";

const isSidebarCollapsed = inject("isSidebarCollapsed");
const store = useStore();
const user = computed(() => store.getters.user);

const initialActive = parseInt(localStorage.getItem("isActive")) || 2;
const isActive = ref(initialActive);

onMounted(() => {
  if (!store.getters.isLoggedIn) {
    store.dispatch("fetchUser");
  }
});

const isTeacher = computed(() =>
  user.value?.roles.some((role) => role.name === "TEACHER")
);
const isUser = computed(() =>
  user.value?.roles.some((role) => role.name === "USER")
);
const isMentor = computed(() =>
  user.value?.roles.some((role) => role.name === "MENTOR")
);


const changeActive = (value) => {
  isActive.value = value;
  localStorage.setItem("isActive", value);
};
</script>

<style scoped>
.navbar-container {
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.item {
  padding: 10px;
  cursor: pointer;
  margin: 20px 5px;
  display: flex;
  border-bottom: 1px solid #ddd;
}

.active {
  background-color: #4a4a8e;
  font-weight: bold;
  border-radius: 5px;
}

.item a {
  text-decoration: none;
  color: black;
  font-size: 15px;
}

.wrapper {
  display: flex;
  align-items: stretch;
}

#sidebar {
  min-width: 220px;
  max-width: 220px;
  background: #4a4a8e;
  color: #ffffff;
  transition: all 0.3s;
}

#sidebar a,
#sidebar a:hover,
#sidebar a:focus {
  color: inherit;
  text-decoration: none;
}

#sidebar .sidebar-header {
  padding: 20px;
  background: #393975;
}

#sidebar ul.components {
  padding: 20px 0;
}

#sidebar ul li a {
  padding: 10px 20px;
  font-size: 1.1em;
  display: block;
}

#sidebar ul ul li a {
  padding: 10px 30px;
  font-size: 1em;
  display: block;
}

#sidebar ul li a:hover {
  background: #5b5bad;
}

#sidebar ul li.active>a,
a[aria-expanded="true"] {
  background: #5b5bad;
}

#sidebar.active {
  margin-left: -220px;
}

.router-link-active,
.router-link-exact-active {
  background-color: #5b5bad;
  color: #ffffff;
}

@media (max-width: 768px) {
  #sidebar {
    margin-left: -220px;
  }

  #sidebar.active {
    margin-left: 0;
  }
}
</style>
