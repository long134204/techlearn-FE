<template>
    <div
      class="modal"
      tabindex="-1"
      v-if="show"
      :class="{ show: show }"
      :style="{ display: show ? 'block' : 'none' }"
      aria-labelledby="pointModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h3 class="modal-title w-100 text-center" id="pointModalLabel">
              Mua thêm lượt hỗ trợ
            </h3>
            <button
              type="button"
              class="btn-close"
              @click="$emit('close')"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row g-3" id="pointOptions">
              <div v-for="p in points" :key="p.id" class="col-md-4">
                <div
                  class="card point-card h-100"
                  :class="{ selected: p.id === selectedPoint?.id }"
                  @click="selectPoint(p.id)"
                >
                  <div class="card-body text-center">
                    <h3 class="card-title">{{ p.points }} lượt</h3>
                    <p class="card-text text-muted">{{ p.name }}</p>
                    <p class="card-text fw-bold">
                      {{ formatPrice(p.price, p.idCurrency) }}
                    </p>
                    <span class="checkmark" v-show="p.id === selectedPoint?.id">
                      <svg
                        fill="#06b72f"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        class="icon line"
                      >
                        <path
                          d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button
              type="button"
              class="btn btn-primary w-100"
              @click="handlePurchase"
              :disabled="!selectedPoint || isLoading"
            >
              Gửi yêu cầu mua
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ show: show }" v-if="show"></div>
  
    <loading
      :active.sync="isLoading"
      :can-cancel="false"
      :is-full-page="false"
      loader="bars"
    ></loading>
  </template>
    
    <script setup>
  import { ref, defineProps, defineEmits, onMounted, computed } from "vue";
  import { toast } from "vue3-toastify";
  import axios from "axios";
  import { useStore } from "vuex";
  import Loading from "vue-loading-overlay";
  import "vue-loading-overlay/dist/vue-loading.css";
  
  const store = useStore();
  const rootApi = process.env.VUE_APP_ROOT_API;
  const isLoading = ref(false);
  
  const props = defineProps({
    show: {
      type: Boolean,
      required: true,
    },
  });
  
  const emit = defineEmits(["close"]);
  
  const selectedPoint = ref(null);
  const points = ref([]);
  const currencies = ref([]);
  
  const user = computed(() => store.getters.user);
  
  onMounted(async () => {
    await fetchPoints();
    await fetchCurrencies();
  });
  
  const fetchPoints = async () => {
    try {
      const response = await axios.get(`${rootApi}/users/points-package`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      points.value = response.data.items.items;
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải danh sách điểm");
    }
  };
  
  const fetchCurrencies = async () => {
    try {
      const response = await axios.get(`${rootApi}/currencies`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      currencies.value = response.data.result;
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải danh sách tiền tệ");
    }
  };
  
  const selectPoint = (pointId) => {
    if (selectedPoint.value && selectedPoint.value.id === pointId) {
      selectedPoint.value = null;
    } else {
      selectedPoint.value = points.value.find((point) => point.id === pointId);
    }
  };
  
  const formatPrice = (price, idCurrency) => {
    const currency = currencies.value.find((c) => c.id === idCurrency);
    if (!currency) return price;
  
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency.units,
    }).format(price);
  };
  
  const handlePurchase = async () => {
    if (!selectedPoint.value) return;
  
    isLoading.value = true;
  
    try {
      await axios.post(`${rootApi}/users/request-points`, selectedPoint.value, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      store.dispatch("fetchSupportPoints", user.value.id);
      toast.success(`Yêu cầu mua ${selectedPoint.value.name}`, {
        autoClose: 500,
      });
    } catch (error) {
      toast.error("Có lỗi xảy ra khi mua điểm");
    } finally {
      isLoading.value = false;
      emit("close");
    }
  };
  </script>
    
    <style scoped>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1050;
    width: 100%;
    height: 100%;
    overflow: hidden;
    outline: 0;
  }
  
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1040;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .modal-backdrop.show {
    opacity: 0.5;
  }
  
  .point-card {
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    position: relative;
  }
  
  .point-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .point-card.selected {
    border-color: #06b72f;
  }
  
  .checkmark {
    position: absolute;
    top: 10px;
    right: 10px;
    color: #06b72f;
  }
  .text-muted {
    font-weight: 700 !important;
    color: #000 !important;
  }
  </style>
    