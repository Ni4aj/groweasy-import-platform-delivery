// apps/api/src/lib/duplicateDetector.js

export function detectDuplicates(leads) {

  const emailSet = new Set();
  const mobileSet = new Set();

  const uniqueLeads = [];
  const duplicates = [];

  for (const lead of leads) {

    const email = String(lead.email || "")
      .trim()
      .toLowerCase();

    const mobile = String(lead.mobile || "")
      .replace(/\D/g, "");

    const emailDuplicate =
      email && emailSet.has(email);

    const mobileDuplicate =
      mobile && mobileSet.has(mobile);

    if (emailDuplicate || mobileDuplicate) {

      duplicates.push(lead);

      continue;

    }

    if (email) {
      emailSet.add(email);
    }

    if (mobile) {
      mobileSet.add(mobile);
    }

    uniqueLeads.push(lead);

  }

  return {

    leads: uniqueLeads,

    duplicates,

    duplicateCount: duplicates.length

  };

}