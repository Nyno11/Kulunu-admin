const UserData = {
  getUsers() {
    const saved = localStorage.getItem('kulunu_users');
    return saved ? JSON.parse(saved) : this.getDefaultUsers();
  },
  saveUsers(users) {
    localStorage.setItem('kulunu_users', JSON.stringify(users));
  },
  getDefaultUsers() {
    return [
      { id: 'USR-001', name: 'Amina Yusuf', email: 'amina@yours.com', role: 'traveler', joined: '2026-03-12', status: 'active', lastActive: '2 hours ago', note: 'Top reviewer' },
      { id: 'USR-002', name: 'Chike Obi', email: 'chike@kulunu.com', role: 'organizer', joined: '2026-03-21', status: 'active', lastActive: '1 hour ago', note: 'VIP organizer' },
      { id: 'USR-003', name: 'Nadia Bello', email: 'nadia@kulunu.com', role: 'attendee', joined: '2026-04-02', status: 'pending', lastActive: '3 days ago', note: 'Awaiting verification' },
      { id: 'USR-004', name: 'Samuel Eze', email: 'samuel@kulunu.com', role: 'traveler', joined: '2026-04-12', status: 'active', lastActive: '18 minutes ago', note: 'Premium traveler' },
      { id: 'USR-005', name: 'Tosin Ade', email: 'tosin@kulunu.com', role: 'organizer', joined: '2026-04-18', status: 'suspended', lastActive: '12 days ago', note: 'Under review' },
      { id: 'USR-006', name: 'Fatima Sani', email: 'fatima@kulunu.com', role: 'attendee', joined: '2026-04-21', status: 'active', lastActive: '4 hours ago', note: 'New event guest' },
      { id: 'USR-007', name: 'Kelechi Nnaji', email: 'kelechi@kulunu.com', role: 'traveler', joined: '2026-04-25', status: 'active', lastActive: '12 minutes ago', note: 'Frequent booker' },
      { id: 'USR-008', name: 'Bisi Ajayi', email: 'bisi@kulunu.com', role: 'attendee', joined: '2026-04-27', status: 'pending', lastActive: '6 hours ago', note: 'Payment review' },
      { id: 'USR-009', name: 'Olumide Kayode', email: 'olumide@kulunu.com', role: 'organizer', joined: '2026-05-01', status: 'active', lastActive: '30 minutes ago', note: 'Featured host' },
      { id: 'USR-010', name: 'Tara Akintola', email: 'tara@kulunu.com', role: 'traveler', joined: '2026-05-04', status: 'active', lastActive: '1 hour ago', note: 'Mobile app power user' },
      { id: 'USR-011', name: 'Benjamin Nwosu', email: 'benjamin@kulunu.com', role: 'attendee', joined: '2026-05-06', status: 'pending', lastActive: '1 day ago', note: 'Needs ticket verification' }
    ];
  }
};

const elements = {
  totalUsers: document.getElementById('totalUsers'),
  totalOrganizers: document.getElementById('totalOrganizers'),
  totalTravelers: document.getElementById('totalTravelers'),
  pendingApprovals: document.getElementById('pendingApprovals'),
  roleTraveler: document.getElementById('roleTraveler'),
  roleOrganizer: document.getElementById('roleOrganizer'),
  roleAttendee: document.getElementById('roleAttendee'),
  recentUsers: document.getElementById('recentUsers'),
  userTableBody: document.getElementById('userTableBody'),
  roleFilter: document.getElementById('roleFilter'),
  statusFilter: document.getElementById('statusFilter'),
  userSearch: document.getElementById('userSearch'),
  sidebarToggle: document.getElementById('sidebarToggle'),
  sidebarClose: document.getElementById('sidebarClose'),
  sidebar: document.getElementById('sidebar'),
  userModal: document.getElementById('userModal'),
  modalBody: document.getElementById('modalBody')
};

let users = [];

function initializeUserDashboard() {
  users = UserData.getUsers();
  populateMetrics();
  populateUsersTable(users);
  populateRecentUsers();
  setupFilters();
  setupSidebarToggle();
  updateRoleDistribution();
}

function populateMetrics() {
  const organizerCount = users.filter(user => user.role === 'organizer').length;
  const travelerCount = users.filter(user => user.role === 'traveler').length;
  const pendingCount = users.filter(user => user.status === 'pending').length;

  elements.totalUsers.textContent = users.length;
  elements.totalOrganizers.textContent = organizerCount;
  elements.totalTravelers.textContent = travelerCount;
  elements.pendingApprovals.textContent = pendingCount;
  elements.roleOrganizer.textContent = `${organizerCount}`;
  elements.roleTraveler.textContent = `${travelerCount}`;
  elements.roleAttendee.textContent = `${users.filter(user => user.role === 'attendee').length}`;
}

function populateUsersTable(data) {
  elements.userTableBody.innerHTML = data.map(user => {
    const initials = user.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
    return `
      <tr>
        <td class="checkbox-column">
          <input type="checkbox" value="${user.id}" class="row-checkbox" onclick="toggleRowSelection(event, '${user.id}')" />
        </td>
        <td>
          <div class="user-avatar-cell">
            <div class="avatar">${initials}</div>
            <div class="user-name-cell">
              <strong>${user.name}</strong>
              <small>${user.email}</small>
            </div>
          </div>
        </td>
        <td><span class="badge-pill ${user.role}">${user.role}</span></td>
        <td>${user.email}</td>
        <td>${formatDate(user.joined)}</td>
        <td><span class="badge-pill ${user.status}">${user.status}</span></td>
        <td>${user.lastActive}</td>
        <td>
          <div class="action-group">
            <button class="action-btn" onclick="viewUser('${user.id}')">Details</button>
            <button class="action-btn" onclick="openUserForm('${user.id}')">Edit</button>
            <button class="action-btn" onclick="toggleStatus('${user.id}')">${user.status === 'suspended' ? 'Restore' : 'Suspend'}</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (!data.length) {
    elements.userTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-row">No matching users found.</td>
      </tr>
    `;
  }

  updateSelectionUI();
}

function populateRecentUsers() {
  const latest = [...users].sort((a, b) => new Date(b.joined) - new Date(a.joined)).slice(0, 5);
  elements.recentUsers.innerHTML = latest.map(user => {
    return `
      <div class="recent-item">
        <strong>${user.name}</strong>
        <span>${capitalize(user.role)} • Joined ${formatDate(user.joined)}</span>
        <span class="badge-pill ${user.status}">${user.status}</span>
      </div>
    `;
  }).join('');
}

function setupFilters() {
  elements.userSearch.addEventListener('input', applyFilters);
  elements.roleFilter.addEventListener('change', applyFilters);
  elements.statusFilter.addEventListener('change', applyFilters);
  document.getElementById('selectAllCheckbox').addEventListener('change', toggleSelectAll);
  document.getElementById('headerSelectAll').addEventListener('change', toggleSelectAll);
  document.getElementById('bulkActivate').addEventListener('click', bulkActivateSelected);
  document.getElementById('bulkSuspend').addEventListener('click', bulkSuspendSelected);
  document.getElementById('bulkExport').addEventListener('click', exportSelected);
}

function applyFilters() {
  const query = elements.userSearch.value.toLowerCase().trim();
  const role = elements.roleFilter.value;
  const status = elements.statusFilter.value;

  const filtered = users.filter(user => {
    const matchesQuery = `${user.name} ${user.email}`.toLowerCase().includes(query);
    const matchesRole = role ? user.role === role : true;
    const matchesStatus = status ? user.status === status : true;
    return matchesQuery && matchesRole && matchesStatus;
  });

  populateUsersTable(filtered);
  updateRoleDistribution(filtered);
}

function setupSidebarToggle() {
  elements.sidebarToggle?.addEventListener('click', () => {
    elements.sidebar.classList.add('open');
  });

  elements.sidebarClose?.addEventListener('click', () => {
    elements.sidebar.classList.remove('open');
  });

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      const section = item.dataset.section;
      if (section === 'overview') {
        elements.roleFilter.value = '';
        elements.statusFilter.value = '';
        elements.userSearch.value = '';
      } else if (['organizers', 'travelers', 'attendees'].includes(section)) {
        elements.roleFilter.value = section === 'attendees' ? 'attendee' : section.slice(0, -1);
        elements.statusFilter.value = '';
      } else if (section === 'settings') {
        openSettingsNotice();
      }
      applyFilters();
      if (window.innerWidth <= 992) elements.sidebar.classList.remove('open');
    });
  });
}

function openSettingsNotice() {
  alert('Settings will be live in the next release. For now, use the user directory tools above.');
}

function toggleSelectAll(event) {
  const checked = event.target.checked;
  document.querySelectorAll('.row-checkbox').forEach(checkbox => {
    checkbox.checked = checked;
  });
  updateSelectionUI();
}

function toggleRowSelection(event) {
  event.stopPropagation();
  updateSelectionUI();
}

function updateSelectionUI() {
  const selected = document.querySelectorAll('.row-checkbox:checked').length;
  const total = document.querySelectorAll('.row-checkbox').length;
  document.getElementById('bulkActionCount').textContent = `${selected} user${selected === 1 ? '' : 's'} selected`;
  const selectAllCheckbox = document.getElementById('selectAllCheckbox');
  const headerSelectAll = document.getElementById('headerSelectAll');
  selectAllCheckbox.checked = selected === total && total > 0;
  headerSelectAll.checked = selected === total && total > 0;
  selectAllCheckbox.indeterminate = selected > 0 && selected < total;
  headerSelectAll.indeterminate = selected > 0 && selected < total;
}

function bulkActivateSelected() {
  changeSelectedUsersStatus('active');
}

function bulkSuspendSelected() {
  changeSelectedUsersStatus('suspended');
}

function changeSelectedUsersStatus(status) {
  const checkedIds = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(ch => ch.value);
  if (!checkedIds.length) {
    alert('Select users to manage.');
    return;
  }
  users = users.map(user => checkedIds.includes(user.id) ? { ...user, status } : user);
  UserData.saveUsers(users);
  applyFilters();
  populateMetrics();
  populateRecentUsers();
}

function exportUsers() {
  exportCsv(users, 'kulunu_user_directory.csv');
}

function exportSelected() {
  const selected = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(ch => ch.value);
  if (!selected.length) {
    alert('Select at least one user to export.');
    return;
  }
  const selectedUsers = users.filter(user => selected.includes(user.id));
  exportCsv(selectedUsers, 'kulunu_user_selection.csv');
}

function exportCsv(data, filename) {
  const header = ['ID', 'Name', 'Email', 'Role', 'Status', 'Joined', 'Last Active'];
  const rows = data.map(user => [user.id, user.name, user.email, user.role, user.status, user.joined, user.lastActive]);
  const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function viewUser(userId) {
  const user = users.find(item => item.id === userId);
  if (!user) return;
  elements.modalBody.innerHTML = `
    <section class="modal-details">
      <div class="detail-row"><span>Name</span><strong>${user.name}</strong></div>
      <div class="detail-row"><span>Email</span><strong>${user.email}</strong></div>
      <div class="detail-row"><span>Role</span><strong>${capitalize(user.role)}</strong></div>
      <div class="detail-row"><span>Status</span><strong>${capitalize(user.status)}</strong></div>
      <div class="detail-row"><span>Joined</span><strong>${formatDate(user.joined)}</strong></div>
      <div class="detail-row"><span>Last Active</span><strong>${user.lastActive}</strong></div>
      <div class="detail-row"><span>Notes</span><strong>${user.note}</strong></div>
    </section>
    <div class="action-group modal-actions">
      <button class="action-btn" onclick="closeUserModal()">Close</button>
      <button class="action-btn" onclick="openUserForm('${user.id}')">Edit Profile</button>
      <button class="action-btn" onclick="toggleStatus('${user.id}')">${user.status === 'suspended' ? 'Restore account' : 'Suspend account'}</button>
    </div>
  `;
  elements.userModal.classList.add('open');
}

function openUserForm(userId = null) {
  const isEdit = Boolean(userId);
  const user = isEdit ? users.find(item => item.id === userId) : null;

  elements.modalBody.innerHTML = `
    <form id="userForm" class="modal-form">
      <h3 id="userFormTitle">${isEdit ? 'Edit user profile' : 'Invite new user'}</h3>
      <label>Name<input type="text" id="formName" value="${user ? user.name : ''}" required></label>
      <label>Email<input type="email" id="formEmail" value="${user ? user.email : ''}" required></label>
      <label>Role
        <select id="formRole" required>
          <option value="traveler" ${user && user.role === 'traveler' ? 'selected' : ''}>Traveler</option>
          <option value="organizer" ${user && user.role === 'organizer' ? 'selected' : ''}>Organizer</option>
          <option value="attendee" ${user && user.role === 'attendee' ? 'selected' : ''}>Attendee</option>
        </select>
      </label>
      <label>Status
        <select id="formStatus" required>
          <option value="active" ${user && user.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="pending" ${user && user.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="suspended" ${user && user.status === 'suspended' ? 'selected' : ''}>Suspended</option>
        </select>
      </label>
      <label>Notes<textarea id="formNote" rows="4">${user ? user.note : ''}</textarea></label>
      <div class="modal-actions">
        <button type="button" class="action-btn" onclick="closeUserModal()">Cancel</button>
        <button type="submit" class="action-btn primary" id="userSaveButton">${isEdit ? 'Save Changes' : 'Create User'}</button>
      </div>
    </form>
  `;

  document.getElementById('userForm').addEventListener('submit', function (event) {
    event.preventDefault();
    saveUser(userId);
  });

  elements.userModal.classList.add('open');
}

function saveUser(userId) {
  const name = document.getElementById('formName').value.trim();
  const email = document.getElementById('formEmail').value.trim();
  const role = document.getElementById('formRole').value;
  const status = document.getElementById('formStatus').value;
  const note = document.getElementById('formNote').value.trim();

  if (!name || !email) {
    alert('A name and email are required.');
    return;
  }

  if (userId) {
    users = users.map(user => user.id === userId ? { ...user, name, email, role, status, note } : user);
  } else {
    const newUser = {
      id: generateUserId(),
      name,
      email,
      role,
      joined: new Date().toISOString().split('T')[0],
      status,
      lastActive: 'Just now',
      note: note || 'Invited from admin panel'
    };
    users.unshift(newUser);
  }

  UserData.saveUsers(users);
  populateMetrics();
  applyFilters();
  populateRecentUsers();
  closeUserModal();
}

function generateUserId() {
  const nextId = users.length + 1;
  return `USR-${String(nextId).padStart(3, '0')}`;
}

function toggleStatus(userId) {
  users = users.map(user => {
    if (user.id === userId) {
      const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
      return { ...user, status: nextStatus };
    }
    return user;
  });
  UserData.saveUsers(users);
  populateMetrics();
  applyFilters();
  populateRecentUsers();
  closeUserModal();
}

function openNotificationPanel() {
  alert('Notification center is under development.');
}

function showAllRecent() {
  alert('Recent signup analytics coming soon.');
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function updateRoleDistribution(dataSet = users) {
  const total = dataSet.length || 1;
  const travelerCount = dataSet.filter(user => user.role === 'traveler').length;
  const organizerCount = dataSet.filter(user => user.role === 'organizer').length;
  const attendeeCount = dataSet.filter(user => user.role === 'attendee').length;
  const chart = document.getElementById('roleDistribution');
  chart.innerHTML = `
    <div class="distribution-row"><span>Travelers</span><strong>${travelerCount}</strong></div>
    <div class="distribution-track"><div class="distribution-fill" style="width:${(travelerCount / total) * 100}%"></div></div>
    <div class="distribution-row"><span>Organizers</span><strong>${organizerCount}</strong></div>
    <div class="distribution-track"><div class="distribution-fill organizer" style="width:${(organizerCount / total) * 100}%"></div></div>
    <div class="distribution-row"><span>Attendees</span><strong>${attendeeCount}</strong></div>
    <div class="distribution-track"><div class="distribution-fill attendee" style="width:${(attendeeCount / total) * 100}%"></div></div>
  `;
}

function closeUserModal() {
  elements.userModal.classList.remove('open');
}

window.addEventListener('DOMContentLoaded', initializeUserDashboard);
