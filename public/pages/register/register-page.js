import AuthService from '../../js/services/auth-service.js';
import { UserService } from '../../js/services/user-service.js';
import { LocationService } from '../../js/services/location-service.js';

import { NavStorage } from '../../js/core/nav-storage.js';

import { AlertRender } from '../../js/components/ui/alert-render.js';

import { TextValidator } from '../../js/validation/text.js';
import { CPFValidator } from '../../js/validation/cpf.js';
import { CNPJValidator } from '../../js/validation/cnpj.js';
import { PhoneValidator } from '../../js/validation/phone.js';
import { LocationValidator } from '../../js/validation/location.js';
import { ROUTES } from '../../js/core/constants.js';

export class RegisterPage {
  constructor() {
    this.alertRender = null;

    this.elements = {};

    this.locationData = null;

    this.boundSave = this.handleSave.bind(this);
    this.boundLogin = this.handleLogin.bind(this);
    this.boundCpfCnpjBlur = this.handleCpfCnpjBlur.bind(this);
    this.boundPhoneBlur = this.handlePhoneBlur.bind(this);
    this.boundEmailBlur = this.handleEmailBlur.bind(this);
    this.boundStateChange = this.handleStateChange.bind(this);
    this.boundCityChange = this.handleCityChange.bind(this);

    this.init();
  }

  /**
  * Orchestrates the lifecycle initialization sequence of the page.
  *
  * @returns {void}
  */
  init() {
    this.alertRender = new AlertRender("#alert-container");

    this.captureElements();
    this.registerEvents();
    this.initializeLocationDropdowns();
  }

  /**
  * Caches required DOM element references for the register  interface.
  *
  * @returns {void}
  */
  captureElements() {
    this.elements = {
      cpfCnpj: document.getElementById("cpf-cnpj"),
      name: document.getElementById("name"),
      email: document.getElementById("email"),
      phone: document.getElementById("phone"),

      password: document.getElementById("password"),
      confirmPassword: document.getElementById("confirm-password"),

      state: document.getElementById("state"),
      city: document.getElementById("city"),
      neighborhood: document.getElementById("neighborhood"),
      address: document.getElementById("address"),

      saveButton: document.getElementById("save-button"),
      loginLink: document.getElementById("login-link"),
    };
  }

  /**
  * Attaches interaction event listeners to the component's root element.
  *
  * @returns {void}
  */
  registerEvents() {
    this.elements.saveButton.addEventListener("click", this.boundSave);

    this.elements.loginLink.addEventListener("click", this.boundLogin);

    this.elements.cpfCnpj.addEventListener("blur", this.boundCpfCnpjBlur);

    this.elements.phone.addEventListener("blur", this.boundPhoneBlur);

    this.elements.email.addEventListener("blur", this.boundEmailBlur);

    this.elements.state.addEventListener("change", this.boundStateChange);
    this.elements.city.addEventListener("change", this.boundCityChange);
  }

  /**
   * Handles the form submission workflow to asynchronously validate and register a new user.
   *
   * @returns {Promise<void>} A promise that resolves when the save operation completes.
   */
  async handleSave() {
    this.clearErrors();

    const data = this.getFormData();

    const valid = await this.validate(data);

    if (!valid) {
      return;
    }

    try {
      const hashedPassword = await AuthService.hashPassword(data.password);

      const result = UserService.createUser({
        document: data.cpfCnpj,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        state: data.state,
        city: data.city,
        neighborhood: data.neighborhood,
        address: data.address,
      });

      if (!result.success) {
        this.alertRender.danger(
          result.error || "Não foi possível criar a conta.",
        );

        return;
      }

      NavStorage.set("phone-validation-page", {
        userId: result.user.id,
      });

      this.alertRender.success("Conta criada com sucesso.");

      setTimeout(() => {
        window.location.href = ROUTES['phone-validation'];
      }, 1000);
    } catch {
      this.alertRender.error("Ocorreu um erro ao criar a conta.");
    }
  }

  /**
   * Manages the submission workflow of the registration form payload.
   *
   * @param {Event} event - The native submit interaction event.
   * @returns {void}
   */
  handleLogin(event) {
    event.preventDefault();

    window.location.href = ROUTES['login'];
  }

/**
 * Handles the blur event on the email input to execute validation constraints.
 *
 * @returns {void}
 */
  handleEmailBlur() {
    const email = this.elements.email.value.trim();

    const validation = TextValidator.validateEmail(email);

    if (!validation.valid) {
      this.showError("email", validation.error || "Email inválido.");
    }
  }

  /**
   * Handles the blur event on the phone input to apply the standard mask.
   *
   * @returns {void}
   */
  handlePhoneBlur() {
    const phone = this.elements.phone.value.trim();

    const validation = PhoneValidator.validate(phone);

    if (!validation.valid) {
      this.showError("phone", validation.error);

      return;
    }

    this.elements.phone.value = this.formatPhone(phone);
  }

  /**
   * Handles the blur event on the CPF/CNPJ input to format and validate the entry.
   *
   * @returns {void}
   */
  handleCpfCnpjBlur() {
    const value = this.elements.cpfCnpj.value.trim();

    const digits = value.replace(/\D/g, "");

    if (digits.length === 11) {
      this.elements.cpfCnpj.value = this.formatCPF(digits);
    }

    if (digits.length === 14) {
      this.elements.cpfCnpj.value = this.formatCNPJ(digits);
    }
  }


  /**
   * Handles the state dropdown change event to clear and repopulate dependent cities.
   *
   * @returns {void}
   */
  handleStateChange() {
    const selectedStateName = this.elements.state.value;

    this.resetSelect(this.elements.city, "Selecione a Cidade");
    this.resetSelect(this.elements.neighborhood, "Selecione o Bairro");

    if (!selectedStateName) return;

    const stateMatch = this.locationData.states.find(
      (s) => s.name === selectedStateName,
    );
    if (stateMatch && stateMatch.cities) {
      this.populateSelect(
        this.elements.city,
        "Selecione a Cidade",
        stateMatch.cities.map((city) => ({ id: city.id, name: city.name })),
      );
      this.elements.city.disabled = false;
    }
  }

  /**
   * Handles the city dropdown change event to repopulate corresponding neighborhoods.
   *
   * @returns {void}
   */
  handleCityChange() {
    const selectedStateName = this.elements.state.value;
    const selectedCityName = this.elements.city.value;

    this.resetSelect(this.elements.neighborhood, "Selecione o Bairro");

    if (!selectedCityName) return;

    const stateMatch = this.locationData.states.find(
      (s) => s.name === selectedStateName,
    );
    const cityMatch = stateMatch?.cities?.find((c) => c.name === selectedCityName);

    if (cityMatch && cityMatch.neighborhoods) {

      const formattedNeighborhoods = cityMatch.neighborhoods.map((nb) => ({
        id: nb,
        name: nb,
      }));
      this.populateSelect(this.elements.neighborhood, "Selecione o Bairro", formattedNeighborhoods,);
      this.elements.neighborhood.disabled = false;
    }
  }

 /**
 * Populates a dropdown selector with a new set of data items and removes the disabled state.
 *
 * @param {HTMLSelectElement} selectElement - The target dropdown DOM element.
 * @param {string} placeholderText - The default placeholder option text.
 * @param {Array<{id: string, name: string}>} items - The collection of options to append.
 * @returns {void}
 */
  populateSelect(selectElement, placeholderText, items) {
    if (!selectElement) return;

    selectElement.length = 0;

    const fragment = document.createDocumentFragment();

    fragment.appendChild(new Option(placeholderText, ''));

    items.forEach(item => {
      fragment.appendChild(new Option(item.name, item.name));
    });

    selectElement.appendChild(fragment);
  }

/**
 * Resets a select element to its default option and forces the disabled state.
 *
 * @param {HTMLSelectElement} selectElement - The target dropdown DOM element.
 * @param {string} placeholderText - The default option text to display.
 * @returns {void}
 */
  resetSelect(selectElement, placeholderText) {
    if (!selectElement) return;

    selectElement.length = 0;

    selectElement.appendChild(new Option(placeholderText, ''));

    selectElement.disabled = true;
  }

  async validate(data) {
    let valid = true;
    const cpfCnpjDigits = data.cpfCnpj.replace(/\D/g, "");

    if (cpfCnpjDigits.length === 11) {
      const result = CPFValidator.validate(cpfCnpjDigits);

      if (!result.valid) {
        valid = false;

        this.showError("cpf-cnpj", "CPF: dígito verificador inválido");
      }
    } else if (cpfCnpjDigits.length === 14) {
      const result = CNPJValidator.validate(cpfCnpjDigits);

      if (!result.valid) {
        valid = false;

        this.showError("cpf-cnpj", "CNPJ: número inválido");
      }
    } else {
      valid = false;

      this.showError("cpf-cnpj", "CPF ou CNPJ inválido.");
    }

    this.validateField("name", TextValidator.validateName(data.name)) || (valid = false);

    this.validateField("email", TextValidator.validateEmail(data.email)) || (valid = false);

    this.validateField("phone", PhoneValidator.validate(data.phone)) || (valid = false);

    this.validateField("state", LocationValidator.validateState(data.state)) || (valid = false);

    this.validateField("city", LocationValidator.validateCity(data.city)) || (valid = false);

    this.validateField(
      "neighborhood",
      LocationValidator.validateNeighborhood(data.neighborhood),
    ) || (valid = false);

    this.validateField(
      "address",
      TextValidator.validateRequired(data.address),
    ) || (valid = false);

    this.validateField(
      "password",
      TextValidator.validateRequired(data.password),
    ) || (valid = false);

    this.validateField(
      "confirm-password",
      TextValidator.validateRequired(data.confirmPassword),
    ) || (valid = false);

    if (data.password !== data.confirmPassword) {
      valid = false;

      this.showError("confirm-password", "As senhas não coincidem.");
    }

    if (!UserService.isEmailAvailable(data.email)) {
      valid = false;

      this.showError("email", "Este email já está em uso.");
    }

    if (!UserService.isPhoneAvailable(data.phone)) {
      valid = false;

      this.showError("phone", "Este telefone já está em uso.");
    }

    return valid;
  }

/**
 * Evaluates a field validation result and updates its visual state accordingly.
 *
 * @param {string} fieldId - The target input field identifier.
 * @param {{success: boolean, error?: string}} result - The validation check payload.
 * @returns {boolean} True if the field is valid, false otherwise.
 */
  validateField(fieldId, result) {
    if (result.valid) {
      return true;
    }
    const errorMsg = {
      name: {
        REQUIRED: "Nome obrigatório",
        INVALID_TYPE: "Insira um nome válido",
        MAX_LENGTH: "Nome muito longo",
        MIN_LENGTH: "Nome muito curto",
      },
      email: {
        REQUIRED: "É obrigatório inserir um E-mail válido",
        INVALID_TYPE: "O campo email recebe apenas texto!",
        MAX_LENGTH: "Este E-mail é invalido",
        INVALID_FORMAT:
          'Insira um email válido. Exemplo de E-mail válido: "exemplo@exemplo.com"',
      },
      phone: {
        INVALID_PHONE: "Número de celular inválido",
        REQUIRED: "Número de celular obrigatório",
      },
      state: {
        REQUIRED: "Selecionar o estado é obrigatório",
        INVALID_TYPE: "Insira um nome de estado válido",
        MAX_LENGTH: "Nome do estado é muito longo",
        MIN_LENGTH: "Nome do estado é muito curto",
      },
      city: {
        REQUIRED: "Selecionar a cidade é obrigatório",
        INVALID_TYPE: "Insira um nome da cidade válido",
        MAX_LENGTH: "Nome da cidade é muito longo",
        MIN_LENGTH: "Nome da cidade é muito curto",
      },
      neighborhood: {
        REQUIRED: "Selecionar o bairro é obrigatório",
        INVALID_TYPE: "Insira um nome de bairro válido",
        MAX_LENGTH: "Nome do bairro é muito longo",
        MIN_LENGTH: "Nome do bairro é muito curto",
      },
      address: {
        REQUIRED: "Nome da rua, número e complemento são obrigatórios",
      },
      password: { REQUIRED: "Senha é obrigatório" },
      "confirm-password": { REQUIRED: "Confirmar a senha é obrigatório" },
    };
    this.showError(fieldId, errorMsg[fieldId][result.error]);

    return false;
  }

  /**
   * Extracts and structures the sanitized form input data into a unified object.
   *
   * @returns {Object} The dictionary containing all trimmed registration field entries.
   */
  getFormData() {
    return {
      cpfCnpj: this.elements.cpfCnpj.value.trim(),

      name: this.elements.name.value.trim(),

      email: this.elements.email.value.trim(),

      phone: this.elements.phone.value.trim(),

      password: this.elements.password.value,

      confirmPassword: this.elements.confirmPassword.value,

      state: this.elements.state.value.trim(),

      city: this.elements.city.value.trim(),

      neighborhood: this.elements.neighborhood.value.trim(),

      address: this.elements.address.value.trim(),
    };
  }

  /**
   * Clears all error states and validation messages from the registration form.
   *
   * @returns {void}
   */
  clearErrors() {
    document.querySelectorAll(".is-invalid").forEach((element) => {
      element.classList.remove("is-invalid");
    });

    document.querySelectorAll("[data-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  /**
   * Displays a validation error message under the specified form field.
   *
   * @param {string} fieldId - The identifier of the form input field.
   * @param {string} message - The error validation text to be shown.
   * @returns {void}
   */
  showError(fieldId, message) {
    const field = document.getElementById(fieldId);

    const feedback = document.querySelector(`[data-error-for="${fieldId}"]`);

    if (field) {
      field.classList.add("is-invalid");
    }

    if (feedback) {
      feedback.textContent = message;
    }
  }

  /**
   * Formats a raw 11-digit string into a standardized CPF mask (XXX.XXX.XXX-XX).
   *
   * @param {string} value - The raw numeric CPF string.
   * @returns {string} The formatted CPF string.
   */
  formatCPF(value) {
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  /**
   * Formats a raw 14-digit string into a standardized CNPJ mask (XX.XXX.XXX/XXXX-XX).
   *
   * @param {string} value - The raw numeric CNPJ string.
   * @returns {string} The formatted CNPJ string.
   */
  formatCNPJ(value) {
    return value.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }

/**
 * Formats a raw string into a standard landline (10 digits) or mobile (11 digits) Brazilian phone mask.
 *
 * @param {string} value - The raw phone alphanumeric or numeric string.
 * @returns {string} The formatted phone string in (XX) XXXX-XXXX or (XX) XXXXX-XXXX pattern.
 * @private
 */
  formatPhone(value) {
    const digits = value.replace(/\D/g, "");

    if (digits.length === 11) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  /**
   * Releases page resources
   */
  destroy() {
    this.elements.saveButton?.removeEventListener("click", this.boundSave);

    this.elements.loginLink?.removeEventListener("click", this.boundLogin);

    this.elements.cpfCnpj?.removeEventListener("blur", this.boundCpfCnpjBlur);

    this.elements.phone?.removeEventListener("blur", this.boundPhoneBlur);

    this.elements.email?.removeEventListener("blur", this.boundEmailBlur);

    this.elements.state?.removeEventListener('change', this.boundStateChange);
    this.elements.city?.removeEventListener('change', this.boundCityChange);

    this.elements = {};

    this.boundSave = null;
    this.boundLogin = null;
    this.boundCpfCnpjBlur = null;
    this.boundPhoneBlur = null;
    this.boundEmailBlur = null;
  }

  /**
   * Fetches geographical data and initializes the state, city, and neighborhood dropdown selectors.
   *
   * @returns {void}
   */
  initializeLocationDropdowns() {
    this.locationData = LocationService.getAllLocations();

    this.populateSelect(
      this.elements.state,
      "Selecione o Estado",
      this.locationData.states.map((state) => ({
        id: state.id,
        name: state.name,
      })),
    );

    // Keep the children disabled and clean until the father undergoes a change.
    this.resetSelect(this.elements.city, "Selecione a Cidade");
    this.resetSelect(this.elements.neighborhood, "Selecione o Bairro");
  }
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    new RegisterPage();
  }
);

// I implemented a lifecycle invalidation for the BFCache (Back-Forward Cache)
// feature of mobile browsers, ensuring data reactivity in history rollback events.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload(); 
    }
});