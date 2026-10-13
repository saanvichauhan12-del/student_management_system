const STORAGE_KEY = "studentHubRecords";
const SESSION_KEY = "studentHubAddedThisSession";
const tableBody = document.getElementById("studentTableBody");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const modalBackdrop = document.getElementById("modalBackdrop");
const studentForm = document.getElementById("studentForm");
const modalTitle = document.getElementById("modalTitle");
const formError = document.getElementById("formError");
const toast = document.getElementById("toast");

let students = loadStudents();
let addedThisSession = 0;
let toastTimer;

function loadStudents() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}
function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase();
}
function renderStudents() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = students.filter(student =>
    [student.name, student.roll, student.course, student.email, student.phone]
      .some(value => String(value || "").toLowerCase().includes(query))
  );

  tableBody.innerHTML = filtered.map(student => `
    <tr>
      <td><div class="student-cell"><span class="avatar">${escapeHTML(initials(student.name))}</span><span>${escapeHTML(student.name)}</span></div></td>
      <td>${escapeHTML(student.roll)}</td>
      <td><span class="course-pill">${escapeHTML(student.course)}</span></td>
      <td>${escapeHTML(student.email || "—")}</td>
      <td>${escapeHTML(student.phone || "—")}</td>
      <td><div class="action-buttons">
        <button class="small-btn" data-action="edit" data-id="${escapeHTML(student.id)}">Edit</button>
        <button class="small-btn delete" data-action="delete" data-id="${escapeHTML(student.id)}">Delete</button>
      </div></td>
    </tr>`).join("");

  emptyState.hidden = filtered.length > 0;
  if (students.length > 0 && filtered.length === 0) {
    emptyState.hidden = false;
    emptyState.querySelector("h3").textContent = "No matching students";
    emptyState.querySelector("p").textContent = "Try another name, roll number, or course.";
    document.getElementById("addStudentEmpty").hidden = true;
  } else {
    emptyState.querySelector("h3").textContent = "No students yet";
    emptyState.querySelector("p").textContent = "Add your first student to start building your directory.";
    document.getElementById("addStudentEmpty").hidden = false;
  }

  document.getElementById("totalCount").textContent = students.length;
  document.getElementById("courseCount").textContent = new Set(students.map(s => s.course.trim().toLowerCase()).filter(Boolean)).size;
  document.getElementById("recentCount").textContent = addedThisSession;
  document.getElementById("recordSummary").textContent = `Showing ${filtered.length} of ${students.length} record${students.length === 1 ? "" : "s"}`;
}
function openModal(student = null) {
  studentForm.reset();
  formError.textContent = "";
  document.getElementById("studentId").value = student ? student.id : "";
  modalTitle.textContent = student ? "Edit student" : "Add a student";
  document.getElementById("saveStudentBtn").textContent = student ? "Update student" : "Save student";
  if (student) {
    document.getElementById("name").value = student.name;
    document.getElementById("roll").value = student.roll;
    document.getElementById("course").value = student.course;
    document.getElementById("email").value = student.email || "";
    document.getElementById("phone").value = student.phone || "";
  }
  modalBackdrop.hidden = false;
  document.getElementById("name").focus();
}
function closeModal() {
  modalBackdrop.hidden = true;
  studentForm.reset();
  formError.textContent = "";
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function getFormValues() {
  return {
    name: document.getElementById("name").value.trim(),
    roll: document.getElementById("roll").value.trim(),
    course: document.getElementById("course").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim()
  };
}

document.getElementById("addStudentTop").addEventListener("click", () => openModal());
document.getElementById("addStudentEmpty").addEventListener("click", () => openModal());
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelModal").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", event => {
  if (event.target === modalBackdrop) closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !modalBackdrop.hidden) closeModal();
});
searchInput.addEventListener("input", renderStudents);

studentForm.addEventListener("submit", event => {
  event.preventDefault();
  const values = getFormValues();
  const editingId = document.getElementById("studentId").value;

  if (!values.name || !values.roll || !values.course) {
    formError.textContent = "Please fill in the name, roll number, and course.";
    return;
  }
  const duplicate = students.some(student =>
    student.roll.toLowerCase() === values.roll.toLowerCase() && student.id !== editingId
  );
  if (duplicate) {
    formError.textContent = "That roll number already exists. Please use a unique roll number.";
    return;
  }

  if (editingId) {
    students = students.map(student => student.id === editingId ? { ...student, ...values } : student);
    saveStudents();
    closeModal();
    renderStudents();
    showToast("Student details updated.");
  } else {
    students.unshift({ id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), ...values, createdAt: new Date().toISOString() });
    addedThisSession += 1;
    saveStudents();
    closeModal();
    renderStudents();
    showToast("Student added successfully.");
  }
});

tableBody.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const student = students.find(item => item.id === button.dataset.id);
  if (!student) return;

  if (button.dataset.action === "edit") {
    openModal(student);
  } else if (button.dataset.action === "delete") {
    if (confirm(`Delete the record for ${student.name}? This cannot be undone.`)) {
      students = students.filter(item => item.id !== student.id);
      saveStudents();
      renderStudents();
      showToast("Student record deleted.");
    }
  }
});

renderStudents();
