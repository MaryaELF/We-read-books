import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Transcribes text from an image using the Gemini API.
 * @param base64Image The base64 encoded string of the image.
 * @param mimeType The MIME type of the image (e.g., 'image/jpeg', 'image/png').
 * @param outputFormat The desired output format ('plainText' or 'markdown').
 * @returns A promise that resolves to the transcribed text or an error.
 */
export async function transcribeImage(
  base64Image: string,
  mimeType: string,
  outputFormat: 'plainText' | 'markdown',
): Promise<string> {
  // Ensure the API key is available.
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not defined in the environment variables.');
  }

  // Create a new GoogleGenAI instance for each call to ensure the latest API key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };

    let promptText: string;
    if (outputFormat === 'markdown') {
      promptText = 'Extract all text from this image, including handwritten equations and any other visible text. Preserve line breaks and formatting as much as possible, using Markdown for mathematical expressions and structure.';
    } else { // plainText
      promptText = 'Extract all text from this image, including handwritten equations and any other visible text. Preserve line breaks and formatting as much as possible.';
    }

    const textPart = {
      text: promptText,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using a suitable multimodal model
      contents: { parts: [imagePart, textPart] },
      config: {
        maxOutputTokens: 8192, // A generous token limit for potentially long transcriptions
      },
    });

    const transcribedText = response.text;
    if (!transcribedText) {
      throw new Error('No text was transcribed from the image.');
    }
    return transcribedText;
  } catch (error) {
    console.error('Error transcribing image:', error);
    // Re-throw to be handled by the calling component
    throw new Error(`Failed to transcribe image: ${error instanceof Error ? error.message : String(error)}`);
  }
}