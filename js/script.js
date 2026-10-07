document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".mental-audio-player").forEach(player => {

        const audio = player.querySelector(".mental-audio");
        const playButton = player.querySelector(".audio-play");
        const playSymbol = player.querySelector(".play-symbol");
        const progress = player.querySelector(".audio-progress");
        const volume = player.querySelector(".volume-slider");
        const time = player.querySelector(".audio-time");

        if (!audio || !playButton) {
            console.error("Lecteur audio introuvable.");
            return;
        }

        /* Volume initial */
        audio.volume = 0.2;


        function formatTime(seconds) {

            if (!Number.isFinite(seconds)) {
                return "00:00";
            }

            const minutes = Math.floor(seconds / 60);
            const secondsLeft = Math.floor(seconds % 60);

            return (
                String(minutes).padStart(2, "0")
                + ":"
                + String(secondsLeft).padStart(2, "0")
            );
        }


        /* =========================
           PLAY / PAUSE
           ========================= */

        playButton.addEventListener("click", async () => {

            console.log("Bouton audio cliqué.");

            if (audio.paused) {

                try {

                    await audio.play();

                    console.log("Lecture démarrée.");

                } catch (error) {

                    console.error(
                        "Impossible de lire le fichier audio :",
                        error
                    );

                }

            } else {

                audio.pause();

            }

        });


        audio.addEventListener("play", () => {
            playSymbol.textContent = "Ⅱ";
        });


        audio.addEventListener("pause", () => {
            playSymbol.textContent = "▶";
        });


        /* =========================
           MÉTADONNÉES
           ========================= */

        audio.addEventListener("loadedmetadata", () => {

            time.textContent =
                "00:00 / " + formatTime(audio.duration);

        });


        /* =========================
           PROGRESSION
           ========================= */

        audio.addEventListener("timeupdate", () => {

            if (!audio.duration) return;

            progress.value =
                (audio.currentTime / audio.duration) * 100;

            time.textContent =
                formatTime(audio.currentTime)
                + " / "
                + formatTime(audio.duration);

        });


        progress.addEventListener("input", () => {

            if (!audio.duration) return;

            audio.currentTime =
                (Number(progress.value) / 100)
                * audio.duration;

        });


        /* =========================
           VOLUME
           ========================= */

        volume.addEventListener("input", () => {

            audio.volume =
                Number(volume.value);

        });


        /* =========================
           FIN
           ========================= */

        audio.addEventListener("ended", () => {

            playSymbol.textContent = "▶";
            progress.value = 0;

        });


        /* =========================
           ERREUR FICHIER
           ========================= */

        audio.addEventListener("error", () => {

            console.error(
                "Le fichier audio n'a pas pu être chargé.",
                audio.currentSrc
            );

        });

    });

});

/* ==========================================================
   ==========================================================
   PHYSIQUE — 3D SCROLL REEL
   ==========================================================
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const reel =
        document.querySelector(".physical-reel");

    const sections =
        document.querySelectorAll(".reel-section");

    const progress =
        document.querySelector(".reel-progress");

    const progressButtons =
        document.querySelectorAll(
            ".reel-progress button"
        );


    /*
        Si nous ne sommes pas sur physique.html,
        on arrête immédiatement.
    */

    if (!reel || !sections.length) return;



    /* ======================================================
       ACCESSIBILITÉ
       ====================================================== */

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


    /*
        requestAnimationFrame évite de recalculer
        cinquante fois pendant un seul mouvement de scroll.
    */

    let ticking = false;



    /* ======================================================
       PETITE FONCTION UTILITAIRE
       ====================================================== */

    function clamp(value, min, max) {

        return Math.min(
            Math.max(value, min),
            max
        );

    }



    /* ======================================================
       CALCUL DE LA BOBINE
       ====================================================== */

    function updateReel() {

        ticking = false;


        /*
            En mode reduced-motion, aucune 3D.
        */

        if (reducedMotion.matches) {

            sections.forEach(section => {

                section.style.removeProperty(
                    "--reel-rotate"
                );

                section.style.removeProperty(
                    "--reel-z"
                );

                section.style.removeProperty(
                    "--reel-y"
                );

                section.style.removeProperty(
                    "--reel-scale"
                );

                section.style.removeProperty(
                    "--reel-opacity"
                );

                section.style.removeProperty(
                    "--reel-fade"
                );

            });

            return;

        }


        const viewportHeight =
            window.innerHeight;

        const viewportCenter =
            viewportHeight / 2;


        /*
            Mobile = effet beaucoup plus doux.
        */

        const mobile =
            window.innerWidth <= 700;


        const maxRotation =
            mobile ? 11 : 30;

        const maxDepth =
            mobile ? 55 : 190;

        const maxVertical =
            mobile ? 8 : 24;


        let activeSection = null;
        let closestDistance = Infinity;



        sections.forEach(section => {

            const rect =
                section.getBoundingClientRect();


            const sectionCenter =
                rect.top +
                rect.height / 2;


            /*
                distance :

                0  = exactement au centre
                -1 = environ un écran au-dessus
                 1 = environ un écran en dessous
            */

            const rawDistance =
                (
                    sectionCenter -
                    viewportCenter
                )
                /
                viewportHeight;


            const distance =
                clamp(
                    rawDistance,
                    -1.35,
                    1.35
                );


            const absoluteDistance =
                Math.abs(distance);



            /* ==============================================
               ROTATION

               En haut : rotation positive.
               En bas  : rotation négative.

               C'est ce qui crée la sensation de cylindre.
               ============================================== */

            const rotation =
                distance *
                -maxRotation;



            /* ==============================================
               PROFONDEUR

               Plus la section s'éloigne du centre,
               plus elle part derrière l'écran.
               ============================================== */

            const depth =
                -Math.pow(
                    absoluteDistance,
                    1.15
                )
                *
                maxDepth;



            /* ==============================================
               PETITE COURBURE VERTICALE

               Ça renforce légèrement la sensation que
               l'élément suit la surface d'une bobine.
               ============================================== */

            const vertical =
                distance *
                maxVertical;



            /* ==============================================
               SCALE

               Très discret.
               ============================================== */

            const scale =
                1 -
                Math.min(
                    absoluteDistance * .055,
                    .07
                );



            /* ==============================================
               OPACITÉ

               On ne la descend jamais trop bas.
               Les éléments restent perceptibles.
               ============================================== */

            const opacity =
                1 -
                Math.min(
                    absoluteDistance * .48,
                    .62
                );



            /* ==============================================
               OMBRAGE
               ============================================== */

            const fade =
                Math.min(
                    absoluteDistance * .25,
                    .22
                );



            section.style.setProperty(
                "--reel-rotate",
                `${rotation}deg`
            );

            section.style.setProperty(
                "--reel-z",
                `${depth}px`
            );

            section.style.setProperty(
                "--reel-y",
                `${vertical}px`
            );

            section.style.setProperty(
                "--reel-scale",
                scale
            );

            section.style.setProperty(
                "--reel-opacity",
                opacity
            );

            section.style.setProperty(
                "--reel-fade",
                fade
            );



            /* ==============================================
               SECTION ACTIVE
               ============================================== */

            if (
                absoluteDistance <
                closestDistance
            ) {

                closestDistance =
                    absoluteDistance;

                activeSection =
                    section;

            }

        });



        /* ==================================================
           MISE À JOUR DE LA PROGRESSION
           ================================================== */

        if (activeSection) {

            const activeNumber =
                activeSection.dataset.reel;


            progressButtons.forEach(button => {

                const active =
                    button.dataset.target ===
                    activeNumber;


                button.classList.toggle(
                    "is-active",
                    active
                );

            });

        }



        /* ==================================================
           AFFICHAGE DE LA BARRE LATÉRALE

           Elle n'apparaît que lorsque nous sommes
           réellement dans la bobine.
           ================================================== */

        if (progress) {

            const reelRect =
                reel.getBoundingClientRect();


            const insideReel =
                reelRect.top <
                viewportHeight * .75
                &&
                reelRect.bottom >
                viewportHeight * .25;


            progress.classList.toggle(
                "is-visible",
                insideReel
            );

        }

    }



    /* ======================================================
       SCROLL
       ====================================================== */

    function requestReelUpdate() {

        if (ticking) return;


        ticking = true;


        requestAnimationFrame(
            updateReel
        );

    }



    window.addEventListener(
        "scroll",
        requestReelUpdate,
        {
            passive: true
        }
    );


    window.addEventListener(
        "resize",
        requestReelUpdate
    );


    reducedMotion.addEventListener(
        "change",
        requestReelUpdate
    );



    /* ======================================================
       NAVIGATION LATÉRALE

       Les numéros peuvent être cliqués.
       Ce n'est pas obligatoire pour comprendre la page,
       mais autant que ça fonctionne :D
       ====================================================== */

    progressButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const target =
                    document.querySelector(
                        `.reel-section[data-reel="${button.dataset.target}"]`
                    );


                if (!target) return;


                target.scrollIntoView({

                    behavior:
                        reducedMotion.matches
                            ? "auto"
                            : "smooth",

                    block:
                        "center"

                });

            }
        );

    });



    /* ======================================================
       PREMIER CALCUL
       ====================================================== */

    updateReel();

});

/* ==========================================================
   ==========================================================
   CAPACITÉS — LE MANQUE PARTAGÉ
   ==========================================================
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const story =
        document.querySelector(".ability-bond-story");

    const thread =
        document.querySelector(".ability-thread");

    const stages =
        document.querySelectorAll(
            "[data-bond-stage]"
        );

    const biteStages =
        document.querySelectorAll(
            ".bite-stage"
        );


    /*
        Si on n'est pas sur capacites.html :
        rien à faire.
    */

    if (!story || !thread) return;


    let ticking = false;



    /* ======================================================
       OUTIL
       ====================================================== */

    function clamp(value, min, max) {

        return Math.min(
            Math.max(value, min),
            max
        );

    }



    /* ======================================================
       PROGRESSION DU FIL
       ====================================================== */

    function updateAbilityBond() {

        ticking = false;


        const viewportHeight =
            window.innerHeight;


        const storyRect =
            story.getBoundingClientRect();


        /*
            On considère que la lecture se produit
            légèrement sous le centre de l'écran.
        */

        const readingPoint =
            viewportHeight * .58;


        /*
            Distance déjà parcourue à l'intérieur
            de ability-bond-story.
        */

        const travelled =
            readingPoint -
            storyRect.top;


        const progress =
            clamp(
                travelled /
                storyRect.height,
                0,
                1
            );


        thread.style.setProperty(
            "--bond-progress",
            `${progress * 100}%`
        );



        /* ==================================================
           ÉTAPE ACTUELLE
           ================================================== */

        let activeStage = null;
        let closestDistance = Infinity;


        stages.forEach(stage => {

            const rect =
                stage.getBoundingClientRect();


            const center =
                rect.top +
                rect.height / 2;


            const distance =
                Math.abs(
                    center -
                    viewportHeight / 2
                );


            if (
                distance <
                closestDistance
            ) {

                closestDistance =
                    distance;

                activeStage =
                    stage;

            }

        });


        stages.forEach(stage => {

            stage.classList.toggle(
                "bond-active",
                stage === activeStage
            );

        });



        /* ==================================================
           TROIS MORSURES

           Elles deviennent légèrement plus nettes
           une fois atteintes par le lecteur.
           ================================================== */

        biteStages.forEach(stage => {

            const rect =
                stage.getBoundingClientRect();


            const reached =
                rect.top <
                viewportHeight * .7;


            stage.classList.toggle(
                "is-reached",
                reached
            );

        });

    }



    /* ======================================================
       REQUEST ANIMATION FRAME
       ====================================================== */

    function requestAbilityUpdate() {

        if (ticking) return;


        ticking = true;


        requestAnimationFrame(
            updateAbilityBond
        );

    }



    window.addEventListener(
        "scroll",
        requestAbilityUpdate,
        {
            passive: true
        }
    );


    window.addEventListener(
        "resize",
        requestAbilityUpdate
    );


    updateAbilityBond();

});

/* ==========================================================
   CAPACITÉS — ENCAISSER
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const endure =
        document.querySelector(".combat-endure");

    const word =
        document.querySelector(
            ".combat-endure-word strong"
        );


    if (!endure || !word) return;


    endure.addEventListener(
        "mousemove",
        event => {

            const rect =
                endure.getBoundingClientRect();


            const x =
                (
                    event.clientX -
                    rect.left
                )
                /
                rect.width;


            const y =
                (
                    event.clientY -
                    rect.top
                )
                /
                rect.height;


            /*
                La position du curseur devient
                une petite poussée sur le mot.
            */

            const pushX =
                (x - .5) * 7;

            const pushY =
                (y - .5) * 4;


            word.style.transform =
                `translate(${pushX}px, ${pushY}px)`;


            word.style.textShadow =
                `
                ${-4 - pushX}px 0
                rgba(120,0,40,.3),

                ${4 - pushX}px 0
                rgba(0,110,75,.22)
                `;

        }
    );


    endure.addEventListener(
        "mouseleave",
        () => {

            word.style.transform = "";

            word.style.textShadow = "";

        }
    );

});

/* ==========================================================
   ==========================================================
   POSSESSIONS — CARROUSEL MAISON
   ==========================================================
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const carousel =
        document.querySelector(".house-carousel");

    const track =
        document.querySelector(".house-carousel-track");

    const slides =
        [...document.querySelectorAll(".house-slide")];

    const dots =
        [...document.querySelectorAll(".house-carousel-nav button")];

    const currentDisplay =
        document.querySelector(".house-current");

    const previousButton =
        document.querySelector(".house-carousel-prev");

    const nextButton =
        document.querySelector(".house-carousel-next");


    if (
        !carousel ||
        !track ||
        !slides.length
    ) {
        return;
    }



    /* ======================================================
       ÉTAT
       ====================================================== */

    let currentIndex = 0;

    let startX = 0;
    let currentX = 0;

    let dragging = false;

    let autoplay = null;



    /* ======================================================
       AFFICHER UNE IMAGE
       ====================================================== */

    function showSlide(index) {

        /*
           Boucle infinie :
           après 09 → 01
           avant 01 → 09
        */

        if (index < 0) {
            index = slides.length - 1;
        }


        if (index >= slides.length) {
            index = 0;
        }


        currentIndex = index;


        track.style.transform =
            `translateX(-${currentIndex * 100}%)`;


        slides.forEach(
            (slide, slideIndex) => {

                slide.classList.toggle(
                    "active",
                    slideIndex === currentIndex
                );

            }
        );


        dots.forEach(
            (dot, dotIndex) => {

                dot.classList.toggle(
                    "active",
                    dotIndex === currentIndex
                );

            }
        );


        if (currentDisplay) {

            currentDisplay.textContent =
                String(currentIndex + 1)
                .padStart(2, "0");

        }

    }



    /* ======================================================
       PRÉCÉDENT / SUIVANT
       ====================================================== */

    function previousSlide() {

        showSlide(
            currentIndex - 1
        );

        restartAutoplay();

    }


    function nextSlide() {

        showSlide(
            currentIndex + 1
        );

        restartAutoplay();

    }



    previousButton?.addEventListener(
        "click",
        previousSlide
    );


    nextButton?.addEventListener(
        "click",
        nextSlide
    );



    /* ======================================================
       NUMÉROS 01 — 09
       ====================================================== */

    dots.forEach(
        (dot, index) => {

            dot.addEventListener(
                "click",
                () => {

                    showSlide(index);

                    restartAutoplay();

                }
            );

        }
    );



    /* ======================================================
       CLAVIER
       ====================================================== */

    carousel.setAttribute(
        "tabindex",
        "0"
    );


    carousel.addEventListener(
        "keydown",
        event => {

            if (event.key === "ArrowLeft") {

                previousSlide();

            }


            if (event.key === "ArrowRight") {

                nextSlide();

            }

        }
    );



    /* ======================================================
       GLISSER À LA SOURIS / AU DOIGT
       ====================================================== */

    carousel.addEventListener(
        "pointerdown",
        event => {

            /*
               Ne pas démarrer un drag
               en cliquant sur une flèche.
            */

            if (
                event.target.closest(
                    ".house-carousel-arrow"
                )
            ) {
                return;
            }


            dragging = true;

            startX =
                event.clientX;

            currentX =
                event.clientX;


            carousel.setPointerCapture(
                event.pointerId
            );


            stopAutoplay();

        }
    );


    carousel.addEventListener(
        "pointermove",
        event => {

            if (!dragging) return;


            currentX =
                event.clientX;

        }
    );


    carousel.addEventListener(
        "pointerup",
        event => {

            if (!dragging) return;


            dragging = false;


            const distance =
                currentX - startX;


            /*
               Seuil nécessaire pour
               considérer le geste comme un swipe.
            */

            if (
                Math.abs(distance) > 60
            ) {

                if (distance < 0) {

                    showSlide(
                        currentIndex + 1
                    );

                }

                else {

                    showSlide(
                        currentIndex - 1
                    );

                }

            }


            restartAutoplay();

        }
    );



    carousel.addEventListener(
        "pointercancel",
        () => {

            dragging = false;

            restartAutoplay();

        }
    );



    /* ======================================================
       AUTOPLAY

       Lent volontairement :
       on ne veut pas que les images défilent
       pendant que le lecteur essaie de les regarder.
       ====================================================== */

    function startAutoplay() {

        if (
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {
            return;
        }


        stopAutoplay();


        autoplay =
            window.setInterval(
                () => {

                    showSlide(
                        currentIndex + 1
                    );

                },
                6500
            );

    }


    function stopAutoplay() {

        if (!autoplay) return;


        clearInterval(
            autoplay
        );


        autoplay = null;

    }


    function restartAutoplay() {

        stopAutoplay();

        startAutoplay();

    }



    /* ======================================================
       PAUSE QUAND LA SOURIS EST SUR LA PHOTO
       ====================================================== */

    carousel.addEventListener(
        "mouseenter",
        stopAutoplay
    );


    carousel.addEventListener(
        "mouseleave",
        startAutoplay
    );



    /* ======================================================
       INITIALISATION
       ====================================================== */

    showSlide(0);

    startAutoplay();

});




/* ==========================================================
   FRÈGÈTAL — CARROUSEL SURFACE
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const carousels =
        document.querySelectorAll(
            "[data-shop-carousel]"
        );


    carousels.forEach(carousel => {

        const track =
            carousel.querySelector(
                "[data-shop-track]"
            );

        const slides =
            [
                ...carousel.querySelectorAll(
                    ".shop-slide"
                )
            ];

        const navButtons =
            [
                ...carousel.querySelectorAll(
                    "[data-shop-nav] button"
                )
            ];

        const currentDisplay =
            carousel.querySelector(
                "[data-shop-current]"
            );

        const previousButton =
            carousel.querySelector(
                "[data-shop-prev]"
            );

        const nextButton =
            carousel.querySelector(
                "[data-shop-next]"
            );


        if (
            !track ||
            !slides.length
        ) {
            return;
        }


        let currentIndex = 0;

        let startX = 0;
        let currentX = 0;
        let dragging = false;


        function showSlide(index) {

            if (index < 0) {
                index = slides.length - 1;
            }


            if (index >= slides.length) {
                index = 0;
            }


            currentIndex = index;


            track.style.transform =
                `translateX(-${currentIndex * 100}%)`;


            slides.forEach(
                (slide, slideIndex) => {

                    slide.classList.toggle(
                        "active",
                        slideIndex === currentIndex
                    );

                }
            );


            navButtons.forEach(
                (button, buttonIndex) => {

                    button.classList.toggle(
                        "active",
                        buttonIndex === currentIndex
                    );

                }
            );


            if (currentDisplay) {

                currentDisplay.textContent =
                    String(currentIndex + 1)
                    .padStart(2, "0");

            }

        }


        previousButton?.addEventListener(
            "click",
            () => {

                showSlide(
                    currentIndex - 1
                );

            }
        );


        nextButton?.addEventListener(
            "click",
            () => {

                showSlide(
                    currentIndex + 1
                );

            }
        );


        navButtons.forEach(
            (button, index) => {

                button.addEventListener(
                    "click",
                    () => {

                        showSlide(index);

                    }
                );

            }
        );


        /* ==============================================
           SWIPE
           ============================================== */

        carousel.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.target.closest(
                        ".shop-arrow"
                    )
                ) {
                    return;
                }


                dragging = true;

                startX =
                    event.clientX;

                currentX =
                    event.clientX;


                carousel.setPointerCapture(
                    event.pointerId
                );

            }
        );


        carousel.addEventListener(
            "pointermove",
            event => {

                if (!dragging) return;


                currentX =
                    event.clientX;

            }
        );


        carousel.addEventListener(
            "pointerup",
            () => {

                if (!dragging) return;


                dragging = false;


                const distance =
                    currentX - startX;


                if (
                    Math.abs(distance) > 60
                ) {

                    showSlide(
                        distance < 0
                            ? currentIndex + 1
                            : currentIndex - 1
                    );

                }

            }
        );


        carousel.addEventListener(
            "pointercancel",
            () => {

                dragging = false;

            }
        );


        showSlide(0);

    });

});










document.addEventListener("DOMContentLoaded", () => {

    const facts = document.querySelectorAll("[data-fact]");

    facts.forEach((fact) => {

        const trigger =
            fact.querySelector(".fact-trigger");

        const label =
            fact.querySelector(".fact-open b");


        trigger.addEventListener("click", () => {

            const isOpen =
                fact.classList.contains("open");


            /*
             * On referme les autres.
             * Donc un seul fragment ouvert à la fois.
             */

            facts.forEach((otherFact) => {

                otherFact.classList.remove("open");

                const otherTrigger =
                    otherFact.querySelector(".fact-trigger");

                const otherLabel =
                    otherFact.querySelector(".fact-open b");


                otherTrigger?.setAttribute(
                    "aria-expanded",
                    "false"
                );


                if (otherLabel) {
                    otherLabel.textContent =
                        "OUVRIR";
                }

            });


            /*
             * Si celui-ci était fermé,
             * on l'ouvre.
             */

            if (!isOpen) {

                fact.classList.add("open");

                trigger.setAttribute(
                    "aria-expanded",
                    "true"
                );


                if (label) {
                    label.textContent =
                        "FERMER";
                }

            }

        });

    });

});



document.addEventListener("DOMContentLoaded", () => {

    /* ======================================================
       ACCUEIL — PARALLAX CURSEUR
       ====================================================== */

    const stage =
        document.querySelector("[data-home-stage]");


    if (stage) {

        const layers =
            stage.querySelectorAll("[data-home-depth]");


        stage.addEventListener("pointermove", (event) => {

            const rect =
                stage.getBoundingClientRect();


            const x =
                (event.clientX - rect.left)
                / rect.width
                - .5;


            const y =
                (event.clientY - rect.top)
                / rect.height
                - .5;


            layers.forEach((layer) => {

                const depth =
                    Number(layer.dataset.homeDepth) || 0;


                const moveX =
                    x * 26 * depth;


                const moveY =
                    y * 18 * depth;


                /*
                 * translate est utilisé au lieu de transform,
                 * pour ne pas écraser les transforms CSS
                 * existants.
                 */

                layer.style.translate =
                    `${moveX}px ${moveY}px`;

            });

        });


        stage.addEventListener("pointerleave", () => {

            layers.forEach((layer) => {

                layer.style.translate =
                    "0px 0px";

            });

        });

    }



    /* ======================================================
       ACCUEIL — MUSIQUE
       ====================================================== */

    const audio =
        document.querySelector("#home-audio");


    const soundButton =
        document.querySelector("[data-home-sound]");


    if (audio) {

        /*
         * TRÈS FAIBLE.
         *
         * 0.03 = 3 % du volume maximal.
         */

        audio.volume = 0.03;


        const tryAutoplay = async () => {

            try {

                await audio.play();

            }

            catch {

                /*
                 * Le navigateur refuse l'autoplay sonore.
                 *
                 * Le premier geste de l'utilisateur
                 * lancera alors la musique.
                 */

                const unlockAudio = async () => {

                    try {
                        await audio.play();
                    }

                    catch {
                        return;
                    }


                    document.removeEventListener(
                        "pointerdown",
                        unlockAudio
                    );

                    document.removeEventListener(
                        "keydown",
                        unlockAudio
                    );

                };


                document.addEventListener(
                    "pointerdown",
                    unlockAudio
                );


                document.addEventListener(
                    "keydown",
                    unlockAudio
                );

            }

        };


        tryAutoplay();


        /* ==================================================
           BOUTON SOUND
           ================================================== */

        soundButton?.addEventListener("click", async (event) => {

            event.stopPropagation();


            if (audio.paused) {

                try {

                    await audio.play();

                    soundButton.classList.remove(
                        "muted"
                    );

                }

                catch {
                    return;
                }

            }

            else {

                audio.pause();

                soundButton.classList.add(
                    "muted"
                );

            }

        });

    }

});

document.addEventListener("DOMContentLoaded", () => {

    const gate =
        document.querySelector("[data-home-gate]");

    const playButton =
        document.querySelector("[data-home-play]");

    const trip =
        document.querySelector("[data-home-trip]");

    const audio =
        document.querySelector("#home-audio");


    if (
        !gate ||
        !playButton ||
        !trip
    ) {
        return;
    }


    /* ======================================================
       MUSIQUE
       ====================================================== */

    if (audio) {

        /*
         * Faible volume.
         */

        audio.volume = 0.035;

    }


    /* ======================================================
       MOTS REBONDISSANTS
       ====================================================== */

    const wordElements =
        [...trip.querySelectorAll(".trip-word")];


    let words = [];

    let animationFrame = null;

    let lastTime = 0;

    let started = false;


    function random(min, max) {

        return (
            Math.random() *
            (max - min)
            + min
        );

    }


    function createWords() {

        const width =
            trip.clientWidth;

        const height =
            trip.clientHeight;


        words =
            wordElements.map((element, index) => {

                const rect =
                    element.getBoundingClientRect();


                const wordWidth =
                    rect.width;

                const wordHeight =
                    rect.height;


                /*
                 * Répartition de départ.
                 */

                const x =
                    random(
                        15,
                        Math.max(
                            16,
                            width - wordWidth - 15
                        )
                    );


                const y =
                    random(
                        15,
                        Math.max(
                            16,
                            height - wordHeight - 15
                        )
                    );


                /*
                 * Chaque mot a sa propre vitesse.
                 *
                 * Certains sont assez lents,
                 * d'autres clairement plus débiles.
                 */

                let speed =
                    random(22, 62);


                if (index % 4 === 0) {
                    speed *= 1.35;
                }


                const angle =
                    random(
                        0,
                        Math.PI * 2
                    );


                return {

                    element,

                    x,
                    y,

                    width: wordWidth,
                    height: wordHeight,

                    vx:
                        Math.cos(angle)
                        * speed,

                    vy:
                        Math.sin(angle)
                        * speed,

                    rotation:
                        random(-8, 8),

                    rotationSpeed:
                        random(-5, 5)

                };

            });

    }

    /* ==========================================================
       PHRASE ERRATIQUE — CHENILLE
       ========================================================== */

    const sentence =
        trip.querySelector("[data-trip-sentence]");

    const sentenceElements =
        sentence
            ? [...sentence.querySelectorAll("span")]
            : [];

    let sentenceParts = [];
    let sentenceHistory = [];
    let sentenceLastTime = 0;
    let sentenceAnimation = null;

    /* ==========================================================
   FANTÔMES DE LA CHENILLE

   Ce système est totalement indépendant du moteur
   de déplacement de la phrase.
   ========================================================== */

let sentenceGhosts = [];
let sentenceGhostFrame = null;

const sentenceGhostMax = 8;
const sentenceGhostHistoryLength = 90;

let activeSentenceGhosts = 0;

/*
 * Horloge du crash : on lit directement l'animation CSS de
 * .home-crash-clock. Aucun setInterval indépendant, donc aucune dérive.
 */
const crashClock =
    trip.querySelector("[data-home-crash-clock]");

let crashWasActive = false;

let crashCount = 0;
let crashAudioContext = null;

const crashSpectacle =
    trip.querySelector("[data-crash-spectacle]");

const crashTears =
    trip.querySelector("[data-crash-tears]");

const corruptionField =
    trip.querySelector("[data-corruption-field]");


const hurtWarning =
    document.querySelector("[data-hurt-warning]");

const hurtWarningPanel =
    document.querySelector("[data-hurt-warning-panel]");

const hurtSorryButton =
    document.querySelector("[data-hurt-sorry]");

const hurtNoButton =
    document.querySelector("[data-hurt-no]");

const hurtScreamer =
    document.querySelector("[data-hurt-screamer]");

let hurtWarningOpen = false;
let hurtScreamerRunning = false;
let hurtMusicWasPlaying = false;

let warningOscillator = null;
let warningOscillatorGain = null;

const spamClickTimes = [];
const spamClickThreshold = 7;
const spamClickWindow = 1400;


/* ==========================================================
   AUDIO — IMPACT SYNTHÉTISÉ
   Aucun fichier crash.mp3 nécessaire.
   Le contexte est créé depuis le clic PLAY, donc le navigateur
   autorise ensuite les impacts.
   ========================================================== */

function prepareCrashAudio() {

    if (crashAudioContext) {
        return;
    }

    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContextClass) {
        return;
    }

    crashAudioContext =
        new AudioContextClass();
}


function playCrashSound() {

    if (!crashAudioContext) {
        return;
    }

    const ctx = crashAudioContext;

    if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    /*
     * Coup grave.
     */
    const impact =
        ctx.createOscillator();

    const impactGain =
        ctx.createGain();

    impact.type = "sawtooth";

    impact.frequency.setValueAtTime(
        115 + Math.random() * 35,
        now
    );

    impact.frequency.exponentialRampToValueAtTime(
        28,
        now + .42
    );

    impactGain.gain.setValueAtTime(.0001, now);
    impactGain.gain.exponentialRampToValueAtTime(.18, now + .008);
    impactGain.gain.exponentialRampToValueAtTime(.0001, now + .52);

    impact.connect(impactGain);
    impactGain.connect(ctx.destination);

    impact.start(now);
    impact.stop(now + .55);


    /*
     * Bruit numérique / déchirure.
     */
    const duration = .62;

    const buffer =
        ctx.createBuffer(
            1,
            Math.floor(ctx.sampleRate * duration),
            ctx.sampleRate
        );

    const data =
        buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {

        const envelope =
            1 - i / data.length;

        data[i] =
            (Math.random() * 2 - 1)
            * envelope
            * (
                Math.random() > .82
                    ? 1
                    : .34
            );
    }

    const noise =
        ctx.createBufferSource();

    const noiseFilter =
        ctx.createBiquadFilter();

    const noiseGain =
        ctx.createGain();

    noise.buffer = buffer;

    noise.playbackRate.value =
        .82 + Math.random() * .42;

    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value =
        1200 + Math.random() * 2100;

    noiseFilter.Q.value = .7;

    noiseGain.gain.setValueAtTime(.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(.12, now + .004);
    noiseGain.gain.exponentialRampToValueAtTime(.0001, now + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
}


/* ==========================================================
   CRASH TEMPORAIRE — LE GRAND SPECTACLE
   ========================================================== */

function triggerCrashSpectacle() {

    if (!crashSpectacle) {
        return;
    }

    crashCount++;

    /*
     * Les déchirures sont différentes à chaque crise.
     */
    if (crashTears) {

        crashTears.innerHTML = "";

        const tearCount =
            9 + Math.floor(Math.random() * 10);

        for (
            let i = 0;
            i < tearCount;
            i++
        ) {

            const tear =
                document.createElement("i");

            const horizontal =
                Math.random() > .25;

            tear.className =
                horizontal
                    ? "crash-tear crash-tear-horizontal"
                    : "crash-tear crash-tear-vertical";

            tear.style.setProperty(
                "--tear-x",
                `${Math.random() * 100}%`
            );

            tear.style.setProperty(
                "--tear-y",
                `${Math.random() * 100}%`
            );

            tear.style.setProperty(
                "--tear-size",
                `${8 + Math.random() * 28}vmin`
            );

            tear.style.setProperty(
                "--tear-shift",
                `${-90 + Math.random() * 180}px`
            );

            tear.style.setProperty(
                "--tear-delay",
                `${Math.random() * .32}s`
            );

            crashTears.appendChild(tear);
        }
    }

    /*
     * Retirer puis remettre la classe force le redémarrage
     * de toutes les animations CSS du crash.
     */
    crashSpectacle.classList.remove("is-crashing");
    trip.classList.remove("crash-hit");

    void crashSpectacle.offsetWidth;

    crashSpectacle.classList.add("is-crashing");
    trip.classList.add("crash-hit");

    window.setTimeout(
        () => {
            crashSpectacle.classList.remove("is-crashing");
            trip.classList.remove("crash-hit");
        },
        1700
    );
}


/* ==========================================================
   CICATRICE PERMANENTE
   Exactement UN nouveau bug par crash.
   Rien n'est supprimé : accumulation volontairement infinie.
   ========================================================== */

function spawnPermanentCorruption() {

    if (!corruptionField) {
        return;
    }

    const bug =
        document.createElement("div");

    const types = [
        "slice",
        "block",
        "deadline",
        "rgb",
        "void",
        "signal"
    ];

    const type =
        types[
            Math.floor(
                Math.random() * types.length
            )
        ];

    bug.className =
        `permanent-bug permanent-bug-${type}`;

    bug.dataset.crash =
        String(crashCount + 1);

    const x =
        Math.random() * 94;

    const y =
        Math.random() * 94;

    const width =
    70 + Math.random() * 420;

const height =
    5 + Math.random() * 120;

    const hue =
        Math.floor(Math.random() * 360);

    const rotation =
        -8 + Math.random() * 16;

    bug.style.setProperty("--bug-x", `${x}vw`);
    bug.style.setProperty("--bug-y", `${y}vh`);
    bug.style.setProperty("--bug-w", `${width}px`);
    bug.style.setProperty("--bug-h", `${height}px`);
    bug.style.setProperty("--bug-hue", `${hue}deg`);
    bug.style.setProperty("--bug-rotate", `${rotation}deg`);
    bug.style.setProperty("--bug-delay", `${-Math.random() * 5}s`);

    if (
        type === "signal"
        || type === "rgb"
    ) {

        const fragments = [
            "SIGNAL LOST",
            "██ / ██",
            "NO INPUT",
            "VN_",
            "ERROR",
            "/////",
            "NULL",
            "00:00:00",
            "???"
        ];

        bug.textContent =
            fragments[
                Math.floor(
                    Math.random() * fragments.length
                )
            ];
    }

    corruptionField.appendChild(bug);
}



/* ==========================================================
   ALERTE ANTI-SPAM
   ========================================================== */

function startWarningTone() {

    if (!crashAudioContext) {
        prepareCrashAudio();
    }

    if (!crashAudioContext || warningOscillator) {
        return;
    }

    const ctx = crashAudioContext;

    if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 1180;

    /*
     * Volontairement bas : désagréable, mais pas assourdissant.
     */
    gain.gain.value = .018;

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();

    warningOscillator = oscillator;
    warningOscillatorGain = gain;
}


function stopWarningTone() {

    if (warningOscillator) {

        try {
            warningOscillator.stop();
        } catch {}

        warningOscillator.disconnect();
        warningOscillator = null;
    }

    if (warningOscillatorGain) {
        warningOscillatorGain.disconnect();
        warningOscillatorGain = null;
    }
}


function playScreamerImpact() {

    if (!crashAudioContext) {
        return;
    }

    const ctx = crashAudioContext;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(240, now);
    oscillator.frequency.exponentialRampToValueAtTime(54, now + .34);

    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(.085, now + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .46);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + .48);
}


function openHurtWarning() {

    if (!hurtWarning || hurtWarningOpen) {
        return;
    }

    hurtWarningOpen = true;
    hurtScreamerRunning = false;

    /*
     * On mémorise l'état de la musique puis on la coupe.
     */
    hurtMusicWasPlaying =
        Boolean(audio && !audio.paused);

    if (audio) {
        audio.pause();
    }

    /*
     * Le popup est au-dessus de tout et bloque les interactions.
     */
    hurtWarning.classList.add("is-open");
    hurtWarning.classList.remove("is-screaming");
    hurtWarning.setAttribute("aria-hidden", "false");

    document.documentElement.classList.add("hurt-warning-active");

    startWarningTone();

    hurtSorryButton?.focus({
        preventScroll: true
    });
}


async function closeHurtWarning({
    resumeMusic = true
} = {}) {

    if (!hurtWarning) {
        return;
    }

    stopWarningTone();

    hurtWarning.classList.remove(
        "is-open",
        "is-screaming"
    );

    hurtWarning.setAttribute("aria-hidden", "true");

    document.documentElement.classList.remove("hurt-warning-active");

    hurtWarningOpen = false;
    hurtScreamerRunning = false;

    spamClickTimes.length = 0;

    if (
        resumeMusic &&
        hurtMusicWasPlaying &&
        audio
    ) {
        try {
            await audio.play();
        } catch {}
    }

    hurtMusicWasPlaying = false;
}


function triggerHurtScreamer() {

    if (
        !hurtWarning ||
        hurtScreamerRunning
    ) {
        return;
    }

    /*
     * À partir d'ici, la page est condamnée jusqu'au refresh.
     * Aucun timeout, aucun retour à l'accueil, aucune reprise audio.
     */
    hurtScreamerRunning = true;

    stopWarningTone();

    if (audio) {
        audio.pause();
    }

    playScreamerImpact();

    hurtWarning.classList.add("is-screaming");

    document.documentElement.classList.add(
        "hurt-terminal-lock"
    );

    /*
     * On neutralise les contrôles de l'overlay.
     * Le seul moyen de sortir est désormais de recharger la page.
     */
    hurtSorryButton?.setAttribute(
        "disabled",
        ""
    );

    hurtNoButton?.setAttribute(
        "disabled",
        ""
    );
}


hurtSorryButton?.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        closeHurtWarning({
            resumeMusic: true
        });
    }
);


hurtNoButton?.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        triggerHurtScreamer();
    }
);


document.addEventListener(
    "keydown",
    event => {

        if (!hurtWarningOpen) {
            return;
        }

        /*
         * Pas d'Escape : l'utilisateur doit répondre.
         */
        if (event.key === "Escape") {
            event.preventDefault();
        }
    }
);


/* ==========================================================
   UNE CRISE = son + spectacle + cicatrice
   ========================================================== */

function triggerFullCrash() {

    playCrashSound();
    triggerCrashSpectacle();
    spawnPermanentCorruption();
}

let clickCrashLocked = false;

document.addEventListener("click", event => {

    if (!started) {
        return;
    }

    /*
     * Pendant l'avertissement, aucun clic ne doit alimenter
     * le système de crash derrière le popup.
     */
    if (hurtWarningOpen) {
        return;
    }

    if (
        event.target.closest("[data-home-play]")
    ) {
        return;
    }

    /*
     * Chaque clic continue à abîmer l'écran.
     */
    spawnPermanentCorruption();


    /* ------------------------------------------------------
       DÉTECTION DU SPAM

       7 clics dans une fenêtre de 1,4 seconde.
       ------------------------------------------------------ */

    const now = performance.now();

    spamClickTimes.push(now);

    while (
        spamClickTimes.length &&
        now - spamClickTimes[0] > spamClickWindow
    ) {
        spamClickTimes.shift();
    }

    if (
        spamClickTimes.length >= spamClickThreshold
    ) {

        /*
         * Le clic qui franchit le seuil ouvre immédiatement
         * l'avertissement. Pas de nouveau flash derrière.
         */
        openHurtWarning();

        spamClickTimes.length = 0;

        return;
    }


    /*
     * Le gros spectacle a son mini cooldown,
     * mais chaque clic a déjà laissé sa cicatrice.
     */
    if (clickCrashLocked) {
        return;
    }

    clickCrashLocked = true;

    playCrashSound();
    triggerCrashSpectacle();

    window.setTimeout(() => {
        clickCrashLocked = false;
    }, 180);

});

function unlockSentenceGhost() {

    if (
        activeSentenceGhosts >= sentenceGhostMax
    ) {
        return;
    }

    activeSentenceGhosts++;

    document
        .querySelectorAll(
            `.sentence-ghost-${activeSentenceGhosts}`
        )
        .forEach(ghost => {

            ghost.classList.add("ghost-awaken");

            window.setTimeout(() => {
                ghost.classList.remove("ghost-awaken");
            }, 500);

        });
}

function updateSentenceGhostCrash() {

    if (!started || !crashClock) {
        return;
    }

    const crashAnimation =
        crashClock.getAnimations()[0];

    if (!crashAnimation) {
        return;
    }

    const currentTime =
        Number(crashAnimation.currentTime);

    if (!Number.isFinite(currentTime)) {
        return;
    }

    /*
     * Le crash CSS commence à 84 % du cycle de 10 secondes.
     * On utilise la vraie position temporelle de CETTE animation CSS,
     * donc le fantôme apparaît sur le crash, sans deuxième horloge JS.
     */
    const phase =
        ((currentTime % 10000) + 10000) % 10000;

    const crashIsActive =
        phase >= 8400 && phase < 10000;

    if (crashIsActive && !crashWasActive) {
        unlockSentenceGhost();
        triggerFullCrash();
    }

    crashWasActive = crashIsActive;
}

    const sentenceSpeed = 125;
    const sentenceWordGap = 30;

    let nextSentenceTurn = 0;
    let sentenceAngle = 0;
    let sentenceTargetAngle = 0;


    function createSentence() {

        if (!sentence || !sentenceElements.length) return;

        const stageWidth = trip.clientWidth;
        const stageHeight = trip.clientHeight;

        const startX = stageWidth * .20;
        const startY = stageHeight * .28;

        sentenceAngle = Math.random() * Math.PI * 2;
        sentenceTargetAngle = sentenceAngle;
        nextSentenceTurn = performance.now() + random(1800, 3500);

        sentenceParts = sentenceElements.map((element, index) => {

            /*
             * IMPORTANT : on mesure la largeur naturelle du mot.
             * Les mots cachés restent en visibility:hidden et non
             * display:none, donc leur largeur reste mesurable.
             */
            const rect = element.getBoundingClientRect();

            return {
                element,
                width: rect.width,
                height: rect.height,
                x: startX,
                y: startY,
                phase: Math.random() * Math.PI * 2,
                index,
                followDistance: 0,
                visible: index === 0
            };
        });

        /*
         * Chaque mot suit le précédent selon la distance entre
         * leurs CENTRES : moitié du mot précédent + espace +
         * moitié du mot actuel. Aucun empilement artificiel.
         */
        let accumulatedDistance = 0;

        sentenceParts.forEach((part, index) => {

            if (index === 0) {
                part.followDistance = 0;
                part.element.classList.remove("sentence-hidden");
                return;
            }

            const previous = sentenceParts[index - 1];

            accumulatedDistance +=
                previous.width / 2
                + sentenceWordGap
                + part.width / 2;

            part.followDistance = accumulatedDistance;
            part.element.classList.add("sentence-hidden");
        });

        sentenceParts[0].vx =
            Math.cos(sentenceAngle) * sentenceSpeed;

        sentenceParts[0].vy =
            Math.sin(sentenceAngle) * sentenceSpeed;

        /*
         * Une seule origine. L'historique n'est PAS tronqué :
         * la phrase n'est créée qu'une fois et représente quelques
         * milliers de points au maximum, ce qui évite surtout de
         * perdre la queue de la chenille.
         */
        sentenceHistory = [{
            x: startX,
            y: startY,
            angle: sentenceAngle,
            distance: 0
        }];
    }

    /* ==========================================================
   CRÉATION DES FANTÔMES
   ========================================================== */

function createSentenceGhosts() {

    if (
        !sentence ||
        !sentenceElements.length
    ) {
        return;
    }


    /*
     * Si la fonction est rappelée après un resize,
     * on supprime les anciens fantômes.
     */

    sentence
        .querySelectorAll(".sentence-ghost")
        .forEach(
            ghost => ghost.remove()
        );


    sentenceGhosts = [];


    sentenceElements.forEach(
        (element, index) => {

            const ghosts = [];


            /*
             * Trois copies du même mot.
             */

            for (
    let level = 1;
    level <= sentenceGhostMax;
    level++
) {

                const ghost =
                    document.createElement("span");


                ghost.className =
                    `sentence-ghost sentence-ghost-${level}`;


                ghost.textContent =
                    element.textContent;


                ghost.setAttribute(
                    "aria-hidden",
                    "true"
                );


                sentence.appendChild(
                    ghost
                );


                ghosts.push({

                    element:
                        ghost,

                    level

                });

            }


            sentenceGhosts.push({

                source:
                    element,

                index,

                ghosts,

                /*
                 * Historique VISUEL uniquement.

                 * Aucun rapport avec sentenceHistory
                 * qui contrôle la vraie chenille.
                 */

                history: []

            });

        }
    );

}

/* ==========================================================
   ANIMATION DES FANTÔMES

   IMPORTANT :
   on LIT simplement le transform du vrai mot.

   On ne modifie jamais :
   - x
   - y
   - sentenceHistory
   - followDistance
   - sentenceAngle
   - les collisions
   ========================================================== */

function animateSentenceGhosts() {

    if (!started) {

        sentenceGhostFrame =
            requestAnimationFrame(
                animateSentenceGhosts
            );

        return;

    }


    updateSentenceGhostCrash();

    sentenceGhosts.forEach(
        group => {

            const source =
                group.source;


            /*
             * Le mot véritable n'est pas encore né.
             */

            const hidden =
                source.classList.contains(
                    "sentence-hidden"
                );


            if (hidden) {

                group.ghosts.forEach(
                    ghost => {

                        ghost.element.classList.add(
                            "ghost-hidden"
                        );

                    }
                );


                /*
                 * On vide aussi sa mémoire afin qu'il
                 * ne laisse pas une vieille traînée
                 * lorsqu'il naîtra.
                 */

                group.history.length = 0;

                return;

            }


            /*
             * Le transform a déjà été calculé
             * par animateSentence().
             *
             * Nous ne faisons que le photographier.
             */

            const currentTransform =
                source.style.transform;


            if (!currentTransform) {
                return;
            }


            group.history.unshift(
                currentTransform
            );


            if (
                group.history.length >
                sentenceGhostHistoryLength
            ) {

                group.history.pop();

            }


            /*
             * Retards différents.
             *
             * Ghost 1 = récent
             * Ghost 2 = plus ancien
             * Ghost 3 = encore plus ancien
             */

            const delays = [
    4,
    10,
    18,
    27,
    38,
    50,
    64,
    80
];


            group.ghosts.forEach(
                (ghost, ghostIndex) => {

                    const historyIndex =
                        delays[ghostIndex];

                        /*
 * Ce fantôme n'a pas encore été
 * débloqué par un crash.
 */

if (
    ghostIndex >= activeSentenceGhosts
) {

    ghost.element.classList.add(
        "ghost-hidden"
    );

    return;
}


                    const oldTransform =
                        group.history[
                            historyIndex
                        ];


                    /*
                     * Pas encore suffisamment
                     * d'historique.
                     */

                    if (!oldTransform) {

                        ghost.element.classList.add(
                            "ghost-hidden"
                        );

                        return;

                    }


                    ghost.element.classList.remove(
                        "ghost-hidden"
                    );


                    ghost.element.style.transform =
                        oldTransform;

                }
            );

        }
    );


    sentenceGhostFrame =
        requestAnimationFrame(
            animateSentenceGhosts
        );

}


    function findSentencePoint(distance) {

        /*
         * sentenceHistory est stocké du plus récent au plus ancien.
         * On cherche les deux points qui encadrent la distance voulue
         * et on interpole entre eux. Cela évite les sauts et surtout
         * les mots qui se retrouvent tous au même point de secours.
         */
        for (let i = 0; i < sentenceHistory.length - 1; i++) {

            const newer = sentenceHistory[i];
            const older = sentenceHistory[i + 1];

            if (
                newer.distance >= distance
                && older.distance <= distance
            ) {

                const span = newer.distance - older.distance;
                const ratio = span > 0
                    ? (distance - older.distance) / span
                    : 0;

                return {
                    x: older.x + (newer.x - older.x) * ratio,
                    y: older.y + (newer.y - older.y) * ratio,
                    angle: older.angle + (newer.angle - older.angle) * ratio
                };
            }
        }

        return null;
    }


    function animateSentence(time) {

        if (!started || !sentenceParts.length) {
            sentenceAnimation = requestAnimationFrame(animateSentence);
            return;
        }

        if (!sentenceLastTime) sentenceLastTime = time;

        const delta = Math.min(
            (time - sentenceLastTime) / 1000,
            .035
        );

        sentenceLastTime = time;

        const stageWidth = trip.clientWidth;
        const stageHeight = trip.clientHeight;
        const head = sentenceParts[0];


        /* ------------------------------------------------------
           VIRAGES : rares et progressifs
           ------------------------------------------------------ */

        if (time >= nextSentenceTurn) {

            sentenceTargetAngle =
                sentenceAngle
                + random(-Math.PI * .30, Math.PI * .30);

            nextSentenceTurn =
                time + random(1800, 3800);
        }

        let angleDifference =
            sentenceTargetAngle - sentenceAngle;

        angleDifference = Math.atan2(
            Math.sin(angleDifference),
            Math.cos(angleDifference)
        );

        sentenceAngle +=
            angleDifference * Math.min(1, delta * 1.8);


        /* ------------------------------------------------------
           VITESSE
           ------------------------------------------------------ */

        const breathingSpeed =
            sentenceSpeed
            + Math.sin(time * .0013) * 15;

        head.vx = Math.cos(sentenceAngle) * breathingSpeed;
        head.vy = Math.sin(sentenceAngle) * breathingSpeed;

        head.x += head.vx * delta;
        head.y += head.vy * delta;


        /* ------------------------------------------------------
           REBONDS PROPRES
           ------------------------------------------------------ */

        let bounced = false;

        if (head.x <= 0) {
            head.x = 0;
            sentenceAngle = Math.PI - sentenceAngle;
            bounced = true;
        }
        else if (head.x + head.width >= stageWidth) {
            head.x = stageWidth - head.width;
            sentenceAngle = Math.PI - sentenceAngle;
            bounced = true;
        }

        if (head.y <= 0) {
            head.y = 0;
            sentenceAngle = -sentenceAngle;
            bounced = true;
        }
        else if (head.y + head.height >= stageHeight) {
            head.y = stageHeight - head.height;
            sentenceAngle = -sentenceAngle;
            bounced = true;
        }

        if (bounced) {
            sentenceTargetAngle = sentenceAngle;
            nextSentenceTurn = time + random(1400, 2600);
        }


        /* ------------------------------------------------------
           HISTORIQUE DE DISTANCE
           ------------------------------------------------------ */

        const previousPoint = sentenceHistory[0];

        const travelledDistance = previousPoint
            ? Math.hypot(
                head.x - previousPoint.x,
                head.y - previousPoint.y
            )
            : 0;

        const totalDistance = previousPoint
            ? previousPoint.distance + travelledDistance
            : 0;

        sentenceHistory.unshift({
            x: head.x,
            y: head.y,
            angle: sentenceAngle,
            distance: totalDistance
        });


        /* ------------------------------------------------------
           POSITION DE CHAQUE SEGMENT
           ------------------------------------------------------ */

        sentenceParts.forEach((part, index) => {

            const desiredDistance =
                totalDistance - part.followDistance;

            /*
             * Le mot n'est pas encore né : il attend simplement
             * que la tête ait parcouru assez de chemin.
             */
            if (desiredDistance < 0) {

                if (!part.visible) {
                    part.element.classList.add("sentence-hidden");
                }

                return;
            }

            const target = findSentencePoint(desiredDistance);

            /*
             * Si le point n'existe pas encore, on attend.
             * Surtout : aucun fallback vers (0,0) ou vers le plus
             * vieux point, donc aucun paquet de mots dans un coin.
             */
            if (!target) return;

            if (!part.visible) {

                part.visible = true;
                part.element.classList.remove("sentence-hidden");
                part.element.classList.add("sentence-born");

                window.setTimeout(() => {
                    part.element.classList.remove("sentence-born");
                }, 260);
            }

            const wave = Math.sin(
                time * .0045
                + index * .72
                + part.phase
            );

            const wave2 = Math.cos(
                time * .0035
                + index * .4
            );

            const perpendicularAngle =
                target.angle + Math.PI / 2;

            const waveAmount = wave * 5;

            const offsetX =
                Math.cos(perpendicularAngle) * waveAmount;

            const offsetY =
                Math.sin(perpendicularAngle) * waveAmount;

            const stretch =
                1 + Math.abs(wave) * .12;

            const squash =
                1 - Math.abs(wave) * .07;

            const skew = wave * 7;

            const rotation =
                Math.sin(target.angle) * 12
                + wave2 * 3;

            part.element.style.transform = `
                translate3d(
                    ${target.x + offsetX}px,
                    ${target.y + offsetY}px,
                    0
                )
                rotate(${rotation}deg)
                skewX(${skew}deg)
                scale(${stretch}, ${squash})
            `;
        });

        sentenceAnimation =
            requestAnimationFrame(animateSentence);
    }

    /* ======================================================
       ANIMATION
       ====================================================== */

    function animateWords(time) {

        if (!started) {
            return;
        }


        if (!lastTime) {
            lastTime = time;
        }


        /*
         * On limite delta pour éviter qu'un mot
         * traverse l'écran si l'onglet a été inactif.
         */

        const delta =
            Math.min(
                (time - lastTime) / 1000,
                0.035
            );


        lastTime = time;


        const stageWidth =
            trip.clientWidth;

        const stageHeight =
            trip.clientHeight;


        words.forEach((word) => {

            word.x +=
                word.vx * delta;

            word.y +=
                word.vy * delta;


            word.rotation +=
                word.rotationSpeed
                * delta;


            /* ==============================================
               COLLISION GAUCHE / DROITE
               ============================================== */

            if (word.x <= 0) {

                word.x = 0;

                word.vx =
                    Math.abs(word.vx);

            }


            if (
                word.x + word.width
                >= stageWidth
            ) {

                word.x =
                    stageWidth
                    - word.width;

                word.vx =
                    -Math.abs(word.vx);

            }


            /* ==============================================
               COLLISION HAUT / BAS
               ============================================== */

            if (word.y <= 0) {

                word.y = 0;

                word.vy =
                    Math.abs(word.vy);

            }


            if (
                word.y + word.height
                >= stageHeight
            ) {

                word.y =
                    stageHeight
                    - word.height;

                word.vy =
                    -Math.abs(word.vy);

            }


            /* ==============================================
               AFFICHAGE
               ============================================== */

            word.element.style.transform =
                `
                    translate3d(
                        ${word.x}px,
                        ${word.y}px,
                        0
                    )
                    rotate(
                        ${word.rotation}deg
                    )
                `;

        });


        animationFrame =
            requestAnimationFrame(
                animateWords
            );

    }


    /* ======================================================
       PLAY
       ====================================================== */

    playButton.addEventListener(
        "click",
        async () => {

            /*
             * Autorise le futur son des crashs depuis ce geste utilisateur.
             */
            prepareCrashAudio();

            if (
                crashAudioContext &&
                crashAudioContext.state === "suspended"
            ) {
                crashAudioContext.resume().catch(() => {});
            }


            /*
             * IMPORTANT :
             *
             * audio.play() est directement appelé
             * depuis le clic.
             *
             * Donc le navigateur autorise le son.
             */

            if (audio) {

                try {

                    await audio.play();

                }

                catch (error) {

                    console.warn(
                        "La musique n'a pas pu démarrer.",
                        error
                    );

                }

            }


            /*
             * On révèle la scène.
             */

            gate.classList.add(
                "started"
            );


            trip.classList.add(
                "started"
            );


            trip.setAttribute(
                "aria-hidden",
                "false"
            );


            /*
             * On attend que la scène soit visible
             * pour mesurer correctement les mots.
             */

            requestAnimationFrame(() => {

                activeSentenceGhosts = 0;
                crashWasActive = false;

                createWords();
                createSentence();
                createSentenceGhosts();

started = true;

lastTime = 0;
sentenceLastTime = 0;

animationFrame =
    requestAnimationFrame(
        animateWords
    );

sentenceAnimation =
    requestAnimationFrame(
        animateSentence
    );

sentenceGhostFrame =
    requestAnimationFrame(
        animateSentenceGhosts
    );

            });

        },
        {
            once: true
        }
    );


    /* ======================================================
       REDIMENSIONNEMENT
       ====================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (!started) {
                return;
            }


            createWords();
            createSentence();

        }
    );

});