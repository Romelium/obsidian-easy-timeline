export function isMarkdownHeader(str: string | undefined) {
    if (!str) return null;
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

// Sanitize all inline metadata to just be the value
export function sanitizeInlineMetadata(input: string) {
    const regex = /\[[^\[\]]+::?\s*([^\[\]]+)\]/g;
    return input.replace(regex, '$1');
}

// Get all inline metadata same as https://blacksmithgu.github.io/obsidian-dataview/annotation/add-metadata/
export function extractInlineMetadata(input: string) {
    // Define regex to match the pattern [ID:: Value]
    const regex = /\[([^\[\]]+)::?\s*([^\[\]]+)\]/g;
    const matches: Record<string, string> = {};
    let match;

    // Loop through the input and find all matches
    while ((match = regex.exec(input)) !== null) {
        const originalId = match[1].trim();
        const value = match[2].trim();
        
        // Sanitize the ID to lower kebab case
        const sanitizedId = originalId
            .toLowerCase()        // Convert to lower case
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/[^a-z0-9-]/g, ''); // Remove any non-alphanumeric characters except hyphens
        
        matches[sanitizedId] = value;
    }
    
    return matches;
}
// Does what extractInlineMetadata does but allows without brackets and only one colon. Of course you wouldn't want to use this to extract inline metadata in a normal paragraph
export function extractVariedMetadata(input: string) {
    const regex = /^(?:\[([a-zA-Z0-9_-]+)\s*::?\s*([^\[\]]+)\]|([a-zA-Z0-9_-]+)\s*:\s*(.+))$/;
    const matches: Record<string, string> = {};
    
    // Split input into lines
    const lines = input.split('\n');

    // Process each line separately
    lines.forEach(line => {
        const match = regex.exec(line.trim());
        if (match) {
            const originalId = match[1] || match[3];
            const value = match[2] || match[4];

            // Sanitize the ID to lower kebab case
            const sanitizedId = originalId
                .toLowerCase()        // Convert to lower case
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/[^a-z0-9-]/g, ''); // Remove any non-alphanumeric characters except hyphens
            
            matches[sanitizedId] = value.trim();
        }
    });

    return matches;
}