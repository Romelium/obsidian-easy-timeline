import 'bootstrap/dist/css/bootstrap.min.css';
import { extractInlineMetadata, isMarkdownHeader, sanitizeInlineMetadata } from 'utils';
import { setIcon } from 'obsidian';

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

    const sortedGroupedData: GroupedTimelineData = {};
    const sortMonths = (a: string, b: string) =>
        sortOrder === 'asc'
            ? new Date(a).getTime() - new Date(b).getTime()
            : new Date(b).getTime() - new Date(a).getTime();

    Object.keys(groupedData)
        .sort(sortMonths)
        .forEach(month => {
            sortedGroupedData[month] = {};
            Object.keys(groupedData[month])
                .sort(sortMonths)
                .forEach(day => {
                    sortedGroupedData[month][day] = groupedData[month][day];
                });
        });

    return sortedGroupedData;
}

export function renderTimeline(timelineData: TimelineData, sortOrder: 'asc' | 'desc' = 'asc') {
    const container = createEl('div', { cls: 'container' });
    const timeline = createEl('div', { cls: 'timeline' });
    container.appendChild(timeline);

    // Process the timeline data
    const groupedData = groupTimelineData(timelineData, sortOrder);

    Object.entries(groupedData).forEach(([month, days]) => {
        // Create month header
        const monthHeader = createEl('div', { cls: 'timeline-month', text: month });
        const entryCount = createEl('span', { text: `${Object.keys(days).length} Entries` });
        monthHeader.appendChild(entryCount);
        timeline.appendChild(monthHeader);

        // Iterate through each day within the month
        Object.entries(days).forEach(([day, events]) => {
            // Create date section
            const section = createEl('div', { cls: 'timeline-section' });
            const dateHeader = createEl('div', { cls: 'timeline-date', text: day });
            section.appendChild(dateHeader);

            // Create a row for events
            const row = createEl('div', { cls: 'row' });

            events.forEach(event => {
                // Get all inline metadata from details
                const metadata = extractInlineMetadata(event.details)

                // Create timeline box for event
                const col = createEl('div', { cls: 'col-sm-4' });
                const box = createEl('div', { cls: 'timeline-box' });

                // Box title
                const title = createEl('div', { cls: 'box-title' });
                const titleLeft = createEl('div', { cls: 'box-title-left' });
                const icon = event.icon || metadata.icon ? createEl('i', { cls: `box-title-icon text-${event.status ?? (metadata.status ?? '')}`, text: '' }) : null;
                if (icon)
                    setIcon(icon, event.icon || metadata.icon);
                const time = createEl('div', { cls: 'box-title-right', text: event.date.toTimeString().split(' ')[0] });

                // Box content
                const content = createEl('div', { cls: 'box-content' });

                // Event details
                const sanifizedetails = sanitizeInlineMetadata(event.details);
                const details = sanifizedetails.split('\n').filter(Boolean);

                const header = isMarkdownHeader(details[0]);
                if (header) details.shift()

                details.forEach(text => { content.appendChild(createEl('p', { cls: 'box-item', text })); });

                // Box footer
                const footer = event.author || metadata.author ? createEl('div', { cls: 'box-footer', text: `- ${event.author ?? metadata.author}` }) : null;

                if (icon) titleLeft.appendChild(icon)
                titleLeft.appendChild(document.createTextNode(` ${event.title ?? (metadata.title ?? (header ?? ''))}`));
                title.appendChild(titleLeft);
                title.appendChild(time);
                box.appendChild(title);
                box.appendChild(content);
                if (footer) box.appendChild(footer);
                col.appendChild(box);
                row.appendChild(col);
            });

            section.appendChild(row);
            timeline.appendChild(section);
        });
    });

    return container;
}