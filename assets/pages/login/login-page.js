import { AlertRender } from '../../js/components/ui/alert-render.js';

import AuthService from '../../js/services/auth-service.js';
import { TextValidator } from '../../js/validation/text.js';

/**
 * Login page controller.
 *
 * Responsible for:
 * - Capturing form data
 * - Validating inputs
 * - Authenticating users
 * - Displaying validation errors
 * - Redirecting authenticated users
 */
export class LoginPage {
    /**
     * Creates a LoginPage instance.
     */
    constructor() {
        this.alert = null;

        this.emailInput = null;
        this.passwordInput = null;
        this.loginButton = null;

        this.forgotPasswordLink = null;

        this.listeners = [];

        this.initialize();
    }

    /**
     * Initializes page resources.
     */
    initialize() {
        this.captureElements();
        this.createAlert();
        this.registerEvents();
    }

    /**
     * Captures DOM elements.
     */
    captureElements() {
        this.emailInput =
            document.getElementById('email');

        this.passwordInput =
            document.getElementById('password');

        this.loginButton =
            document.getElementById('login-button');

        this.forgotPasswordLink =
            document.getElementById('forgot-password-link');
    }

    /**
     * Creates alert renderer.
     */
    createAlert() {
        this.alert = new AlertRender('#alert-container');
    }

    /**
     * Registers page events.
     */
    registerEvents() {
        const loginHandler =
            this.handleLogin.bind(this);

        const enterHandler =
            this.handlePasswordKeyDown.bind(this);

        const forgotPasswordHandler =
            this.handleForgotPassword.bind(this);

        this.loginButton.addEventListener(
            'click',
            loginHandler
        );

        this.passwordInput.addEventListener(
            'keydown',
            enterHandler
        );

        this.forgotPasswordLink.addEventListener(
            'click',
            forgotPasswordHandler
        );

        this.listeners.push([
            this.loginButton,
            'click',
            loginHandler
        ]);

        this.listeners.push([
            this.passwordInput,
            'keydown',
            enterHandler
        ]);

        this.listeners.push([
            this.forgotPasswordLink,
            'click',
            forgotPasswordHandler
        ]);
    }

    /**
     * Handles Enter key on password field.
     *
     * @param {KeyboardEvent} event Keyboard event.
     */
    handlePasswordKeyDown(event) {
        if (event.key !== 'Enter') {
            return;
        }

        event.preventDefault();

        this.handleLogin();
    }

    /**
     * Handles forgot password click.
     *
     * @param {MouseEvent} event Mouse event.
     */
    handleForgotPassword(event) {
        event.preventDefault();
        
        this.alert.info(
            'Em breve',
            'Funcionalidade disponível em breve.',
            4000
        );
    }

    /**
     * Handles login flow.
     */
    async handleLogin() {
        this.clearValidationErrors();

        const email = this.emailInput.value.trim();

        const password = this.passwordInput.value;


        const validation =
            this.validate(email, password);

        if (!validation.valid) {
            validation.firstInvalidField?.focus();
            return;
        }
        const result =
        await AuthService.login(email, password);
        
        if (!result?.success) {
            this.passwordInput.value = '';
            this.passwordInput.focus();

            this.alert.danger(
                'Erro',
                result?.error ??
                'Email ou senha inválidos.',
                5000
            );

            return;
        }
        this.destroy();
        window.location.href =
            '../dashboard/dashboard.html';
    }

    /**
     * Validates login fields.
     *
     * @param {string} email User email.
     * @param {string} password User password.
     *
     * @returns {{
     *  valid:boolean,
     *  firstInvalidField:HTMLElement|null
     * }}
     */
    validate(email, password) {
        let firstInvalidField = null;
        const emailErrMsg = {
          "REQUIRED": "É obrigatório inserir um E-mail válido",
          "INVALID_TYPE": "O campo email recebe apenas texto!",
          "MAX_LENGTH": "Este E-mail é invalido",
          "INVALID_FORMAT":
            'Insira um email válido. Exemplo de E-mail válido: "exemplo@exemplo.com"',
        };

        const resultEmailValidation = TextValidator.validateEmail(email);
         if (!resultEmailValidation.valid) {
            this.showFieldError(
                this.emailInput,
                emailErrMsg[resultEmailValidation.error]
            );

            firstInvalidField =
                firstInvalidField ||
                this.emailInput;
        }

        if (!TextValidator.validateRequired(password).valid) {
            this.showFieldError(
                this.passwordInput,
                'Senha é obrigatória.'
            );

            firstInvalidField =
                firstInvalidField ||
                this.passwordInput;
        }

        return {
            valid: !firstInvalidField,
            firstInvalidField
        };
    }

    /**
     * Displays field validation error.
     *
     * @param {HTMLInputElement} field Field element.
     * @param {string} message Error message.
     */
    showFieldError(field, message) {
        field.classList.add('is-invalid');

        const feedback =
            document.querySelector(
                `[data-error-for="${field.id}"]`
            );

        if (feedback) {
            feedback.textContent = message;
        }
    }

    /**
     * Clears all validation errors.
     */
    clearValidationErrors() {
        [
            this.emailInput,
            this.passwordInput
        ].forEach(field => {
            field.classList.remove('is-invalid');
        });

        document
            .querySelectorAll('.invalid-feedback')
            .forEach(element => {
                element.textContent = '';
            });
    }

    /**
     * Releases page resources.
     */
    destroy() {
        this.listeners.forEach(
            ([element, event, handler]) => {
                element.removeEventListener(
                    event,
                    handler
                );
            }
        );

        this.listeners = [];

        this.alert= {}

        this.alert = null;
    }
}

document.addEventListener(
    'DOMContentLoaded',
    () => {
         new LoginPage();
    }
);