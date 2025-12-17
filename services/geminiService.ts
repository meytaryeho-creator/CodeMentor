import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ExecutionTrace } from "../types";

const apiKey = process.env.API_KEY;

// Schema for Analysis
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A short summary of what the code does in Hebrew.",
    },
    language: {
      type: Type.STRING,
      description: "The programming language detected.",
    },
    bugs: {
      type: Type.ARRAY,
      description: "List of errors or potential bugs found in the code.",
      items: {
        type: Type.OBJECT,
        properties: {
          line: { type: Type.INTEGER, description: "Line number of the issue if applicable" },
          description: { type: Type.STRING, description: "Explanation of the error in Hebrew" },
          severity: { type: Type.STRING, enum: ["critical", "warning", "info"] }
        },
        required: ["description", "severity"]
      }
    },
    improvements: {
      type: Type.ARRAY,
      description: "Suggestions for code quality improvements.",
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Suggestion description in Hebrew" },
          category: { type: Type.STRING, enum: ["performance", "readability", "security", "best-practice"] }
        },
        required: ["description", "category"]
      }
    },
    timeComplexity: {
      type: Type.STRING,
      description: "Big O time complexity analysis in Hebrew (e.g. O(n) because...)."
    },
    spaceComplexity: {
      type: Type.STRING,
      description: "Big O space complexity analysis in Hebrew."
    },
    correctedCode: {
      type: Type.STRING,
      description: "The full corrected version of the code implementing fixes and improvements."
    }
  },
  required: ["summary", "language", "bugs", "improvements", "timeComplexity", "spaceComplexity", "correctedCode"]
};

// Schema for Execution Trace
const traceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    inputDescription: { 
      type: Type.STRING, 
      description: "Description of the sample input data chosen for this execution trace (in Hebrew)." 
    },
    steps: {
      type: Type.ARRAY,
      description: "Step by step execution flow.",
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.INTEGER },
          lineContent: { type: Type.STRING, description: "The representative code line or operation being executed." },
          variables: { 
            type: Type.ARRAY, 
            description: "List of relevant variables and their values at this step.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.STRING }
              }
            }
          },
          explanation: { type: Type.STRING, description: "Short explanation of what happened in this step in Hebrew." }
        },
        required: ["step", "lineContent", "variables", "explanation"]
      }
    },
    finalOutput: { 
      type: Type.STRING, 
      description: "The final output of the code execution." 
    }
  },
  required: ["inputDescription", "steps", "finalOutput"]
};

const getAIClient = () => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeCodeWithGemini = async (code: string): Promise<AnalysisResult> => {
  const ai = getAIClient();

  const prompt = `
    You are an expert Computer Science tutor and Code Reviewer.
    Analyze the following code snippet provided by a student.
    
    Your goal is to:
    1. Identify logical errors, syntax errors, or runtime risks.
    2. Suggest improvements based on Clean Code principles, best practices, and performance.
    3. Analyze the Time Complexity and Space Complexity (Big O).
    4. Provide a corrected version of the code.

    CODE TO ANALYZE:
    ${code}

    IMPORTANT: Provide all textual explanations (summary, descriptions) in Hebrew.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from Gemini.");
    return JSON.parse(resultText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze code. Please try again.");
  }
};

export const traceCodeWithGemini = async (code: string): Promise<ExecutionTrace> => {
  const ai = getAIClient();

  const prompt = `
    You are a Code Debugger and Runtime Simulator.
    Simulate the execution of the student's code step-by-step.
    
    Instructions:
    1. Choose a SIMPLE but representative input case (e.g., if it's a sorting function, use a small array like [3, 1, 2]).
    2. Walk through the code execution line by line or logical block by block.
    3. Track the state of relevant variables at each step.
    4. Provide a clear explanation in Hebrew for each step.
    
    CODE TO TRACE:
    ${code}
    
    Output JSON matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: traceSchema,
        temperature: 0.1, // Very low temperature for deterministic tracing
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from Gemini.");
    return JSON.parse(resultText) as ExecutionTrace;

  } catch (error) {
    console.error("Gemini Trace Error:", error);
    throw new Error("Failed to generate execution trace.");
  }
};