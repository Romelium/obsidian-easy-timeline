import { TimelineData, TimelineEventStatus } from 'renderTimeline';

const { success, failure, info, warning } = TimelineEventStatus;

export const sampleTimelineData: TimelineData = [
    // Flattened events from August 2018
    {
        "date": new Date('2018-08-21T23:12'),
        "icon": "asterisk",
        "status": success,
        "details": {
            "Loss Type": "A/C Leak",
            "Loss Territory": "Texas",
            "Start Date": "08/22/2018"
        },
        "author": "Tyler"
    },
    {
        "date": new Date('2018-08-21'),
        "title": "Job Edited",
        "icon": "pencil",
        "details": "Project Manager Marlyn Supervisor Carol",
        "author": "Tyler"
    },
    {
        "date": new Date('2018-08-21'),
        "title": "Job Edited",
        "icon": "pencil",
        "details": "Project Manager Marlyn Supervisor Carol\nauthor: Tyler",
    },
    {
        "date": new Date('2018-08-21'),
        "title": "Job Edited",
        "icon": "pencil",
        "details": "Project Manager Marlyn Supervisor Carol\nauthor:: Tyler",
    },
    {
        "date": new Date('2018-08-22'),
        "details": {
            "Extraction Type": "Carpet Heavy",
            "Water Category": "4",
            "No. Of Tech": "6",
            "Est. Completion": "09/01/2018"
        }
    },
    {
        "date": new Date('2018-08-22'),
        "title": "New Job To Do",
        "details": "1Tomorrow will bring its own set of tasks, and two weeks from now, we'll be looking back on this moment with pride.\n Yesterday, we reviewed the details one last time to ensure everything was in order, and now, here we are.\n This Friday, during the same 13:00 to 16:00 window, we'll evaluate the results and set new goals.",
        "author": "Marlyn"
    },
    {
        "date": new Date('2018-08-22'),
        "icon": "tasks",
        "title": "New Job To Not Do",
        "details": "# New Job To Do\n2Tomorrow will bring its own set of tasks, and two weeks from now, we'll be looking back on this moment with pride.\n Yesterday, we reviewed the details one last time to ensure everything was in order, and now, here we are.\n This Friday, during the same 13:00 to 16:00 window, we'll evaluate the results and set new goals.",
        "author": "Marlyn"
    },
    {
        "date": new Date('2018-08-22'),
        "icon": "tasks",
        "details": "# New Job To Do\n3Tomorrow will bring its own set of tasks, and two weeks from now, we'll be looking back on this moment with pride.\n Yesterday, we reviewed the details one last time to ensure everything was in order, and now, here we are.\n This Friday, during the same 13:00 to 16:00 window, we'll evaluate the results and set new goals.",
        "author": "Marlyn"
    },
    {
        "date": new Date('2018-08-23'),
        "title": "Equipment Entry",
        "icon": "cogs",
        "status": info,
        "details": {
            "ID": "TW-3232",
            "Name": "HEPA 600",
            "Date In": "08/22/2018"
        },
        "author": "Jones"
    },
    // Flattened events from September 2018
    {
        "date": new Date('2018-09-05'),
        "title": "Job Created",
        "icon": "asterisk",
        "status": success,
        "details": {
            "Loss Type": "Flood",
            "Loss Territory": "California",
            "Start Date": "09/06/2018"
        },
        "author": "Emily"
    },
    {
        "date": new Date('2018-09-05'),
        "title": "Job Edited",
        "icon": "pencil",
        "status": info,
        "details": {
            "Project Manager": "John",
            "Supervisor": "Rebecca"
        },
        "author": "Emily"
    },
    {
        "date": new Date('2018-09-08'),
        "title": "Job Edited",
        "icon": "pencil",
        "status": info,
        "details": {
            "Extraction Type": "Carpet Light",
            "Water Category": "3",
            "No. Of Tech": "4",
            "Est. Completion": "09/10/2018"
        },
        "author": "Rebecca"
    },
    {
        "date": new Date('2018-09-08'),
        "title": "New Job To Do",
        "icon": "tasks",
        "details": {
            "Employee": "Jordan",
            "To Do": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        },
        "author": "John"
    },
    // Flattened events from October 2018
    {
        "date": new Date('2018-10-12'),
        "title": "Job Created",
        "icon": "asterisk",
        "status": success,
        "details": {
            "Loss Type": "Water Damage",
            "Loss Territory": "Nevada",
            "Start Date": "10/13/2018"
        },
        "author": "Alex"
    },
    {
        "date": new Date('2018-10-12'),
        "title": "Job Edited",
        "icon": "pencil",
        "status": info,
        "details": {
            "Project Manager": "Samantha",
            "Supervisor": "Emily"
        },
        "author": "Alex"
    },
    {
        "date": new Date('2018-10-15'),
        "title": "Job Edited",
        "icon": "pencil",
        "status": info,
        "details": {
            "Extraction Type": "Tile Cleaning",
            "Water Category": "2",
            "No. Of Tech": "3",
            "Est. Completion": "10/17/2018"
        },
        "author": "Emily"
    },
    {
        "date": new Date('2018-10-15'),
        "title": "New Job To Do",
        "icon": "tasks",
        "details": {
            "Employee": "Jake",
            "To Do": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium."
        },
        "author": "Samantha"
    }
];
