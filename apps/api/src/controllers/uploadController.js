import fs from "fs";

import { parseCSV } from "../lib/csvParser.js";
import { mapHeaders } from "../lib/mapping.js";
import { isValidLead } from "../lib/validators.js";
import { detectDuplicates } from "../lib/duplicateDetector.js";
import { getAIHeaderMapping } from "../lib/aiMapping.js";

export const uploadCSV = async (req, res) => {
  try {
    // Check uploaded file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No CSV file uploaded."
      });
    }

    // Read CSV
    const csvData = await parseCSV(req.file.path);

    // ------------------------------------
    // STEP 1 : Deterministic Header Mapping
    // ------------------------------------

    const mapping = mapHeaders(csvData.headers);

    // Find headers that could not be mapped
    const unmappedHeaders = csvData.headers.filter(
      (header) => !mapping[header]
    );

    console.log("\n========================================");
    console.log("UNMAPPED HEADERS");
    console.log("========================================");
    console.log(unmappedHeaders);

    // ------------------------------------
    // AI METADATA
    // ------------------------------------

    let aiUsed = false;
    let aiMappedHeaders = 0;
    let aiModel = "Gemini 2.5 Flash";

    // ------------------------------------
    // STEP 2 : AI Header Mapping
    // ------------------------------------

    if (unmappedHeaders.length > 0) {
      try {
        console.log("\nCalling Gemini AI...\n");

        const aiMapping = await getAIHeaderMapping(unmappedHeaders);

        console.log("\nGemini Mapping");
        console.log(aiMapping);

        // Merge AI Mapping
        Object.assign(mapping, aiMapping);

        aiUsed = true;

        aiMappedHeaders = Object.values(aiMapping).filter(
          (value) => value && value !== "null"
        ).length;
      } catch (error) {
        console.log("\nAI Mapping Failed");
        console.log(error.message);

        aiUsed = false;
      }
    }

    // ============================
    // DEBUG LOGS
    // ============================

    console.log("\n========================================");
    console.log("CSV HEADERS");
    console.log("========================================");
    console.log(csvData.headers);

    console.log("\n========================================");
    console.log("FINAL HEADER MAPPING");
    console.log("========================================");
    console.log(mapping);

    console.log("\n========================================");
    console.log("FIRST CSV ROW");
    console.log("========================================");
    console.log(csvData.rows[0]);

    // ============================

    const validLeads = [];
    const skippedRows = [];

    // ------------------------------------
    // STEP 3 : Build CRM Leads
    // ------------------------------------

    for (const row of csvData.rows) {
      const lead = {};

      for (const header of csvData.headers) {
        const crmField = mapping[header];

        if (!crmField) continue;

        lead[crmField] = row[header];
      }

      // ============================
      // DEBUG EACH LEAD
      // ============================

      console.log("\n----------------------------------------");
      console.log("GENERATED LEAD");
      console.log("----------------------------------------");
      console.log(lead);

      console.log("Email :", lead.email);
      console.log("Mobile:", lead.mobile);
      console.log("Valid :", isValidLead(lead));

      // ============================

      if (isValidLead(lead)) {
        validLeads.push(lead);
      } else {
        skippedRows.push({
          row,
          reason: "Missing valid email or mobile"
        });
      }
    }

    // ------------------------------------
    // STEP 4 : Duplicate Detection
    // ------------------------------------

    const duplicateResult = detectDuplicates(validLeads);

    // ============================
    // FINAL SUMMARY
    // ============================

    console.log("\n========================================");
    console.log("FINAL SUMMARY");
    console.log("========================================");
    console.log("Total Rows      :", csvData.rows.length);
    console.log("Valid Leads     :", validLeads.length);
    console.log("Skipped Rows    :", skippedRows.length);
    console.log("Duplicates      :", duplicateResult.duplicateCount);
    console.log("Unique Leads    :", duplicateResult.leads.length);

    console.log("\nAI SUMMARY");
    console.log("========================================");
    console.log("AI Used         :", aiUsed);
    console.log("AI Model        :", aiModel);
    console.log("Headers to AI   :", unmappedHeaders.length);
    console.log("Headers Mapped  :", aiMappedHeaders);
    console.log("========================================\n");

    return res.status(200).json({
      success: true,

      message: "CSV imported successfully.",

      rows: csvData.rows.length,

      headers: csvData.headers,

      mapping,

      leads: duplicateResult.leads,

      duplicates: duplicateResult.duplicateCount,

      skipped: skippedRows.length,

      skippedRows,

      ai: {
        enabled: true,
        usedAI: aiUsed,
        model: aiModel,
        headersSentToAI: unmappedHeaders.length,
        headersMappedByAI: aiMappedHeaders,
        totalMappedFields: Object.keys(mapping).length
      },

      file: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};