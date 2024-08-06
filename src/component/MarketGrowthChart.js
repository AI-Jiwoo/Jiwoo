import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import {Box} from "@chakra-ui/react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MarketGrowthChart = ({ data }) => {
    // 성장률에서 숫자만 추출
    const growthRate = parseFloat(data.growthRate.replace(/[^0-9.]/g, '')) / 100;

    // 시장 규모에서 숫자만 추출
    const initialMarketSize = parseFloat(data.marketSize.replace(/[^0-9.]/g, ''));

    const years = [2023, 2024, 2025, 2026, 2027];
    const marketSizes = years.map((year, index) =>
        Math.round(initialMarketSize * Math.pow(1 + growthRate, index))
    );

    const chartData = {
        labels: years,
        datasets: [
            {
                label: '예상 시장 규모',
                data: marketSizes,
                fill: false,
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgba(75, 192, 192, 0.2)',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,  // 이 줄을 추가합니다
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: '시장 규모 예측',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: '시장 규모 (단위: 억 원)',
                },
            },
        },
        layout: {  // 이 부분을 추가합니다
            padding: {
                right: 0
            }
        }
    };
    return (     <Box height="400px" width="50%">
            <Line data={chartData} options={options} />
        </Box>
    )
};

export default MarketGrowthChart;