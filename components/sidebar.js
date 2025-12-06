// Sidebar component
document.addEventListener('DOMContentLoaded', function() {
    const sidebarElement = document.getElementById('main-sidebar');
    
    if (sidebarElement) {
        sidebarElement.innerHTML = `
            <nav>
                <ul class="nav-menu">
                    <li class="nav-item">
                        <a href="#" class="nav-link active" data-page="dashboard">
                            <i class="fas fa-home"></i>
                            <span>Dashboard</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-page="patients">
                            <i class="fas fa-user-injured"></i>
                            <span>Patients</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-page="doctors">
                            <i class="fas fa-user-md"></i>
                            <span>Doctors</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-page="appointments">
                            <i class="fas fa-calendar-check"></i>
                            <span>Appointments</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-page="settings">
                            <i class="fas fa-cog"></i>
                            <span>Settings</span>
                        </a>
                    </li>
                </ul>
            </nav>
        `;
        
        // Add event listeners to sidebar links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Navigate to the selected page
                const page = this.getAttribute('data-page');
                navigateToPage(page);
            });
        });
    }
    
    function navigateToPage(page) {
        // Hide all page sections
        const pageSections = document.querySelectorAll('.page-section');
        pageSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show the selected page section
        const targetSection = document.getElementById(`${page}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update page title
        const pageTitle = document.getElementById('page-title');
        const actionButtons = document.getElementById('action-buttons');
        
        switch(page) {
            case 'dashboard':
                pageTitle.textContent = 'Dashboard';
                actionButtons.innerHTML = '';
                break;
            case 'patients':
                pageTitle.textContent = 'Patients';
                actionButtons.innerHTML = `
                    <button class="btn btn-primary" id="add-patient-btn">
                        <i class="fas fa-plus"></i> Add Patient
                    </button>
                `;
                // Load patients if not already loaded
                if (typeof loadPatients === 'function') {
                    loadPatients();
                }
                break;
            case 'doctors':
                pageTitle.textContent = 'Doctors';
                actionButtons.innerHTML = `
                    <button class="btn btn-primary" id="add-doctor-btn">
                        <i class="fas fa-plus"></i> Add Doctor
                    </button>
                `;
                // Load doctors if not already loaded
                if (typeof loadDoctors === 'function') {
                    loadDoctors();
                }
                break;
            case 'appointments':
                pageTitle.textContent = 'Appointments';
                actionButtons.innerHTML = `
                    <button class="btn btn-primary" id="add-appointment-btn">
                        <i class="fas fa-plus"></i> Add Appointment
                    </button>
                `;
                // Load appointments if not already loaded
                if (typeof loadAppointments === 'function') {
                    loadAppointments();
                }
                break;
            case 'settings':
                pageTitle.textContent = 'Settings';
                actionButtons.innerHTML = '';
                break;
        }
        
        // Add event listeners to action buttons
        setTimeout(() => {
            const addPatientBtn = document.getElementById('add-patient-btn');
            if (addPatientBtn) {
                addPatientBtn.addEventListener('click', () => {
                    if (typeof openPatientModal === 'function') {
                        openPatientModal();
                    }
                });
            }
            
            const addDoctorBtn = document.getElementById('add-doctor-btn');
            if (addDoctorBtn) {
                addDoctorBtn.addEventListener('click', () => {
                    if (typeof openDoctorModal === 'function') {
                        openDoctorModal();
                    }
                });
            }
            
            const addAppointmentBtn = document.getElementById('add-appointment-btn');
            if (addAppointmentBtn) {
                addAppointmentBtn.addEventListener('click', () => {
                    if (typeof openAppointmentModal === 'function') {
                        openAppointmentModal();
                    }
                });
            }
        }, 100);
    }
    
    // Initialize dashboard as default page
    navigateToPage('dashboard');
});