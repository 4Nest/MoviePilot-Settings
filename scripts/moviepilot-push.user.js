// ==UserScript==
// @name         MoviePilot 种子推送下载
// @namespace    http://tampermonkey.net/
// @version      4.5.3
// @description  在各大 PT 与动漫站点详情页自动提取种子名称与纯净副标题，发送至 MoviePilot 识别并一键推送下载、查询入库/播放直达、按季订阅与高级参数推送。适配 MoviePilot V2/V3，兼容桌面与 iOS Safari，支持自适应深浅色现代 UI 与纯矢量图标。
// @author       yubanmeiqin9048 & 虚静道长 & NEST
// @match        https://*/details*.php*
// @match        https://totheglory.im/t/*
// @match        https://bangumi.moe/torrent/*
// @match        https://*.acgnx.se/show-*
// @match        https://*.dmhy.org/topics/view/*
// @match        https://nyaa.si/view/*
// @match        https://sukebei.nyaa.si/view/*
// @match        https://mikanani.me/Home/Episode/*
// @match        https://*.skyey2.com/*
// @match        https://*.m-team.cc/*
// @match        https://*.m-team.io/*
// @match        https://sunnypt.top/*
// @match        https://anibt.net/*
// @exclude      *://*/userdetails.php*
// @exclude      *://*/torrents.php*
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM.getValue
// @grant        GM_setValue
// @grant        GM.setValue
// @grant        GM_deleteValue
// @grant        GM.deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM.registerMenuCommand
// @connect      *
// @license      MIT
// ==/UserScript==

function safeAddStyle(cssText) {
  const injectFallbackStyle = () => {
    if (document.getElementById('mp-injected-style')) return;
    const style = document.createElement('style');
    style.id = 'mp-injected-style';
    style.type = 'text/css';
    style.textContent = cssText;
    const target = document.head || document.documentElement || document.body;
    if (target) {
      target.appendChild(style);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('mp-injected-style')) {
          (document.head || document.documentElement || document.body)?.appendChild(style);
        }
      }, { once: true });
    }
  };
  try {
    if (typeof GM_addStyle === 'function') {
      GM_addStyle(cssText);
      return;
    }
  } catch (e) {}
  injectFallbackStyle();
}

const MP_STYLE_TEXT =
  '  :root {\n    --mp-bg: #ffffff;\n    --mp-surface: #f8fafc;\n    --mp-surface-2: #f1f5f9;\n    --mp-surface-hover: #e2e8f0;\n    --mp-border: #e2e8f0;\n    --mp-border-strong: #cbd5e1;\n    --mp-text: #0f172a;\n    --mp-text-muted: #64748b;\n    --mp-primary: #2563eb;\n    --mp-primary-hover: #1d4ed8;\n    --mp-primary-soft: rgba(37, 99, 235, 0.1);\n    --mp-success: #16a34a;\n    --mp-success-hover: #15803d;\n    --mp-success-soft: rgba(22, 163, 74, 0.12);\n    --mp-danger: #dc2626;\n    --mp-danger-hover: #b91c1c;\n    --mp-danger-soft: rgba(220, 38, 38, 0.1);\n    --mp-warning: #d97706;\n    --mp-warning-soft: rgba(217, 119, 6, 0.12);\n    --mp-info-soft: rgba(14, 165, 233, 0.12);\n    --mp-info-text: #0369a1;\n    --mp-shadow: 0 22px 50px -12px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(15, 23, 42, 0.06);\n    --mp-toast-bg: rgba(255, 255, 255, 0.92);\n    --mp-toast-shadow: 0 16px 36px -8px rgba(15, 23, 42, 0.18), 0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.06);\n    --mp-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif;\n  }\n\n  .mp-dark {\n    --mp-bg: #151921;\n    --mp-surface: #1d232d;\n    --mp-surface-2: #252c38;\n    --mp-surface-hover: #2d3644;\n    --mp-border: #2e3746;\n    --mp-border-strong: #3f4a5c;\n    --mp-text: #e6edf3;\n    --mp-text-muted: #93a1b5;\n    --mp-primary: #3b82f6;\n    --mp-primary-hover: #60a5fa;\n    --mp-primary-soft: rgba(59, 130, 246, 0.16);\n    --mp-success: #22c55e;\n    --mp-success-hover: #16a34a;\n    --mp-success-soft: rgba(34, 197, 94, 0.18);\n    --mp-danger: #ef4444;\n    --mp-danger-hover: #dc2626;\n    --mp-danger-soft: rgba(239, 68, 68, 0.16);\n    --mp-warning: #f59e0b;\n    --mp-warning-soft: rgba(245, 158, 11, 0.18);\n    --mp-info-soft: rgba(56, 189, 248, 0.16);\n    --mp-info-text: #7dd3fc;\n    --mp-shadow: 0 24px 54px -12px rgba(0, 0, 0, 0.68), 0 0 0 1px rgba(255, 255, 255, 0.08);\n    --mp-toast-bg: rgba(21, 25, 33, 0.92);\n    --mp-toast-shadow: 0 18px 40px -8px rgba(0, 0, 0, 0.65), 0 4px 14px -2px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.09);\n  }\n\n  /* 详情页内联bar容器与分组 */\n  .mp-inline-bar {\n    display: flex;\n    flex-wrap: wrap;\n    align-items: center;\n    gap: 6px;\n    font-family: var(--mp-font);\n    line-height: 1.35;\n    padding: 4px 0;\n    color: var(--mp-text);\n    box-sizing: border-box;\n  }\n  .mp-group {\n    display: inline-flex;\n    flex-wrap: wrap;\n    align-items: center;\n    gap: 6px;\n    box-sizing: border-box;\n  }\n  .mp-group-media,\n  .mp-group-specs,\n  .mp-group-status,\n  .mp-group-actions {\n    gap: 6px;\n  }\n  .mp-status-slot {\n    display: inline-flex;\n    align-items: center;\n  }\n\n  .mp-mteam-panel {\n    margin-top: 10px;\n    padding: 10px 12px;\n    border-radius: 10px;\n    border: 1px solid var(--mp-border);\n    background: var(--mp-surface);\n    font-family: var(--mp-font);\n    box-sizing: border-box;\n  }\n  .mp-sunny-panel {\n    width: fit-content;\n    max-width: 100%;\n    margin: 12px auto 0;\n  }\n  .mp-sunny-panel .mp-inline-bar {\n    justify-content: center;\n  }\n  .mp-mteam-title {\n    font-size: 11.5px;\n    color: var(--mp-text-muted);\n    margin-bottom: 6px;\n    font-weight: 700;\n    letter-spacing: 0.4px;\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    text-transform: uppercase;\n  }\n  .mp-mteam-tags {\n    display: flex;\n    flex-wrap: wrap;\n    align-items: center;\n    gap: 8px;\n    line-height: 1.35;\n  }\n\n  .mp-anime-panel {\n    margin: 10px 0;\n    padding: 10px 14px;\n    border-radius: 10px;\n    border: 1px solid var(--mp-border);\n    background: var(--mp-surface);\n    font-family: var(--mp-font);\n    box-sizing: border-box;\n  }\n  .mp-anime-header {\n    font-size: 11.5px;\n    font-weight: 700;\n    color: var(--mp-text-muted);\n    margin-bottom: 6px;\n    letter-spacing: 0.3px;\n  }\n\n  /* 语义分级徽章 */\n  .mp-tag {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    gap: 5px;\n    height: 26px;\n    padding: 0 9px;\n    border-radius: 6px;\n    font-size: 12px;\n    font-weight: 500;\n    line-height: 1;\n    white-space: nowrap;\n    box-sizing: border-box;\n    border: 1px solid transparent;\n    transition: transform 0.14s ease, filter 0.14s ease, background-color 0.14s ease, border-color 0.14s ease;\n    text-decoration: none;\n    font-family: var(--mp-font);\n    margin: 0;\n    vertical-align: middle;\n  }\n  .mp-tag-link {\n    text-decoration: none !important;\n    cursor: pointer;\n  }\n  .mp-tag-link:hover {\n    filter: brightness(0.95);\n    transform: translateY(-0.5px);\n  }\n  .mp-dark .mp-tag-link:hover {\n    filter: brightness(1.14);\n  }\n\n  /* 1) 核心媒体身份 */\n  .mp-tag-type {\n    background: var(--mp-primary-soft);\n    color: var(--mp-primary);\n    border-color: rgba(37, 99, 235, 0.25);\n    font-weight: 600;\n  }\n  .mp-tag-title {\n    background: var(--mp-surface-2);\n    color: var(--mp-text);\n    border-color: var(--mp-border-strong);\n    font-size: 12px;\n    font-weight: 700;\n    padding: 0 10px;\n  }\n  .mp-tag-year {\n    background: var(--mp-surface-2);\n    color: var(--mp-text-muted);\n    border-color: var(--mp-border);\n    font-weight: 600;\n  }\n  .mp-tag-season {\n    background: var(--mp-warning-soft);\n    color: var(--mp-warning);\n    border-color: rgba(217, 119, 6, 0.28);\n    font-weight: 600;\n  }\n  .mp-tag-tmdb {\n    background: var(--mp-surface-2);\n    color: var(--mp-text);\n    border-color: var(--mp-border-strong);\n    font-weight: 600;\n  }\n  .mp-tag-tmdb:hover {\n    border-color: var(--mp-primary);\n    color: var(--mp-primary);\n  }\n\n  /* 2) 低饱和技术规格 */\n  .mp-tag-spec {\n    height: 26px;\n    padding: 0 9px;\n    font-size: 12px;\n    background: var(--mp-surface);\n    color: var(--mp-text-muted);\n    border-color: var(--mp-border);\n    font-weight: 500;\n  }\n  .mp-tag-team {\n    height: 26px;\n    padding: 0 9px;\n    font-size: 12px;\n    background: rgba(99, 102, 241, 0.10);\n    color: #4338ca;\n    border-color: rgba(99, 102, 241, 0.24);\n    font-weight: 600;\n  }\n  .mp-dark .mp-tag-team {\n    background: rgba(129, 140, 248, 0.16);\n    color: #a5b4fc;\n    border-color: rgba(129, 140, 248, 0.30);\n  }\n\n  /* 3) 状态胶囊 */\n  .mp-tag-loading {\n    background: var(--mp-surface);\n    color: var(--mp-text-muted);\n    border-color: var(--mp-border);\n    border-style: dashed;\n    min-width: 86px;\n  }\n  .mp-tag-exists {\n    background: var(--mp-success-soft);\n    color: var(--mp-success);\n    border-color: rgba(22, 163, 74, 0.3);\n    font-weight: 600;\n    min-width: 78px;\n  }\n  .mp-tag-missing {\n    background: var(--mp-surface-2);\n    color: var(--mp-text-muted);\n    border-color: var(--mp-border);\n    min-width: 78px;\n  }\n  .mp-tag-sub-on {\n    background: var(--mp-info-soft);\n    color: var(--mp-info-text);\n    border-color: rgba(14, 165, 233, 0.3);\n    font-weight: 600;\n  }\n  .mp-tag-sub-btn {\n    background: var(--mp-primary-soft);\n    color: var(--mp-primary);\n    border-color: rgba(37, 99, 235, 0.3);\n    cursor: pointer;\n    font-weight: 600;\n  }\n  .mp-tag-sub-btn:hover {\n    background: var(--mp-primary);\n    color: #ffffff;\n    border-color: var(--mp-primary);\n  }\n  .mp-tag-sub-busy {\n    background: var(--mp-warning-soft);\n    color: var(--mp-warning);\n    border-color: rgba(217, 119, 6, 0.3);\n  }\n  .mp-tag-sub-err {\n    background: var(--mp-danger-soft);\n    color: var(--mp-danger);\n    border-color: rgba(220, 38, 38, 0.32);\n    cursor: pointer;\n    font-weight: 600;\n  }\n\n  /* 按钮与组合推送按钮 */\n  .mp-btn-split {\n    display: inline-flex;\n    align-items: center;\n    height: 26px;\n    box-sizing: border-box;\n    border-radius: 6px;\n    overflow: hidden;\n    box-shadow: none;\n    vertical-align: middle;\n  }\n  .mp-btn-split .mp-btn,\n  .mp-btn-split .mp-tag {\n    border-radius: 0;\n    box-shadow: none;\n    border: none;\n    height: 100%;\n    margin: 0;\n  }\n  .mp-btn-split.mp-btn-split-sub {\n    border: 1px solid rgba(37, 99, 235, 0.3);\n    background: var(--mp-primary-soft);\n  }\n  .mp-btn-split.mp-btn-split-sub-err {\n    border: 1px solid rgba(220, 38, 38, 0.32);\n    background: var(--mp-danger-soft);\n  }\n  .mp-btn-split .mp-btn-split-care,\n  .mp-btn-split .mp-tag-split-care {\n    padding: 0 6px;\n    border-left: 1px solid rgba(255, 255, 255, 0.24);\n    font-size: 11px;\n  }\n  .mp-btn-split .mp-btn-secondary.mp-btn-split-care {\n    border-left: 1px solid var(--mp-border);\n  }\n  .mp-btn-split .mp-tag-sub-btn.mp-tag-split-care {\n    border-left: 1px solid rgba(37, 99, 235, 0.24);\n  }\n  .mp-btn-split .mp-tag-sub-err.mp-tag-split-care {\n    border-left: 1px solid rgba(220, 38, 38, 0.24);\n  }\n  .mp-btn {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    gap: 5px;\n    height: 26px;\n    padding: 0 10px;\n    border-radius: 6px;\n    font-size: 12px;\n    font-weight: 600;\n    line-height: 1;\n    border: 1px solid transparent;\n    cursor: pointer;\n    font-family: var(--mp-font);\n    transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.12s ease, opacity 0.15s ease, color 0.15s ease;\n    box-sizing: border-box;\n    white-space: nowrap;\n    margin: 0;\n    vertical-align: middle;\n    text-transform: none;\n    letter-spacing: normal;\n  }\n  .mp-btn:active:not(:disabled) {\n    transform: translateY(0.5px);\n  }\n  .mp-btn:disabled {\n    opacity: 0.6;\n    cursor: not-allowed;\n  }\n  .mp-btn-primary {\n    background: var(--mp-primary);\n    color: #ffffff;\n  }\n  .mp-btn-primary:hover:not(:disabled) {\n    background: var(--mp-primary-hover);\n  }\n  .mp-btn-success {\n    background: var(--mp-success);\n    color: #ffffff;\n  }\n  .mp-btn-success:hover:not(:disabled) {\n    background: var(--mp-success-hover);\n  }\n  .mp-btn-danger {\n    background: var(--mp-danger);\n    color: #ffffff;\n  }\n  .mp-btn-danger:hover:not(:disabled) {\n    background: var(--mp-danger-hover);\n  }\n  .mp-btn-secondary {\n    background: var(--mp-surface);\n    color: var(--mp-text);\n    border-color: var(--mp-border-strong);\n  }\n  .mp-btn-secondary:hover:not(:disabled) {\n    background: var(--mp-surface-hover);\n    border-color: var(--mp-primary);\n    color: var(--mp-primary);\n  }\n  .mp-btn-icon {\n    width: 26px;\n    padding: 0;\n    background: var(--mp-surface);\n    color: var(--mp-text-muted);\n    border-color: var(--mp-border-strong);\n    font-size: 13px;\n  }\n  .mp-btn-icon:hover:not(:disabled) {\n    background: var(--mp-surface-hover);\n    color: var(--mp-text);\n    border-color: var(--mp-text-muted);\n  }\n  .mp-btn-sm {\n    height: 24px;\n    padding: 0 8px;\n    font-size: 11.5px;\n  }\n  .mp-btn-lg {\n    height: 36px;\n    padding: 0 16px;\n    font-size: 13px;\n    border-radius: 8px;\n  }\n\n  /* 状态文字 & 加载旋转 */\n  .mp-status-text {\n    display: inline-flex;\n    align-items: center;\n    gap: 6px;\n    font-size: 12px;\n    color: var(--mp-text-muted);\n    font-family: var(--mp-font);\n  }\n  .mp-status-error {\n    color: var(--mp-danger);\n    font-weight: 600;\n  }\n  .mp-status-link {\n    color: var(--mp-primary);\n    text-decoration: underline;\n    cursor: pointer;\n    font-weight: 600;\n    background: none;\n    border: none;\n    padding: 0 3px;\n    font-size: 12px;\n    font-family: var(--mp-font);\n  }\n  .mp-spinner {\n    width: 12px;\n    height: 12px;\n    border: 2px solid currentColor;\n    border-right-color: transparent;\n    border-radius: 50%;\n    display: inline-block;\n    animation: mp-spin 0.7s linear infinite;\n    flex-shrink: 0;\n  }\n  @keyframes mp-spin {\n    to { transform: rotate(360deg); }\n  }\n  @keyframes mp-fade-in {\n    from { opacity: 0; transform: translateY(-6px) scale(0.985); }\n    to { opacity: 1; transform: translateY(0) scale(1); }\n  }\n  @keyframes mp-toast-in {\n    from { opacity: 0; transform: translate3d(0, 14px, 0) scale(0.96); }\n    to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }\n  }\n  @keyframes mp-toast-progress {\n    from { transform: scaleX(1); }\n    to { transform: scaleX(0); }\n  }\n\n  /* 弹窗系统 */\n  .mp-modal {\n    position: fixed;\n    inset: 0;\n    z-index: 2147483642;\n    background-color: rgba(15, 23, 42, 0.58);\n    backdrop-filter: blur(5px);\n    -webkit-backdrop-filter: blur(5px);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    padding: 16px;\n    box-sizing: border-box;\n    font-family: var(--mp-font);\n  }\n  .mp-modal-content {\n    background-color: var(--mp-bg);\n    color: var(--mp-text);\n    border: 1px solid var(--mp-border);\n    border-radius: 14px;\n    width: 100%;\n    max-width: 540px;\n    max-height: 88vh;\n    display: flex;\n    flex-direction: column;\n    box-shadow: var(--mp-shadow);\n    animation: mp-fade-in 0.18s ease-out;\n    overflow: hidden;\n    box-sizing: border-box;\n  }\n  .mp-modal-content.mp-modal-wide {\n    max-width: 680px;\n  }\n  .mp-modal-header {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 14px 20px;\n    border-bottom: 1px solid var(--mp-border);\n    background: var(--mp-surface);\n  }\n  .mp-modal-title {\n    margin: 0;\n    font-size: 15px;\n    font-weight: 700;\n    color: var(--mp-text);\n    display: flex;\n    align-items: center;\n    gap: 8px;\n  }\n  .mp-close {\n    width: 28px;\n    height: 28px;\n    border-radius: 7px;\n    border: none;\n    background: transparent;\n    color: var(--mp-text-muted);\n    font-size: 20px;\n    line-height: 1;\n    cursor: pointer;\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    transition: background-color 0.15s ease, color 0.15s ease;\n  }\n  .mp-close:hover {\n    background: var(--mp-surface-hover);\n    color: var(--mp-text);\n  }\n  .mp-modal-body {\n    padding: 18px 20px;\n    overflow-y: auto;\n    box-sizing: border-box;\n  }\n  .mp-modal-desc {\n    margin: 0 0 14px;\n    font-size: 12.5px;\n    color: var(--mp-text-muted);\n    line-height: 1.5;\n  }\n\n  .mp-form-grid {\n    display: grid;\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n    gap: 12px;\n  }\n  @media (max-width: 540px) {\n    .mp-form-grid { grid-template-columns: 1fr; }\n  }\n\n  .mp-input-group {\n    margin-bottom: 13px;\n  }\n  .mp-form-grid .mp-input-group {\n    margin-bottom: 0;\n  }\n  .mp-input-group label {\n    display: block;\n    margin-bottom: 5px;\n    font-weight: 600;\n    font-size: 12.5px;\n    color: var(--mp-text);\n  }\n  .mp-input-wrap {\n    position: relative;\n    display: flex;\n    align-items: center;\n  }\n  .mp-input, .mp-select, .mp-textarea {\n    width: 100%;\n    height: 36px;\n    padding: 0 11px;\n    border: 1px solid var(--mp-border-strong);\n    border-radius: 8px;\n    background: var(--mp-bg);\n    color: var(--mp-text);\n    font-size: 13px;\n    box-sizing: border-box;\n    outline: none;\n    transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;\n    font-family: var(--mp-font);\n    margin: 0;\n  }\n  .mp-select {\n    cursor: pointer;\n    appearance: none;\n    -webkit-appearance: none;\n    padding-right: 30px;\n  }\n  .mp-select.mp-select-native-hidden {\n    position: absolute !important;\n    opacity: 0 !important;\n    pointer-events: none !important;\n    width: 1px !important;\n    height: 1px !important;\n    margin: 0 !important;\n    padding: 0 !important;\n  }\n  .mp-textarea {\n    height: auto;\n    min-height: 60px;\n    padding: 8px 11px;\n    resize: vertical;\n    line-height: 1.45;\n  }\n  .mp-input:focus, .mp-select:focus, .mp-textarea:focus {\n    border-color: var(--mp-primary);\n    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);\n  }\n\n  /* 统一风格自定义下拉框 */\n  .mp-cselect {\n    position: relative;\n    width: 100%;\n    font-family: var(--mp-font);\n    box-sizing: border-box;\n  }\n  .mp-cselect-trigger {\n    width: 100%;\n    height: 36px;\n    padding: 0 10px 0 11px;\n    border: 1px solid var(--mp-border-strong);\n    border-radius: 8px;\n    background: var(--mp-bg);\n    color: var(--mp-text);\n    font-size: 13px;\n    font-family: var(--mp-font);\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 8px;\n    cursor: pointer;\n    text-align: left;\n    box-sizing: border-box;\n    transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;\n    outline: none;\n    margin: 0;\n  }\n  .mp-cselect-trigger:hover:not(:disabled) {\n    border-color: var(--mp-primary);\n    background: var(--mp-surface);\n  }\n  .mp-cselect.open .mp-cselect-trigger,\n  .mp-cselect-trigger:focus-visible {\n    border-color: var(--mp-primary);\n    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);\n  }\n  .mp-cselect-label {\n    flex: 1;\n    min-width: 0;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    line-height: 1.3;\n  }\n  .mp-cselect-arrow {\n    width: 15px;\n    height: 15px;\n    flex-shrink: 0;\n    color: var(--mp-text-muted);\n    transition: transform 0.16s ease, color 0.15s ease;\n  }\n  .mp-cselect.open .mp-cselect-arrow {\n    transform: rotate(180deg);\n    color: var(--mp-primary);\n  }\n  .mp-cselect-menu {\n    position: absolute;\n    top: calc(100% + 5px);\n    left: 0;\n    right: 0;\n    z-index: 2147483644;\n    background: var(--mp-bg);\n    border: 1px solid var(--mp-border-strong);\n    border-radius: 10px;\n    box-shadow: var(--mp-shadow);\n    padding: 5px;\n    max-height: 216px;\n    overflow-y: auto;\n    display: none;\n    box-sizing: border-box;\n    animation: mp-fade-in 0.12s ease-out;\n  }\n  .mp-cselect.open .mp-cselect-menu {\n    display: block;\n  }\n  .mp-cselect.open-up .mp-cselect-menu {\n    top: auto;\n    bottom: calc(100% + 5px);\n  }\n  .mp-cselect-option {\n    width: 100%;\n    border: none;\n    background: transparent;\n    color: var(--mp-text);\n    font-family: var(--mp-font);\n    font-size: 12.5px;\n    line-height: 1.35;\n    padding: 7px 9px;\n    border-radius: 6px;\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 8px;\n    text-align: left;\n    box-sizing: border-box;\n    transition: background-color 0.12s ease, color 0.12s ease;\n    margin: 0;\n  }\n  .mp-cselect-option:hover,\n  .mp-cselect-option.focused {\n    background: var(--mp-surface-hover);\n  }\n  .mp-cselect-option.selected {\n    background: var(--mp-primary-soft);\n    color: var(--mp-primary);\n    font-weight: 600;\n  }\n  .mp-cselect-opt-text {\n    flex: 1;\n    min-width: 0;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n  .mp-cselect-check {\n    flex-shrink: 0;\n    font-size: 12px;\n    opacity: 0;\n  }\n  .mp-cselect-option.selected .mp-cselect-check {\n    opacity: 1;\n  }\n  .mp-input-with-btn {\n    padding-right: 48px;\n  }\n  .mp-input-eye {\n    position: absolute;\n    right: 6px;\n    border: none;\n    background: transparent;\n    color: var(--mp-text-muted);\n    cursor: pointer;\n    font-size: 12px;\n    padding: 4px 7px;\n    border-radius: 5px;\n  }\n  .mp-input-eye:hover {\n    color: var(--mp-text);\n    background: var(--mp-surface-hover);\n  }\n  .mp-help-text {\n    margin: 5px 0 0;\n    color: var(--mp-text-muted);\n    font-size: 11.5px;\n    line-height: 1.45;\n  }\n\n  .mp-switch-row {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 9px 12px;\n    border: 1px solid var(--mp-border);\n    border-radius: 8px;\n    background: var(--mp-surface);\n    margin-bottom: 9px;\n    gap: 12px;\n  }\n  .mp-switch-label {\n    font-size: 12.5px;\n    font-weight: 600;\n    color: var(--mp-text);\n  }\n  .mp-switch-sub {\n    font-size: 11.5px;\n    color: var(--mp-text-muted);\n    margin-top: 2px;\n  }\n  .mp-checkbox {\n    width: 16px;\n    height: 16px;\n    accent-color: var(--mp-primary);\n    cursor: pointer;\n    flex-shrink: 0;\n    margin: 0;\n  }\n  /* 现代开关 Toggle */\n  .mp-toggle {\n    position: relative;\n    display: inline-flex;\n    align-items: center;\n    width: 38px;\n    height: 22px;\n    flex-shrink: 0;\n    cursor: pointer;\n  }\n  .mp-toggle input {\n    position: absolute;\n    opacity: 0;\n    width: 0;\n    height: 0;\n    margin: 0;\n  }\n  .mp-toggle-track {\n    width: 38px;\n    height: 22px;\n    border-radius: 999px;\n    background: var(--mp-border-strong);\n    transition: background-color 0.18s ease;\n    position: relative;\n    display: block;\n  }\n  .mp-toggle-thumb {\n    position: absolute;\n    top: 3px;\n    left: 3px;\n    width: 16px;\n    height: 16px;\n    border-radius: 50%;\n    background: #ffffff;\n    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);\n    transition: transform 0.18s ease;\n  }\n  .mp-toggle input:checked + .mp-toggle-track {\n    background: var(--mp-primary);\n  }\n  .mp-toggle input:checked + .mp-toggle-track .mp-toggle-thumb {\n    transform: translateX(16px);\n  }\n  .mp-toggle input:focus-visible + .mp-toggle-track {\n    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.22);\n  }\n\n  /* 统一细滚动条 */\n  .mp-modal-body::-webkit-scrollbar,\n  .mp-results-container::-webkit-scrollbar,\n  .mp-cselect-menu::-webkit-scrollbar {\n    width: 6px;\n    height: 6px;\n  }\n  .mp-modal-body::-webkit-scrollbar-track,\n  .mp-results-container::-webkit-scrollbar-track,\n  .mp-cselect-menu::-webkit-scrollbar-track {\n    background: transparent;\n  }\n  .mp-modal-body::-webkit-scrollbar-thumb,\n  .mp-results-container::-webkit-scrollbar-thumb,\n  .mp-cselect-menu::-webkit-scrollbar-thumb {\n    background: var(--mp-border-strong);\n    border-radius: 999px;\n  }\n  .mp-modal-footer {\n    display: flex;\n    align-items: center;\n    gap: 10px;\n    margin-top: 14px;\n  }\n  .mp-modal-footer .mp-btn-lg {\n    flex: 1;\n  }\n  .mp-status-banner {\n    margin-top: 10px;\n    padding: 9px 12px;\n    border-radius: 8px;\n    font-size: 12.5px;\n    line-height: 1.45;\n    display: none;\n    border: 1px solid transparent;\n    white-space: pre-line;\n  }\n  .mp-status-banner.info { background: var(--mp-primary-soft); color: var(--mp-primary); border-color: rgba(37, 99, 235, 0.28); }\n  .mp-status-banner.success { background: var(--mp-success-soft); color: var(--mp-success); border-color: rgba(22, 163, 74, 0.3); }\n  .mp-status-banner.error { background: var(--mp-danger-soft); color: var(--mp-danger); border-color: rgba(220, 38, 38, 0.3); }\n\n  /* 候选关键词 Chips */\n  .mp-chips-wrap {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 6px;\n    margin-top: 8px;\n  }\n  .mp-chip {\n    display: inline-block;\n    vertical-align: middle;\n    box-sizing: border-box;\n    padding: 4px 10px;\n    border-radius: 999px;\n    font-size: 11.5px;\n    font-weight: 500;\n    line-height: 1.35;\n    background: var(--mp-surface-2);\n    color: var(--mp-text);\n    border: 1px solid var(--mp-border);\n    cursor: pointer;\n    transition: background-color 0.14s ease, color 0.14s ease, border-color 0.14s ease;\n    max-width: 220px;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n  .mp-chip:hover, .mp-chip.active {\n    background: var(--mp-primary-soft);\n    color: var(--mp-primary);\n    border-color: var(--mp-primary);\n  }\n\n  /* 手动搜索弹窗 & 结果卡片 */\n  .mp-preview-box {\n    background: var(--mp-surface);\n    border: 1px solid var(--mp-border);\n    border-radius: 9px;\n    padding: 10px 12px;\n    margin-bottom: 13px;\n    font-size: 12px;\n    color: var(--mp-text-muted);\n    line-height: 1.5;\n  }\n  .mp-preview-header {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    margin-bottom: 6px;\n  }\n  .mp-preview-line {\n    display: flex;\n    gap: 6px;\n    margin-bottom: 3px;\n  }\n  .mp-preview-line:last-child { margin-bottom: 0; }\n  .mp-preview-key {\n    font-weight: 600;\n    color: var(--mp-text);\n    flex-shrink: 0;\n  }\n  .mp-preview-val {\n    word-break: break-word;\n  }\n\n  .mp-search-bar {\n    display: flex;\n    gap: 8px;\n  }\n  .mp-search-bar .mp-input {\n    flex: 1;\n  }\n  .mp-results-container {\n    margin-top: 13px;\n    max-height: 360px;\n    overflow-y: auto;\n    padding-right: 2px;\n  }\n  .mp-result-item {\n    display: flex;\n    gap: 12px;\n    padding: 10px 12px;\n    border: 1px solid var(--mp-border);\n    background: var(--mp-surface);\n    margin-bottom: 8px;\n    border-radius: 9px;\n    transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.12s ease;\n    align-items: flex-start;\n  }\n  .mp-result-item:hover {\n    background: var(--mp-surface-2);\n    border-color: var(--mp-primary);\n  }\n  .mp-result-poster {\n    width: 48px;\n    height: 70px;\n    object-fit: cover;\n    border-radius: 6px;\n    background: var(--mp-surface-2);\n    border: 1px solid var(--mp-border);\n    flex-shrink: 0;\n  }\n  .mp-result-poster-placeholder {\n    width: 48px;\n    height: 70px;\n    border-radius: 6px;\n    background: var(--mp-surface-2);\n    border: 1px solid var(--mp-border);\n    color: var(--mp-text-muted);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 18px;\n    flex-shrink: 0;\n  }\n  .mp-result-info {\n    flex: 1;\n    min-width: 0;\n  }\n  .mp-result-title {\n    font-weight: 700;\n    font-size: 13.5px;\n    color: var(--mp-text);\n    margin-bottom: 4px;\n    display: flex;\n    align-items: center;\n    flex-wrap: wrap;\n    gap: 6px;\n  }\n  .mp-result-type {\n    display: inline-flex;\n    align-items: center;\n    background-color: var(--mp-primary);\n    color: #ffffff;\n    padding: 2px 6px;\n    border-radius: 4px;\n    font-size: 11px;\n    font-weight: 600;\n  }\n  .mp-result-meta {\n    color: var(--mp-text-muted);\n    font-size: 12px;\n    margin-bottom: 4px;\n  }\n  .mp-result-overview {\n    color: var(--mp-text-muted);\n    font-size: 11.5px;\n    line-height: 1.45;\n    display: -webkit-box;\n    -webkit-line-clamp: 2;\n    -webkit-box-orient: vertical;\n    overflow: hidden;\n  }\n  .mp-result-actions {\n    display: flex;\n    flex-direction: column;\n    gap: 5px;\n    flex-shrink: 0;\n    align-self: center;\n  }\n\n  /* Toast 通知（右下角毛玻璃卡片） */\n  #mp-toast-container {\n    position: fixed;\n    bottom: 24px;\n    right: 24px;\n    z-index: 2147483645;\n    display: flex;\n    flex-direction: column;\n    align-items: flex-end;\n    gap: 10px;\n    max-width: calc(100vw - 32px);\n    font-family: var(--mp-font);\n    pointer-events: none;\n  }\n  .mp-toast {\n    position: relative;\n    overflow: hidden;\n    pointer-events: auto;\n    background: var(--mp-toast-bg);\n    backdrop-filter: blur(14px) saturate(160%);\n    -webkit-backdrop-filter: blur(14px) saturate(160%);\n    color: var(--mp-text);\n    border: 1px solid rgba(15, 23, 42, 0.07);\n    box-shadow: var(--mp-toast-shadow);\n    padding: 13px 14px 14px 14px;\n    border-radius: 12px;\n    display: flex;\n    align-items: flex-start;\n    gap: 11px;\n    width: 340px;\n    max-width: calc(100vw - 32px);\n    animation: mp-toast-in 0.24s cubic-bezier(0.16, 1, 0.3, 1);\n    transition: opacity 0.24s ease, transform 0.24s ease;\n    box-sizing: border-box;\n  }\n  .mp-dark .mp-toast {\n    border-color: rgba(255, 255, 255, 0.09);\n  }\n  .mp-toast-icon {\n    width: 26px;\n    height: 26px;\n    border-radius: 8px;\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    flex-shrink: 0;\n    margin-top: 1px;\n    background: var(--mp-primary-soft);\n    color: var(--mp-primary);\n  }\n  .mp-toast.success .mp-toast-icon {\n    background: var(--mp-success-soft);\n    color: var(--mp-success);\n  }\n  .mp-toast.error .mp-toast-icon {\n    background: var(--mp-danger-soft);\n    color: var(--mp-danger);\n  }\n  .mp-toast-icon svg {\n    width: 15px;\n    height: 15px;\n    display: block;\n  }\n  .mp-toast-icon .mp-spinner {\n    width: 13px;\n    height: 13px;\n    border-width: 2px;\n    border-color: rgba(37, 99, 235, 0.22);\n    border-top-color: var(--mp-primary);\n  }\n  .mp-toast-content {\n    display: flex;\n    flex-direction: column;\n    flex: 1;\n    min-width: 0;\n  }\n  .mp-toast-title {\n    font-weight: 700;\n    font-size: 13.5px;\n    line-height: 1.35;\n    letter-spacing: -0.01em;\n    margin-bottom: 3px;\n    color: var(--mp-text);\n  }\n  .mp-toast-msg {\n    font-size: 12px;\n    color: var(--mp-text-muted);\n    word-break: break-word;\n    line-height: 1.5;\n    white-space: pre-line;\n  }\n  .mp-toast-close {\n    cursor: pointer;\n    color: var(--mp-text-muted);\n    font-weight: 600;\n    font-size: 15px;\n    line-height: 1;\n    width: 22px;\n    height: 22px;\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    background: transparent;\n    border: none;\n    padding: 0;\n    border-radius: 6px;\n    flex-shrink: 0;\n    opacity: 0.72;\n    transition: color 0.15s ease, background-color 0.15s ease, opacity 0.15s ease;\n  }\n  .mp-toast-close:hover {\n    opacity: 1;\n    color: var(--mp-text);\n    background: var(--mp-surface-hover);\n  }\n  .mp-toast-progress {\n    position: absolute;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    height: 2.5px;\n    transform-origin: left center;\n    background: var(--mp-primary);\n    opacity: 0.75;\n  }\n  .mp-toast.success .mp-toast-progress { background: var(--mp-success); }\n  .mp-toast.error .mp-toast-progress { background: var(--mp-danger); }\n  .mp-toast:hover .mp-toast-progress {\n    animation-play-state: paused !important;\n  }\n\n  /* 未配置时的轻量悬浮入口（方便 iOS Safari 等无菜单扩展快速进入设置） */\n  .mp-floating-cfg-btn {\n    position: fixed;\n    right: 18px;\n    bottom: calc(18px + env(safe-area-inset-bottom, 0px));\n    z-index: 2147483635;\n    display: inline-flex;\n    align-items: center;\n    gap: 6px;\n    height: 36px;\n    padding: 0 14px;\n    border-radius: 999px;\n    border: 1px solid var(--mp-border-strong);\n    background: var(--mp-toast-bg);\n    color: var(--mp-text);\n    font-family: var(--mp-font);\n    font-size: 12.5px;\n    font-weight: 600;\n    box-shadow: var(--mp-toast-shadow);\n    backdrop-filter: blur(12px) saturate(150%);\n    -webkit-backdrop-filter: blur(12px) saturate(150%);\n    cursor: pointer;\n    touch-action: manipulation;\n    -webkit-tap-highlight-color: transparent;\n    transition: transform 0.15s ease, border-color 0.15s ease, color 0.15s ease;\n  }\n  .mp-floating-cfg-btn:hover {\n    border-color: var(--mp-primary);\n    color: var(--mp-primary);\n    transform: translateY(-1px);\n  }\n\n  /* 触控与 iOS Safari 移动端适配 */\n  .mp-btn, .mp-tag-btn, .mp-chip, .mp-close, .mp-cselect-trigger, .mp-cselect-option, .mp-toggle {\n    touch-action: manipulation;\n    -webkit-tap-highlight-color: transparent;\n  }\n  .mp-modal {\n    overscroll-behavior: contain;\n  }\n  .mp-modal-body, .mp-results-container, .mp-cselect-menu {\n    -webkit-overflow-scrolling: touch;\n  }\n  /* 订阅弹窗优先级规则组多选区 */\n  .mp-rule-header {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 8px;\n    margin-bottom: 6px;\n  }\n  .mp-rule-header label {\n    margin-bottom: 0;\n    display: inline-flex;\n    align-items: center;\n    gap: 6px;\n    flex-wrap: wrap;\n  }\n  .mp-rule-badge {\n    display: inline-flex;\n    align-items: center;\n    padding: 1px 7px;\n    border-radius: 999px;\n    font-size: 11px;\n    font-weight: 500;\n    background: var(--mp-surface-2);\n    color: var(--mp-text-muted);\n    border: 1px solid var(--mp-border);\n  }\n  .mp-rule-badge.active {\n    background: var(--mp-primary-soft);\n    color: var(--mp-primary);\n    border-color: rgba(37, 99, 235, 0.35);\n    font-weight: 600;\n  }\n  .mp-rule-groups-box {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 6px;\n    padding: 9px 10px;\n    border-radius: 8px;\n    border: 1px solid var(--mp-border);\n    background: var(--mp-surface);\n    min-height: 40px;\n    align-items: center;\n    box-sizing: border-box;\n  }\n  .mp-rule-chip {\n    display: inline-flex;\n    align-items: center;\n    gap: 5px;\n    padding: 5px 10px;\n    border-radius: 999px;\n    font-size: 12px;\n    font-weight: 500;\n    line-height: 1.3;\n    font-family: var(--mp-font);\n    background: var(--mp-bg);\n    color: var(--mp-text);\n    border: 1px solid var(--mp-border-strong);\n    cursor: pointer;\n    touch-action: manipulation;\n    -webkit-tap-highlight-color: transparent;\n    transition: background-color 0.14s ease, color 0.14s ease, border-color 0.14s ease;\n    max-width: 100%;\n    word-break: break-word;\n  }\n  .mp-rule-chip:hover {\n    border-color: var(--mp-primary);\n    color: var(--mp-primary);\n  }\n  .mp-rule-chip.active {\n    background: var(--mp-primary-soft);\n    color: var(--mp-primary);\n    border-color: var(--mp-primary);\n    font-weight: 600;\n  }\n  .mp-rule-chip-check {\n    font-size: 11px;\n    line-height: 1;\n    opacity: 0.45;\n  }\n  .mp-rule-chip.active .mp-rule-chip-check {\n    opacity: 1;\n  }\n\n  @media (max-width: 768px), (pointer: coarse) {\n    .mp-input, .mp-select, .mp-textarea {\n      font-size: 16px;\n      min-height: 40px;\n    }\n    .mp-cselect-trigger {\n      font-size: 14px;\n      min-height: 40px;\n    }\n    .mp-cselect-option {\n      min-height: 38px;\n      font-size: 14px;\n    }\n    .mp-btn-lg {\n      height: 40px;\n    }\n    .mp-rule-chip {\n      min-height: 34px;\n      padding: 6px 12px;\n      font-size: 13px;\n    }\n  }\n\n  @media (max-width: 640px) {\n    .mp-modal {\n      padding: 10px 10px calc(10px + env(safe-area-inset-bottom, 0px));\n      align-items: flex-end;\n    }\n    .mp-modal-content, .mp-modal-content.mp-modal-wide {\n      max-width: 100%;\n      max-height: 88vh;\n      max-height: calc(100dvh - 20px - env(safe-area-inset-top, 0px));\n      border-radius: 16px;\n    }\n    .mp-modal-header {\n      padding: 13px 16px;\n    }\n    .mp-modal-body {\n      padding: 14px 16px calc(16px + env(safe-area-inset-bottom, 0px));\n    }\n    .mp-result-item {\n      flex-wrap: wrap;\n      gap: 10px;\n    }\n    .mp-result-actions {\n      width: 100%;\n      flex-direction: row;\n      justify-content: flex-end;\n      margin-top: 2px;\n    }\n    .mp-result-actions .mp-btn {\n      flex: 1;\n    }\n    #mp-toast-container {\n      left: 12px;\n      right: 12px;\n      bottom: calc(14px + env(safe-area-inset-bottom, 0px));\n      align-items: stretch;\n      max-width: none;\n    }\n    .mp-toast {\n      width: 100%;\n      max-width: 100%;\n    }\n    .mp-mteam-panel {\n      padding: 10px 12px;\n    }\n    .mp-inline-bar {\n      gap: 6px;\n    }\n  }';


const MP_THEME_AND_LINK_PATCH_CSS = `
  .mp-dark {
    --mp-bg: #161b22;
    --mp-panel-bg: #1c222d;
    --mp-surface: #1e2530;
    --mp-surface-2: #262f3d;
    --mp-surface-hover: #303b4c;
    --mp-border: rgba(255, 255, 255, 0.12);
    --mp-border-strong: rgba(255, 255, 255, 0.20);
    --mp-text: #f1f5f9;
    --mp-text-muted: #94a3b8;
    --mp-primary: #60a5fa;
    --mp-primary-hover: #3b82f6;
    --mp-primary-soft: rgba(37, 99, 235, 0.24);
    --mp-success: #4ade80;
    --mp-success-hover: #22c55e;
    --mp-success-soft: rgba(22, 163, 74, 0.22);
    --mp-danger: #f87171;
    --mp-danger-hover: #ef4444;
    --mp-danger-soft: rgba(220, 38, 38, 0.22);
    --mp-warning: #fbbf24;
    --mp-warning-soft: rgba(217, 119, 6, 0.22);
    --mp-info-soft: rgba(14, 165, 233, 0.22);
    --mp-info-text: #7dd3fc;
  }
  .mp-dark.mp-mteam-panel,
  .mp-dark.mp-anime-panel,
  .mp-dark .mp-modal-header {
    background: var(--mp-panel-bg);
  }
  .mp-dark .mp-btn-primary {
    background: #2563eb;
    color: #ffffff !important;
  }
  .mp-dark .mp-btn-primary:hover:not(:disabled) {
    background: #3b82f6;
  }
  .mp-dark .mp-tag-type,
  .mp-dark .mp-tag-sub-btn,
  .mp-dark .mp-btn-split.mp-btn-split-sub {
    border-color: rgba(96, 165, 250, 0.34);
  }
  .mp-dark .mp-tag-team {
    background: rgba(99, 102, 241, 0.24);
    color: #c7d2fe !important;
    border-color: rgba(129, 140, 248, 0.36);
  }
  .mp-dark .mp-tag-sub-btn:hover {
    background: #2563eb;
    color: #ffffff !important;
    border-color: #2563eb;
  }
  .mp-inline-bar a.mp-tag,
  a.mp-tag.mp-tag-link {
    text-decoration: none !important;
  }
  .mp-inline-bar a.mp-tag-tmdb,
  a.mp-tag-tmdb {
    color: var(--mp-text) !important;
  }
  .mp-inline-bar a.mp-tag-tmdb:hover,
  a.mp-tag-tmdb:hover {
    color: var(--mp-primary) !important;
  }
  .mp-inline-bar a.mp-tag-exists,
  a.mp-tag-exists {
    color: var(--mp-success) !important;
  }
  .mp-inline-bar a.mp-tag-type,
  a.mp-tag-type {
    color: var(--mp-primary) !important;
  }
  .mp-svg {
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
    pointer-events: none;
  }
  .mp-status-banner-inner {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  .mp-status-banner-inner > .mp-svg {
    margin-top: 2px;
  }
  .mp-status-banner-text {
    white-space: pre-line;
    flex: 1;
    min-width: 0;
  }
`;


safeAddStyle(MP_STYLE_TEXT + MP_THEME_AND_LINK_PATCH_CSS);

const MP_SVG_PATHS = {
  download:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  settings:
    '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  sliders:
    '<line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="16" y1="18" x2="16" y2="22"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  arrowUpRight: '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  xCircle: '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  alertTriangle:
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  play: '<polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke-width="1.5"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  film: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/>',
};

function mpIcon(name, size = 13) {
  const body = MP_SVG_PATHS[name] || "";
  return `<svg class="mp-svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}


let mpSharedInertDoc = null;
function cloneInertNode(node) {
  if (!node) return null;
  try {
    if (!mpSharedInertDoc && typeof document?.implementation?.createHTMLDocument === "function") {
      mpSharedInertDoc = document.implementation.createHTMLDocument("");
    }
    if (mpSharedInertDoc) {
      return mpSharedInertDoc.importNode(node, true);
    }
  } catch (e) {}
  return node.cloneNode(true);
}

// ---------- GM_* / GM.* 跨管理器兼容层（含 iOS Safari Userscripts / Stay） ----------
function hasSyncGmGet() { return typeof GM_getValue === 'function'; }
function hasAsyncGmGet() { return typeof GM !== 'undefined' && typeof GM.getValue === 'function'; }

function isPromiseLike(v) {
    return Boolean(v && (typeof v === 'object' || typeof v === 'function') && typeof v.then === 'function');
}

function mpStorageGetSync(key, defaultValue) {
    if (hasSyncGmGet()) {
        try {
            const v = GM_getValue(key, defaultValue);
            if (!isPromiseLike(v) && v !== undefined && v !== null) return v;
        } catch (e) {}
    }
    if (!hasAsyncGmGet()) {
        try {
            const raw = window.localStorage?.getItem(`__mp_cfg_${key}`);
            if (raw !== null && raw !== undefined) return JSON.parse(raw);
        } catch (e) {}
    }
    return defaultValue;
}

async function mpStorageGetAsync(key, defaultValue) {
    if (hasAsyncGmGet()) {
        try {
            const v = await GM.getValue(key, undefined);
            if (v !== undefined && v !== null) return v;
        } catch (e) {}
    }
    if (hasSyncGmGet()) {
        try {
            const v = GM_getValue(key, undefined);
            if (isPromiseLike(v)) {
                const awaited = await v;
                if (awaited !== undefined && awaited !== null) return awaited;
            } else if (v !== undefined && v !== null) {
                return v;
            }
        } catch (e) {}
    }
    return mpStorageGetSync(key, defaultValue);
}

function mpStorageSet(key, value) {
    let written = false;
    if (typeof GM_setValue === 'function') {
        try {
            GM_setValue(key, value);
            written = true;
        } catch (e) {}
    }
    if (typeof GM !== 'undefined' && typeof GM.setValue === 'function') {
        try {
            Promise.resolve(GM.setValue(key, value)).catch(() => {});
            written = true;
        } catch (e) {}
    }
    if (!written) {
        try {
            window.localStorage?.setItem(`__mp_cfg_${key}`, JSON.stringify(value));
        } catch (e) {}
    }
}

function mpStorageDelete(key) {
    if (typeof GM_deleteValue === 'function') {
        try { GM_deleteValue(key); } catch (e) {}
    }
    if (typeof GM !== 'undefined' && typeof GM.deleteValue === 'function') {
        try { Promise.resolve(GM.deleteValue(key)).catch(() => {}); } catch (e) {}
    }
    try { window.localStorage?.removeItem(`__mp_cfg_${key}`); } catch (e) {}
}

function safeRegisterMenuCommand(title, handler) {
    try {
        if (typeof GM_registerMenuCommand === 'function') {
            return GM_registerMenuCommand(title, handler);
        }
        if (typeof GM !== 'undefined' && typeof GM.registerMenuCommand === 'function') {
            return GM.registerMenuCommand(title, handler);
        }
    } catch (e) {}
    return null;
}

function mpGmRequest(options) {
    const opts = Object.assign({}, options || {});
    const xhrFn = (typeof GM_xmlhttpRequest === 'function')
        ? GM_xmlhttpRequest
        : ((typeof GM !== 'undefined' && typeof GM.xmlHttpRequest === 'function')
            ? GM.xmlHttpRequest.bind(GM)
            : null);
    if (!xhrFn) {
        if (typeof opts.onerror === 'function') {
            opts.onerror({ status: 0, responseText: 'GM_xmlhttpRequest / GM.xmlHttpRequest 不可用' });
        }
        return null;
    }

    let settled = false;
    const origOnload = opts.onload;
    const origOnerror = opts.onerror;
    const origOntimeout = opts.ontimeout;

    const fireLoad = (res) => {
        if (settled) return;
        settled = true;
        if (typeof origOnload === 'function') origOnload(res);
    };
    const fireError = (err) => {
        if (settled) return;
        settled = true;
        if (typeof origOnerror === 'function') origOnerror(err);
    };
    const fireTimeout = (err) => {
        if (settled) return;
        settled = true;
        if (typeof origOntimeout === 'function') origOntimeout(err);
    };

    opts.onload = fireLoad;
    opts.onerror = fireError;
    opts.ontimeout = fireTimeout;

    try {
        const ret = xhrFn(opts);
        if (ret && typeof ret.then === 'function') {
            ret.then((res) => {
                if (res && typeof res === 'object') fireLoad(res);
            }, (err) => {
                fireError(err || { status: 0, responseText: 'Request rejected' });
            });
        }
        return ret;
    } catch (e) {
        fireError({ status: 0, responseText: e?.message || 'GM request failed' });
        return null;
    }
}

function isTouchOrSmallViewport() {
    try {
        return Boolean(
            (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
            || (window.innerWidth && window.innerWidth <= 768)
        );
    } catch (e) {
        return false;
    }
}


function parseStoredBool(val, fallback = false) {
  if (val === undefined || val === null || val === "") return fallback;
  if (val === false || val === "false" || val === 0 || val === "0") return false;
  if (val === true || val === "true" || val === 1 || val === "1") return true;
  return Boolean(val);
}

const CONFIG_PROP_TO_GM_KEY = {
  url: "mp_url",
  apiKey: "mp_api_key",
  debug: "mp_debug",
  themeMode: "mp_theme_mode",
  showSpecs: "mp_show_specs",
  subAutoFillSpecs: "mp_sub_auto_fill_specs",
  defaultDownloader: "mp_default_downloader",
  defaultSavePath: "mp_default_save_path",
};

function mpSaveConfigPatch(patchObj) {
  if (!patchObj || typeof patchObj !== "object") return Promise.resolve();
  for (const [prop, val] of Object.entries(patchObj)) {
    const gmKey = CONFIG_PROP_TO_GM_KEY[prop];
    if (!gmKey) continue;
    if (val === "" && (prop === "url" || prop === "apiKey" || prop === "defaultDownloader" || prop === "defaultSavePath")) {
      mpStorageDelete(gmKey);
    } else {
      mpStorageSet(gmKey, val);
    }
  }
  return Promise.resolve();
}

// ---------- 全局配置与运行时状态 ----------
let mpUrl = String(mpStorageGetSync("mp_url", "") || "").replace(/\/+$/, "");
let mpApiKey = String(mpStorageGetSync("mp_api_key", "") || "").trim();
let mpDebug = parseStoredBool(mpStorageGetSync("mp_debug", false), false);
let mpThemeMode = mpStorageGetSync("mp_theme_mode", "auto") || "auto";
let mpShowSpecs = parseStoredBool(mpStorageGetSync("mp_show_specs", true), true);
let mpSubAutoFillSpecs = parseStoredBool(mpStorageGetSync("mp_sub_auto_fill_specs", false), false);
let mpDefaultDownloader = mpStorageGetSync("mp_default_downloader", "") || "";
let mpDefaultSavePath = mpStorageGetSync("mp_default_save_path", "") || "";
let mpConfigInitPromise = null;

function initMpConfig() {
  if (mpConfigInitPromise) return mpConfigInitPromise;
  mpConfigInitPromise = (async () => {
    const [url, apiKey, dbg, theme, specs, subAutoFill, dl, savePath] = await Promise.all([
      mpStorageGetAsync("mp_url", mpUrl),
      mpStorageGetAsync("mp_api_key", mpApiKey),
      mpStorageGetAsync("mp_debug", mpDebug),
      mpStorageGetAsync("mp_theme_mode", mpThemeMode),
      mpStorageGetAsync("mp_show_specs", mpShowSpecs),
      mpStorageGetAsync("mp_sub_auto_fill_specs", mpSubAutoFillSpecs),
      mpStorageGetAsync("mp_default_downloader", mpDefaultDownloader),
      mpStorageGetAsync("mp_default_save_path", mpDefaultSavePath),
    ]);
    mpUrl = String(url || "").replace(/\/+$/, "");
    mpApiKey = String(apiKey || "").trim();
    mpDebug = parseStoredBool(dbg, false);
    mpThemeMode = theme || "auto";
    mpShowSpecs = parseStoredBool(specs, true);
    mpSubAutoFillSpecs = parseStoredBool(subAutoFill, false);
    mpDefaultDownloader = dl || "";
    mpDefaultSavePath = savePath || "";
  })().catch(() => {});
  return mpConfigInitPromise;
}


function installMTeamPageContextHook() {
    if (!isMTeamDetailPage()) return;
    if (document.getElementById('mp-mteam-page-hook-script')) return;

    const script = document.createElement('script');
    script.id = 'mp-mteam-page-hook-script';
    script.textContent = `
    (function() {
      if (window.__mpMTeamPageHookInstalled) return;
      window.__mpMTeamPageHookInstalled = true;
      window.__mpMTeamPrefetchUntil = 0;

      function shouldCapture(url) {
        try {
          var s = String(url || '');
          var lower = s.toLowerCase();
          if (lower.indexOf('dlv2') >= 0) return true;
          if (lower.indexOf('torrent/download') >= 0) return true;
          if (lower.indexOf('.torrent') >= 0) return true;
          if (lower.indexOf('halomt.com') >= 0 && lower.indexOf('sign=') >= 0) return true;
          if (
            (lower.indexOf('app_id=') >= 0 || lower.indexOf('payload=') >= 0 || lower.indexOf('playload=') >= 0)
            && lower.indexOf('sign=') >= 0
          ) return true;
          return false;
        } catch (e) { return false; }
      }

      function inPrefetchMode() {
        try {
          return Date.now() < (window.__mpMTeamPrefetchUntil || 0);
        } catch (e) { return false; }
      }

      try {
        document.addEventListener('mp-mteam-prefetch-mode', function(ev) {
          try {
            var duration = Number(ev && ev.detail && ev.detail.duration) || 5000;
            if (duration < 500) duration = 500;
            window.__mpMTeamPrefetchUntil = Date.now() + duration;
          } catch (e) {}
        }, true);
      } catch (e) {}

      function emit(url, source) {
        try {
          if (!url || !shouldCapture(url)) return;
          document.dispatchEvent(new CustomEvent('mp-download-url-captured', { detail: { url: String(url), source: source || 'page-hook' } }));
        } catch (e) {}
      }

      try {
        var origOpen = window.open;
        if (typeof origOpen === 'function') {
          window.open = function(url) {
            emit(url, 'window.open');
            if (inPrefetchMode() && shouldCapture(url)) return null;
            return origOpen.apply(this, arguments);
          };
        }
      } catch (e) {}

      try {
        if (window.fetch) {
          var origFetch = window.fetch;
          window.fetch = function(input) {
            var u = '';
            try {
              u = String((typeof input === 'string') ? input : (input && input.url) || '');
              emit(u, 'fetch');
            } catch (e) {}
            var resPromise = origFetch.apply(this, arguments);
            try {
              if (u && (u.indexOf('/api/torrent/detail') >= 0 || u.indexOf('/api/torrent/genDlToken') >= 0)) {
                resPromise.then(function(resp) {
                  try {
                    resp.clone().json().then(function(json) {
                      if (!json || !json.data) return;
                      if (u.indexOf('/api/torrent/detail') >= 0 && typeof json.data === 'object') {
                        document.dispatchEvent(new CustomEvent('mp-mteam-detail-captured', { detail: json.data }));
                      } else if (u.indexOf('/api/torrent/genDlToken') >= 0 && typeof json.data === 'string') {
                        emit(json.data, 'fetch.genDlToken');
                      }
                    }).catch(function() {});
                  } catch (e) {}
                }).catch(function() {});
              }
            } catch (e) {}
            return resPromise;
          };
        }
      } catch (e) {}

      try {
        var origXhrOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
          this.__mpReqUrl = String(url || '');
          emit(url, 'xhr.open');
          return origXhrOpen.apply(this, arguments);
        };
        var origXhrSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function() {
          var reqUrl = this.__mpReqUrl || '';
          if (reqUrl && (reqUrl.indexOf('/api/torrent/detail') >= 0 || reqUrl.indexOf('/api/torrent/genDlToken') >= 0)) {
            this.addEventListener('load', function() {
              try {
                var json = JSON.parse(this.responseText || '{}');
                if (!json || !json.data) return;
                if (reqUrl.indexOf('/api/torrent/detail') >= 0 && typeof json.data === 'object') {
                  document.dispatchEvent(new CustomEvent('mp-mteam-detail-captured', { detail: json.data }));
                } else if (reqUrl.indexOf('/api/torrent/genDlToken') >= 0 && typeof json.data === 'string') {
                  emit(json.data, 'xhr.genDlToken');
                }
              } catch (e) {}
            });
          }
          return origXhrSend.apply(this, arguments);
        };
      } catch (e) {}

      try {
        var origAnchorClick = HTMLAnchorElement.prototype.click;
        HTMLAnchorElement.prototype.click = function() {
          emit(this && this.href, 'anchor.click');
          if (inPrefetchMode() && shouldCapture(this && this.href)) return;
          return origAnchorClick.apply(this, arguments);
        };
      } catch (e) {}

      try {
        document.addEventListener('click', function(ev) {
          var path = ev.composedPath ? ev.composedPath() : [ev.target];
          for (var i = 0; i < path.length; i++) {
            var n = path[i];
            if (!n || !n.getAttribute) continue;
            emit(n.getAttribute('href'), 'dom.click.href');
            emit(n.getAttribute('data-url'), 'dom.click.data-url');
            emit(n.getAttribute('data-href'), 'dom.click.data-href');
            emit(n.getAttribute('onclick'), 'dom.click.onclick');
          }
        }, true);
      } catch (e) {}
    })();
  `;
    try {
        (document.documentElement || document.head || document.body)?.appendChild(script);
    } catch (e) {}
}

let mpUidCounter = 0;
let mpMountSeq = 0;
let mpLastMTeamBtnLogKey = "";
let mpLastMTeamBtnMissingLogKey = "";
let mpLastMTeamMountMissingLogKey = "";
let mpMTeamRuntimeDownloadLinks = {};
let mpMTeamRuntimeListenerInstalled = false;
let mpMTeamDetailCache = {};
let mpMTeamDetailPending = {};
let mpMTeamAutoPrefetchState = {};
let mpSunnyPTDetailCache = {};
let mpSunnyPTLinkCache = {};
let mpSunnyPTAccessToken = "";
let mpMTeamMutationWatcherState = {};
let mpMTeamHtmlScanState = {};
let mpCachedClients = null;
let mpCachedPaths = null;
let mpCachedFilterRuleGroups = null;
let mpCachedSeasons = {};
// 对齐 MoviePilot-Frontend v3/src/api/constants.ts 选项
const MP_QUALITY_OPTIONS = [
  { title: "全部", value: "" },
  { title: "蓝光原盘", value: "Blu-?Ray.+VC-?1|Blu-?Ray.+AVC|UHD.+blu-?ray.+HEVC|MiniBD" },
  { title: "Remux", value: "Remux" },
  { title: "Blu-Ray", value: "Blu-?Ray" },
  { title: "UHD", value: "UHD|UltraHD" },
  { title: "WEB-DL", value: "WEB-?DL|WEB-?RIP" },
  { title: "HDTV", value: "HDTV" },
  { title: "H.265", value: "[Hx].?265|HEVC" },
  { title: "H.264", value: "[Hx].?264|AVC" },
];
const MP_RESOLUTION_OPTIONS = [
  { title: "全部", value: "" },
  { title: "4K", value: "4K|2160p|x2160" },
  { title: "1080P", value: "1080[pi]|x1080" },
  { title: "720P", value: "720[pi]|x720" },
];
const MP_EFFECT_OPTIONS = [
  { title: "全部", value: "" },
  { title: "杜比视界", value: "Dolby[\\s.]+Vision|DOVI|[\\s.]+DV[\\s.]+" },
  { title: "杜比全景声", value: "Dolby[\\s.]*\\+?Atmos|Atmos" },
  { title: "HDR", value: "[\\s.]+HDR[\\s.]+|HDR10|HDR10\\+" },
  { title: "SDR", value: "[\\s.]+SDR[\\s.]+" },
];

function inferSubscribePresetFromTorrent(torrentName = "", metaInfo = {}, torrentDesc = "") {
  const raw = [
    torrentName,
    torrentDesc,
    metaInfo?.edition,
    metaInfo?.resource_type,
    metaInfo?.resource_pix,
    metaInfo?.video_encode,
    metaInfo?.audio_encode,
    metaInfo?.resource_effect,
  ]
    .filter(Boolean)
    .join(" ");
  const normalized = String(raw).replace(/[._/]+/g, " ");

  let quality = "";
  let qualityLabel = "";
  if (
    /\b(?:BDMV|BDISO|MiniBD)\b/i.test(normalized) ||
    /(?:Blu-?Ray\s+(?:VC-?1|AVC)|UHD\s+Blu-?Ray\s+HEVC)/i.test(normalized)
  ) {
    quality = MP_QUALITY_OPTIONS[1].value;
    qualityLabel = MP_QUALITY_OPTIONS[1].title;
  } else if (/\bRemux\b/i.test(normalized)) {
    quality = MP_QUALITY_OPTIONS[2].value;
    qualityLabel = MP_QUALITY_OPTIONS[2].title;
  } else if (/\bBlu-?Ray\b/i.test(normalized) || /\bBDRip\b/i.test(normalized)) {
    quality = MP_QUALITY_OPTIONS[3].value;
    qualityLabel = MP_QUALITY_OPTIONS[3].title;
  } else if (/\b(?:UHD|UltraHD)\b/i.test(normalized)) {
    quality = MP_QUALITY_OPTIONS[4].value;
    qualityLabel = MP_QUALITY_OPTIONS[4].title;
  } else if (/\b(?:WEB-?DL|WEBRip)\b/i.test(normalized)) {
    quality = MP_QUALITY_OPTIONS[5].value;
    qualityLabel = MP_QUALITY_OPTIONS[5].title;
  } else if (/\bHDTV\b/i.test(normalized)) {
    quality = MP_QUALITY_OPTIONS[6].value;
    qualityLabel = MP_QUALITY_OPTIONS[6].title;
  } else if (/(?:\bHEVC\b|\b[Hx]\s*265\b)/i.test(normalized)) {
    quality = MP_QUALITY_OPTIONS[7].value;
    qualityLabel = MP_QUALITY_OPTIONS[7].title;
  } else if (/(?:\bAVC\b|\b[Hx]\s*264\b)/i.test(normalized)) {
    quality = MP_QUALITY_OPTIONS[8].value;
    qualityLabel = MP_QUALITY_OPTIONS[8].title;
  }

  let resolution = "";
  let resolutionLabel = "";
  if (/\b(?:4K|2160[pi]|x2160)\b/i.test(normalized)) {
    resolution = MP_RESOLUTION_OPTIONS[1].value;
    resolutionLabel = MP_RESOLUTION_OPTIONS[1].title;
  } else if (/\b(?:1080[pi]|x1080)\b/i.test(normalized)) {
    resolution = MP_RESOLUTION_OPTIONS[2].value;
    resolutionLabel = MP_RESOLUTION_OPTIONS[2].title;
  } else if (/\b(?:720[pi]|x720)\b/i.test(normalized)) {
    resolution = MP_RESOLUTION_OPTIONS[3].value;
    resolutionLabel = MP_RESOLUTION_OPTIONS[3].title;
  }

  let effect = "";
  let effectLabel = "";
  if (/(?:Dolby\s*Vision|\bDOVI\b|(?:^|[^A-Za-z0-9])DV(?![A-Za-z0-9]|D))/i.test(normalized)) {
    effect = MP_EFFECT_OPTIONS[1].value;
    effectLabel = MP_EFFECT_OPTIONS[1].title;
  } else if (/(?:Dolby\s*\+?\s*Atmos|\bAtmos\b)/i.test(normalized)) {
    effect = MP_EFFECT_OPTIONS[2].value;
    effectLabel = MP_EFFECT_OPTIONS[2].title;
  } else if (/\bHDR(?:10\+?)?\b/i.test(normalized)) {
    effect = MP_EFFECT_OPTIONS[3].value;
    effectLabel = MP_EFFECT_OPTIONS[3].title;
  } else if (/\bSDR\b/i.test(normalized)) {
    effect = MP_EFFECT_OPTIONS[4].value;
    effectLabel = MP_EFFECT_OPTIONS[4].title;
  }

  return {
    quality,
    resolution,
    effect,
    labels: [qualityLabel, resolutionLabel, effectLabel].filter(Boolean),
  };
}
function nextUid(prefix = "mp") {
  mpUidCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${mpUidCounter}`;
}

function debugLog(...args) {
  if (!mpDebug) return;
  console.log("[MoviePilot]", ...args);
}

function toPreview(data, limit = 360) {
  try {
    let text = typeof data === "string" ? data : JSON.stringify(data);
    return text.length > limit ? text.slice(0, limit) + " ..." : text;
  } catch (e) {
    return String(data);
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function addUnique(list, value) {
  const val = cleanText(value);
  if (val && !list.includes(val)) list.push(val);
}

function formatSizeText(bytes) {
  const n = Number(bytes || 0);
  if (!n || n <= 0) return "未知";
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let i = 0;
  let val = n;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

function parseColorLuminance(str) {
  const s = String(str || "").trim();
  if (!s || s === "transparent") return null;
  const rgb = s.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,/\s]+([\d.]+%?))?\s*\)/i);
  if (rgb) {
    let alpha = 1;
    if (rgb[4] !== undefined) {
      alpha = rgb[4].endsWith("%") ? parseFloat(rgb[4]) / 100 : parseFloat(rgb[4]);
    }
    if (alpha <= 0.08) return null;
    return (0.299 * parseInt(rgb[1], 10) + 0.587 * parseInt(rgb[2], 10) + 0.114 * parseInt(rgb[3], 10)) / 255;
  }
  const oklch = s.match(/oklch\(\s*([\d.]+)(%?)(?:\s+[\d.]+\s+[\d.]+(?:\s*\/\s*([\d.]+%?))?)?/i);
  if (oklch) {
    if (oklch[3] !== undefined) {
      const a = oklch[3].endsWith("%") ? parseFloat(oklch[3]) / 100 : parseFloat(oklch[3]);
      if (a <= 0.08) return null;
    }
    const rawL = parseFloat(oklch[1]);
    return oklch[2] === "%" ? rawL / 100 : rawL;
  }
  return null;
}

function isDarkThemePage(targetEl = null) {
  if (mpThemeMode === "dark") return true;
  if (mpThemeMode === "light") return false;
  try {
    // 1. 跳过 MoviePilot 自身节点与浮层遮罩，直接从站点原生宿主父容器开始向上实测第一个非透明背景色
    let probeStart = targetEl && targetEl.nodeType === 1 ? targetEl : null;
    if (probeStart) {
      if (
        probeStart.classList?.contains("mp-modal") ||
        probeStart.id === "mp-toast-container" ||
        probeStart.classList?.contains("mp-floating-cfg-btn")
      ) {
        probeStart = document.getElementById("mp-row-flag")?.parentElement || null;
      } else {
        while (
          probeStart &&
          (probeStart.id === "mp-row-flag" ||
            probeStart.id?.startsWith?.("mp-") ||
            String(probeStart.className || "").includes("mp-"))
        ) {
          probeStart = probeStart.parentElement;
        }
      }
    }
    const startEl =
      probeStart ||
      document.getElementById("mp-row-flag")?.parentElement ||
      document.querySelector("td.rowfollow, table.main, .details_box, #outer, main, #app");
    let cur = startEl;
    while (cur && cur.nodeType === 1) {
      const bgLum = parseColorLuminance(getComputedStyle(cur).backgroundColor);
      if (bgLum !== null) {
        return bgLum < 0.42;
      }
      cur = cur.parentElement;
    }

    // 2. 兜底检查 body / html 背景色
    for (const rootEl of [document.body, document.documentElement]) {
      if (!rootEl) continue;
      const bgLum = parseColorLuminance(getComputedStyle(rootEl).backgroundColor);
      if (bgLum !== null) {
        return bgLum < 0.42;
      }
    }

    // 3. 若整条链背景完全透明（经典 HTML 默认白底画布站点，如 keepfrds），仅在页面显式声明 dark 或文字本身为浅色时判暗色，绝不盲从系统 prefers-color-scheme
    const htmlAttr = (document.documentElement.getAttribute("data-theme") || "").toLowerCase();
    const bodyAttr = (document.body?.getAttribute("data-theme") || "").toLowerCase();
    if (htmlAttr.includes("dark") || bodyAttr.includes("dark")) return true;
    if (document.documentElement.classList.contains("dark") || document.body?.classList.contains("dark")) return true;
    const colorScheme = (getComputedStyle(document.documentElement).colorScheme || "").toLowerCase();
    if (colorScheme === "dark") return true;

    const textProbe = startEl || document.body || document.documentElement;
    if (textProbe) {
      const textLum = parseColorLuminance(getComputedStyle(textProbe).color);
      if (textLum !== null) {
        return textLum > 0.6;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}

function applyThemeClass(el) {
  if (!el) return;
  el.classList.toggle("mp-dark", isDarkThemePage(el));
}

function refreshAllThemes() {
  document
    .querySelectorAll(
      ".mp-inline-bar, .mp-mteam-panel, .mp-anime-panel, .mp-modal, #mp-toast-container, .mp-floating-cfg-btn",
    )
    .forEach((el) => {
      el.classList.toggle("mp-dark", isDarkThemePage(el));
    });
}

function getHostFromUrl(rawUrl) {
  try {
    return new URL(rawUrl).hostname.toLowerCase();
  } catch (e) {
    return "";
  }
}

function isAllowedRequestUrl(rawUrl) {
  try {
    const host = new URL(rawUrl, window.location.origin).hostname.toLowerCase();
    const mpHost = getHostFromUrl(mpUrl);
    return Boolean(mpHost) && host === mpHost;
  } catch (e) {
    return false;
  }
}

function requestWithGuard(options) {
  const targetUrl = options?.url || "";
  if (!isAllowedRequestUrl(targetUrl)) {
    debugLog("blocked request by host guard", { targetUrl, mpUrl });
    if (typeof options?.onerror === "function") {
      options.onerror({ status: 0, responseText: "Blocked by host guard" });
    }
    return;
  }
  mpGmRequest(options);
}

// V3 统一响应包装 {success, message, data}，V2 为裸数据；此处解包并兼容两者
function unwrapResponse(res) {
  try {
    let body = res && res.response;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }
    if ((body === undefined || body === null) && res && res.responseText) {
      try {
        body = JSON.parse(res.responseText);
      } catch (e) {}
    }
    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      "data" in body &&
      ("success" in body || "message" in body)
    ) {
      return body.data;
    }
    return body;
  } catch (e) {
    return res && res.response;
  }
}

function extractErrorMessage(res) {
  let body = res && res.response;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {}
  }
  if ((body === undefined || body === null) && res && res.responseText) {
    try {
      body = JSON.parse(res.responseText);
    } catch (e) {}
  }
  if (body && typeof body === "object") {
    if (body.message) return String(body.message);
    if (body.msg) return String(body.msg);
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((d) => d?.msg || JSON.stringify(d)).join("; ");
    }
  }
  return `HTTP ${res?.status || "未知"} 状态异常`;
}

function mpApiRequest(path, { method = "GET", data = null, timeout = 15000 } = {}) {
  return new Promise((resolve) => {
    if (!mpUrl || !mpApiKey) {
      resolve({ ok: false, status: 0, data: null, raw: null, message: "未配置 MoviePilot 地址或 API Key" });
      return;
    }
    const headers = { "X-Api-Key": mpApiKey, Accept: "application/json" };
    let payloadStr;
    if (data !== null && data !== undefined) {
      headers["Content-Type"] = "application/json";
      payloadStr = typeof data === "string" ? data : JSON.stringify(data);
    }
    requestWithGuard({
      url: `${mpUrl}${path}`,
      method,
      headers,
      data: payloadStr,
      responseType: "json",
      timeout,
      onload: (res) => {
        let raw = res.response;
        if (typeof raw === "string") {
          try {
            raw = JSON.parse(raw);
          } catch (e) {}
        }
        if (raw === undefined || raw === null) {
          try {
            raw = JSON.parse(res.responseText || "null");
          } catch (e) {
            raw = null;
          }
        }
        const unwrapped = unwrapResponse({ response: raw, responseText: res.responseText });
        const isHttpOk = res.status >= 200 && res.status < 300;
        const v3Rejected = raw && typeof raw === "object" && !Array.isArray(raw) && raw.success === false;
        const ok = isHttpOk && !v3Rejected;
        const message = ok
          ? raw?.message || ""
          : extractErrorMessage({ status: res.status, response: raw, responseText: res.responseText });
        resolve({ ok, status: res.status, data: unwrapped, raw, message });
      },
      onerror: (err) =>
        resolve({
          ok: false,
          status: 0,
          isTimeout: false,
          data: null,
          raw: null,
          message: err?.responseText || "网络请求失败",
        }),
      ontimeout: () =>
        resolve({
          ok: false,
          status: 0,
          isTimeout: true,
          data: null,
          raw: null,
          message: "请求超时（后端可能仍在处理）",
        }),
    });
  });
}

// ---------- 进度通知 Toast ----------
function stripToastLeadingEmoji(text) {
  return String(text || "").trim();
}

function renderToastIcon(type, title) {
  if (type === "success") {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  }
  if (type === "error") {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  }
  if (/正在|连接|下发|获取|查询|检测/.test(String(title || ""))) {
    return '<span class="mp-spinner"></span>';
  }
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
}

function scheduleToastAutoClose(toast, id, autoCloseMs) {
  if (toast._mpCloseTimer) {
    clearTimeout(toast._mpCloseTimer);
    toast._mpCloseTimer = null;
  }
  const oldBar = toast.querySelector(".mp-toast-progress");
  if (oldBar) oldBar.remove();

  if (!autoCloseMs || autoCloseMs <= 0) return;

  const bar = document.createElement("div");
  bar.className = "mp-toast-progress";
  bar.style.animation = `mp-toast-progress ${autoCloseMs}ms linear forwards`;
  toast.appendChild(bar);

  toast._mpCloseRemaining = autoCloseMs;
  toast._mpCloseStartedAt = Date.now();
  toast._mpCloseTimer = setTimeout(() => removeToast(id), autoCloseMs);
}

function createToast(title, msg, type = "info", autoCloseMs = 0) {
  let container = document.getElementById("mp-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "mp-toast-container";
    document.body.appendChild(container);
  }
  applyThemeClass(container);

  const id = nextUid("toast");
  const cleanTitle = stripToastLeadingEmoji(title) || String(title || "");
  const toast = document.createElement("div");
  toast.id = id;
  toast.className = `mp-toast ${type}`;
  toast.innerHTML = `
        <div class="mp-toast-icon">${renderToastIcon(type, cleanTitle)}</div>
        <div class="mp-toast-content">
            <div class="mp-toast-title"></div>
            <div class="mp-toast-msg"></div>
        </div>
        <button type="button" class="mp-toast-close" title="关闭">${mpIcon("x", 14)}</button>
    `;
  toast.querySelector(".mp-toast-title").textContent = cleanTitle;
  toast.querySelector(".mp-toast-msg").textContent = msg || "";
  toast.querySelector(".mp-toast-close").addEventListener("click", () => removeToast(id));

  // 鼠标悬停时暂停自动消退，移出后按剩余时间继续
  toast.addEventListener("mouseenter", () => {
    if (toast._mpCloseTimer) {
      clearTimeout(toast._mpCloseTimer);
      toast._mpCloseTimer = null;
      const elapsed = Date.now() - (toast._mpCloseStartedAt || Date.now());
      toast._mpCloseRemaining = Math.max(400, (toast._mpCloseRemaining || 0) - elapsed);
    }
  });
  toast.addEventListener("mouseleave", () => {
    if (!toast._mpCloseTimer && toast._mpCloseRemaining > 0 && toast.isConnected) {
      toast._mpCloseStartedAt = Date.now();
      toast._mpCloseTimer = setTimeout(() => removeToast(id), toast._mpCloseRemaining);
    }
  });

  container.appendChild(toast);
  scheduleToastAutoClose(toast, id, autoCloseMs);
  return id;
}

function updateToast(id, title, msg, type = "info", autoCloseMs = 0) {
  const toast = document.getElementById(id);
  if (toast) {
    const cleanTitle = stripToastLeadingEmoji(title) || String(title || "");
    toast.className = `mp-toast ${type}`;
    const iconEl = toast.querySelector(".mp-toast-icon");
    const titleEl = toast.querySelector(".mp-toast-title");
    const msgEl = toast.querySelector(".mp-toast-msg");
    if (iconEl) iconEl.innerHTML = renderToastIcon(type, cleanTitle);
    if (titleEl) titleEl.textContent = cleanTitle;
    if (msgEl) msgEl.textContent = msg || "";
    scheduleToastAutoClose(toast, id, autoCloseMs);
  }
}

function removeToast(id) {
  const toast = document.getElementById(id);
  if (toast) {
    if (toast._mpCloseTimer) {
      clearTimeout(toast._mpCloseTimer);
      toast._mpCloseTimer = null;
    }
    toast.style.opacity = "0";
    toast.style.transform = "translate3d(0, 10px, 0) scale(0.96)";
    setTimeout(() => toast.remove(), 240);
  }
}

// ---------- 统一风格自定义下拉框 & 模态框助手 ----------
function closeAllCustomSelects(exceptBox = null) {
  document.querySelectorAll(".mp-cselect.open").forEach((box) => {
    if (exceptBox && box === exceptBox) return;
    box.classList.remove("open", "open-up");
    box.querySelector(".mp-cselect-trigger")?.setAttribute("aria-expanded", "false");
  });
}

function refreshCustomSelect(selectEl) {
  if (!selectEl) return;
  const box = selectEl._mpCustomSelectBox;
  if (!box) return;
  const labelEl = box.querySelector(".mp-cselect-label");
  const menuEl = box.querySelector(".mp-cselect-menu");
  const trigger = box.querySelector(".mp-cselect-trigger");
  if (!labelEl || !menuEl || !trigger) return;

  const options = Array.from(selectEl.options || []);
  const selectedOpt = options[selectEl.selectedIndex] || options.find((o) => o.selected) || options[0];
  labelEl.textContent = selectedOpt ? selectedOpt.textContent : "";
  trigger.title = selectedOpt ? selectedOpt.textContent : "";
  trigger.disabled = Boolean(selectEl.disabled);

  menuEl.innerHTML = "";
  options.forEach((opt, idx) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `mp-cselect-option${opt.selected || idx === selectEl.selectedIndex ? " selected" : ""}`;
    item.dataset.value = opt.value;
    item.title = opt.textContent;
    item.disabled = Boolean(opt.disabled);
    item.innerHTML = `<span class="mp-cselect-opt-text">${escapeHtml(opt.textContent)}</span><span class="mp-cselect-check">${mpIcon("check", 13)}</span>`;
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      if (opt.disabled) return;
      selectEl.value = opt.value;
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      refreshCustomSelect(selectEl);
      closeAllCustomSelects();
      trigger.focus();
    });
    menuEl.appendChild(item);
  });
}

function enhanceCustomSelect(selectEl) {
  if (!selectEl) return null;
  if (selectEl._mpCustomSelectBox) {
    refreshCustomSelect(selectEl);
    return selectEl._mpCustomSelectBox;
  }

  selectEl.classList.add("mp-select-native-hidden");
  selectEl.tabIndex = -1;
  selectEl.setAttribute("aria-hidden", "true");

  const box = document.createElement("div");
  box.className = "mp-cselect";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "mp-cselect-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.innerHTML = `<span class="mp-cselect-label"></span><svg class="mp-cselect-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>`;

  const menu = document.createElement("div");
  menu.className = "mp-cselect-menu";
  menu.setAttribute("role", "listbox");

  box.appendChild(trigger);
  box.appendChild(menu);
  selectEl.parentNode?.insertBefore(box, selectEl.nextSibling);
  selectEl._mpCustomSelectBox = box;

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !box.classList.contains("open");
    closeAllCustomSelects(box);
    if (!willOpen) {
      box.classList.remove("open", "open-up");
      trigger.setAttribute("aria-expanded", "false");
      return;
    }
    box.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
    try {
      const rect = trigger.getBoundingClientRect();
      const modalBody = box.closest(".mp-modal-body");
      const containerBottom = modalBody ? modalBody.getBoundingClientRect().bottom : window.innerHeight || 720;
      const containerTop = modalBody ? modalBody.getBoundingClientRect().top : 0;
      const spaceBelow = containerBottom - rect.bottom;
      const spaceAbove = rect.top - containerTop;
      if (spaceBelow < 180 && spaceAbove > spaceBelow) {
        box.classList.add("open-up");
      } else {
        box.classList.remove("open-up");
      }
    } catch (err) {}
    const selectedItem = menu.querySelector(".mp-cselect-option.selected");
    if (selectedItem && typeof selectedItem.scrollIntoView === "function") {
      selectedItem.scrollIntoView({ block: "nearest" });
    }
  });

  trigger.addEventListener("keydown", (e) => {
    const opts = Array.from(menu.querySelectorAll(".mp-cselect-option:not(:disabled)"));
    if (!opts.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!box.classList.contains("open")) {
        trigger.click();
        return;
      }
      const curIdx = opts.findIndex((o) => o.classList.contains("selected"));
      const nextIdx = e.key === "ArrowDown" ? Math.min(curIdx + 1, opts.length - 1) : Math.max(curIdx - 1, 0);
      opts[nextIdx]?.click();
    } else if (e.key === "Enter" && box.classList.contains("open")) {
      e.preventDefault();
      closeAllCustomSelects();
    }
  });

  selectEl.addEventListener("change", () => refreshCustomSelect(selectEl));
  refreshCustomSelect(selectEl);
  return box;
}

function enhanceCustomSelects(root) {
  if (!root) return;
  root.querySelectorAll("select.mp-select").forEach(enhanceCustomSelect);
}

function renderToggleHtml(id, checked = false) {
  return `<label class="mp-toggle"><input type="checkbox" id="${escapeHtmlAttr(id)}" ${checked ? "checked" : ""}><span class="mp-toggle-track"><span class="mp-toggle-thumb"></span></span></label>`;
}

function mountModal(id, wide = false, titleHtml = "", bodyHtml = "", options = {}) {
  document.querySelectorAll(".mp-modal").forEach((el) => el.remove());
  const modal = document.createElement("div");
  if (id) modal.id = id;
  modal.className = "mp-modal";
  applyThemeClass(modal);
  modal.innerHTML = `
      <div class="mp-modal-content ${wide ? "mp-modal-wide" : ""}" role="dialog" aria-modal="true">
        <div class="mp-modal-header">
          <h3 class="mp-modal-title">${titleHtml}</h3>
          <button type="button" class="mp-close" title="关闭 (Esc)">${mpIcon("x", 16)}</button>
        </div>
        <div class="mp-modal-body">${bodyHtml}</div>
      </div>
    `;
  document.body.appendChild(modal);
  enhanceCustomSelects(modal);

  const bodyEl = modal.querySelector(".mp-modal-body");
  const closeModal = () => {
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("click", onDocClick);
    modal.remove();
    if (typeof options.onClose === "function") options.onClose();
  };
  const onDocClick = (e) => {
    if (!e.target?.closest?.(".mp-cselect")) {
      closeAllCustomSelects();
    }
  };
  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      if (modal.querySelector(".mp-cselect.open")) {
        closeAllCustomSelects();
        return;
      }
      closeModal();
    }
  };
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("click", onDocClick);
  bodyEl?.addEventListener("scroll", () => closeAllCustomSelects());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  modal.querySelector(".mp-close").addEventListener("click", closeModal);

  return { modal, closeModal };
}

// ---------- 配置弹窗 ----------
function showConfigModal() {
  const originalThemeMode = mpThemeMode;
  let savedCommitted = false;

  const bodyHtml = `
      <p class="mp-modal-desc">支持桌面端与 iOS Safari，配置持久保存在脚本管理器中。</p>

      <div class="mp-input-group">
        <label for="mp-input-url">MoviePilot 服务地址</label>
        <input type="text" class="mp-input" id="mp-input-url" placeholder="例如：http://192.168.1.100:3000" value="${escapeHtmlAttr(mpUrl)}">
      </div>

      <div class="mp-input-group">
        <label for="mp-input-apikey">API Key</label>
        <div class="mp-input-wrap">
          <input type="password" class="mp-input mp-input-with-btn" id="mp-input-apikey" placeholder="MoviePilot 设置中的 API_TOKEN" value="${escapeHtmlAttr(mpApiKey)}">
          <button type="button" class="mp-input-eye" id="mp-toggle-apikey">显示</button>
        </div>
        <p class="mp-help-text">在 MoviePilot 设定 → 系统 → 基础设置 中查看 API 密钥。</p>
      </div>

      <div class="mp-form-grid" style="margin-bottom: 12px;">
        <div class="mp-input-group">
          <label for="mp-input-theme">界面主题</label>
          <select class="mp-select" id="mp-input-theme">
            <option value="auto" ${mpThemeMode === "auto" ? "selected" : ""}>自动跟随页面</option>
            <option value="light" ${mpThemeMode === "light" ? "selected" : ""}>浅色模式</option>
            <option value="dark" ${mpThemeMode === "dark" ? "selected" : ""}>深色模式</option>
          </select>
        </div>
        <div class="mp-input-group">
          <label for="mp-input-dl-default">默认下载器</label>
          <select class="mp-select" id="mp-input-dl-default">
            <option value="">默认（由 MoviePilot 决定）</option>
            ${mpDefaultDownloader ? `<option value="${escapeHtmlAttr(mpDefaultDownloader)}" selected>${escapeHtml(mpDefaultDownloader)}</option>` : ""}
          </select>
        </div>
        <div class="mp-input-group" style="grid-column: 1 / -1;">
          <label for="mp-input-path-default">默认保存路径</label>
          <select class="mp-select" id="mp-input-path-default">
            <option value="">默认（按分类规则自动整理）</option>
            ${mpDefaultSavePath ? `<option value="${escapeHtmlAttr(mpDefaultSavePath)}" selected>${escapeHtml(mpDefaultSavePath)}</option>` : ""}
          </select>
        </div>
      </div>

      <div class="mp-switch-row">
        <div>
          <div class="mp-switch-label">显示分辨率与音视频编码标签</div>
          <div class="mp-switch-sub">关闭后仅保留媒体名、年份、季集与入库/订阅状态，界面更紧凑</div>
        </div>
        ${renderToggleHtml("mp-input-show-specs", mpShowSpecs)}
      </div>

      <div class="mp-switch-row">
        <div>
          <div class="mp-switch-label">订阅时自动填充当前种子质量与分辨率</div>
          <div class="mp-switch-sub">开启后，一键订阅或打开订阅设置时自动按种子标题预填质量、分辨率与特效（默认关闭）</div>
        </div>
        ${renderToggleHtml("mp-input-sub-autofill", mpSubAutoFillSpecs)}
      </div>

      <div class="mp-switch-row">
        <div>
          <div class="mp-switch-label">开启控制台调试日志</div>
          <div class="mp-switch-sub">在浏览器 F12 控制台输出提取与识别详情，便于排查问题</div>
        </div>
        ${renderToggleHtml("mp-input-debug", mpDebug)}
      </div>

      <div id="mp-config-status" class="mp-status-banner"></div>

      <div class="mp-modal-footer">
        <button type="button" class="mp-btn mp-btn-secondary mp-btn-lg" id="mp-clear-btn" style="flex:0 0 auto;">清空配置</button>
        <button type="button" class="mp-btn mp-btn-primary mp-btn-lg" id="mp-save-btn">验证并保存</button>
      </div>
    `;

  const { modal, closeModal } = mountModal(
    "mp-config-modal",
    false,
    `${mpIcon("settings", 16)}<span>MoviePilot 配置</span>`,
    bodyHtml,
    {
      onClose: () => {
        if (!savedCommitted && mpThemeMode !== originalThemeMode) {
          mpThemeMode = originalThemeMode;
          refreshAllThemes();
        }
      },
    },
  );

  const urlInput = modal.querySelector("#mp-input-url");
  const keyInput = modal.querySelector("#mp-input-apikey");
  const toggleKeyBtn = modal.querySelector("#mp-toggle-apikey");
  const themeSelect = modal.querySelector("#mp-input-theme");
  const defaultDlSelect = modal.querySelector("#mp-input-dl-default");
  const defaultPathSelect = modal.querySelector("#mp-input-path-default");
  const showSpecsInput = modal.querySelector("#mp-input-show-specs");
  const subAutoFillInput = modal.querySelector("#mp-input-sub-autofill");
  const debugInput = modal.querySelector("#mp-input-debug");
  const statusEl = modal.querySelector("#mp-config-status");
  const saveBtn = modal.querySelector("#mp-save-btn");
  const clearBtn = modal.querySelector("#mp-clear-btn");

  themeSelect.addEventListener("change", () => {
    mpThemeMode = themeSelect.value || "auto";
    refreshAllThemes();
  });

  if (mpUrl && mpApiKey) {
    populateClientAndPathSelects(modal, defaultDlSelect, defaultPathSelect, {
      defaultDownloader: defaultDlSelect.value,
      defaultSavePath: defaultPathSelect.value,
      preserveExisting: true,
    });
  }

  toggleKeyBtn.addEventListener("click", () => {
    const isPwd = keyInput.type === "password";
    keyInput.type = isPwd ? "text" : "password";
    toggleKeyBtn.textContent = isPwd ? "隐藏" : "显示";
  });

  const showStatus = (msg, type = "info") => {
    statusEl.style.display = "block";
    statusEl.className = `mp-status-banner ${type}`;
    const iconName = type === "success" ? "checkCircle" : type === "error" ? "xCircle" : "info";
    statusEl.innerHTML = `<div class="mp-status-banner-inner">${mpIcon(iconName, 15)}<span class="mp-status-banner-text">${escapeHtml(msg)}</span></div>`;
  };

  clearBtn.addEventListener("click", () => {
    mpSaveConfigPatch({
      url: "",
      apiKey: "",
      defaultDownloader: "",
      defaultSavePath: "",
    });
    mpUrl = "";
    mpApiKey = "";
    mpDefaultDownloader = "";
    mpDefaultSavePath = "";
    mpCachedClients = null;
    mpCachedPaths = null;
    mpCachedFilterRuleGroups = null;
    mpCachedSeasons = {};
    urlInput.value = "";
    keyInput.value = "";
    defaultDlSelect.value = "";
    defaultPathSelect.value = "";
    refreshCustomSelect(defaultDlSelect);
    refreshCustomSelect(defaultPathSelect);
    showStatus("已清空本地保存的地址、API Key 与默认下载器设置。", "info");
  });

  const doSave = () => {
    let url = urlInput.value.trim().replace(/\/+$/, "");
    let apiKey = keyInput.value.trim();

    if (!url || !apiKey) {
      showStatus("请填写完整的 MoviePilot 地址和 API Key。", "error");
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      showStatus("服务地址必须以 http:// 或 https:// 开头。", "error");
      return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="mp-spinner"></span> 正在验证...';
    showStatus("正在连接 MoviePilot 验证接口与下载器列表...", "info");

    mpGmRequest({
      method: "GET",
      url: `${url}/api/v1/user/current`,
      headers: { "X-Api-Key": apiKey, Accept: "application/json" },
      timeout: 8000,
      onload: (res) => {
        if (res.status === 200) {
          let userName = "";
          try {
            const data = JSON.parse(res.responseText);
            const userData = data && data.data ? data.data : data;
            userName = userData?.name || userData?.user_name || "";
          } catch (e) {}

          savedCommitted = true;
          mpUrl = url;
          mpApiKey = apiKey;
          mpThemeMode = themeSelect.value || "auto";
          mpDefaultDownloader = defaultDlSelect.value || "";
          mpDefaultSavePath = defaultPathSelect.value || "";
          mpShowSpecs = Boolean(showSpecsInput.checked);
          mpSubAutoFillSpecs = Boolean(subAutoFillInput.checked);
          mpDebug = Boolean(debugInput.checked);
          mpCachedPaths = null;
          mpCachedFilterRuleGroups = null;

          mpSaveConfigPatch({
            url: mpUrl,
            apiKey: mpApiKey,
            themeMode: mpThemeMode,
            defaultDownloader: mpDefaultDownloader,
            defaultSavePath: mpDefaultSavePath,
            showSpecs: mpShowSpecs,
            subAutoFillSpecs: mpSubAutoFillSpecs,
            debug: mpDebug,
          });

          refreshAllThemes();

          fetchDownloadClients(true).then((clients) => {
            saveBtn.disabled = false;
            saveBtn.textContent = "验证并保存";
            const clientMsg = clients.length
              ? `可用下载器: ${clients.map((c) => c.name).join(", ")}`
              : "未检测到启用下载器";
            showStatus(`连接成功${userName ? `（用户: ${userName}）` : ""}\n${clientMsg}`, "success");
            setTimeout(() => {
              closeModal();
              cleanupMpUi({ keepToast: true });
              insertMpRow();
            }, 850);
          });
        } else {
          saveBtn.disabled = false;
          saveBtn.textContent = "验证并保存";
          showStatus(`验证失败 (HTTP ${res.status})，请检查地址和 API Key`, "error");
        }
      },
      onerror: () => {
        saveBtn.disabled = false;
        saveBtn.textContent = "验证并保存";
        const extraHint =
          window.location.protocol === "https:" && /^http:\/\//i.test(url)
            ? "\n提示：当前站点为 HTTPS 而 MoviePilot 为 HTTP，若在 iOS Safari 上被拦截，建议为 MoviePilot 配置 HTTPS 反代"
            : "";
        showStatus(`无法连接到服务器，请检查地址是否可达或混合内容限制${extraHint}`, "error");
      },
      ontimeout: () => {
        saveBtn.disabled = false;
        saveBtn.textContent = "验证并保存";
        showStatus("连接超时，请检查网络或端口转发设置", "error");
      },
    });
  };

  saveBtn.addEventListener("click", doSave);
  [urlInput, keyInput].forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        doSave();
      }
    });
  });
  if (!isTouchOrSmallViewport()) {
    setTimeout(() => urlInput.focus(), 30);
  }
}

// 注册油猴菜单栏命令（仅在管理器支持时注册）
safeRegisterMenuCommand("设置 MoviePilot 账号", showConfigModal);
safeRegisterMenuCommand("切换调试日志", () => {
  mpDebug = !mpDebug;
  mpStorageSet("mp_debug", mpDebug);
  createToast("调试日志设置", `调试日志已${mpDebug ? "开启" : "关闭"}`, "info", 3000);
});

// ---------- UI 辅助工具 ----------
function populateClientAndPathSelects(modal, dlSelect, pathSelect, options = {}) {
  const {
    defaultDownloader = mpDefaultDownloader,
    defaultSavePath = mpDefaultSavePath,
    preserveExisting = false,
  } = options;
  return Promise.all([fetchDownloadClients(), fetchDownloadPaths()]).then(([clients, paths]) => {
    if (!modal?.isConnected) return;
    if (dlSelect && Array.isArray(clients)) {
      const curDl = preserveExisting ? dlSelect.value : "";
      clients.forEach((c) => {
        if (!c?.name) return;
        if (preserveExisting && Array.from(dlSelect.options).some((o) => o.value === c.name)) return;
        const opt = document.createElement("option");
        opt.value = c.name;
        opt.textContent = `${c.name}${c.type ? ` (${c.type})` : ""}`;
        if (defaultDownloader && defaultDownloader === c.name) opt.selected = true;
        dlSelect.appendChild(opt);
      });
      if (preserveExisting && curDl) dlSelect.value = curDl;
      refreshCustomSelect(dlSelect);
    }
    if (pathSelect && Array.isArray(paths)) {
      const curPath = preserveExisting ? pathSelect.value : "";
      paths.forEach((p) => {
        const val = p.save_path || p.download_path || "";
        if (!val) return;
        if (preserveExisting && Array.from(pathSelect.options).some((o) => o.value === val)) return;
        const opt = document.createElement("option");
        opt.value = val;
        opt.textContent = `${p.name ? p.name + " · " : ""}${p.download_path || val}`;
        if (defaultSavePath && defaultSavePath === val) opt.selected = true;
        pathSelect.appendChild(opt);
      });
      if (preserveExisting && curPath) pathSelect.value = curPath;
      refreshCustomSelect(pathSelect);
    }
  });
}

function renderTag(string, className = "mp-tag-type", titleAttr = "") {
  const title = titleAttr ? ` title="${escapeHtmlAttr(titleAttr)}"` : "";
  return `<span class="mp-tag ${className}"${title}>${escapeHtml(string)}</span>`;
}

function renderIconTag(iconName, string, className = "mp-tag-type", titleAttr = "", trailingIconName = "") {
  const title = titleAttr ? ` title="${escapeHtmlAttr(titleAttr)}"` : "";
  const lead = iconName ? mpIcon(iconName, 12) : "";
  const trail = trailingIconName ? mpIcon(trailingIconName, 11) : "";
  return `<span class="mp-tag ${className}"${title}>${lead}<span>${escapeHtml(string)}</span>${trail}</span>`;
}

function renderMoviepilotTag(type, contentHtml, row = null) {
  const darkCls = isDarkThemePage(row) ? " mp-dark" : "";
  if (type === "common") {
    const headCls = row?.dataset?.mpRowHeadClass || "rowhead nowrap";
    const followCls = row?.dataset?.mpRowFollowClass || "rowfollow";
    return `<td class="${escapeHtmlAttr(headCls)}" style="vertical-align:middle;">MoviePilot</td><td class="${escapeHtmlAttr(followCls)}" style="vertical-align:middle;text-align:left;"><div class="mp-inline-bar${darkCls}">${contentHtml}</div></td>`;
  }
  return `<div class="mp-inline-bar${darkCls}">${contentHtml}</div>`;
}

function getSize(sizeStr) {
  if (!sizeStr) return 0;
  const normalized = String(sizeStr).replace(/,/g, "");
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(TiB|GiB|MiB|KiB|TB|GB|MB|KB|Bytes?|B)\b/i);
  if (!match) return 0;
  const size = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  switch (unit) {
    case "B":
    case "BYTE":
    case "BYTES":
      return Math.round(size);
    case "KB":
    case "KIB":
      return Math.round(size * 1024);
    case "MB":
    case "MIB":
      return Math.round(size * 1024 ** 2);
    case "GB":
    case "GIB":
      return Math.round(size * 1024 ** 3);
    case "TB":
    case "TIB":
      return Math.round(size * 1024 ** 4);
    default:
      return 0;
  }
}

// ---------- 标题与副标题清洗核心 ----------
function cleanSubtitleText(rawText) {
  if (!rawText) return "";

  let raw = String(rawText)
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\[checked\s+by\s+[^\]]*\]/gi, " ")
    .replace(/\bautoup\b/gi, " ");

  // 1. 先移除跨行或行尾的复合评分（如 "\n7.2\n/10"、"[简繁中日双语字幕]7.2/10"、"| 豆瓣评分: 7.2/10 (1,234人评价)"）
  const trailingCompoundScoreRe =
    /(?:\s*(?:[|｜/／,，;；\-]\s*)?[\[【(（]?\s*(?:(?:豆瓣|IMDb|IMDB|TMDB|烂番茄|Rotten\s*Tomatoes|Metacritic)\s*(?:评分)?\s*[：:]?\s*)?(?:暂无评分|N\/A|NaN|\d+(?:\.\d+)?\s*\/\s*(?:10|100)|\d{1,3}%\s*(?:烂番茄|新鲜度|爆米花|Rotten\s*Tomatoes)?)(?:\s*[|｜/／]?\s*(?:[(（]?(?:from\s*)?[\d,]+\s*(?:users?|votes?|人(?:评分|评价)?)[)）]?))?\s*[\]】)）]?)+\s*$/i;
  const trailingLabeledScoreRe =
    /(?:\s*(?:[|｜/／,，;；\-]\s*)?[\[【(（]?\s*(?:豆瓣|IMDb|IMDB|TMDB|烂番茄|Rotten\s*Tomatoes|Metacritic)\s*(?:评分)?\s*[：:]?\s*(?:暂无评分|N\/A|NaN|\d+(?:\.\d+)?(?:\s*\/\s*(?:10|100)|\s*分)?)(?:\s*[|｜/／]?\s*(?:[(（]?(?:from\s*)?[\d,]+\s*(?:users?|votes?|人(?:评分|评价)?)[)）]?))?\s*[\]】)）]?)+\s*$/i;

  for (let i = 0; i < 4; i++) {
    const next = raw.replace(trailingCompoundScoreRe, "").replace(trailingLabeledScoreRe, "");
    if (next === raw) break;
    raw = next;
  }

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (!lines.length) return "";

  const isExplicitRatingLine = (s) =>
    /^(?:(?:豆瓣|IMDb|IMDB|TMDB|烂番茄|Rotten\s*Tomatoes|Metacritic)\s*(?:评分)?\s*[：:]?\s*)?(?:暂无评分|N\/A|NaN|[★☆\s]*(?:\d+(?:\.\d+)?\s*\/\s*(?:10|100)|\/\s*(?:10|100)|\d{1,3}%)(?:\s*[|｜/／]?\s*(?:[(（]?(?:from\s*)?[\d,]+\s*(?:users?|votes?|人(?:评分|评价)?)[)）]?))?|(?:[(（]?(?:from\s*)?[\d,]+\s*(?:users?|votes?|人(?:评分|评价)?)[)）]?)|(?:豆瓣|IMDb|IMDB|TMDB|烂番茄|Rotten\s*Tomatoes|Metacritic)(?:\s*评分)?\s*[：:]?)$/i.test(
      s,
    );

  const isTrailingScoreFragment = (s) =>
    isExplicitRatingLine(s) || (/^(?:\d+(?:\.\d+)?\s*分|\d+(?:\.\d+)?)$/i.test(s) && !/^(?:19|20)\d{2}$/.test(s));

  while (lines.length > 1 && isTrailingScoreFragment(lines[lines.length - 1])) {
    lines.pop();
  }

  const filtered = lines.filter((line, idx) => idx === 0 || !isExplicitRatingLine(line));
  let text = filtered.join(" ").replace(/\s+/g, " ").trim();

  for (let i = 0; i < 4; i++) {
    const next = text
      .replace(trailingCompoundScoreRe, "")
      .replace(trailingLabeledScoreRe, "")
      .replace(/\s*[|｜/／\-]\s*$/, "");
    if (next === text) break;
    text = next;
  }

  return text.replace(/\s+/g, " ").trim();
}

function isPureRatingFragmentText(text) {
  const clean = cleanText(text);
  if (!clean) return true;
  return /^(?:[|｜/／,，;；:：\-·•★☆()（）[\]【】\s]|\d+(?:\.\d+)?|\/\s*(?:10|100)|暂无评分|N\/A|NaN|豆瓣|IMDb|IMDB|TMDB|烂番茄|Rotten\s*Tomatoes|Metacritic|评分|分|from|users?|votes?|人(?:评分|评价)?)+$/i.test(
    clean,
  );
}

function extractCleanSubtitle(cell) {
  if (!cell) return "";
  const clone = cloneInertNode(cell);

  clone
    .querySelectorAll(
      '#titleEditBox, script, style, button, input, select, textarea, [hidden], [style*="display:none"], [style*="display: none"]',
    )
    .forEach((el) => el.remove());

  const ratingSelectors = [
    "img.rating-icon",
    '[class*="rating-icon"]',
    '[class*="rating-box"]',
    '[class*="rating_box"]',
    '[class*="rating-badge"]',
    ".rating",
    ".ratings",
    ".douban-rating",
    ".imdb-rating",
    ".tmdb-rating",
    'img[src*="douban"]',
    'img[src*="imdb"]',
    'img[src*="tmdb"]',
    'img[src*="rotten"]',
    'img[src*="metacritic"]',
    'img[src*="icon-rt"]',
    'img[src*="icon-mc"]',
    'img[alt*="豆瓣"]',
    'img[alt*="IMDb"]',
    'img[alt*="IMDB"]',
    'img[alt*="TMDB"]',
    'img[alt*="评分"]',
    '[title*="豆瓣"]',
    '[title*="IMDb"]',
    '[title*="IMDB"]',
    '[title*="TMDB"]',
    '[title*="Rotten Tomatoes"]',
    '[title*="烂番茄"]',
    '[title*="Metacritic"]',
    '[title*="评分:"]',
    '[title*="评分："]',
    '[title*="评分"]',
    'a[href*="movie.douban.com/subject/"]',
    'a[href*="imdb.com/title/"]',
    'a[href*="themoviedb.org/"]',
    'a[href*="rottentomatoes.com/"]',
    'a[href*="metacritic.com/"]',
  ].join(", ");

  clone.querySelectorAll(ratingSelectors).forEach((node) => {
    if (!node.isConnected && !clone.contains(node)) return;

    const rightContainer = node.closest(
      '[style*="margin-left:auto"], [style*="margin-left: auto"], [style*="float:right"], [style*="float: right"], .ml-auto, .float-right, [class*="ml-auto"]',
    );
    if (rightContainer && rightContainer !== clone && clone.contains(rightContainer)) {
      rightContainer.remove();
      return;
    }

    const wrapper = node.closest(
      'a, span[title*="评分"], div[title*="评分"], [class*="rating"], [class*="douban"], [class*="imdb"], [class*="tmdb"]',
    );
    const target = wrapper && wrapper !== clone && clone.contains(wrapper) ? wrapper : node;
    const parent = target.parentElement;
    target.remove();

    // 若父容器移除评分链接/图标后仅剩 "7.2" "/10" "(1234人评价)" 等纯评分碎片，一并清除
    let cursor = parent;
    for (let depth = 0; depth < 2 && cursor && cursor !== clone; depth++) {
      const p = cursor.parentElement;
      if (isPureRatingFragmentText(cursor.textContent || "")) {
        cursor.remove();
        cursor = p;
      } else {
        break;
      }
    }
  });

  return cleanSubtitleText(clone.innerText || clone.textContent || "");
}

const ANIME_TECH_TOKEN_RE =
  /^(?:BDMV|BDRip|TVRip|DVDRip|DVDISO|BDISO|BD-?BOX|BOX|Remux|WEB-?DL|WEBRip|HDTV|Movie|TV|OVA|OAD|OAV|SP|Special|Fin|Batch|Complete|4320p|2160p|1080[pi]|720[pi]|576[pi]|480[pi]|4K|UHD|AVC|HEVC|H\.?26[45]|x26[45]|10bit|8bit|Ma10p|Hi10p|FLAC|LPCM|PCM|AAC|AC3|EAC3|DDP|DTS(?:-?HD)?|TrueHD|Atmos|MKV|MP4|GB|BIG5|CHS|CHT|JPSC|JPTC|简繁|简体|繁体|中字|双语|内封|外挂|内嵌|JPN|JP|ENG|EN|R2J.*|Vol\.?\d+|Disc\.?\d+|S\d{1,2}(?:E\d{1,3})?|\d{1,3}(?:[-~]\d{1,3})?(?:Fin|END|全集)?|v\d+|(?:19|20)\d{2}(?:[-.](?:19|20)\d{2})?)$/i;

function isReleaseGroupOrTagBracket(innerText) {
  const t = cleanText(innerText);
  if (!t) return true;
  if (ANIME_TECH_TOKEN_RE.test(t)) return true;
  // 如 "[VCB-Studio]"、"[ANi]"、"[LoliHouse]"、"[新番]"、"[Baha]"、"[Lilith-Raws]"
  if (/^[A-Za-z0-9._-]+(?:-[A-Za-z0-9._-]+)*$/.test(t) && !/\s/.test(t) && t.length <= 24) return true;
  if (/(?:字幕组|字幕社|压制|发布|Raws|Sub|Fansub|Studio|Web|Rip|搬运)/i.test(t)) return true;
  return false;
}

function extractBracketTitleCandidates(rawTitle) {
  const results = [];
  const matches = String(rawTitle || "").match(/[\[【]([^\]】]{2,80})[\]】]/g) || [];
  matches.forEach((m, idx) => {
    const inner = cleanText(m.slice(1, -1));
    if (!inner) return;
    if (idx === 0 && isReleaseGroupOrTagBracket(inner)) return;
    if (ANIME_TECH_TOKEN_RE.test(inner)) return;
    const words = inner.split(/[\s._+/&-]+/).filter(Boolean);
    if (words.length > 0 && words.every((w) => ANIME_TECH_TOKEN_RE.test(w))) return;
    // 含中文/日文，或含空格的非纯技术英文标题，极可能是片名
    if (/[\u4e00-\u9fa5\u3040-\u30ff]/.test(inner) || /\s+/.test(inner)) {
      if (!/(?:字幕|内封|外挂|简繁|双语|国语|粤语|日语|音轨|合集|全集|完结|第\d+季)/i.test(inner)) {
        addUnique(results, inner);
      }
    }
  });
  return results;
}

function extractReleaseTeam(rawTitle) {
  if (!rawTitle) return "";
  const title = String(rawTitle)
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.(?:torrent|mkv|mp4|avi|ts|m2ts|flv|wmv)$/i, "")
    .trim();
  if (!title) return "";

  const lead = title.match(/^\s*(?:\[([^\]]{1,40})\]|【([^】]{1,40})】)/);
  if (lead) {
    const inner = cleanText(lead[1] || lead[2] || "");
    const nonGroupLeadRe =
      /^(?:\d+(?:[-~]\d+)?(?:Fin|End|完结)?|(?:\d{1,2}月)?新番|合集|连载|完结|整理|搬运|转自|招募|自购|自压|简繁|简体|繁体|双语|国语|粤语|中字)$/i;
    if (inner && inner.length <= 36 && !ANIME_TECH_TOKEN_RE.test(inner) && !nonGroupLeadRe.test(inner)) {
      return inner;
    }
  }

  const techRe =
    /\b(?:4320p|2160p|1080[pi]|720[pi]|480[pi]|WEB-?DL|WEBRip|Blu-?Ray|BDRip|Remux|HDTV|DVDRip|H\.?26[45]|x26[45]|HEVC|AVC|AV1|AAC|AC3|EAC3|DDP|DTS(?:-?HD)?|FLAC|OPUS|LPCM|TrueHD|Atmos|HDR10?\+?|DoVi|DV|10bit|8bit)\b/gi;
  let lastTechEnd = -1;
  let m;
  while ((m = techRe.exec(title)) !== null) {
    lastTechEnd = m.index + m[0].length;
  }
  if (lastTechEnd > 0) {
    const tail = title.slice(lastTechEnd);
    const tailMatch =
      tail.match(/(?:[-–]\s*([A-Za-z0-9][A-Za-z0-9._@]{1,28}))\s*$/) ||
      tail.match(/\s+@([A-Za-z0-9][A-Za-z0-9._]{1,24})\s*$/);
    if (tailMatch) {
      const team = cleanText(tailMatch[1] || "");
      const invalidTailRe = /^(?:HD|DL|Rip|264|265|bit|Plus|Part\d*|Vol\.?\d*|Disc\.?\d*|CD\d*|Ep?\d+|\d+(?:\.\d+)?)$/i;
      if (team && !ANIME_TECH_TOKEN_RE.test(team) && !invalidTailRe.test(team)) {
        return team;
      }
    }
  }
  return "";
}

function normalizeTorrentTitle(rawTitle) {
  if (!rawTitle) return "";
  let title = String(rawTitle).replace(/\s+/g, " ").trim();

  title = title.replace(/\.torrent$/i, "").replace(/\.(mkv|mp4|avi|ts|m2ts|flv|wmv)$/i, "");

  // 只剥离明显属于发布组/技术标签/年份的前导括号，避免把全括号片名剥成空串
  for (let i = 0; i < 4; i++) {
    const m = title.match(/^\s*(?:\[([^\]]{1,36})\]|\(([^)]{1,36})\)|【([^】]{1,36})】|<([^>]{1,36})>)(?:[\s._-]*|$)/);
    if (!m) break;
    const inner = m[1] || m[2] || m[3] || m[4] || "";
    const rest = title.slice(m[0].length).trim();
    if (!rest) break;
    if (i === 0 || isReleaseGroupOrTagBracket(inner)) {
      title = rest;
    } else {
      break;
    }
  }

  // 若剩余主体被单组方括号包裹（如 "[鬼灯の冷徹][01-13]" 剥离后首段），先展开首段括号片名
  const wrappedLead = title.match(/^[\[【]([^\]】]{2,80})[\]】](.*)$/);
  if (wrappedLead && !isReleaseGroupOrTagBracket(wrappedLead[1])) {
    title = `${wrappedLead[1]} ${wrappedLead[2]}`.trim();
  }

  title = title
    .replace(/^[^A-Za-z0-9\u4e00-\u9fa5\u3040-\u30ff\[【]+/, "")
    .replace(/^[A-Za-z0-9]{2,10}\]\s*/, "")
    .replace(/^[\]\)\】\}]+/, "");

  title = title.replace(/[._]+/g, " ");
  let noisyPart = title.match(
    /\b(?:4320p|2160p|1080p|720p|480p|web[-\s]?dl|webrip|bluray|bdrip|hdtv|dvdrip|remux|h\.?26[45]|x26[45]|hevc|avc|aac(?:\d\.\d)?|ddp?\d(?:\.\d)?|dts(?:-hd)?|atmos|hdr10\+?|dolby[\s-]?vision|10bit|8bit)\b/i,
  );
  if (noisyPart && noisyPart.index > 0) {
    let cutIdx = noisyPart.index;
    while (cutIdx > 0 && /[\[\(【\s\-]/.test(title[cutIdx - 1])) cutIdx--;
    if (cutIdx > 0) title = title.slice(0, cutIdx);
  }

  title = title
    .replace(
      /(?:\s*\[(?:免费|Free|2X免费|2X\s*Free|2X|50%|30%|2X\s*50%|折扣|促销|置顶|热门|经典|推荐|已审|未审|通过)\])+(?:\s*剩余时间[:：].*)?$/gi,
      "",
    )
    .replace(/\s*剩余时间[:：].*$/i, "")
    .replace(/\s+free\s+\d+\s*h(?:\s+\d+\s*min)?$/i, "")
    .replace(/\s+-[A-Za-z0-9][A-Za-z0-9._-]*$/, "")
    .replace(/[\[\(【\s-]+$/g, "");
  return title.replace(/\s+/g, " ").trim();
}

function stripTrailingPromoAndCountdown(rawText) {
  let text = cleanText(rawText);
  if (!text) return "";
  for (let i = 0; i < 3; i++) {
    const next = text
      .replace(
        /(?:\s*\[[^\]]*(?:免费|免費|free|2x|50%|30%|折扣|促销|促銷|置顶|置頂|热门|熱門|经典|經典|推荐|推薦|已审|已審|未审|未審|通过|通過)[^\]]*\])+(?:\s*(?:剩余时间|剩餘時間|剩余|剩餘)[:：].*)?$/gi,
        "",
      )
      .replace(
        /(?:[\s|｜/·•\-—]+)?(?:2X\s*Free|2X\s*50%|2X\s*30%|2X\s*免费|2X\s*免費|Free|免费|免費|限時免費|限时免费|50%|30%|2X)\s*(?:[:：]?\s*(?:剩余时间|剩餘時間|剩余|剩餘|remaining|ends?\s*in)\s*[:：]?)?(?:\s*(?:\d+\s*(?:天|日|days?|d|小时|小時|时|時|hours?|hrs?|h|分钟|分鐘|分|mins?|m|秒|secs?|s)|\d{1,2}:\d{2}(?::\d{2})?|\([^)]{1,24}\)|（[^）]{1,24}）))+\s*$/gi,
        "",
      )
      .replace(/(?:[\s|｜]+)(?:FREE|2XFree|2X\s*Free|2X\s*50%|2X\s*30%|限時免費|限时免费|免费|免費)\s*$/g, "")
      .replace(/\s+(?:FREE|2XFree|限時免費|限时免费)\s*$/i, "")
      .replace(
        /(?:\s+(?:剩余时间|剩餘時間|剩余|剩餘)\s*[:：]?|\s+)(?:\d+\s*(?:天|日|小时|小時|时|時|分钟|分鐘|分|秒)\s*){1,4}\s*$/i,
        "",
      )
      .replace(/\s*(?:剩余时间|剩餘時間)[:：].*$/i, "")
      .trim();
    if (next === text) break;
    text = next;
  }
  return text;
}

function cleanRawHeadingText(rawText) {
  return stripTrailingPromoAndCountdown(
    cleanText(rawText)
      .replace(/^(?:\[[A-Za-z0-9]{2,12}\]\s*[._-]+\s*)+/, "")
      .replace(/\s*\[\s*\]\s*/g, " ")
      .replace(/\s+\b(?:通过|未审|已审)\b.*$/i, "")
      .replace(/\.torrent$/i, ""),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function isMTeamHost() {
  return /(^|\.)m-team\.(?:cc|io)$/i.test(window.location.hostname);
}

function isMTeamDetailPage() {
  return isMTeamHost() && /^\/detail\/\d+/.test(window.location.pathname);
}
function isSunnyPTSite() {
  return /(^|\.)sunnypt\.top$/i.test(window.location.hostname);
}

function isSunnyPTDetailPage() {
  return isSunnyPTSite() && /^\/torrent\/\d+/.test(window.location.pathname);
}

function getCurrentSunnyPTTid() {
  const m = window.location.pathname.match(/^\/torrent\/(\d+)/);
  return m ? m[1] : "";
}

function isAnimeSiteHost() {
  const h = window.location.hostname.toLowerCase();
  return /(^|\.)nyaa\.si$|(^|\.)dmhy\.org$|(^|\.)mikanani\.me$|(^|\.)bangumi\.moe$|(^|\.)acgnx\.se$|(^|\.)anibt\.net$/.test(
    h,
  );
}

function shouldProcessCurrentPage() {
  const h = window.location.hostname.toLowerCase();
  const p = window.location.pathname;
  if (isMTeamHost()) return isMTeamDetailPage();
  if (isSunnyPTSite()) return isSunnyPTDetailPage();
  if (/(^|\.)nyaa\.si$/.test(h)) return /^\/view\/\d+/.test(p);
  if (/(^|\.)dmhy\.org$/.test(h)) return /^\/topics\/view\//.test(p);
  if (/(^|\.)mikanani\.me$/.test(h)) return /^\/Home\/Episode\//i.test(p);
  if (/(^|\.)bangumi\.moe$/.test(h)) return /^\/torrent\//.test(p);
  if (/(^|\.)acgnx\.se$/.test(h)) return /^\/show-/.test(p);
  if (/(^|\.)anibt\.net$/.test(h)) return /(?:^|\/[a-z]{2}(?:-[a-z0-9]+)?)\/release\/[^/?#]+/i.test(p);
  if (/\.php$/i.test(p)) {
    return (
      /\/details[^/]*\.php$/i.test(p) || (/\/forum\.php$/i.test(p) && /mod=viewthread/i.test(window.location.search))
    );
  }
  return true;
}

function isSpringSundaySite() {
  return /(^|\.)springsunday\.net$/i.test(window.location.hostname);
}

function isQingwaSite() {
  return /(^|\.)qingwa\./i.test(window.location.hostname) || /(^|\.)keepfrds\.com$/i.test(window.location.hostname);
}

function isHDWinGSite() {
  return (
    /(^|\.)hdwing\.org$/i.test(window.location.hostname) ||
    Boolean(document.querySelector("a.torrentdown_button, #clip_target, .m_name"))
  );
}

function isQingwaLikeLayout() {
  if (isSpringSundaySite() || isQingwaSite()) return true;
  return Boolean(document.getElementById("qingwa-head") && document.querySelector("h1#top"));
}

function extractCleanHeadingTitle(customEl = null) {
  const h1 = customEl || document.querySelector("h1#top") || document.querySelectorAll("h1")[0];
  if (!h1) return "";

  const clone = cloneInertNode(h1);
  const promoSelectors = [
    "font.free",
    "font.twoup",
    "font.twoupfree",
    "font.halfdown",
    "font.twouphalfdown",
    "font.thirtypercent",
    '[class*="pro_free"]',
    '[class*="pro_50"]',
    '[class*="pro_30"]',
    '[class*="pro_2up"]',
    'img[class*="pro_"]',
    "span.label",
    "span.badge",
    '[class*="promotion"]',
    "span.sp_state_placeholder",
    "#bookmark0",
    'a[href*="bookmark"]',
    "script",
    "style",
    "button",
    "input",
  ].join(", ");

  clone.querySelectorAll(promoSelectors).forEach((el) => {
    const b = el.closest("b");
    if (b && b !== clone && cleanText(b.textContent).length < 40) b.remove();
    else el.remove();
  });

  return cleanRawHeadingText(clone.textContent || h1.innerText || "");
}

function cleanupMpUi(options = {}) {
  const row = document.getElementById("mp-row-flag");
  if (row) {
    if (row.tagName !== "TR") {
      const next = row.nextElementSibling;
      if (next && next.querySelector("#moviepilot")) next.remove();
    }
    row.remove();
  }
  document.querySelectorAll(".mp-modal").forEach((el) => el.remove());
  document.getElementById("mp-floating-cfg-btn")?.remove();
  if (!options.keepToast) {
    let toast = document.getElementById("mp-toast-container");
    if (toast) toast.remove();
  }
}

function findMTeamTitleAnchor() {
  const exactSelector =
    "#app-content > div > div.app-content__inner.px-\\[40px\\].flex.flex-col.justify-between > div.mx-auto.w-full > div.flex.py-5.mb-5.border-0.border-b.border-solid.border-\\[--mt-line-color\\].sticky.items-start.top-0.z-\\[999\\].bg-mt-primary-1.text-\\[--mt-text-base\\] > div.flex-grow.w-1.flex.flex-col.justify-between > div:nth-child(2) > div.ant-space.css-4dguzz.ant-space-horizontal.ant-space-align-center.ant-space-gap-row-small.ant-space-gap-col-small.gap-x-\\[18px\\].gap-y-0.text-\\[--mt-text-base\\]";
  const looseSelector = "#app-content div.app-content__inner div.flex-grow > div:nth-child(2) > div.ant-space";
  const node =
    document.querySelector(looseSelector) ||
    document.querySelector(exactSelector) ||
    document.querySelector("h2 > span:nth-child(3), h2 > span, h2");
  return node || null;
}

function createMTeamMountNode() {
  const anchor = findMTeamTitleAnchor();
  if (!anchor) {
    const missKey = `${window.location.pathname}|mount-missing`;
    if (mpLastMTeamMountMissingLogKey !== missKey) {
      mpLastMTeamMountMissingLogKey = missKey;
      debugLog("m-team mount not found: waiting for title anchor");
    }
    return null;
  }

  const anchorText = cleanText(anchor.textContent || "");
  if (!anchorText || /^m-team$/i.test(anchorText) || anchorText.length < 6) {
    return null;
  }

  const panel = document.createElement("div");
  panel.id = "mp-row-flag";
  panel.className = "mp-mteam-panel";
  applyThemeClass(panel);
  panel.innerHTML =
    '<div class="mp-mteam-title">MoviePilot</div><div id="mp-mteam-content" class="mp-mteam-tags">初始化中...</div>';
  anchor.insertAdjacentElement("afterend", panel);

  return panel.querySelector("#mp-mteam-content") || panel;
}

function isMTeamPageDataReady() {
  if (!isMTeamDetailPage()) return false;
  const titleAnchor = findMTeamTitleAnchor();
  const anchorText = cleanText(titleAnchor?.textContent || "");
  const fieldCount = document.querySelectorAll(".ant-descriptions-item-label").length;
  const pageTitle = cleanText(document.title || "");
  const nativeBtn = findMTeamNativeDownloadButton();

  if (!titleAnchor) return false;
  if (!anchorText || /^m-team$/i.test(anchorText) || anchorText.length < 6) return false;
  if (nativeBtn) return true;
  if (fieldCount >= 2) return true;
  if (pageTitle && !/^m-team$/i.test(pageTitle) && /detail|種子詳情|torrent/i.test(pageTitle)) return true;
  return false;
}

function stripEpisodeInfo(title) {
  return String(title || "")
    .replace(/\bS\d{1,2}E\d{1,3}(?:\s*[-~]\s*E?\d{1,3})?\b/gi, " ")
    .replace(/\bS\d{1,2}\b/gi, " ")
    .replace(/\bE\d{1,3}(?:\s*[-~]\s*E?\d{1,3})?\b/gi, " ")
    .replace(/\b第\s*\d+(?:\s*[-~]\s*\d+)?\s*[季集期话話]\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSubtitleCandidates(subtitle) {
  let results = [];
  let add = (v) => {
    let val = String(v || "")
      .replace(/\s+/g, " ")
      .trim();
    if (val && !results.includes(val)) results.push(val);
  };

  if (!subtitle) return results;
  let clean = cleanSubtitleText(subtitle)
    .replace(/[|｜]\s*(?:类型|類型|主演|导演|導演|年份|地区|地區)\s*[:：].*$/i, " ")
    .replace(/\*[^*]{1,40}\*/g, " ")
    .replace(/\[[^\]]{1,40}\]/g, " ")
    .replace(/【[^】]{1,40}】/g, " ")
    .replace(/[|｜]/g, "/")
    .replace(/\s+/g, " ")
    .trim();

  clean.split(/\s*\/\s*/).forEach((part) => {
    let p = String(part || "").trim();
    if (!p || /^(?:类型|類型|主演|导演|導演)\s*[:：]/i.test(p)) return;
    p = p
      .replace(/(?:评论音轨|多国语字幕|字幕|中字|簡繁|简繁|国语|日语|英语|粤语|双语|音轨|內封|外挂|內嵌).*/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    add(p);
    let stripped = stripEpisodeInfo(p);
    if (stripped && stripped !== p) add(stripped);
  });

  return results.slice(0, 8);
}

function getRecognitionCandidates(rawTitle, subtitle = "") {
  let candidates = [];
  let addCandidate = (title) => {
    let val = String(title || "")
      .replace(/\s+/g, " ")
      .replace(/\.torrent$/i, "")
      .replace(/\.(mkv|mp4|avi|ts|m2ts|flv|wmv)$/i, "")
      .replace(/^[A-Za-z0-9]{2,10}\]\s*/, "")
      .trim();
    if (val && !candidates.includes(val)) candidates.push(val);
  };

  let cleanedRaw = cleanRawHeadingText(rawTitle);
  let normalized = normalizeTorrentTitle(cleanedRaw);
  let withoutEpisode = stripEpisodeInfo(normalized);
  let slashAlias = normalized.split(/\s*\/\s*/)[0].trim();
  let hasTvPattern =
    /\bS\d{1,2}(?:E\d{1,3})?\b/i.test(normalized) ||
    /\bE\d{1,3}(?:\s*[-~]\s*E?\d{1,3})?\b/i.test(normalized) ||
    /第\s*\d+(?:\s*[-~]\s*\d+)?\s*[季集期话話]/.test(normalized);

  addCandidate(cleanedRaw);
  addCandidate(normalized);
  addCandidate(slashAlias);
  addCandidate(withoutEpisode);
  extractBracketTitleCandidates(cleanedRaw).forEach(addCandidate);
  extractSubtitleCandidates(subtitle).forEach(addCandidate);

  if (!hasTvPattern) {
    let yearMatch = normalized.match(/\b(?:19|20)\d{2}\b/);
    if (yearMatch) {
      let year = yearMatch[0];
      let noYear = normalized
        .replace(new RegExp(`\\b${year}\\b`, "g"), " ")
        .replace(/\(\s*\)/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      addCandidate(noYear);
      if (noYear) {
        addCandidate(`${noYear} ${year}`);
        addCandidate(`${noYear} (${year})`);
      }
    }
  }

  return candidates.slice(0, 10);
}

function findRowFollowByHeader(rows, headerRegex) {
  for (const rowHead of rows) {
    const label = cleanText(rowHead.textContent || "");
    if (headerRegex.test(label)) {
      return rowHead.nextElementSibling || null;
    }
  }
  return null;
}

function extractNexusDownloadLink(rows) {
  const passkeyInput = document.querySelector(
    '#passkeyDlUrl, #download_link, input[value*="download.php?"][value*="downhash="], input[value*="download.php?"][value*="passkey="]',
  );
  if (passkeyInput && passkeyInput.value) {
    try {
      return new URL(passkeyInput.value.trim(), window.location.origin).href;
    } catch (e) {}
  }

  const directPasskeyAnchor = document.querySelector(
    'a[href*="download.php?"][href*="downhash="], a[href*="download.php?"][href*="passkey="]',
  );
  if (directPasskeyAnchor?.href) return directPasskeyAnchor.href;

  const dlCell = findRowFollowByHeader(rows, /^(?:下载|下載|种子链接|種子鏈接|下载链接|下載鏈接|Download)$/i);
  const dlAnchor =
    dlCell?.querySelector('a[href*="download.php"], a.index, a[href*=".torrent"]') ||
    document.querySelector(
      'a.index[href*="download.php"], a[href*="download.php?id="], a[href*="download.php"], a[href*=".torrent"]',
    ) ||
    rows[0]?.nextElementSibling?.firstElementChild;
  return dlAnchor?.href || "";
}

function extractPageTorrentMeta() {
  const mteamDetail = isMTeamDetailPage() ? getCachedMTeamDetail(getCurrentMTeamTid()) : null;
  const sunnyDetail = isSunnyPTDetailPage() ? mpSunnyPTDetailCache[getCurrentSunnyPTTid()] : null;
  let imdbid = null;
  const imdbContainer = document.querySelector(
    "#kimdb, #kdescr, .ant-descriptions, .topic-main, #torrent_description, main",
  );
  const imdbAnchor = document.querySelector('#kimdb a[href*="imdb.com/title/tt"], a[href*="imdb.com/title/tt"]');
  const imdbMatch =
    (mteamDetail?.imdb || sunnyDetail?.imdb_url || "").match(/tt\d{6,9}/i) ||
    (imdbAnchor?.href || "").match(/tt\d{6,9}/i) ||
    (imdbContainer?.textContent || "").match(/imdb\.com\/title\/(tt\d{6,9})/i) ||
    (document.getElementById("kimdb")?.textContent || "").match(/\b(tt\d{6,9})\b/i);
  if (imdbMatch) imdbid = (imdbMatch[1] || imdbMatch[0]).toLowerCase();

  let tmdbId = null;
  let tmdbType = null;
  const tmdbAnchor = document.querySelector('a[href*="themoviedb.org/movie/"], a[href*="themoviedb.org/tv/"]');
  const tmdbMatch =
    (sunnyDetail?.tmdb_url || "").match(/themoviedb\.org\/(movie|tv)\/(\d+)/i) ||
    (tmdbAnchor?.href || "").match(/themoviedb\.org\/(movie|tv)\/(\d+)/i) ||
    (imdbContainer?.textContent || "").match(/themoviedb\.org\/(movie|tv)\/(\d+)/i);
  if (tmdbMatch) {
    tmdbType = tmdbMatch[1].toLowerCase() === "tv" ? "电视剧" : "电影";
    tmdbId = tmdbMatch[2];
  }

  let doubanId = null;
  const doubanContainer = document.querySelector(
    "#kdouban, .douban_content, #kdescr, .ant-descriptions, .topic-main, main",
  );
  const doubanAnchor = document.querySelector(
    '#kdouban a[href*="movie.douban.com/subject/"], .douban_content a[href*="movie.douban.com/subject/"], a[href*="movie.douban.com/subject/"]',
  );
  const doubanMatch =
    (mteamDetail?.douban || sunnyDetail?.douban_url || "").match(/movie\.douban\.com\/subject\/(\d+)/i) ||
    (doubanAnchor?.href || "").match(/movie\.douban\.com\/subject\/(\d+)/i) ||
    (doubanContainer?.textContent || "").match(/movie\.douban\.com\/subject\/(\d+)/i);
  if (doubanMatch) doubanId = doubanMatch[1];
  const parseCount = (el) => {
    if (!el) return 0;
    const m = String(el.textContent || "")
      .replace(/,/g, "")
      .match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  };
  const seeders = parseCount(document.getElementById("seeders"));
  const peers = parseCount(document.getElementById("leechers"));
  const grabs = parseCount(document.querySelector('a[href*="viewsnatches.php"]'));

  let uploadvolumefactor = 1;
  let downloadvolumefactor = 1;
  let volume_factor = "普通";
  const h1 = document.querySelector("h1#top") || document.querySelectorAll("h1")[0];
  if (h1) {
    if (h1.querySelector('font.twoupfree, [class*="pro_free2up"]')) {
      uploadvolumefactor = 2;
      downloadvolumefactor = 0;
      volume_factor = "2X免费";
    } else if (h1.querySelector('font.free, [class*="pro_free"]')) {
      uploadvolumefactor = 1;
      downloadvolumefactor = 0;
      volume_factor = "免费";
    } else if (h1.querySelector('font.twouphalfdown, [class*="pro_50pctdown2up"]')) {
      uploadvolumefactor = 2;
      downloadvolumefactor = 0.5;
      volume_factor = "2X 50%";
    } else if (h1.querySelector('font.halfdown, [class*="pro_50pctdown"]')) {
      uploadvolumefactor = 1;
      downloadvolumefactor = 0.5;
      volume_factor = "50%";
    } else if (h1.querySelector('font.thirtypercent, [class*="pro_30pctdown"]')) {
      uploadvolumefactor = 1;
      downloadvolumefactor = 0.3;
      volume_factor = "30%";
    } else if (h1.querySelector('font.twoup, [class*="pro_2up"]')) {
      uploadvolumefactor = 2;
      downloadvolumefactor = 1;
      volume_factor = "2X";
    }
  }

  return {
    imdbid,
    tmdbId,
    tmdbType,
    doubanId,
    seeders,
    peers,
    grabs,
    uploadvolumefactor,
    downloadvolumefactor,
    volume_factor,
  };
}

function isLikelyTagCloudTitle(title) {
  const val = cleanText(title);
  if (!val) return true;
  const pipeCount = (val.match(/\|/g) || []).length;
  if (pipeCount >= 5 && !/\bS\d{1,2}E\d{1,3}\b/i.test(val)) return true;

  const words = val.split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const upperShortWords = words.filter((w) => /^[A-Z0-9]{2,10}$/.test(w)).length;
  if (words.length >= 8 && upperShortWords / words.length > 0.65) return true;
  return false;
}

function scoreTitleCandidate(title) {
  const val = cleanText(title);
  if (!val) return -999;

  let score = 0;
  if (val.length >= 6 && val.length <= 220) score += 2;
  if (/[A-Za-z\u4e00-\u9fa5]/.test(val)) score += 1;
  if (/\bS\d{1,2}E\d{1,3}\b/i.test(val)) score += 3;
  if (/\b(?:4320p|2160p|1080p|720p|web[-\s]?dl|webrip|bluray|h\.?26[45]|x26[45]|hevc)\b/i.test(val)) score += 2;
  if (/\b(?:19|20)\d{2}\b/.test(val)) score += 1;
  if (
    /(?:\bFREE\b|\b2XFree\b|限時免費|限时免费|剩余时间|剩餘時間|\d+\s*(?:天|日|小時|小时)\s*\d+\s*(?:時|时|分)|\d{1,2}:\d{2}:\d{2})$/i.test(
      val,
    )
  )
    score -= 8;

  const pipeCount = (val.match(/\|/g) || []).length;
  if (pipeCount >= 3) score -= 3;
  if (isLikelyTagCloudTitle(val)) score -= 4;
  if (!/\s/.test(val) && val.length < 8) score -= 2;

  return score;
}

function pickBestTitleCandidate(candidates) {
  let best = "";
  let bestScore = -999;
  candidates.forEach((candidate) => {
    const score = scoreTitleCandidate(candidate);
    if (score > bestScore) {
      best = cleanText(candidate);
      bestScore = score;
    }
  });
  return best;
}

function collectAntFields() {
  const fields = [];
  document.querySelectorAll(".ant-descriptions-item-label").forEach((label) => {
    const key = cleanText(label.textContent);
    const valueEl = label.nextElementSibling;
    const value = cleanText(valueEl?.textContent || "");
    if (key && value) {
      fields.push({ key, value, el: valueEl });
    }
  });
  return fields;
}

function pickAntField(fields, patterns) {
  for (const field of fields) {
    if (patterns.some((pattern) => pattern.test(field.key))) {
      return field;
    }
  }
  return null;
}

// ---------- M-Team 下载链接捕获模块 ----------
function extractLinkFromString(text) {
  const raw = String(text || "")
    .replace(/\\\//g, "/")
    .replace(/\\u002F/gi, "/")
    .replace(/\\u003A/gi, ":")
    .replace(/\\u003F/gi, "?")
    .replace(/\\u003D/gi, "=")
    .replace(/\\u0026/gi, "&")
    .replace(/\\u0025/gi, "%")
    .replace(/&amp;/g, "&");
  const match = raw.match(
    /https?:\/\/[^\s"'`<>\\]+|\/api\/rss\/dlv2\?[^\s"'`<>\\]+|\/api\/torrent\/download\?[^\s"'`<>\\]+/i,
  );
  if (!match) return "";
  try {
    return new URL(match[0], window.location.origin).href;
  } catch (e) {
    return "";
  }
}

function findMTeamNativeDownloadButton() {
  const exactSelector =
    "#app-content > div > div.app-content__inner.px-\\[40px\\].flex.flex-col.justify-between > div.mx-auto.w-full > div.flex.py-5.mb-5.border-0.border-b.border-solid.border-\\[--mt-line-color\\].sticky.items-start.top-0.z-\\[999\\].bg-mt-primary-1.text-\\[--mt-text-base\\] > div.flex-grow.w-1.flex.flex-col.justify-between > div.flex.justify-between > div > div > div > div:nth-child(4)";
  const byText = Array.from(
    document.querySelectorAll(
      'div.flex.justify-between button, div.flex.justify-between a, div.flex.justify-between [role="button"]',
    ),
  ).find((el) =>
    /(?:下載|下载|download)/i.test(
      cleanText(el.textContent || el.getAttribute("title") || el.getAttribute("aria-label") || ""),
    ),
  );
  return (
    byText ||
    document.querySelector(exactSelector) ||
    document.querySelector('div.flex.justify-between [class*="download"]')
  );
}

function deepFindDownloadLinkInObject(root, maxNodes = 5000) {
  if (!root) return "";
  const stack = [root];
  const visited = new Set();
  let count = 0;

  while (stack.length && count < maxNodes) {
    const current = stack.pop();
    count++;
    if (!current) continue;

    const t = typeof current;
    if (t === "string") {
      const parsed = extractLinkFromString(current);
      if (parsed) return parsed;
      continue;
    }
    if (t !== "object" && t !== "function") continue;
    if (visited.has(current)) continue;
    visited.add(current);

    let keys = [];
    try {
      keys = Object.keys(current);
    } catch (e) {
      continue;
    }

    for (const key of keys) {
      let val;
      try {
        val = current[key];
      } catch (e) {
        continue;
      }
      if (typeof val === "string") {
        const parsed = extractLinkFromString(val);
        if (parsed) return parsed;
      } else if (val && (typeof val === "object" || typeof val === "function")) {
        stack.push(val);
      }
    }
  }

  return "";
}

function isLikelyTorrentDownloadUrl(abs) {
  const url = String(abs || "");
  if (!url) return false;
  if (/\/api\/rss\/dlv2\?/i.test(url)) return true;
  if (/\/api\/torrent\/download\?/i.test(url)) return true;
  if (/\.torrent(?:\?|$)/i.test(url)) return true;
  if (/[?&](?:app_id|payload|playload)=/i.test(url) && /[?&]sign=/i.test(url) && /[?&]t=/i.test(url)) return true;
  if (/halomt\.com/i.test(url) && /[?&]sign=/i.test(url)) return true;
  return false;
}

function isAllowedMTeamDownloadHost(abs) {
  try {
    const host = new URL(abs).hostname.toLowerCase();
    return /(^|\.)m-team\.cc$|(^|\.)m-team\.io$|(^|\.)halomt\.com$/.test(host);
  } catch (e) {
    return false;
  }
}

function getCurrentMTeamTid() {
  const m = window.location.pathname.match(/\/detail\/(\d+)/);
  return m ? m[1] : "";
}

function pruneMTeamCaches() {
  const now = Date.now();
  const maxAgeMs = 10 * 60 * 1000;
  const maxEntries = 80;
  const currentTid = getCurrentMTeamTid();

  const maintainTimedMap = (mapObj, getTs, trimSize = true) => {
    const valid = [];
    Object.keys(mapObj).forEach((tid) => {
      const ts = getTs(mapObj[tid]) || 0;
      if (tid !== currentTid && (!ts || now - ts > maxAgeMs)) {
        delete mapObj[tid];
      } else {
        valid.push({ tid, ts });
      }
    });
    if (!trimSize || valid.length <= maxEntries) return;
    valid.sort((a, b) => a.ts - b.ts);
    const removeCount = valid.length - maxEntries;
    for (let i = 0; i < removeCount; i++) {
      if (valid[i].tid !== currentTid) delete mapObj[valid[i].tid];
    }
  };

  maintainTimedMap(mpMTeamRuntimeDownloadLinks, (item) => item?.at, true);
  maintainTimedMap(mpMTeamDetailCache, (item) => item?.at, true);
  maintainTimedMap(mpMTeamAutoPrefetchState, (item) => Number(item || 0), true);
  maintainTimedMap(mpMTeamHtmlScanState, (item) => Number(item || 0), false);
  Object.keys(mpMTeamMutationWatcherState).forEach((tid) => {
    if (tid !== currentTid && !mpMTeamMutationWatcherState[tid]?.active) {
      delete mpMTeamMutationWatcherState[tid];
    }
  });
}

function setMTeamRuntimeDownloadLink(url, source) {
  const tid = getCurrentMTeamTid();
  if (!tid || !url) return;
  const existing = mpMTeamRuntimeDownloadLinks[tid];
  if (existing?.url === url) {
    existing.source = source || existing.source;
    existing.at = Date.now();
    return;
  }
  mpMTeamRuntimeDownloadLinks[tid] = {
    url,
    source: source || "runtime",
    at: Date.now(),
  };
  debugLog("m-team runtime link captured", { tid, source, url });
  try {
    document.dispatchEvent(new CustomEvent("mp-mteam-runtime-link-updated", { detail: { tid, url, source } }));
  } catch (e) {}
}

function getMTeamRuntimeDownloadLink() {
  const tid = getCurrentMTeamTid();
  if (!tid) return "";
  const item = mpMTeamRuntimeDownloadLinks[tid];
  if (!item?.url) return "";
  if (Date.now() - (item.at || 0) > 10 * 60 * 1000) return "";
  return item.url;
}

function getDownloadLikeAttrsFromElement(el) {
  if (!el || typeof el.getAttribute !== "function") return [];
  const attrs = ["href", "data-url", "data-href", "onclick", "title", "aria-label"];
  const values = [];
  attrs.forEach((attr) => {
    const v = el.getAttribute(attr);
    if (v) values.push(v);
  });
  if (el.outerHTML) values.push(el.outerHTML);
  if (el.textContent) values.push(el.textContent);
  return values;
}

function saveMTeamDetailToCache(tid, detail) {
  const cleanTid = String(tid || detail?.id || "").trim();
  if (!cleanTid || !detail || typeof detail !== "object") return null;
  const normalized = {
    id: cleanTid,
    name: String(detail.name || "").trim(),
    smallDescr: String(detail.smallDescr || detail.small_descr || "").trim(),
    size: detail.size,
    imdb: String(detail.imdb || "").trim(),
    douban: String(detail.douban || "").trim(),
    at: Date.now(),
  };
  if (!normalized.name && !normalized.smallDescr && !normalized.size) return null;
  mpMTeamDetailCache[cleanTid] = normalized;
  debugLog("m-team detail cached", {
    tid: cleanTid,
    name: normalized.name,
    hasSmallDescr: Boolean(normalized.smallDescr),
    size: normalized.size,
  });
  return normalized;
}

function getCachedMTeamDetail(tid) {
  const cleanTid = String(tid || "").trim();
  if (!cleanTid) return null;
  const item = mpMTeamDetailCache[cleanTid];
  if (!item) return null;
  if (Date.now() - (item.at || 0) > 10 * 60 * 1000) return null;
  return item;
}

function resolveMTeamApiBaseUrl() {
  try {
    const entries = performance.getEntriesByType("resource") || [];
    for (const entry of entries) {
      const m = String(entry?.name || "").match(/^(https:\/\/api[^/]*m-team\.[^/]+)\/api\//i);
      if (m) return m[1];
    }
  } catch (e) {}
  if (/m-team\.io$/i.test(window.location.hostname)) return "https://api.m-team.io";
  return "https://api.m-team.io";
}

function fetchMTeamTorrentDetail(tid, timeoutMs = 2400) {
  const cleanTid = String(tid || "").trim();
  if (!cleanTid) return Promise.resolve(null);
  const cached = getCachedMTeamDetail(cleanTid);
  if (cached && cached.name) return Promise.resolve(cached);
  if (mpMTeamDetailPending[cleanTid]) return mpMTeamDetailPending[cleanTid];

  let auth = "";
  let visitorId = "";
  try {
    auth = localStorage.getItem("auth") || localStorage.getItem("token") || "";
    visitorId = localStorage.getItem("visitorId") || localStorage.getItem("did") || "";
  } catch (e) {}
  if (!auth) return Promise.resolve(null);

  const apiBase = resolveMTeamApiBaseUrl();
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    ts: String(Math.floor(Date.now() / 1000)),
    authorization: auth,
  };
  if (visitorId) headers.visitorId = visitorId;

  const p = new Promise((resolve) => {
    let settled = false;
    const done = (val) => {
      if (settled) return;
      settled = true;
      delete mpMTeamDetailPending[cleanTid];
      resolve(val);
    };
    setTimeout(() => done(null), timeoutMs);
    mpGmRequest({
      method: "POST",
      url: `${apiBase}/api/torrent/detail`,
      headers,
      data: new URLSearchParams({ id: cleanTid }).toString(),
      timeout: timeoutMs,
      onload: (res) => {
        try {
          const json = JSON.parse(res.responseText || "{}");
          if (json && json.data && typeof json.data === "object") {
            done(saveMTeamDetailToCache(cleanTid, json.data));
            return;
          }
        } catch (e) {}
        done(null);
      },
      onerror: () => done(null),
      ontimeout: () => done(null),
    });
  });
  mpMTeamDetailPending[cleanTid] = p;
  return p;
}

function installMTeamRuntimeCaptureListener() {
  if (mpMTeamRuntimeListenerInstalled) return;
  mpMTeamRuntimeListenerInstalled = true;

  document.addEventListener(
    "mp-download-url-captured",
    (ev) => {
      try {
        const rawUrl = ev?.detail?.url || "";
        const source = ev?.detail?.source || "page-hook";
        if (!rawUrl) return;
        const abs = new URL(rawUrl, window.location.origin).href;
        if (!isLikelyTorrentDownloadUrl(abs)) return;
        if (!isAllowedMTeamDownloadHost(abs)) return;
        const tid = getCurrentMTeamTid();
        if (tid && /[?&]tid=\d+/.test(abs) && !new RegExp(`[?&]tid=${tid}(?:&|$)`).test(abs)) return;
        setMTeamRuntimeDownloadLink(abs, `page:${source}`);
      } catch (e) {}
    },
    true,
  );

  document.addEventListener(
    "mp-mteam-detail-captured",
    (ev) => {
      try {
        const detail = ev?.detail;
        if (!detail || typeof detail !== "object") return;
        saveMTeamDetailToCache(detail.id || getCurrentMTeamTid(), detail);
      } catch (e) {}
    },
    true,
  );
}

function triggerMTeamPrefetchMode(durationMs = 5000) {
  try {
    document.dispatchEvent(
      new CustomEvent("mp-mteam-prefetch-mode", {
        detail: { duration: durationMs },
      }),
    );
  } catch (e) {}
}

function getMTeamPrefetchClickTargets(nativeBtn) {
  const targets = [];
  const seen = new Set();
  const add = (el) => {
    if (!el || typeof el !== "object") return;
    if (seen.has(el)) return;
    seen.add(el);
    targets.push(el);
  };

  add(nativeBtn);
  nativeBtn
    .querySelectorAll?.('a,button,[role="button"],.ant-btn,[class*="download"],[title*="下載"],[aria-label*="下載"]')
    .forEach(add);

  let p = nativeBtn.parentElement;
  for (let i = 0; i < 3 && p; i++) {
    add(p);
    p.querySelectorAll?.(
      'a,button,[role="button"],.ant-btn,[class*="download"],[title*="下載"],[aria-label*="下載"]',
    ).forEach(add);
    p = p.parentElement;
  }

  return targets.filter((el) => {
    const txt = cleanText(el.textContent || "").toLowerCase();
    if (txt.includes("下載") || txt.includes("下载") || txt.includes("download")) return true;
    const title = String(el.getAttribute?.("title") || "").toLowerCase();
    const aria = String(el.getAttribute?.("aria-label") || "").toLowerCase();
    return title.includes("下載") || title.includes("下载") || aria.includes("下載") || aria.includes("下载");
  });
}

function dispatchSyntheticClick(el) {
  if (!el) return;
  try {
    el.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true, view: window }));
  } catch (e) {}
  try {
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
  } catch (e) {}
  try {
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
  } catch (e) {}
  try {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  } catch (e) {}
  try {
    if (typeof el.click === "function") el.click();
  } catch (e) {}
}

function startMTeamLinkMutationWatcher(reason = "auto", windowMs = 9000) {
  const tid = getCurrentMTeamTid();
  if (!tid) return;

  const state = mpMTeamMutationWatcherState[tid];
  if (state?.active) return;

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type !== "attributes") continue;
      const node = m.target;
      if (!node || typeof node.getAttribute !== "function") continue;
      const vals = getDownloadLikeAttrsFromElement(node);
      for (const raw of vals) {
        const parsed = extractLinkFromString(raw);
        if (parsed && isLikelyTorrentDownloadUrl(parsed) && isAllowedMTeamDownloadHost(parsed)) {
          setMTeamRuntimeDownloadLink(parsed, `mutation:${reason}:${m.attributeName || "attr"}`);
          return;
        }
      }
    }
  });

  mpMTeamMutationWatcherState[tid] = { active: true, observer };
  observer.observe(document.documentElement || document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["href", "data-url", "data-href", "onclick", "title", "aria-label"],
  });

  setTimeout(() => {
    try {
      observer.disconnect();
    } catch (e) {}
    mpMTeamMutationWatcherState[tid] = { active: false };
  }, windowMs);
}

function captureMTeamDownloadLinkFromPerformance(source) {
  const tid = getCurrentMTeamTid();
  if (!tid) return "";
  try {
    const entries = performance.getEntriesByType("resource") || [];
    for (let i = entries.length - 1; i >= 0; i--) {
      const url = entries[i]?.name || "";
      if (!isLikelyTorrentDownloadUrl(url)) continue;
      if (!isAllowedMTeamDownloadHost(url)) continue;
      if (/[?&]tid=\d+/.test(url) && !new RegExp(`[?&]tid=${tid}(?:&|$)`).test(url)) continue;
      setMTeamRuntimeDownloadLink(url, source || "performance");
      return url;
    }
  } catch (e) {}
  return "";
}

function scheduleMTeamProbe(sourcePrefix, delays) {
  delays.forEach((delay) => {
    setTimeout(() => {
      if (getMTeamRuntimeDownloadLink()) return;
      const perfHit = captureMTeamDownloadLinkFromPerformance(`${sourcePrefix}+${delay}ms`);
      if (perfHit) return;
      const late = extractMTeamDownloadLink({ skipFullHtmlScan: true });
      if (late.link) setMTeamRuntimeDownloadLink(late.link, `${sourcePrefix}-extract+${delay}ms`);
    }, delay);
  });
}

function autoPrefetchMTeamDownloadLink(reason = "auto", options = {}) {
  if (!isMTeamDetailPage()) return;
  const tid = getCurrentMTeamTid();
  if (!tid || getMTeamRuntimeDownloadLink()) return;

  const force = Boolean(options.force);
  const cooldownMs = Number(options.cooldownMs || 30000);
  const lastTs = mpMTeamAutoPrefetchState[tid] || 0;
  if (!force && Date.now() - lastTs < cooldownMs) return;

  const nativeBtn = findMTeamNativeDownloadButton();
  if (!nativeBtn) return;

  mpMTeamAutoPrefetchState[tid] = Date.now();
  debugLog("m-team auto prefetch start", { tid, reason });

  triggerMTeamPrefetchMode(8000);
  startMTeamLinkMutationWatcher(reason, 9000);

  const targets = getMTeamPrefetchClickTargets(nativeBtn);
  if (!targets.length) {
    dispatchSyntheticClick(nativeBtn);
  } else {
    targets.forEach((el, idx) => {
      setTimeout(() => dispatchSyntheticClick(el), idx * 180);
    });
  }

  scheduleMTeamProbe("auto-prefetch", [300, 900, 1600, 2600, 4000, 5200]);
}

function installMTeamNativeDownloadHook() {
  if (!isMTeamDetailPage()) return;
  installMTeamRuntimeCaptureListener();
  installMTeamPageContextHook();
  const nativeBtn = findMTeamNativeDownloadButton();
  if (!nativeBtn || nativeBtn.dataset?.mpHooked === "1") return;
  if (nativeBtn.dataset) nativeBtn.dataset.mpHooked = "1";

  nativeBtn.addEventListener(
    "click",
    (ev) => {
      try {
        const path = ev.composedPath ? ev.composedPath() : [ev.target, nativeBtn];
        path.forEach((node) => {
          if (!node || typeof node !== "object") return;
          getDownloadLikeAttrsFromElement(node).forEach((raw) => {
            const parsed = extractLinkFromString(raw);
            if (parsed && isLikelyTorrentDownloadUrl(parsed) && isAllowedMTeamDownloadHost(parsed)) {
              setMTeamRuntimeDownloadLink(parsed, "native-click-path");
            }
          });
        });
      } catch (e) {}

      scheduleMTeamProbe("native-click", [250, 800, 1600, 2600, 4000]);
    },
    true,
  );
}

function extractMTeamDownloadLink(options = {}) {
  const tid = getCurrentMTeamTid();
  const candidates = [];
  const seen = new Set();
  const pushCandidate = (raw, source) => {
    if (!raw) return;
    let abs = "";
    try {
      abs = new URL(String(raw).replace(/\\\//g, "/").replace(/&amp;/g, "&"), window.location.origin).href;
    } catch (e) {
      return;
    }
    if (!isLikelyTorrentDownloadUrl(abs)) return;
    if (!isAllowedMTeamDownloadHost(abs)) return;
    if (tid && /[?&]tid=\d+/.test(abs) && !new RegExp(`[?&]tid=${tid}(?:&|$)`).test(abs)) return;
    if (!seen.has(abs)) {
      seen.add(abs);
      candidates.push({ url: abs, source });
    }
  };

  const runtimeCached = getMTeamRuntimeDownloadLink();
  if (runtimeCached) pushCandidate(runtimeCached, "runtime-cache");

  const nativeBtn = findMTeamNativeDownloadButton();
  if (nativeBtn) {
    const btnLogKey = [
      window.location.pathname,
      nativeBtn.tagName || "",
      nativeBtn.className || "",
      cleanText(nativeBtn.textContent || "").slice(0, 80),
    ].join("|");
    if (btnLogKey !== mpLastMTeamBtnLogKey) {
      mpLastMTeamBtnLogKey = btnLogKey;
      debugLog("m-team native download button", {
        tag: nativeBtn.tagName,
        className: nativeBtn.className || "",
        text: cleanText(nativeBtn.textContent || "").slice(0, 80),
      });
    }

    const attrsToCheck = ["href", "data-url", "data-href", "onclick", "title", "aria-label"];
    attrsToCheck.forEach((attr) => {
      const val = nativeBtn.getAttribute?.(attr);
      if (val) {
        const parsed = extractLinkFromString(val);
        if (parsed) pushCandidate(parsed, `native-btn:${attr}`);
      }
    });
    const outerHit = extractLinkFromString(nativeBtn.outerHTML || "");
    if (outerHit) pushCandidate(outerHit, "native-btn:outerHTML");

    nativeBtn.querySelectorAll?.("a,button,[data-url],[data-href],[onclick]").forEach((el, idx) => {
      attrsToCheck.forEach((attr) => {
        const val = el.getAttribute?.(attr);
        if (val) {
          const parsed = extractLinkFromString(val);
          if (parsed) pushCandidate(parsed, `native-desc[${idx}]:${attr}`);
        }
      });
      const txtHit = extractLinkFromString(el.textContent || "");
      if (txtHit) pushCandidate(txtHit, `native-desc[${idx}]:text`);
    });

    const reactKeys = Object.keys(nativeBtn).filter((k) => /^__reactProps\$|^__reactFiber\$/i.test(k));
    reactKeys.forEach((key) => {
      const reactHit = deepFindDownloadLinkInObject(nativeBtn[key]);
      if (reactHit) pushCandidate(reactHit, `native-btn:${key}`);
    });
  } else {
    const missKey = `${window.location.pathname}|missing`;
    if (mpLastMTeamBtnMissingLogKey !== missKey) {
      mpLastMTeamBtnMissingLogKey = missKey;
      debugLog("m-team native download button not found");
    }
  }

  const selectors = [
    'a[href*="/api/rss/dlv2"]',
    'a[href*="api.m-team.io/api/rss/dlv2"]',
    'a[href*="dlv2"]',
    'a[href*="torrent/download"]',
    'a[href*="download?tid="]',
    'a[href*=".torrent"]',
    '[data-url*="dlv2"]',
    '[data-href*="dlv2"]',
    '[data-url*="download"]',
    '[data-href*="download"]',
    '[class*="download"]',
    '[class*="Download"]',
    'button[onclick*="dlv2"]',
    'a[onclick*="dlv2"]',
    'button[onclick*="download"]',
    'a[onclick*="download"]',
  ];

  for (const selector of selectors) {
    const nodes = document.querySelectorAll(selector);
    for (const node of nodes) {
      const href = node.getAttribute("href");
      if (href) pushCandidate(href, `${selector}:href`);
      const dataUrl = node.getAttribute("data-url") || node.getAttribute("data-href");
      if (dataUrl) pushCandidate(dataUrl, `${selector}:data-url`);
      const inline =
        node.getAttribute("onclick") ||
        node.getAttribute("title") ||
        node.getAttribute("aria-label") ||
        node.textContent;
      const parsed = extractLinkFromString(inline);
      if (parsed) pushCandidate(parsed, `${selector}:inline`);
    }
  }

  try {
    const entries = performance.getEntriesByType("resource") || [];
    entries.forEach((entry) => {
      const name = entry?.name || "";
      if (/\/api\/rss\/dlv2\?/i.test(name)) pushCandidate(name, "performance");
    });
  } catch (e) {}

  if (!candidates.length && !options.skipFullHtmlScan) {
    document.querySelectorAll("script").forEach((script, idx) => {
      const parsed = extractLinkFromString(script.textContent || "");
      if (parsed) pushCandidate(parsed, `script[${idx}]`);
    });

    const lastScanAt = mpMTeamHtmlScanState[tid] || 0;
    if (!candidates.length && (!tid || Date.now() - lastScanAt > 30000)) {
      if (tid) mpMTeamHtmlScanState[tid] = Date.now();
      const pageSourceHit = extractLinkFromString(document.documentElement?.innerHTML || "");
      if (pageSourceHit) pushCandidate(pageSourceHit, "document-html");
    }
  }

  return {
    link: candidates[0]?.url || "",
    source: candidates[0]?.source || "",
    candidates: candidates.slice(0, 8),
  };
}

function extractCleanMTeamNodeTitle(el) {
  if (!el) return "";
  const clone = cloneInertNode(el);
  clone
    .querySelectorAll(
      [
        ".ant-tag",
        ".ant-badge",
        ".ant-statistic",
        '[class*="free" i]',
        '[class*="discount" i]',
        '[class*="countdown" i]',
        '[class*="promo" i]',
        "button",
        "svg",
        "time",
        "script",
        "style",
      ].join(", "),
    )
    .forEach((node) => node.remove());
  return cleanRawHeadingText(clone.textContent || "");
}

function parseApiSizeBytes(rawSize) {
  if (rawSize === null || rawSize === undefined || rawSize === "") return 0;
  if (typeof rawSize === "number" && Number.isFinite(rawSize)) return Math.round(rawSize);
  const str = String(rawSize).trim();
  if (/^\d+$/.test(str)) return parseInt(str, 10) || 0;
  return getSize(str);
}

function findMTeamSubtitleFromDom(fields, titleText) {
  const subField = pickAntField(fields, [/(副标题|副標題|简介|簡介|描述|description|剧情|劇情|small\s*descr)/i]);
  if (subField) {
    const cleaned = extractCleanSubtitle(subField.el) || cleanSubtitleText(subField.value);
    if (cleaned) return cleaned;
  }

  const cleanTitleNorm = cleanText(titleText || "");
  const isNoiseText = (txt) => {
    if (!txt || txt.length < 2) return true;
    if (txt === cleanTitleNorm) return true;
    if (/^(?:FREE|2X|50%|30%|下載|下载|收藏|舉報|举报|分享|感謝|感谢|MoviePilot)$/i.test(txt)) return true;
    if (/^\d+(?:\.\d+)?\s*(?:TiB|GiB|MiB|KiB|TB|GB|MB|KB)(?:\/s)?$/i.test(txt)) return true;
    if (/^(?:大小|體積|体积|做種|做种|下載數|下载数|完成|分類|分类|類別|类别)[:：]?/i.test(txt) && txt.length < 40)
      return true;
    return false;
  };

  const headerHeading =
    document.querySelector("#app-content div.app-content__inner div.flex-grow h2") ||
    document.querySelector("h2") ||
    document.querySelector("h1");
  const headingBlock = headerHeading?.parentElement;
  if (headingBlock) {
    const candidates = [];
    let next = headingBlock.nextElementSibling;
    for (let i = 0; i < 3 && next; i++) {
      if (!next.closest?.("#mp-row-flag") && next.id !== "mp-row-flag") {
        candidates.push(next);
      }
      next = next.nextElementSibling;
    }
    headingBlock.querySelectorAll("span, div, p").forEach((el) => {
      if (el !== headerHeading && !headerHeading.contains(el) && !el.contains(headerHeading)) {
        candidates.push(el);
      }
    });
    for (const el of candidates) {
      if (el.querySelector('button, a[href*="dlv2"], .mp-inline-bar')) continue;
      const raw = cleanSubtitleText(extractCleanSubtitle(el) || el.textContent || "");
      if (!isNoiseText(raw) && raw.length <= 240) return raw;
    }
  }
  return "";
}

function findMTeamSizeFromDom(fields) {
  const sizeField = pickAntField(fields, [/(大小|體積|体积|size)/i]);
  if (sizeField) {
    const parsed = getSize(sizeField.value);
    if (parsed > 0) return parsed;
  }
  const scope = document.querySelector("#app-content div.app-content__inner") || document.body;
  const nodes = scope ? scope.querySelectorAll(".ant-space-item, .ant-descriptions-item-content, span, div") : [];
  for (const el of nodes) {
    if (el.children.length > 3) continue;
    const txt = cleanText(el.textContent || "");
    if (!txt || txt.length > 80 || /\/s\b/i.test(txt)) continue;
    const labeled = txt.match(
      /(?:大小|體積|体积|Size)\s*[:：]?\s*(\d+(?:[.,]\d+)?\s*(?:TiB|GiB|MiB|KiB|TB|GB|MB|KB)\b)/i,
    );
    if (labeled) return getSize(labeled[1]);
    if (/^\d+(?:[.,]\d+)?\s*(?:TiB|GiB|MiB|TB|GB|MB)$/i.test(txt)) {
      const sz = getSize(txt);
      if (sz > 0) return sz;
    }
  }
  return 0;
}

function extractMTeamInfo(rows) {
  const tid = getCurrentMTeamTid();
  const apiDetail = getCachedMTeamDetail(tid);
  const fields = collectAntFields();

  let candidates = [];
  if (apiDetail?.name) {
    addUnique(candidates, cleanRawHeadingText(apiDetail.name));
  }
  addUnique(candidates, cleanRawHeadingText(rows[0]?.nextElementSibling?.textContent || ""));
  fields.forEach((field) => {
    if (/(标题|標題|名称|名稱|片名|title|name)/i.test(field.key)) {
      addUnique(candidates, cleanRawHeadingText(field.value));
    }
  });

  [
    ".ant-page-header-heading-title",
    ".ant-page-header-heading .ant-typography",
    "#app-content div.app-content__inner div.flex-grow h2",
    "h1",
    "h2",
    '[class*="title"]',
    '[class*="Title"]',
  ].forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => addUnique(candidates, extractCleanMTeamNodeTitle(el)));
  });

  let pageTitle = cleanRawHeadingText(
    cleanText(document.title)
      .replace(/\s*[-|_]\s*M[\s-]?Team.*$/i, "")
      .trim(),
  );
  if (pageTitle && !/^m-team$/i.test(pageTitle)) {
    addUnique(candidates, pageTitle);
  }

  let torrent_name = apiDetail?.name ? cleanRawHeadingText(apiDetail.name) : pickBestTitleCandidate(candidates);
  let torrent_description = apiDetail?.name
    ? cleanSubtitleText(apiDetail.smallDescr || "")
    : findMTeamSubtitleFromDom(fields, torrent_name);

  const dlResult = extractMTeamDownloadLink();
  let download_link =
    dlResult.link ||
    document.querySelector('a[href*="dlv2"], a[href*="download"], a[download], a[href*=".torrent"]')?.href ||
    "";

  let torrent_size = apiDetail?.name
    ? parseApiSizeBytes(apiDetail.size) || findMTeamSizeFromDom(fields)
    : findMTeamSizeFromDom(fields);
  debugLog("m-team extracted", {
    fromApiDetail: Boolean(apiDetail?.name),
    titleCandidates: candidates,
    selectedTitle: torrent_name,
    descriptionPreview: toPreview(torrent_description || ""),
    downloadLink: download_link,
    downloadLinkSource: dlResult.source,
    size: torrent_size,
  });

  return { torrent_name, download_link, torrent_description, torrent_size };
}

function getLatestDownloadLink(type, currentLink, options = {}) {
  if (currentLink) return currentLink;
  if (type === "sunnypt" || isSunnyPTDetailPage()) {
    const tid = getCurrentSunnyPTTid();
    if (tid && mpSunnyPTLinkCache[tid]) return mpSunnyPTLinkCache[tid];
  }
  if (type === "mteam" || isMTeamDetailPage()) {
    const dlResult = extractMTeamDownloadLink({ skipFullHtmlScan: Boolean(options.skipFullHtmlScan) });
    if (dlResult.link) {
      debugLog("m-team late download-link refresh", dlResult);
      return dlResult.link;
    }
  }
  return "";
}

function waitForMTeamLinkOnDemand(initialLink = "") {
  return new Promise((resolve) => {
    autoPrefetchMTeamDownloadLink("manual-push-click", { force: true, cooldownMs: 1200 });
    let immediate = getLatestDownloadLink("mteam", initialLink, { allowPrefetch: false });
    if (immediate) {
      resolve(immediate);
      return;
    }

    let attempts = 0;
    const maxAttempts = 24;
    const intervalMs = 700;

    const cleanup = () => {
      clearInterval(timer);
      document.removeEventListener("mp-mteam-runtime-link-updated", onRuntimeLink, true);
    };

    const onRuntimeLink = () => {
      const got = getLatestDownloadLink("mteam", "", { allowPrefetch: false });
      if (got) {
        cleanup();
        resolve(got);
      }
    };
    document.addEventListener("mp-mteam-runtime-link-updated", onRuntimeLink, true);

    const timer = setInterval(() => {
      attempts++;
      if (attempts === 1 || attempts % 2 === 0) {
        autoPrefetchMTeamDownloadLink("manual-push-click", { force: true, cooldownMs: 1200 });
      }

      const got = getLatestDownloadLink("mteam", "", { allowPrefetch: false, skipFullHtmlScan: true });
      if (got) {
        cleanup();
        resolve(got);
        return;
      }

      if (attempts >= maxAttempts) {
        cleanup();
        resolve("");
      }
    }, intervalMs);
  });
}

// ---------- MoviePilot API 交互 ----------
function getMpApiKey() {
  if (!mpUrl || !mpApiKey) {
    return Promise.reject("请先配置 MoviePilot 地址和 API Key");
  }
  return Promise.resolve();
}

async function recognizeByTitle(title, subtitle) {
  const res = await mpApiRequest(
    `/api/v1/media/recognize?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(subtitle || "")}`,
  );
  debugLog("recognizeByTitle response", {
    status: res.status,
    title,
    subtitlePreview: toPreview(subtitle || ""),
    ok: res.ok,
  });
  return res.ok ? res.data : null;
}

async function recognizeBySourceId(source, mediaId, typeName) {
  const key = `${source}:${mediaId}`;
  const res = await mpApiRequest(`/api/v1/media/${encodeURIComponent(key)}?type_name=${encodeURIComponent(typeName)}`);
  return res.ok && res.data && (res.data.tmdb_id || res.data.douban_id || res.data.title) ? res.data : null;
}

async function recognizeById(tmdbId, typeName) {
  return recognizeBySourceId("themoviedb", tmdbId, typeName);
}

async function searchMediaViaMp(query) {
  const res = await mpApiRequest(`/api/v1/media/search?title=${encodeURIComponent(query)}&page=1&count=10`);
  debugLog("searchMediaViaMp response", {
    status: res.status,
    query,
    count: Array.isArray(res.data) ? res.data.length : 0,
  });
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

async function fetchDownloadClients(force = false) {
  if (mpCachedClients && !force) return mpCachedClients;
  const res = await mpApiRequest("/api/v1/download/clients");
  mpCachedClients = res.ok && Array.isArray(res.data) ? res.data : [];
  return mpCachedClients;
}

async function fetchDownloadPaths(force = false) {
  if (mpCachedPaths && !force) return mpCachedPaths;
  const res = await mpApiRequest("/api/v1/download/paths");
  mpCachedPaths = res.ok && Array.isArray(res.data) ? res.data : [];
  return mpCachedPaths;
}
async function fetchFilterRuleGroups(force = false) {
  if (mpCachedFilterRuleGroups && !force) return { items: mpCachedFilterRuleGroups, errorStatus: 0 };
  const res = await mpApiRequest("/api/v1/system/setting/UserFilterRuleGroups");
  if (!res.ok) {
    return { items: [], errorStatus: res.status || 0 };
  }
  const rawVal = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.value) ? res.data.value : [];
  const seen = new Set();
  const items = [];
  rawVal.forEach((entry) => {
    const name = String(typeof entry === "string" ? entry : entry?.name || "").trim();
    if (!name || seen.has(name)) return;
    seen.add(name);
    items.push({
      name,
      media_type: typeof entry === "object" && entry?.media_type ? String(entry.media_type).trim() : "",
      category: typeof entry === "object" && entry?.category ? String(entry.category).trim() : "",
    });
  });
  mpCachedFilterRuleGroups = items;
  return { items, errorStatus: 0 };
}

async function fetchTmdbSeasons(tmdbId) {
  const id = String(tmdbId || "").replace(/[^\d]/g, "");
  if (!id) return [];
  if (Array.isArray(mpCachedSeasons[id])) return mpCachedSeasons[id];
  const res = await mpApiRequest(`/api/v1/tmdb/seasons/${encodeURIComponent(id)}`);
  const list = res.ok && Array.isArray(res.data) ? res.data : [];
  if (list.length) mpCachedSeasons[id] = list;
  return list;
}

function resolveMediaSeasonEntries(mediaInfo, defaultSeason = null, remoteSeasons = null) {
  const entriesMap = new Map();
  const addSeasonEntry = (num, meta = {}) => {
    const s = Number(num);
    if (!Number.isFinite(s) || s < 0) return;
    if (entriesMap.has(s)) return;
    entriesMap.set(s, {
      season: s,
      name: cleanText(meta.name || ""),
      year: meta.air_date ? String(meta.air_date).slice(0, 4) : "",
      episodes: Number(meta.episode_count || 0) || 0,
    });
  };

  const sourceLists = [remoteSeasons, mediaInfo?.season_info, mediaInfo?.seasons];
  for (const src of sourceLists) {
    if (Array.isArray(src)) {
      src.forEach((item) => {
        if (item && typeof item === "object") {
          const sNum = item.season_number ?? item.season;
          if (sNum !== undefined && sNum !== null) addSeasonEntry(sNum, item);
        } else if (Number.isFinite(Number(item))) {
          addSeasonEntry(Number(item));
        }
      });
    } else if (src && typeof src === "object") {
      Object.keys(src).forEach((k) => {
        const sNum = Number(k);
        if (Number.isFinite(sNum)) {
          const val = src[k];
          addSeasonEntry(sNum, { episode_count: Array.isArray(val) ? val.length : 0 });
        }
      });
    }
  }

  const hasRealList = entriesMap.size > 0;
  if (!hasRealList) {
    const numSeasons = Number(mediaInfo?.number_of_seasons || 0);
    const fallbackMax = Math.max(
      Number.isFinite(numSeasons) && numSeasons > 0 ? numSeasons : 0,
      defaultSeason !== null && defaultSeason !== undefined && Number(defaultSeason) > 0 ? Number(defaultSeason) : 0,
      1,
    );
    for (let i = 1; i <= fallbackMax; i++) {
      addSeasonEntry(i);
    }
  }

  if (defaultSeason !== null && defaultSeason !== undefined && Number.isFinite(Number(defaultSeason))) {
    addSeasonEntry(Number(defaultSeason));
  }

  const entries = Array.from(entriesMap.values());
  entries.sort((a, b) => {
    if (a.season === 0 && b.season !== 0) return 1;
    if (b.season === 0 && a.season !== 0) return -1;
    return a.season - b.season;
  });

  // 除非当前识别就是第 0 季或全剧只有第 0 季，否则过滤掉未要求的特别篇避免干扰；若明确只有 S00 或当前是 S00 则保留
  const filtered = entries.filter((e) => e.season > 0 || Number(defaultSeason) === 0 || entries.length === 1);
  return filtered.length ? filtered : [{ season: 1, name: "", year: "", episodes: 0 }];
}
/**
 * 精准检测媒体入库状态：
 * 1. 先尝试远程媒体服务器实时季集信息（POST /api/v1/mediaserver/exists_remote）
 * 2. 同时/降级调用本地媒体库数据库查询（GET /api/v1/mediaserver/exists?tmdbid=...&title=...&year=...&mtype=...）
 * 返回：{ exists: boolean, episodeCount: number|null, seasonCount: number|null, itemId: string }
 */
async function checkMediaExists(mediaInfo, season = null) {
  const tmdbId = String(mediaInfo?.tmdb_id || "").replace(/[^\d]/g, "");
  const mtype = mediaInfo?.type === "电视剧" ? "电视剧" : "电影";
  const title = mediaInfo?.title || "";
  const year = mediaInfo?.year || "";

  const params = new URLSearchParams();
  if (tmdbId) params.set("tmdbid", tmdbId);
  if (title) params.set("title", title);
  if (year) params.set("year", String(year));
  params.set("mtype", mtype);

  const localPromise = mpApiRequest(`/api/v1/mediaserver/exists?${params.toString()}`);
  let remotePromise = Promise.resolve(null);
  if (mtype === "电视剧" && tmdbId) {
    remotePromise = mpApiRequest("/api/v1/mediaserver/exists_remote", {
      method: "POST",
      data: mediaInfo,
    });
  }

  const [localRes, remoteRes] = await Promise.all([localPromise, remotePromise]);
  const itemId = localRes?.ok && localRes?.data?.item?.id ? String(localRes.data.item.id) : "";

  if (mtype === "电视剧" && remoteRes?.ok && remoteRes.data && typeof remoteRes.data === "object") {
    const seasonsMap = remoteRes.data;
    const seasonKey = season !== null && season !== undefined ? String(season) : null;
    if (seasonKey && Array.isArray(seasonsMap[seasonKey]) && seasonsMap[seasonKey].length > 0) {
      return { exists: true, episodeCount: seasonsMap[seasonKey].length, seasonNum: Number(seasonKey), itemId };
    }
    const allKeys = Object.keys(seasonsMap).filter((k) => Array.isArray(seasonsMap[k]) && seasonsMap[k].length > 0);
    if (!seasonKey && allKeys.length > 0) {
      const totalEps = allKeys.reduce((acc, k) => acc + seasonsMap[k].length, 0);
      return { exists: true, episodeCount: totalEps, seasonNum: null, itemId };
    }
    // 如果指定季在远程媒体服务器不存在，即使整剧在本地数据库存在也精准标记为当前季未入库
    if (seasonKey && Object.keys(seasonsMap).length > 0 && !seasonsMap[seasonKey]?.length) {
      return { exists: false, episodeCount: 0, seasonNum: Number(seasonKey), itemId: "" };
    }
  }

  return {
    exists: Boolean(localRes?.ok && localRes?.raw?.success !== false && itemId),
    episodeCount: null,
    seasonNum: season,
    itemId,
  };
}

async function fetchPlayUrl(itemId) {
  if (!itemId) return "";
  const res = await mpApiRequest(`/api/v1/mediaserver/play/${encodeURIComponent(itemId)}`);
  return res.ok && res.data?.url ? String(res.data.url) : "";
}

async function checkSubscriptionStatus(tmdbId, season = null, isTv = false) {
  if (!tmdbId) return null;
  const qs = isTv && season !== null && season !== undefined ? `?season=${encodeURIComponent(season)}` : "";
  const res = await mpApiRequest(`/api/v1/subscribe/media/themoviedb:${encodeURIComponent(tmdbId)}${qs}`);
  if (res.ok && res.data && res.data.id) {
    return res.data;
  }
  // 兼容极少数只返回列表的情况
  if (res.status === 404 || res.status === 422) {
    const listRes = await mpApiRequest("/api/v1/subscribe/");
    if (listRes.ok && Array.isArray(listRes.data)) {
      return (
        listRes.data.find((s) => {
          const matchId = String(s.tmdbid) === String(tmdbId) || String(s.media_id) === String(tmdbId);
          if (!matchId) return false;
          if (isTv && season !== null && season !== undefined && s.season != null) {
            return Number(s.season) === Number(season);
          }
          return true;
        }) || null
      );
    }
  }
  return null;
}

async function createSubscription(mediaInfo, options = {}) {
  const isTv = mediaInfo.type === "电视剧";
  const mtype = isTv ? "电视剧" : "电影";
  const body = {
    name: mediaInfo.title,
    type: mtype,
    year: mediaInfo.year || "",
    tmdbid: mediaInfo.tmdb_id || 0,
    media_source: "themoviedb",
    media_id: String(mediaInfo.tmdb_id || ""),
  };
  if (isTv && options.season !== null && options.season !== undefined && options.season !== "") {
    body.season = Number(options.season);
  }
  if (options.best_version) body.best_version = 1;
  if (options.quality) body.quality = options.quality;
  if (options.resolution) body.resolution = options.resolution;
  if (options.effect) body.effect = options.effect;
  if (options.include) body.include = options.include;
  if (options.exclude) body.exclude = options.exclude;
  if (options.downloader) body.downloader = options.downloader;
  if (options.save_path) body.save_path = options.save_path;
  if (Array.isArray(options.filter_groups) && options.filter_groups.length > 0) {
    body.filter_groups = options.filter_groups;
  }

  const res = await mpApiRequest("/api/v1/subscribe/", { method: "POST", data: body });
  return {
    success: res.ok && res.raw?.success !== false,
    message: res.message || (res.ok ? "订阅成功" : "订阅失败"),
    data: res.data,
  };
}

async function autoRecognizeByMpSearch(candidates, subtitle, extraMeta = {}) {
  try {
    // 1. 若页面显式包含 TMDB 链接或豆瓣链接，优先用精准 ID 识别
    if (extraMeta?.tmdbId) {
      const tryTypes = extraMeta.tmdbType ? [extraMeta.tmdbType] : ["电影", "电视剧"];
      for (const t of tryTypes) {
        const media = await recognizeById(extraMeta.tmdbId, t);
        if (media && media.tmdb_id) return media;
      }
    }
    if (extraMeta?.doubanId) {
      for (const t of ["电影", "电视剧"]) {
        const media = await recognizeBySourceId("douban", extraMeta.doubanId, t);
        if (media && (media.tmdb_id || media.douban_id)) return media;
      }
    }

    // 2. 使用候选名走搜索接口兜底
    const uniqueQueries = [];
    const addQuery = (q) => {
      const val = String(q || "").trim();
      if (val && !uniqueQueries.includes(val)) uniqueQueries.push(val);
    };

    candidates.forEach(addQuery);
    extractSubtitleCandidates(subtitle).forEach(addQuery);
    if (extraMeta?.imdbid) addQuery(extraMeta.imdbid);

    const topQueries = uniqueQueries.slice(0, 5);
    let bestResult = null;

    for (const q of topQueries) {
      const results = await searchMediaViaMp(q);
      if (Array.isArray(results) && results.length > 0) {
        bestResult = results[0];
        break;
      }
    }

    if (!bestResult) return null;

    const tmdbId = bestResult.tmdb_id || bestResult.id;
    const typeName = bestResult.type === "电视剧" ? "电视剧" : "电影";
    if (!tmdbId) return bestResult.tmdb_id ? bestResult : null;

    const mediaInfo = await recognizeById(tmdbId, typeName);
    return mediaInfo && mediaInfo.tmdb_id ? mediaInfo : bestResult;
  } catch (e) {
    debugLog("mp search fallback failed", e);
    return null;
  }
}

// ---------- 推送下载逻辑 ----------
async function verifyDownloadQueued(finalTitle) {
  const norm = (s) => cleanText(String(s || "")).toLowerCase();
  const target = norm(finalTitle);
  if (!target) return false;

  const [activeRes, histRes] = await Promise.all([
    mpApiRequest("/api/v1/download/", { timeout: 10000 }),
    mpApiRequest("/api/v1/history/download?page=1&count=10", { timeout: 10000 }),
  ]);

  const activeList = Array.isArray(activeRes?.data) ? activeRes.data : [];
  if (
    activeList.some((item) => {
      const t = norm(item?.title || item?.name || item?.torrent_name || "");
      return t && (t === target || t.includes(target) || target.includes(t));
    })
  ) {
    return true;
  }

  const histItems = Array.isArray(histRes?.data)
    ? histRes.data
    : Array.isArray(histRes?.data?.list)
      ? histRes.data.list
      : [];
  const nowMs = Date.now();
  return histItems.some((item) => {
    const t = norm(item?.torrent_name || item?.title || "");
    if (!t || (t !== target && !t.includes(target) && !target.includes(t))) return false;
    if (!item?.date) return true;
    const parsedMs = Date.parse(String(item.date).replace(/-/g, "/"));
    return !Number.isFinite(parsedMs) || Math.abs(nowMs - parsedMs) <= 3 * 60 * 1000;
  });
}

function buildUnrecognizedFallbackMedia(finalTitle, forceType = "") {
  const cleanHeading = cleanRawHeadingText(finalTitle) || finalTitle;
  const yearMatch = String(finalTitle || "").match(/\b(19\d{2}|20\d{2})\b/);
  const isTvHint = /\bS\d{1,2}(?:E\d{1,3})?\b|\bEP?\d{1,3}\b|第\s*\d+\s*[季集话]/i.test(String(finalTitle || ""));
  return {
    type: forceType || (isTvHint ? "电视剧" : "电影"),
    title: cleanHeading,
    year: yearMatch ? yearMatch[1] : "",
    category: "",
  };
}

async function downloadTorrent(
  btn,
  media_info,
  torrent_name,
  torrent_description,
  download_link,
  torrent_size,
  pushOptions = {},
) {
  const finalTitle = cleanText(pushOptions.title ?? torrent_name);
  const cleanDesc = cleanSubtitleText(pushOptions.description ?? torrent_description ?? "");
  const downloader = pushOptions.downloader !== undefined ? pushOptions.downloader : mpDefaultDownloader || null;
  const savePath = pushOptions.save_path !== undefined ? pushOptions.save_path : mpDefaultSavePath || null;
  const forceUnrecognized = Boolean(pushOptions.forceUnrecognized || !media_info);
  const forceType = pushOptions.forceType || "";

  if (btn) {
    btn.disabled = true;
    btn.className = "mp-btn mp-btn-primary";
    btn.innerHTML = `<span class="mp-spinner"></span> ${forceUnrecognized ? "强制推送中..." : "推送中..."}`;
    btn.title = "";
  }

  const toastId = createToast("正在连接站点", "正在获取站点配置并准备推送...", "info");

  const siteRes = await mpApiRequest(`/api/v1/site/domain/${encodeURIComponent(window.location.hostname)}`);
  const siteData = siteRes.ok && siteRes.data && typeof siteRes.data === "object" ? siteRes.data : {};
  if (!siteRes.ok) {
    debugLog("site domain lookup fallback", { host: window.location.hostname, status: siteRes.status });
  }

  updateToast(
    toastId,
    forceUnrecognized ? "正在强制下发到下载器" : "正在下发到下载器",
    `标题：${finalTitle}\n描述：${cleanDesc || "(无)"}${downloader ? `\n下载器：${downloader}` : ""}${savePath ? `\n路径：${savePath}` : ""}`,
    "info",
  );

  const pageMeta = extractPageTorrentMeta();
  const torrent_in = {
    site: siteData.id || 0,
    site_name: siteData.name || "",
    site_cookie: siteData.cookie || "",
    site_ua: navigator.userAgent,
    site_proxy: siteData.proxy || null,
    site_order: siteData.pri || null,
    title: finalTitle,
    description: cleanDesc,
    imdbid: pageMeta.imdbid,
    enclosure: download_link,
    page_url: window.location.href,
    size: torrent_size || 0,
    seeders: pageMeta.seeders,
    peers: pageMeta.peers,
    grabs: pageMeta.grabs,
    pubdate: new Date().toISOString().replace(/T/, " ").replace(/\..+/, ""),
    date_elapsed: null,
    uploadvolumefactor: pageMeta.uploadvolumefactor,
    downloadvolumefactor: pageMeta.downloadvolumefactor,
    hit_and_run: false,
    labels: [],
    pri_order: 0,
    volume_factor: pageMeta.volume_factor,
  };
  if (forceUnrecognized && forceType) {
    torrent_in.category = forceType;
  }

  let dlRes;
  if (forceUnrecognized) {
    const addPayload = {
      torrent_in,
      allow_unrecognized: true,
    };
    if (downloader) addPayload.downloader = downloader;
    if (savePath) addPayload.save_path = savePath;
    dlRes = await mpApiRequest("/api/v1/download/add", { method: "POST", data: addPayload, timeout: 60000 });

    // 兼容 MoviePilot V2（不支持 allow_unrecognized 参数时，携带兜底 media_in 走 /api/v1/download/）
    if (!dlRes.ok && !dlRes.isTimeout && dlRes.status !== 0 && dlRes.status !== 502 && dlRes.status !== 504) {
      const fallbackPayload = {
        media_in: media_info || buildUnrecognizedFallbackMedia(finalTitle, forceType),
        torrent_in,
      };
      if (downloader) fallbackPayload.downloader = downloader;
      if (savePath) fallbackPayload.save_path = savePath;
      dlRes = await mpApiRequest("/api/v1/download/", { method: "POST", data: fallbackPayload, timeout: 60000 });
    }
  } else {
    const payload = {
      media_in: media_info,
      torrent_in,
    };
    if (downloader) payload.downloader = downloader;
    if (savePath) payload.save_path = savePath;
    dlRes = await mpApiRequest("/api/v1/download/", { method: "POST", data: payload, timeout: 60000 });
  }

  let verifiedQueued = false;
  if (!dlRes.ok && (dlRes.isTimeout || dlRes.status === 0 || dlRes.status === 502 || dlRes.status === 504)) {
    verifiedQueued = await verifyDownloadQueued(finalTitle).catch(() => false);
  }

  if (btn) btn.disabled = false;
  if (dlRes.ok || verifiedQueued) {
    if (btn) {
      btn.className = "mp-btn mp-btn-success";
      btn.innerHTML = `${mpIcon("check", 13)}<span>${forceUnrecognized ? "已强推" : "已推送"}</span>`;
      btn.title = "再次点击可重新推送";
    }
    const msg = dlRes.ok
      ? dlRes.message || (forceUnrecognized ? "未识别资源已强制加入下载队列" : "任务已成功接管")
      : "请求响应较慢，但已核对任务成功进入下载队列";
    const descSnippet = cleanDesc.length > 80 ? cleanDesc.slice(0, 80) + "..." : cleanDesc || "(无)";
    updateToast(
      toastId,
      forceUnrecognized ? "强制推送成功" : "推送成功",
      `${msg}\n描述：${descSnippet}`,
      "success",
      4000,
    );
    return true;
  } else {
    if (btn) {
      btn.className = "mp-btn mp-btn-danger";
      btn.innerHTML = `${mpIcon("xCircle", 13)}<span>推送失败 (重试)</span>`;
      btn.title = dlRes.message || "推送失败，请检查 MoviePilot 日志";
    }
    updateToast(toastId, "推送被拒绝或执行失败", dlRes.message || "未知错误", "error");
    return false;
  }
}
async function fetchLazyDownloadLinkOnDemand(type, initialLink = "") {
  if (initialLink) return initialLink;
  if (type === "mteam") return waitForMTeamLinkOnDemand("");
  if (type === "sunnypt") return fetchSunnyPTDownloadLink(getCurrentSunnyPTTid());
  return "";
}

async function resolveLinkAndPush(
  btn,
  type,
  mediaInfo,
  title,
  desc,
  initialLink,
  size,
  pushOptions = {},
  isStillValid = () => true,
) {
  let finalLink = initialLink;
  if (!finalLink && (type === "mteam" || type === "sunnypt")) {
    if (btn) {
      if (btn.disabled) return;
      btn.disabled = true;
      btn.className = "mp-btn mp-btn-primary";
      btn.innerHTML = '<span class="mp-spinner"></span> 获取链接...';
      btn.title = "";
    }
    finalLink = await fetchLazyDownloadLinkOnDemand(type, "");
    if (!isStillValid()) return;
    if (!finalLink) {
      if (btn) {
        btn.disabled = false;
        btn.className = "mp-btn mp-btn-danger";
        btn.textContent = "获取失败 (点击重试)";
        btn.title =
          type === "mteam"
            ? "未捕获到下载链接，可点击重试或先点一次原生下载按钮"
            : "未获取到下载链接，请检查登录状态后重试";
      }
      createToast(
        "获取链接失败",
        type === "mteam"
          ? "未能捕获 M-Team 下载链接，请先点击一次原生下载按钮重试。"
          : "未能获取 SunnyPT 下载链接，请刷新或确认登录状态后重试。",
        "error",
        4000,
      );
      return;
    }
  }
  return downloadTorrent(btn, mediaInfo, title, desc, finalLink, size, pushOptions);
}

// ---------- 高级推送 & 订阅确认弹窗 ----------
async function openAdvancedPushModal(
  btn,
  mediaInfo,
  torrentName,
  torrentDesc,
  downloadLink,
  torrentSize,
  type,
  options = {},
) {
  const cleanDesc = cleanSubtitleText(torrentDesc || "");
  const forceUnrecognized = Boolean(options.forceUnrecognized || !mediaInfo);
  const mediaSummary = forceUnrecognized
    ? `体积：${escapeHtml(formatSizeText(torrentSize))} · 当前未识别媒体（将按强制直推模式入队）`
    : `体积：${escapeHtml(formatSizeText(torrentSize))} · 识别媒体：《${escapeHtml(mediaInfo.title || "")}》${mediaInfo.year ? ` (${escapeHtml(mediaInfo.year)})` : ""}`;

  const bodyHtml = `
      <p class="mp-modal-desc">${
        forceUnrecognized
          ? "当前未识别到影视条目，可直接指定下载器与保存路径强制推送到 MoviePilot。"
          : "可临时指定本次推送的下载器、保存路径，或微调传递给 MoviePilot 的标题与副标题。"
      }</p>

      <div class="mp-input-group">
        <label for="mp-adv-title">推送标题</label>
        <input type="text" class="mp-input" id="mp-adv-title" value="${escapeHtmlAttr(torrentName)}">
      </div>

      <div class="mp-input-group">
        <label for="mp-adv-desc">清洗后副标题 / 描述</label>
        <textarea class="mp-textarea" id="mp-adv-desc" rows="2">${escapeHtml(cleanDesc)}</textarea>
      </div>

      ${
        forceUnrecognized
          ? `
      <div class="mp-input-group">
        <label for="mp-adv-force-type">媒体类型（用于目录匹配参考）</label>
        <select class="mp-select" id="mp-adv-force-type">
          <option value="">自动推断（默认）</option>
          <option value="电影">电影</option>
          <option value="电视剧">电视剧</option>
        </select>
      </div>`
          : ""
      }

      <div class="mp-form-grid">
        <div class="mp-input-group">
          <label for="mp-adv-downloader">指定下载器</label>
          <select class="mp-select" id="mp-adv-downloader">
            <option value="">默认（由 MoviePilot 决定）</option>
          </select>
        </div>
        <div class="mp-input-group">
          <label for="mp-adv-path">指定保存路径</label>
          <select class="mp-select" id="mp-adv-path">
            <option value="">默认（按分类规则自动整理）</option>
          </select>
        </div>
      </div>

      <div class="mp-help-text" style="margin-top:8px;">${mediaSummary}</div>

      <div class="mp-modal-footer">
        <button type="button" class="mp-btn mp-btn-secondary mp-btn-lg" id="mp-adv-cancel">取消</button>
        <button type="button" class="mp-btn mp-btn-primary mp-btn-lg" id="mp-adv-submit">${forceUnrecognized ? `${mpIcon("zap", 14)}<span>强制推送下载</span>` : `${mpIcon("download", 14)}<span>立即推送下载</span>`}</button>
      </div>
    `;

  const modalTitle = forceUnrecognized
    ? `${mpIcon("zap", 16)}<span>强制推送下载（未识别资源）</span>`
    : `${mpIcon("sliders", 16)}<span>高级推送选项</span>`;
  const { modal, closeModal } = mountModal("mp-adv-push-modal", false, modalTitle, bodyHtml);
  const dlSelect = modal.querySelector("#mp-adv-downloader");
  const pathSelect = modal.querySelector("#mp-adv-path");
  const typeSelect = modal.querySelector("#mp-adv-force-type");
  const submitBtn = modal.querySelector("#mp-adv-submit");

  modal.querySelector("#mp-adv-cancel").addEventListener("click", closeModal);

  populateClientAndPathSelects(modal, dlSelect, pathSelect);

  submitBtn.addEventListener("click", () => {
    const customTitle = modal.querySelector("#mp-adv-title").value.trim() || torrentName;
    const customDesc = modal.querySelector("#mp-adv-desc").value.trim();
    const downloader = dlSelect.value;
    const save_path = pathSelect.value;
    const forceType = typeSelect ? typeSelect.value : "";
    closeModal();
    resolveLinkAndPush(btn, type, mediaInfo, customTitle, customDesc, downloadLink, torrentSize, {
      downloader,
      save_path,
      forceUnrecognized,
      forceType,
    });
  });
}

function openSubscribeModal(mediaInfo, detectedSeason = null, onSubscribed = null, subscribePreset = null) {
  const isTv = mediaInfo.type === "电视剧";
  const defaultSeason = isTv
    ? detectedSeason !== null && detectedSeason !== undefined
      ? Number(detectedSeason)
      : 1
    : "";

  const renderSeasonOptions = (entries, selectedVal) =>
    entries
      .map((entry) => {
        const s = entry.season;
        const code = `S${String(s).padStart(2, "0")}`;
        const extra = [entry.year, entry.episodes ? `${entry.episodes}集` : ""].filter(Boolean).join(" · ");
        const baseLabel = s === 0 ? `特别篇 (${code})` : `第 ${s} 季 (${code}${extra ? ` · ${extra}` : ""})`;
        return `<option value="${s}" ${Number(selectedVal) === s ? "selected" : ""}>${escapeHtml(baseLabel)}</option>`;
      })
      .join("");

  const initialSeasons = isTv ? resolveMediaSeasonEntries(mediaInfo, defaultSeason) : [];
  const seasonOptionsHtml = isTv ? renderSeasonOptions(initialSeasons, defaultSeason) : "";

  const activePreset =
    mpSubAutoFillSpecs && subscribePreset ? subscribePreset : { quality: "", resolution: "", effect: "", labels: [] };
  const buildSelectOptions = (list, selectedVal = "") =>
    list
      .map(
        (item) =>
          `<option value="${escapeHtmlAttr(item.value)}" ${selectedVal && item.value === selectedVal ? "selected" : ""}>${escapeHtml(item.title)}</option>`,
      )
      .join("");

  const hasPresetData = Boolean(
    subscribePreset && (subscribePreset.quality || subscribePreset.resolution || subscribePreset.effect),
  );
  const bodyHtml = `
      <div class="mp-preview-box">
        <div class="mp-preview-header">
          <span class="mp-preview-key">订阅媒体与匹配参数</span>
          ${hasPresetData ? `<button type="button" class="mp-status-link" id="mp-sub-autofill-btn">按当前种子填充</button>` : ""}
        </div>
        <div class="mp-preview-line"><span class="mp-preview-key">订阅媒体:</span><span class="mp-preview-val">${escapeHtml(mediaInfo.title || "")} ${mediaInfo.year ? `(${escapeHtml(mediaInfo.year)})` : ""} · ${escapeHtml(mediaInfo.type || "电影")}</span></div>
        <div class="mp-preview-line"><span class="mp-preview-key">TMDB ID:</span><span class="mp-preview-val">${escapeHtml(String(mediaInfo.tmdb_id || ""))}${mpSubAutoFillSpecs && activePreset.labels?.length ? ` · 已自动预填：${escapeHtml(activePreset.labels.join(" / "))}` : ""}</span></div>
      </div>

      <div class="mp-form-grid">
        ${
          isTv
            ? `
          <div class="mp-input-group">
            <label for="mp-sub-season">订阅季号</label>
            <select class="mp-select" id="mp-sub-season">${seasonOptionsHtml}</select>
          </div>
        `
            : ""
        }
        <div class="mp-input-group">
          <label for="mp-sub-quality">质量要求</label>
          <select class="mp-select" id="mp-sub-quality">${buildSelectOptions(MP_QUALITY_OPTIONS, activePreset.quality)}</select>
        </div>
        <div class="mp-input-group">
          <label for="mp-sub-resolution">分辨率</label>
          <select class="mp-select" id="mp-sub-resolution">${buildSelectOptions(MP_RESOLUTION_OPTIONS, activePreset.resolution)}</select>
        </div>
        <div class="mp-input-group">
          <label for="mp-sub-effect">视频特效</label>
          <select class="mp-select" id="mp-sub-effect">${buildSelectOptions(MP_EFFECT_OPTIONS, activePreset.effect)}</select>
        </div>
        <div class="mp-input-group">
          <label for="mp-sub-downloader">下载器</label>
          <select class="mp-select" id="mp-sub-downloader"><option value="">默认</option></select>
        </div>
        <div class="mp-input-group">
          <label for="mp-sub-path">保存路径</label>
          <select class="mp-select" id="mp-sub-path"><option value="">自动整理路径</option></select>
        </div>
        <div class="mp-input-group">
          <label for="mp-sub-include">包含关键词（可选正则）</label>
          <input type="text" class="mp-input" id="mp-sub-include" placeholder="如：简繁|中字">
        </div>
        <div class="mp-input-group">
          <label for="mp-sub-exclude">排除关键词（可选正则）</label>
          <input type="text" class="mp-input" id="mp-sub-exclude" placeholder="如：CAM|TC|国语">
        </div>
        <div class="mp-input-group" style="grid-column: 1 / -1;">
          <div class="mp-rule-header">
            <label>优先级规则组 <span class="mp-rule-badge" id="mp-sub-filter-count">使用系统默认</span></label>
            <button type="button" class="mp-status-link" id="mp-sub-filter-clear" style="display:none;">清空选择</button>
          </div>
          <div class="mp-rule-groups-box" id="mp-sub-filter-groups">
            <span class="mp-status-text"><span class="mp-spinner"></span> 正在加载优先级规则组...</span>
          </div>
          <p class="mp-help-text">可多选。不选择任何规则组时，将沿用 MoviePilot 默认订阅规则组。</p>
        </div>
      </div>

      <div class="mp-switch-row" style="margin-top:12px;">
        <div>
          <div class="mp-switch-label">开启洗版模式</div>
          <div class="mp-switch-sub">发现更高质量的资源时自动替换旧版本</div>
        </div>
        ${renderToggleHtml("mp-sub-best", false)}
      </div>

      <div id="mp-sub-status" class="mp-status-banner"></div>

      <div class="mp-modal-footer">
        <button type="button" class="mp-btn mp-btn-secondary mp-btn-lg" id="mp-sub-cancel">取消</button>
        <button type="button" class="mp-btn mp-btn-primary mp-btn-lg" id="mp-sub-confirm">${mpIcon("star", 13)}<span>确认添加订阅</span></button>
      </div>
    `;

  const { modal, closeModal } = mountModal(
    "mp-sub-modal",
    false,
    `${mpIcon("star", 15)}<span>添加 MoviePilot 订阅</span>`,
    bodyHtml,
  );
  const seasonSelect = modal.querySelector("#mp-sub-season");
  const dlSelect = modal.querySelector("#mp-sub-downloader");
  const pathSelect = modal.querySelector("#mp-sub-path");
  const confirmBtn = modal.querySelector("#mp-sub-confirm");
  const statusEl = modal.querySelector("#mp-sub-status");

  modal.querySelector("#mp-sub-cancel").addEventListener("click", closeModal);

  modal.querySelector("#mp-sub-autofill-btn")?.addEventListener("click", () => {
    if (!subscribePreset) return;
    const qEl = modal.querySelector("#mp-sub-quality");
    const rEl = modal.querySelector("#mp-sub-resolution");
    const eEl = modal.querySelector("#mp-sub-effect");
    if (qEl) {
      qEl.value = subscribePreset.quality || "";
      refreshCustomSelect(qEl);
    }
    if (rEl) {
      rEl.value = subscribePreset.resolution || "";
      refreshCustomSelect(rEl);
    }
    if (eEl) {
      eEl.value = subscribePreset.effect || "";
      refreshCustomSelect(eEl);
    }
  });
  if (
    isTv &&
    seasonSelect &&
    mediaInfo?.tmdb_id &&
    !Array.isArray(mediaInfo?.season_info) &&
    !Array.isArray(mediaInfo?.seasons)
  ) {
    fetchTmdbSeasons(mediaInfo.tmdb_id).then((remoteSeasons) => {
      if (!modal.isConnected || !remoteSeasons.length) return;
      const currentVal = seasonSelect.value;
      const refined = resolveMediaSeasonEntries(mediaInfo, defaultSeason, remoteSeasons);
      seasonSelect.innerHTML = renderSeasonOptions(refined, currentVal);
      if (Array.from(seasonSelect.options).some((o) => o.value === currentVal)) {
        seasonSelect.value = currentVal;
      }
      refreshCustomSelect(seasonSelect);
    });
  }

  populateClientAndPathSelects(modal, dlSelect, pathSelect);
  const filterBox = modal.querySelector("#mp-sub-filter-groups");
  const filterCountEl = modal.querySelector("#mp-sub-filter-count");
  const filterClearBtn = modal.querySelector("#mp-sub-filter-clear");
  const selectedFilterGroups = [];

  const syncFilterGroupHeader = () => {
    if (filterCountEl) {
      filterCountEl.textContent = selectedFilterGroups.length
        ? `已选 ${selectedFilterGroups.length} 项`
        : "使用系统默认";
      filterCountEl.classList.toggle("active", selectedFilterGroups.length > 0);
    }
    if (filterClearBtn) {
      filterClearBtn.style.display = selectedFilterGroups.length ? "inline-block" : "none";
    }
  };

  filterClearBtn?.addEventListener("click", () => {
    selectedFilterGroups.length = 0;
    filterBox?.querySelectorAll(".mp-rule-chip.active").forEach((chip) => {
      chip.classList.remove("active");
      chip.setAttribute("aria-pressed", "false");
    });
    syncFilterGroupHeader();
  });

  if (filterBox) {
    fetchFilterRuleGroups().then(({ items, errorStatus }) => {
      if (!modal.isConnected) return;
      if (!items.length) {
        const emptyMsg =
          errorStatus === 401 || errorStatus === 403
            ? "当前 API Key 无权限读取规则组，提交时将沿用系统默认"
            : "暂未配置优先级规则组，提交时将沿用系统默认";
        filterBox.innerHTML = `<span class="mp-status-text">${escapeHtml(emptyMsg)}</span>`;
        return;
      }
      filterBox.innerHTML = "";
      items.forEach((group) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "mp-rule-chip";
        chip.dataset.name = group.name;
        chip.setAttribute("aria-pressed", "false");
        const metaHint = [group.media_type, group.category].filter(Boolean).join(" · ");
        chip.title = metaHint ? `${group.name} (${metaHint})` : group.name;
        chip.innerHTML = `<span class="mp-rule-chip-check">${mpIcon("check", 12)}</span><span>${escapeHtml(group.name)}</span>`;
        chip.addEventListener("click", () => {
          const idx = selectedFilterGroups.indexOf(group.name);
          if (idx >= 0) {
            selectedFilterGroups.splice(idx, 1);
            chip.classList.remove("active");
            chip.setAttribute("aria-pressed", "false");
          } else {
            selectedFilterGroups.push(group.name);
            chip.classList.add("active");
            chip.setAttribute("aria-pressed", "true");
          }
          syncFilterGroupHeader();
        });
        filterBox.appendChild(chip);
      });
    });
  }
  confirmBtn.addEventListener("click", async () => {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="mp-spinner"></span> 提交订阅...';
    const chosenSeason = isTv ? modal.querySelector("#mp-sub-season").value : null;
    const result = await createSubscription(mediaInfo, {
      season: chosenSeason,
      quality: modal.querySelector("#mp-sub-quality").value,
      resolution: modal.querySelector("#mp-sub-resolution").value,
      effect: modal.querySelector("#mp-sub-effect").value,
      downloader: dlSelect.value,
      save_path: pathSelect.value,
      include: modal.querySelector("#mp-sub-include").value.trim(),
      exclude: modal.querySelector("#mp-sub-exclude").value.trim(),
      best_version: modal.querySelector("#mp-sub-best").checked,
      filter_groups: selectedFilterGroups.slice(),
    });

    if (result.success) {
      closeModal();
      const groupNote = selectedFilterGroups.length ? `（规则组：${selectedFilterGroups.join("、")}）` : "";
      createToast(
        "订阅成功",
        `已将《${mediaInfo.title}》${isTv && chosenSeason ? `第 ${chosenSeason} 季` : ""}加入订阅${groupNote}`,
        "success",
        3500,
      );
      if (typeof onSubscribed === "function") onSubscribed(chosenSeason);
    } else {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = `${mpIcon("star", 13)}<span>确认添加订阅</span>`;
      statusEl.style.display = "block";
      statusEl.className = "mp-status-banner error";
      statusEl.textContent = result.message || "订阅失败，请检查权限或参数";
    }
  });
}

// ---------- 结果页面 UI 构建 ----------
function buildHtml(row, mediaInfo, type, torrentName, torrentDesc, downloadLink, torrentSize, metaInfo = {}) {
  if (!mediaInfo) return "";
  const safeMeta = metaInfo || {};
  const isTv = mediaInfo.type === "电视剧";
  const tmdbType = isTv ? "tv" : "movie";
  const tmdbId = String(mediaInfo.tmdb_id || "").replace(/[^\d]/g, "");
  const detectedSeason = isTv && safeMeta.begin_season != null ? Number(safeMeta.begin_season) : null;
  const mountToken = String(++mpMountSeq);
  row.dataset.mpMountToken = mountToken;

  // 1) 主媒体识别区
  let mediaGroupHtml = "";
  if (mediaInfo.type) mediaGroupHtml += renderTag(mediaInfo.type, "mp-tag-type", mediaInfo.category || "");
  if (mediaInfo.title)
    mediaGroupHtml += renderTag(mediaInfo.title, "mp-tag-title", mediaInfo.en_title || mediaInfo.original_title || "");
  if (mediaInfo.year) mediaGroupHtml += renderTag(mediaInfo.year, "mp-tag-year");
  if (safeMeta.season_episode) {
    mediaGroupHtml += renderTag(safeMeta.season_episode, "mp-tag-season");
  } else if (detectedSeason) {
    mediaGroupHtml += renderTag(`S${String(detectedSeason).padStart(2, "0")}`, "mp-tag-season");
  }
  if (tmdbId) {
    mediaGroupHtml += `<a class="mp-tag mp-tag-tmdb mp-tag-link" href="https://www.themoviedb.org/${tmdbType}/${tmdbId}" target="_blank" rel="noopener noreferrer" title="在 TMDB 查看"><span>TMDB:${escapeHtml(tmdbId)}</span>${mpIcon("arrowUpRight", 12)}</a>`;
  }

  // 2) 技术参数区（紧凑中性配色）
  let specsGroupHtml = "";
  if (mpShowSpecs) {
    if (safeMeta.edition) specsGroupHtml += renderTag(safeMeta.edition, "mp-tag-spec");
    if (safeMeta.resource_pix) specsGroupHtml += renderTag(safeMeta.resource_pix, "mp-tag-spec");
    if (safeMeta.video_encode) specsGroupHtml += renderTag(safeMeta.video_encode, "mp-tag-spec");
    if (safeMeta.audio_encode) specsGroupHtml += renderTag(safeMeta.audio_encode, "mp-tag-spec");
    const releaseTeam = cleanText(safeMeta.resource_team || "") || extractReleaseTeam(torrentName);
    if (releaseTeam) specsGroupHtml += renderTag(releaseTeam, "mp-tag-team", "制作组 / 发布组");
  }

  // 3) 入库与订阅状态区
  const existsId = nextUid("exists");
  const subId = nextUid("sub");

  // 4) 操作按钮区
  const btnId = nextUid("dl");
  const advBtnId = nextUid("dladv");
  const reBtnId = nextUid("re");
  const cfgBtnId = nextUid("cfg");

  const canPush = Boolean(downloadLink);
  const canLazyPush = type === "mteam" || type === "sunnypt";
  const buttonHtml = canPush || canLazyPush ? `${mpIcon("download", 13)}<span>推送下载</span>` : "无下载链接";
  const buttonCls = canPush || canLazyPush ? "mp-btn mp-btn-primary" : "mp-btn mp-btn-secondary";

  const loadingExistsHtml = tmdbId
    ? `<span class="mp-tag mp-tag-loading"><span class="mp-spinner"></span>检测入库</span>`
    : "";
  const loadingSubHtml = tmdbId
    ? `<span class="mp-tag mp-tag-loading"><span class="mp-spinner"></span>检测订阅</span>`
    : "";

  let html = `<span class="mp-group mp-group-media">${mediaGroupHtml}</span>`;
  if (specsGroupHtml) {
    html += `<span class="mp-group mp-group-specs">${specsGroupHtml}</span>`;
  }
  html += `<span class="mp-group mp-group-status"><span id="${existsId}" class="mp-status-slot">${loadingExistsHtml}</span><span id="${subId}" class="mp-status-slot">${loadingSubHtml}</span></span>`;
  html += `<span class="mp-group mp-group-actions">`;
  if (canPush || canLazyPush) {
    html += `<span class="mp-btn-split"><button type="button" id="${btnId}" class="${buttonCls}">${buttonHtml}</button><button type="button" id="${advBtnId}" class="${buttonCls} mp-btn-split-care" title="选择下载器、保存路径或调整描述">${mpIcon("chevronDown", 12)}</button></span>`;
  } else {
    html += `<button type="button" id="${btnId}" class="${buttonCls}" disabled title="当前页面未提取到可用下载链接">${buttonHtml}</button>`;
  }
  html += `<button type="button" id="${reBtnId}" class="mp-btn mp-btn-secondary">重新识别</button>`;
  html += `<button type="button" id="${cfgBtnId}" class="mp-btn mp-btn-icon" title="MoviePilot 配置">${mpIcon("settings", 13)}</button>`;
  html += `</span>`;

  const isStillValid = () => row.isConnected && row.dataset.mpMountToken === mountToken;

  const bindEvents = () => {
    const btn = row.querySelector(`#${btnId}`) || document.getElementById(btnId);
    const advBtn = row.querySelector(`#${advBtnId}`) || document.getElementById(advBtnId);
    const reBtn = row.querySelector(`#${reBtnId}`) || document.getElementById(reBtnId);
    const cfgBtn = row.querySelector(`#${cfgBtnId}`) || document.getElementById(cfgBtnId);

    if (btn && (canPush || canLazyPush)) {
      btn.addEventListener("click", () => {
        resolveLinkAndPush(btn, type, mediaInfo, torrentName, torrentDesc, downloadLink, torrentSize, {}, isStillValid);
      });
    }

    if (advBtn) {
      advBtn.addEventListener("click", () =>
        openAdvancedPushModal(btn, mediaInfo, torrentName, torrentDesc, downloadLink, torrentSize, type),
      );
    }

    if (reBtn) {
      reBtn.addEventListener("click", () =>
        openManualModal(row, type, torrentName, torrentDesc, downloadLink, torrentSize, safeMeta),
      );
    }

    if (cfgBtn) {
      cfgBtn.addEventListener("click", showConfigModal);
    }

    if (tmdbId) {
      checkMediaExists(mediaInfo, detectedSeason).then((info) => {
        if (!isStillValid()) return;
        const el = document.getElementById(existsId);
        if (!el) return;
        if (info.exists) {
          const epSuffix = info.episodeCount
            ? ` (${info.seasonNum ? `S${String(info.seasonNum).padStart(2, "0")}·` : ""}${info.episodeCount}集)`
            : "";
          if (info.itemId) {
            const playBtnId = nextUid("play");
            el.innerHTML = `<button type="button" id="${playBtnId}" class="mp-tag mp-tag-exists mp-tag-link" title="点击获取媒体服务器在线播放地址">${mpIcon("check", 12)}<span>已入库${escapeHtml(epSuffix)}</span>${mpIcon("play", 10)}</button>`;
            document.getElementById(playBtnId)?.addEventListener("click", async () => {
              const playUrl = await fetchPlayUrl(info.itemId);
              if (playUrl) {
                window.open(playUrl, "_blank", "noopener,noreferrer");
              } else {
                createToast("无法获取播放链接", "媒体库中存在该条目，但未返回播放地址", "info", 3000);
              }
            });
          } else {
            el.innerHTML = renderIconTag("check", `已入库${epSuffix}`, "mp-tag-exists");
          }
        } else {
          el.innerHTML = renderTag("未入库", "mp-tag-missing");
        }
      });

      checkSubscriptionStatus(tmdbId, detectedSeason, isTv).then((found) => {
        if (!isStillValid()) return;
        const el = document.getElementById(subId);
        if (!el) return;
        if (found) {
          const total = found.total_episode || 0;
          const completed =
            found.completed_episode != null
              ? found.completed_episode
              : total && found.lack_episode != null
                ? Math.max(total - found.lack_episode, 0)
                : null;
          const progressText = isTv && total > 0 && completed !== null ? ` (${completed}/${total})` : "";
          const prefix = found.best_version ? "洗版中" : "已订阅";
          el.innerHTML = renderIconTag(
            "star",
            `${prefix}${progressText}`,
            "mp-tag-sub-on",
            found.season ? `第 ${found.season} 季` : "",
          );
        } else {
          const renderSubUi = (label, cls) => {
            const subBtnId = nextUid("subbtn");
            const subCfgId = nextUid("subcfg");
            const splitCls =
              cls === "mp-tag-sub-err" ? "mp-btn-split mp-btn-split-sub-err" : "mp-btn-split mp-btn-split-sub";
            const subIcon = cls === "mp-tag-sub-err" ? mpIcon("xCircle", 12) : mpIcon("plus", 12);
            el.innerHTML = `<span class="${splitCls}"><button type="button" id="${subBtnId}" class="mp-tag ${cls}">${subIcon}<span>${escapeHtml(label)}</span></button><button type="button" id="${subCfgId}" class="mp-tag ${cls} mp-tag-split-care" title="订阅设置（季号 / 洗版 / 质量）">${mpIcon("chevronDown", 12)}</button></span>`;
            const subBtn = document.getElementById(subBtnId);
            const subCfgBtn = document.getElementById(subCfgId);
            const markSubscribed = (chosenSeason) => {
              const sTip = chosenSeason ? `第 ${chosenSeason} 季` : "";
              el.innerHTML = renderIconTag("star", "已订阅", "mp-tag-sub-on", sTip);
            };

            const torrentSubPreset = inferSubscribePresetFromTorrent(torrentName, safeMeta, torrentDesc);

            subBtn?.addEventListener("click", () => {
              el.innerHTML = renderTag("订阅中...", "mp-tag-sub-busy");
              const subOpts = { season: detectedSeason };
              if (mpSubAutoFillSpecs) {
                if (torrentSubPreset.quality) subOpts.quality = torrentSubPreset.quality;
                if (torrentSubPreset.resolution) subOpts.resolution = torrentSubPreset.resolution;
                if (torrentSubPreset.effect) subOpts.effect = torrentSubPreset.effect;
              }
              createSubscription(mediaInfo, subOpts).then((res) => {
                if (!isStillValid()) return;
                if (res.success) {
                  markSubscribed(detectedSeason);
                  const presetSuffix =
                    mpSubAutoFillSpecs && torrentSubPreset.labels.length
                      ? `（${torrentSubPreset.labels.join(" / ")}）`
                      : "";
                  createToast(
                    "订阅成功",
                    `已将《${mediaInfo.title}》${detectedSeason ? `第 ${detectedSeason} 季` : ""}加入 MoviePilot 订阅${presetSuffix}`,
                    "success",
                    3000,
                  );
                } else {
                  renderSubUi("订阅失败 (重试)", "mp-tag-sub-err");
                  createToast("订阅失败", res.message || "请检查 MoviePilot 订阅设置", "error", 4000);
                }
              });
            });

            subCfgBtn?.addEventListener("click", () => {
              openSubscribeModal(mediaInfo, detectedSeason, markSubscribed, torrentSubPreset);
            });
          };
          renderSubUi(detectedSeason ? `订阅 S${String(detectedSeason).padStart(2, "0")}` : "订阅", "mp-tag-sub-btn");
        }
      });
    }
  };

  return { html, bindEvents };
}

function mountBuiltHtml(row, type, built) {
  row.innerHTML = renderMoviepilotTag(type, built.html, row);
  built.bindEvents();
}

// ---------- 手动关联识别弹窗 ----------
function openManualModal(row, type, torrentName, torrentDesc, downloadLink, torrentSize, metaInfo = {}) {
  const cleanDesc = cleanSubtitleText(torrentDesc || "");
  const rawCleaned = cleanRawHeadingText(torrentName || "");
  const allCandidates = getRecognitionCandidates(torrentName, cleanDesc);
  const chipCandidates = allCandidates.filter((c) => c !== rawCleaned);
  const finalChips = (chipCandidates.length ? chipCandidates : allCandidates).slice(0, 6);
  const defaultQuery = finalChips[0] || "";

  const chipsHtml = finalChips
    .map(
      (c) =>
        `<button type="button" class="mp-chip ${c === defaultQuery ? "active" : ""}" data-query="${escapeHtmlAttr(c)}" title="${escapeHtmlAttr(c)}">${escapeHtml(c)}</button>`,
    )
    .join("");

  const bodyHtml = `
      <div class="mp-preview-box">
        <div class="mp-preview-header">
          <span class="mp-preview-key">待推送种子信息预览（可微调描述）</span>
          <button type="button" class="mp-status-link" id="mp-toggle-edit-meta">编辑标题/描述</button>
        </div>
        <div id="mp-preview-readonly">
          <div class="mp-preview-line"><span class="mp-preview-key">提取标题:</span><span class="mp-preview-val" id="mp-prev-title-txt">${escapeHtml(torrentName || "(空)")}</span></div>
          <div class="mp-preview-line"><span class="mp-preview-key">清洗描述:</span><span class="mp-preview-val" id="mp-prev-desc-txt">${escapeHtml(cleanDesc || "(空)")}</span></div>
        </div>
        <div id="mp-preview-editor" style="display:none;margin-top:6px;">
          <div class="mp-input-group">
            <label for="mp-edit-title">自定义推送标题</label>
            <input type="text" class="mp-input" id="mp-edit-title" value="${escapeHtmlAttr(torrentName)}">
          </div>
          <div class="mp-input-group" style="margin-bottom:0;">
            <label for="mp-edit-desc">自定义推送描述</label>
            <textarea class="mp-textarea" id="mp-edit-desc" rows="2">${escapeHtml(cleanDesc)}</textarea>
          </div>
        </div>
      </div>

      <div class="mp-input-group">
        <label for="mp-media-name">输入影视名称、原名或 TMDB/IMDb ID 搜索</label>
        <div class="mp-search-bar">
          <input type="text" class="mp-input" id="mp-media-name" value="${escapeHtmlAttr(defaultQuery)}" placeholder="输入片名、原名或 tt1234567...">
          <button type="button" class="mp-btn mp-btn-primary mp-btn-lg" id="mp-search-all">搜索</button>
        </div>
        ${chipsHtml ? `<div class="mp-chips-wrap" id="mp-search-chips">${chipsHtml}</div>` : ""}
      </div>

      <div class="mp-results-container" id="res-container" style="display:none">
        <div id="res-list"></div>
      </div>

      ${
        downloadLink || type === "mteam" || type === "sunnypt"
          ? `
      <div class="mp-modal-footer" style="justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid var(--mp-border);">
        <span class="mp-help-text" style="margin:0;">未搜索到对应条目？可直接指定保存路径强制下载</span>
        <button type="button" class="mp-btn mp-btn-secondary mp-btn-lg" id="mp-manual-force-push">${mpIcon("zap", 14)}<span>选择路径强制推送</span></button>
      </div>`
          : ""
      }
    `;

  const { modal, closeModal } = mountModal(null, true, `${mpIcon("search", 16)}<span>手动关联识别</span>`, bodyHtml);

  const inputEl = modal.querySelector("#mp-media-name");
  const searchBtn = modal.querySelector("#mp-search-all");
  const resContainer = modal.querySelector("#res-container");
  const listEl = modal.querySelector("#res-list");
  const toggleEditBtn = modal.querySelector("#mp-toggle-edit-meta");
  const readonlyBox = modal.querySelector("#mp-preview-readonly");
  const editorBox = modal.querySelector("#mp-preview-editor");
  const editTitleInput = modal.querySelector("#mp-edit-title");
  const editDescInput = modal.querySelector("#mp-edit-desc");

  let editingMeta = false;
  toggleEditBtn.addEventListener("click", () => {
    editingMeta = !editingMeta;
    readonlyBox.style.display = editingMeta ? "none" : "block";
    editorBox.style.display = editingMeta ? "block" : "none";
    toggleEditBtn.textContent = editingMeta ? "收起编辑" : "编辑标题/描述";
  });

  const getEffectiveMeta = () => ({
    title: editTitleInput.value.trim() || torrentName,
    desc: cleanSubtitleText(editDescInput.value || ""),
  });

  const resolvePosterUrl = (posterPath) => {
    if (!posterPath) return "";
    const p = String(posterPath).trim();
    if (/^https?:\/\//i.test(p)) return p;
    if (p.startsWith("/")) return `https://image.tmdb.org/t/p/w92${p}`;
    return "";
  };

  modal.querySelector("#mp-manual-force-push")?.addEventListener("click", () => {
    const eff = getEffectiveMeta();
    const forceBtn =
      row?.querySelector?.(".mp-force-push-btn, .mp-btn-primary, .mp-btn-success, .mp-btn-danger") || null;
    closeModal();
    openAdvancedPushModal(forceBtn, null, eff.title, eff.desc, downloadLink, torrentSize, type, {
      forceUnrecognized: true,
    });
  });
  const applyMatchedItem = (item, pushImmediately = false) => {
    const eff = getEffectiveMeta();
    const mpTypeName = item.type === "电视剧" ? "电视剧" : "电影";
    const idVal = item.tmdb_id || item.id;
    row.innerHTML = renderMoviepilotTag(
      type,
      '<span class="mp-status-text"><span class="mp-spinner"></span> 正在拉取媒体详情...</span>',
      row,
    );
    closeModal();

    recognizeById(idVal, mpTypeName).then(async (mediaInfo) => {
      if (mediaInfo && mediaInfo.tmdb_id) {
        let latestLink = getLatestDownloadLink(type, downloadLink, {
          allowPrefetch: type === "mteam",
          reason: "manual-recognize",
        });
        const built = buildHtml(row, mediaInfo, type, eff.title, eff.desc, latestLink, torrentSize, metaInfo);
        mountBuiltHtml(row, type, built);

        if (pushImmediately) {
          if (!latestLink && (type === "mteam" || type === "sunnypt")) {
            latestLink = await fetchLazyDownloadLinkOnDemand(type, "");
          }
          if (latestLink) {
            const btn = row.querySelector(".mp-btn-primary");
            downloadTorrent(btn, mediaInfo, eff.title, eff.desc, latestLink, torrentSize);
          } else {
            createToast("已应用匹配结果", "但当前未能提取到下载链接，请手动确认链接", "info", 3500);
          }
        }
      } else {
        row.innerHTML = renderMoviepilotTag(
          type,
          '<span class="mp-status-text mp-status-error">后端拉取信息失败，该条目可能未收录</span> <button type="button" class="mp-btn mp-btn-secondary mp-retry-manual">重新选择</button>',
          row,
        );
        row
          .querySelector(".mp-retry-manual")
          ?.addEventListener("click", () =>
            openManualModal(row, type, eff.title, eff.desc, downloadLink, torrentSize, metaInfo),
          );
      }
    });
  };

  const doSearch = (customQuery) => {
    const query = (typeof customQuery === "string" ? customQuery : inputEl.value).trim();
    if (!query) return;
    inputEl.value = query;
    modal.querySelectorAll(".mp-chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.query === query);
    });

    searchBtn.disabled = true;
    searchBtn.innerHTML = '<span class="mp-spinner"></span> 搜索中';
    resContainer.style.display = "block";
    listEl.innerHTML =
      '<div class="mp-status-text"><span class="mp-spinner"></span> 正在向 MoviePilot 查询媒体信息...</div>';

    searchMediaViaMp(query).then((results) => {
      if (!modal.isConnected) return;
      searchBtn.disabled = false;
      searchBtn.textContent = "搜索";
      listEl.innerHTML = "";

      if (!Array.isArray(results) || !results.length) {
        listEl.innerHTML =
          '<p class="mp-modal-desc" style="margin:8px 0;">未找到相关结果，请尝试点击上方候选关键词、缩短关键词或改用原名。</p>';
        return;
      }

      results.slice(0, 10).forEach((item) => {
        const title = item.title || item.name || "";
        const enTitle = item.en_title || item.original_title || item.original_name || "";
        const mpTypeName = item.type === "电视剧" ? "电视剧" : "电影";
        const year = String(item.year || "N/A");
        const tmdbId = String(item.tmdb_id || item.id || "");
        const voteHtml = item.vote_average
          ? ` · <span style="display:inline-flex;align-items:center;gap:2px;color:var(--mp-warning);font-weight:600;">${mpIcon("star", 11)}${escapeHtml(Number(item.vote_average).toFixed(1))}</span>`
          : "";
        const posterUrl = resolvePosterUrl(item.poster_path);

        const div = document.createElement("div");
        div.className = "mp-result-item";
        div.innerHTML = `
                  ${
                    posterUrl
                      ? `<img class="mp-result-poster" src="${escapeHtmlAttr(posterUrl)}" alt="">`
                      : `<div class="mp-result-poster-placeholder">${mpIcon("film", 20)}</div>`
                  }
                  <div class="mp-result-info">
                    <div class="mp-result-title">
                      <span class="mp-result-type">${escapeHtml(mpTypeName)}</span>
                      <span>${escapeHtml(title)}</span>
                      ${enTitle && enTitle !== title ? `<span style="font-weight:400;color:var(--mp-text-muted);font-size:12px;">(${escapeHtml(enTitle)})</span>` : ""}
                    </div>
                    <div class="mp-result-meta">年份: ${escapeHtml(year)} · TMDB: ${escapeHtml(tmdbId)}${voteHtml}</div>
                    ${item.overview ? `<div class="mp-result-overview">${escapeHtml(item.overview)}</div>` : ""}
                  </div>
                  <div class="mp-result-actions">
                    <button type="button" class="mp-btn mp-btn-secondary mp-btn-sm mp-apply-only">应用</button>
                    ${downloadLink || type === "mteam" || type === "sunnypt" ? `<button type="button" class="mp-btn mp-btn-primary mp-btn-sm mp-apply-push">选定推送</button>` : ""}
                  </div>
                `;
        const img = div.querySelector(".mp-result-poster");
        if (img) {
          img.addEventListener("error", () => {
            const placeholder = document.createElement("div");
            placeholder.className = "mp-result-poster-placeholder";
            placeholder.innerHTML = mpIcon("film", 20);
            img.replaceWith(placeholder);
          });
        }

        div.querySelector(".mp-apply-only")?.addEventListener("click", (e) => {
          e.stopPropagation();
          applyMatchedItem(item, false);
        });
        div.querySelector(".mp-apply-push")?.addEventListener("click", (e) => {
          e.stopPropagation();
          applyMatchedItem(item, true);
        });
        div.addEventListener("dblclick", () => applyMatchedItem(item, false));
        listEl.appendChild(div);
      });
    });
  };

  modal.querySelectorAll(".mp-chip").forEach((chip) => {
    chip.addEventListener("click", () => doSearch(chip.dataset.query));
  });
  searchBtn.addEventListener("click", () => doSearch());
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doSearch();
    }
  });

  if (defaultQuery) {
    doSearch(defaultQuery);
  }
  if (!isTouchOrSmallViewport()) {
    setTimeout(() => {
      inputEl.focus();
      inputEl.select();
    }, 30);
  }
}

// ---------- 页面 DOM 解析核心 ----------
function extractAnimeSiteInfo() {
  const h = window.location.hostname.toLowerCase();
  let torrent_name = "";
  let torrent_description = "";
  let download_link = "";
  let torrent_size = 0;
  let mountTarget = null;

  if (/(^|\.)nyaa\.si$/.test(h)) {
    const heading = document.querySelector(".panel-heading h3.panel-title");
    torrent_name = cleanRawHeadingText(heading?.textContent || "");
    const dlAnchor = document.querySelector(
      '.panel-footer a[href*="/download/"], a[href*="/download/"][href$=".torrent"]',
    );
    download_link = dlAnchor?.href || "";
    const labels = document.querySelectorAll(".panel-body .row > div");
    labels.forEach((el) => {
      if (/^File size:/i.test(cleanText(el.textContent))) {
        torrent_size = getSize(el.nextElementSibling?.textContent || "");
      }
    });
    mountTarget = document.querySelector(".panel-footer") || document.querySelector(".panel-body");
  } else if (/(^|\.)mikanani\.me$/.test(h)) {
    const titleEl =
      document.querySelector(".episode-title") || document.querySelector(".leftbar-container p.bangumi-title");
    torrent_name = cleanRawHeadingText(titleEl?.textContent || document.title);
    const dlAnchor = document.querySelector('a[href$=".torrent"], a[href*="/Download/"]');
    download_link = dlAnchor?.href || "";
    const subEl = document.querySelector(".leftbar-container .bangumi-info, .episode-desc");
    torrent_description = extractCleanSubtitle(subEl);
    mountTarget = titleEl?.parentElement || document.querySelector(".episode-header, .leftbar-nav");
  } else if (/(^|\.)dmhy\.org$/.test(h)) {
    const titleEl = document.querySelector(".topic-title h3") || document.querySelector("h3");
    torrent_name = cleanRawHeadingText(titleEl?.textContent || "");
    const dlAnchor = document.querySelector('#a_torrent, a[href$=".torrent"]');
    download_link = dlAnchor?.href || "";
    const infoItems = document.querySelectorAll(".topic-title li, .topic-nfo li");
    infoItems.forEach((li) => {
      const txt = cleanText(li.textContent);
      if (/檔案大小|文件大小|Size/i.test(txt)) torrent_size = getSize(txt);
    });
    mountTarget = document.querySelector(".topic-title") || titleEl?.parentElement;
  } else if (/(^|\.)bangumi\.moe$/.test(h) || /(^|\.)acgnx\.se$/.test(h)) {
    const hEl = document.querySelector("h1, h2, h3");
    torrent_name = cleanRawHeadingText(hEl?.textContent || document.title);
    const dlAnchor = document.querySelector('a[href$=".torrent"], a[href*="/download/"]');
    download_link = dlAnchor?.href || "";
    mountTarget = hEl?.parentElement;
  } else if (/(^|\.)anibt\.net$/.test(h)) {
    const releaseMatch = window.location.pathname.match(/(?:^|\/[a-z]{2}(?:-[a-z0-9]+)?)\/release\/([^/?#]+)/i);
    const releaseId = releaseMatch ? decodeURIComponent(releaseMatch[1]) : "";
    const headerEl = document.querySelector("main header.sheet, main header");
    const h1 = headerEl?.querySelector("h1") || document.querySelector("main h1, h1");
    const rawTitle = cleanRawHeadingText(h1?.textContent || "");
    if (releaseId && rawTitle && !/^(?:页面不存在|page not found|404)$/i.test(rawTitle)) {
      torrent_name = rawTitle;
      const animeTitle = cleanSubtitleText(
        (headerEl || document).querySelector('nav a[href*="/anime/"], main header a[href*="/anime/"]')?.textContent ||
          "",
      );
      if (animeTitle && !torrent_name.includes(animeTitle)) {
        torrent_description = animeTitle;
      }
      download_link = `${window.location.origin}/api/torrent/${encodeURIComponent(releaseId)}.torrent`;
      const sizeEl = Array.from((headerEl || document).querySelectorAll("span.num, span")).find(
        (el) =>
          el.children.length === 0 &&
          /^\d+(?:[.,]\d+)?\s*(?:TiB|GiB|MiB|KiB|TB|GB|MB|KB|B)$/i.test(cleanText(el.textContent || "")),
      );
      if (sizeEl) {
        torrent_size = getSize(sizeEl.textContent || "");
      } else {
        const sizeMatch = (headerEl?.textContent || "").match(/(\d+(?:[.,]\d+)?\s*(?:TiB|GiB|MiB|KiB|TB|GB|MB|KB))/i);
        if (sizeMatch) torrent_size = getSize(sizeMatch[1]);
      }
      mountTarget = headerEl || h1?.parentElement || null;
    }
  }

  return { torrent_name, torrent_description, download_link, torrent_size, mountTarget };
}
function extractHDWinGInfo(rows) {
  const hdwHeading = document.querySelector(".m_name h2, .m_name h1, h2#top, h1#top");
  let torrent_name = extractCleanHeadingTitle(hdwHeading);
  if (!torrent_name) {
    const btnTitle = document.querySelector("a.torrentdown_button")?.getAttribute("title") || "";
    torrent_name = cleanRawHeadingText(btnTitle);
  }
  const subtitleEl =
    document.querySelector(".m_name h3") ||
    findRowFollowByHeader(rows, /^(?:副标题|副標題|小标题|小標題|Small\s*Description)$/i);
  const torrent_description = extractCleanSubtitle(subtitleEl);

  let download_link = "";
  const clipTarget = document.querySelector("#clip_target");
  const downBtn = document.querySelector("a.torrentdown_button");
  const rawLink =
    clipTarget?.getAttribute("href") || clipTarget?.href || downBtn?.getAttribute("href") || downBtn?.href || "";
  if (rawLink) {
    try {
      download_link = new URL(rawLink, window.location.origin).href;
    } catch (e) {
      download_link = rawLink;
    }
  }
  if (!download_link) download_link = extractNexusDownloadLink(rows);

  let sizeText = "";
  const infoBoxes = Array.from(document.querySelectorAll(".info_box ul, .info_box li, .info_box"));
  for (const el of infoBoxes) {
    const txt = cleanText(el.textContent || "");
    if (/大小|基本信息|Size/i.test(txt)) {
      const m = txt.match(/(?:大小|Size)\s*[:：]?\s*([\d.,]+\s*(?:TiB|GiB|MiB|KiB|TB|GB|MB|KB|B))/i);
      if (m) {
        sizeText = m[1];
        break;
      }
      sizeText = txt;
      break;
    }
  }
  if (!sizeText) {
    const basicInfoCell = findRowFollowByHeader(rows, /^(?:基本信息|基本資訊|大小|尺寸|Basic\s*Info|Size)$/i);
    sizeText = basicInfoCell?.innerText || basicInfoCell?.textContent || "";
  }
  const torrent_size = getSize(sizeText);

  // 优先定位右侧详情表格，确保插入为站点原生表格行
  let mountTable = null;
  let mountRowIdx = -1;
  let rowHeadClass = "rowhead nowrap";
  let rowFollowClass = "rowfollow";
  const preferredOrder = [
    /^(?:基本信息|基本資訊|Basic\s*Info)$/i,
    /^(?:行为|行爲|Action)$/i,
    /^(?:下载链接|下載鏈接|Download\s*Link)$/i,
    /^(?:种子添加|種子添加)$/i,
  ];

  // 1) HDChina / HDWing 原生右侧详情列表 (.info_box > ul > li.left + li.right)
  let mountInfoUl = null;
  let mountInfoUlPos = "afterend";
  const infoUls = Array.from(document.querySelectorAll(".info_box > ul"));
  if (infoUls.length) {
    for (const re of preferredOrder) {
      const found = infoUls.find((ul) => {
        const labelLi = ul.querySelector("li.left, li.leftb");
        return labelLi && re.test(cleanText(labelLi.textContent || ""));
      });
      if (found) {
        mountInfoUl = found;
        const labelTxt = cleanText(found.querySelector("li.left, li.leftb")?.textContent || "");
        mountInfoUlPos = /^(?:行为|行爲|Action)$/i.test(labelTxt) ? "beforebegin" : "afterend";
        break;
      }
    }
    if (!mountInfoUl) {
      mountInfoUl = infoUls[0];
      mountInfoUlPos = "afterend";
    }
  }

  const findHDWinGDetailRow = () => {
    const headerTds = rows.length
      ? Array.from(rows)
      : Array.from(document.querySelectorAll("table tr > td:first-child, table tr > th:first-child"));
    for (const re of preferredOrder) {
      for (const cell of headerTds) {
        if (re.test(cleanText(cell.textContent || ""))) {
          const tr = cell.closest("tr");
          if (tr && tr.cells && tr.cells.length >= 2) return { tr, insertBefore: false, re };
        }
      }
    }
    // 若 .rowhead 不在首列或用了普通 td，兜底全表扫描精确标签
    const allCells = Array.from(document.querySelectorAll("table td, table th"));
    for (const re of preferredOrder) {
      for (const cell of allCells) {
        if (re.test(cleanText(cell.textContent || ""))) {
          const tr = cell.closest("tr");
          if (tr && tr.cells && tr.cells.length >= 2) return { tr, insertBefore: false, re };
        }
      }
    }
    return null;
  };

  const matchedRow = findHDWinGDetailRow();
  if (matchedRow) {
    const { tr } = matchedRow;
    const tbl = tr.closest("table");
    if (tbl && typeof tbl.insertRow === "function") {
      mountTable = tbl;
      // 插在“基本信息”后方，或匹配到“行为”时插在其前方
      const headTxt = cleanText(tr.cells[0]?.textContent || "");
      const offset = /^(?:行为|行爲|Action)$/i.test(headTxt) ? 0 : 1;
      mountRowIdx = Math.min(Math.max(tr.rowIndex + offset, 0), tbl.rows.length);
      if (tr.cells[0]?.className) rowHeadClass = tr.cells[0].className;
      if (tr.cells[1]?.className) rowFollowClass = tr.cells[1].className;
    }
  }

  const mountAnchor =
    document.querySelector(".m_name") || document.querySelector(".details_box") || document.querySelector(".info_box");
  return {
    torrent_name,
    torrent_description,
    download_link,
    torrent_size,
    mountInfoUl,
    mountInfoUlPos,
    mountAnchor,
    mountTable,
    mountRowIdx,
    rowHeadClass,
    rowFollowClass,
  };
}

function mountMpPanel(anchorEl, type, panelClass, titleText, contentId, info) {
  if (!anchorEl || !info?.torrent_name) return false;
  const panel = document.createElement("div");
  panel.id = "mp-row-flag";
  panel.className = panelClass;
  applyThemeClass(panel);
  const isMTeamStyle = panelClass === "mp-mteam-panel";
  panel.innerHTML = `<div class="${isMTeamStyle ? "mp-mteam-title" : "mp-anime-header"}">${escapeHtml(titleText)}</div><div id="${contentId}"${isMTeamStyle ? ' class="mp-mteam-tags"' : ""}>初始化中...</div>`;
  if (anchorEl.tagName === "TD" || anchorEl.tagName === "TH") {
    anchorEl.insertAdjacentElement("afterbegin", panel);
  } else if (anchorEl.tagName === "TR") {
    const tbl = anchorEl.closest("table");
    (tbl || anchorEl).insertAdjacentElement("afterend", panel);
  } else {
    anchorEl.insertAdjacentElement("afterend", panel);
  }
  const row = panel.querySelector(`#${contentId}`);
  if (row) {
    processRecognition(row, type, info.torrent_name, info.torrent_description, info.download_link, info.torrent_size);
    return true;
  }
  return false;
}

function extractNexusSiteInfo(rows) {
  const subtitleCell = findRowFollowByHeader(rows, /^(?:副标题|副標題|小标题|小標題|Small\s*Description)$/i);
  const basicInfoCell = findRowFollowByHeader(rows, /^(?:基本信息|基本資訊|大小|尺寸|Basic\s*Info|Size)$/i);
  let torrent_name = extractCleanHeadingTitle();
  let download_link = "";
  let torrent_description = "";
  let torrent_size = 0;

  if (window.location.href.includes("hdsky")) {
    download_link = extractNexusDownloadLink(rows) || rows[1]?.nextElementSibling?.firstElementChild?.href || "";
    torrent_description = extractCleanSubtitle(subtitleCell || rows[2]?.nextElementSibling);
    torrent_size = getSize((basicInfoCell || rows[3]?.nextElementSibling)?.innerText || "");
  } else if (isQingwaLikeLayout()) {
    download_link = extractNexusDownloadLink(rows);
    torrent_description =
      extractCleanSubtitle(subtitleCell || rows[1]?.nextElementSibling) ||
      cleanSubtitleText(document.querySelector('#titleEditBox input[type="text"]')?.value || "");
    torrent_size = getSize((basicInfoCell || rows[2]?.nextElementSibling)?.innerText || "");
    debugLog("qingwa-like extracted", {
      host: window.location.hostname,
      title: torrent_name,
      downloadLink: download_link,
      subtitlePreview: toPreview(torrent_description),
    });
  } else if (window.location.href.includes("totheglory")) {
    const tds = document.getElementsByClassName("heading");
    const ttgSubCell = findRowFollowByHeader(tds, /^(?:副标题|副標題|Small\s*Description)$/i);
    const ttgSizeCell = findRowFollowByHeader(tds, /^(?:大小|尺寸|Size)$/i) || tds[5]?.nextElementSibling;
    download_link = tds[0]?.nextElementSibling?.firstElementChild?.href || extractNexusDownloadLink(rows);
    torrent_size = getSize(ttgSizeCell?.innerText || "");
    torrent_description = extractCleanSubtitle(ttgSubCell);
    if (!torrent_description && torrent_name.includes("[")) {
      const m = torrent_name.match(/^([^[]+?)\[([^\]]+)\]/);
      if (m) {
        torrent_name = cleanText(m[1]);
        torrent_description = cleanSubtitleText(m[2].replace(/[「」]/g, ""));
      }
    }
  } else {
    download_link = extractNexusDownloadLink(rows);
    const fallbackSubCell =
      !subtitleCell &&
      rows[1] &&
      !/^(?:基本信息|基本資訊|大小|Basic\s*Info)$/i.test(cleanText(rows[1].textContent || ""))
        ? rows[1].nextElementSibling
        : null;
    torrent_description = extractCleanSubtitle(subtitleCell || fallbackSubCell);
    torrent_size = getSize((basicInfoCell || rows[2]?.nextElementSibling)?.innerText || "");
  }

  return { torrent_name, download_link, torrent_description, torrent_size, subtitleCell };
}

function extractDivSiteInfo(divs) {
  const torrent_index_div = document.querySelector("a.index");
  if (!torrent_index_div) return null;
  const findDivValueByLabel = (regex) => {
    for (const d of divs) {
      if (regex.test(cleanText(d.textContent || ""))) return d.nextElementSibling || null;
    }
    return null;
  };
  const subValueEl = findDivValueByLabel(/^(?:副标题|副標題|Small\s*Description)$/i) || divs[3];
  const infoValueEl = findDivValueByLabel(/^(?:基本信息|基本資訊|大小|Size)$/i) || divs[5]?.nextElementSibling;
  const anchorEl = subValueEl || findDivValueByLabel(/^(?:标题|標題|名称|名稱)$/i) || divs[1];
  return {
    torrent_name: cleanRawHeadingText(torrent_index_div.textContent),
    torrent_description: extractCleanSubtitle(subValueEl),
    download_link: torrent_index_div.href,
    torrent_size: getSize(infoValueEl?.innerText || ""),
    anchorEl,
  };
}

async function getSunnyPTAccessToken(forceRefresh = false) {
  if (mpSunnyPTAccessToken && !forceRefresh) return mpSunnyPTAccessToken;
  try {
    const resp = await fetch("/api/auth/session", { credentials: "include" });
    if (!resp.ok) return "";
    const json = await resp.json();
    const d = json?.data || json || {};
    const token = d.accessToken || d.access_token || d.token || "";
    if (token) mpSunnyPTAccessToken = token;
    return token;
  } catch (e) {
    return "";
  }
}

function sunnyPTApiRequest(path, method = "GET", token = "", timeoutMs = 4000) {
  return new Promise((resolve) => {
    if (!token) {
      resolve({ status: 401, data: null });
      return;
    }
    mpGmRequest({
      method,
      url: `https://api.sunnypt.top${path}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: timeoutMs,
      onload: (res) => {
        try {
          const json = JSON.parse(res.responseText || "{}");
          resolve({ status: res.status, data: json?.data || null, code: json?.code });
        } catch (e) {
          resolve({ status: res.status, data: null });
        }
      },
      onerror: () => resolve({ status: 0, data: null }),
      ontimeout: () => resolve({ status: 0, data: null }),
    });
  });
}

async function fetchSunnyPTDetail(tid) {
  if (!tid) return null;
  if (mpSunnyPTDetailCache[tid]) return mpSunnyPTDetailCache[tid];
  let token = await getSunnyPTAccessToken(false);
  if (!token) return null;
  let res = await sunnyPTApiRequest(`/api/v1/torrent/detail?id=${encodeURIComponent(tid)}`, "GET", token);
  if (res.status === 401 || res.code === 401000) {
    token = await getSunnyPTAccessToken(true);
    if (token) res = await sunnyPTApiRequest(`/api/v1/torrent/detail?id=${encodeURIComponent(tid)}`, "GET", token);
  }
  if (res.data && typeof res.data === "object") {
    mpSunnyPTDetailCache[tid] = res.data;
    return res.data;
  }
  return null;
}

async function fetchSunnyPTDownloadLink(tid) {
  if (!tid) return "";
  if (mpSunnyPTLinkCache[tid]) return mpSunnyPTLinkCache[tid];
  let token = await getSunnyPTAccessToken(false);
  if (!token) return "";
  let res = await sunnyPTApiRequest(`/api/v1/torrent/download-link?id=${encodeURIComponent(tid)}`, "POST", token);
  if (res.status === 401 || res.code === 401000) {
    token = await getSunnyPTAccessToken(true);
    if (token)
      res = await sunnyPTApiRequest(`/api/v1/torrent/download-link?id=${encodeURIComponent(tid)}`, "POST", token);
  }
  const dlUrl = res.data?.download_url || (typeof res.data === "string" ? res.data : "");
  if (dlUrl) {
    mpSunnyPTLinkCache[tid] = dlUrl;
    return dlUrl;
  }
  return "";
}

function findSunnyPTActionAnchor() {
  const buttons = Array.from(document.querySelectorAll("button"));
  const dlBtn = buttons.find((b) => cleanText(b.textContent || "") === "下载");
  if (!dlBtn) return null;
  return dlBtn.closest("div.flex.flex-col.items-center") || dlBtn.parentElement?.parentElement || dlBtn.parentElement;
}

function extractSunnyPTInfoFromDom() {
  const h1 = document.querySelector("h1");
  const pAfterH1 =
    h1?.nextElementSibling?.tagName === "P" ? h1.nextElementSibling : h1?.parentElement?.querySelector("p");
  const subText = cleanSubtitleText(h1?.textContent || "");
  const rawName = cleanRawHeadingText(pAfterH1?.textContent || "");
  const bodyTxt = document.body?.innerText || "";
  const sizeMatch = bodyTxt.match(/(\d+(?:[.,]\d+)?\s*(?:TiB|GiB|MiB|KiB|TB|GB|MB))\s*[\r\n\s]*种子总大小/i);
  return {
    torrent_name: rawName || cleanRawHeadingText(subText),
    torrent_description: rawName ? subText : "",
    torrent_size: sizeMatch ? getSize(sizeMatch[1]) : 0,
  };
}

function insertMpRow() {
  if (!shouldProcessCurrentPage() || document.getElementById("mp-row-flag")) return;

  const rows = document.querySelectorAll(".rowhead, .ant-descriptions-item-label");
  const divs = document.getElementsByClassName("font-bold leading-6");

  if (isMTeamDetailPage()) {
    try {
      if (!isMTeamPageDataReady()) return;
      installMTeamNativeDownloadHook();
      const tid = getCurrentMTeamTid();
      const cachedDetail = getCachedMTeamDetail(tid);
      const row = createMTeamMountNode();
      if (!row) return;

      const runMTeamRecognition = () => {
        if (!row.isConnected || getCurrentMTeamTid() !== tid) return;
        const latestRows = document.querySelectorAll(".rowhead, .ant-descriptions-item-label");
        const info = extractMTeamInfo(latestRows);
        if (!info.torrent_name || /^m-team$/i.test(String(info.torrent_name).trim())) {
          row.innerHTML = renderMoviepilotTag(
            "mteam",
            '<span class="mp-status-text mp-status-error">未能提取到有效种子标题</span>',
            row,
          );
          return;
        }
        processRecognition(
          row,
          "mteam",
          info.torrent_name,
          info.torrent_description,
          info.download_link,
          info.torrent_size,
        );
      };

      if (cachedDetail?.name) {
        runMTeamRecognition();
      } else {
        row.innerHTML = renderMoviepilotTag(
          "mteam",
          '<span class="mp-status-text"><span class="mp-spinner"></span> 正在同步 M-Team 种子信息...</span>',
          row,
        );
        fetchMTeamTorrentDetail(tid).finally(runMTeamRecognition);
      }
    } catch (e) {
      console.error("MoviePilot Error:", e);
    }
    return;
  }

  if (isSunnyPTDetailPage()) {
    try {
      const tid = getCurrentSunnyPTTid();
      const anchor = findSunnyPTActionAnchor();
      const h1 = document.querySelector("h1");
      if (!tid || !anchor || !h1 || !cleanText(h1.textContent || "")) return;

      const panel = document.createElement("div");
      panel.id = "mp-row-flag";
      panel.className = "mp-mteam-panel mp-sunny-panel";
      applyThemeClass(panel);
      panel.innerHTML =
        '<div class="mp-mteam-title">MoviePilot</div><div id="mp-sunny-content" class="mp-mteam-tags"><span class="mp-status-text"><span class="mp-spinner"></span> 正在同步 SunnyPT 种子信息...</span></div>';
      anchor.insertAdjacentElement("afterend", panel);
      const row = panel.querySelector("#mp-sunny-content");
      if (!row) return;

      Promise.all([fetchSunnyPTDetail(tid), fetchSunnyPTDownloadLink(tid)]).then(([detail, dlLink]) => {
        if (!row.isConnected || getCurrentSunnyPTTid() !== tid) return;
        const domInfo = extractSunnyPTInfoFromDom();
        const torrent_name = detail?.name ? cleanRawHeadingText(detail.name) : domInfo.torrent_name;
        const torrent_description =
          detail?.subName !== undefined ? cleanSubtitleText(detail.subName || "") : domInfo.torrent_description;
        const torrent_size = parseApiSizeBytes(detail?.size) || domInfo.torrent_size;
        const download_link = dlLink || mpSunnyPTLinkCache[tid] || "";
        debugLog("sunnypt extracted", {
          tid,
          fromApi: Boolean(detail?.name),
          title: torrent_name,
          subtitlePreview: toPreview(torrent_description),
          size: torrent_size,
          hasLink: Boolean(download_link),
        });
        if (!torrent_name) {
          row.innerHTML = renderMoviepilotTag(
            "sunnypt",
            '<span class="mp-status-text mp-status-error">未能提取到有效种子标题</span>',
            row,
          );
          return;
        }
        processRecognition(row, "sunnypt", torrent_name, torrent_description, download_link, torrent_size);
      });
    } catch (e) {
      console.error("MoviePilot Error:", e);
    }
    return;
  }

  if (isAnimeSiteHost()) {
    try {
      const info = extractAnimeSiteInfo();
      mountMpPanel(info.mountTarget, "anime", "mp-anime-panel", "MoviePilot", "mp-anime-content", info);
    } catch (e) {
      console.error("MoviePilot Error:", e);
    }
    return;
  }

  if (isHDWinGSite()) {
    try {
      const info = extractHDWinGInfo(rows);
      debugLog("hdwing extracted", {
        title: info.torrent_name,
        subtitlePreview: toPreview(info.torrent_description),
        downloadLink: info.download_link,
        size: info.torrent_size,
        mountRowIdx: info.mountRowIdx,
      });
      if (info.torrent_name) {
        if (info.mountInfoUl) {
          const ul = document.createElement("ul");
          ul.id = "mp-row-flag";
          ul.style.cssText = "display:flex;align-items:flex-start;margin:0;padding:3px 0;";
          ul.innerHTML =
            '<li class="left" style="flex:0 0 78px;width:78px;margin:0 0 0 -14px;padding:3px 2px;font-size:12.5px;line-height:20px;text-align:right;white-space:nowrap;box-sizing:border-box;">MoviePilot</li><li class="right" id="mp-hdwing-content" style="flex:1 1 auto;min-width:0;width:auto;margin:0;padding:0 2px 0 10px;word-break:normal;"></li>';
          info.mountInfoUl.insertAdjacentElement(info.mountInfoUlPos || "afterend", ul);
          const contentLi = ul.querySelector("#mp-hdwing-content");
          if (contentLi) {
            processRecognition(
              contentLi,
              "hdwing",
              info.torrent_name,
              info.torrent_description,
              info.download_link,
              info.torrent_size,
            );
            return;
          }
        }
        if (info.mountTable && info.mountRowIdx >= 0) {
          const row = info.mountTable.insertRow(info.mountRowIdx);
          row.id = "mp-row-flag";
          row.dataset.mpRowHeadClass = info.rowHeadClass;
          row.dataset.mpRowFollowClass = info.rowFollowClass;
          processRecognition(
            row,
            "common",
            info.torrent_name,
            info.torrent_description,
            info.download_link,
            info.torrent_size,
          );
          return;
        }
        if (
          info.mountAnchor &&
          mountMpPanel(info.mountAnchor, "anime", "mp-mteam-panel", "MoviePilot", "mp-hdwing-content", info)
        )
          return;
      }
    } catch (e) {
      console.error("MoviePilot Error:", e);
    }
  }

  if (rows.length) {
    try {
      const info = extractNexusSiteInfo(rows);
      if (!info.torrent_name) return;
      const table = rows[0].closest("table") || rows[0].parentNode?.parentNode?.parentNode;
      if (!table || typeof table.insertRow !== "function") return;
      const targetTr = info.subtitleCell?.closest("tr") || rows[0].closest("tr");
      const insertIdx =
        targetTr && (targetTr.parentElement === table.tBodies?.[0] || targetTr.parentElement === table)
          ? Math.min(targetTr.rowIndex + 1, table.rows.length)
          : Math.min(2, table.rows.length);
      const row = table.insertRow(insertIdx);
      row.id = "mp-row-flag";
      processRecognition(
        row,
        "common",
        info.torrent_name,
        info.torrent_description,
        info.download_link,
        info.torrent_size,
      );
    } catch (e) {
      console.error("MoviePilot Error:", e);
    }
  } else if (divs.length) {
    try {
      const info = extractDivSiteInfo(divs);
      if (info?.torrent_name && info.anchorEl) {
        info.anchorEl.insertAdjacentHTML(
          "afterend",
          '<div class="font-bold leading-6" id="mp-row-flag">MoviePilot</div><div class="font-light leading-6 flex flex-wrap"><div id="moviepilot" class="font-light leading-6 flex"></div></div>',
        );
        const row = document.getElementById("moviepilot");
        if (row)
          processRecognition(
            row,
            "",
            info.torrent_name,
            info.torrent_description,
            info.download_link,
            info.torrent_size,
          );
      }
    } catch (e) {
      console.error("MoviePilot Error:", e);
    }
  }
}

function processRecognition(row, type, t_name, t_desc, d_link, t_size) {
  const cleanDesc = cleanSubtitleText(t_desc || "");
  const pageUrlSnapshot = window.location.href;
  row.innerHTML = renderMoviepilotTag(
    type,
    '<span class="mp-status-text"><span class="mp-spinner"></span> 正在连接 MoviePilot 接口...</span>',
    row,
  );
  debugLog("processRecognition start", {
    page: pageUrlSnapshot,
    rawTitle: t_name,
    subtitlePreview: toPreview(cleanDesc),
  });

  const isContextAlive = () => row.isConnected && window.location.href === pageUrlSnapshot;

  getMpApiKey()
    .then(() => {
      if (!isContextAlive()) return;
      const candidates = getRecognitionCandidates(t_name, cleanDesc);
      const pageMeta = extractPageTorrentMeta();
      let lastMetaInfo = {};
      debugLog("recognition candidates", candidates);

      const tryRecognize = (index) => {
        if (!isContextAlive()) return;

        if (index >= candidates.length) {
          debugLog("recognition failed after all candidates", candidates);
          row.innerHTML = renderMoviepilotTag(
            type,
            '<span class="mp-status-text"><span class="mp-spinner"></span> 自动识别未命中，尝试 ID / 智能搜索匹配...</span>',
            row,
          );

          autoRecognizeByMpSearch(candidates, cleanDesc, pageMeta).then((mediaInfo) => {
            if (!isContextAlive()) return;
            if (mediaInfo && (mediaInfo.tmdb_id || mediaInfo.douban_id)) {
              const latestLink = getLatestDownloadLink(type, d_link, {
                allowPrefetch: type === "mteam",
                reason: "mp-search-fallback",
              });
              const built = buildHtml(row, mediaInfo, type, t_name, cleanDesc, latestLink, t_size, lastMetaInfo);
              mountBuiltHtml(row, type, built);
            } else {
              const failBtnId = nextUid("manual");
              const forceBtnId = nextUid("forcedl");
              const forceAdvId = nextUid("forceadv");
              const cfgFailBtnId = nextUid("cfg");
              const latestFailLink = getLatestDownloadLink(type, d_link, {
                allowPrefetch: type === "mteam",
                reason: "recognize-failed",
              });
              const canForcePush = Boolean(latestFailLink || type === "mteam" || type === "sunnypt");
              const forcePushHtml = canForcePush
                ? `<span class="mp-btn-split"><button type="button" id="${forceBtnId}" class="mp-btn mp-btn-primary mp-force-push-btn" title="按默认下载器与路径强制推送">${mpIcon("zap", 13)}<span>强制推送</span></button><button type="button" id="${forceAdvId}" class="mp-btn mp-btn-primary mp-btn-split-care" title="选择下载器、保存路径并强制推送">${mpIcon("chevronDown", 12)}</button></span>`
                : `<button type="button" class="mp-btn mp-btn-secondary" disabled title="当前页面未提取到可用下载链接">无下载链接</button>`;
              row.innerHTML = renderMoviepilotTag(
                type,
                `<button type="button" id="${failBtnId}" class="mp-btn mp-btn-danger">${mpIcon("alertTriangle", 13)}<span>识别失败，点此手动匹配</span></button>${forcePushHtml}<button type="button" id="${cfgFailBtnId}" class="mp-btn mp-btn-icon" title="MoviePilot 配置">${mpIcon("settings", 13)}</button>`,
                row,
              );
              document
                .getElementById(failBtnId)
                ?.addEventListener("click", () =>
                  openManualModal(row, type, t_name, cleanDesc, latestFailLink || d_link, t_size, lastMetaInfo),
                );
              if (canForcePush) {
                const forceBtn = document.getElementById(forceBtnId);
                const forceAdvBtn = document.getElementById(forceAdvId);
                forceBtn?.addEventListener("click", () => {
                  resolveLinkAndPush(
                    forceBtn,
                    type,
                    null,
                    t_name,
                    cleanDesc,
                    latestFailLink,
                    t_size,
                    { forceUnrecognized: true },
                    isContextAlive,
                  );
                });
                forceAdvBtn?.addEventListener("click", () => {
                  openAdvancedPushModal(forceBtn, null, t_name, cleanDesc, latestFailLink, t_size, type, {
                    forceUnrecognized: true,
                  });
                });
              }
              document.getElementById(cfgFailBtnId)?.addEventListener("click", showConfigModal);
            }
          });
          return;
        }

        row.innerHTML = renderMoviepilotTag(
          type,
          `<span class="mp-status-text"><span class="mp-spinner"></span> ${index === 0 ? "正在自动识别媒体信息..." : `自动识别重试中 (${index + 1}/${candidates.length})...`}</span>`,
          row,
        );

        const currentTitle = candidates[index];
        const currentSubtitle = index <= 1 ? cleanDesc : "";
        debugLog("recognize attempt", {
          attempt: `${index + 1}/${candidates.length}`,
          title: currentTitle,
          withSubtitle: index <= 1,
        });

        recognizeByTitle(currentTitle, currentSubtitle).then((data) => {
          if (!isContextAlive()) return;
          if (data && data.meta_info) {
            lastMetaInfo = data.meta_info;
          }
          if (data && data.media_info) {
            debugLog("recognize success", { title: currentTitle, media: toPreview(data.media_info) });
            const latestLink = getLatestDownloadLink(type, d_link, {
              allowPrefetch: type === "mteam",
              reason: "recognize-success",
            });
            const built = buildHtml(
              row,
              data.media_info,
              type,
              t_name,
              cleanDesc,
              latestLink,
              t_size,
              data.meta_info || lastMetaInfo,
            );
            mountBuiltHtml(row, type, built);
          } else {
            debugLog("recognize miss", { title: currentTitle });
            tryRecognize(index + 1);
          }
        });
      };

      tryRecognize(0);
    })
    .catch((err) => {
      if (!isContextAlive()) return;
      const cfgTriggerId = nextUid("cfgtrigger");
      row.innerHTML = renderMoviepilotTag(
        type,
        `<span class="mp-status-text mp-status-error">${escapeHtml(err)}</span> <button type="button" id="${cfgTriggerId}" class="mp-status-link">点此配置</button>`,
        row,
      );
      document.getElementById(cfgTriggerId)?.addEventListener("click", (e) => {
        e.preventDefault();
        showConfigModal();
      });
    });
}


// ---------- 运行守护（MutationObserver + 轻量路由检查） ----------
(function () {
  "use strict";

  let configChecked = false;
  let lastUrl = window.location.href;
  let checkTimer = null;
  let observerStarted = false;

  const ensureFloatingConfigButton = () => {
    if (mpUrl && mpApiKey) {
      document.getElementById("mp-floating-cfg-btn")?.remove();
      return;
    }
    if (document.getElementById("mp-floating-cfg-btn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "mp-floating-cfg-btn";
    btn.className = "mp-floating-cfg-btn";
    applyThemeClass(btn);
    btn.innerHTML = `${mpIcon("settings", 14)}<span>配置 MoviePilot</span>`;
    btn.addEventListener("click", showConfigModal);
    document.body?.appendChild(btn);
  };

  const runCheck = () => {
    if (window.location.href !== lastUrl) {
      debugLog("route changed", { from: lastUrl, to: window.location.href });
      lastUrl = window.location.href;
      cleanupMpUi();
      pruneMTeamCaches();
    }

    if (!shouldProcessCurrentPage()) {
      if (
        document.getElementById("mp-row-flag") ||
        document.querySelector(".mp-modal") ||
        document.getElementById("mp-toast-container") ||
        document.getElementById("mp-floating-cfg-btn")
      ) {
        debugLog("cleanup on unsupported page", window.location.href);
        cleanupMpUi();
      }
      pruneMTeamCaches();
      return;
    }

    if (!mpUrl || !mpApiKey) {
      ensureFloatingConfigButton();
      if (!configChecked && !document.getElementById("mp-config-modal")) {
        showConfigModal();
        configChecked = true;
      }
      return;
    }

    document.getElementById("mp-floating-cfg-btn")?.remove();
    if (!document.getElementById("mp-row-flag")) {
      insertMpRow();
    }
    pruneMTeamCaches();
  };

  const scheduleCheck = () => {
    if (checkTimer) return;
    checkTimer = setTimeout(() => {
      checkTimer = null;
      runCheck();
    }, 250);
  };

  const startRuntime = () => {
    if (!observerStarted) {
      observerStarted = true;
      const observer = new MutationObserver(() => {
        if (window.location.href !== lastUrl || !document.getElementById("mp-row-flag")) {
          scheduleCheck();
        }
      });
      const observeRoot = document.body || document.documentElement;
      if (observeRoot) {
        observer.observe(observeRoot, { childList: true, subtree: true });
      }
      window.addEventListener("popstate", scheduleCheck);
      window.addEventListener("hashchange", scheduleCheck);
      setInterval(runCheck, 3000);
    }
    runCheck();
  };

  initMpConfig().then(startRuntime);
})();
