import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/js/all.min.js';
import { isMarkdownHeader } from 'utils';

export enum TimelineEventStatus {
    success = 'text-success',
    failure = 'text-danger',
    info = 'text-info',
    warning = 'text-warning',
}

export interface TimelineEvent {
    date: Date;
    title?: string; // Type of the event (e.g., "Job Created", "Job Edited")
    icon?: string; // Icon class names (e.g., "asterisk")
    status?: TimelineEventStatus;
    details: string | Record<string, string>; // Key-value pairs for event details
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
function groupTimelineData(events: TimelineData) {
    const groupedData: GroupedTimelineData = {};

    events.forEach(event => {
        const eventDate = event.date;
        const month = formatMonth(eventDate); // Group by "Month, Year"
        const day = formatDate(eventDate);   // Group by "Day, Date"

        // Ensure the month exists
        if (!groupedData[month]) {
            groupedData[month] = {};
        }

        // Ensure the day exists within the month
        if (!groupedData[month][day]) {
            groupedData[month][day] = [];
        }

        // Add event to the corresponding group
        groupedData[month][day].push(event);
    });

    return groupedData;
}

export function renderTimeline(timelineData: TimelineData) {
    const container = createEl('div', { cls: 'container' });
    const timeline = createEl('div', { cls: 'timeline' });
    container.appendChild(timeline);

    // Process the timeline data
    const groupedData = groupTimelineData(timelineData);

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
                // Create timeline box for event
                const col = createEl('div', { cls: 'col-sm-4' });
                const box = createEl('div', { cls: 'timeline-box' });

                // Box title
                const title = createEl('div', { cls: 'box-title' });
                const titleLeft = createEl('div', { cls: 'box-title-left' });
                if (event.icon) {
                    const icon = createEl('i', { cls: `box-title-icon fa fa-${event.icon} ${event.status ?? ''}`, text: '' });
                    titleLeft.appendChild(icon);
                }
                titleLeft.appendChild(document.createTextNode(event.title ? ` ${event.title}` : ''));
                title.appendChild(titleLeft);

                const time = createEl('div', { cls: 'box-title-right', text: event.date.toTimeString().split(' ')[0] });
                title.appendChild(time);

                box.appendChild(title);

                // Box content
                const content = createEl('div', { cls: 'box-content' });

                // Event details
                if (typeof event.details == 'string') {
                    event.details.split('\n').forEach((value, i, array) => {
                        if (i == 0) {
                            const header = isMarkdownHeader(value)
                            const title = box.find(".box-title-left");
                            if (header != null && title.textContent == '') {
                                title.textContent = header;
                                return;
                            }
                        } else if(i == array.length - 1){
                            if(!event.author){
                                const regex =  /^\[?author::? (.+?)\]?$/;
                                const match = value.match(regex);

                                if (match) {
                                    event.author = match[1];
                                    return;
                                }
                            }
                        }
                        const detail = createEl('p', { cls: 'box-item', text: value });
                        content.appendChild(detail);
                    });
                } else {
                    Object.entries(event.details).forEach(([key, value]) => {
                        const detail = createEl('div', { cls: 'box-item', text: `${key}: ${value}` });
                        content.appendChild(detail);
                    });
                }

                box.appendChild(content);

                // Box footer
                if (event.author) {
                    const footer = createEl('div', { cls: 'box-footer', text: event.author ? `- ${event.author}` : '' });
                    box.appendChild(footer);
                }

                col.appendChild(box);
                row.appendChild(col);
            });

            section.appendChild(row);
            timeline.appendChild(section);
        });
    });

    return container;
}