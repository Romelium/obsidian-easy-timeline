import { extractInlineMetadata, isMarkdownHeader, sanitizeInlineMetadata } from 'utils';
import { Component, MarkdownRenderer, setIcon } from 'obsidian';

export interface TimelineEvent {
    date: Date;
    title?: string; // Type of the event (e.g., "Job Created", "Job Edited")
    icon?: string; // Icon class names (e.g., "asterisk")
    status?: "success" | "failure" | "info" | "warning";
    details: string;
    author?: string; // Footer text (e.g., name of the person responsible)
}

export type TimelineData = TimelineEvent[];

// Utility to format the date into a readable month and year
function formatMonth(date: Date) {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: 'long' };
    return date.toLocaleDateString(undefined, options); // "August, 2018"
}

// Utility to format the date into a readable day and date
function formatDate(date: Date) {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', weekday: 'long' };
    return date.toLocaleDateString(undefined, options); // "21, Tuesday"
}
// Group events by month and day
type GroupedTimelineData = {
    [month: string]: {
        [day: string]: TimelineEvent[];
    };
};

function groupTimelineData(events: TimelineData, sortOrder: 'asc' | 'desc' = 'asc') {
    // Sort events by date
    events.sort((a, b) => sortOrder === 'asc'
        ? a.date.getTime() - b.date.getTime()
        : b.date.getTime() - a.date.getTime()
    );

    const groupedData: GroupedTimelineData = {};

    events.forEach(event => {
        const eventDate = event.date;
        const month = formatMonth(eventDate); // Group by "Month, Year"
        const day = formatDate(eventDate);   // Group by "Day, Date"

        if (!groupedData[month]) {
            groupedData[month] = {};
        }
        if (!groupedData[month][day]) {
            groupedData[month][day] = [];
        }
        groupedData[month][day].push(event);
    });

    return groupedData;
}

export async function renderTimeline(timelineData: TimelineData, sortOrder: 'asc' | 'desc' = 'asc', sourcePath: string, component: Component) {
    const container = createEl('div', { cls: 'easy-timeline-container' });
    const timeline = createEl('div', { cls: 'timeline' });
    container.appendChild(timeline);

    // Process the timeline data
    const groupedData = groupTimelineData(timelineData, sortOrder);

    for (const [month, days] of Object.entries(groupedData)) {
        // Create month header
        const monthHeader = createEl('div', { cls: 'timeline-month', text: month });
        const totalEvents = Object.values(days).reduce((acc, curr) => acc + curr.length, 0);
        const entryCount = createEl('span', { text: `${totalEvents} Entries` });
        monthHeader.appendChild(entryCount);
        timeline.appendChild(monthHeader);

        // Iterate through each day within the month
        for (const [day, events] of Object.entries(days)) {
            // Create date section
            const section = createEl('div', { cls: 'timeline-section' });
            const dateHeader = createEl('div', { cls: 'timeline-date', text: day });
            section.appendChild(dateHeader);

            // Create a row for events
            const row = createEl('div', { cls: 'timeline-row' });

            for (const event of events) {
                // Get all inline metadata from details
                const metadata = extractInlineMetadata(event.details)

                // Create timeline box for event
                const col = createEl('div', { cls: 'timeline-col' });
                const box = createEl('div', { cls: 'timeline-box' });

                // Box title
                const title = createEl('div', { cls: 'box-title' });
                const titleLeft = createEl('div', { cls: 'box-title-left' });
                const status = event.status ?? metadata.status;
                const iconCls = status ? `box-title-icon text-${status}` : 'box-title-icon';
                const icon = event.icon || metadata.icon ? createEl('i', { cls: iconCls, text: '' }) : null;
                if (icon)
                    setIcon(icon, event.icon || metadata.icon);
                const time = createEl('div', { cls: 'box-title-right', text: event.date.toTimeString().split(' ')[0] });

                // Box content
                const content = createEl('div', { cls: 'box-content' });

                // Event details
                const sanifizedetails = sanitizeInlineMetadata(event.details);
                const details = sanifizedetails.split(/\r?\n/).filter(Boolean);

                const header = isMarkdownHeader(details[0]);
                if (header) details.shift()

                const markdownText = details.join('\n');
                const markdownContainer = createEl('div', { cls: 'box-item markdown-rendered' });
                await MarkdownRenderer.renderMarkdown(markdownText, markdownContainer, sourcePath, component);
                content.appendChild(markdownContainer);

                // Box footer
                const footer = event.author || metadata.author ? createEl('div', { cls: 'box-footer', text: `- ${event.author ?? metadata.author}` }) : null;

                if (icon) titleLeft.appendChild(icon);
                titleLeft.createSpan({ text: event.title ?? (metadata.title ?? (header ?? '')) });
                title.appendChild(titleLeft);
                title.appendChild(time);
                box.appendChild(title);
                box.appendChild(content);
                if (footer) box.appendChild(footer);
                col.appendChild(box);
                row.appendChild(col);
            }

            section.appendChild(row);
            timeline.appendChild(section);
        }
    }

    return container;
}
