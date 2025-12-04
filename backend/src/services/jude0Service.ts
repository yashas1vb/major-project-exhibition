import axios from 'axios';

const JUDE0_API_URL = process.env.JUDE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDE0_API_KEY = process.env.JUDE0_API_KEY;

export const executeCode = async (sourceCode: string, languageId: number) => {
    try {
        const options = {
            method: 'POST',
            url: `${JUDE0_API_URL}/submissions`,
            params: { base64_encoded: 'false', fields: '*' },
            headers: {
                'content-type': 'application/json',
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': JUDE0_API_KEY,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            data: {
                language_id: languageId,
                source_code: sourceCode,
            }
        };

        const response = await axios.request(options);
        const token = response.data.token;

        // Poll for results
        let result = null;
        let attempts = 0;
        while (attempts < 10) {
            const resultOptions = {
                method: 'GET',
                url: `${JUDE0_API_URL}/submissions/${token}`,
                params: { base64_encoded: 'false', fields: '*' },
                headers: {
                    'X-RapidAPI-Key': JUDE0_API_KEY,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                }
            };

            const resultResponse = await axios.request(resultOptions);
            const statusId = resultResponse.data.status.id;

            // 1: In Queue, 2: Processing
            if (statusId !== 1 && statusId !== 2) {
                result = resultResponse.data;
                break;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }

        return result;
    } catch (error) {
        console.error('Jude0 Execution Error:', error);
        throw error;
    }
};
