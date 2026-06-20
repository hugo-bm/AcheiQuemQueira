'use strict';

import { ROUTES } from "./assets/js/core/constants.js";
import { Session } from "./assets/js/core/session.js";

const header = document.querySelector('.landing-header');

const mobileNavbar = document.querySelector('.navbar-collapse');

function navigate(route) {
    if (!route) {
        console.warn('[LandingPage] Rota não encontrada.');
        return;
    }
    window.location.href = route;
}

function isAuthenticated() {
    try {
        if (typeof Session === 'undefined') {
            return null;
        }

        return Session.isAuthenticated();
    } catch (error) {
        console.error('[LandingPage] Erro ao recuperar usuário.', error);
        return null;
    }
}

function handlePublishItem() {
    if (isAuthenticated()) {
        navigate(ROUTES['add-item']);
        return;
    }
    navigate(ROUTES['register']);
}

function initializeCTAButtons() {

    const registerButtons = [
        'btn-register',
        'hero-register',
        'cta-register',
        'footer-register'
    ];

    registerButtons.forEach(id => {
        const button = document.getElementById(id);

        if (!button) {
            return;
        }

        button.addEventListener(
            'click',
            () => {navigate(ROUTES['register']);}
        );
    });

    const loginButtons = [ 'btn-login', 'footer-login'];

    loginButtons.forEach(id => {
        const button = document.getElementById(id);

        if (!button) {
            return;
        }

        button.addEventListener(
            'click',
            () => {navigate(ROUTES['login']);}
        );
    });

    const dashboardButtons = [
        'hero-dashboard',
        'cta-dashboard',
        'footer-dashboard'
    ];

    dashboardButtons.forEach(id => {
        const button = document.getElementById(id);
        if (!button) {
            return;
        }
        button.addEventListener(
            'click',
            () => {navigate(ROUTES['dashboard']);}
        );
    });
    const publishButton = document.getElementById('btn-publish');
    if (publishButton) {
        publishButton.addEventListener('click', handlePublishItem);
    }
}

function initializeSmoothScroll() {

    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(anchor => {
        anchor.addEventListener(
            'click',
            event => {
                const targetId = anchor.getAttribute('href');

                if ( !targetId || targetId === '#') {
                    return;
                }
                const target = document.querySelector(targetId);
                if (!target) {
                    return;
                }
                event.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                closeMobileMenu();
            }
        );
    });
}

function closeMobileMenu() {
    if (!mobileNavbar) {
        return;
    }

    if (!mobileNavbar.classList.contains('show')) {
        return;
    }

    const collapse = bootstrap.Collapse.getInstance(mobileNavbar );

    if (collapse) {
        collapse.hide();
    }
}

function initializeMobileMenu() {

    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
}

function updateHeaderState() {
    if (!header) {
        return;
    }

    if (window.scrollY > 40) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

function initializeHeader() {
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState,
        {
            passive: true
        }
    );
}

function initializeRevealAnimations() {

    const elements =
        document.querySelectorAll(

            '.reveal,' +
            '.reveal-left,' +
            '.reveal-right'

        );

    if (
        !('IntersectionObserver' in window)
    ) {

        elements.forEach(element => {

            element.classList.add(
                'reveal-visible'
            );

        });

        return;
    }

    const observer = new IntersectionObserver(
            entries => {
                entries.forEach(
                    entry => {
                        if (!entry.isIntersecting) {
                            return;
                        }
                        entry.target.classList.add('reveal-visible');
                        observer.unobserve(entry.target);
                    }
                );
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px'
            }
        );

    elements.forEach(element => {
        observer.observe(element);
    });
}

function decorateSections() {

    const sections = document.querySelectorAll(
            '.section-header,' +
            '.problem-card,' +
            '.solution-step,' +
            '.timeline-item,' +
            '.quality-card,' +
            '.category-card,' +
            '.benefit-item,' +
            '.testimonial-card,' +
            '.security-card,' +
            '.impact-item,' +
            '.mockup-frame,' +
            '.quality-mockup-frame,' +
            '.vertical-mockup-frame'
        );

    sections.forEach((element, index) => {
        if ( element.classList.contains('reveal')) {
            return;
        }
        element.classList.add('reveal');

        const delayClass =`delay-${(index % 5) + 1}`;

        element.classList.add(delayClass);
    });
}

function initializeHeroEffects() {
    const heroImage = document.querySelector('.hero-image');

    if (!heroImage) {
        return;
    }

    window.addEventListener(
        'scroll',
        () => {
            const offset = window.scrollY * 0.15;

            heroImage.style.transform = `translateY(${offset}px)`;
        },
        {
            passive: true
        }
    );
}

function preloadCriticalImages() {

    const heroImage = document.querySelector('.hero-image');

    if (!heroImage) {
        return;
    }

    const image = new Image();

    image.src = heroImage.src;
}

export function initializeLandingPage() {

    decorateSections();

    initializeCTAButtons();

    initializeSmoothScroll();

    initializeMobileMenu();

    initializeHeader();

    initializeRevealAnimations();

    initializeHeroEffects();

    preloadCriticalImages();

    console.info('[LandingPage] Inicializada com sucesso.');
}

document.addEventListener('DOMContentLoaded',initializeLandingPage);