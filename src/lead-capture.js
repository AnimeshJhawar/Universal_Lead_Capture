/**
 * Gushwork Universal Lead Capture v1.2
 * Production-ready script to intercept form submissions and sync to n8n.
 */
(function() {
    // --- CONFIGURATION ---
    const CONFIG = {
        webhookUrl: 'https://animeshjhawar.app.n8n.cloud/webhook-test/lead-capture',
        customerId: 'CLIENT-DE-01',
        debug: true // Set to false in final production
    };

    /**
     * Helper to log messages only if debug is enabled
     */
    const logger = (msg, data) => {
        if (CONFIG.debug) console.log(`[LeadCapture] ${msg}`, data || '');
    };

    /**
     * Core function to ship data to the n8n Lead Engine
     */
    async function transmitLead(payload) {
        try {
            const response = await fetch(CONFIG.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            logger('Lead synced successfully');
            return true;
        } catch (err) {
            console.error('[LeadCapture] Transmission failed:', err);
            return false;
        }
    }

    /**
     * 1. UNIVERSAL FORM LISTENER
     * Listens for any <form> submission on the page.
     */
    document.addEventListener('submit', async function(event) {
        const form = event.target;
        
        // Stop standard browser redirect/refresh
        event.preventDefault();
        logger('Intercepted form submission', form.id);

        const formData = new FormData(form);
        const signals = { name: [], email: [], phone: [], message: [] };

        // Normalize fields into B2B categories
        for (let [name, value] of formData.entries()) {
            const field = name.toLowerCase();
            if (field.includes('name') || field.includes('person')) signals.name.push(value);
            else if (field.includes('email')) signals.email.push(value);
            else if (field.includes('phone') || field.includes('mobile') || field.includes('whatsapp')) signals.phone.push(value);
            else if (value) signals.message.push(`${name}: ${value}`);
        }

        const payload = {
            customer_id: CONFIG.customerId,
            timestamp: new Date().toISOString(),
            source_url: window.location.href,
            lead_source: {
                referrer: document.referrer || "Direct",
                utm_params: window.location.search || "None"
            },
            signals: signals
        };

        const success = await transmitLead(payload);
        if (success) {
            alert("Success! Your inquiry has been sent.");
            form.reset();
        }
    });

    /**
     * 2. CUSTOM FUNNEL OVERRIDE
     * Hooks into the specific 'submitFunnel' function used in your demo.
     */
    window.submitFunnel = async function() {
        logger('Intercepted Funnel button click');

        const signals = {
            name: [
                document.getElementById('firstName').value, 
                document.getElementById('lastName').value
            ],
            phone: [document.getElementById('whatsapp').value],
            message: [`Intent: ${document.getElementById('intent').value}`]
        };

        const payload = {
            customer_id: CONFIG.customerId,
            timestamp: new Date().toISOString(),
            source_url: window.location.href + "#react-funnel",
            lead_source: {
                referrer: document.referrer || "Internal Funnel",
                utm_params: window.location.search || "None"
            },
            signals: signals
        };

        const success = await transmitLead(payload);
        if (success) {
            alert("Funnel Lead captured!");
            // Clear fields manually
            ['firstName', 'lastName', 'whatsapp', 'intent'].forEach(id => {
                document.getElementById(id).value = '';
            });
        }
    };

    logger('Initialized and watching for leads...');
})();
