interface Bookmark {
    href: string
    description: string
    extended: string
    meta:  string
    hash: string
    time: string
    shared: string
    toread: string
    tags: string
}

interface GetParams {
    tag?: string,
    date?: string,
    url?: string,
    meta?: string
}

interface AddParams {
    url: string,
    description: string,
    extended?: string,
    tags?: string,
    dt?: string,
    replace?: string,
    shared?: string,
    toread?: string
}

class Pinboard {

    private authToken: string;

    constructor(apiToken: string) {
        this.authToken = apiToken;
    }

    private fetchApi(path: string, params: object = {}): Promise<any> {
        let urlParams = new URLSearchParams()
        for (let [key, value] of Object.entries(params))
            urlParams.append(key, value);
        urlParams.append('auth_token', this.authToken);
        urlParams.append('format', 'json');
        let url = new URL('https://api.pinboard.in/v1' + path);
        url.search = urlParams.toString();
        return fetch(url.toString()).then(reply => reply.json());
    }

    async lastUpdateTime(): Promise<number> {
        let response = await this.fetchApi('/posts/update');
        let dt = new Date(response['update_time']);
        return dt.getTime();
    }

    async get(params: GetParams): Promise<Array<Bookmark>> {
        return (await this.fetchApi('/posts/get', params)).posts;
    }

    add(params: AddParams): Promise<void> {
        return this.fetchApi('/posts/add', params);
    }

    delete(url: string): Promise<void> {
        return this.fetchApi('/posts/delete', {url: url});
    }

    all(): Promise<Array<Bookmark>> {
        return this.fetchApi('/posts/all');
    }
}

let pb: null | Pinboard = null;

async function init(): Promise<void> {
	let { apiToken } = await browser.storage.sync.get('apiToken');
	pb = apiToken ? new Pinboard(apiToken as string) : null;
}

async function bookmarkTab(tab: browser.tabs.Tab): Promise<void> {
	if (!pb || !tab.url)
		return;
	let params: AddParams = {
		url:         tab.url,
		description: tab.title || '',
		toread:      'yes'
	};
	let existing = (await pb.get({url: tab.url}))[0];
	if (existing) {
		params.dt       = existing.time;
		params.extended = existing.extended;
		params.shared   = existing.shared;
		params.tags     = existing.tags;
		params.replace  = 'yes';
	}
	params.toread = 'yes';
	await pb.add(params);
	browser.notifications.create('created', {
		type:    'basic',
		title:   'Page bookmarked',
		message: tab.url
	});
}

async function bookmarkCurrentTab(): Promise<void> {
	let tabs = await browser.tabs.query({ active: true, currentWindow: true });
	if (tabs[0])
		bookmarkTab(tabs[0]);
}

browser.storage.onChanged.addListener(init);
init();

browser.browserAction.onClicked.addListener(bookmarkTab);
browser.commands.onCommand.addListener(bookmarkCurrentTab);
