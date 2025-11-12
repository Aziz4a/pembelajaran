// Progress Tracking
document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.querySelector('.progress-bar');
    const tocItems = document.querySelectorAll('.toc-item');
    const contentSections = document.querySelectorAll('.content-card');
    
    // Update progress bar berdasarkan scroll
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
        
        // Update progress setiap section
        contentSections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                tocItems[index].classList.add('active');
                tocItems[index].dataset.progress = '100';
                updateOverallProgress();
            }
        });
    });
    
    // Smooth scroll untuk links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Interactive examples
    document.querySelectorAll('.reveal-item').forEach(item => {
        item.addEventListener('click', function() {
            this.classList.add('revealed');
        });
    });
    
    // Update overall progress
    function updateOverallProgress() {
        const total = tocItems.length;
        let completed = 0;
        tocItems.forEach(item => {
            if (item.dataset.progress === '100') completed++;
        });
        const progress = Math.round((completed / total) * 100);
        document.getElementById('overallProgress').textContent = progress + '%';
    }
    
    // Practice questions
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const isCorrect = this.dataset.correct === 'true';
            this.classList.add(isCorrect ? 'correct' : 'incorrect');
            if (isCorrect) {
                this.closest('.practice-question')
                    .querySelector('.feedback')
                    .classList.add('show');
            }
        });
    });
});

// Visual number examples
function animateNumber(element, final, duration = 1000) {
    const start = 0;
    const increment = final > start ? 1 : -1;
    const steps = Math.abs(final - start);
    const stepTime = duration / steps;
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current.toLocaleString();
        if (current === final) {
            clearInterval(timer);
        }
    }, stepTime);
}

// Initialize number animations when they come into view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const numberElement = entry.target.querySelector('.number-value');
            if (numberElement && numberElement.dataset.value) {
                animateNumber(numberElement, parseInt(numberElement.dataset.value));
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.number-example').forEach(example => {
    observer.observe(example);
});