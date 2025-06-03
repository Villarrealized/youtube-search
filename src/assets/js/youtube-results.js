import { html, css, LitElement } from "lit";
import { TWStyles } from "./tailwind-gen.js";
import { Task } from "@lit/task";
import { range } from "lit/directives/range.js";
import { map } from "lit/directives/map.js";

const API_KEY = import.meta.env.VITE_YT_API_KEY;
const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");

// TODO: remove - only for testing
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export class YouTubeResults extends LitElement {
    static styles = [TWStyles, css``];

    static properties = {
        keyword: { type: String },
        maxResults: { type: Number },
    };

    constructor() {
        super();
        this.keyword = "";
        this.maxResults = 11;
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
            console.log(videoData);
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
            // TODO: Remove, only for testing
            await sleep(2000);
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
            <div class="grid grid-cols-4 gap-6">
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
            <div class="grid grid-cols-4 gap-6">
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
                                    <span>${this._formatNumber(video.views)} views</span>
                                    <span class="px-1">•</span>
                                    <span>${this._formatNumber(video.comments)} comments</span>
                                    <span class="px-1">•</span>
                                    <span>${this._formatDate(video.publishedAt)}</span>
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

    _formatNumber(number) {
        return number;
    }

    _formatDate(dateString) {
        return dateString;
    }
}
customElements.define("youtube-results", YouTubeResults);
