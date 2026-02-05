/**
 * LeadCapture.js - Universal Form Interceptor for n8n
 * VERSION: 1.1
 */
(function() {
    // --- CONFIGURATION ---
    const WEBHOOK_URL = 'https://animeshjhawar.app.n8n.cloud/webhook/lead-capture';
    const CUSTOMER_ID = 'CLIENT-DE-01'; 

    document.addEventListener('submit', async function(e) {
        const form = e.target;
        
        // Stop the form from refreshing the page immediately
        e.preventDefault();

        // 1. Gather form data
        const formData = new FormData(form);
        const signals = { name: [], email: [], phone: [], message: [] };
        
        for (let [name, value] of formData.entries()) {
            const lower = name.toLowerCase();
            if (lower.includes('name')) signals.name.push(value);
            else if (lower.includes('email')) signals.email.push(value);
            else if (lower.includes('phone') || lower.includes('tel')) signals.phone.push(value);
            else signals.message.push(`${name}: ${value}`);
        }

        // 2. Build the B2B Payload
        const payload = {
            correlation_id: 'id_' + Date.now(),
            customer_id: CUSTOMER_ID,
            timestamp: new Date().toISOString(),
            source_url: window.location.href,
            lead_source: {
                referrer: document.referrer || "Direct",
                utm_params: window.location.search || "None"
            },
            signals: signals
        };

        // 3. Send to n8n
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('n8n: Lead Captured');
                // Standard behavior: Proceed with form's actual purpose (e.g. redirect)
                // If the site uses AJAX for the form, you can trigger a success message here
                alert("Thank you! Your inquiry has been received.");
                form.reset();
            }
        } catch (error) {
            console.error('n8n: Capture Failed, falling back to default', error);
            form.submit(); // If n8n is down, let the form work normally
        }
    });
})();
