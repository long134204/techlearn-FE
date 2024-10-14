<template>
    <header>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <button @click="toggleSidebar" type="button" id="sidebarCollapse" class="btn btn-info">
                    <i class="fas fa-align-left text-white"></i>
                </button>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav"
                    aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div v-if="isLoggedIn && isUser" class="point-support" @click="toggleShowModal">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-support">
                        <path
                            d="M272.2 64.6l-51.1 51.1c-15.3 4.2-29.5 11.9-41.5 22.5L153 161.9C142.8 171 129.5 176 115.8 176L96 176l0 128c20.4 .6 39.8 8.9 54.3 23.4l35.6 35.6 7 7c0 0 0 0 0 0L219.9 397c6.2 6.2 16.4 6.2 22.6 0c1.7-1.7 3-3.7 3.7-5.8c2.8-7.7 9.3-13.5 17.3-15.3s16.4 .6 22.2 6.5L296.5 393c11.6 11.6 30.4 11.6 41.9 0c5.4-5.4 8.3-12.3 8.6-19.4c.4-8.8 5.6-16.6 13.6-20.4s17.3-3 24.4 2.1c9.4 6.7 22.5 5.8 30.9-2.6c9.4-9.4 9.4-24.6 0-33.9L340.1 243l-35.8 33c-27.3 25.2-69.2 25.6-97 .9c-31.7-28.2-32.4-77.4-1.6-106.5l70.1-66.2C303.2 78.4 339.4 64 377.1 64c36.1 0 71 13.3 97.9 37.2L505.1 128l38.9 0 40 0 40 0c8.8 0 16 7.2 16 16l0 208c0 17.7-14.3 32-32 32l-32 0c-11.8 0-22.2-6.4-27.7-16l-84.9 0c-3.4 6.7-7.9 13.1-13.5 18.7c-17.1 17.1-40.8 23.8-63 20.1c-3.6 7.3-8.5 14.1-14.6 20.2c-27.3 27.3-70 30-100.4 8.1c-25.1 20.8-62.5 19.5-86-4.1L159 404l-7-7-35.6-35.6c-5.5-5.5-12.7-8.7-20.4-9.3C96 369.7 81.6 384 64 384l-32 0c-17.7 0-32-14.3-32-32L0 144c0-8.8 7.2-16 16-16l40 0 40 0 19.8 0c2 0 3.9-.7 5.3-2l26.5-23.6C175.5 77.7 211.4 64 248.7 64L259 64c4.4 0 8.9 .2 13.2 .6zM544 320l0-144-48 0c-5.9 0-11.6-2.2-15.9-6.1l-36.9-32.8c-18.2-16.2-41.7-25.1-66.1-25.1c-25.4 0-49.8 9.7-68.3 27.1l-70.1 66.2c-10.3 9.8-10.1 26.3 .5 35.7c9.3 8.3 23.4 8.1 32.5-.3l71.9-66.4c9.7-9 24.9-8.4 33.9 1.4s8.4 24.9-1.4 33.9l-.8 .8 74.4 74.4c10 10 16.5 22.3 19.4 35.1l74.8 0zM64 336a16 16 0 1 0 -32 0 16 16 0 1 0 32 0zm528 16a16 16 0 1 0 0-32 16 16 0 1 0 0 32z"
                            style="size: 100;"/>
                    </svg>
                    <span>
                        {{ supportPoints }} lượt
                    </span>
                </div>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ml-auto align-items-center">
                        <li v-if="!isLoggedIn" class="nav-item">
                            <a class="nav-link" href="/login">
                                <svg xmlns="http://www.w3.org/2000/svg" height="15" width="15" viewBox="0 0 512 512">
                                    <path
                                        d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z" />
                                </svg>
                                Đăng Nhập
                            </a>
                        </li>

                        <li v-else class="nav-item dropdown" v-if="user">
                            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true"
                                aria-expanded="false">
                                <img :src="user?.avatar" class="rounded-circle avatar" alt="User Avatar">
                            </a>
                            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
                                <a class="dropdown-item" href="#" @click="showUserModal">Thông tin cá nhân</a>
                                <div class="dropdown-divider"></div>
                                <p class="dropdown-item" @click="handleLogout">Đăng xuất</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        <UserModal :isOpen="isUserModalOpen" @update:isOpen="isUserModalOpen = false" />
    </header>
    <div>
        <PointPurchaseModal v-if="isLoggedIn && isUser" :show="showPointModal" @close="closePointModal" />
    </div>
</template>

<script setup>
import { inject, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { toast } from 'vue3-toastify';
import { computed } from 'vue';
import axios from 'axios';
import UserModal from './UserModal.vue';
import PointPurchaseModal from '../Modal/PointsPurcharseModal.vue';

const router = useRouter();
const toggleSidebar = inject('toggleSidebar');

const store = useStore();
const isLoggedIn = computed(() => store.getters.isLoggedIn);
const user = computed(() => store.getters.user);
const isUserModalOpen = ref(false);
const points = ref(0);
const isUser = computed(() => {
    return user.value?.roles?.some(role => role.name === "USER") || false;
});

const rootApi = process.env.VUE_APP_ROOT_API;
const supportPoints = computed(() => store.getters.supportPoints);

const showPointModal = ref(false);

onMounted(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
        store.dispatch('fetchUser').then(() => {
            if (store.getters.isLoggedIn && user.value && isUser.value) {
                store.dispatch('fetchSupportPoints', user.value.id);
            }
        });
    }
});

const showUserModal = () => {
    isUserModalOpen.value = true; 
};
const handleLogout = async () => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        localStorage.clear();
        router.push("/login").then(() => {
            toast.success("Đăng xuất thành công!", {
                autoClose: 1200
            });
        });
        await axios.get(`${rootApi}/auth/logout`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        store.commit('setLoggedIn', false);
        store.commit('setUser', null);
    } catch (err) {
        console.log(err);
    }
};


const toggleShowModal = () => {
    showPointModal.value = !showPointModal.value;
};

const closePointModal = () => {
    showPointModal.value = false;
};

</script>

<style scoped>
.navbar {
    padding: 15px 10px;
    height : 80px;
    background: #fff;
    border: none;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

.navbar-btn {
    box-shadow: none;
    outline: none !important;
    border: none;
}

.avatar {
    width: 40px;
    height: 40px;
}

.nav-item .dropdown-menu {
    min-width: 150px;
}

.dropdown-item {
    cursor: pointer;
}

.point-support {
    color: #000000;
    display: flex;
    justify-content: space-evenly;
    height: 30px;
    width: 120px;
    border-radius: 20px;
    background-color: #d2d2d2;
    flex-shrink: 0;
    position: absolute;
    right: 160px;
    cursor: pointer;
}

.point-support:hover {
    background-color: #c2c2c2;
}

.point-support span {
    margin-top: 2.5px;
    font-weight: 400;
}

.icon-support {
    width: 40px;
    opacity: 0.6;
}
/*  */
</style>