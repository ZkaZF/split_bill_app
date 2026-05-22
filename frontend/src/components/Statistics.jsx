import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// Modern Fintech color palette
const COLORS_DARK  = ['#19d0e8', '#44ccff', '#34D399', '#F59E0B', '#A78BFA', '#6EE7B7', '#FBBF24', '#F87171', '#22D3EE', '#C4B5FD'];
const COLORS_LIGHT = ['#7C3AED', '#0e7490', '#10B981', '#F59E0B', '#06B6D4', '#34D399', '#8B5CF6', '#EF4444', '#F87171', '#06B6D4'];

// SVG Icons
const ChartPieIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
);

const Statistics = ({ expenses, members, isDarkMode = true }) => {
    if (!expenses || expenses.length === 0) return null;

    const COLORS = isDarkMode ? COLORS_DARK : COLORS_LIGHT;

    // 1. Calculate Expenses by Category
    const categoryData = useMemo(() => {
        const data = {};
        expenses.forEach(exp => {
            const cat = exp.category || 'Lainnya';
            data[cat] = (data[cat] || 0) + exp.amount;
        });
        return Object.keys(data).map(key => ({
            name: key,
            value: data[key]
        }));
    }, [expenses]);

    // 2. Calculate Expenses by Member (Who paid the most?)
    const memberData = useMemo(() => {
        if (!members) return [];
        const data = {};
        members.forEach(m => data[m.id] = { name: m.name, value: 0 });

        // Initialize with 0 for all members to show them even if they paid nothing
        expenses.forEach(exp => {
            if (data[exp.paid_by_id]) {
                data[exp.paid_by_id].value += exp.amount;
            }
        });

        return Object.values(data).sort((a, b) => b.value - a.value);
    }, [expenses, members]);

    const formatRupiah = (value) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const containerStyle = {
        background: isDarkMode ? 'rgba(25,25,25,0.55)' : 'rgba(255,255,255,0.75)',
        padding: '24px',
        borderRadius: '10px',
        boxShadow: isDarkMode
            ? '0 8px 32px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.02)'
            : '0 4px 20px rgba(0,0,0,0.08)',
        minHeight: '380px',
        border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        flex: '1 1 320px',
        backdropFilter: 'blur(16px)'
    };

    const titleStyle = {
        textAlign: 'center',
        marginBottom: '24px',
        fontSize: '13px',
        fontWeight: '500',
        fontFamily: 'DM Mono, monospace',
        color: isDarkMode ? '#7f7f7f' : '#666666',
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
    };

    const tooltipStyle = {
        backgroundColor: isDarkMode ? 'rgba(25,25,25,0.95)' : 'rgba(255,255,255,0.97)',
        border: isDarkMode ? '1px solid rgba(25,208,232,0.3)' : '1px solid rgba(0,0,0,0.1)',
        color: isDarkMode ? '#ffffff' : '#111111',
        borderRadius: '8px',
        boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)',
        padding: '12px 16px',
        fontFamily: 'DM Mono, monospace',
        fontSize: '13px'
    };

    const legendStyle = {
        color: isDarkMode ? '#7f7f7f' : '#666666',
        fontSize: '12px',
        fontFamily: 'DM Mono, monospace'
    };

    // Custom label for pie chart
    const renderCustomLabel = ({ percent }) => {
        return `${(percent * 100).toFixed(0)}%`;
    };

    return (
        <div className="statistics-container" style={{ marginTop: '32px', marginBottom: '32px' }}>
            <div className="section-title" style={{ marginBottom: '20px' }}>
                <ChartPieIcon className="section-icon" style={{ width: 20, height: 20 }} />
                Statistik Pengeluaran
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>

                {/* Pie Chart - By Category */}
                <div style={containerStyle}>
                    <h3 style={titleStyle}>Per Kategori</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={85}
                                innerRadius={40}
                                fill="#8884d8"
                                dataKey="value"
                                label={renderCustomLabel}
                                stroke='rgba(0,0,0,0.6)'
                                strokeWidth={2}
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => formatRupiah(value)}
                                contentStyle={tooltipStyle}
                                itemStyle={{ color: isDarkMode ? '#ffffff' : '#111111' }}
                            />
                            <Legend
                                wrapperStyle={legendStyle}
                                iconType="circle"
                                iconSize={10}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart - By Payer */}
                <div style={containerStyle}>
                    <h3 style={titleStyle}>Siapa Paling Banyak Talangan?</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={memberData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                                stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                            />
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={80}
                                tick={{
                                    fill: isDarkMode ? '#7f7f7f' : '#666666',
                                    fontSize: '12px',
                                    fontFamily: 'DM Mono, monospace'
                                }}
                                axisLine={{ stroke: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                                tickLine={false}
                            />
                            <Tooltip
                                formatter={(value) => formatRupiah(value)}
                                cursor={{ fill: isDarkMode ? 'rgba(25,208,232,0.08)' : 'rgba(124,58,237,0.06)' }}
                                contentStyle={tooltipStyle}
                                itemStyle={{ color: isDarkMode ? '#ffffff' : '#111111' }}
                            />
                            <Bar
                                dataKey="value"
                                radius={[0, 8, 8, 0]}
                                maxBarSize={40}
                            >
                                {memberData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
};

export default Statistics;
