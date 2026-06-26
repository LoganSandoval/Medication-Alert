import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)
DB = "reminders.db"


def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS medications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                reminder_time TEXT NOT NULL,
                enabled INTEGER DEFAULT 1
            )
        """)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/reminders", methods=["GET"])
def get_reminders():
    with get_db() as db:
        rows = db.execute("SELECT * FROM medications ORDER BY reminder_time").fetchall()
    return jsonify([dict(r) for r in rows])


@app.route("/api/reminders", methods=["POST"])
def add_reminder():
    data = request.get_json()
    name = data.get("name", "").strip()
    time = data.get("reminder_time", "").strip()
    if not name or not time:
        return jsonify({"error": "Name and time are required"}), 400
    with get_db() as db:
        db.execute("INSERT INTO medications (name, reminder_time) VALUES (?, ?)", (name, time))
    return jsonify({"success": True}), 201


@app.route("/api/reminders/<int:rid>", methods=["DELETE"])
def delete_reminder(rid):
    with get_db() as db:
        db.execute("DELETE FROM medications WHERE id = ?", (rid,))
    return jsonify({"success": True})


@app.route("/api/due")
def due_reminders():
    now = datetime.now().strftime("%H:%M")
    with get_db() as db:
        rows = db.execute(
            "SELECT * FROM medications WHERE reminder_time = ? AND enabled = 1", (now,)
        ).fetchall()
    return jsonify([dict(r) for r in rows])


if __name__ == "__main__":
    init_db()
    print("App running at http://localhost:5000")
    app.run(debug=True)
