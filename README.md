# Universal Lead Capture
This repository contains an end-to-end lead capture and notification system built as part of the Gushwork assessment.  The solution demonstrates client-side scripting, data normalization, webhook-based automation, and conditional notifications using n8n.
## 🚀 Features

•⁠  ⁠Universal JavaScript lead capture script (CMS-agnostic)
•⁠  ⁠Lossless form data collection with semantic inference
•⁠  ⁠Works with HTML, React, WordPress, and AJAX forms
•⁠  ⁠Spam detection & lead status classification
•⁠  ⁠Google Sheets / Airtable storage
•⁠  ⁠Conditional email notifications
•⁠  ⁠Manual review workflow for spam leads

---

## 📦 Project Structure



src/ → Universal lead capture script
public/ → Demo UI with realistic industry forms
n8n/ → Workflow export & diagram
docs/ → Implementation notes & edge cases


---

## 🧠 Part 1: Universal Lead Capture Script

File: ⁠ src/lead-capture.js ⁠

### How it works
•⁠  ⁠Listens to all ⁠ <form> ⁠ submissions
•⁠  ⁠Normalizes field names using semantic inference
•⁠  ⁠Preserves all raw fields for audit/debugging
•⁠  ⁠Sends data to n8n webhook using ⁠ fetch ⁠ with ⁠ keepalive ⁠

### Embed Example

⁠ html
<script
  src="lead-capture.js"
  data-customer-id="GW-DEMO-001"
  data-endpoint="https://<your-n8n-domain>/webhook/lead-capture"
  data-debug="true">
</script>

🔁 Part 2: n8n Automation Workflow

Webhook receives normalized lead payload

Spam detection logic applied

Lead stored with status:

New Lead

Possible Spam

Email notifications sent conditionally

Status change watcher triggers delayed notifications

Workflow export: n8n/workflow.json

🧪 Local Development
npm install
npm run dev


Mock webhook runs on:

http://localhost:3001/webhook/lead-capture

📄 Documentation

docs/implementation.md

docs/spam-logic.md

docs/edge-cases.md

🔮 Future Improvements

CAPTCHA / honeypot integration

Lead scoring with ML

CRM integrations (HubSpot, Salesforce)

Rate limiting & abuse protection


This README alone can **carry your evaluation**.

---

## 4️⃣ Git commands (exactly what to run)

From the project root:

 ⁠bash
git init
git add .
git commit -m "Initial commit: Universal lead capture & n8n automation"


Create a repo on GitHub (name it something like):

gushwork-lead-capture


Then:

git branch -M main
git remote add origin https://github.com/<your-username>/gushwork-lead-capture.git
git push -u origin main
