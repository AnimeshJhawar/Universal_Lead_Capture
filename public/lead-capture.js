/**
 * GUSHWORK UNIVERSAL LEAD CAPTURE (v1.1)
 * ---------------------------------------------------------
 * Features: Lossless capture, Semantic inference, Manual triggers,
 * and Redirect-safe transport (keepalive).
 */
(function () {
  // Prevent double-loading of the script
  if (window.__gushworkLeadCaptureLoaded) return;
  window.__gushworkLeadCaptureLoaded = true;

  const scriptTag = document.currentScript;

  // 1. CONFIGURATION
  // Values are pulled from the <script> tag attributes
  const CONFIG = {
    customerId: scriptTag?.getAttribute("data-customer-id"),
    endpoint: scriptTag?.getAttribute("data-endpoint"),
    debug: scriptTag?.getAttribute("data-debug") === "true"
  };

  /**
   * Diagnostic Logger
   * Visible in the browser console when data-debug="true" is set.
   */
  function debugLog(msg, data) {
    if (CONFIG.debug) console.info("[Gushwork Trace]", msg, data || "");
  }

  // Validate initialization
  if (!CONFIG.customerId || !CONFIG.endpoint) {
    debugLog("Aborted: Missing data-customer-id or data-endpoint.");
    return;
  }

  /**
   * Traceability Utility
   * Generates a unique ID for every submission to track it through the pipeline.
   */
  function getCorrelationId() {
    try {
      if (window.crypto?.randomUUID) return "gw_" + crypto.randomUUID();
    } catch (e) {}
    return "gw_" + Date.now() + "_" + Math.random().toString(36).slice(2, 11);
  }

  /**
   * Semantic Inference Engine
   * Categorizes fields into 'signals' without discarding the original data.
   */
  function inferSemanticType(input) {
    if (input.type === "email") return "email";
    if (input.type === "tel") return "phone";
    
    const context = (
      input.name + " " + input.id + " " + 
      input.placeholder + " " + (input.labels?.[0]?.innerText || "")
    ).toLowerCase();

    if (context.includes("email") || context.includes("mail")) return "email";
    if (context.includes("phone") || context.includes("mobile") || context.includes("tel") || context.includes("whatsapp")) return "phone";
    if (context.includes("name") && !context.includes("company")) return "name";
    if (context.includes("message") || context.includes("comment") || context.includes("details")) return "message";

    return "unknown";
  }

  /**
   * Primary Capture Logic
   * Scans a form element and prepares the data payload.
   */
  function captureForm(form) {
    const payload = {
      correlation_id: getCorrelationId(),
      customer_id: CONFIG.customerId,
      source_url: window.location.href,
      timestamp: new Date().toISOString(),
      signals: { email: [], phone: [], name: [], message: [] },
      raw_fields: []
    };

    const fields = form.querySelectorAll("input, textarea, select");

    fields.forEach((field) => {
      // Security Exclusion: Never capture passwords or empty fields
      const isHidden = field.type === "hidden";
      if (field.type === "password" || field.disabled || !field.value) return;

      const value = field.value.trim();
      const semanticType = isHidden ? "hidden" : inferSemanticType(field);

      // Store in raw_fields for 100% data preservation
      payload.raw_fields.push({
        name: field.name || field.id || "unnamed",
        type: field.type,
        label: field.labels?.[0]?.innerText || "",
        value: value,
        inferred_as: semanticType
      });

      // Populate signals for automation (skipping hidden fields to reduce noise)
      if (!isHidden && payload.signals[semanticType]) {
        payload.signals[semanticType].push(value);
      }
    });

    debugLog("Form Captured. Transmitting...", payload);
    transmit(payload);
  }

  /**
   * Data Transport
   * Uses Fetch with 'keepalive' to ensure data is sent even if the page redirects.
   */
  function transmit(payload) {
    fetch(CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    })
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      debugLog(`✅ Lead Delivered. ID: ${payload.correlation_id}`);
    })
    .catch(e => {
      debugLog("❌ Delivery Failed. Possible CSP block or Network error.", e);
    });
  }

  // --- PUBLIC API ---
  // Exposes methods for manual triggering in custom/AJAX forms
  window.Gushwork = {
    capture: (formEl) => {
      if (formEl) captureForm(formEl);
      else debugLog("Manual Capture Error: No form element provided.");
    },
    sendRaw: (data) => {
      const payload = {
        correlation_id: getCorrelationId(),
        customer_id: CONFIG.customerId,
        source_url: window.location.href,
        signals: data,
        raw_fields: [{ manual_trigger: true, data: data }]
      };
      transmit(payload);
    }
  };

  // --- EVENT LISTENERS ---
  // Canonical trigger: Standard HTML Form Submission
  document.addEventListener("submit", (e) => {
    if (e.target.tagName === "FORM") captureForm(e.target);
  }, true); // Capture phase to prevent other scripts from blocking Gushwork

  debugLog("Gushwork v1.1 Initialized.");
})();