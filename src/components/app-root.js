import { html, css, LitElement } from "lit";
import { TWStyles } from "../js/tailwind-gen.js";

import "./youtube-search.js";
import "./youtube-results.js";

export class AppRoot extends LitElement {
    static styles = [TWStyles, css``];

    static properties = {
        keyword: { type: String },
    };

    constructor() {
        super();
        this.keyword = "";
    }

    _onSearch(e) {
        this.keyword = e.detail;
    }

    render() {
        return html`
            <div id="app" class="flex flex-col h-screen bg-base-300">
                <div
                    id="titlebar"
                    class="flex h-16 bg-base-100 border-b-1 border-base-content/20 items-center shrink-0"
                >
                    <h1 class="flex-1/4 text-2xl px-2 text-base-content/90">YouTube Search</h1>
                    <youtube-search @keywordupdate=${this._onSearch} class="flex mr-2 flex-1/2"></youtube-search>
                    <div class="flex-1/4"></div>
                </div>
                <youtube-results .keyword="${this.keyword}"></youtube-results>
                <div class="flex flex-col"></div>
            </div>
        `;
    }
}
customElements.define("app-root", AppRoot);
