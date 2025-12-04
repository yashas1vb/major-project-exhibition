import { Request, Response } from 'express';
import axios from 'axios';

// Judge0 Language IDs
const LANGUAGE_MAPPING: Record<string, number> = {
    javascript: 63,
    typescript: 74,
    python: 71,
    java: 62,
    c: 50,
    cpp: 54,
    go: 60,
    rust: 73,
    php: 68,
    ruby: 72,
};

export const executeCode = async (req: Request, res: Response) => {
    try {
        const { code, language } = req.body;
        console.log('Execution Request:', { code, language });

        if (!code || !language) {
            console.log('Missing code or language');
            return res.status(400).json({ error: 'Code and language are required' });
        }

        const languageId = LANGUAGE_MAPPING[language.toLowerCase()];
        console.log('Mapped Language ID:', languageId);

        if (!languageId) {
            console.log('Unsupported language');
            return res.status(400).json({ error: `Unsupported language: ${language}` });
        }

        const options = {
            method: 'POST',
            url: `${process.env.JUDE0_API_URL}/submissions`,
            params: {
                base64_encoded: 'false',
                fields: '*'
            },
            headers: {
                'content-type': 'application/json',
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': process.env.JUDE0_API_KEY,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            data: {
                language_id: languageId,
                source_code: code,
            }
        };

        // 1. Submit code
        const submissionResponse = await axios.request(options);
        const token = submissionResponse.data.token;

        if (!token) {
            throw new Error('Failed to get submission token');
        }

        // 2. Poll for results
        let result = null;
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            const resultResponse = await axios.request({
                method: 'GET',
                url: `${process.env.JUDE0_API_URL}/submissions/${token}`,
                params: {
                    base64_encoded: 'false',
                    fields: '*'
                },
                headers: {
                    'X-RapidAPI-Key': process.env.JUDE0_API_KEY,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                }
            });

            const statusId = resultResponse.data.status.id;

            // Status IDs: 1 (In Queue), 2 (Processing)
            if (statusId === 1 || statusId === 2) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
                attempts++;
                continue;
            }

            result = resultResponse.data;
            break;
        }

        if (!result) {
            return res.status(504).json({ error: 'Execution timed out' });
        }

        res.json({
            stdout: result.stdout,
            stderr: result.stderr,
            compile_output: result.compile_output,
            status: result.status,
            time: result.time,
            memory: result.memory,
        });

    } catch (error: any) {
        console.error('Execution error details:', error.response?.data || error.message);
        console.error('Full error object:', error);
        res.status(500).json({
            error: 'Failed to execute code',
            details: error.response?.data?.message || error.message
        });
    }
};
