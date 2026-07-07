// ==UserScript==
// @name         BypassNET
// @namespace    https://github.com/bruddaa/
// @version      1.2
// @description  Bypasses various link lockers (Some sites may require waiting). See all supported sites: https://
// @icon         https://raw.githubusercontent.com/bruddaa/UserScripts/refs/heads/main/Linkify%20Bypasser/lb_logo.png
// @author       Brudda
// @match        *://bstshrt.com/u/*
// @match        *://www.gzenx.com/subpages/*
// @match        *://hadoscripts.com/subpages/*
// @match        *://link-unlock.com/*
// @match        *://link2unlock.com/*
// @match        *://rekonise.com/*
// @match        *://www.ytsubme.com/*
// @match        *://lockr.net/*
// @match        *://boostylink.com/*
// @match        *://sub2unlock.me/*
// @match        *://sub2unlock.io/*
// @match        *://sub4unlock.io/*
// @match        *://subtounlock.com/*
// @match        *://sub2unlock.com/*
// @match        *://subs4unlock.net/*
// @match        *://www.sub2get.com/*
// @match        *://subforunlock.com/*
// @match        *://unlocklink.web.id/*
// @match        *://socialwolvez.com/*
// @match        *://scwz.me/*
// @match        *://*.boost.ink/*
// @match        *://*.bst.gg/*
// @match        *://*.bst.wtf/*
// @match        *://*.booo.st/*
// @match        *://sub2unlock.id/*
// @match        *://sub2unlock.pro/*
// @match        *://sub4unlock.com/*
// @match        *://subunlock.com/*
// @match        *://risub.com/*
// @match        *://bstlar.com/*
// @match        *://ibin.site/lock/*
// @match        *://venuslockscript.com/locker/*
// @match        *://linkunlocker.com/*
// @match        *://linkzy.space/u/*
// @match        *://go.linkify.ru/*
// @match        *://linksterra.com/l/*
// @connect      api.link-unlock.com
// @connect      api.rekonise.com
// @connect      zjzdbkmhxbwcznwvmfsg.supabase.co
// @connect      api.sub2unlock.com
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

(function () {
    'use strict';
    const hostname = window.location.hostname;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    // ==========================================
    // BSTLAR.COM BYPASS LOGIC
    // ==========================================
    if (hostname.includes('bstlar.com')) {
        const slug = window.location.pathname.replace(/^\//, '');
        if (!slug) return;

        console.log("[Bypass] Bstlar: Waiting for Cloudflare check to finish...");

        const cfCheck = setInterval(async () => {
            const input = document.querySelector('input#link_action_id');
            if (!input) return;

            clearInterval(cfCheck);
            const linkActionId = input.value;

            try {
                const getUrl = `https://bstlar.com/api/link?url=${encodeURIComponent(slug)}&link_action_id=${linkActionId}`;
                const getRes = await fetch(getUrl, { credentials: 'include' });
                const getData = await getRes.json();

                if (!getData.id) {
                    return console.error("[Bypass] Bstlar: Failed to get link ID from API.", getData);
                }

                const linkId = getData.id;

                const postRes = await fetch('https://bstlar.com/api/link-completed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ link_id: linkId, link_action_id: linkActionId })
                });

                const postData = await postRes.json();

                if (postData.destination_url) {
                    console.log("[Bypass] Bstlar: ✅ Unlocked successfully!");
                    window.stop();
                    window.location.replace(postData.destination_url);
                } else {
                    console.error("[Bypass] Bstlar: POST succeeded but missing destination_url.", postData);
                }
            } catch (err) {
                console.error("[Bypass] Bstlar: Network error.", err);
            }
        }, 500);
        return;
    }

    // ==========================================
    // RISUB.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('risub.com')) {
        let bypassed = false;

        function extractAndRedirect() {
            if (bypassed) return true;

            // Look for the final link element
            const finalLink = document.querySelector('a.final-link');
            if (finalLink) {
                const href = finalLink.getAttribute('href');
                // Make sure it's a valid URL and not empty
                if (href && href !== '#' && /^https?:\/\//i.test(href)) {
                    console.log("[Bypass] Risub: ✅ Found destination URL!", href);
                    window.stop();
                    window.location.replace(href);
                    bypassed = true;
                    return true;
                }
            }
            return false;
        }

        // Try immediately if DOM is already loaded
        if (document.readyState !== 'loading') {
            if (extractAndRedirect()) return;
        }

        // Watch for the link to appear
        const observer = new MutationObserver(() => {
            if (extractAndRedirect()) {
                observer.disconnect();
            }
        });

        // Start observing once DOM is ready
        function startObserver() {
            if (extractAndRedirect()) return;
            if (document.body) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['href', 'style']
                });
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startObserver, { once: true });
        } else {
            startObserver();
        }

        // Fallback: periodically check for the link (in case the observer misses it)
        const intervalCheck = setInterval(() => {
            if (extractAndRedirect()) {
                clearInterval(intervalCheck);
                observer.disconnect();
            }
        }, 500);

        // Clean up interval after 30 seconds to prevent memory leaks
        setTimeout(() => {
            clearInterval(intervalCheck);
            observer.disconnect();
        }, 30000);

        return;
    }

    // ==========================================
    // LOCKR.NET BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('lockr.net')) {
        const slug = window.location.pathname.split('/').filter(Boolean)[0];
        if (!slug) return;

        async function bypassLockr() {
            try {
                console.log("[Bypass] Lockr: Fetching view data to get token...");
                const viewRes = await fetch(`https://lockr.net/api/v1/lockers/${slug}/view`, {
                    credentials: 'include'
                });
                const viewData = await viewRes.json();

                const token = viewData?.data?.token;
                const serverWait = viewData?.data?.waitingTimeSeconds || 0;

                if (!token) {
                    return console.error("[Bypass] Lockr: Failed to get token from API.", viewData);
                }

                // Wait at least 20 seconds, or longer if the server explicitly specifies it
                const waitTime = Math.max(20, serverWait);
                console.log(`[Bypass] Lockr: Token acquired. Waiting ${waitTime} seconds for server timer...`);
                await sleep(waitTime * 1000);

                // Try up to 3 times with 5-second intervals
                for (let i = 0; i < 3; i++) {
                    console.log(`[Bypass] Lockr: Attempting unlock (${i + 1}/3)...`);
                    const unlockRes = await fetch(`https://lockr.net/api/v1/lockers/${slug}/unlock?token=${token}`, {
                        credentials: 'include'
                    });
                    const unlockData = await unlockRes.json();

                    if (unlockData?.data?.target) {
                        console.log("[Bypass] Lockr: ✅ Unlocked successfully!", unlockData.data.target);
                        window.stop();
                        window.location.replace(unlockData.data.target);
                        return;
                    }

                    if (i < 2) {
                        console.log("[Bypass] Lockr: Target not ready yet, waiting 5 seconds...");
                        await sleep(5000);
                    }
                }

                console.error("[Bypass] Lockr: ❌ Failed to unlock after 3 attempts.");
            } catch (err) {
                console.error("[Bypass] Lockr: Network error.", err);
            }
        }

        bypassLockr();
        return;
    }

    // ==========================================
    // YTSUBME.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('ytsubme.com')) {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('urlid');

        if (!code) return;

        async function bypassYtSubMe() {
            try {
                console.log("[Bypass] YtSubMe: Fetching link data from API...");
                const res = await fetch(`https://www.ytsubme.com/dashboard/api/s2u_links.php?mode=s2uGetLink&code=${code}`);
                const data = await res.json();

                // The destination URL is in msg.target (and also return_url)
                const destUrl = data.msg?.target || data.return_url;

                if (destUrl) {
                    // Fix escaped slashes (https:\/\/test.com -> https://test.com)
                    const url = destUrl.replace(/\\\//g, '/');
                    console.log("[Bypass] YtSubMe: ✅ Unlocked successfully!", url);
                    window.stop();
                    window.location.replace(url);
                } else {
                    console.error("[Bypass] YtSubMe: Failed to find destination URL in response.", data);
                }
            } catch (err) {
                console.error("[Bypass] YtSubMe: Network error.", err);
            }
        }

        bypassYtSubMe();
        return;
    }

    // ==========================================
    // SOCIALWOLVEZ.COM (SCWZ.ME) BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('socialwolvez.com')) {
        const regex = /"url":"(https?:[^"\\]+)"/;

        function extractAndRedirect(raw) {
            const match = raw?.match(regex);
            if (match?.[1]) {
                // Fix escaped slashes just in case (https:\/\/test.com -> https://test.com)
                const url = match[1].replace(/\\\//g, '/');
                if (/^https?:\/\//i.test(url)) {
                    console.log("[Bypass] SocialWolvez: ✅ Found destination URL!", url);
                    window.stop();
                    window.location.replace(url);
                    return true;
                }
            }
            return false;
        }

        // Hook Next.js data stream
        function hookPush() {
            if (typeof self.__next_f?.push !== 'function') return false;

            const orig = self.__next_f.push;
            self.__next_f.push = function (chunk) {
                const raw = (Array.isArray(chunk) && typeof chunk[1] === 'string') ? chunk[1] : JSON.stringify(chunk);
                if (!extractAndRedirect(raw)) orig.call(this, chunk);
            };
            return true;
        }

        if (!hookPush()) {
            try {
                Object.defineProperty(self, '__next_f', {
                    configurable: true, enumerable: true,
                    get: () => undefined,
                    set(val) { delete self.__next_f; self.__next_f = val; hookPush(); },
                });
            } catch (_) {}
        }

        // Fallback: Scan scripts if the chunk was pushed before the script injected
        function fallback() {
            for (const s of document.querySelectorAll('script')) {
                if (extractAndRedirect(s.textContent)) return;
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fallback, { once: true });
        } else {
            fallback();
        }
        return;
    }

    // ==========================================
    // BOOST.INK / BST.GG / BST.WTF / BOOO.ST BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('boost.ink') || hostname.includes('bst.gg') || hostname.includes('bst.wtf') || hostname.includes('booo.st')) {
        function extractAndRedirect() {
            // The destination URL is base64 encoded in a custom attribute on the script tag
            const script = document.querySelector('script[bufpsvdhmjybvgfncqfa]');
            if (script) {
                const dest = script.getAttribute('bufpsvdhmjybvgfncqfa');
                if (dest) {
                    try {
                        const url = atob(dest);
                        if (url && /^https?:\/\//i.test(url)) {
                            console.log("[Bypass] Boost.ink: ✅ Found destination URL!", url);
                            window.stop();
                            window.location.replace(url);
                            return true;
                        }
                    } catch (e) {
                        console.error("[Bypass] Boost.ink: Error decoding base64.", e);
                    }
                }
            }
            return false;
        }

        // Try immediately in case the script tag is already parsed
        if (extractAndRedirect()) return;

        // Watch for the script tag to be injected into the DOM
        const observer = new MutationObserver(() => {
            if (extractAndRedirect()) observer.disconnect();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });

        // Safety cleanup after 10 seconds
        setTimeout(() => observer.disconnect(), 10000);
        return;
    }

    // ==========================================
    // LINK2UNLOCK.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('link2unlock.com')) {
        function extractAndRedirect() {
            const appDiv = document.getElementById('app');
            if (!appDiv || !appDiv.dataset.page) return false;

            try {
                // The data-page attribute is HTML-entity encoded (e.g., &quot; instead of ")
                const div = document.createElement('div');
                div.innerHTML = appDiv.dataset.page;
                const data = JSON.parse(div.textContent);

                // The destination URL is stored in the finish array
                if (data.props?.link?.finish?.[0]?.url) {
                    let url = data.props.link.finish[0].url.replace(/\\\//g, '/');
                    console.log("[Bypass] Link2Unlock: ✅ Found destination URL!", url);
                    window.stop();
                    window.location.replace(url);
                    return true;
                }
            } catch (e) {
                console.error("[Bypass] Link2Unlock: Error parsing page data.", e);
            }
            return false;
        }

        // Try immediately in case the DOM is already loaded
        if (extractAndRedirect()) return;

        // Watch for the #app div to be inserted into the DOM
        const observer = new MutationObserver(() => {
            if (extractAndRedirect()) observer.disconnect();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });

        // Safety cleanup after 10 seconds
        setTimeout(() => observer.disconnect(), 10000);
        return;
    }



    // ==========================================
    // SUBFORUNLOCK.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('subforunlock.com')) {
        const slug = window.location.pathname.replace(/^\/|\/$/g, '');
        if (!slug) return;

        async function bypassSubForUnlock() {
            try {
                // The server checks session age. The site waits 30s, we try at 15s first.
                console.log("[Bypass] SubForUnlock: Waiting 15 seconds for session to mature...");
                await sleep(15000);

                let res = await fetch(`https://subforunlock.com/api/v1/custom_url/${slug}`, {
                    credentials: 'include'
                });

                // If 401, wait the remaining 15s to match the site's official 30s delay
                if (res.status === 401) {
                    console.log("[Bypass] SubForUnlock: 401 detected, waiting 15 more seconds and retrying...");
                    await sleep(15000);
                    res = await fetch(`https://subforunlock.com/api/v1/custom_url/${slug}`, {
                        credentials: 'include'
                    });
                }

                if (!res.ok) {
                    return console.error("[Bypass] SubForUnlock: API failed.", res.status);
                }

                const data = await res.json();

                if (data.destination_url) {
                    // Fix escaped slashes (https:\/\/test.com -> https://test.com)
                    const url = data.destination_url.replace(/\\\//g, '/');
                    console.log("[Bypass] SubForUnlock: ✅ Unlocked successfully!", url);
                    window.stop();
                    window.location.replace(url);
                } else {
                    console.error("[Bypass] SubForUnlock: Failed to find destination_url in response.", data);
                }
            } catch (err) {
                console.error("[Bypass] SubForUnlock: Network error.", err);
            }
        }

        bypassSubForUnlock();
        return;
    }
    // ==========================================
    // SUBUNLOCK.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('subunlock.com')) {
        const pathname = window.location.pathname;

        // Step 1: Redirect from /slug to /slug/wait
        if (!pathname.endsWith('/wait')) {
            console.log("[Bypass] SubUnlock: Redirecting to /wait...");
            window.location.replace(window.location.href + '/wait');
            return;
        }

        // Step 2: On /wait page, find the hardcoded destination URL
        function extractAndRedirect() {
            const links = document.querySelectorAll('a');
            for (const a of links) {
                if (a.textContent.includes('Continue to Destination') && a.href && a.href !== '#' && a.href !== window.location.href) {
                    console.log("[Bypass] SubUnlock: ✅ Found destination URL!", a.href);
                    window.stop();
                    window.location.replace(a.href);
                    return true;
                }
            }
            return false;
        }

        if (extractAndRedirect()) return;

        const observer = new MutationObserver(() => {
            if (extractAndRedirect()) observer.disconnect();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });

        // Clean up observer after 10 seconds
        setTimeout(() => observer.disconnect(), 10000);
        return;
    }

    // ==========================================
    // UNLOCKLINK.WEB.ID BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('unlocklink.web.id')) {
        function bypassUnlockLink() {
            for (const s of document.querySelectorAll('script')) {
                const match = s.textContent.match(/const\s+DESTINATION\s*=\s*["']([^"']+)["']/);
                if (match && match[1]) {
                    console.log("[Bypass] UnlockLink: ✅ Found destination URL!", match[1]);
                    window.stop();
                    window.location.replace(match[1]);
                    return true;
                }
            }
            return false;
        }

        // Try immediately in case the script is already in the DOM
        if (bypassUnlockLink()) return;

        // Watch for the script tag to be parsed into the DOM
        const observer = new MutationObserver(() => {
            if (bypassUnlockLink()) observer.disconnect();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });

        // Fallback cleanup after 10 seconds
        setTimeout(() => observer.disconnect(), 10000);
        return;
    }


    // ==========================================
    // SUBTOUNLOCK.COM BYPASS LOGIC (Simplified)
    // ==========================================
    

    // ==========================================
    // SUB2UNLOCK.ID BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('sub2unlock.id')) {
        function extractAndRedirect() {
            const textarea = document.querySelector('textarea[name="link"]');
            if (!textarea || !textarea.value) return false;

            try {
                const data = JSON.parse(textarea.value);
                if (!data.original) return false;

                const params = new URLSearchParams(data.original);
                for (const [key, value] of params.entries()) {
                    if (key.startsWith('lnk')) {
                        // 1. URLSearchParams handles the first layer (e.g. %3D -> =)
                        // 2. atob() decodes the base64 into a URL-encoded string (e.g. https%3A%2F%...)
                        // 3. decodeURIComponent handles the second layer (e.g. %3A -> :)
                        const url = decodeURIComponent(atob(value));

                        if (url && /^https?:\/\//i.test(url)) {
                            console.log("[Bypass] Sub2Unlock.id: ✅ Unlocked successfully!", url);
                            window.stop();
                            window.location.replace(url);
                            return true;
                        }
                    }
                }
            } catch (e) {
                console.error("[Bypass] Sub2Unlock.id: Error parsing link data.", e);
            }
            return false;
        }

        // Try immediately in case the textarea is already in the DOM
        if (extractAndRedirect()) return;

        // Otherwise, watch for it to spawn
        const observer = new MutationObserver(() => {
            if (extractAndRedirect()) observer.disconnect();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });

        // Safety cleanup after 10 seconds
        setTimeout(() => observer.disconnect(), 10000);
        return;
    }

    // ==========================================
    // SUB4UNLOCK.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('sub4unlock.com')) {
        const pathname = window.location.pathname;

        // Step 1: Redirect from /S/slug to /LP/LPD.php?id=slug
        if (pathname.startsWith('/S/')) {
            const slug = pathname.replace(/^\/S\//, '');
            if (slug) {
                console.log("[Bypass] Sub4Unlock: Redirecting to LPD page...");
                window.location.replace(`https://sub4unlock.com/LP/LPD.php?id=${slug}`);
            }
            return;
        }

        // Step 2: On LPD page, extract URL from fileunlock() and redirect
        if (pathname.includes('LPD.php')) {
            function extractAndRedirect() {
                for (const s of document.querySelectorAll('script')) {
                    const match = s.textContent.match(/window\.open\(\s*["']([^"']+)["']\s*,\s*["']_self["']\s*\)/);
                    if (match && match[1]) {
                        console.log("[Bypass] Sub4Unlock: ✅ Found destination URL!", match[1]);
                        window.stop();
                        window.location.replace(match[1]);
                        return true;
                    }
                }
                return false;
            }

            if (extractAndRedirect()) return;

            const observer = new MutationObserver(() => {
                if (extractAndRedirect()) observer.disconnect();
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }
        return;
    }

    // ==========================================
    // BOOSTYLINK.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('boostylink.com')) {
        function bypassBoostylink() {
            const unlockBtn = document.querySelector('.unlock-btn');
            if (!unlockBtn) return;

            const linkId = unlockBtn.dataset.link;
            const snippetId = unlockBtn.dataset.snippet;
            if (!linkId && !snippetId) return;

            // Remove the site's own click handlers from action buttons
            const origBtns = [...document.querySelectorAll('.action-btn[data-linkactionid]')];
            origBtns.forEach(btn => btn.replaceWith(btn.cloneNode(true)));
            const btns = [...document.querySelectorAll('.action-btn[data-linkactionid]')];

            // Prevent resume-pending logic from firing
            localStorage.removeItem('locker_pending_action:' + (linkId || snippetId));

            // No actions → button already enabled
            if (btns.length === 0) {
                unlockBtn.click();
                return;
            }

            (async () => {
                const total = btns.length;
                let doneCount = 0;

                const updateProgress = () => {
                    // setProgress() must be defined elsewhere in your script
                    setProgress(doneCount, total);
                };

                // Fire all actions concurrently
                const tasks = btns.map(async (btn) => {
                    const actionId = btn.dataset.linkactionid;

                    // --- Visual: show spinning state ---
                    setBtnPending(btn);

                    // 1. Start the action
                    await fetch('/api/locker_action_start.php', {
                        method: 'POST',
                        credentials: 'same-origin',
                        body: new URLSearchParams({ link_action_id: actionId })
                    });

                    // 2. Complete (with retries)
                    let ok = false;
                    for (let r = 0; r < 15 && !ok; r++) {
                        const res = await fetch('/api/locker_action_complete.php', {
                            method: 'POST',
                            credentials: 'same-origin',
                            body: new URLSearchParams({ link_action_id: actionId })
                        });
                        const d = await res.json();

                        if (d.status === 'ok') {
                            ok = true;
                            setBtnDone(btn);
                            doneCount++;
                            updateProgress();
                            // No artificial delay here – all actions finish at their own pace
                        } else if (d.status === 'too_early') {
                            const waitLeft = parseInt(d.wait_left, 10) || 2;
                            await sleep(waitLeft * 1000 + 300);
                        } else if (d.status === 'too_fast') {
                            await sleep(4000);
                        } else {
                            // unknown failure → stop retrying this action
                            break;
                        }
                    }

                    if (!ok) {
                        clearBtnPending(btn);
                    }
                    // Note: lockOtherActionButtons is intentionally omitted here –
                    // locking makes no sense when every button is processed in parallel.
                });

                // Wait for all actions (success or failure)
                await Promise.allSettled(tasks);

                // Original script always triggers unlock at this point
                console.log("[Bypass] Boostylink: ✅ All actions settled, triggering unlock...");
                unlockBtn.click();
            })();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bypassBoostylink, { once: true });
        } else {
            bypassBoostylink();
        }
        return;
    }

    // ==========================================
    // SUB2UNLOCK.PRO BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('sub2unlock.pro')) {
        function bypassSub2UnlockPro() {
            const form = document.getElementById('unlockForm');
            if (form) {
                console.log("[Bypass] Sub2Unlock.pro: Submitting existing form...");
                form.submit();
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bypassSub2UnlockPro, { once: true });
        } else {
            bypassSub2UnlockPro();
        }
        return;
    }

    // ==========================================
    // SUBS4UNLOCK.NET BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('subs4unlock.net')) {
        const slug = window.location.pathname.replace(/^\/|\/$/g, '');
        if (slug && !window.location.pathname.includes('unlock-process')) {
            console.log("[Bypass] Subs4Unlock: Redirecting to unlock-process...");
            window.location.replace(`https://subs4unlock.net/unlock-process/${slug}`);
        }
        return;
    }


    // ==========================================
    // HADOSCRIPTS.COM BYPASS LOGIC
    // ==========================================

    else if (hostname.includes('hadoscripts.com')) {
        function findAndRedirect() {
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                const text = script.textContent;
                if (!text) continue;

                // Look for the redirect URL pattern in the unlock button handler
                const match = text.match(/window\.location\.href\s*=\s*["']([^"']+)["']/);
                if (match && match[1] && !match[1].includes('hadoscripts.com/subpages')) {
                    console.log('Found redirect URL:', match[1]);
                    window.location.replace(match[1]);
                    return;
                }
            }

            // Fallback: force complete all steps and click unlock
            const unlockBtn = document.getElementById('unlock');
            if (unlockBtn) {
                const doneOverride = document.createElement('script');
                doneOverride.textContent = `
                done = total;
                update();
                document.getElementById('unlock').disabled = false;
                document.getElementById('unlock').click();
            `;
                document.body.appendChild(doneOverride);
            }
        }

        setTimeout(findAndRedirect, 100);
        setTimeout(findAndRedirect, 500);
    }

    // ==========================================
    // REKONISE.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('rekonise.com')) {
        const slug = window.location.pathname.replace(/^\/|\/$/g, '');
        if (!slug) return;

        async function bypassRekonise() {
            try {
                const getRes = await fetch(`https://api.rekonise.com/social-unlocks/${slug}/`, { credentials: 'include' });
                const { unlock_token: token } = await getRes.json();
                if (!token) return console.error("[Bypass] Rekonise: Failed to acquire token.");

                console.log("[Bypass] Rekonise: Token acquired. Bypassing clock-skew...");

                for (let i = 1; i <= 5; i++) {
                    if (i > 1) await sleep(7000);

                    const res = await fetch(`https://api.rekonise.com/social-unlocks/${slug}/unlock?token=${token}`, { credentials: 'include' });

                    if (res.ok) {
                        const { url } = await res.json();
                        if (url) {
                            console.log(`[Bypass] Rekonise: ✅ Unlocked successfully on attempt ${i}.`);
                            window.stop();
                            window.location.replace(url);
                            return;
                        }
                    }

                    if (res.status !== 403) {
                        return console.error(`[Bypass] Rekonise: ❌ Fatal error (HTTP ${res.status}). Stopping.`);
                    }

                    console.log(`[Bypass] Rekonise: ⏳ Attempt ${i} returned 403. Waiting 7 seconds...`);
                }

                console.error("[Bypass] Rekonise: ❌ Failed after 5 attempts.");
            } catch (err) {
                console.error("[Bypass] Rekonise: Network error.", err);
            }
        }

        bypassRekonise();
        return;
    }

    // ==========================================
    // LINK-UNLOCK.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('link-unlock.com')) {
        const slug = window.location.pathname.split('/').filter(Boolean)[0];
        if (!slug) return;

        async function bypassLinkUnlock() {
            try {
                const getRes = await fetch(`https://api.link-unlock.com/u/${slug}`, { credentials: 'include' });
                const getData = await getRes.json();

                if (!getData.success || !getData.unlock?.steps) {
                    return console.error("[Bypass] Link-Unlock: API GET failed.", getData);
                }

                const stepIds = getData.unlock.steps.map(s => s.id);

                const postRes = await fetch(`https://api.link-unlock.com/u/${slug}/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ steps: stepIds })
                });

                const postData = await postRes.json();

                if (postData.success && postData.destinationUrl) {
                    window.stop();
                    window.location.replace(postData.destinationUrl);
                } else {
                    console.error("[Bypass] Link-Unlock: POST failed or missing URL.", postData);
                }
            } catch (err) {
                console.error("[Bypass] Link-Unlock: Network error.", err);
            }
        }

        bypassLinkUnlock();
        return;
    }

    // ==========================================
    // SUB2UNLOCK.ME BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('sub2unlock.me')) {
        function bypassSub2Unlock() {
            const form = document.getElementById('link-view');
            if (form) {
                console.log("[Bypass] Sub2Unlock: Submitting hidden form to skip steps...");
                form.submit();
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bypassSub2Unlock, { once: true });
        } else {
            bypassSub2Unlock();
        }
        return;
    }

    // ==========================================
    // SUB2UNLOCK.IO / SUB4UNLOCK.IO BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('sub2unlock.io') || hostname.includes('sub4unlock.io')) {
        let bypassed = false;
        function extractLink() {
            if (bypassed) return true;
            const linkBtn = document.querySelector('a.get-link');
            if (!linkBtn) return false;

            const rawHref = linkBtn.getAttribute('href');

            if (rawHref && /^https?:\/\//i.test(rawHref)) {
                console.log("[Bypass] Sub2Unlock.io: ✅ Found destination URL!", rawHref);
                window.stop();
                window.location.replace(rawHref);
                bypassed = true;
                return true;
            }
            return false;
        }

        if (extractLink()) return;

        const observer = new MutationObserver(() => {
            if (extractLink()) observer.disconnect();
        });

        function onReady() {
            if (extractLink()) return;
            if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onReady, { once: true });
        } else {
            onReady();
        }
        return;
    }

    // ==========================================
    // SUB2UNLOCK.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('sub2unlock.com')) {
        const slug = window.location.pathname.replace(/^\/|\/$/g, '');
        if (!slug) return;

        async function bypassSub2UnlockCom() {
            try {
                console.log("[Bypass] Sub2Unlock.com: Fetching unlocked link...");
                const res = await fetch(`https://api.sub2unlock.com/api/sinks/${slug}`, { credentials: 'include' });
                const data = await res.json();

                // Response wraps data inside a "data" object: { data: { unlocked_link: "..." } }
                if (data.data && data.data.unlocked_link) {
                    // Fix escaped slashes (https:\/\/test.com -> https://test.com)
                    let url = data.data.unlocked_link.replace(/\\\//g, '/');
                    console.log("[Bypass] Sub2Unlock.com: ✅ Unlocked successfully!");
                    window.stop();
                    window.location.replace(url);
                } else {
                    console.error("[Bypass] Sub2Unlock.com: Failed to find unlocked_link in response.", data);
                }
            } catch (err) {
                console.error("[Bypass] Sub2Unlock.com: Network error.", err);
            }
        }

        bypassSub2UnlockCom();
        return;
    }

    // ==========================================
    // SUB2GET.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('sub2get.com')) {
        let bypassed = false;

        const observer = new MutationObserver((mutations, obs) => {
            if (bypassed) return;
            // Look for the element the exact millisecond it's parsed into the DOM
            const linkBtn = document.querySelector('a#updateHiddenUnlocks');
            if (linkBtn) {
                const rawHref = linkBtn.getAttribute('href');
                // Ensure it's a real URL and not a dummy link
                if (rawHref && /^https?:\/\//i.test(rawHref)) {
                    bypassed = true;
                    obs.disconnect();
                    console.log("[Bypass] Sub2Get: ✅ Found destination URL!", rawHref);
                    window.stop();
                    window.location.replace(rawHref);
                }
            }
        });

        // Start observing immediately at document-start
        observer.observe(document.documentElement, { childList: true, subtree: true });

        // Fallback just in case the script somehow loads late
        if (document.readyState !== 'loading') {
            const linkBtn = document.querySelector('a#updateHiddenUnlocks');
            if (linkBtn) {
                const rawHref = linkBtn.getAttribute('href');
                if (rawHref && /^https?:\/\//i.test(rawHref)) {
                    observer.disconnect();
                    console.log("[Bypass] Sub2Get: ✅ Found destination URL (fallback)!", rawHref);
                    window.stop();
                    window.location.replace(rawHref);
                }
            }
        }
        return;
    }

    // ==========================================
    // GZENX.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('gzenx.com')) {
        function bypassGzenx() {
            for (const s of document.querySelectorAll('script')) {
                const match = s.textContent.match(/window\.location\.href\s*=\s*["']([^"']+)["']/);
                if (match?.[1]) {
                    window.stop();
                    window.location.replace(match[1]);
                    return;
                }
            }
        }

        document.addEventListener('DOMContentLoaded', bypassGzenx, { once: true });
        return;
    }

    // ==========================================
    // BSTSHRT.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('bstshrt.com')) {
        const regex = /\\?"finalUrl\\?"\s*:\s*\\?"([^"\\]+)"/;

        function extractAndRedirect(raw) {
            const match = raw?.match(regex);
            if (match?.[1]) {
                window.stop();
                window.location.replace(match[1]);
                return true;
            }
            return false;
        }

        function hookPush() {
            if (typeof self.__next_f?.push !== 'function') return false;

            const orig = self.__next_f.push;
            self.__next_f.push = function (chunk) {
                const raw = (Array.isArray(chunk) && typeof chunk[1] === 'string') ? chunk[1] : JSON.stringify(chunk);
                if (!extractAndRedirect(raw)) orig.call(this, chunk);
            };
            return true;
        }

        if (!hookPush()) {
            try {
                Object.defineProperty(self, '__next_f', {
                    configurable: true, enumerable: true,
                    get: () => undefined,
                    set(val) { delete self.__next_f; self.__next_f = val; hookPush(); },
                });
            } catch (_) {}
        }

        function fallback() { extractAndRedirect(document.documentElement.innerHTML); }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fallback, { once: true });
        } else {
            fallback();
        }
        return;
    }

    // ==========================================
    // IBIN.SITE BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('ibin.site')) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (id && !window.location.pathname.includes('gateway.php')) {
            console.log("[Bypass] Ibin: Redirecting to gateway...");
            window.location.replace(`https://ibin.site/lock/gateway.php?id=${id}`);
        }
        else if (window.location.pathname.includes('gateway.php')) {
            console.log("[Bypass] Ibin: On gateway page. Waiting for proceedToTarget() to be defined...");
            const waitForFunction = setInterval(() => {
                if (typeof proceedToTarget === 'function') {
                    clearInterval(waitForFunction);
                    console.log("[Bypass] Ibin: ✅ Function found. Calling proceedToTarget()!");
                    proceedToTarget();
                }
            }, 100);
        }
        return;
    }

    // ==========================================
    // VENUSLOCKSCRIPT.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('venuslockscript.com')) {
        console.log("[Bypass] VenusLockScript: Scanning scripts for targetUrl...");

        const observer = new MutationObserver((mutations, obs) => {
            for (const s of document.querySelectorAll('script')) {
                const match = s.textContent.match(/const\s+targetUrl\s*=\s*["']([^"']+)["']/);
                if (match && match[1]) {
                    obs.disconnect();
                    let url = match[1].replace(/\\\//g, '/');
                    console.log("[Bypass] VenusLockScript: ✅ Found target URL!", url);
                    window.stop();
                    window.location.replace(url);
                    return;
                }
            }
        });

        observer.observe(document.documentElement, { childList: true, subtree: true });

        if (document.readyState !== 'loading') {
            for (const s of document.querySelectorAll('script')) {
                const match = s.textContent.match(/const\s+targetUrl\s*=\s*["']([^"']+)["']/);
                if (match && match[1]) {
                    observer.disconnect();
                    let url = match[1].replace(/\\\//g, '/');
                    console.log("[Bypass] VenusLockScript: ✅ Found target URL (fallback)!", url);
                    window.stop();
                    window.location.replace(url);
                    return;
                }
            }
        }
        return;
    }

    // ==========================================
    // LINKUNLOCKER.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('linkunlocker.com')) {
        if (window.location.pathname.includes('/api/')) return;

        const slug = window.location.pathname.split('/').filter(Boolean)[0];
        if (!slug) return;

        async function bypassLinkUnlocker() {
            try {
                console.log("[Bypass] LinkUnlocker: Fetching token...");

                const postRes = await fetch(`https://linkunlocker.com/api/unlock/${slug}`, {
                    method: 'POST',
                    credentials: 'include'
                });
                const postData = await postRes.json();

                if (!postData.token) {
                    return console.error("[Bypass] LinkUnlocker: Failed to get token from API.", postData);
                }

                console.log("[Bypass] LinkUnlocker: Token acquired. Redirecting to final URL...");
                window.stop();
                window.location.replace(`https://linkunlocker.com/api/unlock/${slug}?t=${encodeURIComponent(postData.token)}`);
            } catch (err) {
                console.error("[Bypass] LinkUnlocker: Network error.", err);
            }
        }

        bypassLinkUnlocker();
        return;
    }

    // ==========================================
    // LINKZY.SPACE BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('linkzy.space')) {
        const shortCode = window.location.pathname.split('/').filter(Boolean)[1];
        if (!shortCode) return;

        async function bypassLinkzy() {
            try {
                console.log("[Bypass] Linkzy: Fetching destination from Supabase...");
                const res = await fetch('https://zjzdbkmhxbwcznwvmfsg.supabase.co/functions/v1/get-public-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ shortCode: shortCode })
                });

                const data = await res.json();

                if (data.destination_url) {
                    console.log("[Bypass] Linkzy: ✅ Unlocked successfully!");
                    window.stop();
                    window.location.replace(data.destination_url);
                } else {
                    console.error("[Bypass] Linkzy: Failed to find destination_url in response.", data);
                }
            } catch (err) {
                console.error("[Bypass] Linkzy: Network error.", err);
            }
        }

        bypassLinkzy();
        return;
    }

    // ==========================================
    // GO.LINKIFY.RU BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('go.linkify.ru')) {
        function handleFirstRedirect() {
            const unlockButton = document.getElementById('unlockgo');
            if (!unlockButton) return null;

            const scripts = document.getElementsByTagName('script');
            for (let script of scripts) {
                if (script.textContent.includes('skipPush') || script.textContent.includes('get/')) {
                    const urlMatch = script.textContent.match(/https?:\/\/go\.linkify\.ru\/get\/\w+/);
                    if (urlMatch) return urlMatch[0];
                }
            }

            const offerLinks = document.querySelectorAll('.offer-link');
            if (offerLinks.length > 0) {
                const href = offerLinks[0].getAttribute('href');
                if (href && href.includes('go.linkify.ru/get/')) {
                    return href;
                }
            }

            return null;
        }

        function handleSecondRedirect() {
            const scripts = document.getElementsByTagName('script');
            for (let script of scripts) {
                const urlMatch = script.textContent.match(/window\.location\.replace\('(https?:\/\/[^']+)'\)/);
                if (urlMatch) {
                    return urlMatch[1];
                }
            }
            return null;
        }

        function bypassRedirects() {
            const secondRedirectUrl = handleSecondRedirect();
            const firstRedirectUrl = handleFirstRedirect();

            const finalUrl = secondRedirectUrl || firstRedirectUrl;
            if (finalUrl) {
                console.log("[Bypass] Linkify: Redirecting to:", finalUrl);
                window.location.href = finalUrl;
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bypassRedirects);
        } else {
            bypassRedirects();
        }
        window.addEventListener('load', bypassRedirects);
        return;
    }

    // ==========================================
    // LINKSTERRA.COM BYPASS LOGIC
    // ==========================================
    else if (hostname.includes('linksterra.com')) {
        const slug = window.location.pathname.replace(/^\/l\//, '');
        if (!slug) return;

        async function bypassLinksterra() {
            try {
                console.log("[Bypass] Linksterra: Fetching redirect URL...");
                const res = await fetch(`https://linksterra.com/api/locker/${slug}`, {
                    credentials: 'include'
                });

                const data = await res.json();

                if (data.redirectUrl) {
                    console.log("[Bypass] Linksterra: ✅ Unlocked successfully!");
                    window.stop();
                    window.location.replace(data.redirectUrl);
                } else {
                    console.error("[Bypass] Linksterra: Failed to find redirectUrl in response.", data);
                }
            } catch (err) {
                console.error("[Bypass] Linksterra: Network error.", err);
            }
        }

        bypassLinksterra();
        return;
    }

})();
