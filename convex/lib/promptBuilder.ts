import { Doc } from "../_generated/dataModel";

export function buildBiosecurityPrompt(speciesList: Doc<"species">[]): string {
  const activeSpecies = speciesList.filter((s) => s.display.isActive);

  if (activeSpecies.length === 0) {
    return "No target species configured. Please contact administrator.";
  }

  let prompt = `Detect BIOSECURITY THREAT FRUIT FLIES in this image. New Zealand MPI requires reporting of ${activeSpecies.length} species. Err on the side of caution.\n\n`;

  activeSpecies.forEach((species, index) => {
    prompt += `=== SPECIES ${index + 1}: ${species.commonName.toUpperCase()} (${species.scientificName}) ===\n`;
    prompt += `KEY FEATURES (any ${species.detection.alertThreshold}+ = ALERT):\n`;

    species.detection.matchingCriteria.forEach((criteria) => {
      prompt += `- ${criteria}\n`;
    });

    if (species.biosecurity.recentDetections) {
      prompt += `RECENT DETECTION: ${species.biosecurity.recentDetections}\n`;
    }

    prompt += "\n";
  });

  // Add common lookalikes section
  prompt += `=== COMMON LOOKALIKES (NOT threats) ===\n`;
  prompt += `- House fly: Much larger (8-12mm), grey, no wing markings\n`;
  prompt += `- Blow fly: Metallic blue/green coloring\n`;
  prompt += `- Common vinegar fly: No wing spots, attacks ROTTING fruit only\n`;
  prompt += `- Native NZ flies: Different patterns\n\n`;

  // Add fruit damage indicators
  prompt += `=== FRUIT DAMAGE INDICATORS (any = ALERT) ===\n`;
  prompt += `- Small puncture marks on fruit skin\n`;
  prompt += `- Soft spots around puncture points\n`;
  prompt += `- Larvae (maggots) in fruit\n`;
  prompt += `- Premature fruit drop\n\n`;

  // Add critical rules
  prompt += `=== CRITICAL RULES ===\n`;
  prompt += `1. If features match ANY of the target species = ALERT\n`;
  prompt += `2. Specify WHICH species if identifiable\n`;
  prompt += `3. Fruit damage consistent with fruit fly = ALERT\n`;
  prompt += `4. Poor image quality but COULD be threat species = ALERT\n`;
  prompt += `5. When in doubt = ALERT (false positives acceptable, false negatives are NOT)\n`;
  prompt += `6. Only mark UNLIKELY if clear exclusion features\n`;

  return prompt;
}

export function buildSystemInstruction(
  speciesList: Doc<"species">[]
): string {
  const activeSpecies = speciesList.filter((s) => s.display.isActive);

  let instruction = `You are a fruit fly biosecurity specialist for New Zealand MPI. Your job is to detect ${activeSpecies.length} target pest species that threaten NZ's $6 billion horticulture industry.\n\n`;

  instruction += `TARGET SPECIES (all must be reported to MPI):\n`;
  activeSpecies.forEach((species, index) => {
    instruction += `${index + 1}. ${species.commonName} (${species.scientificName})`;
    if (species.biosecurity.recentDetections) {
      instruction += ` - RECENT DETECTION in ${species.biosecurity.recentDetections}`;
    }
    instruction += `\n`;
  });

  instruction += `\nCRITICAL: This is a biosecurity screening tool. Your PRIMARY goal is to NEVER miss any of these species.\n`;
  instruction += `- FALSE POSITIVES are acceptable and expected\n`;
  instruction += `- FALSE NEGATIVES are DANGEROUS and unacceptable\n\n`;

  instruction += `When analyzing images:\n`;
  instruction += `1. Check against ALL target species\n`;
  instruction += `2. If features match ANY target species, set qflyLikelihood to ALERT\n`;
  instruction += `3. In the species field, specify which target species (if identifiable)\n`;
  instruction += `4. Only mark UNLIKELY if clear exclusion features present\n`;
  instruction += `5. When genuinely uncertain, always choose ALERT\n\n`;

  instruction += `REPORTING ADVICE: If ALERT, advise user to call MPI hotline 0800 80 99 66 immediately.`;

  return instruction;
}
