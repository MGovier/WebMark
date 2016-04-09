/**
 * Content Security Policy configuration.
 * Allows Google fonts used in styles and Font Data URLs.
 * Scripts should be blocked from inline and external sources to prevent XSS.
 */
// @todo: raise issue with non-inlined cache runtime config not added to addcache manifest:
// BrowserPolicy.content.disallowInlineScripts();
BrowserPolicy.content.disallowEval();
BrowserPolicy.content.allowInlineStyles();
BrowserPolicy.content.allowFontDataUrl();
BrowserPolicy.content.allowOriginForAll('https://fonts.googleapis.com/');
BrowserPolicy.content.allowFontOrigin('https://fonts.gstatic.com/');
