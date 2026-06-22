import { AlertRender } from '../../js/components/ui/alert-render.js';
import { Events } from '../../js/core/events.js';
import { UserService } from '../../js/services/user-service.js';
import { NavStorage } from '../../js/core/nav-storage.js';
import { ROUTES } from '../../js/core/constants.js';

export class IdentityValidationPage {
    constructor() {
        this.stream = null;

        this.alertRender = null;

        this.timers = [];

        this.elements = {};

        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);

        this.currentFacingMode = 'user';

        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
        this.boundToggleCamera = this.handleToggleCamera.bind(this);
        this.boundStartCameraTrigger = this.handleStartCameraTrigger.bind(this);

        this.captureElements();
        this.initialize();
    }

    /**
    * Orchestrates the lifecycle initialization sequence of the page.
    *
    * @returns {void}
    */
    initialize() {
        this.prepareUserTrigger();

        this.alertRender = new AlertRender('#alert-container');

        window.addEventListener(
            'beforeunload',
            this.handleBeforeUnload
        );
        window.addEventListener(
            'pagehide',
            this.handleBeforeUnload
        );
    }

    /**
     * Prepares and enables the user action triggers for the validation sequence.
     *
     * @returns {void}
     */
    prepareUserTrigger() {
        this.clearStatus();

        const titleElement = document.createElement('h5');
        titleElement.className = 'aq-h5 text-secondary fw-bold mb-3 text-center';
        titleElement.textContent = 'Instruções para a foto:';
        this.elements.status.appendChild(titleElement);

        const listElement = document.createElement('ul');
        listElement.className = 'list-unstyled d-flex flex-column gap-3 mb-4 small text-muted text-start mx-auto';
        listElement.style.maxWidth = '400px';

        const instructionsData = [
            { icon: 'bi-brightness-high', prefix: 'Procure um ambiente ', bold: 'bem iluminado' },
            { icon: 'bi-eyeglasses', prefix: 'Remova ', bold: 'óculos, boné, máscara', suffix: ' ou adereços.' },
            { icon: 'bi-person-bounding-box', prefix: 'Enquadre o rosto e ', bold: 'olhe fixamente', suffix: ' para a câmera.' },
            { icon: 'bi-hourglass-split', prefix: 'Mantenha o celular firme e ', bold: 'aguarde a captura' }
        ];

        const listFragment = document.createDocumentFragment();

        instructionsData.forEach(data => {
            const listItem = document.createElement('li');
            listItem.className = 'd-flex align-items-center gap-2';

            const iconItem = document.createElement('i');
            iconItem.className = `bi ${data.icon} text-primary fs-5 flex-shrink-0`;
            iconItem.setAttribute('aria-hidden', 'true');
            listItem.appendChild(iconItem);

            const textContainer = document.createElement('span');

            textContainer.appendChild(document.createTextNode(data.prefix));

            const boldElement = document.createElement('strong');
            boldElement.textContent = data.bold;
            textContainer.appendChild(boldElement);

            if (data.suffix) {
                textContainer.appendChild(document.createTextNode(data.suffix));
            }

            listItem.appendChild(textContainer);
            listFragment.appendChild(listItem);
        });


        listElement.appendChild(listFragment);
        this.elements.status.appendChild(listElement);

        const triggerButton = document.createElement('button');
        triggerButton.type = 'button';
        triggerButton.id = 'start-camera-trigger';
        triggerButton.className = 'btn aq-btn-primary px-4 py-2 mx-auto d-block mt-3';
        triggerButton.textContent = 'Ativar Câmera e Iniciar';

        this.elements.status.appendChild(triggerButton);
        this.elements.triggerButton = triggerButton;
        Events.on(triggerButton, 'click', this.boundStartCameraTrigger);
    }

    /**
     * Caches required DOM element references for the validation interface.
     *
     * @returns {void}
     * @private
     */
    captureElements() {
        this.elements.video = document.getElementById('camera-preview');

        this.elements.canvas = document.getElementById('freeze-canvas');

        this.elements.status = document.getElementById('status-area');

        this.elements.validationArea = document.getElementById('validation-area');

        this.elements.fallbackArea = document.getElementById('fallback-area');

        this.elements.fallbackButton = document.getElementById('fallback-button');

        this.elements.toggleCameraButton = document.getElementById('toggle-camera-button');
        this.elements.cardConteiner = document.getElementById('card-conteiner');
    }

    /**
     * Requests media permissions and boots the asynchronous video stream source.
     *
     * @returns {Promise<void>}
     */
    async initializeCamera() {
        this.stopCamera();
        if (this.elements.video) {
            this.elements.video.pause();
            this.elements.video.srcObject = null;
            this.elements.video.onloadedmetadata = null; // Remove ouvinte antigo para evitar concorrência
        }
        try {
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                throw new Error(
                    'Camera API indisponível'
                );
            }

            const permissionStatus = await navigator.permissions.query({ name: 'camera' });

            if (permissionStatus.state === 'denied') {
                this.alertRender.danger('Não foi possível acessar sua câmera', 'Não foi fornecida permisão necessária para o uso');
                this.showFallback();
                return;
            }
            this.stream =
                await navigator.mediaDevices
                    .getUserMedia({
                        video: {
                            facingMode: this.currentFacingMode,
                            width: { ideal: 640 },
                            height: { ideal: 480 }
                        },
                        audio: false
                    });


            this.elements.video.srcObject =
                this.stream;
            this.elements.video.onloadedmetadata = () => {
                this.elements.video.classList.remove("d-none");
                this.elements.toggleCameraButton.classList.remove("d-none");
                this.registerToggleEvent();
                this.elements.video.play().then(() => {
                    this.startValidationFlow();
                })
                    .catch(playError => {
                        this.alertRender.danger('Erro ao reproduzir fluxo de vídeo:', playError);
                    });
                Events.off(this.elements.triggerButton, 'click', this.boundStartCameraTrigger);
            };
        }
        catch (error) {
            this.alertRender.danger('Não foi possível acessar sua câmera.', error.message);
            this.showFallback();
        }
    }

    /**
     * Initiates the identity validation pipeline and handles state transitions.
     *
     * @returns {void}
     */
    startValidationFlow() {
        this.clearAllTimers();
        this.updateMessage(
            'Posicione-se diante da câmera'
        );
        this.elements.cardConteiner.scrollIntoView({ behavior: 'smooth', block: 'end' });
        this.createTimer(
            6000,
            () => {
                this.updateMessage(
                    'Centralize seu rosto'
                );
            }
        );

        this.createTimer(
            7000,
            () => {
                this.updateMessage(
                    'Mantenha-se parado'
                );
            }
        );

        this.createTimer(
            7800,
            () => {
                this.freezeFrame();
            }
        );

        this.createTimer(
            8000,
            () => {
                this.showLoadingState();
                this.elements.cardConteiner.scrollIntoView({ behavior: 'smooth', block: 'end' });
                const data = NavStorage.get("identity-validation-page");
                if (!data.userId) {
                    this.alertRender.danger("Error ao enviar imagem!", "Não foi possível enviar a imagem. Tente novamente mais tarde.")
                    setTimeout(() => this.navigateToLogin(), 4000);
                }
                const result = UserService.verifyIdentity(data.userId);
                if (!result.success) {
                    this.alertRender.danger("Error ao enviar imagem!", "Não foi possível enviar a imagem. Tente novamente mais tarde.")
                    setTimeout(() => this.navigateToLogin(), 4000);
                }
            }
        );

        this.createTimer(
            10000,
            () => {
                this.showSuccessState();
                this.elements.cardConteiner.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        );

        this.createTimer(
            12000,
            () => {
                this.navigateToLogin();
            }
        );
    }

    /**
     * Captures the current video frame and freezes the canvas display.
     *
     * @returns {void}
     */
    freezeFrame() {
        const video = this.elements.video;

        const canvas = this.elements.canvas;

        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth || 640;

        canvas.height = video.videoHeight || 480;

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        video.classList.add('d-none');

        canvas.classList.remove('d-none');

        this.stopCamera();
    }


    /**
    * Clears previous states and appends a visual spinner loader to indicate identity validation.
    *
    * @returns {void}
    */
    showLoadingState() {
        this.clearStatus();

        const wrapper = document.createElement('div');

        wrapper.className = 'd-flex flex-column align-items-center gap-3';

        const spinner = document.createElement('div');

        spinner.className = 'spinner-border text-primary';

        spinner.style.width = '4rem';

        spinner.style.height = '4rem';

        const text = document.createElement('div');

        text.textContent = 'Validando identidade...';

        wrapper.appendChild(spinner);

        wrapper.appendChild(text);

        this.elements.status.appendChild(wrapper);
    }


    /**
     * Clears previous states and renders a successful identity validation success block.
     *
     * @returns {void}
     */
    showSuccessState() {
        this.clearStatus();

        const wrapper = document.createElement('div');

        wrapper.className = 'd-flex flex-column align-items-center gap-3 text-success';

        const icon = document.createElement('i');

        icon.className = 'bi bi-patch-check-fill';

        icon.style.fontSize = '4rem';

        const text = document.createElement('div');

        text.textContent = 'Identidade validada com sucesso';

        wrapper.appendChild(icon);

        wrapper.appendChild(text);

        this.elements.status.appendChild(wrapper);
    }

    updateMessage(message) {
        this.clearStatus();

        const text =
            document.createElement('div');

        text.className =
            'fw-semibold text-center text-primary';

        text.textContent =
            message;

        this.elements.status.appendChild(
            text
        );
    }

    /**
     * Purges all active child nodes and visual containers inside the status placeholder.
     *
     * @returns {void}
     */
    clearStatus() {
        while (this.elements.status.firstChild) {
            this.elements.status.removeChild(
                this.elements.status.firstChild
            );
        }
    }

    /**
     * Clears all active timeout references and resets the timers tracking array.
     *
     * @returns {void}
     */
    clearAllTimers() {
        this.timers.forEach(timer => {
            clearTimeout(timer);
        });

        this.timers = [];
    }

    /**
     * Clears previous states and renders a Fallback message block.
     *
     * @returns {void}
     */
    showFallback() {
        this.stopCamera();

        this.elements.validationArea.classList.add(
            'd-none'
        );

        this.elements.fallbackArea.classList.remove(
            'd-none'
        );

        this.elements.fallbackButton.addEventListener(
            'click',
            () => {
                this.navigateToLogin();
            }
        );
    }

    /**
     * Stops all active video hardware tracks and cuts off the camera stream source safely.
     *
     * @returns {void}
     */
    stopCamera() {
        if (!this.stream) {
            return;
        }
        this.elements.toggleCameraButton.classList.add("d-none");
        this.stream
            .getTracks()
            .forEach(track => {
                track.stop();
            });

        this.stream = null;
    }

    /**
     * Redirects the browser viewport directly to the login authentication route.
     *
     * @returns {void}
     */
    navigateToLogin() {
        this.stopCamera();

        window.location.href = ROUTES['login'];
    }

    /**
     * Instantiates a new timeout tracker and pushes its reference to the active timers array.
     *
     * @param {number} delay - The execution wait window time in milliseconds.
     * @param {Function} callback - The execution logic closure to run after the delay.
     * @returns {void}
     */
    createTimer(delay, callback) {
        const timer =
            setTimeout(
                callback,
                delay
            );

        this.timers.push(timer);
    }

    /**
     * Handles the page teardown tasks immediately before the window unloads.
     *
     * @returns {void}
     */
    handleBeforeUnload() {
        this.stopCamera();
    }

    /**
     * Handles the asynchronous trigger sequence to initialize and boot the camera stream.
     *
     * @param {Event} event - The triggering action or interaction event.
     * @returns {Promise<void>}
     */
    async handleStartCameraTrigger(event) {
        if (event && event.target) {
            event.target.removeEventListener('click', this.boundStartCameraTrigger);
            event.target.remove();
        }
        await this.initializeCamera();
    }

    /**
    * Handles the UI state transition when switching the active camera device.
    *
    * @returns {void}
    */
    handleToggleCamera() {
        this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';

        this.clearAllTimers();
        this.initializeCamera();
    }

    /**
     * Attaches interaction event listeners to the camera toggle controls.
     *
     * @returns {void}
     */
    registerToggleEvent() {
        if (this.elements.toggleCameraButton) {
            this.elements.toggleCameraButton.removeEventListener('click', this.boundToggleCamera);
            this.elements.toggleCameraButton.addEventListener('click', this.boundToggleCamera);
        }
    }

    /**
     * Releases page resources
     */
    destroy() {
        this.stopCamera();

        this.clearAllTimers();

        window.removeEventListener(
            'beforeunload',
            this.handleBeforeUnload
        );

        window.removeEventListener(
            'pagehide',
            this.handleBeforeUnload
        );

        Events.off(this.elements.toggleCameraButton, 'click', this.boundToggleCamera);
        Events.off(this.elements.fallbackButton, 'click', () => {
            this.navigateToLogin();
        });
        Events.off(this.elements.toggleCameraButton, 'click', this.boundToggleCamera);
    }
}

document.addEventListener(
    'DOMContentLoaded',
    () => {
        new IdentityValidationPage();
    }
);

// I implemented a lifecycle invalidation for the BFCache (Back-Forward Cache)
// feature of mobile browsers, ensuring data reactivity in history rollback events.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});