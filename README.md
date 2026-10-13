# Student Management System

A responsive student-record management web app built with HTML, CSS, and vanilla JavaScript. This is a learning project demonstrating CRUD operations.

## Features
- Add, view, edit, and delete student records
- Search by name, roll number, course, email, or phone
- Dashboard cards for total students, unique courses, and records added in the current session
- Duplicate roll-number validation
- Browser `localStorage` persistence
- Responsive layout for desktop and mobile

## Project structure
```text
student-management-system/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── README.md
└── .gitignore
```

## Run locally
1. Download or clone this repository.
2. Open the folder in VS Code.
3. Open `index.html` with the Live Server extension, or open it directly in a browser.

## Storage note
Records are stored in the current browser using `localStorage`. They are not uploaded to a server and will not automatically sync across devices.

## Technology
- HTML5
- CSS3
- JavaScript (no framework)

## Learning outcomes
This project demonstrates form handling, rendering a data table, search/filter logic, validation, CRUD operations, and browser storage.
