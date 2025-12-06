// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// Global state
let currentPage = 1;
const itemsPerPage = 10;
let patientsData = [];
let searchTerm = '';
let filterStatus = '';

// DOM Elements
const elements = {
    patientsTableBody: document.getElementById('patients-table-body'),
    searchInput: document.getElementById('search-input'),
    filterStatus: document.getElementById('filter-status'),
    totalPatients: document.getElementById('total-patients'),
    totalDoctors: document.getElementById('total-doctors'),
    totalAppointments: document.getElementById('total-appointments'),
    todayAppointments: document.getElementById('today-appointments'),
    patientModal: document.getElementById('patient-modal'),
    patientForm: document.getElementById('patient-form'),
    modalTitle: document.getElementById('modal-title'),
    pagination: document.getElementById('pagination'),
    navItems: document.querySelectorAll('.nav-item'),
    sectionTitle: document.getElementById('section-title')
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadDashboardData();
    loadPatients();
});

// Event Listeners
function initializeEventListeners() {
    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Search input
    elements.searchInput.addEventListener('input', function() {
        searchTerm = this.value.toLowerCase();
        currentPage = 1;
        loadPatients();
    });

    // Filter status
    elements.filterStatus.addEventListener('change', function() {
        filterStatus = this.value;
        currentPage = 1;
        loadPatients();
    });

    // Add patient button
    document.getElementById('add-patient-btn')?.addEventListener('click', () => {
        openPatientModal();
    });

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal();
        });
    });

    // Patient form submission
    elements.patientForm.addEventListener('submit', handlePatientFormSubmit);

    // Close modal on outside click
    elements.patientModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// Switch between sections
function switchSection(section) {
    // Update active nav item
    elements.navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === section) {
            item.classList.add('active');
        }
    });

    // Update section title
    const titles = {
        patients: 'Patients',
        appointments: 'Appointments',
        telephone: 'Telephone',
        telefax: 'Telefax',
        settings: 'Settings'
    };
    elements.sectionTitle.textContent = titles[section];

    // Show/hide sections
    document.querySelectorAll('.section-content').forEach(div => {
        div.style.display = 'none';
    });

    // Show selected section
    const sectionElement = document.getElementById(`${section}-section`);
    if (sectionElement) {
        sectionElement.style.display = 'block';
    }

    // Load section data
    if (section === 'patients') {
        loadPatients();
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const [patients, doctors, appointments] = await Promise.all([
            fetchData('/patients'),
            fetchData('/doctors'),
            fetchData('/appointments')
        ]);

        elements.totalPatients.textContent = patients.length || 0;
        elements.totalDoctors.textContent = doctors.length || 0;
        elements.totalAppointments.textContent = appointments.length || 0;

        // Count today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todayCount = appointments.filter(apt => 
            apt.startAt && apt.startAt.startsWith(today)
        ).length;
        elements.todayAppointments.textContent = todayCount;
    } catch (error) {
        showToast('Error loading dashboard data', 'error');
    }
}

// Load patients
async function loadPatients() {
    try {
        patientsData = await fetchData('/patients');
        renderPatientsTable();
        renderPagination();
    } catch (error) {
        showToast('Error loading patients', 'error');
        elements.patientsTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #e74c3c;">
                    <i class="fas fa-exclamation-circle" style="font-size: 24px; margin-bottom: 10px;"></i>
                    <p>Failed to load patients. Please check your connection.</p>
                </td>
            </tr>
        `;
    }
}

// Render patients table
function renderPatientsTable() {
    if (!elements.patientsTableBody) return;

    // Filter data
    let filteredPatients = patientsData.filter(patient => {
        const matchesSearch = searchTerm === '' || 
            patient.name.toLowerCase().includes(searchTerm) ||
            patient.email.toLowerCase().includes(searchTerm) ||
            patient.phone.includes(searchTerm);
        
        const matchesStatus = filterStatus === '' || 
            (filterStatus === 'active' && patient.status !== 'inactive') ||
            (filterStatus === 'inactive' && patient.status === 'inactive');
        
        return matchesSearch && matchesStatus;
    });

    // Paginate
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pagePatients = filteredPatients.slice(startIndex, endIndex);

    // Clear table
    elements.patientsTableBody.innerHTML = '';

    // Check if no patients
    if (pagePatients.length === 0) {
        elements.patientsTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fas fa-user-slash" style="font-size: 24px; margin-bottom: 10px;"></i>
                    <p>No patients found${searchTerm ? ' for "' + searchTerm + '"' : ''}</p>
                </td>
            </tr>
        `;
        return;
    }

    // Render patients
    pagePatients.forEach(patient => {
        const row = document.createElement('tr');
        
        // Format date
        const birthDate = patient.birthDate ? 
            new Date(patient.birthDate).toLocaleDateString() : 'N/A';
        
        // Status
        const status = patient.status || 'active';
        const statusClass = status === 'inactive' ? 'status-inactive' : 'status-active';
        const statusText = status === 'inactive' ? 'Inactive' : 'Active';

        row.innerHTML = `
            <td>${patient.id}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="user-avatar" style="width: 32px; height: 32px; font-size: 14px;">
                        ${patient.name.charAt(0)}
                    </div>
                    <span style="font-weight: 500;">${patient.name}</span>
                </div>
            </td>
            <td>${patient.phone || 'N/A'}</td>
            <td>${patient.email}</td>
            <td>${birthDate}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editPatient(${patient.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deletePatient(${patient.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        elements.patientsTableBody.appendChild(row);
    });
}

// Render pagination
function renderPagination() {
    const filteredPatients = patientsData.filter(patient => {
        const matchesSearch = searchTerm === '' || 
            patient.name.toLowerCase().includes(searchTerm) ||
            patient.email.toLowerCase().includes(searchTerm) ||
            patient.phone.includes(searchTerm);
        
        const matchesStatus = filterStatus === '' || 
            (filterStatus === 'active' && patient.status !== 'inactive') ||
            (filterStatus === 'inactive' && patient.status === 'inactive');
        
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
    
    if (totalPages <= 1) {
        elements.pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `
            <button class="page-btn" onclick="changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="page-btn active">${i}</button>`;
        } else if (
            i === 1 || 
            i === totalPages || 
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            paginationHTML += `<button class="page-btn" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span class="page-dots">...</span>`;
        }
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `
            <button class="page-btn" onclick="changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }

    elements.pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    currentPage = page;
    loadPatients();
}

// Open patient modal
function openPatientModal(patientId = null) {
    elements.modalTitle.textContent = patientId ? 'Edit Patient' : 'Add New Patient';
    elements.patientForm.reset();
    elements.patientForm.dataset.patientId = patientId || '';
    
    // If editing, load patient data
    if (patientId) {
        const patient = patientsData.find(p => p.id === patientId);
        if (patient) {
            document.getElementById('patient-name').value = patient.name || '';
            document.getElementById('patient-email').value = patient.email || '';
            document.getElementById('patient-phone').value = patient.phone || '';
            document.getElementById('patient-birthdate').value = patient.birthDate || '';
            document.getElementById('patient-gender').value = patient.gender || 'male';
            document.getElementById('patient-address').value = patient.address || '';
            document.getElementById('patient-status').value = patient.status || 'active';
        }
    }
    
    elements.patientModal.classList.add('active');
}

// Close modal
function closeModal() {
    elements.patientModal.classList.remove('active');
    elements.patientForm.reset();
    delete elements.patientForm.dataset.patientId;
}

// Handle patient form submission
async function handlePatientFormSubmit(e) {
    e.preventDefault();
    
    const patientId = elements.patientForm.dataset.patientId;
    const patientData = {
        name: document.getElementById('patient-name').value,
        email: document.getElementById('patient-email').value,
        phone: document.getElementById('patient-phone').value,
        birthDate: document.getElementById('patient-birthdate').value,
        gender: document.getElementById('patient-gender').value,
        address: document.getElementById('patient-address').value,
        status: document.getElementById('patient-status').value
    };
    
    try {
        let response;
        if (patientId) {
            // Update patient
            response = await updatePatient(patientId, patientData);
            showToast('Patient updated successfully!', 'success');
        } else {
            // Create patient
            response = await createPatient(patientData);
            showToast('Patient created successfully!', 'success');
        }
        
        closeModal();
        loadPatients();
        loadDashboardData();
    } catch (error) {
        showToast('Error saving patient: ' + error.message, 'error');
    }
}

// Edit patient
function editPatient(patientId) {
    openPatientModal(patientId);
}

// Delete patient
async function deletePatient(patientId) {
    const patient = patientsData.find(p => p.id === patientId);
    if (!patient) return;
    
    if (!confirm(`Are you sure you want to delete patient: ${patient.name}?`)) {
        return;
    }
    
    try {
        await deleteData(`/patients/${patientId}`);
        showToast('Patient deleted successfully!', 'success');
        loadPatients();
        loadDashboardData();
    } catch (error) {
        showToast('Error deleting patient: ' + error.message, 'error');
    }
}

// API Helper Functions
async function fetchData(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
}

async function createPatient(data) {
    const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create patient');
    return await response.json();
}

async function updatePatient(id, data) {
    const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update patient');
    return await response.json();
}

async function deleteData(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete');
    return await response.json();
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}