// Fallback payment script for when Firebase is not available
// This provides the same functionality using localStorage for demo purposes

document.addEventListener('DOMContentLoaded', function() {
    // Only run if Firebase is not already initialized
    if (typeof firebase !== 'undefined') {
        console.log('Firebase already loaded, skipping fallback');
        return;
    }

    console.log('Using fallback payment form');
    
    const paymentForm = document.getElementById('paymentForm');
    const submitButton = paymentForm.querySelector('.submit-button');
    const successModal = document.getElementById('successModal');
    
    // Form validation rules
    const validationRules = {
        fullName: {
            required: true,
            minLength: 3,
            pattern: /^[a-zA-Z\s]+$/,
            message: 'Please enter a valid full name (letters and spaces only)'
        },
        phone: {
            required: true,
            pattern: /^[0-9]{11,15}$/,
            message: 'Please enter a valid phone number (11-15 digits)'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        bkashNumber: {
            required: true,
            pattern: /^01[3-9]\d{8}$/,
            message: 'Please enter a valid bKash number (starts with 01, 11 digits)'
        },
        transactionId: {
            required: true,
            pattern: /^[A-Z0-9]{8,12}$/,
            message: 'Transaction ID must be 8-12 alphanumeric characters'
        }
    };

    // Real-time validation
    Object.keys(validationRules).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('blur', () => validateField(fieldName));
            field.addEventListener('input', () => {
                const formGroup = field.closest('.form-group');
                formGroup.classList.remove('error', 'success');
                const errorMessage = formGroup.querySelector('.error-message');
                errorMessage.classList.remove('show');
            });
        }
    });

    function validateField(fieldName) {
        const field = document.getElementById(fieldName);
        if (!field) return true;

        const rules = validationRules[fieldName];
        const formGroup = field.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        const value = field.value.trim();

        formGroup.classList.remove('error', 'success');
        errorMessage.classList.remove('show');

        if (rules.required && !value) {
            showFieldError(formGroup, errorMessage, 'This field is required');
            return false;
        }

        if (value && rules.pattern && !rules.pattern.test(value)) {
            showFieldError(formGroup, errorMessage, rules.message);
            return false;
        }

        if (value && rules.minLength && value.length < rules.minLength) {
            showFieldError(formGroup, errorMessage, `Minimum ${rules.minLength} characters required`);
            return false;
        }

        formGroup.classList.add('success');
        return true;
    }

    function showFieldError(formGroup, errorMessage, message) {
        formGroup.classList.add('error');
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }

    // Format input fields
    document.getElementById('phone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 15) value = value.slice(0, 15);
        e.target.value = value;
    });

    document.getElementById('bkashNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        e.target.value = value;
    });

    document.getElementById('transactionId').addEventListener('input', function(e) {
        e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });

    // Form submission with fallback
    paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        Object.keys(validationRules).forEach(fieldName => {
            if (!validateField(fieldName)) {
                isValid = false;
            }
        });

        // Check terms checkbox
        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox.checked) {
            isValid = false;
            const termsGroup = termsCheckbox.closest('.checkbox-group');
            termsGroup.style.color = '#ef4444';
            setTimeout(() => { termsGroup.style.color = ''; }, 3000);
        }

        if (!isValid) {
            const firstError = document.querySelector('.form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Show loading state
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        paymentForm.classList.add('loading');

        try {
            // Prepare payment data
            const paymentData = {
                fullName: document.getElementById('fullName').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                email: document.getElementById('email').value.trim(),
                bkashNumber: document.getElementById('bkashNumber').value.trim(),
                transactionId: document.getElementById('transactionId').value.trim(),
                termsAccepted: document.getElementById('terms').checked,
                receiveUpdates: document.getElementById('updates').checked,
                product: {
                    name: 'Creator Core Bundle',
                    description: '900+ Premium PowerPoint Templates',
                    price: 47.00,
                    currency: 'USD'
                },
                payment: {
                    method: 'bKash',
                    status: 'confirmed',
                    amount: 47.00,
                    transactionId: document.getElementById('transactionId').value.trim()
                },
                timestamps: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                metadata: {
                    userAgent: navigator.userAgent,
                    source: 'payment-form-fallback',
                    version: '1.0.0'
                },
                fallbackMode: true
            };

            // Save to localStorage as fallback
            const existingPayments = JSON.parse(localStorage.getItem('creatorCorePayments') || '[]');
            const paymentWithId = {
                ...paymentData,
                id: 'payment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            };
            existingPayments.push(paymentWithId);
            localStorage.setItem('creatorCorePayments', JSON.stringify(existingPayments));

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Payment saved to localStorage:', paymentWithId);

            // Show success modal
            showSuccessModal();

            // Reset form
            paymentForm.reset();
            clearSavedData();

            // Show notification about fallback mode
            if (paymentData.fallbackMode) {
                setTimeout(() => {
                    console.log('Note: Payment saved locally due to Firebase unavailability');
                    // You could show a toast notification here
                }, 2000);
            }

        } catch (error) {
            console.error('Payment submission error:', error);
            alert('Payment submission failed. Please try again.');
        } finally {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            paymentForm.classList.remove('loading');
        }
    });

    function showSuccessModal() {
        successModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            successModal.querySelector('.modal-content').style.animation = 'modalSlideIn 0.3s ease';
        }, 100);
    }

    function closeModal() {
        successModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    successModal.addEventListener('click', function(e) {
        if (e.target === successModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && successModal.style.display === 'block') {
            closeModal();
        }
    });

    // Additional features
    setupAdditionalFeatures();

    function setupAdditionalFeatures() {
        // Copy merchant number
        const merchantNumberElement = document.querySelector('.bkash-instructions strong');
        if (merchantNumberElement && merchantNumberElement.textContent.includes('01')) {
            merchantNumberElement.style.cursor = 'pointer';
            merchantNumberElement.title = 'Click to copy';
            
            merchantNumberElement.addEventListener('click', function() {
                const number = this.textContent.replace(/[^\d]/g, '');
                navigator.clipboard.writeText(number).then(() => {
                    const originalText = this.textContent;
                    this.textContent = 'Copied!';
                    this.style.color = '#10b981';
                    
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.style.color = '';
                    }, 2000);
                });
            });
        }

        // Terms links
        document.querySelectorAll('.terms-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Terms and Conditions page will open here.');
            });
        });

        // Auto-save functionality
        const allInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="checkbox"]');
        
        function saveFormData() {
            const formData = {};
            allInputs.forEach(input => {
                if (input.type === 'checkbox') {
                    formData[input.id] = input.checked;
                } else {
                    formData[input.id] = input.value;
                }
            });
            localStorage.setItem('creatorCorePaymentForm', JSON.stringify(formData));
        }

        function loadFormData() {
            const savedData = localStorage.getItem('creatorCorePaymentForm');
            if (savedData) {
                const formData = JSON.parse(savedData);
                allInputs.forEach(input => {
                    if (formData.hasOwnProperty(input.id)) {
                        if (input.type === 'checkbox') {
                            input.checked = formData[input.id];
                        } else {
                            input.value = formData[input.id];
                        }
                    }
                });
            }
        }

        function clearSavedData() {
            localStorage.removeItem('creatorCorePaymentForm');
        }

        allInputs.forEach(input => {
            input.addEventListener('input', saveFormData);
            input.addEventListener('change', saveFormData);
        });

        loadFormData();

        // Clear saved data on successful submission
        const originalCloseModal = closeModal;
        window.closeModal = function() {
            originalCloseModal();
            clearSavedData();
        };
    }

    console.log('Fallback payment form initialized');
});