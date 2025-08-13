<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <!-- App Header -->
    <header class="sticky top-0 z-10 bg-white border-b">
      <div
        class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between"
      >
        <h1 class="text-xl md:text-2xl font-bold tracking-tight">
          Daily Ops – งานประจำวัน
        </h1>
        <div class="flex gap-2">
          <button
            class="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
            @click="exportData"
          >
            Export JSON
          </button>
          <label
            class="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm cursor-pointer"
          >
            Import JSON
            <input
              type="file"
              class="hidden"
              accept="application/json"
              @change="importData"
            />
          </label>
        </div>
      </div>
      <nav class="max-w-6xl mx-auto px-2 pb-2">
        <div class="flex gap-2 overflow-auto">
          <button
            v-for="t in tabs"
            :key="t.key"
            @click="activeTab = t.key"
            class="px-4 py-2 rounded-xl text-sm md:text-base"
            :class="
              activeTab === t.key
                ? 'bg-blue-600 text-white'
                : 'bg-white border hover:bg-gray-50'
            "
          >
            {{ t.label }}
          </button>
        </div>
      </nav>
    </header>

    <main class="max-w-6xl mx-auto p-4 space-y-6">
      <!-- Dashboard -->
      <section
        v-if="activeTab === 'dashboard'"
        class="grid md:grid-cols-3 gap-4"
      >
        <div class="p-4 bg-white rounded-2xl shadow-sm border">
          <h2 class="font-semibold mb-2">พนักงาน</h2>
          <p class="text-3xl font-bold">{{ employees.length }}</p>
          <div class="mt-3 flex gap-2">
            <input
              v-model="newEmployee"
              @keyup.enter="addEmployee"
              placeholder="เพิ่มชื่อพนักงาน"
              class="flex-1 border rounded-xl px-3 py-2"
            />
            <button
              @click="addEmployee"
              class="px-3 py-2 rounded-xl bg-blue-600 text-white"
            >
              เพิ่ม
            </button>
          </div>
          <ul class="mt-3 max-h-40 overflow-auto space-y-1 text-sm">
            <li
              v-for="e in employees"
              :key="e.id"
              class="flex items-center justify-between"
            >
              <span>{{ e.name }}</span>
              <button
                class="text-red-600 hover:underline text-xs"
                @click="removeEmployee(e.id)"
              >
                ลบ
              </button>
            </li>
          </ul>
        </div>

        <div class="p-4 bg-white rounded-2xl shadow-sm border">
          <h2 class="font-semibold mb-2">งานวันนี้ ({{ today }})</h2>
          <p class="text-3xl font-bold">{{ todaysTasks.length }}</p>
          <ul class="mt-3 space-y-2 max-h-48 overflow-auto">
            <li
              v-for="t in todaysTasks"
              :key="t.id"
              class="border rounded-xl p-2"
            >
              <div class="flex justify-between gap-2">
                <div>
                  <p class="font-medium">{{ t.title }}</p>
                  <p class="text-xs text-gray-500">
                    มอบหมายให้: {{ getEmployeeName(t.employeeId) }}
                  </p>
                </div>
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  :class="
                    t.status === 'done'
                      ? 'bg-green-100 text-green-700'
                      : t.status === 'in_progress'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  "
                >
                  {{ statusLabel(t.status) }}
                </span>
              </div>
              <div v-if="t.signature" class="mt-2">
                <p class="text-xs text-gray-500">เซ็นรับรองแล้ว</p>
                <img :src="t.signature" alt="signature" class="h-10" />
              </div>
            </li>
          </ul>
        </div>

        <div class="p-4 bg-white rounded-2xl shadow-sm border">
          <h2 class="font-semibold mb-3">สรุปเวลาเข้างานวันนี้</h2>
          <ul class="space-y-2 max-h-64 overflow-auto">
            <li
              v-for="e in employees"
              :key="e.id"
              class="flex items-center justify-between border rounded-xl p-2"
            >
              <div>
                <p class="font-medium">{{ e.name }}</p>
                <p class="text-xs text-gray-500">
                  สถานะ:
                  {{
                    attendanceLabel(getAttendance(today, e.id)?.status) || "—"
                  }}
                </p>
              </div>
              <div class="text-sm">
                {{ getAttendance(today, e.id)?.time || "-" }}
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- Assign Tasks -->
      <section v-if="activeTab === 'tasks'" class="space-y-4">
        <div class="p-4 bg-white rounded-2xl shadow-sm border">
          <h2 class="font-semibold mb-3">มอบหมายงาน</h2>
          <div class="grid md:grid-cols-4 gap-3">
            <div class="md:col-span-2">
              <label class="text-sm">ชื่องาน</label>
              <input
                v-model="taskForm.title"
                placeholder="เช่น ส่งของให้ลูกค้า A"
                class="w-full border rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label class="text-sm">ผู้รับผิดชอบ</label>
              <select
                v-model.number="taskForm.employeeId"
                class="w-full border rounded-xl px-3 py-2"
              >
                <option disabled :value="0">เลือกพนักงาน</option>
                <option v-for="e in employees" :key="e.id" :value="e.id">
                  {{ e.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-sm">วันที่</label>
              <input
                type="date"
                v-model="taskForm.date"
                class="w-full border rounded-xl px-3 py-2"
              />
            </div>
            <div class="md:col-span-4">
              <label class="text-sm">รายละเอียด</label>
              <textarea
                v-model="taskForm.details"
                rows="3"
                class="w-full border rounded-xl px-3 py-2"
                placeholder="รายละเอียดงาน"
              ></textarea>
            </div>
          </div>
          <div class="mt-3 flex gap-2">
            <button
              @click="createTask"
              class="px-4 py-2 rounded-xl bg-blue-600 text-white"
            >
              มอบหมาย
            </button>
            <button @click="resetTaskForm" class="px-4 py-2 rounded-xl border">
              ล้างฟอร์ม
            </button>
          </div>
        </div>

        <div class="p-4 bg-white rounded-2xl shadow-sm border">
          <h3 class="font-semibold mb-3">งานตามวันที่</h3>
          <div class="flex flex-wrap gap-2 items-end">
            <input
              type="date"
              v-model="taskFilter.date"
              class="border rounded-xl px-3 py-2"
            />
            <input
              v-model="taskFilter.q"
              placeholder="ค้นหาชื่อ/รายละเอียด"
              class="border rounded-xl px-3 py-2"
            />
            <select
              v-model.number="taskFilter.employeeId"
              class="border rounded-xl px-3 py-2"
            >
              <option :value="0">พนักงานทั้งหมด</option>
              <option v-for="e in employees" :key="e.id" :value="e.id">
                {{ e.name }}
              </option>
            </select>
          </div>

          <div class="mt-4 grid md:grid-cols-2 gap-3">
            <div
              v-for="t in filteredTasks"
              :key="t.id"
              class="border rounded-2xl p-3 bg-white"
            >
              <div class="flex justify-between items-start gap-2">
                <div>
                  <p class="font-semibold">{{ t.title }}</p>
                  <p class="text-xs text-gray-500">
                    วันที่: {{ t.date }} • {{ getEmployeeName(t.employeeId) }}
                  </p>
                </div>
                <select
                  v-model="t.status"
                  @change="persist()"
                  class="text-sm border rounded-lg px-2 py-1"
                >
                  <option value="todo">ยังไม่เริ่ม</option>
                  <option value="in_progress">กำลังทำ</option>
                  <option value="done">เสร็จแล้ว</option>
                </select>
              </div>
              <p class="mt-2 text-sm">{{ t.details }}</p>
              <div class="mt-2 flex gap-2">
                <button
                  class="px-3 py-1.5 rounded-lg border text-sm"
                  @click="editTask(t)"
                >
                  แก้ไข
                </button>
                <button
                  class="px-3 py-1.5 rounded-lg border text-sm text-red-600"
                  @click="deleteTask(t.id)"
                >
                  ลบ
                </button>
              </div>
              <div v-if="t.signature" class="mt-2">
                <p class="text-xs text-green-700">มีลายเซ็นยืนยันแล้ว</p>
                <img :src="t.signature" class="h-10" alt="sig" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Attendance -->
      <section v-if="activeTab === 'attendance'" class="space-y-4">
        <div class="p-4 bg-white rounded-2xl shadow-sm border">
          <h2 class="font-semibold mb-3">เช็คชื่อเข้างาน</h2>
          <div class="flex flex-wrap gap-2 items-end">
            <label class="text-sm">วันที่</label>
            <input
              type="date"
              v-model="attendanceDate"
              class="border rounded-xl px-3 py-2"
            />
            <button
              @click="markAll('present')"
              class="px-3 py-2 rounded-xl border"
            >
              มาทั้งหมด
            </button>
            <button
              @click="markAll('absent')"
              class="px-3 py-2 rounded-xl border"
            >
              ขาดทั้งหมด
            </button>
          </div>

          <div class="mt-4 grid md:grid-cols-2 gap-3">
            <div
              v-for="e in employees"
              :key="e.id"
              class="p-3 border rounded-2xl"
            >
              <div class="flex justify-between items-center">
                <div>
                  <p class="font-semibold">{{ e.name }}</p>
                  <p class="text-xs text-gray-500">
                    สถานะ:
                    {{
                      attendanceLabel(
                        getAttendance(attendanceDate, e.id)?.status
                      ) || "ยังไม่ระบุ"
                    }}
                  </p>
                </div>
                <select
                  class="text-sm border rounded-lg px-2 py-1"
                  v-model="getOrInitAttendance(attendanceDate, e.id).status"
                  @change="persist()"
                >
                  <option value="present">มา</option>
                  <option value="late">สาย</option>
                  <option value="absent">ขาด</option>
                  <option value="leave">ลางาน</option>
                </select>
              </div>
              <div class="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <label class="text-xs text-gray-500">เวลาเข้า</label>
                  <input
                    type="time"
                    class="w-full border rounded-xl px-2 py-1"
                    v-model="getOrInitAttendance(attendanceDate, e.id).time"
                    @change="persist()"
                  />
                </div>
                <div>
                  <label class="text-xs text-gray-500">หมายเหตุ</label>
                  <input
                    class="w-full border rounded-xl px-2 py-1"
                    placeholder="เช่น รถติด"
                    v-model="getOrInitAttendance(attendanceDate, e.id).note"
                    @change="persist()"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-white rounded-2xl shadow-sm border">
          <h3 class="font-semibold mb-2">ประวัติการเข้าออก (ย่อ)</h3>
          <div class="overflow-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="text-left bg-gray-100">
                  <th class="p-2">วันที่</th>
                  <th class="p-2">พนักงาน</th>
                  <th class="p-2">สถานะ</th>
                  <th class="p-2">เวลา</th>
                  <th class="p-2">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in attendanceRows"
                  :key="row.key"
                  class="border-b"
                >
                  <td class="p-2">{{ row.date }}</td>
                  <td class="p-2">{{ row.employee }}</td>
                  <td class="p-2">{{ attendanceLabel(row.status) }}</td>
                  <td class="p-2">{{ row.time || "-" }}</td>
                  <td class="p-2">{{ row.note || "-" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Signature & Approval -->
      <section v-if="activeTab === 'signature'" class="space-y-4">
        <div class="p-4 bg-white rounded-2xl shadow-sm border">
          <h2 class="font-semibold mb-3">เซ็นยืนยันงานลูกน้อง</h2>
          <div class="grid md:grid-cols-3 gap-3">
            <div>
              <label class="text-sm">เลือกพนักงาน</label>
              <select
                v-model.number="sig.employeeId"
                class="w-full border rounded-xl px-3 py-2"
              >
                <option :value="0" disabled>เลือก</option>
                <option v-for="e in employees" :key="e.id" :value="e.id">
                  {{ e.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-sm">เลือกวันที่</label>
              <input
                type="date"
                v-model="sig.date"
                class="w-full border rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label class="text-sm">งาน</label>
              <select
                v-model.number="sig.taskId"
                class="w-full border rounded-xl px-3 py-2"
              >
                <option :value="0" disabled>เลือกงาน</option>
                <option v-for="t in tasksForSig" :key="t.id" :value="t.id">
                  {{ t.title }}
                </option>
              </select>
            </div>
          </div>

          <div class="mt-4">
            <div class="mt-4">
            <label class="text-sm mb-1 block">อัปโหลดรูปแทนลายเซ็น</label>
            <input type="file" accept="image/*" @change="handleSigUpload" class="border rounded-xl px-3 py-2 w-full" />
            <div v-if="sig.signatureImage" class="mt-2 flex items-center gap-2">
              <img :src="sig.signatureImage" class="h-16 rounded border" alt="signature preview" />
              <button class="px-2 py-1 text-sm border rounded text-red-600" @click="sig.signatureImage=null">ลบ</button>
            </div>
          </div>

          <div class="mt-4">
            <label class="text-sm mb-1 block">ข้อเสนอแนะ / คำติชม</label>
            <textarea v-model="sig.feedback" placeholder="พิมพ์ข้อเสนอแนะหรือคำติชมสำหรับพนักงาน" class="w-full border rounded-xl px-3 py-2" rows="3"></textarea>
          </div>

          <div class="mt-4">
            <button class="px-4 py-2 rounded-xl bg-blue-600 text-white" @click="saveSigWithFeedback" :disabled="!sig.taskId">บันทึกทั้งหมด</button>
          </div>
          </div>
        </div>

        <div class="p-4 bg-white rounded-2xl shadow-sm border">
          <h3 class="font-semibold mb-2">รายการที่เซ็นล่าสุด</h3>
          <ul class="space-y-2">
            <li
              v-for="t in signedTasks"
              :key="t.id"
              class="border rounded-xl p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
            >
              <div>
                <p class="font-medium">
                  {{ t.title }} • {{ getEmployeeName(t.employeeId) }}
                </p>
                <p class="text-xs text-gray-500">วันที่: {{ t.date }}</p>
                <p v-if="t.feedback" class="text-xs text-gray-700 mt-1">
                  ข้อเสนอแนะ: {{ t.feedback }}
                </p>
              </div>
              <div>
                <img
                  v-if="t.signature"
                  :src="t.signature"
                  class="h-10"
                  alt="sig"
                />
                <p v-else class="text-xs text-gray-400">ยังไม่มีลายเซ็น</p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";

function handleSigUpload(e){
  const file = e.target.files?.[0]
  if(!file) return
  const reader = new FileReader()
  reader.onload = function(evt){
    sig.signatureImage = evt.target.result // store temporarily
  }
  reader.readAsDataURL(file)
}

function saveSigWithFeedback(){
  if(!sig.taskId) return
  const i = store.tasks.findIndex(t=>t.id===sig.taskId)
  if(i>-1){
    if(sig.signatureImage){
      store.tasks[i].signature = sig.signatureImage
      sig.signatureImage = null
    }
    store.tasks[i].status = 'done'
    store.tasks[i].feedback = sig.feedback || ''
  }
}

// --- Tabs ---
const tabs = [
  { key: "dashboard", label: "ภาพรวม" },
  { key: "tasks", label: "มอบหมายงาน" },
  { key: "attendance", label: "เช็คชื่อ/ขาดลา" },
  { key: "signature", label: "เซ็นยืนยันงาน" },
];
const activeTab = ref("dashboard");

// --- Utilities ---
const today = new Date().toISOString().slice(0, 10);
const uid = () => Math.floor(Math.random() * 1e9);
const statusLabel = (s) =>
  ({ todo: "ยังไม่เริ่ม", in_progress: "กำลังทำ", done: "เสร็จแล้ว" }[s] ||
  "—");
const attendanceLabel = (s) =>
  ({ present: "มา", late: "สาย", absent: "ขาด", leave: "ลางาน" }[s] || s);

// --- Persistence ---
const LS_KEY = "daily_ops_store_v1";
const store = reactive({
  employees: [], // {id, name}
  tasks: [], // {id,title,details,date,employeeId,status,signature}
  attendance: {}, // { [date]: { [employeeId]: {status,time,note} } }
});

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) Object.assign(store, JSON.parse(raw));
  } catch (e) {
    console.error("Load error", e);
  }
}
function persist() {
  localStorage.setItem(LS_KEY, JSON.stringify(store));
}
watch(store, persist, { deep: true });

// --- Employees ---
const employees = computed(() => store.employees);
const newEmployee = ref("");
function addEmployee() {
  const name = newEmployee.value?.trim();
  if (!name) return;
  store.employees.push({ id: uid(), name });
  newEmployee.value = "";
}
function removeEmployee(id) {
  store.employees = store.employees.filter((e) => e.id !== id);
  // remove attendance entries for this employee
  for (const d in store.attendance) {
    if (store.attendance[d] && store.attendance[d][id])
      delete store.attendance[d][id];
  }
  // orphan tasks remain but show employee as (ลบแล้ว)
}
function getEmployeeName(id) {
  return store.employees.find((e) => e.id === id)?.name || "(ลบแล้ว)";
}

// --- Tasks ---
const taskForm = reactive({
  id: 0,
  title: "",
  details: "",
  date: today,
  employeeId: 0,
  status: "todo",
});
function resetTaskForm() {
  Object.assign(taskForm, {
    id: 0,
    title: "",
    details: "",
    date: today,
    employeeId: 0,
    status: "todo",
  });
}
function createTask() {
  if (!taskForm.title || !taskForm.employeeId) return;
  if (taskForm.id) {
    // update
    const i = store.tasks.findIndex((t) => t.id === taskForm.id);
    if (i > -1) store.tasks[i] = { ...store.tasks[i], ...taskForm };
  } else {
    store.tasks.push({
      id: uid(),
      title: taskForm.title,
      details: taskForm.details,
      date: taskForm.date,
      employeeId: taskForm.employeeId,
      status: taskForm.status,
      signature: null,
    });
  }
  resetTaskForm();
}
function editTask(t) {
  Object.assign(taskForm, JSON.parse(JSON.stringify(t)));
}
function deleteTask(id) {
  store.tasks = store.tasks.filter((t) => t.id !== id);
}

const taskFilter = reactive({ date: today, q: "", employeeId: 0 });
const filteredTasks = computed(() => {
  return store.tasks
    .filter(
      (t) =>
        (!taskFilter.date || t.date === taskFilter.date) &&
        (!taskFilter.employeeId || t.employeeId === taskFilter.employeeId) &&
        (!taskFilter.q ||
          (t.title + t.details)
            .toLowerCase()
            .includes(taskFilter.q.toLowerCase()))
    )
    .sort((a, b) => a.title.localeCompare(b.title));
});
const todaysTasks = computed(() => store.tasks.filter((t) => t.date === today));
const signedTasks = computed(() =>
  store.tasks
    .filter((t) => !!t.signature)
    .slice(-10)
    .reverse()
);

// --- Attendance ---
const attendanceDate = ref(today);
function getAttendance(date, employeeId) {
  return store.attendance?.[date]?.[employeeId];
}
function getOrInitAttendance(date, employeeId) {
  if (!store.attendance[date]) store.attendance[date] = {};
  if (!store.attendance[date][employeeId])
    store.attendance[date][employeeId] = {
      status: "present",
      time: "",
      note: "",
    };
  return store.attendance[date][employeeId];
}
function markAll(status) {
  employees.value.forEach((e) => {
    getOrInitAttendance(attendanceDate.value, e.id).status = status;
  });
  persist();
}
const attendanceRows = computed(() => {
  const rows = [];
  for (const d of Object.keys(store.attendance).sort()) {
    for (const id of Object.keys(store.attendance[d])) {
      const rec = store.attendance[d][id];
      rows.push({
        key: d + "-" + id,
        date: d,
        employee: getEmployeeName(Number(id)),
        status: rec.status,
        time: rec.time,
        note: rec.note,
      });
    }
  }
  return rows.slice(-200);
});

// --- Signature Pad ---
const sig = reactive({ employeeId: 0, date: today, taskId: 0 });
const sigCanvas = ref(null);
let ctx,
  drawing = false,
  last = { x: 0, y: 0 };

function fitCanvas() {
  const c = sigCanvas.value;
  if (!c) return;
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const rect = c.getBoundingClientRect();
  c.width = rect.width * ratio;
  c.height = rect.height * ratio;
  ctx = c.getContext("2d");
  ctx.scale(ratio, ratio);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#111";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, rect.width, rect.height);
}
function getPos(e) {
  const c = sigCanvas.value;
  const rect = c.getBoundingClientRect();
  const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;
  return { x, y };
}
function startDraw(e) {
  drawing = true;
  last = getPos(e);
  e.preventDefault();
}
function moveDraw(e) {
  if (!drawing) return;
  const p = getPos(e);
  ctx.beginPath();
  ctx.moveTo(last.x, last.y);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  last = p;
  e.preventDefault();
}
function endDraw() {
  drawing = false;
}
function clearSig() {
  fitCanvas();
}
function saveSig() {
  if (!sig.taskId) return;
  const dataUrl = sigCanvas.value.toDataURL("image/png");
  const i = store.tasks.findIndex((t) => t.id === sig.taskId);
  if (i > -1) {
    store.tasks[i].signature = dataUrl;
    store.tasks[i].status = "done";
  }
}

const tasksForSig = computed(() =>
  store.tasks.filter(
    (t) => t.employeeId === sig.employeeId && t.date === sig.date
  )
);

onMounted(async () => {
  load();
  await nextTick();
  fitCanvas();
  // pointer listeners
  const c = sigCanvas.value;
  c.addEventListener("mousedown", startDraw);
  c.addEventListener("mousemove", moveDraw);
  window.addEventListener("mouseup", endDraw);
  c.addEventListener("touchstart", startDraw, { passive: false });
  c.addEventListener("touchmove", moveDraw, { passive: false });
  window.addEventListener("touchend", endDraw);
  window.addEventListener("resize", fitCanvas);
});

document.addEventListener("DOMContentLoaded", function () {
  const bellButton = document.getElementById("bellButton");
  const notificationDropdown = document.getElementById("notificationDropdown");

  if (bellButton && notificationDropdown) {
    bellButton.addEventListener("click", function () {
      notificationDropdown.classList.toggle("hidden");
    });
  } else {
    console.warn("Bell button or notification dropdown not found in DOM.");
  }
});

// --- Import/Export ---
function exportData() {
  const blob = new Blob([JSON.stringify(store, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `daily_ops_${today}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
async function importData(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  try {
    Object.assign(store, JSON.parse(text));
    persist();
  } catch (err) {
    alert("ไฟล์ไม่ถูกต้อง");
  }
}
</script>

<style scoped>
/***** Basic responsive helpers *****/
</style>
