let alreadyAlerted = new Set();

async function loadReminders() {
    const res = await fetch("/api/reminders");
    const list = await res.json();
    const container = document.getElementById("med-list");

    if (list.length === 0) {
        container.innerHTML = '<p class="empty">No medications added yet.</p>';
        return;
    }

    container.innerHTML = list.map(med => `
        <div class="med-item">
            <div class="med-info">
                <span class="med-name">${med.name}</span>
                <span class="med-time">Daily at ${formatTime(med.reminder_time)}</span>
            </div>
            <button class="delete-btn" onclick="deleteReminder(${med.id})">Remove</button>
        </div>
    `).join("");
}

async function addReminder() {
    const name = document.getElementById("med-name").value.trim();
    const time = document.getElementById("med-time").value;
    const status = document.getElementById("status");

    if (!name || !time) {
        status.textContent = "Please fill in both fields.";
        status.style.color = "#f87171";
        return;
    }

    await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, reminder_time: time })
    });

    document.getElementById("med-name").value = "";
    document.getElementById("med-time").value = "";
    status.textContent = `Reminder set for ${name} at ${formatTime(time)}.`;
    status.style.color = "#34d399";
    loadReminders();
}

async function deleteReminder(id) {
    await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    loadReminders();
}

async function checkDue() {
    const res = await fetch("/api/due");
    const due = await res.json();
    due.forEach(med => {
        const key = `${med.id}-${new Date().getHours()}:${new Date().getMinutes()}`;
        if (!alreadyAlerted.has(key)) {
            alreadyAlerted.add(key);
            playAlarm();
            alert(`TIME TO TAKE YOUR MEDICATION!\n\n${med.name}`);
        }
    });
}

function playAlarm() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = 880;
        const start = ctx.currentTime + i * 0.5;
        osc.start(start);
        osc.stop(start + 0.3);
    }
}

function formatTime(t) {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${ampm}`;
}

loadReminders();
setInterval(checkDue, 30000);
