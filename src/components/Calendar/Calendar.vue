<template>
  <div class="relative">

    <ejs-schedule height="750px" width="100%" ref='scheduleObj' :selectedDate="selectedDate" :eventSettings="eventSettings"
      :actionBegin="onActionBegin" class="calendar" :editorTemplate="'editorTemplate'" :eventRendered="onEventRendered" :popupOpen="popupOpen"
      :startHour="startHour" :endHour="endHour">
      <template v-slot:editorTemplate>
        <table class="custom-event-editor" width="100%" cellpadding="5">
          <tbody>
            <tr>
              <td class="e-textlabel">Tiêu đề</td>
              <td colspan="4">
                <input id="Subject" class="e-field e-input" type="text" value="" name="Subject" style="width: 100%" />
              </td>
            </tr>
            <!-- <tr>
              <td class="e-textlabel">Giảng viên</td>
              <td colspan="4">
                <ejsDropdownlist id='OwnerId' name="OwnerId" class="e-field" placeholder='Choose status'
                  :dataSource='ownerDataSource' :fields="dropListFields">
                </ejsDropdownlist>
              </td>
            </tr> -->
            <tr>
              <td class="e-textlabel">Giờ bắt đầu</td>
              <td colspan="4">
                <ejsDatetimepicker id="StartTime" class="e-field" name="StartTime"></ejsDatetimepicker>
              </td>
            </tr>
            <tr>
              <td class="e-textlabel">Giờ kết thúc</td>
              <td colspan="4">
                <ejsDatetimepicker id="EndTime" class="e-field" name="EndTime"></ejsDatetimepicker>
              </td>
            </tr>
            <tr>
              <!-- thay ckeditor -->
              <td class="e-textlabel">Mô tả</td>
              <td colspan="4">
                <textarea id="Description" class="e-field e-input" name="Description" rows="3" cols="50"
                  style="width: 100%; height: 60px !important; resize: vertical"></textarea>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
      <e-views>
        <e-view option="Day"></e-view>
        <e-view option="Week"></e-view>
        <e-view option="WorkWeek"></e-view>
        <e-view option="Month"></e-view>
        <e-view option="Agenda"></e-view>
      </e-views>
      <e-resources>
        <e-resource field="OwnerId" title="Owner" name="Owners" :dataSource="ownerDataSource" textField="OwnerText" idField="Id"
          colorField="OwnerColor">
        </e-resource>
      </e-resources>
    </ejs-schedule>
    <div v-if="isLoading">
      <div class="loader"></div>
    </div>
  </div>
  <loading :active="isLoading" :is-full-page="true" />
</template>

<script setup>
import { onMounted, provide, ref, nextTick } from "vue";
import {
  ScheduleComponent as EjsSchedule, ViewsDirective as EViews, ViewDirective as EView, ResourcesDirective as EResources, ResourceDirective as EResource,
  Day, Week, WorkWeek, Month, Agenda, DragAndDrop
} from "@syncfusion/ej2-vue-schedule";
import { DataManager, WebApiAdaptor } from "@syncfusion/ej2-data";
import axios from "axios";
import { DropDownListComponent as ejsDropdownlist } from "@syncfusion/ej2-vue-dropdowns";
import { DateTimePickerComponent as ejsDatetimepicker } from "@syncfusion/ej2-vue-calendars";
import { toast } from 'vue3-toastify';
import { watch } from "vue";
import { L10n, setCulture } from "@syncfusion/ej2-base";
import viLocale from "../../locale/vi.json";
import { loadCldr } from '@syncfusion/ej2-base';
import frNumberData from '@syncfusion/ej2-cldr-data/main/vi/numbers.json';
import frtimeZoneData from '@syncfusion/ej2-cldr-data/main/vi/timeZoneNames.json';
import frGregorian from '@syncfusion/ej2-cldr-data/main/vi/ca-gregorian.json';
import frNumberingSystem from '@syncfusion/ej2-cldr-data/supplemental/numberingSystems.json';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';
import { useStore } from "vuex";
import { computed } from "vue";

axios.defaults.batch = false;

const rootApi = process.env.VUE_APP_ROOT_API;

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: false
  },
  calendarType: {
    type: String,
    required: true
  }
});

const isLoading = ref(false);
const isStudentBooking = ref(false);
const isSuppoter = localStorage.getItem("isSuppoter");
setCulture('vi');
L10n.load(viLocale)
loadCldr(frNumberData, frtimeZoneData, frGregorian, frNumberingSystem);
provide("schedule", [Day, Week, WorkWeek, Month, Agenda, DragAndDrop]);
const accessToken = localStorage.getItem("accessToken");

const remoteData = new DataManager({
  url: `${props.url}`,
  adaptor: new WebApiAdaptor,
  crossDomain: true,
  headers: [{
    Authorization: `Bearer ${accessToken}`
  }]
});
const scheduleObj = ref(null);
const selectedDate = new Date();
const ownerDataSource = ref([]);
const eventSettings = ref({
  dataSource: remoteData
});

const store = useStore();
const user = computed(() => store.getters.user);

const startHour = "08:00";
const endHour = "21:00";

const dropListFields = {
  text: "OwnerText",
  value: "Id"
}

const getOwnerDataSource = async () => {

  const res = await axios.get(`${rootApi}/teachers/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`

    }
  });
  ownerDataSource.value = res.data;
}

const getEvent = async () => {
  try {
    const res = await axios.get(props.url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    eventSettings.value = {
      dataSource: res.data
    };
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

const onEventRendered = (args) => {
  const ownerId = args.data.OwnerId;
  if (ownerId) {
    const owner = ownerDataSource.value.find(owner => owner.Id === ownerId);
    if (owner) {
      const avatarHtml = `<div class="mx-1">
                            <img width="24" height="24" src="${owner.avatar}"
                              class="owner-avatar rounded-circle img-fluid border border-white" />
                          </div>`;

      const eventWidth = args.element.offsetWidth;
      const avatarWidth = 30;
      const availableWidth = eventWidth - avatarWidth - 10;

      let subjectText = args.data.Subject;
      if (subjectText.length > 20) {
        subjectText = subjectText.substring(0, 17) + '...';
      }

      args.element.innerHTML = `
        <div class="d-flex align-items-center h-100 overflow-hidden">
          ${avatarHtml}
          <div class="text-truncate" style="max-width: ${availableWidth}px;">${subjectText}</div>
        </div>`;

      args.element.title = args.data.Subject;
    }
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  // Chuyển đổi sang múi giờ Asia/Bangkok
  date.setHours(date.getHours() + 7);
  // Format date to 'yyyy-MM-ddTHH:mm:ss'
  return date.toISOString().slice(0, 19);
};

const onActionBegin = async (args) => {
  if (args.requestType === 'eventCreate') {
    try {
      const eventData = args.data[0];
      const formattedEventData = {
        ...eventData,
        StartTime: formatDate(eventData.StartTime),
        EndTime: formatDate(eventData.EndTime),
        StartTimezone: 'Asia/Bangkok',
        EndTimezone: 'Asia/Bangkok',
      };

      if (window.location.href.includes('student')) {
        await axios.post(`${rootApi}/student/${user.value.id}/calendar`,
          {
            ...formattedEventData,
            UserId: user.value.id,
            status: "BOOKED",
            OwnerId: '5bb75f1d-7956-11ef-8bc5-005056c00001' // để tạm, sẽ được lấy theo id teacher được chọn
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        toast.success('Đặt lịch thành công! Vui lòng kiểm tra gmail để xem chi tiết');

        return;
      }
      else if (props.url.includes('teacher')) {
        await axios.post(`${props.url}`, {
          ...formattedEventData,
          status: "BUSY"
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        toast.success('Cập nhật lịch thành công!');
      }
    } catch (error) {
      toast.error('Cập nhật lịch thất bại!');
    }
  } else if (args.requestType === 'eventRemove') {
    try {

      await axios.delete(`${props.url}/${args.data[0].Id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      toast.success('Xóa lịch thành công!');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Không thể xóa sự kiện!');
    }
  } else if (args.requestType === 'eventChange') {
    try {
      let formattedEventData = {
        ...args.data,
        StartTime: formatDate(args.data.StartTime),
        EndTime: formatDate(args.data.EndTime),
      };
      await axios.put(`${props.url}/${formattedEventData.Id}`, formattedEventData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      toast.success('Xóa lịch thành công!');
    } catch (error) {
      toast.error('Xóa lịch thất bại!');
    } finally {
      isLoading.value = false;
    }
  }

  await nextTick(() => {
    scheduleObj.value.refreshEvents();
  });
}

onMounted(() => {
  getOwnerDataSource();

  if (props.url) {
    getEvent();
  }
});

watch(() => props.url, (newUrl) => {
  if (newUrl) {
    getEvent();
  }
});


watch(() => props.id, (newId) => {
  if (newId) {
    eventSettings.value = {
      dataSource: props.id,
    };
  }
});

watch(() => props.url, (newUrl) => {
  eventSettings.value = {
    dataSource: new DataManager({
      url: newUrl,
      adaptor: new WebApiAdaptor(),
      crossDomain: true,
      headers: [{
        Authorization: `Bearer ${accessToken}`
      }]
    })
  };
});

const popupOpen = function (args) {
  const isOtherType = props.calendarType === 'other';
  const isMineTypeAndStudent = props.calendarType === 'mine' && window.location.href.includes('student');
  const isStudentBooking = window.location.href.includes('student') && props.calendarType === 'other';

  if (args.type === 'QuickInfo') {
    if (isOtherType) {
      args.cancel = false;
    } else if (isMineTypeAndStudent) {
      const scheduleObj = this;
      const hasEvents = scheduleObj.getEvents(args.data.StartTime, args.data.EndTime).length > 0;
      if (!hasEvents) {
        args.cancel = true;
      }
    }
  } else if (args.type === 'Editor') {
    if (isStudentBooking) {
      args.cancel = false;
    } else {
      args.cancel = true;
    }
  }
}

</script>

<style scoped>
@import '../../../node_modules/@syncfusion/ej2-buttons/styles/material.css';
@import '../../../node_modules/@syncfusion/ej2-calendars/styles/material.css';
@import '../../../node_modules/@syncfusion/ej2-dropdowns/styles/material.css';
@import '../../../node_modules/@syncfusion/ej2-inputs/styles/material.css';
@import '../../../node_modules/@syncfusion/ej2-navigations/styles/material.css';
@import '../../../node_modules/@syncfusion/ej2-popups/styles/material.css';
@import '../../../node_modules/@syncfusion/ej2-vue-schedule/styles/material.css';
@import '../../../node_modules/@syncfusion/ej2-base/styles/material.css';

.relative {
  position: relative;
}


/* HTML: <div class="loader"></div> */
.loader {
  --r1: 154%;
  --r2: 68.5%;
  width: 60px;
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(var(--r1) var(--r2) at top, #0000 79.5%, #269af2 80%),
    radial-gradient(var(--r1) var(--r2) at bottom, #269af2 79.5%, #0000 80%),
    radial-gradient(var(--r1) var(--r2) at top, #0000 79.5%, #269af2 80%),
    #ccc;
  background-size: 50.5% 220%;
  background-position: -100% 0%, 0% 0%, 100% 0%;
  background-repeat: no-repeat;
  animation: l9 2s infinite linear;
}

@keyframes l9 {
  33% {
    background-position: 0% 33%, 100% 33%, 200% 33%
  }

  66% {
    background-position: -100% 66%, 0% 66%, 100% 66%
  }

  100% {
    background-position: 0% 100%, 100% 100%, 200% 100%
  }
}
</style>