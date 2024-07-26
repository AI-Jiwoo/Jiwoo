// src/utils/api.js 또는 src/services/api.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

export const fetchNews = async (keyword, startDate, endDate) => {
    try {
        const response = await axios.get(`${apiUrl}/news?keyword=${keyword}&start_date=${startDate}&end_date=${endDate}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching news:', error);
        throw error;
    }
};

export const generateReaction = async (articleSummary) => {
    try {
        const response = await axios.post(`${apiUrl}/reaction`, { article_summary: articleSummary });
        return response.data.reaction;
    } catch (error) {
        console.error('Error generating reaction:', error);
        throw error;
    }
};