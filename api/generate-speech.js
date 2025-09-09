// Vercel Serverless Function
// File: /api/generate-speech.js

export default async function handler(request, response) {
    // 1. Hanya izinkan metode POST
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // 2. Ambil data dari body permintaan front-end
        const { textToSpeak, voiceName } = request.body;

        if (!textToSpeak || !voiceName) {
            return response.status(400).json({ error: 'Missing textToSpeak or voiceName in request body' });
        }
        
        // 3. Ambil Kunci API secara aman dari Environment Variables Vercel
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
             return response.status(500).json({ error: 'API Key not configured on the server.' });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{
                parts: [{ text: textToSpeak }]
            }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName }
                    }
                }
            },
            model: "gemini-2.5-flash-preview-tts"
        };

        // 4. Panggil Google API dari server
        const googleApiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!googleApiResponse.ok) {
            const errorText = await googleApiResponse.text();
            console.error("Google API Error:", errorText);
            return response.status(googleApiResponse.status).json({ error: 'Failed to fetch from Google API', details: errorText });
        }

        const result = await googleApiResponse.json();
        
        const part = result?.candidates?.[0]?.content?.parts?.[0];
        const audioData = part?.inlineData?.data;

        if (audioData) {
            // 5. Kirim data audio kembali ke front-end
            return response.status(200).json({ audioData: audioData });
        } else {
            return response.status(500).json({ error: "Invalid response structure from Google API." });
        }

    } catch (error) {
        console.error('Server-side error:', error);
        return response.status(500).json({ error: error.message });
    }
}
