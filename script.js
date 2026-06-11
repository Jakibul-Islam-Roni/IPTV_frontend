document.addEventListener('DOMContentLoaded', () => {
    const regForm = document.getElementById('registrationForm');
    const loginForm = document.getElementById('loginForm');
    const currentForm = regForm || loginForm;
    
    if (!currentForm) return;

    const inputs = currentForm.querySelectorAll('.input-group input');
    const passwordToggles = currentForm.querySelectorAll('.toggle-password');
    const submitBtn = document.getElementById('submitBtn');

    // Handle floating labels by toggling a class when input has value
    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            input.classList.add('has-value');
        }
        input.setAttribute('placeholder', ' ');

        input.addEventListener('input', () => {
            if (input.value.trim() !== '') {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
            
            const group = input.closest('.input-group');
            if (group.classList.contains('invalid')) {
                group.classList.remove('invalid');
            }
        });
    });

    // Toggle password visibility
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const inputGroup = e.currentTarget.closest('.input-group');
            const passwordInput = inputGroup.querySelector('input');
            
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const svg = toggle.querySelector('svg');
            if (type === 'text') {
                svg.innerHTML = `
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                `;
            } else {
                svg.innerHTML = `
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                `;
            }
        });
    });

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateForm = () => {
        let isValid = true;
        currentForm.querySelectorAll('.input-group').forEach(el => el.classList.remove('invalid'));

        const email = document.getElementById('email');
        const password = document.getElementById('password');

        if (email && !validateEmail(email.value)) {
            email.closest('.input-group').classList.add('invalid');
            const err = document.getElementById('emailError');
            if (err) err.textContent = 'Please enter a valid email';
            isValid = false;
        }

        if (password && password.value.length === 0) {
            password.closest('.input-group').classList.add('invalid');
            const err = document.getElementById('passwordError');
            if (err) err.textContent = 'Please enter your password';
            isValid = false;
        } else if (regForm && password && password.value.length < 8) {
            password.closest('.input-group').classList.add('invalid');
            const err = document.getElementById('passwordError');
            if (err) err.textContent = 'Password must be at least 8 characters';
            isValid = false;
        }

        if (regForm) {
            const fullname = document.getElementById('fullname');
            const confirmPassword = document.getElementById('confirmPassword');

            if (fullname && fullname.value.trim().length < 2) {
                fullname.closest('.input-group').classList.add('invalid');
                const err = document.getElementById('fullnameError');
                if (err) err.textContent = 'Please enter your full name';
                isValid = false;
            }

            if (confirmPassword && (password.value !== confirmPassword.value || confirmPassword.value === '')) {
                confirmPassword.closest('.input-group').classList.add('invalid');
                const err = document.getElementById('confirmError');
                if (err) err.textContent = 'Passwords do not match';
                isValid = false;
            }
        }

        return isValid;
    };

    currentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            try {
                let url = '';
                let bodyData = {};

                if (regForm) {
                    url = 'http://localhost:3000/api/auth/register';
                    bodyData = {
                        fullname: document.getElementById('fullname').value,
                        email: document.getElementById('email').value,
                        password: document.getElementById('password').value
                    };
                } else {
                    url = 'http://localhost:3000/api/auth/login';
                    bodyData = {
                        email: document.getElementById('email').value,
                        password: document.getElementById('password').value
                    };
                }

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bodyData)
                });

                const data = await response.json();

                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;

                if (response.ok) {
                    const originalText = submitBtn.querySelector('.btn-text').textContent;
                    submitBtn.querySelector('.btn-text').textContent = regForm ? 'Account Created!' : 'Signed In Successfully!';
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 1500);
                } else {
                    alert(data.error || 'Authentication failed');
                    currentForm.classList.add('shake');
                    setTimeout(() => currentForm.classList.remove('shake'), 500);
                }
            } catch (err) {
                console.error(err);
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                alert('Network error. Is the backend server running on port 3000?');
                currentForm.classList.add('shake');
                setTimeout(() => currentForm.classList.remove('shake'), 500);
            }
        } else {
            currentForm.classList.add('shake');
            setTimeout(() => currentForm.classList.remove('shake'), 500);
        }
    });

    // 3D Glass Effect
    const container = document.querySelector('.container');
    const panel = document.querySelector('.glass-panel');

    if (window.matchMedia("(min-width: 768px)").matches) {
        container.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const panelCenterX = rect.left + rect.width / 2;
            const panelCenterY = rect.top + rect.height / 2;
            
            const xAxis = (panelCenterX - e.clientX) / 40; 
            const yAxis = (panelCenterY - e.clientY) / 40;
            
            panel.style.transform = `translateY(0) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });

        container.addEventListener('mouseleave', () => {
            panel.style.transition = 'all 0.5s ease';
            panel.style.transform = `translateY(0) rotateY(0deg) rotateX(0deg)`;
            setTimeout(() => {
                panel.style.transition = 'none';
            }, 500);
        });
        
        container.addEventListener('mouseenter', () => {
            panel.style.transition = 'none';
        });
    }
});
