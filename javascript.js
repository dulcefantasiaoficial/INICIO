// ===== CONFIGURACIÓN =====
        const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRx34Ws_0kbm1luCkXcI0Zrv2qpU1qMSktahpi72x8Znw1dWVAc7kPZEop5J4aF86MTDFwwfdj5Ngyn/pub?gid=0&single=true&output=csv';

        // Variables globales para CONTENIDO 1
        let products = [];
        let currentProduct = null;
        let isEditMode = false;
        let editItemId = null;

        // Variables globales para CONTENIDO 2
        let allProducts = [];
        let displayedProducts = [];
        let currentDisplayCount = 0;
        const INITIAL_LOAD = 12;
        const LOAD_MORE = 8;
        let isLoading = false;
        let hasMoreProducts = true;
        
        let currentFilter = 'all';
        let currentSort = 'default';
        let currentSearchTerm = '';

        // Elementos del DOM
        const content1 = document.getElementById('content-001');
        const content2 = document.getElementById('content-002');
        const homeLink = document.getElementById('homeLink');
        const shopLink = document.getElementById('shopLink');
        const masProductos= document.getElementById('masProductos');
        const especialidadesLink = document.getElementById('especialidadesLink');
        const nosotrosLink = document.getElementById('nosotrosLink');
        const contactoLink = document.getElementById('contactoLink');
        const backToHomeBtn = document.getElementById('backToHomeBtn');
        const homeLogo = document.getElementById('homeLogo');
        const footerHomeLogo = document.getElementById('footerHomeLogo');

        // Elementos del DOM para carga infinita (CONTENIDO 2)
        const loaderContainer = document.getElementById('loaderContainer');
        const endMessage = document.getElementById('endMessage');
        const searchInput = document.getElementById('searchInput');

        // ===== FUNCIÓN PARA CAMBIAR ENTRE CONTENIDOS CON PROMISE =====
function showContent(contentNumber) {
    if (contentNumber === 1) {
        content1.style.display = 'block';
        content2.style.display = 'none';
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        homeLink.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } else if (contentNumber === 2) {
        content1.style.display = 'none';
        content2.style.display = 'block';
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        shopLink.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Mostrar loader mientras se cargan los productos
        const grid = document.getElementById('productsGrid');
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-pink);"></i>
                    <p>Cargando productos...</p>
                </div>
            `;
        }
        
        // Si los productos ya están cargados, mostrarlos inmediatamente
        if (allProducts.length > 0) {
            console.log('Productos ya cargados, mostrando...');
            applyFiltersAndSort();
        } else {
            console.log('Esperando que terminen de cargar los productos...');
            // Esperar a que terminen de cargar
            loadProductsFromSheets().then(() => {
                applyFiltersAndSort();
            });
        }
    }
}

        // ===== FUNCIÓN PARA EXTRAER PRECIO DE UN TEXTO =====
        function extractPriceFromText(text) {
            if (!text) return 0;
            const match = text.match(/\+(\d+(\.\d+)?)/);
            return match ? parseFloat(match[1]) : 0;
        }

        // ===== CARGAR PRODUCTOS DESDE GOOGLE SHEETS CON PROMISE =====
async function loadProductsFromSheets() {
    return new Promise(async (resolve) => {
        try {
            console.log('Cargando productos desde Google Sheets...');

            const variableTrack = document.getElementById('carousel-variable');
            const personalizadasTrack = document.getElementById('carousel-personalizadas');
            
            if (variableTrack) {
                variableTrack.innerHTML = '<div style="padding: 20px; text-align: center;">Cargando productos...</div>';
            }
            if (personalizadasTrack) {
                personalizadasTrack.innerHTML = '<div style="padding: 20px; text-align: center;">Cargando productos...</div>';
            }

            const response = await fetch(GOOGLE_SHEETS_CSV_URL);
            const csvText = await response.text();
            const lines = csvText.split('\n');
            products = [];

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
                const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());

                if (cleanValues.length >= 11) {
                    const tamanos = cleanValues[5] ? cleanValues[5].split(',').map(s => s.trim()) : [];
                    const saboresKeke = cleanValues[6] ? cleanValues[6].split(',').map(s => s.trim()) : [];
                    const saboresRelleno = cleanValues[7] ? cleanValues[7].split(',').map(s => s.trim()) : [];
                    const adicionales = cleanValues[8] ? cleanValues[8].split(',').map(s => s.trim()) : [];

                    const detalles = [];
                    for (let d = 9; d <= 13; d++) {
                        if (cleanValues[d] && cleanValues[d].trim() !== '') {
                            detalles.push(cleanValues[d]);
                        }
                    }

                    const categorias = cleanValues[14] ? cleanValues[14].split(',').map(c => c.trim()) : [];

                    const product = {
                        id: cleanValues[0] || `prod-${i}`,
                        nombre: cleanValues[1] || 'Producto sin nombre',
                        precio: parseFloat(cleanValues[2]) || 0,
                        imagen: cleanValues[3] || '',
                        descripcion: cleanValues[4] || 'Sin descripción disponible',
                        tamanos: tamanos,
                        saboresKeke: saboresKeke,
                        saboresRelleno: saboresRelleno,
                        adicionales: adicionales,
                        detalles: detalles,
                        categorias: categorias
                    };

                    products.push(product);
                }
            }

            console.log(`✅ Cargados ${products.length} productos desde Google Sheets`);

            if (products.length === 0) {
                products = getBackupProducts();
            }

            allProducts = [...products];
            renderCarousels();
            
            resolve(products); // ¡Importante! Resolver la promesa

        } catch (error) {
            console.error('❌ Error cargando desde Google Sheets:', error);
            products = getBackupProducts();
            allProducts = [...products];
            renderCarousels();
            resolve(products); // Resolver incluso con error
        }
    });
}

        // ===== DATOS DE RESPALDO =====
        function getBackupProducts() {
            return [
                {
                    id: 'sv1',
                    nombre: 'San Valentín N°01',
                    precio: 65.00,
                    imagen: 'https://lh3.googleusercontent.com/pw/AP1GczN_RuyH3WZ_t-brvw1tamJHzWG6TOoHcDo5Icl_2E3PFj2Nps3U6-qjTnLQ7c_0Cpw8KUmGufT6dqnjgtN6jPPcmG1cxn9eEbyE6houUD63_tmukNZvx8MYSuZX-AXvDHcqgUsGKjNXzUvXMyJQopSj=w1037-h1037-s-no-gm?authuser=0',
                    descripcion: 'Hermosa torta decorada con fresas frescas y crema pastelera',
                    tamanos: ['Pequeño (+s/0)', 'Mediano (+s/20)', 'Grande (+s/35)'],
                    saboresKeke: ['Vainilla', 'Chocolate', 'Marmoleado', 'Red Velvet'],
                    saboresRelleno: ['Manjar Blanco', 'Fudge', 'Buttercream', 'Ganache'],
                    adicionales: ['Ninguno (+s/0)', 'Velita simple (+s/5)', 'Velita volcán (+s/10)', 'Vela número (+s/5)'],
                    detalles: ['Fresas frescas seleccionadas', 'Crema pastelera artesanal', 'Bizcocho de vainilla'],
                    categorias: ['Mujer', 'Love']
                },
                {
                    id: 'sv2',
                    nombre: 'Mini Torta Love',
                    precio: 35.00,
                    imagen: 'https://lh3.googleusercontent.com/pw/AP1GczN_RuyH3WZ_t-brvw1tamJHzWG6TOoHcDo5Icl_2E3PFj2Nps3U6-qjTnLQ7c_0Cpw8KUmGufT6dqnjgtN6jPPcmG1cxn9eEbyE6houUD63_tmukNZvx8MYSuZX-AXvDHcqgUsGKjNXzUvXMyJQopSj=w1037-h1037-s-no-gm?authuser=0',
                    descripcion: 'Mini torta individual con corazón de chocolate',
                    tamanos: ['Pequeño (+s/0)', 'Grande (+s/20)'],
                    saboresKeke: ['Vainilla', 'Chocolate'],
                    saboresRelleno: ['Ganache', 'Crema'],
                    adicionales: ['Ninguno (+s/0)', 'Velita simple (+s/5)'],
                    detalles: ['Bizcocho de chocolate', 'Relleno de ganache'],
                    categorias: ['Love']
                },
                {
                    id: 'tp1',
                    nombre: 'Torta 70 Años',
                    precio: 250.00,
                    imagen: 'https://lh3.googleusercontent.com/pw/AP1GczOrpyrFLMUjIizJyfZwkgT98_oRnEd1yjpRWE_JhpJjlQe0KACfqWaIW8aURwfJIu9DqAvFieYv-6q2cliEQwBeYRH5H0ER6Ik68J_T4eQLjakYUos8KIDhwozHyyEyHA6QJckYoHYMXLBEUuCRAO4Y=w1037-h1037-s-no-gm?authuser=0',
                    descripcion: 'Torta elegante para celebrar 70 años',
                    tamanos: ['Pequeño (+s/0)', 'Grande (+s/30)'],
                    saboresKeke: ['Vainilla', 'Chocolate'],
                    saboresRelleno: ['Dulce de Leche', 'Crema Pastelera'],
                    adicionales: ['Ninguno (+s/0)', 'Velita número (+s/5)'],
                    detalles: ['Bizcocho de 3 capas', 'Relleno de dulce de leche', 'Cobertura de fondant'],
                    categorias: ['Personalizadas']
                },
                {
                    id: 'in1',
                    nombre: 'Individual Chocolate',
                    precio: 25.00,
                    imagen: 'https://lh3.googleusercontent.com/pw/AP1GczN_RuyH3WZ_t-brvw1tamJHzWG6TOoHcDo5Icl_2E3PFj2Nps3U6-qjTnLQ7c_0Cpw8KUmGufT6dqnjgtN6jPPcmG1cxn9eEbyE6houUD63_tmukNZvx8MYSuZX-AXvDHcqgUsGKjNXzUvXMyJQopSj=w1037-h1037-s-no-gm?authuser=0',
                    descripcion: 'Torta individual de chocolate',
                    tamanos: ['Individual (+s/0)'],
                    saboresKeke: ['Chocolate'],
                    saboresRelleno: ['Ganache'],
                    adicionales: ['Ninguno (+s/0)'],
                    detalles: ['Porción individual', 'Ideal para un momento especial'],
                    categorias: ['Individuales']
                }
            ];
        }

        // ===== RENDERIZAR CARRUSELES (CONTENIDO 1) =====
        function renderCarousels() {
            const variableProducts = products.filter(p => p.categorias && p.categorias.includes('Mujer'));
            const personalizadasProducts = products.filter(p => p.categorias && p.categorias.includes('Personalizadas'));

            renderCarousel('carousel-variable', variableProducts);
            renderCarousel('carousel-personalizadas', personalizadasProducts);

            setTimeout(() => initCarousels(), 100);
        }

        // ===== RENDERIZAR UN CARRUSEL ESPECÍFICO =====
        function renderCarousel(elementId, productsList) {
            const track = document.getElementById(elementId);
            if (!track) return;

            if (productsList.length === 0) {
                track.innerHTML = '<div style="padding: 20px; text-align: center;">No hay productos disponibles</div>';
                return;
            }

            const allProductsList = [...productsList, ...productsList, ...productsList];

            track.innerHTML = allProductsList.map(product => {
                return `
                <li class="product-card" data-product-id="${product.id}">
                    <div class="card-content">
                        <div class="image-wrapper">
                            <img src="${product.imagen}" 
                                 class="zoomable" 
                                 alt="${product.nombre}" 
                                 loading="lazy"
                                 data-nombre="${product.nombre}"
                                 data-precio="${product.precio}"
                                 data-descripcion="${product.descripcion}"
                                 data-tamanos='${JSON.stringify(product.tamanos)}'
                                 data-saboreskeke='${JSON.stringify(product.saboresKeke)}'
                                 data-saboresrelleno='${JSON.stringify(product.saboresRelleno)}'
                                 data-adicionales='${JSON.stringify(product.adicionales)}'
                                 data-detalles='${JSON.stringify(product.detalles)}'
                                 data-categoria="${product.categorias[0] || 'General'}">
                            <button class="add-to-cart-bar add-to-cart-btn">AÑADIR AL CARRITO</button>
                        </div>
                        <div class="product-info">
                            <div class="product-name">${product.nombre}</div>
                            <div class="product-price">s/${product.precio.toFixed(2)}</div>
                        </div>
                    </div>
                </li>
            `}).join('');
        }

        // ===== INICIALIZAR CARRUSELES (efecto infinito) =====
        function initCarousels() {
            document.querySelectorAll('.carousel-container').forEach((carousel) => {
                const track = carousel.querySelector('.carousel-track');
                const nextBtn = carousel.querySelector('.next-btn');
                const prevBtn = carousel.querySelector('.prev-btn');
                if (!track || !nextBtn || !prevBtn) return;

                const cards = Array.from(track.children);
                if (cards.length === 0) return;
                
                const originalCount = Math.floor(cards.length / 3);
                let index = originalCount;
                let isTransitioning = false;

                const updatePosition = (smooth = true) => {
                    const firstCard = track.querySelector('.product-card');
                    if (!firstCard) return;
                    
                    const cardWidth = firstCard.getBoundingClientRect().width;
                    track.style.transition = smooth ? 'transform 0.5s ease-in-out' : 'none';
                    track.style.transform = `translateX(-${index * cardWidth}px)`;
                };

                track.addEventListener('click', (e) => {
                    const img = e.target.closest('.zoomable');
                    if (img) {
                        e.preventDefault();
                        window.openProductModal(img);
                    }
                });

                nextBtn.addEventListener('click', () => {
                    if (isTransitioning) return;
                    isTransitioning = true;
                    index++;
                    updatePosition();
                });

                prevBtn.addEventListener('click', () => {
                    if (isTransitioning) return;
                    isTransitioning = true;
                    index--;
                    updatePosition();
                });

                track.addEventListener('transitionend', () => {
                    isTransitioning = false;
                    const total = originalCount;
                    if (index >= total * 2) { 
                        index = total; 
                        updatePosition(false); 
                    }
                    if (index < total) { 
                        index = total * 2 - 1; 
                        updatePosition(false); 
                    }
                });

                setTimeout(() => updatePosition(false), 100);
                
                window.addEventListener('resize', () => {
                    updatePosition(false);
                });
            });
        }

        // ===== FUNCIONES PARA CONTENIDO 2 =====
        function applyFiltersAndSort() {
            let filtered = currentFilter === 'all'
                ? [...allProducts]
                : allProducts.filter(p => p.categorias && p.categorias.includes(currentFilter));
            
            if (currentSearchTerm.trim() !== '') {
                const searchLower = currentSearchTerm.toLowerCase().trim();
                filtered = filtered.filter(p => 
                    p.nombre.toLowerCase().includes(searchLower) || 
                    (p.descripcion && p.descripcion.toLowerCase().includes(searchLower))
                );
            }

            switch (currentSort) {
                case 'price-asc':
                    filtered.sort((a, b) => a.precio - b.precio);
                    break;
                case 'price-desc':
                    filtered.sort((a, b) => b.precio - a.precio);
                    break;
                case 'name-asc':
                    filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
                    break;
                case 'name-desc':
                    filtered.sort((a, b) => b.nombre.localeCompare(a.nombre));
                    break;
            }

            displayedProducts = filtered;
            currentDisplayCount = 0;
            hasMoreProducts = displayedProducts.length > 0;
            
            if (loaderContainer) loaderContainer.classList.remove('show');
            if (endMessage) endMessage.classList.remove('show');
            
            renderMoreProducts(true);
        }

        function renderMoreProducts(reset = false) {
            const grid = document.getElementById('productsGrid');
            if (!grid) return;

            if (reset) {
                grid.innerHTML = '';
                currentDisplayCount = 0;
            }

            if (displayedProducts.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                        <i class="fas fa-search" style="font-size: 2rem; color: var(--primary-pink); opacity: 0.5;"></i>
                        <p>No hay productos en esta categoría</p>
                    </div>
                `;
                if (loaderContainer) loaderContainer.classList.remove('show');
                if (endMessage) endMessage.classList.remove('show');
                return;
            }

            const nextCount = reset ? INITIAL_LOAD : currentDisplayCount + LOAD_MORE;
            const productsToShow = displayedProducts.slice(0, nextCount);
            
            grid.innerHTML = productsToShow.map(product => {
                const primaryCategory = product.categorias && product.categorias.length > 0 ? product.categorias[0] : 'General';
                return `
                <div class="product-card" data-product-id="${product.id}" data-categoria="${primaryCategory}" data-precio="${product.precio}" data-nombre="${product.nombre}">
                    <div class="card-content">
                        <div class="image-wrapper">
                            <img src="${product.imagen}" 
                                 class="zoomable" 
                                 alt="${product.nombre}" 
                                 loading="lazy"
                                 data-nombre="${product.nombre}"
                                 data-precio="${product.precio}"
                                 data-descripcion="${product.descripcion}"
                                 data-tamanos='${JSON.stringify(product.tamanos)}'
                                 data-saboreskeke='${JSON.stringify(product.saboresKeke)}'
                                 data-saboresrelleno='${JSON.stringify(product.saboresRelleno)}'
                                 data-adicionales='${JSON.stringify(product.adicionales)}'
                                 data-detalles='${JSON.stringify(product.detalles)}'
                                 data-categoria="${primaryCategory}"
                                 onclick="window.openProductModal(this)">
                            <button class="add-to-cart-bar add-to-cart-btn">AÑADIR AL CARRITO</button>
                        </div>
                        <div class="product-info">
                            <div class="product-name">${product.nombre}</div>
                            <div class="product-price">s/${product.precio.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `}).join('');

            currentDisplayCount = productsToShow.length;
            
            if (currentDisplayCount >= displayedProducts.length) {
                hasMoreProducts = false;
                if (loaderContainer) loaderContainer.classList.remove('show');
                if (endMessage) endMessage.classList.add('show');
            } else {
                hasMoreProducts = true;
                if (loaderContainer) loaderContainer.classList.remove('show');
                if (endMessage) endMessage.classList.remove('show');
            }
        }

        function setupInfiniteScroll() {
            window.addEventListener('scroll', () => {
                if (isLoading || !hasMoreProducts || content2.style.display !== 'block') return;
                
                const scrollPosition = window.innerHeight + window.scrollY;
                const threshold = document.body.offsetHeight - 200;
                
                if (scrollPosition >= threshold) {
                    isLoading = true;
                    if (loaderContainer) loaderContainer.classList.add('show');
                    
                    setTimeout(() => {
                        renderMoreProducts();
                        isLoading = false;
                    }, 500);
                }
            });
        }

        function setupSearch() {
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    currentSearchTerm = e.target.value;
                    applyFiltersAndSort();
                });
            }
        }

        function setupFiltersToggle() {
            const filtersSection = document.getElementById('filtersSection');
            const shopSection = document.getElementById('shop2');
            const toggleBtn = document.getElementById('toggleFilters');
            const toggleIcon = document.getElementById('toggleIcon');
            
            if (toggleBtn && filtersSection && shopSection) {
                toggleBtn.addEventListener('click', () => {
                    filtersSection.classList.toggle('collapsed');
                    shopSection.classList.toggle('expanded');
                    
                    if (filtersSection.classList.contains('collapsed')) {
                        toggleIcon.classList.remove('fa-angles-left');
                        toggleIcon.classList.add('fa-angles-right');
                    } else {
                        toggleIcon.classList.remove('fa-angles-right');
                        toggleIcon.classList.add('fa-angles-left');
                    }
                });
            }
        }

        function initFilters() {
            const filterButtons = document.querySelectorAll('.filter-btn');
            const sortSelect = document.getElementById('sortSelect');

            filterButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentFilter = btn.dataset.filter;
                    applyFiltersAndSort();
                });
            });

            if (sortSelect) {
                sortSelect.addEventListener('change', (e) => {
                    currentSort = e.target.value;
                    applyFiltersAndSort();
                });
            }
        }

        // ===== HERO CARRUSEL =====
        class HeroCarrusel {
            constructor() {
                this.images = [
                    'https://lh3.googleusercontent.com/pw/AP1GczOPQ8wvSCAdvC0XlFugAfTWj9cP0RGu3aBvkqaTy8AruFPD9RZhnj-T0uPqUb2wQl8PtSeHQjyGareJ5QPpGB-SG7rIVY1wrIfa9MsbuJRQgp5JnXnch5Xd7UP68RjlrZhDmAvB6j6DL5QEwZ8a4_HS=w976-h467-s-no-gm?authuser=0',
                    'https://lh3.googleusercontent.com/pw/AP1GczPzGgYvJxcfwBQuGCtWIVuPi70YrGtYzlUY0EA9dm00FhlGtVLLcEqmH6UWPt3e8PzLa4rNoO0OBNzkXYSAuhvS9n_qu1MaHHn-5mYFLEAE86vJDnXgewyRVw7iAfBEpADxMM2zMfIUYfOsei4yrE0W=w976-h467-s-no-gm?authuser=0',
                    'https://lh3.googleusercontent.com/pw/AP1GczOyZ_DvYBSb4bbJAeNK9pU3VFfbcGF5C2MEkNPxrdjUzBmAW_5J2e3wzIv_P24_ZNhKTuV8V3z_70IrF8GKGDaZutgspRDq7gRbCDXUGpYI24EPsYH7UpBHD619vZw7X7HLeqEHzloTGADrrmKBG3RY=w976-h467-s-no-gm?authuser=0',
                    'https://lh3.googleusercontent.com/pw/AP1GczNBU1ackESlUIsVAzGE7bRYJ4-0CQBKIxzjbFfMArT0F2S56uUGTbPC5cJBT92npc4kymyC23FJdkwojIx65rEcqOrwRTqXdZckbUOEaMgRr1Qzgq3RavoSoxFtbak9ghte6A9qLYjcuPUVWB7GV3b4=w976-h477-s-no-gm?authuser=0'
                ];
                this.currentSlide = 0;
                this.slideInterval = 5000;
                this.timer = null;
                this.init();
            }
            init() {
                this.createSlides();
                this.createIndicators();
                this.startAutoSlide();
                this.bindEvents();
            }
            createSlides() {
                const container = document.querySelector('.hero-carrusel');
                if (!container) return;
                container.innerHTML = '';
                this.images.forEach((image, index) => {
                    const slide = document.createElement('div');
                    slide.className = `carrusel-slide ${index === 0 ? 'active' : ''}`;
                    slide.style.backgroundImage = `url('${image}')`;
                    slide.setAttribute('data-index', index);
                    container.appendChild(slide);
                });
            }
            createIndicators() {
                const container = document.querySelector('.carrusel-indicators');
                if (!container) return;
                container.innerHTML = '';
                this.images.forEach((_, index) => {
                    const indicator = document.createElement('div');
                    indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
                    indicator.setAttribute('data-index', index);
                    indicator.addEventListener('click', () => this.goToSlide(index));
                    container.appendChild(indicator);
                });
            }
            goToSlide(index) {
                const slides = document.querySelectorAll('.carrusel-slide');
                const indicators = document.querySelectorAll('.indicator');
                if (!slides.length) return;
                slides[this.currentSlide]?.classList.remove('active');
                indicators[this.currentSlide]?.classList.remove('active');
                this.currentSlide = index;
                slides[this.currentSlide]?.classList.add('active');
                indicators[this.currentSlide]?.classList.add('active');
                this.restartTimer();
            }
            nextSlide() { this.goToSlide((this.currentSlide + 1) % this.images.length); }
            startAutoSlide() { this.timer = setInterval(() => this.nextSlide(), this.slideInterval); }
            stopAutoSlide() { clearInterval(this.timer); this.timer = null; }
            restartTimer() { this.stopAutoSlide(); this.startAutoSlide(); }
            bindEvents() {
                const hero = document.querySelector('.hero');
                if (hero) {
                    hero.addEventListener('mouseenter', () => this.stopAutoSlide());
                    hero.addEventListener('mouseleave', () => this.startAutoSlide());
                }
            }
        }

        // ===== CARRITO DE COMPRAS =====
        class ShoppingCart {
            constructor() {
                this.items = [];
                this.cartSidebar = document.getElementById('cartSidebar');
                this.cartOverlay = document.getElementById('cartOverlay');
                this.cartItemsContainer = document.getElementById('cartItemsContainer');
                this.cartFooter = document.getElementById('cartFooter');
                this.cartBadge = document.getElementById('cartBadge');
                this.cartTotalAmount = document.getElementById('cartTotalAmount');
                
                this.init();
            }

            init() {
                this.loadCart();
                
                const cartBtn = document.getElementById('cartToggleBtn');
                if (cartBtn) {
                    cartBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.openCart();
                    });
                }

                const closeBtn = document.getElementById('closeCartBtn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        this.closeCart();
                    });
                }

                const overlay = document.getElementById('cartOverlay');
                if (overlay) {
                    overlay.addEventListener('click', () => {
                        this.closeCart();
                    });
                }

                const whatsappBtn = document.getElementById('cartWhatsAppBtn');
                if (whatsappBtn) {
                    whatsappBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.sendWhatsAppOrder();
                    });
                }

                this.initAddToCartButtons();
            }

            loadCart() {
                const savedCart = localStorage.getItem('dulceFantasíaCart');
                if (savedCart) {
                    try {
                        this.items = JSON.parse(savedCart);
                    } catch (e) {
                        this.items = [];
                    }
                }
                this.updateCartUI();
            }

            saveCart() {
                localStorage.setItem('dulceFantasíaCart', JSON.stringify(this.items));
            }

            addItem(product) {
                this.items.push({
                    id: product.id,
                    name: product.name,
                    price: parseFloat(product.price),
                    image: product.image,
                    quantity: 1,
                    customizations: product.customizations || {}
                });
                
                this.saveCart();
                this.updateCartUI();
                this.showNotification(`✅ ${product.name} añadido al carrito`);
            }

            updateItem(productId, updatedProduct) {
                const index = this.items.findIndex(item => item.id === productId);
                if (index !== -1) {
                    this.items[index] = {
                        ...updatedProduct,
                        id: productId
                    };
                    this.saveCart();
                    this.updateCartUI();
                    this.showNotification(`✅ Producto actualizado`);
                }
            }

            updateQuantity(productId, change) {
                const item = this.items.find(item => item.id === productId);
                if (item) {
                    item.quantity += change;
                    if (item.quantity <= 0) {
                        this.removeItem(productId);
                    } else {
                        this.saveCart();
                        this.updateCartUI();
                    }
                }
            }

            removeItem(productId) {
                const item = this.items.find(item => item.id === productId);
                this.items = this.items.filter(item => item.id !== productId);
                this.saveCart();
                this.updateCartUI();
                if (item) {
                    this.showNotification(`🗑️ ${item.name} eliminado del carrito`);
                }
            }

            editItem(productId) {
                const item = this.items.find(item => item.id === productId);
                if (item) {
                    const allImages = document.querySelectorAll('.zoomable');
                    let foundImg = null;
                    let baseId = item.id.split('_')[0];
                    
                    for (let img of allImages) {
                        const card = img.closest('.product-card');
                        if (card && card.dataset.productId === baseId) {
                            foundImg = img;
                            break;
                        }
                    }
                    
                    if (foundImg && window.openProductModalForEdit) {
                        window.openProductModalForEdit(foundImg, item);
                    } else {
                        const product = products.find(p => p.id === baseId) || allProducts.find(p => p.id === baseId);
                        if (product && window.openProductModalForEdit) {
                            const simulatedImg = {
                                src: product.imagen,
                                dataset: {
                                    nombre: product.nombre,
                                    precio: product.precio,
                                    descripcion: product.descripcion,
                                    tamanos: JSON.stringify(product.tamanos),
                                    saboreskeke: JSON.stringify(product.saboresKeke),
                                    saboresrelleno: JSON.stringify(product.saboresRelleno),
                                    adicionales: JSON.stringify(product.adicionales),
                                    detalles: JSON.stringify(product.detalles),
                                    categoria: product.categorias[0] || 'General'
                                }
                            };
                            window.openProductModalForEdit(simulatedImg, item);
                        }
                    }
                }
            }

            getTotal() {
                return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
            }

            getItemCount() {
                return this.items.reduce((count, item) => count + item.quantity, 0);
            }

            updateCartUI() {
                const count = this.getItemCount();
                if (this.cartBadge) this.cartBadge.textContent = count;
                
                if (this.items.length === 0) {
                    if (this.cartItemsContainer) {
                        this.cartItemsContainer.innerHTML = `
                            <div class="empty-cart-message">
                                <i class="fas fa-shopping-basket"></i>
                                <p>Tu carrito está vacío</p>
                                <small style="display: block; margin-top: 10px; opacity: 0.7;">¡Agrega algunos productos deliciosos!</small>
                            </div>
                        `;
                    }
                    if (this.cartFooter) this.cartFooter.style.display = 'none';
                } else {
                    let html = '';
                    this.items.forEach(item => {
                        html += `
                            <div class="cart-item" data-product-id="${item.id}">
                                <div class="cart-item-image">
                                    <img src="${item.image}" alt="${item.name}">
                                </div>
                                <div class="cart-item-details">
                                    <div class="cart-item-title">${item.name}</div>
                                    <div class="cart-item-price">s/${item.price.toFixed(2)}</div>
                                    <div class="cart-item-actions">
                                        <button class="quantity-btn" onclick="window.cart.updateQuantity('${item.id}', -1)">
                                            <i class="fas fa-minus"></i>
                                        </button>
                                        <span class="quantity">${item.quantity}</span>
                                        <button class="quantity-btn" onclick="window.cart.updateQuantity('${item.id}', 1)">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                        <button class="item-action-btn edit-item" onclick="window.cart.editItem('${item.id}')" title="Editar producto">
                                            <i class="fas fa-pencil-alt"></i>
                                        </button>
                                        <button class="item-action-btn remove-item" onclick="window.cart.removeItem('${item.id}')" title="Eliminar producto">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    if (this.cartItemsContainer) this.cartItemsContainer.innerHTML = html;
                    if (this.cartFooter) this.cartFooter.style.display = 'block';
                    
                    const total = this.getTotal();
                    if (this.cartTotalAmount) this.cartTotalAmount.textContent = `s/${total.toFixed(2)}`;
                }
            }

            openCart() {
                if (this.cartSidebar) this.cartSidebar.classList.add('open');
                if (this.cartOverlay) this.cartOverlay.classList.add('show');
                document.body.style.overflow = 'hidden';
            }

            closeCart() {
                if (this.cartSidebar) this.cartSidebar.classList.remove('open');
                if (this.cartOverlay) this.cartOverlay.classList.remove('show');
                document.body.style.overflow = '';
            }

            sendWhatsAppOrder() {
                if (this.items.length === 0) return;
                
                let message = 'Hola, quisiera hacer un pedido:%0A%0A';
                this.items.forEach(item => {
                    message += `🍰 *${item.name}*%0A`;
                    message += `   Cantidad: ${item.quantity}%0A`;
                    message += `   Precio: s/${item.price.toFixed(2)}%0A%0A`;
                });
                
                const total = this.getTotal();
                message += `*TOTAL: s/${total.toFixed(2)}*%0A%0A`;
                message += 'Gracias!';
                
                window.open(`https://wa.me/51987645268?text=${message}`, '_blank');
            }

            initAddToCartButtons() {
                document.addEventListener('click', (e) => {
                    if (e.target.classList.contains('add-to-cart-btn')) {
                        e.preventDefault();
                        const productCard = e.target.closest('.product-card');
                        if (productCard) {
                            const img = productCard.querySelector('.zoomable');
                            if (img && window.openProductModal) {
                                window.openProductModal(img);
                            }
                        }
                    }
                });
            }

            showNotification(message) {
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: var(--primary-pink);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 50px;
                    box-shadow: var(--shadow-medium);
                    z-index: 3001;
                    animation: slideIn 0.3s ease;
                    font-weight: 500;
                `;
                notification.textContent = message;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => notification.remove(), 300);
                }, 3000);
            }
        }

        // ===== MODAL =====
        function initModal() {
            const modal = document.getElementById("productModal");
            const modalImg = document.getElementById("modalProductImage");
            const modalTitle = document.getElementById("modalProductTitle");
            const modalPrice = document.getElementById("modalProductPrice");
            const modalDescription = document.getElementById("modalProductDescription");
            const modalDetailsList = document.getElementById("modalProductDetailsList");
            const modalTotalPrice = document.getElementById("modalTotalPrice");
            const closeBtn = document.getElementById("closeBtn");
            const addToCartBtn = document.getElementById("modalAddToCart");
            const whatsappBtn = document.getElementById("modalWhatsApp");
            
            const tamanoSelect = document.getElementById('tamanoSelect');
            const kekeSelect = document.getElementById('kekeSelect');
            const rellenoSelect = document.getElementById('rellenoSelect');
            const adicionalSelect = document.getElementById('adicionalSelect');

            function extractPrice(text) {
                if (!text) return 0;
                const match = text.match(/s\/\s?(\d+(\.\d+)?)/i); 
                return match ? parseFloat(match[1]) : 0;
            }

            function calculateTotal() {
                if (!currentProduct) return 0;
                
                let total = currentProduct.precio;
                
                if (tamanoSelect && tamanoSelect.selectedIndex > 0 && tamanoSelect.value) {
                    total += extractPrice(tamanoSelect.value);
                }

                if (kekeSelect && kekeSelect.selectedIndex > 0 && kekeSelect.value) {
                    total += extractPrice(kekeSelect.value);
                }

                if (rellenoSelect && rellenoSelect.selectedIndex > 0 && rellenoSelect.value) {
                    total += extractPrice(rellenoSelect.value);
                }
                
                if (adicionalSelect && adicionalSelect.selectedIndex > 0 && adicionalSelect.value) {
                    total += extractPrice(adicionalSelect.value);
                }
                
                if (modalTotalPrice) modalTotalPrice.textContent = `s/${total.toFixed(2)}`;
                return total;
            }

            if (tamanoSelect) tamanoSelect.addEventListener('change', calculateTotal);
            if (kekeSelect) kekeSelect.addEventListener('change', calculateTotal);
            if (rellenoSelect) rellenoSelect.addEventListener('change', calculateTotal);
            if (adicionalSelect) adicionalSelect.addEventListener('change', calculateTotal);

            if (closeBtn) {
                closeBtn.onclick = () => {
                    if (modal) modal.style.display = "none";
                    isEditMode = false;
                    editItemId = null;
                };
            }
            
            window.onclick = (e) => {
                if (e.target == modal) {
                    if (modal) modal.style.display = "none";
                    isEditMode = false;
                    editItemId = null;
                }
            };

            function populateSelect(selectElement, options) {
                if (!selectElement) return;
                selectElement.innerHTML = '';
                
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Selecciona una opción';
                selectElement.appendChild(defaultOption);
                
                if (!options || options.length === 0) {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'No hay opciones disponibles';
                    selectElement.appendChild(option);
                    return;
                }
                
                options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    selectElement.appendChild(option);
                });
            }

            window.openProductModal = function(imgElement) {
                const nombre = imgElement.dataset.nombre || "Producto";
                const precio = parseFloat(imgElement.dataset.precio || "0");
                const descripcion = imgElement.dataset.descripcion || "Sin descripción disponible";
                const tamanos = JSON.parse(imgElement.dataset.tamanos || '[]');
                const saboresKeke = JSON.parse(imgElement.dataset.saboreskeke || '[]');
                const saboresRelleno = JSON.parse(imgElement.dataset.saboresrelleno || '[]');
                const adicionales = JSON.parse(imgElement.dataset.adicionales || '[]');
                const detalles = JSON.parse(imgElement.dataset.detalles || '[]');
                const categoria = imgElement.dataset.categoria || "";
                const productId = imgElement.closest('.product-card')?.dataset.productId || '';
                
                currentProduct = {
                    id: productId,
                    nombre: nombre,
                    precio: precio,
                    imagen: imgElement.src,
                    categoria: categoria,
                    tamanos: tamanos,
                    saboresKeke: saboresKeke,
                    saboresRelleno: saboresRelleno,
                    adicionales: adicionales,
                    detalles: detalles
                };
                
                if (modalImg) modalImg.src = imgElement.src;
                if (modalTitle) modalTitle.textContent = nombre;
                if (modalPrice) modalPrice.textContent = `s/${precio.toFixed(2)}`;
                if (modalDescription) modalDescription.textContent = descripcion;
                
                populateSelect(tamanoSelect, tamanos);
                populateSelect(kekeSelect, saboresKeke);
                populateSelect(rellenoSelect, saboresRelleno);
                populateSelect(adicionalSelect, adicionales);
                
                calculateTotal();
                
                if (modalDetailsList) {
                    modalDetailsList.innerHTML = '';
                    detalles.forEach(detalle => {
                        const li = document.createElement('li');
                        li.innerHTML = `<i class="fas fa-check"></i> ${detalle}`;
                        modalDetailsList.appendChild(li);
                    });
                }
                
                if (whatsappBtn) {
                    whatsappBtn.href = `https://wa.me/51987645268?text=Hola%2C%20estoy%20interesado%20en%20*${encodeURIComponent(nombre)}*%20(s/${precio.toFixed(2)})%20de%20la%20categor%C3%ADa%20*${encodeURIComponent(categoria)}*`;
                }
                
                isEditMode = false;
                editItemId = null;
                if (modal) modal.style.display = "flex";
            };

            window.openProductModalForEdit = function(imgElement, itemToEdit) {
                const nombre = imgElement.dataset.nombre || "Producto";
                const precio = parseFloat(imgElement.dataset.precio || "0");
                const descripcion = imgElement.dataset.descripcion || "Sin descripción disponible";
                const tamanos = JSON.parse(imgElement.dataset.tamanos || '[]');
                const saboresKeke = JSON.parse(imgElement.dataset.saboreskeke || '[]');
                const saboresRelleno = JSON.parse(imgElement.dataset.saboresrelleno || '[]');
                const adicionales = JSON.parse(imgElement.dataset.adicionales || '[]');
                const detalles = JSON.parse(imgElement.dataset.detalles || '[]');
                const categoria = imgElement.dataset.categoria || "";
                
                const productId = (imgElement.closest && imgElement.closest('.product-card')) 
                    ? imgElement.closest('.product-card').dataset.productId 
                    : (itemToEdit.id.split('_')[0]);

                currentProduct = {
                    id: productId,
                    nombre: nombre,
                    precio: precio,
                    imagen: imgElement.src,
                    categoria: categoria,
                    tamanos: tamanos,
                    saboresKeke: saboresKeke,
                    saboresRelleno: saboresRelleno,
                    adicionales: adicionales,
                    detalles: detalles
                };
                
                if (modalImg) modalImg.src = imgElement.src;
                if (modalTitle) modalTitle.textContent = nombre;
                if (modalPrice) modalPrice.textContent = `s/${precio.toFixed(2)}`;
                if (modalDescription) modalDescription.textContent = descripcion;
                
                populateSelect(tamanoSelect, tamanos);
                populateSelect(kekeSelect, saboresKeke);
                populateSelect(rellenoSelect, saboresRelleno);
                populateSelect(adicionalSelect, adicionales);
                
                if (itemToEdit.customizations) {
                    if (itemToEdit.customizations.tamano && tamanoSelect) {
                        for (let i = 0; i < tamanoSelect.options.length; i++) {
                            if (tamanoSelect.options[i].value === itemToEdit.customizations.tamano) {
                                tamanoSelect.selectedIndex = i;
                                break;
                            }
                        }
                    }
                    if (itemToEdit.customizations.keke && kekeSelect) {
                        for (let i = 0; i < kekeSelect.options.length; i++) {
                            if (kekeSelect.options[i].value === itemToEdit.customizations.keke) {
                                kekeSelect.selectedIndex = i;
                                break;
                            }
                        }
                    }
                    if (itemToEdit.customizations.relleno && rellenoSelect) {
                        for (let i = 0; i < rellenoSelect.options.length; i++) {
                            if (rellenoSelect.options[i].value === itemToEdit.customizations.relleno) {
                                rellenoSelect.selectedIndex = i;
                                break;
                            }
                        }
                    }
                    if (itemToEdit.customizations.adicionales && itemToEdit.customizations.adicionales.length > 0 && adicionalSelect) {
                        const adicionalTipo = itemToEdit.customizations.adicionales[0].tipo;
                        for (let i = 0; i < adicionalSelect.options.length; i++) {
                            if (adicionalSelect.options[i].value === adicionalTipo) {
                                adicionalSelect.selectedIndex = i;
                                break;
                            }
                        }
                    }
                }
                
                calculateTotal();
                
                if (modalDetailsList) {
                    modalDetailsList.innerHTML = '';
                    detalles.forEach(detalle => {
                        const li = document.createElement('li');
                        li.innerHTML = `<i class="fas fa-check"></i> ${detalle}`;
                        modalDetailsList.appendChild(li);
                    });
                }
                
                if (whatsappBtn) {
                    whatsappBtn.href = `https://wa.me/51987645268?text=Hola%2C%20estoy%20interesado%20en%20*${encodeURIComponent(nombre)}*%20(s/${precio.toFixed(2)})%20de%20la%20categor%C3%ADa%20*${encodeURIComponent(categoria)}*`;
                }
                
                isEditMode = true;
                editItemId = itemToEdit.id;
                if (modal) modal.style.display = "flex";
            };

            if (addToCartBtn) {
                addToCartBtn.onclick = (e) => {
                    e.preventDefault();
                    if (!currentProduct) return;
                    
                    const tamano = tamanoSelect ? tamanoSelect.value : '';
                    const keke = kekeSelect ? kekeSelect.value : '';
                    const relleno = rellenoSelect ? rellenoSelect.value : '';
                    const adicionalValue = adicionalSelect ? adicionalSelect.value : '';
                    
                    const adicionales = [];
                    if (adicionalValue && !adicionalValue.includes('Ninguno') && !adicionalValue.includes('ninguno')) {
                        adicionales.push({
                            tipo: adicionalValue,
                            precio: extractPrice(adicionalValue)
                        });
                    }
                    
                    const total = calculateTotal();
                    
                    let nombrePersonalizado = currentProduct.nombre;
                    const partes = [];
                    if (tamano) partes.push(tamano.split('(')[0].trim());
                    if (keke) partes.push(keke);
                    if (relleno) partes.push(relleno);
                    
                    if (partes.length > 0) {
                        nombrePersonalizado += ` (${partes.join(' - ')})`;
                    }
                    
                    if (adicionales.length > 0) {
                        nombrePersonalizado += ` + ${adicionales[0].tipo.split('(')[0].trim()}`;
                    }
                    
                    if (isEditMode && editItemId) {
                        window.cart.updateItem(editItemId, {
                            id: editItemId,
                            name: nombrePersonalizado,
                            price: total,
                            image: currentProduct.imagen,
                            quantity: 1,
                            customizations: {
                                tamano: tamano,
                                keke: keke,
                                relleno: relleno,
                                adicionales: adicionales
                            }
                        });
                    } else {
                        window.cart.addItem({
                            id: currentProduct.id + '_' + Date.now(),
                            name: nombrePersonalizado,
                            price: total,
                            image: currentProduct.imagen,
                            customizations: {
                                tamano: tamano,
                                keke: keke,
                                relleno: relleno,
                                adicionales: adicionales
                            }
                        });
                    }
                    
                    if (modal) modal.style.display = "none";
                    isEditMode = false;
                    editItemId = null;
                };
            }
        }

        // ===== TRADICIÓN SLIDER =====
        class TradicionSlider {
            constructor() {
                this.slider = document.getElementById('tradicionSlider');
                if (!this.slider) return;
                this.slides = Array.from(this.slider.querySelectorAll('.slide'));
                this.dots = Array.from(document.querySelectorAll('.slider-dot'));
                this.currentSlide = 0;
                this.totalSlides = this.slides.length;
                this.autoSlideDelay = 4000;
                this.autoInterval = null;
                this.init();
            }
            init() {
                this.updateSlides();
                this.dots.forEach(dot => {
                    dot.addEventListener('click', () => {
                        const index = parseInt(dot.dataset.slide) - 1;
                        this.goToSlide(index);
                        this.resetAutoSlide();
                    });
                });
                this.startAutoSlide();
            }
            updateSlides() {
                this.slides.forEach((slide, index) => {
                    slide.classList.remove('active');
                    if (index === this.currentSlide) slide.classList.add('active');
                });
                this.dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === this.currentSlide);
                });
            }
            nextSlide() {
                this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
                this.updateSlides();
            }
            prevSlide() {
                this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
                this.updateSlides();
            }
            goToSlide(index) {
                if (index >= 0 && index < this.totalSlides && index !== this.currentSlide) {
                    this.currentSlide = index;
                    this.updateSlides();
                }
            }
            startAutoSlide() {
                if (this.autoInterval) clearInterval(this.autoInterval);
                this.autoInterval = setInterval(() => this.nextSlide(), this.autoSlideDelay);
            }
            stopAutoSlide() {
                clearInterval(this.autoInterval);
                this.autoInterval = null;
            }
            resetAutoSlide() {
                this.stopAutoSlide();
                this.startAutoSlide();
            }
        }

        // ===== FUNCIÓN PARA DETECTAR ELEMENTOS VISIBLES EN SCROLL =====
        function initScrollAnimations() {
            const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in, .stagger-item');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    } else {
                        entry.target.classList.remove('active');
                    }
                });
            }, { 
                threshold: 0.2,
                rootMargin: '0px 0px -50px 0px'
            });

            animatedElements.forEach(el => {
                if (el) observer.observe(el);
            });

            document.querySelectorAll('.card').forEach(el => {
                if (el) observer.observe(el);
            });
        }

        // ===== MOBILE MENU =====
        function initMobileMenu() {
            const menuBtn = document.querySelector('.mobile-menu-btn');
            const navList = document.querySelector('.nav-list');
            if (!menuBtn || !navList) return;

            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navList.classList.toggle('show');
                menuBtn.innerHTML = navList.classList.contains('show') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            });

            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navList.classList.remove('show');
                    menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                });
            });

            document.addEventListener('click', (e) => {
                if (!navList.contains(e.target) && !menuBtn.contains(e.target)) {
                    navList.classList.remove('show');
                    menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        }

        // ===== FUNCIÓN PARA MENÚ MÓVIL MEJORADA =====
        function setupMobileMenu() {
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const mainNav = document.getElementById('mainNav');
            const body = document.body;
            
            if (mobileMenuBtn && mainNav) {
                mobileMenuBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    mainNav.classList.toggle('active');
                    body.classList.toggle('menu-open');
                    
                    const icon = mobileMenuBtn.querySelector('i');
                    if (mainNav.classList.contains('active')) {
                        icon.classList.remove('fa-bars');
                        icon.classList.add('fa-times');
                    } else {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                });

                document.querySelectorAll('.nav-link').forEach(link => {
                    link.addEventListener('click', () => {
                        mainNav.classList.remove('active');
                        body.classList.remove('menu-open');
                        const icon = mobileMenuBtn.querySelector('i');
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    });
                });

                document.addEventListener('click', (e) => {
                    if (!mainNav.contains(e.target) && !mobileMenuBtn.contains(e.target) && mainNav.classList.contains('active')) {
                        mainNav.classList.remove('active');
                        body.classList.remove('menu-open');
                        const icon = mobileMenuBtn.querySelector('i');
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                });
            }
        }

        // ===== HEADER SCROLL =====
        function initHeaderScroll() {
            const header = document.querySelector('header');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }

        // ===== SMOOTH SCROLL =====
        function initSmoothScroll() {
            const header = document.querySelector('header');
            const headerHeight = header ? header.offsetHeight : 100;

            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = anchor.getAttribute('href');
                    if (targetId === '#') return;
                    const targetElement = document.querySelector(targetId);
                    if (targetElement && content1.style.display === 'block') {
                        window.scrollTo({
                            top: targetElement.offsetTop - headerHeight,
                            behavior: 'smooth'
                        });

                        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                        anchor.classList.add('active');
                    }
                });
            });
        }

        // ===== ACTIVE LINK ON SCROLL =====
        function initActiveLink() {
            const sections = document.querySelectorAll('#content-001 section[id]');
            const navLinks = document.querySelectorAll('.nav-link');

            window.addEventListener('scroll', () => {
                if (content1.style.display !== 'block') return;
                
                let current = '';
                const scrollPosition = window.scrollY + 150;

                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        current = section.getAttribute('id');
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${current}`) {
                        link.classList.add('active');
                    }
                });
            });
        }

        // ===== INIT =====
        document.addEventListener('DOMContentLoaded', function () {
    // Inicializar todo
    new HeroCarrusel();
    
    // Iniciar carga de productos inmediatamente
    loadProductsFromSheets(); // Ahora retorna una Promise pero no necesitamos esperar
    
    initModal();
    new TradicionSlider();
    initMobileMenu();
    setupMobileMenu();
    initScrollAnimations();
    initHeaderScroll();
    initSmoothScroll();
    initActiveLink();
    
    // Inicializar carrito
    window.cart = new ShoppingCart();
            
            // Configurar navegación entre contenidos
            if (homeLink) {
                homeLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    showContent(1);
                });
            }

            if (shopLink) {
                shopLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    showContent(2);
                });
            }

            if (masProductos) {
                masProductos.addEventListener('click', (e) => {
                    e.preventDefault();
                    showContent(2);
                });
            }

            if (especialidadesLink) {
                especialidadesLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    showContent(1);
                    setTimeout(() => {
                        const target = document.getElementById('especialidades');
                        const headerHeight = document.querySelector('header').offsetHeight;
                        if (target) {
                            window.scrollTo({
                                top: target.offsetTop - headerHeight,
                                behavior: 'smooth'
                            });
                        }
                    }, 100);
                });
            }

            if (nosotrosLink) {
                nosotrosLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    showContent(1);
                    setTimeout(() => {
                        const target = document.getElementById('nosotros');
                        const headerHeight = document.querySelector('header').offsetHeight;
                        if (target) {
                            window.scrollTo({
                                top: target.offsetTop - headerHeight,
                                behavior: 'smooth'
                            });
                        }
                    }, 100);
                });
            }

            if (contactoLink) {
                contactoLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    showContent(1);
                    setTimeout(() => {
                        const target = document.getElementById('contacto');
                        const headerHeight = document.querySelector('header').offsetHeight;
                        if (target) {
                            window.scrollTo({
                                top: target.offsetTop - headerHeight,
                                behavior: 'smooth'
                            });
                        }
                    }, 100);
                });
            }

            if (backToHomeBtn) {
                backToHomeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showContent(1);
                });
            }

            if (homeLogo) {
                homeLogo.addEventListener('click', (e) => {
                    e.preventDefault();
                    showContent(1);
                });
            }

            if (footerHomeLogo) {
                footerHomeLogo.addEventListener('click', (e) => {
                    e.preventDefault();
                    showContent(1);
                });
            }

            // Configurar filtros y tienda (CONTENIDO 2)
            initFilters();
            setupInfiniteScroll();
            setupSearch();
            setupFiltersToggle();
            
            // Mostrar contenido 1 por defecto
            showContent(1);
            
            console.log('Dulce Fantasía Bakery - Cargado correctamente con Google Sheets y doble contenido');
        });
