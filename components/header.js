// Header component
document.addEventListener('DOMContentLoaded', function() {
    const headerElement = document.getElementById('main-header');
    
    if (headerElement) {
        headerElement.innerHTML = `
            <div class="logo">
                <div class="logo-icon">
                    <i class="fas fa-hospital"></i>
                </div>
                <div class="logo-text">
                    <h1>Clinic Appointment System</h1>
                    <p>Manage patients, doctors & appointments</p>
                </div>
            </div>
            <div class="user-info">
                <div class="notification">
                    <i class="fas fa-bell"></i>
                    <span class="notification-badge">3</span>
                </div>
                <div class="user-avatar">
                    <span>AD</span>
                </div>
            </div>
        `;
    }
});