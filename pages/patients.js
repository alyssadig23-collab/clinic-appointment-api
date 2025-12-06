// Patients page functionality
let patientsData = [];
let currentPatientsPage = 1;
const patientsPerPage = 10;

async function loadPatients() {
    try {
        patientsData = await ApiService.getPatients();
        globalState.patients = patientsData;
        renderPatientsTable();
    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

function renderPatientsTable() {
    const tableBody = document.querySelector('#patients-table tbody');
    const pagination = document.getElementById('pagination-controls');
    
    if (!tableBody) return;
    
    // Filter patients based on search term
    let filteredPatients = patientsData;
    if (globalState.searchTerm) {
        filteredPatients = patientsData.filter(patient => 
            patient.name.toLowerCase().includes(globalState.searchTerm) ||
            patient.email.toLowerCase().includes(globalState.searchTerm) ||
            patient.phone.includes(globalState.searchTerm)
        );
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
    const startIndex = (currentPatientsPage - 1) * patientsPerPage;
    const endIndex = startIndex + patientsPerPage;
    const pagePatients = filteredPatients.slice(startIndex, endIndex);
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Render patients
    pagePatients.forEach(patient => {
        const row = document.createElement('tr');
        
        // Format birth date
        const birthDate = new Date(patient.birthDate);
        const formattedDate = birthDate.toLocaleDateString();
        
        row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.email}</td>
            <td>${patient.phone}</td>
            <td>${formattedDate}</td>
            <td class="action-buttons-cell">
                <button class="action-btn edit" data-id="${patient.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" data-id="${patient.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Render pagination
    renderPagination(pagination, currentPatientsPage, totalPages, 'patients');
    
    // Add event listeners to action buttons
    addPatientActionListeners();
}

function renderPagination(container, currentPage, totalPages, type) {
    if (!container || totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" data-page="${currentPage - 1}" data-type="${type}">&laquo;</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="page-btn active" data-page="${i}" data-type="${type}">${i}</button>`;
        } else if (
            i === 1 || 
            i === totalPages || 
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            paginationHTML += `<button class="page-btn" data-page="${i}" data-type="${type}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span class="page-dots">...</span>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" data-page="${currentPage + 1}" data-type="${type}">&raquo;</button>`;
    }
    
    container.innerHTML = paginationHTML;
    
    // Add event listeners to pagination buttons
    const pageButtons = container.querySelectorAll('.page-btn');
    pageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const page = parseInt(this.getAttribute('data-page'));
            const type = this.getAttribute('data-type');
            
            if (type === 'patients') {
                currentPatientsPage = page;
                renderPatientsTable();
            } else if (type === 'doctors') {
                currentDoctorsPage = page;
                renderDoctorsTable();
            } else if (type === 'appointments') {
                currentAppointmentsPage = page;
                renderAppointmentsTable();
            }
        });
    });
}

function addPatientActionListeners() {
    // Edit buttons
    const editButtons = document.querySelectorAll('.action-btn.edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const patientId = this.getAttribute('data-id');
            openPatientModal(patientId);
        });
    });
    
    // Delete buttons
    const deleteButtons = document.querySelectorAll('.action-btn.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const patientId = this.getAttribute('data-id');
            deletePatient(patientId);
        });
    });
}

async function openPatientModal(patientId = null) {
    let patient = null;
    let title = 'Add New Patient';
    
    if (patientId) {
        patient = await ApiService.getPatient(patientId);
        title = 'Edit Patient';
    }
    
    Modal.open({
        title: title,
        content: `
            <form id="patient-form">
                <div class="form-group">
                    <label class="form-label" for="patient-name">Full Name *</label>
                    <input type="text" id="patient-name" class="form-control" required 
                           value="${patient ? patient.name : ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="patient-email">Email Address *</label>
                    <input type="email" id="patient-email" class="form-control" required
                           value="${patient ? patient.email : ''}">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="patient-phone">Phone Number *</label>
                        <input type="tel" id="patient-phone" class="form-control" required
                               value="${patient ? patient.phone : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="patient-birthdate">Birth Date *</label>
                        <input type="date" id="patient-birthdate" class="form-control" required
                               value="${patient ? patient.birthDate : ''}">
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" id="cancel-patient-btn">Cancel</button>
                    <button type="submit" class="btn btn-primary">${patient ? 'Update' : 'Create'} Patient</button>
                </div>
            </form>
        `,
        onOpen: () => {
            const form = document.getElementById('patient-form');
            const cancelBtn = document.getElementById('cancel-patient-btn');
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const patientData = {
                    name: document.getElementById('patient-name').value,
                    email: document.getElementById('patient-email').value,
                    phone: document.getElementById('patient-phone').value,
                    birthDate: document.getElementById('patient-birthdate').value
                };
                
                if (patient) {
                    // Update existing patient
                    await ApiService.updatePatient(patient.id, patientData);
                } else {
                    // Create new patient
                    await ApiService.createPatient(patientData);
                }
                
                Modal.close();
                loadPatients();
                loadDashboardData(); // Refresh dashboard counts
            });
            
            cancelBtn.addEventListener('click', () => {
                Modal.close();
            });
        }
    });
}

async function deletePatient(patientId) {
    const patient = patientsData.find(p => p.id === parseInt(patientId));
    
    if (!patient) return;
    
    // Show confirmation dialog
    Modal.open({
        title: 'Confirm Delete',
        content: `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <h3>Are you sure?</h3>
                <p>You are about to delete patient: <strong>${patient.name}</strong></p>
                <p>This action cannot be undone.</p>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" id="cancel-delete-btn">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirm-delete-btn">Delete Patient</button>
                </div>
            </div>
        `,
        onOpen: () => {
            const cancelBtn = document.getElementById('cancel-delete-btn');
            const confirmBtn = document.getElementById('confirm-delete-btn');
            
            cancelBtn.addEventListener('click', () => {
                Modal.close();
            });
            
            confirmBtn.addEventListener('click', async () => {
                const success = await ApiService.deletePatient(patientId);
                if (success) {
                    Modal.close();
                    loadPatients();
                    loadDashboardData(); // Refresh dashboard counts
                }
            });
        }
    });
}