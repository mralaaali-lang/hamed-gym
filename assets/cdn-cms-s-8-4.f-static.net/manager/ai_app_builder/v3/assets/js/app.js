// Explain: JavaScript for navigation, scroll effects, and a fullscreen image lightbox with swipe and counter.
/* Hamed Gym — navbar, mobile menu, header scroll state, scroll reveal */
document.addEventListener('DOMContentLoaded', function () {
    var header = document.getElementById('siteHeader');
    var navOverlay = document.getElementById('navOverlay');
    var navOpenButton = document.getElementById('navOpenButton');
    var navCloseButton = document.getElementById('navCloseButton');
    var overlayLinks = navOverlay ? navOverlay.querySelectorAll('a') : [];

    function openNav() {
        if (!navOverlay) {
            return;
        }
        navOverlay.classList.add('is-open');
        navOverlay.setAttribute('aria-hidden', 'false');
        if (navOpenButton) {
            navOpenButton.setAttribute('aria-expanded', 'true');
        }
        document.body.style.overflow = 'hidden';
        var firstLink = navOverlay.querySelector('a');
        if (firstLink) {
            firstLink.focus();
        }
    }

    function closeNav(returnFocus) {
        if (!navOverlay) {
            return;
        }
        var wasOpen = navOverlay.classList.contains('is-open');
        navOverlay.classList.remove('is-open');
        navOverlay.setAttribute('aria-hidden', 'true');
        if (navOpenButton) {
            navOpenButton.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
        if (returnFocus && wasOpen && navOpenButton) {
            navOpenButton.focus();
        }
    }

    if (navOpenButton) {
        navOpenButton.addEventListener('click', openNav);
    }

    if (navCloseButton) {
        navCloseButton.addEventListener('click', function () {
            closeNav(true);
        });
    }

    overlayLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            closeNav(false);
        });
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeNav(true);
        }
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024) {
            closeNav(false);
        }
    });

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 24) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    var revealItems = document.querySelectorAll('.reveal');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function showAll() {
        revealItems.forEach(function (el) {
            el.classList.add('is-visible');
        });
    }

    try {
        if (!('IntersectionObserver' in window) || reduceMotion) {
            showAll();
        } else {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

            revealItems.forEach(function (el) {
                observer.observe(el);
            });
        }
    } catch (error) {
        showAll();
    }

    // Gallery lightbox
    var galleryTiles = document.querySelectorAll('.gallery-tile__zoom');
    var lightbox = document.getElementById('galleryLightbox');

    if (galleryTiles.length && lightbox) {
        var lightboxImg = document.getElementById('lightboxImg');
        var lightboxCaption = document.getElementById('lightboxCaption');
        var lightboxLoader = document.getElementById('lightboxLoader');
        var lightboxClose = document.getElementById('lightboxClose');
        var lightboxPrev = document.getElementById('lightboxPrev');
        var lightboxNext = document.getElementById('lightboxNext');
        var lightboxCounter = document.getElementById('lightboxCounter');
        var lightboxItems = [];
        var lightboxIndex = 0;
        var lastTrigger = null;

        if (lightboxImg) {
            lightboxImg.addEventListener('load', function () {
                if (lightboxLoader) {
                    lightboxLoader.classList.remove('is-active');
                }
                lightboxImg.classList.add('is-ready');
            });
            lightboxImg.addEventListener('error', function () {
                if (lightboxLoader) {
                    lightboxLoader.classList.remove('is-active');
                }
                lightboxImg.classList.add('is-ready');
            });
        }

        galleryTiles.forEach(function (tile) {
            lightboxItems.push({
                src: tile.getAttribute('data-image'),
                caption: tile.getAttribute('data-caption') || ''
            });
        });

        function showLightboxImage(index) {
            if (!lightboxItems.length) {
                return;
            }
            lightboxIndex = (index % lightboxItems.length + lightboxItems.length) % lightboxItems.length;
            var item = lightboxItems[lightboxIndex];
            if (lightboxCaption) {
                lightboxCaption.textContent = item.caption;
            }
            if (lightboxCounter) {
                lightboxCounter.textContent = (lightboxIndex + 1) + ' / ' + lightboxItems.length;
            }
            if (!lightboxImg) {
                return;
            }
            lightboxImg.classList.remove('is-ready');
            lightboxImg.alt = item.caption;
            if (lightboxLoader) {
                lightboxLoader.classList.add('is-active');
            }
            lightboxImg.src = item.src;
            if (lightboxImg.complete && lightboxImg.naturalWidth > 0) {
                if (lightboxLoader) {
                    lightboxLoader.classList.remove('is-active');
                }
                lightboxImg.classList.add('is-ready');
            }
        }

        function openLightbox(index, trigger) {
            lastTrigger = trigger || null;
            showLightboxImage(index);
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            if (lightboxClose) {
                lightboxClose.focus();
            }
        }

        function closeLightbox() {
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (lightboxImg) {
                lightboxImg.removeAttribute('src');
            }
            if (lastTrigger) {
                lastTrigger.focus();
                lastTrigger = null;
            }
        }

        galleryTiles.forEach(function (tile, i) {
            tile.addEventListener('click', function () {
                openLightbox(i, tile);
            });
        });

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', function () {
                showLightboxImage(lightboxIndex - 1);
            });
        }
        if (lightboxNext) {
            lightboxNext.addEventListener('click', function () {
                showLightboxImage(lightboxIndex + 1);
            });
        }

        lightbox.addEventListener('click', function (event) {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (!lightbox.classList.contains('is-open')) {
                return;
            }
            if (event.key === 'Escape') {
                closeLightbox();
            } else if (event.key === 'ArrowRight') {
                showLightboxImage(lightboxIndex - 1);
            } else if (event.key === 'ArrowLeft') {
                showLightboxImage(lightboxIndex + 1);
            }
        });

        // Swipe between photos with a finger on touch devices
        var touchStartX = 0;
        var touchStartY = 0;
        var touchActive = false;

        lightbox.addEventListener('touchstart', function (event) {
            if (event.touches.length !== 1) {
                touchActive = false;
                return;
            }
            touchActive = true;
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        }, { passive: true });

        lightbox.addEventListener('touchend', function (event) {
            if (!touchActive || !event.changedTouches.length) {
                touchActive = false;
                return;
            }
            touchActive = false;
            var deltaX = event.changedTouches[0].clientX - touchStartX;
            var deltaY = event.changedTouches[0].clientY - touchStartY;
            if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY)) {
                return;
            }
            if (deltaX < 0) {
                showLightboxImage(lightboxIndex + 1);
            } else {
                showLightboxImage(lightboxIndex - 1);
            }
        }, { passive: true });
    }

    // Nav "More" dropdown (desktop)
    var navMore = document.getElementById('navMore');

    if (navMore) {
        var navMoreToggle = navMore.querySelector('.nav-dropdown__toggle');

        var closeNavMore = function () {
            navMore.classList.remove('is-open');
            if (navMoreToggle) {
                navMoreToggle.setAttribute('aria-expanded', 'false');
            }
        };

        if (navMoreToggle) {
            navMoreToggle.addEventListener('click', function (event) {
                event.stopPropagation();
                var isOpen = navMore.classList.toggle('is-open');
                navMoreToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        }

        document.addEventListener('click', function (event) {
            if (navMore.classList.contains('is-open') && !navMore.contains(event.target)) {
                closeNavMore();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeNavMore();
            }
        });

        navMore.querySelectorAll('.nav-dropdown__panel a').forEach(function (link) {
            link.addEventListener('click', function () {
                closeNavMore();
            });
        });
    }

    // Trial session booking form (final CTA)
    var trialForm = document.getElementById('trialForm');
    var trialFormStatus = document.getElementById('trialFormStatus');
    var trialSuccess = document.getElementById('trialSuccess');
    var trialSuccessText = document.getElementById('trialSuccessText');

    if (trialForm) {
        var trialSubmitButton = trialForm.querySelector('button[type="submit"]');

        function showTrialStatus(message, isSuccess) {
            if (!trialFormStatus) {
                return;
            }
            trialFormStatus.textContent = message;
            trialFormStatus.classList.remove('is-success', 'is-error');
            trialFormStatus.classList.add('is-visible', isSuccess ? 'is-success' : 'is-error');
        }

        trialForm.addEventListener('submit', function (event) {
            event.preventDefault();

            var nameValue = trialForm.elements.name ? trialForm.elements.name.value.trim() : '';
            var phoneValue = trialForm.elements.phone ? trialForm.elements.phone.value.trim() : '';
            var timeValue = trialForm.elements.time ? trialForm.elements.time.value : '';

            if (!nameValue || !phoneValue || !timeValue) {
                showTrialStatus('من فضلك اكتب الاسم ورقم الموبايل والوقت المناسب ليك.', false);
                return;
            }

            if (phoneValue.replace(/[^0-9]/g, '').length < 8) {
                showTrialStatus('رقم الموبايل مش مظبوط — اكتبه صح لو سمحت.', false);
                return;
            }

            if (trialSubmitButton) {
                trialSubmitButton.disabled = true;
            }
            showTrialStatus('بنبعت بياناتك…', true);

            if (typeof window.MessagesSystem === 'undefined') {
                showTrialStatus('في مشكلة مؤقتة، جرّب تاني بعد شوية أو اتصل بينا على 010 96100820.', false);
                if (trialSubmitButton) {
                    trialSubmitButton.disabled = false;
                }
                return;
            }

            window.MessagesSystem.submit([
                { label: 'الاسم', value: nameValue, type: 'text' },
                { label: 'رقم الموبايل', value: phoneValue, type: 'tel' },
                { label: 'الوقت المناسب', value: timeValue, type: 'select' }
            ], trialForm).then(function (response) {
                if (response && response.success) {
                    if (trialSuccessText) {
                        trialSuccessText.textContent = 'شكرًا يا ' + nameValue + '! استلمنا طلبك وهنكلمك على ' + phoneValue + ' نأكد معاك ميعاد تمرينتك التجريبية.';
                    }
                    trialForm.reset();
                    trialForm.setAttribute('hidden', 'hidden');
                    if (trialFormStatus) {
                        trialFormStatus.classList.remove('is-visible', 'is-success', 'is-error');
                    }
                    if (trialSuccess) {
                        trialSuccess.removeAttribute('hidden');
                        trialSuccess.setAttribute('tabindex', '-1');
                        trialSuccess.focus();
                    }
                } else {
                    showTrialStatus((response && response.error) ? response.error : 'مقدرناش نبعت طلبك دلوقتي، جرّب تاني أو اتصل بينا.', false);
                    if (trialSubmitButton) {
                        trialSubmitButton.disabled = false;
                    }
                }
            }).catch(function () {
                showTrialStatus('في مشكلة في الاتصال، جرّب تاني أو اتصل بينا على 010 96100820.', false);
                if (trialSubmitButton) {
                    trialSubmitButton.disabled = false;
                }
            });
        });
    }
});