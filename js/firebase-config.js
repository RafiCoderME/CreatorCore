// Firebase Configuration for Creator Core
// Using Firebase Modular SDK v12.8.0

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDnAbCBdKW0QaPIyWr9m9bw2Z5-qa8Ijrc",
    authDomain: "creatorcore01.firebaseapp.com",
    projectId: "creatorcore01",
    storageBucket: "creatorcore01.firebasestorage.app",
    messagingSenderId: "320380182396",
    appId: "1:320380182396:web:a3a1d624ec56c0e8350ef9",
    measurementId: "G-FSHJE7ELF4"
};

// Global variables
let db = null;
let app = null;
let firebaseReady = false;

// Helper functions for form data persistence (global scope)
function clearSavedData() {
    localStorage.removeItem('creatorCorePaymentForm');
}

function saveFormData(allInputs) {
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

function loadFormData(allInputs) {
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

// Initialize Firebase when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('Firebase config loading...', {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain
    });

    // Load Firebase SDK
    loadFirebaseSDK();
});

// Load Firebase SDK dynamically (using compat for easier integration)
function loadFirebaseSDK() {
    const LOAD_TIMEOUT = 15000; // 15 seconds timeout
    let loadTimedOut = false;

    const timeoutId = setTimeout(() => {
        loadTimedOut = true;
        console.warn('Firebase SDK loading timed out. Using fallback mode.');
        initializePaymentFormWithoutFirebase();
    }, LOAD_TIMEOUT);

    // Firebase App (compat version for easier use with non-module scripts)
    const firebaseAppScript = document.createElement('script');
    firebaseAppScript.src = 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js';

    firebaseAppScript.onerror = function () {
        if (!loadTimedOut) {
            clearTimeout(timeoutId);
            console.error('Failed to load Firebase App SDK');
            initializePaymentFormWithoutFirebase();
        }
    };

    firebaseAppScript.onload = function () {
        if (loadTimedOut) return;

        // Firebase Firestore
        const firestoreScript = document.createElement('script');
        firestoreScript.src = 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js';

        firestoreScript.onerror = function () {
            if (!loadTimedOut) {
                clearTimeout(timeoutId);
                console.error('Failed to load Firestore SDK');
                initializePaymentFormWithoutFirebase();
            }
        };

        firestoreScript.onload = function () {
            if (loadTimedOut) return;
            clearTimeout(timeoutId);
            initializeFirebase();
        };
        document.head.appendChild(firestoreScript);
    };
    document.head.appendChild(firebaseAppScript);
}

// Initialize Firebase services
function initializeFirebase() {
    try {
        // Initialize Firebase App
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.apps[0];
        }

        // Initialize Firestore
        db = firebase.firestore();

        firebaseReady = true;
        console.log('✅ Firebase initialized successfully');

        // Continue with payment form initialization
        initializePaymentForm();

    } catch (error) {
        console.error('Firebase initialization error:', error);
        initializePaymentFormWithoutFirebase();
    }
}

// Initialize payment form with Firebase
function initializePaymentForm() {
    const paymentForm = document.getElementById('paymentForm');
    if (!paymentForm) {
        console.log('Payment form not found on this page');
        return;
    }

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
            field.addEventListener('blur', () => validateField(fieldName, validationRules));
            field.addEventListener('input', () => {
                const formGroup = field.closest('.form-group');
                formGroup.classList.remove('error', 'success');
                const errorMessage = formGroup.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.classList.remove('show');
                }
            });
        }
    });

    // Format input fields
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 15) value = value.slice(0, 15);
            e.target.value = value;
        });
    }

    const bkashField = document.getElementById('bkashNumber');
    if (bkashField) {
        bkashField.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            e.target.value = value;
        });
    }

    const transactionField = document.getElementById('transactionId');
    if (transactionField) {
        transactionField.addEventListener('input', function (e) {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
    }

    // Form submission with Firebase
    paymentForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        Object.keys(validationRules).forEach(fieldName => {
            if (!validateField(fieldName, validationRules)) {
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
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        paymentForm.classList.add('loading');

        try {
            const transactionId = document.getElementById('transactionId').value.trim();
            const email = document.getElementById('email').value.trim();

            // Generate order ID
            const orderId = 'CC-' + Date.now().toString(36).toUpperCase();

            // Prepare payment data
            const paymentData = {
                orderId: orderId,
                fullName: document.getElementById('fullName').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                email: email,
                bkashNumber: document.getElementById('bkashNumber').value.trim(),
                transactionId: transactionId,
                termsAccepted: document.getElementById('terms').checked,
                receiveUpdates: document.getElementById('updates')?.checked || false,
                product: {
                    name: 'Creator Core Bundle',
                    description: '900+ Premium PowerPoint Templates',
                    price: 47.00,
                    currency: 'USD'
                },
                payment: {
                    method: 'bKash',
                    status: 'pending',
                    amount: 47.00,
                    transactionId: transactionId
                },
                createdAt: new Date().toISOString(),
                metadata: {
                    userAgent: navigator.userAgent,
                    source: 'payment-form',
                    version: '2.0.0'
                }
            };

            // Check if Firebase is ready
            if (!firebaseReady || !db) {
                console.warn('Firebase not ready, saving to localStorage');
                savePaymentLocally(paymentData);
                redirectToSuccess(orderId, email, transactionId);
                return;
            }

            // Save to Firebase Firestore - PPT collection
            console.log('Saving payment to Firebase PPT collection...');
            const docRef = await db.collection('PPT').add(paymentData);

            console.log('✅ Payment saved with ID:', docRef.id);

            // Update status to confirmed
            await db.collection('PPT').doc(docRef.id).update({
                'payment.status': 'confirmed',
                'payment.firestoreId': docRef.id,
                confirmedAt: new Date().toISOString()
            });

            console.log('✅ Payment confirmed');

            // Clear form data
            clearSavedData();
            paymentForm.reset();

            // Redirect to success page
            redirectToSuccess(orderId, email, transactionId);

        } catch (error) {
            console.error('Payment submission error:', error);

            // Show user-friendly error message
            let errorMessage = 'Payment submission failed. Please try again.';

            if (error.code === 'unavailable' || error.message?.includes('offline')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.code === 'permission-denied') {
                errorMessage = 'Service temporarily unavailable. Please try again later.';
            }

            alert(errorMessage);

            // Reset button
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-lock"></i> Complete Purchase - $47.00';
            paymentForm.classList.remove('loading');
        }
    });

    // Setup additional features
    setupAdditionalFeatures(paymentForm, successModal);

    console.log('✅ Payment form initialized with Firebase');
}

// Redirect to success page
function redirectToSuccess(orderId, email, transactionId) {
    // Store success data for the success page
    localStorage.setItem('lastPaymentSuccess', JSON.stringify({
        orderId: orderId,
        email: email,
        transactionId: transactionId
    }));

    // Redirect to success page
    window.location.href = `success.html?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}&txn=${encodeURIComponent(transactionId)}`;
}

// Save payment locally as fallback
function savePaymentLocally(paymentData) {
    const existingPayments = JSON.parse(localStorage.getItem('creatorCorePayments') || '[]');
    existingPayments.push(paymentData);
    localStorage.setItem('creatorCorePayments', JSON.stringify(existingPayments));
    console.log('Payment saved locally:', paymentData.orderId);
}

// Validate single field
function validateField(fieldName, validationRules) {
    const field = document.getElementById(fieldName);
    if (!field) return true;

    const rules = validationRules[fieldName];
    const formGroup = field.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message');
    const value = field.value.trim();

    formGroup.classList.remove('error', 'success');
    if (errorMessage) {
        errorMessage.classList.remove('show');
    }

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
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }
}

// Fallback initialization without Firebase
function initializePaymentFormWithoutFirebase() {
    console.log('Using localStorage fallback for payments');
    firebaseReady = false;

    // Initialize form without Firebase
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        initializePaymentFormFallback(paymentForm);
    }
}

// Fallback form initialization
function initializePaymentFormFallback(paymentForm) {
    const submitButton = paymentForm.querySelector('.submit-button');

    // Form validation rules
    const validationRules = {
        fullName: { required: true, minLength: 3, pattern: /^[a-zA-Z\s]+$/, message: 'Please enter a valid full name' },
        phone: { required: true, pattern: /^[0-9]{11,15}$/, message: 'Please enter a valid phone number' },
        email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' },
        bkashNumber: { required: true, pattern: /^01[3-9]\d{8}$/, message: 'Please enter a valid bKash number' },
        transactionId: { required: true, pattern: /^[A-Z0-9]{8,12}$/, message: 'Transaction ID must be 8-12 characters' }
    };

    paymentForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validate
        let isValid = true;
        Object.keys(validationRules).forEach(fieldName => {
            if (!validateField(fieldName, validationRules)) isValid = false;
        });

        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox.checked) isValid = false;

        if (!isValid) return;

        // Show loading
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Simulate processing
        await new Promise(r => setTimeout(r, 1500));

        const orderId = 'CC-' + Date.now().toString(36).toUpperCase();
        const email = document.getElementById('email').value.trim();
        const transactionId = document.getElementById('transactionId').value.trim();

        // Save locally
        savePaymentLocally({
            orderId: orderId,
            fullName: document.getElementById('fullName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: email,
            bkashNumber: document.getElementById('bkashNumber').value.trim(),
            transactionId: transactionId,
            createdAt: new Date().toISOString(),
            payment: { status: 'pending', amount: 47.00 }
        });

        // Redirect
        redirectToSuccess(orderId, email, transactionId);
    });

    console.log('Payment form initialized (fallback mode)');
}

// Additional features setup
function setupAdditionalFeatures(paymentForm, successModal) {
    // Copy merchant number
    const merchantNumberElement = document.querySelector('.bkash-instructions strong');
    if (merchantNumberElement && merchantNumberElement.textContent.includes('01')) {
        merchantNumberElement.style.cursor = 'pointer';
        merchantNumberElement.title = 'Click to copy';

        merchantNumberElement.addEventListener('click', function () {
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
        link.addEventListener('click', function (e) {
            e.preventDefault();
            alert('Terms and Conditions page will open here.');
        });
    });

    // Auto-save functionality
    const allInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="checkbox"]');

    allInputs.forEach(input => {
        input.addEventListener('input', () => saveFormData(allInputs));
        input.addEventListener('change', () => saveFormData(allInputs));
    });

    loadFormData(allInputs);
}

// Expose global functions
window.clearSavedData = clearSavedData;
window.firebaseReady = () => firebaseReady;

console.log('Firebase payment script loaded (v2.0.0)');