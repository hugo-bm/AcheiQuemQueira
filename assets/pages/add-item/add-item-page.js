import { Session } from "../../js/core/session.js";
import { CatalogService } from "../../js/services/catalog-service.js";
import { CategoryClassifierService } from "../../js/services/category-classifier-service.js";
import { ItemService } from "../../js/services/item-service.js";

import { AlertRender } from "../../js/components/ui/alert-render.js";
import { Loading } from "../../js/components/ui/loading.js";

import { Events } from "../../js/core/events.js";
import { Helpers } from "../../js/core/helpers.js";
import { ROUTES } from "../../js/core/constants.js";

import { ItemValidator } from "../../js/validation/item.js";
import { Validator } from "../../js/validation/validator.js";

export class AddItemPage {
  constructor() {
    this.userId = null;

    this.catalog = {
      categories: [],
      subcategories: [],
    };

    this.images = [];

    this.content = null;

    this.loading = new Loading({
      message: "Criando anúncio...",
    });

    this.alert = new AlertRender("#alert-container");

    this.refs = {};
    this.boundHandlers = {};
  }

  async init() {
    this.validateSession();
    this.cacheDom();
    this.loadCatalog();
    this.bindEvents();
    this.updateImageCounter();
  }

  validateSession() {
    const userId = Session.getUserId();

    if (!userId) {
      window.location.href = ROUTES["login"];
      return;
    }

    this.userId = userId;
  }

  cacheDom() {
    this.refs.backButton = document.getElementById("back-button");

    this.refs.title = document.getElementById("title");

    this.refs.category = document.getElementById("category");

    this.refs.subcategory = document.getElementById("subcategory");

    this.refs.description = document.getElementById("description");

    this.refs.volumeDescription = document.getElementById("volume-description");

    this.refs.quality = document.getElementById("quality");

    this.refs.basePrice = document.getElementById("base-price");

    this.refs.imageInput = document.getElementById("image-input");

    this.refs.addImageButton = document.getElementById("add-image-button");

    this.refs.emptyImagesState = document.getElementById("empty-images-state");

    this.refs.previewContainer = document.getElementById(
      "image-preview-container",
    );

    this.refs.imagesCounter = document.getElementById("images-counter");
    
    this.refs.imagesCard = document.getElementById("images-card");

    this.refs.saveButton = document.getElementById("save-item-button");

    this.refs.duration = document.getElementById("duration");

    this.refs.type = document.getElementById("type");

    this.content = document.getElementById("card-conteiner");
  }

  loadCatalog() {
    const { data } = CatalogService.getAllCatalog();

    this.catalog = data;

    this.populateCategories();
    this.populateSubcategories();
  }

  populateCategories() {
    const select = this.refs.category;

    select.length = 1;

    this.catalog.categories.forEach((category) => {
      const option = document.createElement("option");

      option.value = category.id;
      option.textContent = category.name;

      select.appendChild(option);
    });
  }

  populateSubcategories(categoryId = null) {
    const select = this.refs.subcategory;

    select.length = 1;

    const subcategories = categoryId
      ? this.catalog.subcategories.filter(
          (item) => item.categoryId === categoryId,
        )
      : this.catalog.subcategories;

    subcategories.forEach((subcategory) => {
      const option = document.createElement("option");

      option.value = subcategory.id;
      option.textContent = subcategory.name;

      select.appendChild(option);
    });
  }

  bindEvents() {
    this.boundHandlers.back = () => history.back();

    this.boundHandlers.titleBlur = () => this.suggestCategory();

    this.boundHandlers.categoryChange = () =>
      this.populateSubcategories(this.refs.category.value);

    this.boundHandlers.imageSelect = (event) =>
      this.handleImageSelection(event);

    this.boundHandlers.priceInput = (event) => this.maskPrice(event);

    this.boundHandlers.save = () => this.saveItem();

    Events.on(this.refs.backButton, "click", this.boundHandlers.back);

    Events.on(this.refs.title, "blur", this.boundHandlers.titleBlur);

    Events.on(this.refs.category, "change", this.boundHandlers.categoryChange);

    Events.on(this.refs.imageInput, "change", this.boundHandlers.imageSelect);

    Events.on(this.refs.basePrice, "input", this.boundHandlers.priceInput);

    Events.on(this.refs.saveButton, "click", this.boundHandlers.save);

    Events.on(this.refs.addImageButton, "click", () =>
      this.refs.imageInput.click(),
    );
  }

  suggestCategory() {
    const title = this.refs.title.value.trim();

    if (!title) {
      return;
    }

    const result = CategoryClassifierService.suggestCategory(title);

    if (!result.success) {
      return;
    }

    this.refs.category.value = result.categoryId;

    this.populateSubcategories(result.categoryId);

    this.refs.subcategory.value = result.subcategoryId;
  }

  handleImageSelection(event) {
    const files = Array.from(event.target.files);

    const available = 5 - this.images.length;

    files.slice(0, available).forEach((file) => {
      this.addImage(file);
    });

    this.updateImageEmptyState();

    event.target.value = "";
  }

  addImage(file) {
    const path = this.normalizeImagePath(file.name);

    this.images.push(path);

    const preview = document.createElement("div");

    preview.className = "position-relative";

    const image = document.createElement("img");

    image.src = URL.createObjectURL(file);

    image.className = "img-thumbnail";

    const removeButton = document.createElement("button");

    removeButton.type = "button";

    removeButton.className =
      "btn btn-sm btn-danger position-absolute top-0 end-0";

    removeButton.textContent = "×";

    removeButton.addEventListener("click", () => {
      this.removeImage(preview, path);
    });

    preview.appendChild(image);
    preview.appendChild(removeButton);

    this.refs.previewContainer.appendChild(preview);

    this.updateImageCounter();
  }

  normalizeImagePath(path) {
    const normalized = String(path).replace(/\\/g, "/");

    const index = normalized.indexOf("assets/images");

    if (index >= 0) {
      return `/${normalized.substring(index)}`;
    }

    return `/assets/images/${normalized}`;
  }

  removeImage(preview, path) {
    const index = this.images.indexOf(path);

    if (index >= 0) {
      this.images.splice(index, 1);
    }

    preview.remove();

    this.updateImageEmptyState();
    this.updateImageCounter();
  }

  updateImageCounter() {
    this.refs.imagesCounter.textContent = `${this.images.length} / 5 imagens`;
  }

  updateImageEmptyState() {
    if (this.images.length > 0) {
        this.refs.emptyImagesState.classList.remove("d-flex");
        this.refs.emptyImagesState.classList.add("d-none");
        this.refs.addImageButton.classList.add("mt-3");
    }
    else {
        this.refs.emptyImagesState.classList.remove("d-none");
        this.refs.emptyImagesState.classList.add("d-flex");
        this.refs.addImageButton.classList.remove("mt-3");
    }
  }

  maskPrice(event) {
    let value = event.target.value.replace(/\D/g, "");

    value = (Number(value) / 100).toFixed(2).replace(".", ",");

    event.target.value = value;
  }

  /**
   * It performs cascading validation by collecting the state and displaying visual errors.
   *
   * @returns {boolean} True if the form is completely complete.
   */
  validateForm() {
    this.clearValidationErrors();
    let isValid = true;

    // Localized dictionary of error messages supported by the validator specification.
    const errorMessages = {
      title: {
        REQUIRED: "O título do anúncio é obrigatório.",
        MIN_LENGTH: "O título deve ter no mínimo 3 caracteres.",
        MAX_LENGTH: "O título não pode exceder 120 caracteres.",
      },
      category: { REQUIRED: "Selecione uma categoria válida para o item." },
      subcategory: { REQUIRED: "Selecione uma subcategoria." },
      description: {
        REQUIRED: "Uma descrição breve do item é obrigatória.",
        MAX_LENGTH: "A descrição não pode ultrapassar 1000 caracteres.",
      },
      volumeDescription: {
        REQUIRED: "Uma descrição do volume, formato ou quantidade do item é obrigátoria.",
        MAX_LENGTH: "A descrição não pode ultrapassar 1000 caracteres.",
      },
      quality: {
        REQUIRED: "A seleção da qualidade do item é obrigatória.",
        INVALID_QUALITY: "Opção de qualidade inválida.",
      },
      duration: {
        REQUIRED: "Selecione a duração de exibição do anúncio.",
        INVALID_EXPIRATION: "Período de expiração inválido.",
      },
      type: {
        REQUIRED: "Selecione o objetivo do seu anúncio.",
        INVALID_TYPE: "Objetivo Inválido.",
      },
      image: {
        REQUIRED: "Selecione pelo menos uma imagem.",
      }
    };

    const titleVal = ItemValidator.validateTitle(this.refs.title.value.trim());
    if (!titleVal.valid) {
      this.showFieldError(this.refs.title, errorMessages.title[titleVal.error]);
      isValid = false;
    }

    const catVal = ItemValidator.validateCategory(this.refs.category.value);
    if (!catVal.valid) {
      this.showFieldError(
        this.refs.category,
        errorMessages.category[catVal.error],
      );
      isValid = false;
    }

    const subVal = ItemValidator.validateSubcategory(
      this.refs.subcategory.value,
    );
    if (!subVal.valid) {
      this.showFieldError(
        this.refs.subcategory,
        errorMessages.subcategory[subVal.error],
      );
      isValid = false;
    }

    const descVal = ItemValidator.validateDescription(
      this.refs.description.value.trim(),
    );
    if (!descVal.valid) {
      this.showFieldError(
        this.refs.description,
        errorMessages.description[descVal.error],
      );
      isValid = false;
    }

    const qualVal = ItemValidator.validateQuality(this.refs.quality.value);
    if (!qualVal.valid) {
      this.showFieldError(
        this.refs.quality,
        errorMessages.quality[qualVal.error],
      );
      isValid = false;
    }

    const durationValue = this.refs.duration.value
      ? Number(this.refs.duration.value)
      : "";
    const durVal = ItemValidator.validateExpirationDays(durationValue);
    if (!durVal.valid) {
      this.showFieldError(
        this.refs.duration,
        errorMessages.duration[durVal.error],
      );
      isValid = false;
    }

    const volumeDescValue = this.refs.volumeDescription.value;
    const volDescVal = ItemValidator.validateDescription(volumeDescValue);
    if (!volDescVal.valid) {
      this.showFieldError(
        this.refs.volumeDescription,
        errorMessages.volumeDescription[volDescVal.error],
      );
      isValid = false;
    }

    const typeReqVal = Validator.required(this.refs.type.value);
    const typeVal = ["free", "sale","disposal"].includes(this.refs.type.value);

    if (!typeReqVal || !typeVal) {
        let errorMsgType = "INVALID_TYPE";
        if (!typeReqVal) errorMsgType = "REQUIRED";
      this.showFieldError(
        this.refs.type,
        errorMessages.type[errorMsgType],
      );
      isValid = false;
    }

    const imgLengthVal = this.images.length;
    if (imgLengthVal === 0) {
      this.showFieldError(
        this.refs.imagesCard,
        errorMessages.image['REQUIRED'],
        true
      );
      isValid = false;
    }

    return isValid;
  }

  createPayload() {
    const price = this.refs.basePrice.value.replace(".", "").replace(",", ".");
    

    return {
      ownerId: this.userId,

      title: this.refs.title.value.trim(),

      description: this.refs.description.value.trim(),

      volumeDescription: this.refs.volumeDescription.value.trim(),

      categoryId: this.refs.category.value,

      subcategoryId: this.refs.subcategory.value,

      quality: this.refs.quality.value,

      images: [...this.images],

      price: price,

      type: this.refs.type.value,

      item_duration: this.refs.duration.value,
    };
  }
/** 
 * Visually injects the error classes and inserts the descriptive string.
 */
showFieldError(fieldElement, message, isImageField= false) { 
    if (!fieldElement) return;
    if (isImageField) 
    {
        fieldElement.classList.add("border-danger");
    }
    fieldElement.classList.add("is-invalid");        
    const feedbackElement = this.content.querySelector(`[data-error-for="${fieldElement.id}"]`);
    if (feedbackElement) 
    {
        feedbackElement.textContent = message;
    } 
}
/**
 * Scans the DOM tree to purge visual indicators of previous failures.
 */
clearValidationErrors() {
    const fields = [
      this.refs.title,
      this.refs.category,
      this.refs.subcategory,
      this.refs.description,
      this.refs.volumeDescription,
      this.refs.quality,
      this.refs.duration,
      this.refs.type,
      this.refs.imagesCard
    ];
    fields.forEach((field) => {
      if (field) field.classList.remove("is-invalid");
    });
    const feedbacks = this.content.querySelectorAll(".invalid-feedback");
    feedbacks.forEach((feedback) => {
      feedback.textContent = "";
    });
    if (this.refs.imagesCard) {this.refs.imagesCard.classList.remove("border-danger")}
}
  
saveItem() {
    if (!this.validateForm()) {
        this.alert.danger("Por favor, corrija os erros do formulário.");
        return;
    }
    this.loading.show(document.body);

    const payload = this.createPayload();
    console.log(payload)

    const result = ItemService.createItem(payload);

    this.loading.hide();

    if (!result.success) {
      this.alert.danger("Não foi possível criar o anúncio.");

      return;
    }

    this.alert.success("Anúncio criado com sucesso.");

    setTimeout(() => {
      window.location.href = ROUTES.dashboard;
    }, 800);
  }

  destroy() {
    Object.entries(this.boundHandlers).forEach(([key, handler]) => {
      switch (key) {
        case "back":
          Events.off(this.refs.backButton, "click", handler);
          break;

        case "titleBlur":
          Events.off(this.refs.title, "blur", handler);
          break;

        case "categoryChange":
          Events.off(this.refs.category, "change", handler);
          break;

        case "imageSelect":
          Events.off(this.refs.imageInput, "change", handler);
          break;

        case "priceInput":
          Events.off(this.refs.basePrice, "input", handler);
          break;

        case "save":
          Events.off(this.refs.saveButton, "click", handler);
          break;
      }
    });

    this.loading.hide();

    this.images = [];
    this.refs = {};
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const page = new AddItemPage();

  page.init();

  window.addEventListener("beforeunload", () => page.destroy());
});
