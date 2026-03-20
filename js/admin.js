const ADMIN_EMAILS = [
  "statemantech@gmail.com", // 🔴 CHANGE THIS
];

document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");

  const user = await getCurrentUser();

  /* ---------- NOT LOGGED IN ---------- */
  if (!user) {
    app.innerHTML = `
      <h2>Admin Login</h2>
      <p>You must login to access dashboard</p>
      <button onclick="loginWithGoogle()">Login with Google</button>
    `;
    return;
  }

  /* ---------- NOT ADMIN ---------- */
  if (!ADMIN_EMAILS.includes(user.email)) {
    app.innerHTML = `
      <h2>Access Denied ❌</h2>
      <p>${user.email} is not authorized</p>
    `;
    return;
  }

  /* ---------- ADMIN DASHBOARD ---------- */
  app.innerHTML = `
    <div class="top-bar">
      <div>
        <h2>📊 Admin Dashboard</h2>
        <p>Logged in as: ${user.email}</p>
      </div>
      <div>
        <button onclick="loadStudents()">Refresh</button>
        <button onclick="logout()">Logout</button>
      </div>
    </div>

    <h3>Total Students: <span id="totalCount">0</span></h3>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>School</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody id="studentTable"></tbody>
    </table>
  `;

  loadStudents();
});

/* ---------- LOAD STUDENTS ---------- */
window.loadStudents = async function () {
  const students = await getStudents();
  const table = document.getElementById("studentTable");
  const total = document.getElementById("totalCount");

  table.innerHTML = "";

  if (!students.length) {
    table.innerHTML = `<tr><td colspan="4">No records found</td></tr>`;
    total.innerText = 0;
    return;
  }

  total.innerText = students.length;

  students.forEach((s, index) => {
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${s.name}</td>
        <td>${s.school}</td>
        <td>${new Date(s.created_at).toLocaleString()}</td>
      </tr>
    `;

    table.innerHTML += row;
  });
};
