import { generateObject } from "ai";
import { z } from "zod";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";

const MODEL_ID = "us.anthropic.claude-3-5-sonnet-20241022-v2:0"

const DEFAULTS = {
    devices: ["mobile", "desktop"] as const,
    age_min: 18,
    age_max: 65,
    genders: ["unknown"] as const,
    languages: ["en"],
    locations: ["US"]
};

const bedrock = createAmazonBedrock({
    region: "us-east-1",
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
})

const CampaignProposalSchema = z.object({
  // Identification & core
  "external-id": z.string().min(1, "external-id required"),
  url: z.string().url().min(1, "url required"),
  budget: z.number().finite().nonnegative().min(1, "budget required"),

  // Creative
  headlines: z.array(z.string()).min(3, "provide at least 3 headlines"),
  descriptions: z.array(z.string()).min(3, "provide at least 3 descriptions"),
  keywords: z.array(z.string()).min(4, "provide at least 4 keywords"),

  // Targeting (flattened)
  locations: z.array(z.string()).min(1, "provide at least 1 location"),
  devices: z.array(z.enum(["desktop", "mobile", "tablet", "tv", "other"])), // required (no default)

  // Flattened age range
  age_min: z.number().int().min(0).max(120),
  age_max: z.number().int().min(0).max(120),

  // Required genders (≥1)
  genders: z
    .array(z.enum(["male", "female", "nonbinary", "unknown", "other"]))
    .min(1, "provide at least 1 gender"),

  // Languages required (no min specified)
  languages: z.array(z.string()),

  // Interests optional
  interests: z.array(z.string()).optional(),
}).refine(
  (o) => o.age_min <= o.age_max,
  { message: "age_min must be ≤ age_max", path: ["age_min"] }
);

export type CampaignProposal = z.infer<typeof CampaignProposalSchema>;

class ProposalGeneration {
    async generateCampaignProposal(input: object) {
        const system = [
            "You are a data interpreter for ads campaign setup.",
            "Please interpret this JSON object as a product listing.",
            "Find its unique ID if present and build a campaign proposal out of it.",
            "You must output a single JSON object that validates against the provided schema exactly (no extra keys, no prose).",
            "",

            // Heuristics for ID detection:
            "ID heuristics: prefer fields named id, productId, sku, upc, ean, mpn, gtin, asin, code, reference, externalId.",
            "Choose a stable-looking alphanumeric code; avoid prices, quantities, dates, phones, or URLs.",
            "",

            // Requirements and conservative defaults to satisfy minima:
            `If required info is missing, infer conservative defaults:
                - devices: ${JSON.stringify(DEFAULTS.devices)}
                - age_min: ${DEFAULTS.age_min}, age_max: ${DEFAULTS.age_max}
                - genders: ${JSON.stringify(DEFAULTS.genders)}
                - languages: ${JSON.stringify(DEFAULTS.languages)}
                - locations: ${JSON.stringify(DEFAULTS.locations)}
                - headlines (≥3), descriptions (≥3), keywords (≥4): derive short, truthful entries from the product context (no clickbait).`,
            "",
            "Return strictly JSON for the schema—no explanations."
        ].join("\n");


        const user = [
            "Attached is the input JSON to interpret:",
            "```json",
            JSON.stringify(input, null, 2),
            "```"
        ].join("\n");

        try {
            const { object } = await generateObject({
                model: bedrock(MODEL_ID),
                schema: CampaignProposalSchema,
                system,
                prompt: user,
                temperature: 0.5,
                maxRetries: 1
            })

            return object
        } catch {
            return null
        }
    }
}

const instance = new ProposalGeneration()

export default instance