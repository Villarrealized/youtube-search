import { html, css, LitElement } from "lit";
import { TWStyles } from "./tailwind-gen.js";
const API_KEY = import.meta.env.VITE_YT_API_KEY;
const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");

export class YouTubeSearch extends LitElement {
    static styles = [TWStyles, css``];

    constructor() {
        super();
    }

    async _searchYouTubeVideos(keyword) {
        searchUrl.search = new URLSearchParams({
            key: API_KEY,
            part: "snippet",
            q: keyword,
            maxResults: "5",
            type: "video",
        }).toString();

        try {
            const result = await fetch(searchUrl);
            return result.json();
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async _getYouTubeVideoData(videoIds) {
        videosUrl.search = new URLSearchParams({
            key: API_KEY,
            id: videoIds,
            part: "snippet,statistics",
        }).toString();

        try {
            const result = await fetch(videosUrl);
            return result.json();
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async _search(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const keyword = formData.get("search");

        const searchResults = await this._searchYouTubeVideos(keyword);
        const videoIds = searchResults.items.map((item) => item.id.videoId).join(",");

        if (!videoIds) {
            console.log("No videos found");
            return;
        }

        const videoData = await this._getYouTubeVideoData(videoIds);

        const data = videoData.items.map((video) => ({
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            channel: video.snippet.channelTitle,
            thumbnail: video.snippet.thumbnails.medium.url,
            views: video.statistics.viewCount,
            comments: video.statistics.commentCount,
        }));
        console.log(data);
    }

    render() {
        return html`
            <form @submit=${this._search} class="join grow">
                <label
                    class="join-item input input-lg grow focus-within:outline-0 focus-within:border-primary shadow-none"
                >
                    <input name="search" type="search" placeholder="Search" />
                </label>
                <button class="btn border-zinc-600 shadow-none btn-lg join-item">
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
