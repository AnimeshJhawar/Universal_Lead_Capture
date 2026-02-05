/**
 * LeadCapture.js - Production Grade (External)
 * Purpose: Intercepts form submissions and syncs with n8n Lead Engine.
 */
(function() {
    const WEBHOOK_URL = 'https://animeshjhawar.app.n8n.cloud/webhook-test/lead-capture';
    const CUSTOMER_ID = 'CLIENT-DE-01';

    // Core transmission logic
    async function processSubmission(payload, buttonId) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.disabled = true;
            btn.innerText = "Processing...";
        }

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.status === 200) {
                console.log(`%c[n8n Status: 200] Flow Initiated.`, "color: green; font-weight: bold;");
                // Trigger the UI change in the HTML
                if (typeof window.handleSuccess === "function") window.handleSuccess();
            } else {
                alert("n8n Error: Status " + response.status);
                if (btn) { btn.disabled = false; btn.innerText = "Try Again"; }
            }
        } catch (error) {
            console.error('[Network Error]', error);
            alert("Connection to n8n failed. Ensure the test webhook is active.");
            if (btn) { btn.disabled = false; btn.innerText = "Submit"; }
        }
    }

    // Standard Form Interceptor
    document.addEventListener('submit', async function(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const signals = { name: [], email: [], phone: [], message: [] };

        for (let [name, value] of formData.entries()) {
            const lower = name.toLowerCase();
            if (lower.includes('name') || lower.includes('person')) signals.name.push(value);
            else if (lower.includes('email')) signals.email.push(value);
            else if (lower.includes('phone') || lower.includes('mobile')) signals.phone.push(value);
            else signals.message.push(`${name}: ${value}`);
        }

        await processSubmission({
            customer_id: CUSTOMER_ID,
            timestamp: new Date().toISOString(),
            source_url: window.location.href,
            lead_source: { referrer: document.referrer || "Direct", utm_params: window.location.search || "None" },
            signals: signals
        }, `btn-${form.id}`);
    });

    // Funnel Logic (Exposed to Window)
    window.submitFunnel = async function() {
        const payload = {
            customer_id: CUSTOMER_ID,
            timestamp: new Date().toISOString(),
            source_url: window.location.href + "#funnel",
            lead_source: { referrer: "Internal Funnel", utm_params: window.location.search || "None" },
            signals: {
                name: [document.getElementById('funnelName').value],
                email: [document.getElementById('funnelEmail').value],
                phone: [document.getElementById('funnelWhatsapp').value],
                message: ["Funnel Style Lead"]
            }
        };
        await processSubmission(payload, 'btn-funnel');
    };

    console.log("[LeadCapture] Script loaded and listening.");
})();
