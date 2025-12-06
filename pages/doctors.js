// Doctors page functionality
let doctorsData = [];
let currentDoctorsPage = 1;
const doctorsPerPage = 10;

async function loadDoctors() {
    try {
        doctorsData = await ApiService.getDoctors();
        globalState.doctors = doctorsData;
        renderDoctorsTable();
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

function renderDoctorsTable() {
    const tableBody = document.querySelector('#doctors-table tbody');
    const pagination = document.getElementById('doctor-pagination');
    
    if (!tableBody) return;
    
    // Filter doctors based on search term
    let filteredDoctors = doctorsData;
    if (globalState.searchTerm) {
        filteredDoctors = doctorsData.filter(doctor => 
            doctor.name.toLowerCase().includes(globalState.searchTerm) ||
            doctor.specialty.toLowerCase().includes(globalState.searchTerm)
        );
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
    const startIndex = (currentDoctorsPage - 1) * doctorsPerPage;
    const endIndex = startIndex + doctorsPerPage;
    const pageDoctors = filteredDoctors.slice(startIndex, endIndex);
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Render doctors
    pageDoctors.forEach(doctor => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${doctor.id}</td>
            <td>${doctor.name}</td>
            <td>${doctor.specialty}</td>
            <td class="action-buttons-cell">
                <button class="action-btn edit" data-id="${doctor.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" data-id="${doctor.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Render pagination
    renderPagination(pagination, currentDoctorsPage, totalPages, 'doctors');
    
    // Add event listeners to action buttons
    addDoctorActionListeners();
}

function addDoctorActionListeners() {
    // Edit buttons
    const editButtons = document.querySelectorAll('.action-btn.edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const doctorId = this.getAttribute('data-id');
            openDoctorModal(doctorId);
        });
    });
    
    // Delete buttons
    const deleteButtons = document.querySelectorAll('.action-btn.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const doctorId = this.getAttribute('data-id');
            deleteDoctor(doctorId);
        });
    });
}

async function openDoctorModal(doctorId = null) {
    let doctor = null;
    let title = 'Add New Doctor';
    
    if (doctorId) {
        doctor = await ApiService.getDoctor(doctorId);
        title = 'Edit Doctor';
    }
    
    Modal.open({
        title: title,
        content: `
            <form id="doctor-form">
                <div class="form-group">
                    <label class="form-label" for="doctor-name">Full Name *</label>
                    <input type="text" id="doctor-name" class="form-control" required 
                           value="${doctor ? doctor.name : ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="doctor-specialty">Specialty *</label>
                    <select id="doctor-specialty" class="form-control" required>
                        <option value="">Select Specialty</option>
                        <option value="Cardiology" ${doctor && doctor.specialty === 'Cardiology' ? 'selected' : ''}>Cardiology</option>
                        <option value="Dermatology" ${doctor && doctor.specialty === 'Dermatology' ? 'selected' : ''}>Dermatology</option>
                        <option value="Orthopedics" ${doctor && doctor.specialty === 'Orthopedics' ? 'selected' : ''}>Orthopedics</option>
                        <option value="Pediatrics" ${doctor && doctor.specialty === 'Pediatrics' ? 'selected' : ''}>Pediatrics</option>
                        <option value="Neurology" ${doctor && doctor.specialty === 'Neurology' ? 'selected' : ''}>Neurology</option>
                        <option value="General" ${doctor && doctor.specialty === 'General' ? 'selected' : ''}>General</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" id="cancel-doctor-btn">Cancel</button>
                    <button type="submit" class="btn btn-primary">${doctor ? 'Update' : 'Create'} Doctor</button>
                </div>
            </form>
        `,
        onOpen: () => {
            const form = document.getElementById('doctor-form');
            const cancelBtn = document.getElementById('cancel-doctor-btn');
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const doctorData = {
                    name: document.getElementById('doctor-name').value,
                    specialty: document.getElementById('doctor-specialty').value
                };
                
                if (doctor) {
                    // Update existing doctor
                    await ApiService.updateDoctor(doctor.id, doctorData);
                } else {
                    // Create new doctor
                    await ApiService.createDoctor(doctorData);
                }
                
                Modal.close();
                loadDoctors();
                loadDashboardData(); // Refresh dashboard counts
            });
            
            cancelBtn.addEventListener('click', () => {
                Modal.close();
            });
        }
    });
}

async function deleteDoctor(doctorId) {
    const doctor = doctorsData.find(d => d.id === parseInt(doctorId));
    
    if (!doctor) return;
    
    // Show confirmation dialog
    Modal.open({
        title: 'Confirm Delete',
        content: `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <h3>Are you sure?</h3>
                <p>You are about to delete doctor: <strong>${doctor.name}</strong></p>
                <p>This action cannot be undone.</p>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" id="cancel-delete-btn">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirm-delete-btn">Delete Doctor</button>
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
                const success = await ApiService.deleteDoctor(doctorId);
                if (success) {
                    Modal.close();
                    loadDoctors();
                    loadDashboardData(); // Refresh dashboard counts
                }
            });
        }
    });
}