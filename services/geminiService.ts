import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Severity, GeocodeResult, SearchResult } from "../types";

// NOTE: In a real app, this key should be proxied or restricted.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `
You are an expert AI Civil Engineer and Public Safety Inspector for "CivicLens".
Analyze the provided image to identify civic infrastructure issues.

Possible Issue Types:
- Pothole
- Garbage Dump
- Broken Street Light
- Open Manhole
- Water Leakage
- Illegal Parking
- Stray Animal Obstruction
- Graffiti / Vandalism
- Broken Sidewalk
- None (if the image looks normal or irrelevant)

Severity Criteria:
- High: Immediate danger to life or vehicles (e.g., open manhole, deep pothole on highway).
- Medium: Potential hazard or significant sanitation issue (e.g., garbage pile, shallow pothole).
- Low: Cosmetic issue or minor nuisance (e.g., faded paint, small litter).

Provide a structured analysis returning exactly:
- issue_type: The category of the problem.
- confidence: A score from 0-100.
- severity: High, Medium, Low, or None.
- recommended_action: A short, actionable step for the maintenance team.
- description: A brief visual description of the issue.
`;

export const analyzeImage = async (base64Image: string, locationContext?: string): Promise<AnalysisResult> => {
  try {
    const promptText = locationContext 
      ? `${SYSTEM_PROMPT}\n\nContext: The image was reported at location: ${locationContext}. Consider this in your analysis if relevant.`
      : SYSTEM_PROMPT;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issue_type: { type: Type.STRING },
            severity: { type: Type.STRING, enum: [Severity.HIGH, Severity.MEDIUM, Severity.LOW, Severity.NONE] },
            confidence: { type: Type.NUMBER },
            description: { type: Type.STRING },
            recommended_action: { type: Type.STRING },
          },
          required: ["issue_type", "severity", "confidence", "description", "recommended_action"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as AnalysisResult;

  } catch (error) {
    console.error("Gemini Vision Analysis Failed:", error);
    return {
      issue_type: "Error",
      severity: Severity.LOW,
      confidence: 0,
      description: "Failed to analyze image. Please try again.",
      recommended_action: "Retry upload.",
    };
  }
};

/**
 * Reverse Geocoding with Maps Grounding
 * Uses gemini-2.5-flash with googleMaps tool
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<GeocodeResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "What is the precise street address of this location?",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    // Extract grounding chunks for compliance
    // @ts-ignore - The SDK types might lag slightly behind latest live response shape
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    let mapLink = undefined;
    
    // Find the first map URI
    for (const chunk of chunks) {
        if (chunk.web?.uri && chunk.web.uri.includes('google.com/maps')) {
            mapLink = chunk.web.uri;
            break;
        }
    }

    return {
      address: response.text?.trim() || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      mapLink: mapLink
    };
  } catch (error) {
    console.error("Reverse Geocoding Failed:", error);
    return { address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` };
  }
};

/**
 * Search Civic Information
 * Uses gemini-3-flash-preview with googleSearch tool
 */
export const searchCivicInfo = async (query: string): Promise<SearchResult> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: query,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        // Extract grounding chunks for sources
        // @ts-ignore
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = chunks
            .map((chunk: any) => chunk.web)
            .filter((web: any) => web && web.uri && web.title)
            .map((web: any) => ({ uri: web.uri, title: web.title }));

        // Remove duplicates based on URI
        const uniqueSources = sources.filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => (t.uri === v.uri)) === i);

        return {
            text: response.text || "No results found.",
            sources: uniqueSources
        };

    } catch (error) {
        console.error("Search failed:", error);
        return {
            text: "Sorry, I couldn't perform the search at this time.",
            sources: []
        };
    }
}

/**
 * Chatbot Interaction
 * Uses gemini-3-pro-preview
 */
export const chatWithCivicAssistant = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
    try {
        const chat = ai.chats.create({
            model: "gemini-3-pro-preview",
            history: history,
            config: {
                systemInstruction: "You are CivicBot, a helpful assistant for the CivicLens application. You help users understand how to report issues, explain civic processes, and provide general safety advice. Keep answers concise.",
            }
        });

        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Chat failed:", error);
        return "I'm having trouble connecting right now. Please try again later.";
    }
}