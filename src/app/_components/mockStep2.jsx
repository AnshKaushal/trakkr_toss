"use client";

import React, { useState } from 'react';
import { Loader2, BarChart3, TrendingUp, Target, Users, Award, AlertCircle, ArrowLeft, RotateCcw, Save } from 'lucide-react';
import { generateTrackingReport, saveTrackingReport } from '../../api/axios.js';

const Step2Page = ({ brandId, brandData, email, onBackToStep1, onReset }) => {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    // Mock data for report
    const mockReport = {
        brand_info: {
            brand_name: "Trakkr.ai",
            name_variants: ["Trakkr AI", "Trakkr", "Trakkr.com"],
            analysis_date: new Date().toISOString()
        },
        generalized_metrics: {
            visibility_score: 85,
            presence_score: 100,
            average_rank: 2,
            total_mentions: 120,
            responses_found_in: 5
        },
        ai_model_performance: [
            { model: "Mistral", visibility_score: 88, presence_score: 95, average_rank: 1.5, total_mentions: 60 },
            { model: "Llama (Groq)", visibility_score: 80, presence_score: 100, average_rank: 3, total_mentions: 60 }
        ],
        prompt_performance: [
            { prompt: "Top 10 English-language newspapers in India", visibility_score: 90, target_brand_rank: 1, target_brand_found: true, total_mentions: 8 },
            { prompt: "Best AI tools for social media marketing", visibility_score: 85, target_brand_rank: 2, target_brand_found: true, total_mentions: 7 }
        ],
        competitor_analysis: [
            { brand: "Brand A", total_mentions: 40, average_rank: 2, overlap_rate: 60, sentiment: "positive" },
            { brand: "Brand B", total_mentions: 35, average_rank: 3, overlap_rate: 50, sentiment: "neutral" }
        ],
        raw_responses: [
            { prompt: "Top 10 English-language newspapers in India", ranked_brands: [{ brand: "Brand A", rank: 1, mentions: 8, explanation: "Top rank", sentiment: "positive" }] }
        ]
    };

    const handleGenerateReport = async () => {
        setLoading(true);
        setError(null);

        try {
            // Set mock report data
            setReport(mockReport);
        } catch (err) {
            console.error('Error generating report:', err);
            setError('An unexpected error occurred while generating the report');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReport = async () => {
        if (!report) return;

        setSaving(true);
        try {
            const reportData = {
                brandId,
                email,
                report,
                generatedAt: new Date().toISOString()
            };

            const response = await saveTrackingReport(reportData);

            if (response.success) {
                alert('Report saved successfully!');
            } else {
                setError(response.message || 'Failed to save report');
            }
        } catch (err) {
            console.error('Error saving report:', err);
            setError('An unexpected error occurred while saving the report');
        } finally {
            setSaving(false);
        }
    };

    const MetricCard = ({ title, value, icon: Icon, subtitle, color = 'blue' }) => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <Icon className={`w-8 h-8 text-${color}-500`} />
            </div>
        </div>
    );

    // Mock data for graphs (total mentions and ranks for the competitors)
    const mentionsData = mockReport.competitor_analysis.map(competitor => competitor.total_mentions);
    const ranksData = mockReport.competitor_analysis.map(competitor => competitor.average_rank);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Trakkr.ai</h1>
                    <p className="text-gray-600">Step 2: AI Model Performance Analysis</p>

                    {/* Navigation buttons */}
                    <div className="flex justify-center space-x-4 mt-4">
                        <button
                            onClick={onBackToStep1}
                            className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Step 1
                        </button>
                        <button
                            onClick={onReset}
                            className="flex items-center text-gray-600 hover:text-gray-700 text-sm"
                        >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Start Over
                        </button>
                    </div>
                </div>

                {!report ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Generate Tracking Report</h2>

                        {/* Show brand info */}
                        {brandData && (
                            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
                                <h3 className="font-semibold text-blue-900 mb-2">Brand: {brandData.brand_name}</h3>
                                <p className="text-blue-700 text-sm mb-2">
                                    <strong>Variants:</strong> {brandData.name_variants.join(', ')}
                                </p>
                                <p className="text-blue-700 text-sm mb-2">
                                    <strong>Prompts to analyze:</strong>
                                </p>
                                <ul className="text-blue-700 text-sm list-disc list-inside">
                                    {brandData.prompts.map((prompt, index) => (
                                        <li key={index}>{prompt}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <p className="text-gray-600 mb-6">
                            Click the button below to analyze your brand's visibility across AI models using the prompts from Step 1.
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center">
                                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                    <p className="text-red-700">{error}</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Generating Report... This may take a few minutes
                                </>
                            ) : (
                                <>
                                    <BarChart3 className="w-5 h-5 mr-2" />
                                    Generate Report
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Generalized Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard
                                title="Visibility Score"
                                value={report.generalized_metrics.visibility_score}
                                icon={TrendingUp}
                                subtitle="Out of 100"
                                color="blue"
                            />
                            <MetricCard
                                title="Presence Score"
                                value={`${report.generalized_metrics.presence_score}%`}
                                icon={Target}
                                subtitle={`Found in ${report.generalized_metrics.responses_found_in}/5 responses`}
                                color="green"
                            />
                            <MetricCard
                                title="Average Rank"
                                value={report.generalized_metrics.average_rank || 'N/A'}
                                icon={Award}
                                subtitle="Lower is better"
                                color="purple"
                            />
                            <MetricCard
                                title="Total Mentions"
                                value={report.generalized_metrics.total_mentions}
                                icon={Users}
                                subtitle="Across all responses"
                                color="orange"
                            />
                        </div>

                        {/* AI Model Performance */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">AI Model Performance Comparison</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {report.ai_model_performance.map((model, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-3">{model.model}</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Visibility Score:</span>
                                                <span className="font-medium text-blue-600">{model.visibility_score}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Presence Score:</span>
                                                <span className="font-medium text-green-600">{model.presence_score}%</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Average Rank:</span>
                                                <span className="font-medium text-purple-600">{model.average_rank || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Total Mentions:</span>
                                                <span className="font-medium text-orange-600">{model.total_mentions}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mentions Bar Chart */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Total Mentions Comparison</h3>
                            <div className="flex flex-wrap gap-4">
                                {mentionsData.map((mention, idx) => (
                                    <div key={idx} className="flex flex-col items-center w-32">
                                        <span className="font-medium text-gray-700 mb-1">Brand {idx + 1}</span>
                                        <div className="w-full h-24 bg-blue-100 rounded flex items-end">
                                            <div
                                                style={{
                                                    height: `${(mention / Math.max(...mentionsData)) * 100}%`,
                                                    background: '#2563eb',
                                                    width: '100%',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1">{mention} mentions</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Average Rank Bar Chart */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Average Rank Comparison</h3>
                            <div className="flex flex-wrap gap-4">
                                {ranksData.map((rank, idx) => (
                                    <div key={idx} className="flex flex-col items-center w-32">
                                        <span className="font-medium text-gray-700 mb-1">Brand {idx + 1}</span>
                                        <div className="w-full h-24 bg-purple-100 rounded flex items-end">
                                            <div
                                                style={{
                                                    height: `${((rank || 0) / Math.max(...ranksData)) * 100}%`,
                                                    background: '#7c3aed',
                                                    width: '100%',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1">Avg Rank: {rank || 'N/A'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="pt-6 border-t border-gray-200">
                <button
                    onClick={handleSaveReport}
                    disabled={saving || !report}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Saving Report...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Save Report
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Step2Page;