import { html, css, LitElement } from "lit";
import { TWStyles } from "./tailwind-gen.js";

export class SimpleGreeting extends LitElement {
    static styles = [TWStyles, css``];

    static properties = {
        name: { type: String },
    };

    constructor() {
        super();
        this.name = "Somebody";
    }

    render() {
        return html`<p class="text-dark-content-100 p-4">Hello, ${this.name}!</p>`;
    }
}
customElements.define("simple-greeting", SimpleGreeting);
