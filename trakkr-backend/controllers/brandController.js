// controllers\brandController.js
import Brand from '../models/brands.js';
import axios from 'axios';

const callMistralChat = async (url) => {
    try {
        const prompt = `You are analyzing a brand based on the following scraped content and/or the webpage's url input: ${url}

        1. Extract the formal brand name: What is the official name of the brand based on the content provided?
        2. Suggest name variants: Identify 3–4 potential name variants for this brand that users or AI systems might use. Variants may include abbreviations, common misspellings, or common usage names.
        3. Write a brand description: Based on the scraped content, write a nice description that succinctly describes the brand, its services, or its value proposition It should be 6 lines or more. Please do not add markdown stuff in there, just normal text description.
        4. Generate 5 search-friendly visibility prompts: Create only 5 AI search queries that users might use to discover brands similar to this one. These should be general, industry-relevant search queries, such as “Top 10 AI-based services for healthcare” or “What are the leading data annotation services for AI in 2025?”

        Do NOT add explanatory text before or after the JSON. Respond ONLY with valid JSON - NO additional text, explanations, or comments, in the following structured JSON format:

        {
          "brand_name": "...",
          "name_variants": ["...", "...", "..."],
          "description": "...",
          "prompts": [
            "...",
            "...",
            "...",
            "...",
            "..."
          ]
        }
        Explanation of Prompt Structure:
        Brand Name Extraction: Mistral will extract the official brand name based on what is mentioned in the scraped content.

        Name Variants: The agent will suggest alternative names, which may include commonly used abbreviations or other names people might associate with the brand.

        Brand Description: The agent will create a brief, accurate description of the brand from the scraped content.

        Visibility Prompts: These are the search queries that users may use to find this brand on search engines or AI LLMs, such as industry-specific or service-related prompts.

        Example of Expected JSON Output from Mistral Agent
        {
          "brand_name": "Practo",
          "name_variants": ["Practo", "Practo Health", "Practo App"],
          "description": "Practo is a healthcare platform offering instant video consultations with verified doctors across various specialties. It provides services such as booking appointments, accessing health articles, and finding clinics and hospitals, primarily serving users in India. The platform emphasizes convenience and trust, enabling patients to connect with top doctors online from the comfort of their homes. Practo also supports healthcare providers with dedicated tools and services.",
          "prompts": [
            "Top 10 online healthcare platforms in India",
            "Best platforms for doctor consultations online",
            "Top 10 telemedicine services for convenient at-home healthcare in 2025",
            "Top AI-driven healthcare services for home consultation",
            "Top 10 online doctor consultation platforms in India for instant medical advice in 2025?"
          ]
        }`;

        const response = await axios.post(
            'https://api.mistral.ai/v1/chat/completions',
            {
                model: "mistral-large-latest",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1024
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.MISTRAL_API_1}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0].message.content;
        return parseAIResponse(content);
    } catch (error) {
        console.error('Mistral API error:', error.response?.data || error.message);
        throw error;
    }
};

const parseAIResponse = (content) => {
    try {
        let cleaned = content.trim();

        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
        }

        cleaned = cleaned.replace(/\/\/.*$/gm, '');

        cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

        cleaned = cleaned.replace(/,\s*[^"\s\[\{][^,\}\]]*(\s*[,\}\]])/g, '$1');

        cleaned = cleaned.replace(/("\s*:\s*"[^"]*)\n([^"]*")/g, '$1 $2');

        cleaned = cleaned.replace(/\n\s*\n/g, '\n').trim();

        console.log('Cleaned JSON string:', cleaned);

        const parsed = JSON.parse(cleaned);

        if (parsed.description) {
            parsed.description = parsed.description.replace(/\s+/g, ' ').trim();
        }

        return parsed;

    } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', content);
        console.error('Parse error details:', parseError.message);

        try {
            let aggressive = content.trim();

            const jsonStart = aggressive.indexOf('{');
            if (jsonStart > 0) {
                aggressive = aggressive.substring(jsonStart);
            }

            const jsonEnd = aggressive.lastIndexOf('}');
            if (jsonEnd > 0) {
                aggressive = aggressive.substring(0, jsonEnd + 1);
            }

            aggressive = aggressive.replace(/\/\/[^\n\r]*/g, '');
            aggressive = aggressive.replace(/\/\*[\s\S]*?\*\//g, '');

            aggressive = aggressive
                .replace(/,(\s*[}\]])/g, '$1') // trailing commas
                .replace(/,\s*[^"\s\[\{][^,\}\]]*(\s*[,\}\]])/g, '$1') // trailing characters
                .replace(/"\s*:\s*"\s*\n/g, '": "') // newlines in strings
                .replace(/\n\s*/g, ' ') // normalize whitespace
                .replace(/\s+/g, ' ') // multiple spaces
                .trim();

            if (aggressive.includes('"description"') && !aggressive.includes('"description".*".*"')) {
                aggressive = aggressive.replace(/"description"\s*:\s*"([^"]*$)/, '"description": "$1"');

                if (!aggressive.endsWith('}')) {
                    const openBraces = (aggressive.match(/{/g) || []).length;
                    const closeBraces = (aggressive.match(/}/g) || []).length;
                    const missingBraces = openBraces - closeBraces;

                    for (let i = 0; i < missingBraces; i++) {
                        aggressive += '}';
                    }
                }
            }

            // console.log('Aggressively cleaned JSON:', aggressive);

            const parsed = JSON.parse(aggressive);

            if (parsed.description) {
                parsed.description = parsed.description.replace(/\s+/g, ' ').trim();
                parsed.description = parsed.description.replace(/\*\*([^*]+)\*\*/g, '$1');
            }

            return parsed;

        } catch (secondError) {
            console.error('Aggressive cleanup also failed:', secondError.message);

            try {
                console.log('Attempting manual extraction as last resort...');

                const brandNameMatch = content.match(/"brand_name"\s*:\s*"([^"]+)"/);
                const descriptionMatch = content.match(/"description"\s*:\s*"([^"]+(?:"[^"]*)*?)"/s);
                const nameVariantsMatch = content.match(/"name_variants"\s*:\s*\[(.*?)\]/s);
                const promptsMatch = content.match(/"prompts"\s*:\s*\[(.*?)\]/s);

                if (!brandNameMatch) {
                    throw new Error('Could not extract brand name');
                }

                const extractedData = {
                    brand_name: brandNameMatch[1],
                    name_variants: [],
                    description: '',
                    prompts: []
                };

                if (nameVariantsMatch) {
                    const variantsStr = nameVariantsMatch[1];
                    const variants = variantsStr.match(/"([^"]+)"/g);
                    if (variants) {
                        extractedData.name_variants = variants.map(v => v.replace(/"/g, ''));
                    }
                }

                if (descriptionMatch) {
                    extractedData.description = descriptionMatch[1].replace(/\s+/g, ' ').trim();
                }

                if (promptsMatch) {
                    const promptsStr = promptsMatch[1];
                    const prompts = promptsStr.match(/"([^"]+)"/g);
                    if (prompts) {
                        extractedData.prompts = prompts.map(p => p.replace(/"/g, ''));
                    }
                }

                console.log('Manual extraction successful:', extractedData);
                return extractedData;

            } catch (extractError) {
                console.error('Manual extraction failed:', extractError.message);
                throw new Error('Invalid JSON response from AI agent');
            }
        }
    }
};

export const analyzeBrand = async (req, res) => {
    try {
        const { url, scraped_text } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: "URL is required"
            });
        }

        console.log('Analyzing brand for URL:', url);

        const mistralResponse = await callMistralChat(url, scraped_text);

        // Validate response structure
        if (!mistralResponse.brand_name || !mistralResponse.name_variants ||
            !mistralResponse.description || !mistralResponse.prompts) {
            console.error('Invalid response structure:', mistralResponse);
            throw new Error('Invalid response structure from AI');
        }

        console.log('Successfully received response from Mistral');

        return res.json({
            success: true,
            data: mistralResponse,
            sources: {
                mistral_success: true,
                mistral_used: true
            }
        });

    } catch (error) {
        console.error('Brand analysis error:', error);

        // Fallback to mock data if model fails
        console.log('Falling back to mock data due to error');
        const mockResponse = {
            brand_name: "Example Brand",
            name_variants: ["Example Brand", "Example", "ExampleCorp", "Example.com"],
            description: "Example Brand is a leading technology company that provides innovative solutions for businesses worldwide. The company specializes in digital transformation services, helping organizations streamline their operations and enhance customer experiences.",
            prompts: [
                "Top 10 digital transformation companies",
                "Best technology solutions for business modernization",
                "Leading platforms for enterprise digital services",
                "Top companies for business process automation",
                "Best technology consulting services for enterprises"
            ]
        };

        res.json({
            success: true,
            data: mockResponse,
            fallback: true,
            sources: {
                mistral_success: false,
                mistral_used: false
            }
        });
    }
};

export const saveBrand = async (req, res) => {
    try {
        const { user_email, brand_url, brand_name, name_variants, description, prompts } = req.body;

        if (!user_email || !brand_url || !brand_name || !description) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Check if user already has 3 brands
        const existingBrands = await Brand.countDocuments({ user_email });
        if (existingBrands >= 3) {
            return res.status(400).json({
                success: false,
                message: "Maximum 3 brands allowed per user"
            });
        }

        const brand = new Brand({
            user_email,
            brand_url,
            brand_name,
            name_variants: name_variants || [],
            description,
            prompts: prompts || [],
            brand_count: existingBrands + 1
        });

        await brand.save();

        console.log('Brand saved successfully:', brand._id);

        res.json({
            success: true,
            message: "Brand saved successfully",
            data: brand
        });
    } catch (error) {
        console.error('Save brand error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getUserBrands = async (req, res) => {
    try {
        const { user_email } = req.params;
        const brands = await Brand.find({ user_email });

        res.json({
            success: true,
            data: brands
        });
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};