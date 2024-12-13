export function isMarkdownHeader(str: string) {
    // Regex to match Markdown header (one or more # followed by a space and text)
    const regex = /^(#+)\s+(.*)$/;

    // Test if the string matches the Markdown header format
    const match = str.match(regex);

    if (match) {
        // If it's a header, match[2] contains the header text
        return match[2]; // Return the header text
    } else {
        // If it's not a header, return null
        return null;
    }
}