// Timeline Enhancement Script
document.addEventListener('DOMContentLoaded', function() {
  // Intersection Observer for timeline animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Observe all timeline events
  document.querySelectorAll('.timeline-event').forEach(event => {
    event.style.animationPlayState = 'paused';
    observer.observe(event);
  });

  // Add smooth scrolling for timeline navigation
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

  // Add hover effects for timeline logos
  document.querySelectorAll('.timeline-logo img').forEach(img => {
    img.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1)';
      this.style.transition = 'transform 0.3s ease';
    });
    
    img.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
  });

  // Add progress indicator
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const progressBar = document.createElement('div');
    progressBar.className = 'timeline-progress';
    progressBar.innerHTML = '<div class="timeline-progress-bar"></div>';
    timeline.appendChild(progressBar);

    // Update progress on scroll
    window.addEventListener('scroll', function() {
      const timelineRect = timeline.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (windowHeight - timelineRect.top) / (windowHeight + timelineRect.height)));
      
      const progressBar = document.querySelector('.timeline-progress-bar');
      if (progressBar) {
        progressBar.style.height = (progress * 100) + '%';
      }
    });
  }
});
