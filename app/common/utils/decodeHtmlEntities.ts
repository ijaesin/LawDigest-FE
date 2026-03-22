export default function decodeHtmlEntities(html: string): string {
  // &amp; must be last to prevent double-decoding (e.g., &amp;lt; -> &lt; -> <)
  return html
    .replaceAll('&middot;', '\u00B7')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&');
}
