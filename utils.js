export function createElement(tagName, attributes) {
    let element = document.createElement(tagName);
    for (var key in attributes) {
        var value = attributes[key];
        element.setAttribute(key, value);
    }
    return element;
}

export function createCheckbox(size = '48px', color = 'var(--et-primary-color)') {
    return createElement('et-checkmark', { size: size, color: color });
}

// saving

export function saveToStorage(key, value) {
    const json = JSON.stringify(value);
    localStorage.setItem(key, json);
}

export function getFromStorage(key) {
    const json = localStorage.getItem(key);
    const value = JSON.parse(json);
    return value;
}