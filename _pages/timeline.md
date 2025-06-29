---
title: "Timeline"
permalink: /timeline/
header:
  overlay_image: /assets/images/header_galaxy.jpg
  overlay_filter: 0.3
author_profile: true
layout: single
classes: wide
toc: true
toc_label: "Years"
toc_icon: "clock"
---

<link rel="stylesheet" href="{{ '/assets/css/layout-optimization.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/timeline.css' | relative_url }}">

<div class="timeline">
  {% for year_data in site.data.timeline.timeline %}
    <div class="timeline-year">
      <div class="timeline-year-header">
        <div class="timeline-year-title">{{ year_data.year }}</div>
      </div>
      
      {% for event in year_data.events %}
        <div class="timeline-event" style="animation-delay: {{ forloop.index | times: 0.1 }}s;">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            {% if event.month %}
              <div class="timeline-month">{{ event.month }}</div>
            {% endif %}
            
            <div class="timeline-title">{{ event.title }}</div>
            
            {% if event.logo %}
              <div class="timeline-logo">
                <img src="{{ event.logo | relative_url }}" alt="{{ event.logo_alt }}" />
              </div>
            {% endif %}
            
            <div class="timeline-description">
              {{ event.description }}
              
              {% if event.link %}
                <br><a href="{{ event.link }}" class="timeline-link" target="_blank" rel="noopener noreferrer">
                  {% if event.link_text %}{{ event.link_text }}{% else %}Learn More{% endif %}
                </a>
              {% endif %}
            </div>
          </div>
        </div>
      {% endfor %}
    </div>
  {% endfor %}
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.timeline-event').forEach(event => {
    event.style.animationPlayState = 'paused';
    observer.observe(event);
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
});
</script>
