
// ===== CARRUSEL HERO - CORREGIDO =====
class HeroCarrusel {
    constructor() {
        // IMÁGENES PARA EL CARRUSEL - PASTELERÍA ARTÍSTICA
        this.images = [
            './IMG/BANNER/1.jpeg',
            './IMG/BANNER/2.jpeg',
            './IMG/BANNER/3.jpeg',
            './IMG/BANNER/4.jpeg',
            './IMG/BANNER/5.jpeg',
        ];

        this.currentSlide = 0;
        this.slideInterval = 5000; // 5 segundos
        this.timer = null;
        this.isInitialized = false;

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        this.createSlides();
        this.createIndicators();
        this.preloadImages();
        this.startAutoSlide();
        this.bindEvents();

        this.isInitialized = true;
        console.log('Carrusel Hero inicializado correctamente');
    }

    createSlides() {
        const carruselContainer = document.querySelector('.hero-carrusel');
        if (!carruselContainer) return;

        // Limpiar contenedor
        carruselContainer.innerHTML = '';

        // Crear slides
        this.images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `carrusel-slide ${index === 0 ? 'active' : ''}`;
            slide.style.backgroundImage = `url('${image}')`;
            slide.setAttribute('data-index', index);

            // Forzar la carga de la primera imagen inmediatamente
            if (index === 0) {
                const img = new Image();
                img.src = image;
                img.onload = () => {
                    console.log('Primera imagen del carrusel cargada');
                };
            }

            carruselContainer.appendChild(slide);
        });
    }

    createIndicators() {
        const indicatorsContainer = document.querySelector('.carrusel-indicators');
        if (!indicatorsContainer) return;

        // Limpiar indicadores
        indicatorsContainer.innerHTML = '';

        // Crear indicadores
        this.images.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('data-index', index);
            indicator.addEventListener('click', () => this.goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });
    }

    preloadImages() {
        // Pre-cargar todas las imágenes
        this.images.forEach(img => {
            const image = new Image();
            image.src = img;
            image.onload = () => {
                console.log(`Imagen pre-cargada: ${img}`);
            };
        });
    }

    goToSlide(index) {
        const slides = document.querySelectorAll('.carrusel-slide');
        const indicators = document.querySelectorAll('.indicator');

        if (!slides.length || !indicators.length) return;

        // Remover clase active del slide actual
        slides[this.currentSlide].classList.remove('active');
        indicators[this.currentSlide].classList.remove('active');

        // Actualizar índice
        this.currentSlide = index;

        // Añadir clase active al nuevo slide
        slides[this.currentSlide].classList.add('active');
        indicators[this.currentSlide].classList.add('active');

        // Reiniciar el temporizador
        this.restartTimer();
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.images.length;
        this.goToSlide(nextIndex);
    }

    startAutoSlide() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => this.nextSlide(), this.slideInterval);
    }

    stopAutoSlide() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    restartTimer() {
        this.stopAutoSlide();
        this.startAutoSlide();
    }

    bindEvents() {
        // Pausar autoplay al interactuar
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => this.stopAutoSlide());
            heroSection.addEventListener('mouseleave', () => this.startAutoSlide());

            // Para móviles
            heroSection.addEventListener('touchstart', () => this.stopAutoSlide());
            heroSection.addEventListener('touchend', () => {
                setTimeout(() => this.startAutoSlide(), 3000);
            });
        }
    }
}

// ===== APLICACIÓN POSTRES DE CLAUDIA =====
class PasteleriaApp {
    constructor() {
        this.infoPagina = {
            nombre: "Postres de Claudia",
            whatsapp: "+123456789",
            moneda: "€",
            productos: [
                { id: 1, nombre: "Croissants Artesanales", precio: 2.50 },
                { id: 2, nombre: "Tarta de Chocolate Belga", precio: 28 },
                { id: 3, nombre: "Macarons Franceses", precio: 1.80 },
                { id: 4, nombre: "Tarta de Frutas Frescas", precio: 24 }
            ],
            añoFundacion: 1999
        };

        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupSmoothScroll();
        this.setupScrollAnimations();
        this.setupHeaderScroll();
        this.setupAnimations();
        this.setupWhatsAppButton();
        this.setupImageLoading();
        this.setupTradicionSlider();
        this.logInfo();

        // Inicializar carrusel hero inmediatamente
        setTimeout(() => {
            this.heroCarrusel = new HeroCarrusel();
        }, 100);

        // Marcar página como cargada
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 300);
    }

    setupMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const navList = document.querySelector('.nav-list');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!menuBtn || !navList) return;

        // Alternar menú
        menuBtn.addEventListener('click', () => {
            navList.classList.toggle('show');
            menuBtn.classList.toggle('active');
            menuBtn.innerHTML = navList.classList.contains('show')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';

            // Cambiar aria-label
            const isExpanded = navList.classList.contains('show');
            menuBtn.setAttribute('aria-label', isExpanded ? 'Cerrar menú' : 'Abrir menú');
            menuBtn.setAttribute('aria-expanded', isExpanded);
        });

        // Cerrar menú al hacer clic en un enlace
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('show');
                menuBtn.classList.remove('active');
                menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                menuBtn.setAttribute('aria-label', 'Abrir menú');
                menuBtn.setAttribute('aria-expanded', false);
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!navList.contains(e.target) && !menuBtn.contains(e.target)) {
                navList.classList.remove('show');
                menuBtn.classList.remove('active');
                menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    setupSmoothScroll() {
        const headerHeight = document.querySelector('header').offsetHeight;

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');

                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const targetPosition = targetElement.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Actualizar enlace activo
                    this.updateActiveLink(anchor);
                }
            });
        });
    }

    updateActiveLink(clickedLink) {
        // Remover clase active de todos los enlaces
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });

        // Agregar clase active al enlace clickeado
        clickedLink.classList.add('active');
        clickedLink.setAttribute('aria-current', 'page');
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observar elementos para animación
        const elementsToAnimate = [
            ...document.querySelectorAll('.card'),
            ...document.querySelectorAll('.feature-item'),
            ...document.querySelectorAll('.contact-card'),
            ...document.querySelectorAll('.stats'),
            ...document.querySelectorAll('.story-slider'),
            ...document.querySelectorAll('.shop-category'),
            document.querySelector('.story-content'),
            document.querySelector('.map-container-full'),
            document.querySelector('.hero-content')
        ];

        elementsToAnimate.forEach(el => {
            if (el) observer.observe(el);
        });
    }

    setupHeaderScroll() {
        const header = document.querySelector('header');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    setupAnimations() {
        // Efecto de aparición gradual
        const animatedElements = document.querySelectorAll('.animate-in');
        animatedElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
        });
    }

    setupWhatsAppButton() {
        const whatsappBtn = document.querySelector('.btn-whatsapp');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => {
                console.log('Botón de WhatsApp clickeado');
            });
        }
    }

    setupImageLoading() {
        // Lazy loading mejorado
        const images = document.querySelectorAll('img');

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // Añadir clase de cargado
                    img.classList.add('loaded');

                    // Si tiene data-src, cargar imagen
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }

                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        images.forEach(img => {
            img.classList.add('loading');
            imageObserver.observe(img);
        });
    }

    setupTradicionSlider() {
        setTimeout(() => {
            this.tradicionSlider = new TradicionSlider();
            console.log('Slider de tradición inicializado correctamente');
        }, 500);
    }

    logInfo() {
        console.log(`🍰 ${this.infoPagina.nombre} - Cargado correctamente`);
        console.log(`📞 Contacto: ${this.infoPagina.whatsapp}`);
        console.log(`🎂 Productos disponibles: ${this.infoPagina.productos.length}`);
        console.log(`📅 Fundado en: ${this.infoPagina.añoFundacion}`);
        console.log(`💰 Moneda: ${this.infoPagina.moneda}`);
    }
}

// ===== ABRIR PREGUNTAS FRECUENTES =====
document.addEventListener('DOMContentLoaded', function () {
    // Seleccionar todos los elementos de pregunta
    const faqItems = document.querySelectorAll('.faq-item');

    // Agregar evento click a cada pregunta
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            // Si el item clickeado ya está activo, solo lo cerramos
            if (item.classList.contains('active')) {
                item.classList.remove('active');
            } else {
                // Cerrar todos los otros items abiertos
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });

                // Abrir el item clickeado
                item.classList.add('active');
            }
        });
    });

    // Opcional: Abrir la primera pregunta por defecto
    faqItems[0].classList.add('active');
});


// ===== SLIDER DE SHOP =====
// Lógica para manejar múltiples carruseles infinitos
        const modal = document.getElementById("imageModal");
        const modalImg = document.getElementById("imgFullSize");
        const closeBtn = document.getElementById("closeBtn");
        const carousels = document.querySelectorAll('.carousel-container');

        carousels.forEach((carousel) => {
            const track = carousel.querySelector('.carousel-track');
            const nextBtn = carousel.querySelector('.next-btn');
            const prevBtn = carousel.querySelector('.prev-btn');
            const originalCards = Array.from(track.children);
            
            let isTransitioning = false;
            let index = originalCards.length; // Posición inicial después de los clones

             // 1. CLONACIÓN INFINITA
            originalCards.forEach(card => {
                track.appendChild(card.cloneNode(true));
                track.insertBefore(card.cloneNode(true), track.firstChild);
            });

            const updatePosition = (smooth = true) => {
                const cardWidth = track.querySelector('.product-card').getBoundingClientRect().width;
                track.style.transition = smooth ? 'transform 0.5s ease-in-out' : 'none';
                track.style.transform = `translateX(-${index * cardWidth}px)`;
            };

            // 2. EVENTO CLICK PARA EL MODAL (Delegación de eventos para capturar clones)
            track.addEventListener('click', (e) => {
                if(e.target.classList.contains('zoomable')) {
                    modal.style.display = "flex";
                    modalImg.src = e.target.src;
                }
            });

            // 3. NAVEGACIÓN
            nextBtn.addEventListener('click', () => {
                if (isTransitioning) return;
                isTransitioning = true; index++; updatePosition();
            });

            prevBtn.addEventListener('click', () => {
                if (isTransitioning) return;
                isTransitioning = true; index--; updatePosition();
            });

            track.addEventListener('transitionend', () => {
                isTransitioning = false;
                const totalOriginals = originalCards.length;
                if (index >= totalOriginals * 2) { index = totalOriginals; updatePosition(false); }
                if (index < totalOriginals) { index = totalOriginals * 2 - 1; updatePosition(false); }
            });

            window.addEventListener('load', () => updatePosition(false));
            window.addEventListener('resize', () => updatePosition(false));
        });

        // 4. CERRAR MODAL
        closeBtn.onclick = () => modal.style.display = "none";
        window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; 
            
        };
    


// ===== SLIDER DE TRADICIÓN =====
class TradicionSlider {
    constructor() {
        this.slider = document.getElementById('tradicionSlider');
        if (!this.slider) {
            console.error('No se encontró el elemento #tradicionSlider');
            return;
        }

        this.slides = Array.from(this.slider.querySelectorAll('.slide'));
        this.dots = Array.from(document.querySelectorAll('.slider-dot'));
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.autoSlideInterval = null;
        this.autoSlideDelay = 3000;
        this.isTransitioning = false;
        this.transitionDuration = 500;

        console.log(`Slider de tradición encontrado con ${this.totalSlides} slides`);

        this.init();
    }

    init() {
        this.preloadImages();
        this.updateSlides();

        // Event listeners
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Event listeners para dots
        this.dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.dataset.slide) - 1;
                this.goToSlide(slideIndex);
            });
        });

        // Iniciar autoplay
        setTimeout(() => {
            this.startAutoSlide();
        }, 900);

        // Pausar autoplay al interactuar
        if (this.slider) {
            this.slider.addEventListener('mouseenter', () => this.stopAutoSlide());
            this.slider.addEventListener('mouseleave', () => this.startAutoSlide());

            this.slider.addEventListener('touchstart', () => this.stopAutoSlide());
            this.slider.addEventListener('touchend', () => {
                setTimeout(() => this.startAutoSlide(), 1000);
            });
        }
    }

    preloadImages() {
        this.slides.forEach(slide => {
            const img = slide.querySelector('.slide-img');
            if (img) {
                const preloadImg = new Image();
                preloadImg.src = img.src;
            }
        });
    }

    updateSlides() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next');

            if (index === this.currentSlide) {
                slide.classList.add('active');
            } else if (index === (this.currentSlide - 1 + this.totalSlides) % this.totalSlides) {
                slide.classList.add('prev');
            } else if (index === (this.currentSlide + 1) % this.totalSlides) {
                slide.classList.add('next');
            }
        });

        this.updateDots();

        setTimeout(() => {
            this.isTransitioning = false;
        }, this.transitionDuration);
    }

    updateDots() {
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    nextSlide() {
        if (this.isTransitioning) return;
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlides();
        this.resetAutoSlide();
    }

    prevSlide() {
        if (this.isTransitioning) return;
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlides();
        this.resetAutoSlide();
    }

    goToSlide(index) {
        if (this.isTransitioning || index < 0 || index >= this.totalSlides || index === this.currentSlide) {
            return;
        }
        this.currentSlide = index;
        this.updateSlides();
        this.resetAutoSlide();
    }

    startAutoSlide() {
        if (this.autoSlideInterval) return;
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoSlideDelay);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    resetAutoSlide() {
        this.stopAutoSlide();
        if (!this.slider.matches(':hover')) {
            setTimeout(() => this.startAutoSlide(), this.autoSlideDelay);
        }
    }
}




// ===== INICIALIZAR APLICACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    window.pasteleriaApp = new PasteleriaApp();

    // Asegurar que las imágenes tengan alt text
    document.querySelectorAll('img:not([alt])').forEach(img => {
        img.setAttribute('alt', 'Imagen decorativa de Postres de Claudia');
    });
});

// ===== POLYFILLS PARA COMPATIBILIDAD =====
if (!window.IntersectionObserver) {
    console.warn('IntersectionObserver no soportado, cargando polyfill...');
}
