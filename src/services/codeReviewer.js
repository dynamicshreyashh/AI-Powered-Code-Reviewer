import { OpenAI } from 'openai';

// Debug: Check if environment variables are loading
console.log('Environment check:', {
  hasEnv: !!import.meta.env,
  hasViteEnv: !!import.meta.env?.VITE_OPENAI_API_KEY,
  keyLength: import.meta.env?.VITE_OPENAI_API_KEY?.length
});

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY is missing! Check your .env file');
} else {
  console.log('✅ OPENAI_API_KEY found, length:', apiKey.length);
}

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
});

export const reviewCode = async (code, language = 'javascript') => {
  console.log('🚀 Starting code review...', { language, codeLength: code.length });
  
  try {
    if (!code.trim()) {
      throw new Error('Code cannot be empty');
    }

    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please check your .env file');
    }

    const prompt = `
      Review the following ${language} code and provide a detailed analysis:

      CODE:
      ${code}

      Please provide feedback in this structured format:

      ## Code Quality Assessment
      - [Brief assessment]

      ## Potential Issues
      - [List any bugs, errors, or problems]

      ## Security Concerns  
      - [Security vulnerabilities if any]

      ## Performance Suggestions
      - [Performance improvements]

      ## Best Practices
      - [Coding standards and best practices]

      Keep the response concise and actionable.
    `;

    console.log('📨 Sending request to OpenAI...');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert code reviewer. Provide clear, constructive feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    console.log('✅ OpenAI response received:', completion.choices[0].message.content.substring(0, 100) + '...');
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error in reviewCode:', error);
    
    // More detailed error messages
    if (error.message?.includes('API key')) {
      throw new Error('Invalid OpenAI API key. Please check your .env file');
    } else if (error.message?.includes('Network')) {
      throw new Error('Network error. Please check your internet connection');
    } else {
      throw new Error(`AI review failed: ${error.message}`);
    }
  }
};