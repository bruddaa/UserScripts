// ==UserScript==
// @name         TikTok User Info
// @namespace    https://github.com/bruddaa/
// @version      2.0
// @description  Additional user info from TikTok profiles
// @author       Brudda
// @icon         https://raw.githubusercontent.com/bruddaa/UserScripts/refs/heads/main/TikTok%20User%20Info/tt_logo.png
// @match        https://www.tiktok.com/@*
// @grant        GM_download
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    'use strict';

    const BOX_ID = 'tm-tiktok-user-info';

    const countryFlags = {
        'AF':'🇦🇫','AL':'🇦🇱','DZ':'🇩🇿','AS':'🇦🇸','AD':'🇦🇩','AO':'🇦🇴','AI':'🇦🇮','AQ':'🇦🇶','AG':'🇦🇬','AR':'🇦🇷',
        'AM':'🇦🇲','AW':'🇦🇼','AU':'🇦🇺','AT':'🇦🇹','AZ':'🇦🇿','BS':'🇧🇸','BH':'🇧🇭','BD':'🇧🇩','BB':'🇧🇧','BY':'🇧🇾',
        'BE':'🇧🇪','BZ':'🇧🇿','BJ':'🇧🇯','BM':'🇧🇲','BT':'🇧🇹','BO':'🇧🇴','BA':'🇧🇦','BW':'🇧🇼','BV':'🇧🇻','BR':'🇧🇷',
        'IO':'🇮🇴','BN':'🇧🇳','BG':'🇧🇬','BF':'🇧🇫','BI':'🇧🇮','CV':'🇨🇻','KH':'🇰🇭','CM':'🇨🇲','CA':'🇨🇦','KY':'🇰🇾',
        'CF':'🇨🇫','TD':'🇹🇩','CL':'🇨🇱','CN':'🇨🇳','CX':'🇨🇽','CC':'🇨🇨','CO':'🇨🇴','KM':'🇰🇲','CG':'🇨🇬','CD':'🇨🇩',
        'CK':'🇨🇰','CR':'🇨🇷','HR':'🇭🇷','CU':'🇨🇺','CW':'🇨🇼','CY':'🇨🇾','CZ':'🇨🇿','DK':'🇩🇰','DJ':'🇩🇯','DM':'🇩🇲',
        'DO':'🇩🇴','TL':'🇹🇱','EC':'🇪🇨','EG':'🇪🇬','SV':'🇸🇻','GQ':'🇬🇶','ER':'🇪🇷','EE':'🇪🇪','SZ':'🇸🇿','ET':'🇪🇹',
        'FK':'🇫🇰','FO':'🇫🇴','FJ':'🇫🇯','FI':'🇫🇮','FR':'🇫🇷','GF':'🇬🇫','PF':'🇵🇫','TF':'🇹🇫','GA':'🇬🇦','GM':'🇬🇲',
        'GE':'🇬🇪','DE':'🇩🇪','GH':'🇬🇭','GI':'🇬🇮','GR':'🇬🇷','GL':'🇬🇱','GD':'🇬🇩','GP':'🇬🇵','GU':'🇬🇺','GT':'🇬🇹',
        'GG':'🇬🇬','GN':'🇬🇳','GW':'🇬🇼','GY':'🇬🇾','HT':'🇭🇹','HM':'🇭🇲','HN':'🇭🇳','HK':'🇭🇰','HU':'🇭🇺','IS':'🇮🇸',
        'IN':'🇮🇳','ID':'🇮🇩','IR':'🇮🇷','IQ':'🇮🇶','IE':'🇮🇪','IM':'🇮🇲','IL':'🇮🇱','IT':'🇮🇹','CI':'🇨🇮','JM':'🇯🇲',
        'JP':'🇯🇵','JE':'🇯🇪','JO':'🇯🇴','KZ':'🇰🇿','KE':'🇰🇪','KI':'🇰🇮','KP':'🇰🇵','KR':'🇰🇷','KW':'🇰🇼','KG':'🇰🇬',
        'LA':'🇱🇦','LV':'🇱🇻','LB':'🇱🇧','LS':'🇱🇸','LR':'🇱🇷','LY':'🇱🇾','LI':'🇱🇮','LT':'🇱🇹','LU':'🇱🇺','MO':'🇲🇴',
        'MG':'🇲🇬','MW':'🇲🇼','MY':'🇲🇾','MV':'🇲🇻','ML':'🇲🇱','MT':'🇲🇹','MH':'🇲🇭','MQ':'🇲🇶','MR':'🇲🇷','MU':'🇲🇺',
        'YT':'🇾🇹','MX':'🇲🇽','FM':'🇫🇲','MD':'🇲🇩','MC':'🇲🇨','MN':'🇲🇳','ME':'🇲🇪','MS':'🇲🇸','MA':'🇲🇦','MZ':'🇲🇿',
        'MM':'🇲🇲','NA':'🇳🇦','NR':'🇳🇷','NP':'🇳🇵','NL':'🇳🇱','NC':'🇳🇨','NZ':'🇳🇿','NI':'🇳🇮','NE':'🇳🇪','NG':'🇳🇬',
        'NU':'🇳🇺','NF':'🇳🇫','MK':'🇲🇰','MP':'🇲🇵','OM':'🇴🇲','PK':'🇵🇰','PW':'🇵🇼','PS':'🇵🇸','PA':'🇵🇦','PG':'🇵🇬',
        'PY':'🇵🇾','PE':'🇵🇪','PH':'🇵🇭','PN':'🇵🇳','PL':'🇵🇱','PT':'🇵🇹','PR':'🇵🇷','QA':'🇶🇦','RE':'🇷🇪','RO':'🇷🇴',
        'RU':'🇷🇺','RW':'🇷🇼','BL':'🇧🇱','SH':'🇸🇭','KN':'🇰🇳','LC':'🇱🇨','MF':'🇲🇫','PM':'🇵🇲','VC':'🇻🇨','WS':'🇼🇸',
        'SM':'🇸🇲','ST':'🇸🇹','SA':'🇸🇦','SN':'🇸🇳','RS':'🇷🇸','SC':'🇸🇨','SL':'🇸🇱','SG':'🇸🇬','SX':'🇸🇽','SK':'🇸🇰',
        'SI':'🇸🇮','SB':'🇸🇧','SO':'🇸🇴','ZA':'🇿🇦','GS':'🇬🇸','SS':'🇸🇸','ES':'🇪🇸','LK':'🇱🇰','SD':'🇸🇩','SR':'🇸🇷',
        'SJ':'🇸🇯','SE':'🇸🇪','CH':'🇨🇭','SY':'🇸🇾','TJ':'🇹🇯','TZ':'🇹🇿','TH':'🇹🇭','TG':'🇹🇬','TK':'🇹🇰','TO':'🇹🇴',
        'TT':'🇹🇹','TN':'🇹🇳','TR':'🇹🇷','TM':'🇹🇲','TC':'🇹🇨','TV':'🇹🇻','UG':'🇺🇬','UA':'🇺🇦','AE':'🇦🇪','GB':'🇬🇧',
        'UM':'🇺🇲','US':'🇺🇸','UY':'🇺🇾','UZ':'🇺🇿','VU':'🇻🇺','VE':'🇻🇪','VN':'🇻🇳','VG':'🇻🇬','VI':'🇻🇮','WF':'🇼🇫',
        'EH':'🇪🇭','YE':'🇾🇪','ZM':'🇿🇲','ZW':'🇿🇼'
    };

    const languageNames = {
        'aa':'Afar','ab':'Abkhazian','af':'Afrikaans','ak':'Akan','sq':'Albanian','am':'Amharic','ar':'Arabic',
        'an':'Aragonese','hy':'Armenian','as':'Assamese','av':'Avaric','ae':'Avestan','ay':'Aymara','az':'Azerbaijani',
        'ba':'Bashkir','bm':'Bambara','bn':'Bengali','bo':'Tibetan','bs':'Bosnian','br':'Breton','bg':'Bulgarian',
        'my':'Burmese','be':'Belarusian','eu':'Basque','ca':'Catalan','ch':'Chamorro','ce':'Chechen','ny':'Chichewa',
        'zh':'Chinese','cu':'Church Slavic','cv':'Chuvash','kw':'Cornish','co':'Corsican','cr':'Cree','hr':'Croatian',
        'cs':'Czech','da':'Danish','de':'German','dv':'Divehi','nl':'Dutch','dz':'Dzongkha','en':'English',
        'eo':'Esperanto','et':'Estonian','ee':'Ewe','fo':'Faroese','fj':'Fijian','fi':'Finnish','fr':'French',
        'fy':'Western Frisian','ff':'Fulah','gd':'Scottish Gaelic','ga':'Irish','gl':'Galician','gv':'Manx',
        'el':'Greek','gn':'Guarani','gu':'Gujarati','ht':'Haitian','ha':'Hausa','he':'Hebrew','hz':'Herero',
        'hi':'Hindi','ho':'Hiri Motu','hu':'Hungarian','ia':'Interlingua','id':'Indonesian','ie':'Interlingue',
        'ig':'Igbo','ii':'Sichuan Yi','iu':'Inuktitut','ik':'Inupiaq','io':'Ido','is':'Icelandic','it':'Italian',
        'ja':'Japanese','jv':'Javanese','kl':'Kalaallisut','kn':'Kannada','kr':'Kanuri','ks':'Kashmiri',
        'kk':'Kazakh','km':'Khmer','ki':'Kikuyu','rw':'Kinyarwanda','ky':'Kyrgyz','kv':'Komi','kg':'Kongo',
        'ko':'Korean','kj':'Kuanyama','la':'Latin','lb':'Luxembourgish','lg':'Ganda','li':'Limburgish',
        'ln':'Lingala','lo':'Lao','lt':'Lithuanian','lu':'Luba-Katanga','lv':'Latvian','mk':'Macedonian',
        'mg':'Malagasy','ms':'Malay','ml':'Malayalam','mt':'Maltese','mi':'Maori','mr':'Marathi','mh':'Marshallese',
        'mn':'Mongolian','na':'Nauru','nv':'Navajo','nr':'Southern Ndebele','nd':'Northern Ndebele','ng':'Ndonga',
        'ne':'Nepali','nn':'Norwegian Nynorsk','nb':'Norwegian Bokmål','no':'Norwegian','oc':'Occitan','oj':'Ojibwa',
        'or':'Oriya','om':'Oromo','pa':'Punjabi','pi':'Pali','fa':'Persian','pl':'Polish','ps':'Pashto',
        'pt':'Portuguese','qu':'Quechua','rm':'Romansh','ro':'Romanian','rn':'Rundi','ru':'Russian','sg':'Sango',
        'sa':'Sanskrit','si':'Sinhalese','sk':'Slovak','sl':'Slovenian','se':'Northern Sami','sm':'Samoan',
        'sn':'Shona','sd':'Sindhi','so':'Somali','st':'Southern Sotho','es':'Spanish','sc':'Sardinian',
        'sr':'Serbian','ss':'Swati','su':'Sundanese','sw':'Swahili','sv':'Swedish','ty':'Tahitian','ta':'Tamil',
        'tt':'Tatar','te':'Telugu','tg':'Tajik','th':'Thai','ti':'Tigrinya','to':'Tonga','tn':'Tswana',
        'ts':'Tsonga','tk':'Turkmen','tr':'Turkish','tw':'Twi','ug':'Uighur','uk':'Ukrainian','ur':'Urdu',
        'uz':'Uzbek','ve':'Venda','vi':'Vietnamese','vo':'Volapük','wa':'Walloon','cy':'Welsh','wo':'Wolof',
        'xh':'Xhosa','yi':'Yiddish','yo':'Yoruba','za':'Zhuang','zu':'Zulu'
    };

    // ── Helpers ──────────────────────────────────────────────

    function flag(cc) { return countryFlags[cc] || ''; }

    function lang(code) {
        if (!code) return 'N/A';
        const n = languageNames[code.toLowerCase()];
        return n ? code + ' (' + n + ')' : code;
    }

    function ts(unix) {
        return unix ? new Date(unix * 1000).toLocaleString() : 'N/A';
    }

    function bool(v) {
        return typeof v !== 'undefined' ? (v ? 'Yes' : 'No') : 'N/A';
    }

    // ── Extract user data from the SSR JSON blob ─────────────

    function extractUser() {
        const tag = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__');
        if (!tag) return null;
        try {
            const c = tag.textContent;
            const obj = JSON.parse(c.substring(c.indexOf('{'), c.lastIndexOf('}') + 1));
            const scope = obj.__DEFAULT_SCOPE__ || obj;
            const detail = scope['webapp.user-detail'];
            if (!detail || !detail.userInfo || !detail.userInfo.user) return null;
            return {
                user: detail.userInfo.user,
                stats: detail.userInfo.stats || detail.userInfo.statsV2
            };
        } catch (e) {
            console.error('[TT UserInfo] Parse error:', e);
            return null;
        }
    }

    // ── Find the right DOM node to insert after ──────────────

    function findAnchor() {
        // 1) The <h2 data-e2e="user-bio"> lives inside the text
        //    container that also holds the share links.  Its
        //    parent is the container we want to insert after.
        const bio = document.querySelector('h2[data-e2e="user-bio"]');
        if (bio && bio.parentElement) return bio.parentElement;

        // 2) Fallback: match the semantic class fragment
        const el = document.querySelector('[class*="CreatorPageHeaderTextContainer"]');
        if (el) return el;

        // 3) Older layout fallback
        const old = document.querySelector('[class*="DivShareTitleContainer"]');
        if (old) return old;

        return null;
    }

    // ── Build the info box ───────────────────────────────────

    function buildBox(user, stats) {
        const hasAvatar = !!user.avatarLarger;
        const dlBtn = hasAvatar
            ? '<button id="tm-dl-pfp" style="background:#FE2C55;color:#fff;border:none;'
            + 'border-radius:4px;padding:6px 12px;font-size:13px;cursor:pointer;'
            + 'font-weight:500;font-family:inherit;">Download Profile Pic</button>'
            : '';

        const rows = [
            ['User ID',            user.id || 'N/A'],
            ['Region',             user.region ? user.region + ' ' + flag(user.region) : 'N/A'],
            ['Language',           lang(user.language)],
            ['Account Created',    ts(user.createTime)],
            ['Friend Count',       stats && stats.friendCount != null ? stats.friendCount : 'N/A'],
            ['Is Seller',          bool(user.ttSeller)],
            ['Is Organization',    bool(user.isOrganization)],
            ['Username Modified',  ts(user.uniqueIdModifyTime)],
            ['Nickname Modified',  ts(user.nickNameModifyTime)]
        ];

        const half = Math.ceil(rows.length / 2);
        const left = rows.slice(0, half);
        const right = rows.slice(half);

        function col(items) {
            return '<ul style="list-style:none;padding:0;margin:0;">'
                + items.map(function (r) {
                    return '<li style="margin-bottom:4px;"><strong>' + r[0]
                        + ':</strong> ' + r[1] + '</li>';
                }).join('')
                + '</ul>';
        }

        return '<div id="' + BOX_ID + '" style="'
            + 'margin-top:12px;padding:14px 16px 42px;'
            + 'background:#f8f8f8;border-radius:8px;'
            + 'font-family:Proxima Nova,Arial,sans-serif;font-size:14px;color:#161823;'
            + 'border:1px solid #e3e3e3;position:relative;'
            + '">'
            + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">'
            + '<h3 style="margin:0;font-size:16px;font-weight:700;">Additional User Information</h3>'
            + dlBtn
            + '</div>'
            + '<div style="display:flex;gap:24px;">'
            + '<div style="flex:1;">' + col(left) + '</div>'
            + '<div style="flex:1;">' + col(right) + '</div>'
            + '</div>'
            + '<div style="position:absolute;bottom:10px;left:0;right:0;text-align:center;'
            + 'color:#808080;font-size:12px;display:flex;justify-content:center;'
            + 'align-items:center;gap:8px;">'
            + '<span>Made by Brudda</span>'
            + '<img src="https://raw.githubusercontent.com/bruddaa/UserScripts/refs/heads/main/'
            + 'TikTok%20User%20Info/tt_logo.png" alt="" style="height:20px;vertical-align:middle;">'
            + '</div>'
            + '</div>';
    }

    // ── Insert / refresh the info box ────────────────────────

    function render() {
        // Always remove a previous box first
        var old = document.getElementById(BOX_ID);
        if (old) old.remove();

        // Only run on profile pages
        if (!location.pathname.match(/^\/@[^/]+/)) return;

        var data = extractUser();
        if (!data) return;

        var anchor = findAnchor();
        if (!anchor) return;

        anchor.insertAdjacentHTML('afterend', buildBox(data.user, data.stats));

        // Wire up the download button
        var btn = document.getElementById('tm-dl-pfp');
        if (btn && data.user.avatarLarger) {
            var username = location.pathname.split('@')[1];
            if (username) username = username.split(/[/?#]/)[0];
            else username = 'user';

            btn.addEventListener('click', function () {
                GM_download({
                    url: data.user.avatarLarger,
                    name: 'tiktok_profile_' + username + '_' + Date.now() + '.jpg',
                    onload: function () { console.log('[TT UserInfo] PFP downloaded'); },
                    onerror: function (e) { console.error('[TT UserInfo] Download failed:', e); }
                });
            });
        }

        GM_setValue('lastUsername', data.user.uniqueId || '');
    }

    // ── Detect SPA navigation ────────────────────────────────
    // TikTok is a single-page app — clicking a profile doesn't
    // trigger a full page load.  We watch the URL via a
    // MutationObserver so we can re-render on every navigation.

    var prevHref = location.href;

    new MutationObserver(function () {
        if (location.href === prevHref) return;
        prevHref = location.href;

        if (location.pathname.match(/^\/@[^/]+/)) {
            setTimeout(render, 1500);
        }
    }).observe(document.documentElement, { childList: true, subtree: true });

    function boot() {
        if (!document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__')) {
            setTimeout(boot, 300);
            return;
        }
        render();
        var tries = 0;
        var id = setInterval(function () {
            render();
            if (++tries >= 8 || document.getElementById(BOX_ID)) clearInterval(id);
        }, 500);
    }

    if (document.body) boot();
    else document.addEventListener('DOMContentLoaded', boot);

})();
