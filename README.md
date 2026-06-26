# Medication Reminder App

A simple web app for managing daily medication reminders.

## Features

- Add and delete medication reminders with a name and time
- View all reminders sorted by time
- API endpoint to check which reminders are due at the current minute

## Requirements

- Python 3.x
- Flask 3.0.3

## Setup

```bash
pip install -r requirements.txt
python app.py
```

Then open `http://localhost:5000` in your browser.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reminders` | List all reminders |
| POST | `/api/reminders` | Add a reminder (`{"name": "...", "reminder_time": "..."}`) |
| DELETE | `/api/reminders/<id>` | Delete a reminder |
| GET | `/api/due` | List reminders due at the current time (HH:MM) |

## Data

Reminders are stored in a local SQLite database (`reminders.db`).
