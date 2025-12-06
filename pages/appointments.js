// Appointments page functionality
let appointmentsData = [];
let currentAppointmentsPage = 1;
const appointmentsPerPage = 10;

async function loadAppointments() {
    try {
        appointmentsData = await ApiService.getAppointments();
        globalState.appointments = appointmentsData;
        renderAppointmentsTable();
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

function renderAppointmentsTable() {
    const tableBody = document.querySelector('#appointments-table tbody');
    const pagination = document.getElementById('appointment-pagination');
    
    if (!tableBody) return;
    
    // Filter appointments based on search term and status
    let filteredAppointments = appointmentsData;
    
    // Apply status filter
    if (globalState.filterStatus) {
        filteredAppointments = filteredAppointments.filter(
            appointment => appointment.status === globalState.filterStatus
        );
    }
    
    // Apply search filter
    if (globalState.searchTerm) {
        filteredAppointments = filteredAppointments.filter(appointment => {
            // Find patient and doctor names
            const patient = globalState.patients.find(p => p.id === appointment.patientId);
            const doctor = globalState.doctors.find(d => d.id === appointment.doctorId);
            
            return (
                (patient && patient.name.toLowerCase().includes(globalState.searchTerm)) ||
                (doctor && doctor.name.toLowerCase().includes(globalState.searchTerm)) ||
                appointment.notes.toLowerCase().includes(globalState.searchTerm) ||
                appointment.status.toLowerCase().includes(globalState.searchTerm)
            );
        });
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
    const startIndex = (currentAppointmentsPage - 1) * appointmentsPerPage;
    const endIndex = startIndex + appointmentsPerPage;
    const pageAppointments = filteredAppointments.slice(startIndex, endIndex);
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Render appointments
    pageAppointments.forEach(appointment => {
        const row = document.createElement('tr');
        
        // Find patient and doctor names
        const patient = globalState.patients.find(p => p.id === appointment.patientId);
        const doctor = globalState.doctors.find(d => d.id === appointment.doctorId);
        
        // Format dates
        const startDate = new Date(appointment.startAt);
        const endDate = new Date(appointment.endAt);
        const formattedStartDate = startDate.toLocaleDateString() + ' ' + 
                                   startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const formattedEndDate = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Status badge
        let statusClass = 'status-scheduled';
        if (appointment.status === 'completed') statusClass = 'status-completed';
        if (appointment.status === 'cancelled') statusClass = 'status-cancelled';
        
        row.innerHTML = `
            <td>${appointment.id}</td>
            <td>${patient ? patient.name : 'Unknown'}</td>
            <td>${doctor ? doctor.name : 'Unknown'}</td>
            <td>${formattedStartDate}</td>
            <td>${formattedEndDate}</td>
            <td><span class="status-badge ${statusClass}">${appointment.status}</span></td>
            <td class="action-buttons-cell">
                <button class="action-btn edit" data-id="${appointment.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" data-id="${appointment.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Render pagination
    renderPagination(pagination, currentAppointmentsPage, totalPages, 'appointments');
    
    // Add event listeners to action buttons
    addAppointmentActionListeners();
}

function addAppointmentActionListeners() {
    // Edit buttons
    const editButtons = document.querySelectorAll('.action-btn.edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-id');
            openAppointmentModal(appointmentId);
        });
    });
    
    // Delete buttons
    const deleteButtons = document.querySelectorAll('.action-btn.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-id');
            deleteAppointment(appointmentId);
        });
    });
}

async function openAppointmentModal(appointmentId = null) {
    let appointment = null;
    let title = 'Add New Appointment';
    
    if (appointmentId) {
        appointment = await ApiService.getAppointment(appointmentId);
        title = 'Edit Appointment';
    }
    
    // Get patients and doctors for dropdowns
    const patients = await ApiService.getPatients();
    const doctors = await ApiService.getDoctors();
    
    // Generate patient options
    let patientOptions = '<option value="">Select Patient</option>';
    patients.forEach(patient => {
        const selected = appointment && appointment.patientId === patient.id ? 'selected' : '';
        patientOptions += `<option value="${patient.id}" ${selected}>${patient.name} (${patient.email})</option>`;
    });
    
    // Generate doctor options
    let doctorOptions = '<option value="">Select Doctor</option>';
    doctors.forEach(doctor => {
        const selected = appointment && appointment.doctorId === doctor.id ? 'selected' : '';
        doctorOptions += `<option value="${doctor.id}" ${selected}>Dr. ${doctor.name} (${doctor.specialty})</option>`;
    });
    
    // Format dates for input fields (YYYY-MM-DDTHH:MM)
    let startAt = '';
    let endAt = '';
    
    if (appointment) {
        const startDate = new Date(appointment.startAt);
        const endDate = new Date(appointment.endAt);
        
        startAt = startDate.toISOString().slice(0, 16);
        endAt = endDate.toISOString().slice(0, 16);
    } else {
        // Default to tomorrow at 9 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        
        const endTime = new Date(tomorrow);
        endTime.setHours(10, 0, 0, 0);
        
        startAt = tomorrow.toISOString().slice(0, 16);
        endAt = endTime.toISOString().slice(0, 16);
    }
    
    Modal.open({
        title: title,
        content: `
            <form id="appointment-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="appointment-patient">Patient *</label>
                        <select id="appointment-patient" class="form-control" required>
                            ${patientOptions}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="appointment-doctor">Doctor *</label>
                        <select id="appointment-doctor" class="form-control" required>
                            ${doctorOptions}
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="appointment-start">Start Time *</label>
                        <input type="datetime-local" id="appointment-start" class="form-control" required
                               value="${startAt}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="appointment-end">End Time *</label>
                        <input type="datetime-local" id="appointment-end" class="form-control" required
                               value="${endAt}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="appointment-status">Status</label>
                    <select id="appointment-status" class="form-control">
                        <option value="scheduled" ${appointment && appointment.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
                        <option value="completed" ${appointment && appointment.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${appointment && appointment.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="appointment-notes">Notes</label>
                    <textarea id="appointment-notes" class="form-control" rows="3">${appointment ? appointment.notes : ''}</textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" id="cancel-appointment-btn">Cancel</button>
                    <button type="submit" class="btn btn-primary">${appointment ? 'Update' : 'Create'} Appointment</button>
                </div>
            </form>
        `,
        onOpen: () => {
            const form = document.getElementById('appointment-form');
            const cancelBtn = document.getElementById('cancel-appointment-btn');
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const appointmentData = {
                    patientId: parseInt(document.getElementById('appointment-patient').value),
                    doctorId: parseInt(document.getElementById('appointment-doctor').value),
                    startAt: new Date(document.getElementById('appointment-start').value).toISOString(),
                    endAt: new Date(document.getElementById('appointment-end').value).toISOString(),
                    status: document.getElementById('appointment-status').value,
                    notes: document.getElementById('appointment-notes').value
                };
                
                if (appointment) {
                    // Update existing appointment
                    await ApiService.updateAppointment(appointment.id, appointmentData);
                } else {
                    // Create new appointment
                    await ApiService.createAppointment(appointmentData);
                }
                
                Modal.close();
                loadAppointments();
                loadDashboardData(); // Refresh dashboard counts
            });
            
            cancelBtn.addEventListener('click', () => {
                Modal.close();
            });
        }
    });
}

async function deleteAppointment(appointmentId) {
    const appointment = appointmentsData.find(a => a.id === parseInt(appointmentId));
    
    if (!appointment) return;
    
    // Find patient and doctor names for confirmation message
    const patient = globalState.patients.find(p => p.id === appointment.patientId);
    const doctor = globalState.doctors.find(d => d.id === appointment.doctorId);
    
    // Show confirmation dialog
    Modal.open({
        title: 'Confirm Delete',
        content: `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <h3>Are you sure?</h3>
                <p>You are about to delete an appointment for:</p>
                <p><strong>${patient ? patient.name : 'Unknown Patient'}</strong> with <strong>${doctor ? doctor.name : 'Unknown Doctor'}</strong></p>
                <p>This action cannot be undone.</p>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" id="cancel-delete-btn">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirm-delete-btn">Delete Appointment</button>
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
                const success = await ApiService.deleteAppointment(appointmentId);
                if (success) {
                    Modal.close();
                    loadAppointments();
                    loadDashboardData(); // Refresh dashboard counts
                }
            });
        }
    });
}