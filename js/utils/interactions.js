export function bindInteractivePress(element, handlers = {}) {
    if (!element) return () => {};

    const {
        onClick,
        onHover,
        preventDefault = true,
        stopPropagation = true,
        keyboard = true,
    } = handlers;

    const activate = (event) => {
        if (preventDefault && event?.preventDefault) event.preventDefault();
        if (stopPropagation && event?.stopPropagation) event.stopPropagation();
        if (typeof onClick === 'function') onClick(event);
    };

    const addPressedState = (event) => {
        if (stopPropagation && event?.stopPropagation) event.stopPropagation();
        element.classList.add('pressed');
    };

    const removePressedState = () => {
        element.classList.remove('pressed');
    };

    element.addEventListener('click', activate);
    element.addEventListener('pointerdown', addPressedState);
    element.addEventListener('pointerup', removePressedState);
    element.addEventListener('pointercancel', removePressedState);
    element.addEventListener('pointerleave', removePressedState);

    if (typeof onHover === 'function') {
        element.addEventListener('mouseover', onHover);
    }

    if (keyboard) {
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
        element.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                activate(event);
            }
        });
    }

    return () => {
        element.removeEventListener('click', activate);
        element.removeEventListener('pointerdown', addPressedState);
        element.removeEventListener('pointerup', removePressedState);
        element.removeEventListener('pointercancel', removePressedState);
        element.removeEventListener('pointerleave', removePressedState);
        if (typeof onHover === 'function') {
            element.removeEventListener('mouseover', onHover);
        }
    };
}
