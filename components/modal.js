// Modal component
const Modal = {
    open: function(options) {
        const modalContainer = document.getElementById('modal-container');
        
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.id = options.id || 'modal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Create modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = `
            <h3 class="modal-title">${options.title || 'Modal'}</h3>
            <button class="modal-close">&times;</button>
        `;
        
        // Create modal body
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.innerHTML = options.content || '';
        
        // Assemble modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalOverlay.appendChild(modalContent);
        
        // Clear and append to container
        modalContainer.innerHTML = '';
        modalContainer.appendChild(modalOverlay);
        
        // Add close functionality
        const closeBtn = modalOverlay.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.close());
        
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.close();
            }
        });
        
        // Show modal with animation
        setTimeout(() => {
            modalOverlay.classList.add('active');
        }, 10);
        
        // Call onOpen callback if provided
        if (options.onOpen) {
            options.onOpen();
        }
    },
    
    close: function() {
        const modalOverlay = document.querySelector('.modal-overlay.active');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            setTimeout(() => {
                modalOverlay.remove();
            }, 300);
        }
    }
};

// Toast notification component
const Toast = {
    show: function(options) {
        const toastContainer = document.getElementById('toast-container');
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${options.type || 'info'}`;
        
        // Set icon based on type
        let iconClass = 'fas fa-info-circle';
        if (options.type === 'success') iconClass = 'fas fa-check-circle';
        if (options.type === 'error') iconClass = 'fas fa-exclamation-circle';
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="toast-message">
                <h4>${options.title || 'Notification'}</h4>
                <p>${options.message || ''}</p>
            </div>
        `;
        
        // Add to container
        toastContainer.appendChild(toast);
        
        // Auto remove after delay
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, options.duration || 3000);
    }
};