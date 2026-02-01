import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AccountBalanceChart = () => {
    const [chartData, setChartData] = useState([]);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        // Calling your AccountController.java @GetMapping("/balances")
        axios.get('http://localhost:8080/api/accounts/balances')
            .then(response => {
                // Formatting data for Recharts
                const formattedData = response.data.map(item => ({
                    name: item.accountCode,
                    value: Math.abs(item.balance) // Ensuring positive values for the chart
                }));
                setChartData(formattedData);
            })
            .catch(error => console.error("Error fetching balances:", error));
    }, []);

    return (
        <div style={{ width: '100%', height: 400 }}>
            <h3>Account Distribution</h3>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={chartData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AccountBalanceChart;