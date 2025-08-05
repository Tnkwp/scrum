<template>
  <div class="space-y-4 pt-9">
    <!-- list ของ tee points -->
    <div class="flex gap-2 items-center bg-white rounded-md p-2 shadow-sm ">
      <!-- ชื่อ Tee -->
      <input
        type="text"
        placeholder="ชื่อ Tee เช่น White Tee"
        class="border border-gray-300 rounded-md px-3 py-2  w-full"
      />

      <!-- Par -->
      <input
        type="text"
        placeholder="Par (หลุม)"
        inputmode="numeric"
        pattern="[0-9]*"
        class="border border-gray-300 rounded-md px-3 py-2 text-center w-full"
      />

      <!-- Yardage -->
      <input
        type="text"
        placeholder="ระยะ (หลา)"
        inputmode="numeric"
        pattern="[0-9]*"
        class="border border-gray-300 rounded-md px-3 py-2 text-center w-full"
      />

      <!-- ปุ่มลบ -->
      <div class="flex justify-end items-center">
        <UButton class="bg-red-100 w-6 h-6" />
      </div>
    </div>

    <!-- ปุ่มเพิ่ม -->
  </div>
</template>
