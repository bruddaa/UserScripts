// ==UserScript==
// @name         Linkify Bypasser
// @namespace    https://github.com/bruddaa/
// @version      1.0
// @description  Automatically bypasses all "go.linkify.ru" redirects to go directly to the final URL
// @author       Brudda
// @icon         https://raw.githubusercontent.com/bruddaa/UserScripts/refs/heads/main/Linkify%20Bypasser/lb_logo.png
// @match        *://go.linkify.ru/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

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
            if (href.includes('go.linkify.ru/get/')) {
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
            console.log("Redirecting to:", finalUrl);
            window.location.href = finalUrl;
        } else {
            console.error("No redirect URL found.");
        }
    }

    bypassRedirects();
    window.addEventListener('load', bypassRedirects);
})();
