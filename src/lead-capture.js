/**
 * LeadCapture.js - Production Grade (External)
 * Purpose: Intercepts form submissions and syncs with n8n Lead Engine.
 * Behavior: Fails silently for users (always shows success) but logs errors in console.
 */
(function() {
    const WEBHOOK_URL = 'https://animeshjhawar.app.n8n.cloud/webhook-test/lead-capture';
    const CUSTOMER_ID = 'CLIENT-DE-01';

    /**
     * Internal function to send payload and check status
     */
    async function processSubmission(payload, buttonId) {
        const btn = document.getElementById(buttonId);
        
        // 1. Visual Feedback: Disable button immediately
        if (btn) {
            btn.disabled = true;
            btn.innerText = "Processing...";
        }

        try {
            // 2. Attempt Transmission
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // 3. Log Status to Console (Loud for Developers)
            if (response.status === 200) {
                console.log(`%c[n8n Success: ${response.status}] Flow Initiated. Data synchronized.`, "color: green; font-weight: bold;");
            } else {
                console.warn(`%c[n8n Server Warning: ${response.status}] Webhook hit, but workflow may not have started.`, "color: orange; font-weight: bold;");
            }

        } catch (error) {
            // 4. Silent Network Failure: Log to console only, NO ALERTS
            console.error('%c[Network Error] Connection to n8n failed. Ensure the Test Webhook is active in the n8n editor.', "color: red; font-weight: bold;", error);
        } finally {
            // 5. Optimistic UI: Always show Success screen to the user regardless of server status
            if (typeof window.handleSuccess === "function") {
                window.handleSuccess();
            }
        }
    }

    /**
     * Standard Form Interceptor (Auto-detects name, email, phone)
     */
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
            lead_source: { 
                referrer: document.referrer || "Direct", 
                utm_params: window.location.search || "None" 
            },
            signals: signals
        }, `btn-${form.id}`);
    });

    /**
     * Funnel Logic for non-form elements (div-based buttons)
     */
    window.submitFunnel = async function() {
        const payload = {
            customer_id: CUSTOMER_ID,
            timestamp: new Date().toISOString(),
            source_url: window.location.href + "#funnel",
            lead_source: { 
                referrer: "Internal Funnel", 
                utm_params: window.location.search || "None" 
            },
            signals: {
                name: [document.getElementById('funnelName').value],
                email: [document.getElementById('funnelEmail').value],
                phone: [document.getElementById('funnelWhatsapp').value],
                message: ["Funnel Style Lead Submission"]
            }
        };
        await processSubmission(payload, 'btn-funnel');
    };

    console.log("Lead Captured and sent to CRM.");
})();
