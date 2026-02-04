// ===== Mobile Navigation Toggle =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===== Smooth Scrolling =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ===== Category Filter =====
const categoryBtns = document.querySelectorAll('.category-btn');
const templateItems = document.querySelectorAll('.template-item');

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        templateItems.forEach((item, i) => {
            item.style.animation = 'none';
            setTimeout(() => {
                item.style.animation = `fadeInUp 0.6s ease forwards`;
                item.style.animationDelay = `${i * 0.1}s`;
            }, 100);
        });
    });
});

// ===== Scroll Animations & Counters =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';

            // Counter animation
            if (entry.target.classList.contains('stat-number') && !entry.target.classList.contains('animated')) {
                const number = parseInt(entry.target.textContent.replace(/\D/g, ''));
                if (!isNaN(number)) animateCounter(entry.target, number);
                entry.target.classList.add('animated');
            }
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

// Animate cards and stats
document.querySelectorAll('.feature-card, .template-item, .testimonial-card, .stat-number').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===== Header Scroll Effect & Parallax =====
const header = document.querySelector('.header');
const hero = document.querySelector('.hero');
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    // Header background
    header.style.background = scrolled > 100 ? 'rgba(22, 22, 32, 0.95)' : 'rgba(22, 22, 32, 0.8)';
    header.style.backdropFilter = 'blur(20px)';

    // Hero parallax
    const parallax = hero?.querySelector('.hero-content');
    if (parallax) parallax.style.transform = `translateY(${scrolled * 0.3}px)`;
});

// ===== Counter Animation =====
function animateCounter(el, target, duration = 2000) {
    let current = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            el.textContent = target.toLocaleString() + (el.textContent.includes('+') ? '+' : '');
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(current).toLocaleString() + (el.textContent.includes('+') ? '+' : '');
        }
    }, 16);
}

// ===== Template Preview Modal =====
const modal = document.createElement('div');
modal.className = 'preview-modal';
modal.innerHTML = `
<div class="modal-content">
    <span class="close-modal">&times;</span>
    <img src="" alt="Template Preview" class="modal-image">
    <div class="modal-info">
        <h3></h3>
        <p></p>
        <button class="cta-button">Use This Template</button>
    </div>
</div>`;
modal.style.cssText = `
display:none;position:fixed;z-index:2000;left:0;top:0;width:100%;height:100%;
background:rgba(0,0,0,0.9);backdrop-filter:blur(10px);`;
document.body.appendChild(modal);

// Modal button handlers
document.querySelectorAll('.preview-btn').forEach(btn => {
    btn.addEventListener('click', e => {
        e.stopPropagation();
        const item = btn.closest('.template-item');
        modal.style.display = 'flex';
        modal.querySelector('.modal-image').src = item.querySelector('img').src;
        modal.querySelector('.modal-info h3').textContent = item.querySelector('h4').textContent;
        modal.querySelector('.modal-info p').textContent = item.querySelector('p').textContent;

        setTimeout(() => {
            const content = modal.querySelector('.modal-content');
            content.style.opacity = '1';
            content.style.transform = 'scale(1)';
        }, 100);
    });
});

// Close modal
modal.querySelector('.close-modal').addEventListener('click', () => modal.style.display = 'none');
modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

// ===== Form Validation =====
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== Button Loading States =====
document.querySelectorAll('.cta-button, .cta-button-large').forEach(btn => {
    btn.addEventListener('click', function (e) {
        if (this.textContent.includes('Download') || this.textContent.includes('Checkout')) {
            e.preventDefault();
            const orig = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            this.disabled = true;
            setTimeout(() => {
                this.innerHTML = orig;
                this.disabled = false;
                console.log('Proceeding to checkout...');
            }, 2000);
        }
    });
});

// ===== Keyboard Navigation =====
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display === 'flex') modal.style.display = 'none';
});

// ===== Page Load Animations =====
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => { document.body.style.opacity = '1'; }, 100);

    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        heroContent.style.transition = 'all 1s ease';
        setTimeout(() => { heroContent.style.opacity = '1'; heroContent.style.transform = 'translateY(0)'; }, 500);
    }
});

// ===== Console Easter Egg =====
console.log('%c🎨 Welcome to Creator Core!', 'font-size:20px;color:#3b6fb6;font-weight:bold;');
console.log('%cPremium PowerPoint Templates for Professionals', 'font-size:14px;color:#885fc1;');
