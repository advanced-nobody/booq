
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { GEMINI_MODEL_TEXT } from '../constants';
import { Book, BookStatus } from '../types'; // Import global types

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY para Gemini no está configurada. Las funciones de IA estarán deshabilitadas.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateBookSpark = async (title: string, author: string): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini API no está inicializada. Verifica la configuración de API_KEY.");
  }

  const prompt = `Para el libro "${title}" de ${author}, genera una pregunta concisa (1-2 frases) que incite a una discusión interesante sobre su contenido o temas.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      }
    });
    
    const text = response.text;

    if (!text) {
      throw new Error("No se recibió contenido de la API de Gemini para la chispa literaria.");
    }
    return text.trim();

  } catch (error) {
    console.error("Error al llamar a la API de Gemini para la chispa literaria:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
      throw new Error("La clave API de Gemini no es válida. Por favor, verifica tu configuración.");
    }
    throw new Error("No se pudo generar la chispa literaria. Inténtalo de nuevo más tarde.");
  }
};

export const searchBookDetailsWithGemini = async (query: string): Promise<Partial<Book>[]> => {
  if (!ai) {
    throw new Error("Gemini API no está inicializada. Verifica la configuración de API_KEY.");
  }

  const prompt = `
    Estoy buscando detalles de libros que coincidan con la consulta: "${query}".
    Por favor, devuelve una lista de hasta 3 libros en formato JSON.
    Cada libro debe tener los siguientes campos: "title" (string), "author" (string), "description" (string, breve, 2-3 frases), "pages" (number), "publishedDate" (string, formato YYYY o YYYY-MM-DD), "genres" (array of strings, ej: ["Ficción", "Misterio"]).
    Si no encuentras resultados razonables, devuelve un array JSON vacío [].
    Asegúrate de que el JSON sea válido. Ejemplo de un libro:
    {
      "title": "Cien años de soledad",
      "author": "Gabriel García Márquez",
      "description": "La novela narra la historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo.",
      "pages": 432,
      "publishedDate": "1967",
      "genres": ["Realismo mágico", "Saga familiar"]
    }
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3, 
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);

    if (!Array.isArray(parsedData)) {
        console.warn("La respuesta de Gemini no fue un array:", parsedData);
        if (typeof parsedData === 'object' && parsedData !== null && (parsedData as any).title) {
          // Coerce to Partial<Book>
          return [parsedData as Partial<Book>];
        }
        return [];
    }
    
    // Ensure the mapped objects conform to Partial<Book> from types.ts
    return parsedData.map(book => ({
        title: typeof book.title === 'string' ? book.title : undefined,
        author: typeof book.author === 'string' ? book.author : undefined,
        description: typeof book.description === 'string' ? book.description : undefined,
        pages: typeof book.pages === 'number' ? book.pages : undefined,
        publishedDate: typeof book.publishedDate === 'string' ? book.publishedDate : undefined,
        genres: Array.isArray(book.genres) && book.genres.every((g: any) => typeof g === 'string') ? book.genres : [],
        // Note: 'status' is not part of the Gemini response for this function,
        // so it will be undefined in the Partial<Book>, which is correct.
    })).filter(book => book.title && book.author) as Partial<Book>[];

  } catch (error) {
    console.error("Error al buscar detalles del libro con Gemini:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
      throw new Error("La clave API de Gemini no es válida. Por favor, verifica tu configuración.");
    }
    throw new Error("No se pudieron obtener detalles del libro. Inténtalo de nuevo.");
  }
};


// Q Bot Specific Functionality
let qBotChatInstance: Chat | null = null;

export const getOrInitQBotChat = (): Chat => {
  if (qBotChatInstance) {
    return qBotChatInstance;
  }
  if (!ai) {
    throw new Error("Gemini API no está inicializada. Revisa la configuración de API_KEY.");
  }
  qBotChatInstance = ai.chats.create({
    model: GEMINI_MODEL_TEXT,
    config: {
      systemInstruction: "Eres Q Bot, un amigable y experto asistente de recomendaciones de libros. Tu objetivo es ayudar a los usuarios a descubrir nuevos libros basados en sus preferencias, géneros favoritos, autores o libros que ya han disfrutado. Proporciona recomendaciones concisas, incluyendo título y autor. Puedes preguntar por más detalles para refinar tus sugerencias si es necesario. Intenta dar 2-3 recomendaciones si es posible. Formatea los títulos de los libros en negrita (markdown: **Título del Libro**). Responde siempre en español.",
      temperature: 0.6, 
      topP: 0.9,
      topK: 30,
    }
  });
  return qBotChatInstance;
};

export const sendMessageToQBotStream = async (
  chat: Chat,
  messageText: string,
  onChunkReceive: (chunkText: string) => void,
  onStreamEnd: () => void,
  onError: (errorMessage: string) => void
): Promise<void> => {
  if (!ai) { 
      onError("La API de Gemini no está configurada. No se puede comunicar con Q Bot.");
      return;
  }
  try {
    const stream = await chat.sendMessageStream({ message: messageText });
    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        onChunkReceive(text);
      }
    }
    onStreamEnd();
  } catch (err) {
    console.error("Error en sendMessageToQBotStream:", err);
    let errorMessage = "Error de comunicación con Q Bot.";
    if (err instanceof Error) {
      if (err.message.includes('API key not valid')) {
        errorMessage = "La clave API de Gemini no es válida. Por favor, verifica tu configuración.";
      } else {
        errorMessage = err.message;
      }
    }
    onError(errorMessage);
  }
};

// Removed local Book interface and BookStatus enum, as they are now imported from ../types
