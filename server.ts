import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// API Routes
app.post("/api/generate-outfit", async (req, res) => {
  try {
    const { 
      occasion, 
      style, 
      fabric, 
      color, 
      details, 
      bodyType, 
      location, 
      weather, 
      image 
    } = req.body;

    // Construct prompt
    let prompt = `You are a world-class fashion stylist for young adults (18-30). 
    Suggest a complete outfit based on the following details:
    - Occasion: ${occasion}
    - Style/Vibe: ${style}
    - Fabric/Texture: ${fabric || 'Any'}
    - Color Palette: ${color || 'Any'}
    - Details/Fit: ${details || 'Any'}
    - Body Type: ${bodyType || 'Any'}
    - Location: ${location || 'Unknown'}
    - Weather: ${weather || 'Unknown'}
    
    Provide the response in JSON format with the following structure:
    {
      "outfitName": "Creative name for the look",
      "description": "Brief description of why this works",
      "items": [
        {
          "name": "Item Name",
          "description": "Specific details (brand, material, cut)",
          "priceRange": "$X - $Y",
          "searchQuery": "Search term to find this item online"
        }
      ],
      "stylingTips": ["Tip 1", "Tip 2"],
      "colorPalette": ["#Hex1", "#Hex2"]
    }
    
    Make it trendy, aesthetic, and suitable for the target audience.
    `;

    // Use gemini-3-pro-image-preview for advanced reasoning and potential search grounding
    let model = "gemini-3-pro-image-preview";
    let contents: any = {
      parts: [{ text: prompt }]
    };

    if (image) {
      // If image is provided, we need to format the contents correctly
      const base64Data = image.split(',')[1] || image;
      
      contents.parts.push({
        inlineData: {
          mimeType: "image/jpeg", 
          data: base64Data
        }
      });
      contents.parts[0].text += " Also consider the style and elements in the uploaded reference image.";
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }] // Enable search for better item suggestions if needed
      }
    });

    const result = response.text;
    // Parse JSON from the text response
    let parsedResult;
    try {
      parsedResult = JSON.parse(result || '{}');
    } catch (e) {
      // Fallback if JSON parsing fails (sometimes model wraps in ```json ... ```)
      const match = result?.match(/```json([\s\S]*?)```/);
      if (match) {
        parsedResult = JSON.parse(match[1]);
      } else {
        throw new Error("Failed to parse JSON response");
      }
    }
    
    res.json(parsedResult);

  } catch (error) {
    console.error("Error generating outfit:", error);
    res.status(500).json({ error: "Failed to generate outfit" });
  }
});

app.post("/api/generate-image", async (req, res) => {
  try {
    const { description } = req.body;
    
    // Use gemini-2.5-flash-image for generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Generate a high-quality, aesthetic fashion photography style image of: ${description}` }]
      }
    });

    let imageUrl = null;
    // Iterate through parts to find the image
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (imageUrl) {
      res.json({ imageUrl });
    } else {
      res.status(500).json({ error: "No image generated" });
    }

  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
