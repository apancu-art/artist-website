
document.addEventListener("DOMContentLoaded", function () {

    let isZoomed = false;
    let lastTap = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    let navLinks = document.querySelectorAll('.navbar a');
    let sections = document.querySelectorAll('main > .sections > section');
    let burgerMenu = document.querySelector('.burger-menu');
    let mobileMenu = document.querySelector('.mobile-menu');
    let menuLinks = mobileMenu.querySelectorAll('a');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {

            e.preventDefault();

            let targetHash = this.getAttribute('href');

            if (targetHash == "#") {
                document.body.classList.add('bg-image');
            } else {
                for (let link of this.parentNode.children) {
                    link.style.fontWeight = link == this ? 400 : '';
                }
            }
            window.location.hash = targetHash;
        });
    });

    burgerMenu.addEventListener('click', function () {
        let mobileMenu = document.querySelector('.mobile-menu');
        mobileMenu.classList.toggle('active');
        burgerMenu.classList.toggle('is-active');
        if (mobileMenu.classList.contains('active')) {
            sections.forEach(section => {
                section.hidden = true;
            });
        } else {
            showSection(window.location.hash, sections, navLinks, mobileMenu);
        }
    });

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            burgerMenu.classList.remove('is-active');
            showSection(window.location.hash, sections, navLinks, mobileMenu);
        });
    });

    window.addEventListener('hashchange', function () {
        showSection(window.location.hash, sections, navLinks, mobileMenu);
    });

    window.addEventListener('resize', function () {
        if (window.location.hash) {
            mobileMenu.classList.remove('active');
        }
    });

    document.addEventListener('touchstart', function (event) {

        if (window.location.hash == '#works') {
            touchStartX = event.changedTouches[0].screenX;
        }
    });
    
    document.addEventListener('touchend', function (event) {

        // TODO: this preventS the window click event from firing
        //event.preventDefault();

        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;

        touchEndX = event.changedTouches[0].screenX;

        if (window.location.hash == '#works') {

            if (touchEndX < touchStartX - 20) {
                const nextBtn = document.querySelector('.next-btn');
                if (nextBtn) nextBtn.click();
            } else if (touchEndX > touchStartX + 20) {
                const prevBtn = document.querySelector('.prev-btn');
                if (prevBtn) prevBtn.click();
            }

        } else {
            if (tapLength < 500 && tapLength > 0) {

                if (isZoomed) {
                    document.body.style.transform = 'scale(1)';
                    document.body.style.transformOrigin = 'center center';
                    isZoomed = false;
                } else {
                    document.body.style.transform = 'scale(1.5)';
                    document.body.style.transformOrigin = 'center center';
                    isZoomed = true;
                }
            }
        }
        lastTap = currentTime;
    });

    loadArtworks();
    showSection(window.location.hash, sections, navLinks, mobileMenu);

});

// Load artworks from images/works folder
async function loadArtworks() {

    // Create the modal HTML elements once
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';

    const closeButton = document.createElement('span');
    closeButton.className = 'close-btn';
    closeButton.innerHTML = 'X'; // HTML entity for 'x'

    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-artwork-container';

    // Create navigation buttons
    const prevBtn = document.createElement('button');
    prevBtn.className = 'nav-btn prev-btn';

    // Create SVG for prev button
    const prevSvgNS = "http://www.w3.org/2000/svg";
    const prevSvg = document.createElementNS(prevSvgNS, "svg");
    prevSvg.setAttribute("viewBox", "0 0 9 16");
    prevSvg.setAttribute("width", "1.5em");
    prevSvg.setAttribute("height", "2.67em"); // 16/9 ≈ 1.78 for aspect ratio

    const prevPolyline = document.createElementNS(prevSvgNS, "polyline");
    prevPolyline.setAttribute("fill", "none");
    prevPolyline.setAttribute("stroke", "currentColor");
    prevPolyline.setAttribute("stroke-width", "1");
    prevPolyline.setAttribute("stroke-miterlimit", "10");
    prevPolyline.setAttribute("points", "7.3,14.7 2.5,8 7.3,1.2");

    prevSvg.appendChild(prevPolyline);
    prevBtn.appendChild(prevSvg);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'nav-btn next-btn';

    // Create SVG for next button
    const nextSvgNS = "http://www.w3.org/2000/svg";
    const nextSvg = document.createElementNS(nextSvgNS, "svg");
    nextSvg.setAttribute("viewBox", "0 0 9 16");
    nextSvg.setAttribute("width", "1.5em");
    nextSvg.setAttribute("height", "2.67em"); // 16/9 ≈ 1.78 for aspect ratio

    const nextPolyline = document.createElementNS(nextSvgNS, "polyline");
    nextPolyline.setAttribute("fill", "none");
    nextPolyline.setAttribute("stroke", "currentColor");
    nextPolyline.setAttribute("stroke-width", "1");
    nextPolyline.setAttribute("stroke-miterlimit", "10");
    nextPolyline.setAttribute("points", "1.6,1.2 6.5,7.9 1.6,14.7 ");

    nextSvg.appendChild(nextPolyline);
    nextBtn.appendChild(nextSvg);

    modalBackdrop.appendChild(prevBtn);
    modalBackdrop.appendChild(nextBtn);
    modalBackdrop.appendChild(modalContainer);
    modalBackdrop.appendChild(closeButton);
    document.body.appendChild(modalBackdrop);

    window.addEventListener('click', (event) => {
        if (event.target === modalBackdrop) {
            modalBackdrop.style.display = 'none';
            let width = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--mobile-burger-breakpoint') ?? 724);
            if (window.innerWidth <= width) {
                let burgerMenu = document.querySelector('.burger-menu');
                burgerMenu.style.display = 'flex';
            }
        }
    });

    closeButton.addEventListener('click', () => {
        modalBackdrop.style.display = 'none';
        let width = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--mobile-burger-breakpoint') ?? 724);
        if (window.innerWidth <= width) {
            let burgerMenu = document.querySelector('.burger-menu');
            burgerMenu.style.display = 'flex';
        }
    });

    prevBtn.addEventListener('click', (event) => {

        event.preventDefault();

        const btn = event.currentTarget;
        const gridIndex = parseInt(btn.getAttribute("data-grid"), 10);
        const index = parseInt(btn.getAttribute("index"), 10);
        const grids = document.querySelectorAll('.artwork-grid');
        const grid = grids[gridIndex];

        if (grid && grid.children[index]) {
            const element = grid.children[index].querySelector('.artwork-container');
            updateModalContent(element);
        }
    });

    nextBtn.addEventListener('click', (event) => {

        event.preventDefault();

        const btn = event.currentTarget;
        const gridIndex = parseInt(btn.getAttribute("data-grid"), 10);
        const index = parseInt(btn.getAttribute("index"), 10);
        const grids = document.querySelectorAll('.artwork-grid');
        const grid = grids[gridIndex];

        if (grid && grid.children[index]) {
            const element = grid.children[index].querySelector('.artwork-container');
            updateModalContent(element);
        }
    });

    document.addEventListener('keyup', function (event) {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            const prevBtn = document.querySelector('.prev-btn');
            if (prevBtn) prevBtn.click();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            const nextBtn = document.querySelector('.next-btn');
            if (nextBtn) nextBtn.click();
        }
    });

    try {
        const response = await fetch('manifest.json');
        const entries = await response.json();

        for (const entry of entries) {
            if (entry.site) {
                const sheet = document.styleSheets[0];
                for (let i = 0; i < sheet.cssRules.length; i++) {
                    const rule = sheet.cssRules[i];
                    if (rule instanceof CSSStyleRule && rule.selectorText === '.bg-image') {
                        rule.style.setProperty('background-image', `url('../images/${entry.site.image}')`);
                        break;
                    }
                }
            }
            if (entry.works) {
                const categoriesTabs = document.querySelector('.categories-tabs');
                categoriesTabs.innerHTML = '';

                // Create tab bar
                const tabBar = document.createElement('div');
                tabBar.className = 'tab-bar';

                // Create tab panels (artwork grids)
                const tabPanels = document.createElement('div');
                tabPanels.className = 'tab-panels';

                entry.works.categories.forEach((category, i) => {
                    // Tab button
                    const tabBtn = document.createElement('button');
                    tabBtn.className = 'tab-btn';
                    tabBtn.textContent = category.name;
                    if (i === 0) tabBtn.classList.add('active');
                    tabBar.appendChild(tabBtn);

                    // Artwork grid for this category
                    const grid = document.createElement('div');
                    grid.className = 'artwork-grid';
                    grid.style.display = i === 0 ? 'grid' : 'none';

                    if (category.images) {
                        for (const work of category.images) {
                            createArtworkElement(work.filename, work.info, grid);
                        }
                    }
                    tabPanels.appendChild(grid);

                    // Tab click event
                    tabBtn.addEventListener('click', () => {
                        // Set active tab
                        tabBar.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                        tabBtn.classList.add('active');
                        // Show/hide grids
                        tabPanels.querySelectorAll('.artwork-grid').forEach((g, gi) => {
                            g.style.display = gi === i ? 'grid' : 'none';
                        });
                    });
                });

                categoriesTabs.appendChild(tabBar);
                categoriesTabs.appendChild(tabPanels);
            } else if (entry.cv) {
                const artist = document.querySelector('.artist-name');
                artist.textContent = `${entry.cv.name} ${entry.cv.surname}`;
                document.title = `${entry.cv.name} ${entry.cv.surname}`;

                if (entry.cv.bio) {
                    const bio = document.querySelector('.bio');
                    for (const part of entry.cv.bio) {
                        const element = document.createElement('p');
                        element.className = 'pb-1';
                        element.innerHTML = part;
                        bio.appendChild(element);
                    }
                    const location = document.querySelector('.location');
                    let element = document.createElement('p');
                    element.textContent = `Born in ${entry.cv.birthyear} in ${entry.cv.birthplace}`;
                    location.appendChild(element);
                    element = document.createElement('p');
                    element.textContent = `Resides and works in ${entry.cv.residence}`;
                    location.appendChild(element);

                    const education = document.querySelector('.education');
                    for (const edu of entry.cv.education) {
                        const element = document.createElement('p');
                        element.textContent = edu;
                        education.appendChild(element);
                    }
                }
            } else if (entry.contact) {
                if (entry.contact.links) {
                    const links = document.querySelector('.links');
                    for (const link of entry.contact.links) {
                        const element = document.createElement('p');
                        const anchor = document.createElement('a');
                        anchor.textContent = link.label;
                        let url = link.url;
                        if (link.type == "email") {
                            url = `mailto:${link.label}`;
                        } else if (link.type == "instagram") {
                            let label = link.label.replace('@', '');
                            url = `https://www.instagram.com/${label}`;
                        }
                        anchor.href = url;
                        element.appendChild(anchor);
                        links.appendChild(element);
                    }
                }
                const studio = document.querySelector('.studio');
                let element = document.createElement('p');
                element.textContent = entry.contact.studio.street;
                studio.appendChild(element);
                element = document.createElement('p');
                element.textContent = entry.contact.studio.city;
                studio.appendChild(element);
                element = document.createElement('p');
                element.textContent = entry.contact.studio.country;
                studio.appendChild(element);

                const image = document.querySelector('.contact-image');
                image.src = `/images/${entry.contact.image.src}`;
                image.alt = entry.contact.image.alt;
            }
        }

        document.querySelectorAll('.artwork-grid .artwork-container').forEach(function (element) {

            let touchStartX = 0;
            let touchStartY = 0;
            let touchMoved = false;

            element.addEventListener('touchstart', function (e) {
                if (e.touches.length === 1) {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                    touchMoved = false;
                }
            });

            element.addEventListener('touchmove', function (e) {
                if (e.touches.length === 1) {
                    const dx = Math.abs(e.touches[0].clientX - touchStartX);
                    const dy = Math.abs(e.touches[0].clientY - touchStartY);
                    if (dx > 10 || dy > 10) {
                        touchMoved = true;
                    }
                }
            });

            element.addEventListener('touchend', function (event) {

                if (!touchMoved) {
                    updateModalContent(element);
                }
            });

            // For mouse users, keep the click event
            element.addEventListener('click', function (event) {

                event.preventDefault();

                // Only trigger if not a touch event
                if (!('ontouchstart' in window)) {
                    updateModalContent(element);
                }
            });
        });

    } catch (error) {
        console.error('Error loading artworks:', error);
    }
}

function createArtworkElement(filename, artworkInfo, container) {

    const baseName = filename.replace(/\.(jpg|png)$/i, '');

    const artworkOuterContainer = document.createElement('div');
    artworkOuterContainer.className = 'artwork-outer-container';

    const artworkContainer = document.createElement('div');
    artworkContainer.className = 'artwork-container';

    const artworkFrame = document.createElement('div');
    artworkFrame.className = 'artwork-frame';

    // Use thumbnail for grid
    const artworkImage = document.createElement('img');
    artworkImage.src = `/images/works/thumbs/${filename}`;
    artworkImage.alt = baseName;
    artworkImage.className = 'artwork-image';
    artworkImage.loading = 'lazy'; // Enable lazy loading

    // Store full-size image path for modal use
    artworkImage.dataset.fullsize = `/images/works/${filename}`;

    artworkFrame.appendChild(artworkImage);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'artwork-info';
    infoDiv.innerHTML = `<span>${artworkInfo.title}, ${artworkInfo.year}. ${artworkInfo.medium} - ${artworkInfo.dimensions}</span>`;

    artworkContainer.appendChild(artworkFrame);
    artworkOuterContainer.appendChild(artworkContainer);
    artworkOuterContainer.appendChild(infoDiv);

    container.appendChild(artworkOuterContainer);
}

function updateModalContent(element) {

    const artworkGrid = element.closest('.artwork-grid');
    const computedStyles = window.getComputedStyle(artworkGrid);
    const gridTemplateColumns = computedStyles.getPropertyValue('grid-template-columns');

    // only show modal if there is more than one column
    if (gridTemplateColumns.includes(" ")) {

        const modalBackdrop = document.querySelector('.modal-backdrop');
        const modalContainer = document.querySelector('.modal-artwork-container');

        // Find the parent grid of the clicked artwork
        const grids = Array.from(document.querySelectorAll('.artwork-grid'));
        const gridIndex = grids.indexOf(artworkGrid);

        // Find the index of the artwork in its grid
        const index = Array.from(artworkGrid.children).indexOf(element.parentElement);
        const count = artworkGrid.children.length - 1;

        // Update modal content with the clicked artwork's data
        const artworkImage = element.querySelector('.artwork-image');
        const modalImage = document.createElement('img');

        modalContainer.innerHTML = '';

        // Use full-size image for modal
        modalImage.src = artworkImage.dataset.fullsize || artworkImage.src;
        modalImage.alt = artworkImage.alt;
        modalImage.className = 'modal-artwork-image';

        modalContainer.appendChild(modalImage);

        let prev = index - 1;
        let next = index + 1;
        if (prev < 0) prev = count;
        if (next > count) next = 0;

        // Set navigation button indices and store the grid index as a data attribute
        const prevBtnEl = document.querySelectorAll('.nav-btn.prev-btn')[0];
        const nextBtnEl = document.querySelectorAll('.nav-btn.next-btn')[0];
        prevBtnEl.setAttribute("index", prev);
        nextBtnEl.setAttribute("index", next);
        prevBtnEl.setAttribute("data-grid", gridIndex);
        nextBtnEl.setAttribute("data-grid", gridIndex);
        prevBtnEl.style.display = 'block';
        nextBtnEl.style.display = 'block';

        // Display the modal
        modalBackdrop.style.display = 'flex';

        let burgerMenu = document.querySelector('.burger-menu');
        burgerMenu.style.display = 'none';
    }
}

function showSection(hash, sections, navLinks, mobileMenu) {
    if (hash) {
        document.body.classList.remove('bg-image');
        mobileMenu.classList.remove('active');
    } else {
        mobileMenu.classList.add('active');
    }
    navLinks.forEach(link => {
        link.style.fontWeight = hash ? '' : link.classList.contains('artist-name') ? 500 : 400;
    });
    sections.forEach(section => {
        section.hidden = (hash !== '#' + section.id);
    });
}