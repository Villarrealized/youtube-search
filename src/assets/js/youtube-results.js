import { html, css, LitElement } from "lit";
import { TWStyles } from "./tailwind-gen.js";
import { Task } from "@lit/task";
import { range } from "lit/directives/range.js";
import { map } from "lit/directives/map.js";
import { fmtCompactNumber, fmtRelativeDate } from "./utils/format.js";

const API_KEY = import.meta.env.VITE_YT_API_KEY;
const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");

export class YouTubeResults extends LitElement {
    static styles = [TWStyles, css``];

    static properties = {
        keyword: { type: String },
        sortOrder: { type: String },
        sortOptions: { type: Array },
        maxResults: { type: Number },
    };

    constructor() {
        super();
        this.keyword = "";
        this.sortOrder = "relevance";
        this.sortOptions = ["relevance", "date", "rating"];
        this.maxResults = 25;
    }

    willUpdate(changedProperties) {
        if (changedProperties.has("keyword") && this.keyword) {
            this._searchTask.run();
        }
    }

    render() {
        const results = this._searchTask.render({
            initial: () => this._initialHtml(),
            pending: () => this._skeletonListHtml(),
            complete: (videoData) => this._resultListHtml(videoData),
            error: (e) => this._errorHtml(e),
        });
        return html`<div class="p-4">${results}</div>`;
    }

    _searchTask = new Task(this, {
        task: async ([keyword]) => {
            const searchResults = await this._searchYouTubeVideos(keyword);
            const videoIds = searchResults.items.map((item) => item.id.videoId).join(",");

            if (!videoIds) {
                return [];
            }

            const videoData = await this._getYouTubeVideoData(videoIds);
            const data = videoData.items.map((video) => ({
                id: video.id,
                title: video.snippet.title,
                description: video.snippet.description,
                channel: video.snippet.channelTitle,
                thumbnail: video.snippet.thumbnails.medium.url,
                publishedAt: video.snippet.publishedAt,
                views: Number(video.statistics.viewCount || 0),
                comments: Number(video.statistics.commentCount || 0),
            }));
            return data;
        },
        args: () => [this.keyword],
        autoRun: false,
    });

    async _searchYouTubeVideos(keyword) {
        searchUrl.search = new URLSearchParams({
            key: API_KEY,
            part: "snippet",
            q: keyword,
            order: this.sortOrder,
            maxResults: this.maxResults,
            type: "video",
        }).toString();

        const result = await fetch(searchUrl);
        return result.json();
    }

    async _getYouTubeVideoData(videoIds) {
        videosUrl.search = new URLSearchParams({
            key: API_KEY,
            id: videoIds,
            part: "snippet,statistics",
        }).toString();

        const result = await fetch(videosUrl);
        return result.json();
    }

    _initialHtml() {
        return html`
            <div class="flex justify-center">
                <div class="card w-md bg-base-300 card-lg shadow-sm">
                    <div class="card-body text-center">
                        <p class="text-lg">Type something in the search bar for results</p>
                    </div>
                </div>
            </div>
        `;
    }

    _skeletonListHtml() {
        return html`
            ${this._sortByHtml()}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                ${map(
                    range(this.maxResults),
                    () => html`
                        <div class="flex flex-col gap-2">
                            <div class="skeleton h-48 w-full"></div>
                            <div class="skeleton h-4 w-full"></div>
                            <div class="skeleton h-3 w-full"></div>
                            <div class="skeleton h-5 w-full"></div>
                        </div>
                    `,
                )}
            </div>
        `;
    }

    _resultListHtml(videoData) {
        return html`
            ${this._sortByHtml()}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                ${videoData.map(
                    (video) => html`
                        <div class="flex flex-col">
                            <a target="_blank" href="https://youtu.be/${video.id}">
                                <img class="w-full rounded-lg" loading="lazy" src="${video.thumbnail}" />
                            </a>
                            <div class="p-1">
                                <div class="text-lg leading-6 line-clamp-2">
                                    <a target="_blank" href="https://youtu.be/${video.id}">${video.title}</a>
                                </div>
                                <div class="flex text-xs text-base-content/80 line-clamp-1">
                                    <span>${fmtCompactNumber(video.views)} views</span>
                                    <span class="px-1">•</span>
                                    <span>${fmtCompactNumber(video.comments)} comments</span>
                                    <span class="px-1">•</span>
                                    <span>${fmtRelativeDate(video.publishedAt)}</span>
                                </div>
                                <div class="text-xs text-base-content/90 py-3 line-clamp-1">
                                    ${video.channel}</p>
                                </div>
                                <div class="text-xs text-base-content/80 line-clamp-1">
                                    ${video.description}</p>
                                </div>
                            </div>
                        </div>
                    `,
                )}
            </div>
        `;
    }

    _sortByHtml() {
        return html`
            <div class="flex justify-end pb-2">
                <fieldset class="fieldset text-sm pt-0">
                    <legend class="fieldset-legend pt-0">Sort by</legend>
                    <select
                        @change="${this._changeSort}"
                        .value=${this.sortOrder}
                        name="sortby"
                        class="select focus:outline-0"
                    >
                        <option value="relevance">Relevance</option>
                        <option value="date">Date</option>
                        <option value="rating">Rating</option>
                    </select>
                </fieldset>
            </div>
        `;
    }

    _errorHtml(e) {
        console.error(e);
        return html`
            <div class="flex justify-center">
                <div class="card w-md bg-base-300 card-lg shadow-sm">
                    <div class="card-body text-center">
                        <p class="text-2xl">Oops!</p>
                        <p class="text-lg">Something went wrong</p>
                    </div>
                </div>
            </div>
        `;
    }

    _changeSort(e) {
        const newValue = e.target.value;
        if (this.sortOptions.includes(newValue)) {
            this.sortOrder = newValue;
            this._searchTask.run();
        }
    }
}
customElements.define("youtube-results", YouTubeResults);
