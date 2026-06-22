import { UserService } from '../../js/services/user-service.js';
import { NavStorage } from '../../js/core/nav-storage.js';

import { AlertRender } from '../../js/components/ui/alert-render.js';

import { BaseModalComponent } from '../../js/components/base/base-modal-component.js';

import { Events } from '../../js/core/events.js';
import { ROUTES } from '../../js/core/constants.js';

export class SmsCodeModal extends BaseModalComponent {
    constructor(code) {
        super();

        this.code = code;
    }

    render() {
        return `
            <div class="modal fade" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                SMS Simulado
                            </h5>
                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                            ></button>
                        </div>
                        <div class="modal-body text-center">
                            <p class="mb-3">Exemplo de aplicativo de SMS</p>
                            <div  class="display-5 fw-bold text-primary aq-not-copy">${this.code}</div>
                        </div>
                        <div class="modal-footer">
                            <button
                                type="button"
                                class="btn aq-btn-primary"
                                data-bs-dismiss="modal"
                            >Fechar</button>
                        </div>
                    </div>
                </div>
            </div>
        `.trim();
    }
}

export class PhoneValidationPage {
    constructor() {
        this.user = null;

        this.generatedCode = null;

        this.timerId = null;
        this.remainingSeconds = 30;

        this.alertRender = null;
        this.smsModal = null;

        this.elements = {};
        this.listeners = [];

        this.initialize();
    }

    /**
    * Orchestrates the lifecycle initialization sequence of the page.
    *
    * @returns {void} 
    */
    initialize() {
        this.alertRender = new AlertRender('#alert-container');

        const context = NavStorage.get('phone-validation-page');

        if (!context?.userId) {
            this.showError('Não foi possível iniciar a validação.');

            window.location.href = ROUTES['register'];

            return;
        }

        this.user = UserService.getById(context.userId);

        if (!this.user) {
            this.showError('Usuário não encontrado.');

            window.location.href = ROUTES['register'];

            return;
        }

        this.captureElements();

        this.renderInitialState();

        this.registerEvents();
    }

    /**
    * Caches required DOM element references for the phone validation interface.
    *
    * @returns {void}
    */
    captureElements() {
        this.elements.content = document.getElementById('validation-content');

        this.elements.maskedPhone = document.getElementById('masked-phone');

        this.elements.sendCodeButton = document.getElementById('send-code-button');
    }

    /**
    * Attaches interaction event listeners to the component's root element.
    *
    * @returns {void}
    */
    registerEvents() {
        const sendHandler = this.handleSendCode.bind(this);

        Events.on(this.elements.sendCodeButton, "click", sendHandler);

        this.listeners.push({
            element: this.elements.sendCodeButton,
            event: 'click',
            handler: sendHandler
        });
    }

    renderInitialState() {
        this.elements.maskedPhone.textContent = this.maskPhone(this.user.phone);
    }

    /**
     * Obfuscates the phone number string, leaving only the last four digits visible.
     *
     * @param {string|number} phone - The raw phone number to be masked.
     * @returns {string} The formatted and masked phone string pattern.
     */
    maskPhone(phone) {
        const digits = String(phone).replace(/\D/g, '');

        const suffix = digits.slice(-4);

        return `(**) *****-${suffix}`;
    }

    /**
     * Requests a new phone verification token from the service layer and returns it.
     *
     * @returns {string|null} The generated verification token code, or null if the request fails.
     */
    generateCode() {

        const data = UserService.requestPhoneVerification(this.user.id);
        if (!data.success) {
            this.alertRender.danger("Erro ao gerar o código de validação", data.error, 2000);
        }
        return data.code;
    }

    /**
     * Dispatches the dispatch logic payload to trigger and send the verification SMS token.
     *
     * @returns {void}
     */
    handleSendCode() {
        this.generatedCode = this.generateCode();

        this.openSmsModal();

        this.renderValidationMode();
    }

    /**
     * Instantiates and reveals the native Bootstrap modal dialog containing the SMS token form.
     *
     * @returns {void}
     */
    openSmsModal() {
        if (this.smsModal) {
            this.smsModal.destroy();
        }

        this.smsModal =
            new SmsCodeModal(
                this.generatedCode
            );

        const ele = this.smsModal.mount(document.body);

        this.smsModal.open();

        const hiddenHandler = () => {
            this.smsModal.onModalHidden();
        };

    }

    /**
     * Toggles the interface layout mode to transition to the code entry validation stage.
     *
     * @returns {void}
     */
    renderValidationMode() {
        const container =
            this.elements.content;

        while (container.firstChild) {
            container.removeChild(
                container.firstChild
            );
        }

        const description = document.createElement('p');

        description.className = 'text-center mb-3';

        description.textContent = 'Digite o código recebido.';

        container.appendChild(
            description
        );

        const input = document.createElement('input');

        input.type = 'text';

        input.id = 'code-input';

        input.className = 'form-control mb-2';

        container.appendChild(input);

        const feedback = document.createElement('div');

        feedback.className = 'invalid-feedback';

        feedback.dataset.errorFor = 'code';

        container.appendChild(feedback);

        const validateButton = document.createElement('button');

        validateButton.type = 'button';

        validateButton.id = 'validate-code-button';

        validateButton.className = 'btn aq-btn-primary w-100 mt-3';

        validateButton.textContent = 'Validar';

        container.appendChild(validateButton);

        const resendButton = document.createElement('button');

        resendButton.type = 'button';

        resendButton.id = 'resend-code-button';

        resendButton.className = 'btn btn-link aq-text-primary w-100 mt-3';

        resendButton.disabled = true;

        container.appendChild(resendButton);

        this.elements.codeInput = input;

        this.elements.codeError = feedback;

        this.elements.validateButton = validateButton;

        this.elements.resendButton = resendButton;

        const validateHandler = this.handleValidate.bind(this);

        const resendHandler = this.handleResend.bind(this);

        Events.on(validateButton, "click", validateHandler);

        Events.on(resendButton, "click", resendHandler);

        Events.on(input, "past", (event) => {
            event.preventDefault();
            this.alertRender.warning('Não é permitido colar informações neste campo.')
        });

        this.listeners.push({
            element: input,
            event: 'past',
            handler: (event) => {
                event.preventDefault();
                this.alertRender.warning('Não é permitido colar informações neste campo.')
            }
        });

        this.listeners.push({
            element: validateButton,
            event: 'click',
            handler: validateHandler
        });

        this.listeners.push({
            element: resendButton,
            event: 'click',
            handler: resendHandler
        });

        this.startResendCountdown();
    }

    /**
     * Initiates the numerical countdown ticker interval for SMS code retransmission.
     *
     * @returns {void}
     */
    startResendCountdown() {
        this.remainingSeconds = 30;

        this.updateResendButton();

        if (this.timerId) {
            clearInterval(this.timerId);
        }

        this.timerId = setInterval(() => {
            this.remainingSeconds--;

            this.updateResendButton();

            if (this.remainingSeconds <= 0) {
                clearInterval(
                    this.timerId
                );

                this.timerId = null;

                this.elements.resendButton.disabled = false;

                this.elements.resendButton.textContent = 'Reenviar código';
            }
        }, 1000);
    }

    /**
     * Updates the resend button label text with the active remaining countdown seconds.
     *
     * @returns {void}
     */
    updateResendButton() {
        this.elements.resendButton.textContent = `Reenviar código em ${this.remainingSeconds}s`;
    }

    /**
    * Regenerates the SMS token, opens the delivery notification, and triggers the retry countdown.
    *
    * @returns {void}
    */
    handleResend() {
        this.generatedCode = this.generateCode();

        this.openSmsModal();

        this.elements.resendButton.disabled = true;

        this.startResendCountdown();
    }

    /**
     * Validate the submitted SMS code.
     *
     * @returns {void}
     */
    handleValidate() {
        const value = this.elements.codeInput.value.trim();

        this.clearCodeError();

        if (value !== this.generatedCode) {
            this.showCodeError('Código inválido.');

            this.showError('Não foi possível validar o código informado.');

            return;
        }

        const result =
            UserService.confirmPhoneVerification(this.user.id, value);

        if (!result?.success) {
            this.showError('Não foi possível validar o telefone.');

            return;
        }

        this.alertRender.success('Telefone validado com sucesso.');

        NavStorage.set(
            'identity-validation-page',
            {
                userId: this.user.id
            }
        );

        setTimeout(() => {
            window.location.href = ROUTES['identity-validation'];
        }, 1000);
    }

    /**
     * Applies validation error styles and displays a custom error message for the SMS code input.
     *
     * @param {string} message - The validation error message text to display.
     * @returns {void}
     */
    showCodeError(message) {
        this.elements.codeInput.classList.add('is-invalid');

        this.elements.codeError.textContent = message;
    }

    /**
     * Clears validation error styles and messages from the SMS code input field.
     *
     * @returns {void}
     */
    clearCodeError() {
        if (!this.elements.codeInput) {
            return;
        }

        this.elements.codeInput.classList.remove(
            'is-invalid'
        );

        this.elements.codeError.textContent =
            '';
    }

    showError(message) {
        this.alertRender.danger(message);
    }

    /**
     * Releases page resources
     */
    destroy() {
        this.listeners.forEach(listener => {
            Events.off(listener.element, listener.event, listener.handler);
        });

        this.listeners = [];

        if (this.timerId) {
            clearInterval(this.timerId);
        }

        if (this.smsModal) {
            this.smsModal.destroy();
        }
    }
}

document.addEventListener(
    'DOMContentLoaded',
    () => {
        new PhoneValidationPage();
    }
);

// I implemented a lifecycle invalidation for the BFCache (Back-Forward Cache)
// feature of mobile browsers, ensuring data reactivity in history rollback events.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});