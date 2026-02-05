/**
 * Gushwork Universal Lead Capture Engine v1.0
 * * DESIGN PRINCIPLES:
 * 1. NON-BLOCKING: Uses 'optimistic UI'—users always see the success screen even if n8n is down.
 * 2. FUZZY DETECTION: Scans DOM attributes (ID, Name, Placeholder) to categorize data.
 * 3. HIERARCHICAL MAPPING: Prioritizes primary contact info, preserves everything else as metadata.
 * 4. ENCAPSULATED: IIFE pattern prevents variable collisions with other scripts.
 */
(function() {
    // --- CONFIGURATION ---
    const WEBHOOK_URL = 'https://animeshjhawar.app.n8n.cloud/webhook/lead-capture';
    const CUSTOMER_ID = 'CLIENT-DE-01';

    /**
     * EXTRACTOR: Scans any DOM container for user input.
     * Unlike hardcoded scripts, this looks for "intent" in the HTML code.
     */
    function harvestLeadData(container) {
        const data = { name: [], email: [], phone: [], extras: [] };
        const fields = container.querySelectorAll('input, select, textarea');

        fields.forEach(field => {
            const val = field.value.trim();
            // Skip empty fields, buttons, or hidden security tokens
            if (!val || ['submit', 'button', 'hidden'].includes(field.type)) return;

            // Create a "Search Stack" of all attributes to guess the field's purpose
            const context = `${field.name} ${field.id} ${field.getAttribute('placeholder') || ''} ${field.type}`.toLowerCase();

            if (context.includes('email') || field.type === 'email') {
                data.email.push(val);
            } 
            else if (context.includes('phone') || context.includes('mobile') || context.includes('whatsapp') || context.includes('tel')) {
                data.phone.push(val);
            } 
            else if (context.includes('name') || context.includes('person') || context.includes('user')) {
                data.name.push(val);
            } 
            else {
                // If it doesn't match a primary category, keep the label and value
                const label = field.name || field.id || 'additional_info';
                data.extras.push(`${label}: ${val}`);
            }
        });
        return data;
    }

    /**
     * TRANSMITTER: Handles the network request to n8n.
     * Wrapped in a try-catch-finally to ensure the website NEVER freezes.
     */
    async function transmit(leadData, sourceUrl, type, btn) {
        // 1. Visual Feedback: Update button state
        if (btn) {
            btn.disabled = true;
            btn.dataset.original = btn.innerText;
            btn.innerText = "Processing...";
        }

        const payload = {
            customer_id: CUSTOMER_ID,
            timestamp: new Date().toISOString(),
            source_url: sourceUrl,
            lead_source: { referrer: document.referrer || "Direct", type: type },
            signals: {
                name: leadData.name,
                email: leadData.email,
                phone: leadData.phone,
                message: leadData.extras // Extra fields (Secondary phone, industry, etc) go here
            }
        };

        try {
            // 2. Fire-and-forget request
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            console.log(`%c[LeadCapture] n8n Response: ${response.status}`, "color: #4f46e5; font-weight: bold;");
        } catch (error) {
            // 3. Silent Failure: Only logs to developer console
            console.error('[LeadCapture] Network Error (n8n likely offline):', error);
        } finally {
            // 4. Critical: Always trigger the success UI so the user isn't stuck
            if (typeof window.handleSuccess === "function") {
                window.handleSuccess();
            }
        }
    }

    /**
     * EVENT LISTENERS
     */

    // Intercepts every standard <form> on the website
    document.addEventListener('submit', function(e) {
        e.preventDefault(); // Stop page refresh
        const data = harvestLeadData(e.target);
        transmit(data, window.location.href, 'form_submission', e.target.querySelector('button'));
    });

    // Intercepts manual "Funnel" buttons (elements with onclick="submitFunnel()")
    window.submitFunnel = function() {
        const btn = event.target;
        const container = btn.closest('div') || document.body;
        const data = harvestLeadData(container);
        transmit(data, window.location.href, 'click_event', btn);
    };

    console.log("[LeadCapture] Production Engine initialized successfully.");
})();
