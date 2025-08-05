<template>
  <div class="min-h-screen bg-[#E8FFF1] font-noto">
    <!-- Header -->
    <div class="">
      <div class="flex items-center gap-4">
        <i class="fas fa-bell"></i>
        <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <img src="https://via.placeholder.com/32" alt="User" class="rounded-full" />
        </div>
      </div>
    </div>

    <!-- Date Range -->
    <div class="flex justify-center gap-4 py-6">
      <div>
        <label class="block text-sm">From :</label>
        <input type="text" placeholder="XX/XX/XXXX"
               class="border px-2 py-1 rounded w-32 text-center" />
      </div>
      <div>
        <label class="block text-sm">To :</label>
        <input type="text" placeholder="XX/XX/XXXX"
               class="border px-2 py-1 rounded w-32 text-center" />
      </div>
    </div>

    <!-- Card Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-10">
      <div v-for="(card, index) in cards" :key="index"
           class="bg-white rounded-lg shadow-md p-4 flex flex-col gap-2">
        <div class="flex gap-3 items-start">
          <img src="https://via.placeholder.com/40" alt="Avatar" class="w-10 h-10 rounded-full" />
          <div>
            <div class="flex items-center gap-2">
              <span class="font-medium">Firstname Lastname</span>
              <span class="bg-gray-100 text-sm px-2 py-1 rounded shadow text-gray-700">
                {{ card.role }}
              </span>
            </div>
            <div class="mt-2 text-sm whitespace-pre-line">
              <strong>สิ่งที่ทำวันนี้</strong><br />
              {{ card.today }}<br />
              <strong>ปัญหาวันนี้</strong><br />
              {{ card.problem }}<br />
              <strong>พรุ่งนี้ทำอะไร</strong><br />
              {{ card.tomorrow }}
            </div>
          </div>
        </div>
        <div class="text-right text-sm text-gray-500 mt-2">XX / XX / XXXX</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DailyScrumHistory",
  data() {
    return {
      cards: [
        {
          role: "BA",
          today: "ตาม Requirements จากลูกค้า",
          problem: "-",
          tomorrow: "จัดการ Requirements ที่ได้จากลูกค้า"
        },
        {
          role: "BA",
          today: "ตาม Requirements จากลูกค้า",
          problem: "-",
          tomorrow: "จัดการ Requirements ที่ได้จากลูกค้า"
        },
        {
          role: "Back-end",
          today: "ทำ Schema",
          problem: "-",
          tomorrow: "วางโครงสร้าง Database"
        },
        {
          role: "Back-end",
          today: "ทำ Schema",
          problem: "-",
          tomorrow: "วางโครงสร้าง Database"
        },
        {
          role: "UX/UI",
          today: "ออกแบบหน้า Home",
          problem: "-",
          tomorrow: "ทำหน้าแสดงข้อมูล"
        },
        {
          role: "UX/UI",
          today: "ออกแบบหน้า Home",
          problem: "-",
          tomorrow: "ทำหน้าแสดงข้อมูล"
        }
      ]
    };
  }
};
</script>

<style scoped>
/* Optionally include icons via FontAwesome or other */
</style>
