import styles from './et-checkmark.css?inline';

class ETCheckmark extends HTMLElement {
    
    static observedAttributes = ["color", "size", "checked"];

    constructor() {
        super();
        this.attachShadow({
            mode: 'open'
        });

        this.createHtml();

        this.createStyles();

        this.setupCheckmarkLogic();
        
        this.color = 'var(--et-primary-color)'
        this.size = '48px';
    }


    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'size') {
          this.size = newValue;
        }
        if (name === 'color') {
          this.color = newValue;
        }
        if (name === 'checked') {
            const checkboxInput = this.shadowRoot.querySelector('input[type="checkbox"]');

            if (newValue !== null) {

                // set css classes and input value
                this.wrapper.classList.add('checked');
                checkboxInput.checked = true;
                
                // js animation
                const svg = this.wrapper.querySelector('svg');
                const path = svg.querySelector('path');
                const circle = svg.querySelector('circle');
                let totalLength = path.getTotalLength();
                let steps = 10;
                let stepSize = totalLength / steps;
                let keyframes = Array.from(new Array(10).keys())
                    .map(i => {
                        let currentLength = totalLength - (stepSize * i);
                        let currentPoint = path.getPointAtLength(currentLength);
                        return {
                            cx: currentPoint.x,
                            cy: currentPoint.y,
                            r: 2,
                            fill: 'var(--_checkmark-color)'
                        };
                    });
                let options = {
                    easing: 'ease-in-out',
                    duration: 300
                }
                circle.animate(keyframes, options);


                // dirty update
                this.wrapper.classList.add('dirty');
            }
            else {
                // set css classes and input value
                this.wrapper.classList.remove('checked');
                checkboxInput.checked = false;
            }
        }
    }

    get wrapper() {
        if (!this._wrapper) {
            this._wrapper = this.shadowRoot.querySelector('.et-checkmark');
        }
        return this._wrapper;
    }

    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;
        this.wrapper.style.setProperty('--_checkmark-color', value);
    }

    get size() {
        return this._size;
    }

    set size(value) {
        this._size = value;
        this.wrapper.style.setProperty('--_checkmark-size', value);
    }

    createHtml() {
        let html = /*html*/`
        <div class="et-checkmark">
            <input type="checkbox" hidden/>
            <svg viewBox="0 0 16 16">
                <path d="M3,9 Q6,12 7,13 Q9,6 15,3"></path>
                <circle></circle>
            </svg>
            <div class="et-checkmark-bg">
            </div>
        </div>
        `;
        this.shadowRoot.innerHTML = html;
    }

    createStyles() {
        let stylesheet = new CSSStyleSheet();
        stylesheet.replace(styles);
        this.shadowRoot.adoptedStyleSheets = [stylesheet];
    }

    setupCheckmarkLogic() {
        this.wrapper.addEventListener('click', () => {

            if (!this.hasAttribute('checked'))
                this.setAttribute('checked', '');
            else
                this.removeAttribute('checked');
         });
    }
}

customElements.define('et-checkmark', ETCheckmark);
