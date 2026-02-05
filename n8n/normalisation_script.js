/**
 * @module LeadDataNormalization
 * @description
 * This middleware node standardizes multi-source lead data captured via the Universal Script. 
 * It performs three critical production tasks:
 * 1. AI Output Sanitization: Extracts and validates structured JSON from LLM reasoning.
 * 2. Data Type Enforcement: Protects numeric strings (phone numbers) from spreadsheet auto-formatting.
 * 3. Metadata Serialization: Aggregates non-standard "fuzzy-matched" fields into a readable format.
 */

// --- 1. INBOUND DATA ACQUISITION ---
// Fetching the primary webhook payload. We use .first() to ensure context is scoped to the current execution.
const raw = $("Receiving information from webpage.").first().json.body;

// --- 2. AI CLASSIFICATION & SCHEMA VALIDATION ---
let aiText = "";
try {
    /** * LLM response structures can vary by model or node version. 
     * We implement a fallback pattern to maintain pipeline uptime.
     */
    const output = $("Lead Classifier ").first().json.output[0];
    aiText = output.content[0].text;
} catch (e) {
    // Fallback for standard text-based or legacy n8n content structures
    aiText = $("Lead Classifier ").first().json.content[0].text;
}

/**
 * AI models often wrap JSON in Markdown blocks (e.g., ```json).
 * We regex-strip these artifacts to prevent JSON.parse() exceptions.
 */
aiText = aiText.replace(/```json|```/g, "").trim();
const aiResponse = JSON.parse(aiText);

// --- 3. HEURISTIC STATUS ASSIGNMENT ---
// Default to "New Lead" while prioritizing AI intent classification for Spam detection.
const rawStatus = aiResponse.status || aiResponse.Status || "New Lead";
const finalStatus = rawStatus.toLowerCase().includes("spam") ? "Possible Spam" : "New Lead";

// --- 4. DATA INTEGRITY: PHONE SANITIZATION ---
/**
 * PRODUCTION TRICK: Prepending an apostrophe (') is a standard fix for Google Sheets/Excel 
 * to prevent the truncation of leading zeros or the conversion of long digits into 
 * scientific notation (e.g., +44... becomes 4.4E+10).
 */
const cleanPhone = raw.signals.phone[0] ? `'${raw.signals.phone[0]}` : "No Phone";

// --- 5. TEMPORAL NORMALIZATION ---
// Ensure all timestamps are standardized to ISO-compliant strings for database consistency.
const leadDate = raw.timestamp ? new Date(raw.timestamp) : new Date();
const sheetDate = leadDate.toISOString().replace('T', ' ').split('.')[0];
const currentTime = new Date().toISOString().replace('T', ' ').split('.')[0];

// --- 6. SERIALIZATION OF DYNAMIC METADATA ---
/**
 * Extra "Fuzzy" fields (e.g., Industry, Urgency, WhatsApp) are captured in raw.signals.message.
 * We serialize these into a newline-separated string to maintain legibility within a single Sheet cell.
 */
const extraData = raw.signals.message || [];
const formattedDetails = extraData.length > 0 
    ? extraData.join('\n') 
    : "No additional metadata captured";

// --- 7. FINAL SCHEMA MAPPING ---
// Explicitly map keys to match the destination CRM/Spreadsheet schema requirements.
return {
    "Name": raw.signals.name.join(' ') || "Unknown",
    "Email Address": raw.signals.email[0] || "No Email",
    "Phone Number": cleanPhone,
    "Lead Details": formattedDetails,
    "Status": finalStatus,
    "AI Reasoning": aiResponse.reason || aiResponse.Reason || "N/A",
    
    // Traffic & Attribution Data
    "Submission URL": raw.source_url,
    "Lead Source": raw.lead_source?.referrer || "Direct",
    "Trigger Type": raw.lead_source?.type || "Standard",
    "UTM Params": raw.lead_source?.utm_params || "None",
    
    // Operational Timestamps
    "Customer Name": raw.customer_id,
    "Created at": sheetDate,
    "Formatted Time Local": leadDate.toLocaleString(),
    "Updated at": currentTime
};
