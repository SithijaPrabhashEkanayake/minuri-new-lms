const Groq = require('groq-sdk');

// Initialize Groq. It will be undefined if GROQ_API_KEY is not set.
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// @desc    Ask a question to the AI Tutor
// @route   POST /api/ai/ask
// @access  Student
const askQuestion = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Prevent prompt injection / cost abuse with length cap
    if (query.length > 2000) {
      return res.status(400).json({ message: 'Query is too long. Maximum 2000 characters allowed.' });
    }

    if (!groq) {
      // Fallback if the user hasn't set up their API key yet.
      return res.json({
        text: "Hi! I am the AI Tutor. To activate my full capabilities, please add a valid GROQ_API_KEY to your backend `.env` file!",
        cite: "System Config"
      });
    }

    // Use the llama-3.1-8b-instant model for fast, capable text generation
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: "You are a strict, helpful, and concise ICT Tutor for Grade 10-11 students. Only answer questions related to Information and Communication Technology (ICT), computer science, programming, or the school syllabus. If a student asks something unrelated, politely steer them back to ICT. Keep your answers concise, educational, and easy to understand for a high schooler. Do not use markdown headers, just plain text and bullet points if necessary. Always end your response by citing a general source like 'Grade 10 ICT Textbook' or 'General ICT Knowledge'."
        },
        {
          role: 'user',
          content: query
        }
      ],
      model: 'llama-3.1-8b-instant',
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    res.json({
      text: responseText,
      cite: "Groq AI Tutor (Llama 3)"
    });

  } catch (error) {
    console.error('Groq API Error:', error);
    
    // Handle authentication/authorization errors
    if (error.status === 401 || error.status === 403) {
      return res.json({ 
        text: "I'm sorry, but my Groq API Key is receiving an authentication error. Please check your Groq console or try a different key!",
        cite: "System Error"
      });
    }

    res.status(500).json({ message: 'Error communicating with AI service.' });
  }
};

module.exports = { askQuestion };
