document.addEventListener("DOMContentLoaded", () => {
    let currentSlideIndex = 0;
    let slidesTotal = 0;
    let slidesContainer = null;
    let autoplayInterval = null;
    let isMobile = false;
    let slideWidth = 0;

    function toggleMobileMenu(button, event) {
        event = event || window.event;

        const menu = document.querySelector(".menu");
        if (!menu) return;

        menu.classList.toggle("active");
        button.classList.toggle("active");

        if (menu.classList.contains("active")) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        return false;
    }

    function nextSlide(event) {
        event = event || window.event;

        if (!slidesContainer) {
            initSlider();
        }
        
        if (slidesTotal <= 1) return false;

        currentSlideIndex = (currentSlideIndex + 1) % slidesTotal;
        updateSlider();
        resetAutoplay();

        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        return false;
    }

    function prevSlide(event) {
        event = event || window.event;

        if (!slidesContainer) {
            initSlider();
        }
        
        if (slidesTotal <= 1) return false;

        currentSlideIndex = (currentSlideIndex - 1 + slidesTotal) % slidesTotal;
        updateSlider();
        resetAutoplay();

        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        return false;
    }

    function initSlider() {
        slidesContainer = document.querySelector(".testimonials-slider");
        if (!slidesContainer) return;
        
        const slides = slidesContainer.querySelectorAll(".testimonial-card");
        slidesTotal = slides.length;
        
        if (slidesTotal <= 0) return;
        
        slidesContainer.style.display = "flex";
        slidesContainer.style.transition = "transform 0.5s ease";
        
        updateSlideWidth();
        
        createDots();
    }

    function updateSlideWidth() {
        if (!slidesContainer) return;
        
        const slide = slidesContainer.querySelector(".testimonial-card");
        if (!slide) return;
        
        const slideStyle = window.getComputedStyle(slide);
        const marginLeft = parseFloat(slideStyle.marginLeft);
        const marginRight = parseFloat(slideStyle.marginRight);
        
        slideWidth = slide.offsetWidth + marginLeft + marginRight;
    }

    function updateSlider() {
        if (!slidesContainer || slidesTotal <= 0) return;
        
        updateSlideWidth();
        
        const translateValue = -currentSlideIndex * slideWidth;
        slidesContainer.style.transform = `translateX(${translateValue}px)`;

        updateDots();
    }
    
    function createDots() {
        const dotsContainer = document.querySelector(".testimonial-dots");
        if (!dotsContainer) return;
        
        dotsContainer.innerHTML = '';
        
        for (let i = 0; i < slidesTotal; i++) {
            const dot = document.createElement("span");
            dot.classList.add("dot");
            if (i === currentSlideIndex) {
                dot.classList.add("active");
            }
            
            dot.addEventListener("click", () => {
                currentSlideIndex = i;
                updateSlider();
                resetAutoplay();
            });
            
            dotsContainer.appendChild(dot);
        }
    }
    
    function updateDots() {
        const dots = document.querySelectorAll(".dot");
        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === currentSlideIndex);
        });
    }

    function startAutoplay() {
        stopAutoplay();
        if (slidesTotal > 1) {
            autoplayInterval = setInterval(nextSlide, 5000);
        }
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    function setupMobileMenu() {
        const mobileMenuButton = document.querySelector(".mobile-menu");
        if (!mobileMenuButton) return;

        mobileMenuButton.addEventListener("click", function (e) {
            toggleMobileMenu(this, e);
        });

        mobileMenuButton.addEventListener("touchstart", function (e) {
            toggleMobileMenu(this, e);
        }, { passive: false });

        document.addEventListener("click", function (e) {
            const menu = document.querySelector(".menu");
            if (
                menu &&
                menu.classList.contains("active") &&
                !menu.contains(e.target) &&
                mobileMenuButton !== e.target &&
                !mobileMenuButton.contains(e.target)
            ) {
                toggleMobileMenu(mobileMenuButton, e);
            }
        });
    }

    function setupNewsletterForm() {
        const newsletterForm = document.querySelector(".newsletter-form");

        if (!newsletterForm) return;

        newsletterForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const emailInput = this.querySelector("input[type='email']");
            if (emailInput.value) {
                alert("Спасибо за подписку на новости!");
                emailInput.value = "";
            }
        });
    }

    function setupRouteCardEffects() {
        const routeCards = document.querySelectorAll(".route-card");
        const bookmarks = document.querySelectorAll(".route-bookmark");

        routeCards.forEach((card) => {
            card.addEventListener("mouseenter", () => {
                const decorativeLine = card.querySelector(
                    ".route-decorative-line"
                );
                if (decorativeLine) {
                    decorativeLine.style.width = "90%";
                    decorativeLine.style.opacity = "0.7";
                }
            });

            card.addEventListener("mouseleave", () => {
                const decorativeLine = card.querySelector(
                    ".route-decorative-line"
                );
                if (decorativeLine) {
                    decorativeLine.style.width = "70%";
                    decorativeLine.style.opacity = "0.4";
                }
            });
        });

        bookmarks.forEach((bookmark) => {
            bookmark.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                bookmark.classList.toggle("active");
            });
        });
    }

    function setupTestimonialSlider() {
        initSlider();
        if (!slidesContainer) return;

        const prevButton = document.querySelector(".testimonial-control.prev");
        const nextButton = document.querySelector(".testimonial-control.next");

        if (prevButton) {
            prevButton.addEventListener("click", prevSlide);
            prevButton.addEventListener("touchstart", prevSlide, {
                passive: false,
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", nextSlide);
            nextButton.addEventListener("touchstart", nextSlide, {
                passive: false,
            });
        }

        window.addEventListener("resize", () => {
            updateSlideWidth();
            updateSlider();
        });

        startAutoplay();

        slidesContainer.addEventListener("mouseenter", stopAutoplay);
        slidesContainer.addEventListener("touchstart", stopAutoplay, {
            passive: true,
        });

        slidesContainer.addEventListener("mouseleave", startAutoplay);
        slidesContainer.addEventListener("touchend", startAutoplay, {
            passive: true,
        });
    }

    function handleLoadingScreen() {
        const loadingScreen = document.querySelector(".loading-screen");
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add("hidden");
                setTimeout(() => {
                    document.body.style.overflow = "";
                }, 500);
            }, 800);
        }
    }

    function setupParallaxEffect() {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;
      
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            if (scrollPosition < 600) {
                const trackLines = heroSection.querySelector('.track-lines');
                if (trackLines) {
                    trackLines.style.transform = `translateY(${scrollPosition * 0.2}px)`;
                }
                
                const heroContent = heroSection.querySelector('.hero-content');
                if (heroContent) {
                    heroContent.style.transform = `translateY(${scrollPosition * 0.1}px)`;
                    heroContent.style.opacity = 1 - (scrollPosition * 0.002);
                }
            }
        });
    }

    function detectMobile() {
        return window.innerWidth < 768 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    handleLoadingScreen();
    setupMobileMenu();
    setupNewsletterForm();
    setupRouteCardEffects();
    setupParallaxEffect();
    setupTestimonialSlider();

    window.addEventListener("resize", function () {
        isMobile = detectMobile();
        if (isMobile) {
            document.body.classList.add("mobile-device");
        } else {
            document.body.classList.remove("mobile-device");
        }
    });
});