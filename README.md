# 🚀 Universal AI Lead Engine

An end-to-end lead capture and notification ecosystem designed for fragmented CMS environments. This system utilizes a "Fuzzy" JS collector, n8n automation, and AI classification to ensure high-quality lead delivery.

---

### 🔗 Project Links
* **Live Demo (Netlify):** [https://universal-lead-capture.netlify.app/](https://universal-lead-capture.netlify.app/)
* **CRM (Google Sheets):** [CRM Link](https://docs.google.com/spreadsheets/d/1-4faIPJpvvAhq3rcBNUc1npDT7QyAeSej3US5VW6Zus/edit?gid=0#gid=0)

---

## 🛠 Features
* **CMS-Agnostic Script:** Captures leads from HTML, React, WordPress, and Shopify using attribute-based fuzzy logic.
* **AI Spam Filtration:** Integrates OpenAI via n8n to classify lead intent and filter bot submissions.
* **Lossless Data Capture:** Automatically buckets non-standard form fields into metadata to prevent data loss.
* **Human-in-the-loop Recovery:** Monitoring workflow triggers notifications if a "Spam" lead is manually marked as "New Lead" in the CRM.

---

## 📦 Project Structure
* `src/` — Production-ready `lead-capture.js` with inline documentation.
* `public/` — Industry-specific demo forms (Industrial, Real Estate, Funnels).
* `n8n/` — Workflow JSON exports and architecture diagrams.
* `docs/` — Deep-dive on spam logic, rollout strategy, and edge cases.

---

## 🧠 Part 1: Universal Lead Capture Script
The script uses **Semantic Inference**. Instead of looking for specific IDs, it scans `name`, `id`, and `placeholder` attributes for keywords like *email*, *tel*, or *user*.

**Quick Embed:**
```html
<script src="lead-capture.js"></script>
<script>
  // Handlers for UI success state
  window.handleSuccess = () => { console.log("Lead captured!"); };
</script>
