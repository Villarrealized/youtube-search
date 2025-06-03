import { html, css, LitElement } from "lit";
import { TWStyles } from "./tailwind-gen.js";

export class YouTubeSearch extends LitElement {
    static styles = [TWStyles, css``];

    constructor() {
        super();
    }

    async _onSearch(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const keyword = formData.get("search");
        if (keyword) {
            this.dispatchEvent(
                new CustomEvent("keywordupdate", {
                    detail: keyword,
                    bubbles: true,
                    composed: true,
                }),
            );
        }
    }

    render() {
        return html`
            <form @submit=${this._onSearch} class="join grow">
                <label
                    class="join-item input input-lg grow focus-within:outline-0 focus-within:border-primary shadow-none"
                >
                    <input name="search" autocomplete="off" type="search" placeholder="Search" />
                </label>
                <button class="btn border-base-content/20 shadow-none btn-lg join-item">
                    <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            stroke-width="2.5"
                            fill="none"
                            stroke="currentColor"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </g>
                    </svg>
                </button>
            </form>
        `;
    }
}
customElements.define("youtube-search", YouTubeSearch);
