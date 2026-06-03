export class AlertRender {
    /**
     * @param {HTMLElement|string} container
     */
    constructor(container) {
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;

        this.icons = {
            success: 'bi-check-circle',
            danger: 'bi-x-circle',
            warning: 'bi-exclamation-triangle',
            info: 'bi-info-circle'
        };

        this.activeTimers = new Map();
    }

    /**
     * Displays an alert.
     *
     * @param {Object} options
     * @param {'success'|'danger'|'warning'|'info'} options.type
     * @param {string} options.title
     * @param {string} [options.description]
     * @param {number|null} [options.timeout]
     *
     * @returns {HTMLElement|null}
     */
    show({
        type = 'info',
        title,
        description = '',
        timeout = 5000
    }) {
        if (!this.container || !title) {
            return null;
        }

        const icon = this.icons[type] ?? this.icons.info;

        const alert = document.createElement('div');

        alert.className = `
            alert
            alert-${type}
            alert-dismissible
            fade
            show
            d-flex
            align-items-start
            gap-3
            shadow-sm
            mb-2
        `;

        alert.setAttribute('role', 'alert');

        alert.innerHTML = `
            <i class="bi ${icon} fs-5 flex-shrink-0" aria-hidden="true" focusable="false"></i>

            <div class="flex-grow-1">
                <div class="fw-semibold">
                    ${title}
                </div>

                ${
                    description
                        ? `
                            <div class="small mt-1">
                                ${description}
                            </div>
                        `
                        : ''
                }
            </div>

            <button
                type="button"
                class="btn-close"
                aria-label="Fechar">
            </button>
        `;

        const closeButton = alert.querySelector('.btn-close');

        const removeAlert = () => {
            if (!alert.parentElement) {
                return;
            }

            // Aborts the automatic timer in the background if the closing is done manually.
            if (this.activeTimers.has(alert)) {
                clearTimeout(this.activeTimers.get(alert));
                this.activeTimers.delete(alert);
            }

            // Remove the listener to free up memory.
            if (closeButton) {
                closeButton.removeEventListener('click', removeAlert);
            }

            alert.classList.remove('show');

            setTimeout(() => {
                alert.remove();
            }, 150);
        };

        this.container.appendChild(alert);

        if (timeout && timeout > 0) {
            const timer = setTimeout(() => {
                removeAlert();
            }, timeout);

            // Link the timer to the specific alert.
            this.activeTimers.set(alert, timer);
        }


        return alert;
    }

    /**
     * @param {string} title
     * @param {string} [description]
     * @param {number|null} [timeout]
     */
    success(title, description = '', timeout = 5000) {
        return this.show({
            type: 'success',
            title,
            description,
            timeout
        });
    }

    /**
     * @param {string} title
     * @param {string} [description]
     * @param {number|null} [timeout]
     */
    danger(title, description = '', timeout = 5000) {
        return this.show({
            type: 'danger',
            title,
            description,
            timeout
        });
    }

    /**
     * @param {string} title
     * @param {string} [description]
     * @param {number|null} [timeout]
     */
    warning(title, description = '', timeout = 5000) {
        return this.show({
            type: 'warning',
            title,
            description,
            timeout
        });
    }

    /**
     * @param {string} title
     * @param {string} [description]
     * @param {number|null} [timeout]
     */
    info(title, description = '', timeout = 5000) {
        return this.show({
            type: 'info',
            title,
            description,
            timeout
        });
    }

    /**
     * Removes all alerts.
     */
    clear() {
        // Interrupts all pending timers in memory.
        this.activeTimers.forEach(timer => clearTimeout(timer));
        this.activeTimers.clear();

        this.container
            ?.querySelectorAll('.alert')
            .forEach(alert => {
                const closeButton = alert.querySelector('.btn-close');
                if (closeButton) {
                    // Remove residual listeners by replacing the button with a clean clone.note
                    closeButton.replaceWith(closeButton.cloneNode(true));
                }
                alert.remove();
            });
    }
}