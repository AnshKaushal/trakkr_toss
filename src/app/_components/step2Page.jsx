"use client"

import React, { useState, useEffect } from "react"
import {
  Loader2,
  BarChart3,
  TrendingUp,
  Target,
  Users,
  Award,
  AlertCircle,
  RotateCcw,
  Save,
  Settings,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react"
import { generateTrackingReport, saveTrackingReport } from "../../api/axios.js"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const Step2Page = ({ brandId, brandData, email, onBackToStep1, onReset }) => {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Graph selection states
  const [selectedCompetitors, setSelectedCompetitors] = useState([])
  const [showGraphSettings, setShowGraphSettings] = useState(false)
  const [availableCompetitors, setAvailableCompetitors] = useState([])
  const [showAllOverlap, setShowAllOverlap] = useState(false)

  useEffect(() => {
    if (report && report.competitor_analysis) {
      const topFive = report.competitor_analysis.slice(0, 5)
      setSelectedCompetitors(topFive.map((comp) => comp.brand))
      setAvailableCompetitors(report.competitor_analysis)
    }
  }, [report])

  const handleGenerateReport = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await generateTrackingReport(brandId || "mock-brand-id")

      if (response.success) {
        setReport(response.data)
      } else {
        setError(response.message || "Failed to generate report")
      }
    } catch (err) {
      console.error("Error generating report:", err)
      setError("An unexpected error occurred while generating the report")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveReport = async () => {
    if (!report) return

    setSaving(true)
    try {
      const reportData = {
        brandId,
        email,
        report,
        generatedAt: new Date().toISOString(),
      }

      const response = await saveTrackingReport(reportData)

      if (response.success) {
        toast.success("Report saved successfully!")
      } else {
        setError(response.message || "Failed to save report")
        toast.error(response.message || "Failed to save report")
      }
    } catch (err) {
      console.error("Error saving report:", err)
      setError("An unexpected error occurred while saving the report")
      toast.error("An unexpected error occurred while saving the report")
    } finally {
      setSaving(false)
    }
  }

  const toggleCompetitorSelection = (competitorBrand) => {
    setSelectedCompetitors((prev) => {
      if (prev.includes(competitorBrand)) {
        return prev.filter((brand) => brand !== competitorBrand)
      } else {
        return [...prev, competitorBrand]
      }
    })
  }

  const selectTopN = (n) => {
    const topN = availableCompetitors.slice(0, n)
    setSelectedCompetitors(topN.map((comp) => comp.brand))
  }

  const clearAll = () => {
    setSelectedCompetitors([])
  }

  const selectAll = () => {
    setSelectedCompetitors(availableCompetitors.map((comp) => comp.brand))
  }

  const getFilteredCompetitors = () => {
    return availableCompetitors.filter((comp) =>
      selectedCompetitors.includes(comp.brand)
    )
  }

  const formatSentiment = (competitor) => {
    if (competitor.sentiment_label) {
      return (
        competitor.sentiment_label.charAt(0).toUpperCase() +
        competitor.sentiment_label.slice(1)
      )
    }

    const avgSentiment = parseFloat(competitor.avg_sentiment || 0)
    if (avgSentiment > 0.33) return "Positive"
    if (avgSentiment < -0.33) return "Negative"
    return "Neutral"
  }

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    subtitle,
    color = "blue",
  }) => (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 truncate">
              {title}
            </p>
            <p
              className={`text-lg sm:text-2xl font-bold truncate ${
                color === "blue"
                  ? "text-blue-600"
                  : color === "green"
                  ? "text-green-600"
                  : color === "purple"
                  ? "text-purple-600"
                  : color === "orange"
                  ? "text-orange-600"
                  : "text-blue-600"
              }`}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-3 ${
              color === "blue"
                ? "bg-blue-50"
                : color === "green"
                ? "bg-green-50"
                : color === "purple"
                ? "bg-purple-50"
                : color === "orange"
                ? "bg-orange-50"
                : "bg-blue-50"
            }`}
          >
            <Icon
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                color === "blue"
                  ? "text-blue-600"
                  : color === "green"
                  ? "text-green-600"
                  : color === "purple"
                  ? "text-purple-600"
                  : color === "orange"
                  ? "text-orange-600"
                  : "text-blue-600"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const GraphSettingsModal = () =>
    showGraphSettings && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <CardHeader className="pb-3 sm:pb-4 border-b border-slate-200">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base sm:text-lg text-slate-900">
                  Select Competitors for Charts
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Choose which competitors to display in the comparison charts
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGraphSettings(false)}
                className="text-slate-500 hover:text-slate-700 h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-150px)] sm:max-h-[calc(90vh-200px)]">
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectTopN(5)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
              >
                Top 5
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectTopN(10)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
              >
                Top 10
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="border-green-200 text-green-700 hover:bg-green-50 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="border-red-200 text-red-700 hover:bg-red-50 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
              >
                Clear All
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
              Selected:{" "}
              <span className="font-medium">{selectedCompetitors.length}</span>{" "}
              competitors
            </p>

            <div className="space-y-2">
              {availableCompetitors.map((competitor, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                    selectedCompetitors.includes(competitor.brand)
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200"
                  }`}
                  onClick={() => toggleCompetitorSelection(competitor.brand)}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div
                      className={`w-3 h-3 sm:w-4 sm:h-4 rounded border-2 sm:mr-3 flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                        selectedCompetitors.includes(competitor.brand)
                          ? "border-blue-500 bg-blue-500"
                          : "border-slate-300"
                      }`}
                    >
                      {selectedCompetitors.includes(competitor.brand) && (
                        <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-slate-900 text-sm sm:text-base truncate block">
                        {competitor.brand}
                      </span>
                      <div className="text-xs text-slate-500 truncate">
                        {competitor.total_mentions} mentions • Avg Rank:{" "}
                        {competitor.average_rank || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 pt-3 sm:pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setShowGraphSettings(false)}
              className="border-slate-300 text-slate-600 text-sm h-8 sm:h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowGraphSettings(false)}
              className="bg-blue-600 hover:bg-blue-700 text-sm h-8 sm:h-9"
            >
              Apply Changes
            </Button>
          </div>
        </Card>
      </div>
    )

  return (
    <div className="min-h-screen bg-white transition-all duration-300">
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                  Trakkr.ai
                </h1>
                <p className="text-xs text-slate-500">
                  Brand Intelligence Platform
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="px-3 py-1 bg-slate-50 text-slate-700 rounded-full text-xs font-medium border border-slate-200 self-start sm:self-auto">
                Step 2 of 2
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBackToStep1}
                  className="border-slate-300 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 " />
                  <span className="hidden xs:inline">Back to </span>Step 1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="border-slate-300 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                >
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 " />
                  <span className="hidden xs:inline">Start </span>Over
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {!report ? (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-500">
            <div className="text-center space-y-4 mb-8 sm:mb-12">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 border border-slate-200 rounded-2xl mb-4 sm:mb-6 transition-transform hover:scale-105 duration-300">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight px-4">
                Generate Performance Report
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-4">
                Analyze your brand's visibility across AI models and get
                comprehensive insights about your brand's performance.
              </p>
            </div>

            {brandData && (
              <Card className="max-w-3xl mx-auto border border-slate-200 shadow-sm">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl text-slate-900 flex items-center gap-2">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Brand: {brandData.brand_name}
                  </CardTitle>
                  <CardDescription>
                    Review the brand information that will be analyzed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">
                      Name Variants
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {brandData.name_variants.map((variant, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs sm:text-sm"
                        >
                          {variant}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">
                      Analysis Prompts
                    </h4>
                    <div className="space-y-2">
                      {brandData.prompts.map((prompt, index) => (
                        <div
                          key={index}
                          className="p-3 bg-slate-50 rounded-lg text-xs sm:text-sm text-slate-700 border border-slate-200"
                        >
                          <span className="font-medium text-blue-600">
                            Prompt {index + 1}:
                          </span>{" "}
                          {prompt}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="max-w-2xl mx-auto border border-red-200 bg-red-50">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm sm:text-base">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center">
              <Button
                onClick={handleGenerateReport}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base group w-full sm:w-auto"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="hidden sm:inline">
                      Generating Report... This may take a few minutes
                    </span>
                    <span className="sm:hidden">Generating...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">
                      Generate Analysis Report
                    </span>
                    <span className="sm:hidden">Generate Report</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 " />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-500">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 truncate">
                      {report?.brand_info?.brand_name || "Brand Report"}
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="font-medium">Variants:</span>
                        <span className="truncate">
                          {report?.brand_info?.name_variants?.join(", ") ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="font-medium">Analysis:</span>
                        <span className="truncate">
                          {report?.brand_info?.analysis_date
                            ? new Date(
                                report.brand_info.analysis_date
                              ).toLocaleDateString()
                            : new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setReport(null)}
                      className="border-slate-300 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                    >
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                      Generate new report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6 px-4 sm:px-0">
                Key Performance Metrics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                  value={report.generalized_metrics.average_rank || "N/A"}
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
            </div>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  AI Model Performance Comparison
                </CardTitle>
                <CardDescription>
                  How your brand performs across different AI models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {report.ai_model_performance.map((model, index) => (
                    <Card key={index} className="border border-slate-200">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg text-slate-900">
                          {model.model}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 text-sm">
                            Visibility Score:
                          </span>
                          <span className="font-medium text-blue-600">
                            {model.visibility_score}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 text-sm">
                            Presence Score:
                          </span>
                          <span className="font-medium text-green-600">
                            {model.presence_score}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 text-sm">
                            Average Rank:
                          </span>
                          <span className="font-medium text-purple-600">
                            {model.avgRank_LLM !== null &&
                            model.avgRank_LLM !== undefined
                              ? model.avgRank_LLM
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 text-sm">
                            Total Mentions:
                          </span>
                          <span className="font-medium text-orange-600">
                            {model.mentions_LLM || 0}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  Top Performing Prompts
                </CardTitle>
                <CardDescription>
                  Analysis of how well each prompt performs in finding your
                  brand
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.prompt_performance.map((prompt, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-500 pl-4 py-3 bg-slate-50 rounded-r-lg"
                  >
                    <p className="font-medium text-slate-900 mb-2">
                      {prompt.prompt}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-md font-medium ${
                          prompt.visibility_score > 50
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        Visibility: {prompt.visibility_score}
                      </span>
                      <span className="text-slate-600">
                        Rank: {prompt.target_brand_rank || "Not found"}
                      </span>
                      <span className="text-slate-600">
                        Mentions: {prompt.total_mentions}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-md font-medium ${
                          prompt.target_brand_found
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {prompt.target_brand_found ? "Found" : "Not Found"}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl text-slate-900">
                  Top Competitor Analysis
                </CardTitle>
                <CardDescription>
                  How your competitors are performing in AI model responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Mobile card layout */}
                <div className="space-y-4 sm:hidden">
                  {report.competitor_analysis
                    .slice(0, 10)
                    .map((competitor, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          index === 0
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              #{index + 1}
                            </span>
                            <span className="font-medium text-slate-900">
                              {competitor.brand}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              formatSentiment(competitor) === "Positive"
                                ? "bg-green-100 text-green-800"
                                : formatSentiment(competitor) === "Negative"
                                ? "bg-red-100 text-red-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {formatSentiment(competitor)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-slate-500">Mentions:</span>
                            <span className="font-medium text-slate-900 ml-1">
                              {competitor.total_mentions}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Avg Rank:</span>
                            <span className="font-medium text-slate-900 ml-1">
                              {competitor.average_rank || "N/A"}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-500">
                              Overlap Rate:
                            </span>
                            <span className="font-medium text-slate-900 ml-1">
                              {competitor.overlap_rate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Desktop table layout */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-3 py-3 sm:px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-3 py-3 sm:px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Brand
                        </th>
                        <th className="px-3 py-3 sm:px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Total Mentions
                        </th>
                        <th className="px-3 py-3 sm:px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Avg Rank
                        </th>
                        <th className="px-3 py-3 sm:px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Overlap Rate
                        </th>
                        <th className="px-3 py-3 sm:px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Sentiment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {report.competitor_analysis
                        .slice(0, 10)
                        .map((competitor, index) => (
                          <tr
                            key={index}
                            className={`${
                              index === 0 ? "bg-yellow-50" : "hover:bg-slate-50"
                            } transition-colors duration-150`}
                          >
                            <td className="px-3 py-4 sm:px-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              #{index + 1}
                            </td>
                            <td className="px-3 py-4 sm:px-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              {competitor.brand}
                            </td>
                            <td className="px-3 py-4 sm:px-4 whitespace-nowrap text-sm text-slate-600">
                              {competitor.total_mentions}
                            </td>
                            <td className="px-3 py-4 sm:px-4 whitespace-nowrap text-sm text-slate-600">
                              {competitor.average_rank || "N/A"}
                            </td>
                            <td className="px-3 py-4 sm:px-4 whitespace-nowrap text-sm text-slate-600">
                              {competitor.overlap_rate}%
                            </td>
                            <td className="px-3 py-4 sm:px-4 whitespace-nowrap text-sm text-slate-600">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  formatSentiment(competitor) === "Positive"
                                    ? "bg-green-100 text-green-800"
                                    : formatSentiment(competitor) === "Negative"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-slate-100 text-slate-800"
                                }`}
                              >
                                {formatSentiment(competitor)}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex md:flex-row flex-col justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-slate-900">
                      Competitor Comparison Charts
                    </CardTitle>
                    <CardDescription>
                      Visual comparison of competitor performance metrics
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowGraphSettings(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white md:mt-0 mt-4"
                  >
                    <Settings className="w-4 h-4" />
                    Customize Charts ({selectedCompetitors.length} selected)
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedCompetitors.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">
                      No competitors selected for comparison.
                    </p>
                    <Button
                      onClick={() => setShowGraphSettings(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Select Competitors
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">
                        Total Mentions Comparison
                      </h4>
                      <div className="flex flex-wrap items-center justify-center gap-4">
                        {(() => {
                          const filteredCompetitors = getFilteredCompetitors()
                          const maxMentions = Math.max(
                            ...filteredCompetitors.map((c) => c.total_mentions),
                            1
                          )
                          return filteredCompetitors.map((competitor, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col items-center w-32"
                            >
                              <span className="font-medium text-slate-700 mb-2 text-sm text-center h-8 flex items-center">
                                {competitor.brand}
                              </span>
                              <div className="w-full h-24 bg-blue-50 rounded-lg border border-blue-100 flex items-end p-1">
                                <div
                                  style={{
                                    height: `${
                                      (competitor.total_mentions /
                                        maxMentions) *
                                      100
                                    }%`,
                                    background: "#2563eb",
                                    width: "100%",
                                    borderRadius: "4px",
                                    minHeight:
                                      competitor.total_mentions > 0
                                        ? "4px"
                                        : "0px",
                                  }}
                                />
                              </div>
                              <span className="text-xs text-slate-500 mt-2">
                                {competitor.total_mentions} mentions
                              </span>
                            </div>
                          ))
                        })()}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">
                        Average Rank Comparison
                      </h4>
                      <div className="flex flex-wrap items-center justify-center gap-4">
                        {(() => {
                          const filteredCompetitors =
                            getFilteredCompetitors().filter(
                              (c) =>
                                c.average_rank !== null &&
                                c.average_rank !== "N/A"
                            )
                          if (filteredCompetitors.length === 0) {
                            return (
                              <p className="text-slate-500 py-8">
                                No rank data available for selected competitors
                              </p>
                            )
                          }
                          const maxRank = Math.max(
                            ...filteredCompetitors.map(
                              (c) => parseFloat(c.average_rank) || 0
                            ),
                            1
                          )
                          return filteredCompetitors.map((competitor, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col items-center w-32"
                            >
                              <span className="font-medium text-slate-700 mb-2 text-sm text-center h-8 flex items-center">
                                {competitor.brand}
                              </span>
                              <div className="w-full h-24 bg-purple-50 rounded-lg border border-purple-100 flex items-end p-1">
                                <div
                                  style={{
                                    height: `${
                                      ((parseFloat(competitor.average_rank) ||
                                        0) /
                                        maxRank) *
                                      100
                                    }%`,
                                    background: "#7c3aed",
                                    width: "100%",
                                    borderRadius: "4px",
                                    minHeight: "4px",
                                  }}
                                />
                              </div>
                              <span className="text-xs text-slate-500 mt-2">
                                Rank: {competitor.average_rank}
                              </span>
                            </div>
                          ))
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  Competitor Overlap
                </CardTitle>
                <CardDescription>
                  How often competitors appear alongside your brand in responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Brand
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Overlaps
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Overlap Rate
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Avg Sentiment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(showAllOverlap
                        ? report.competitor_analysis
                        : report.competitor_analysis.slice(0, 5)
                      ).map((competitor, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50 transition-colors duration-150"
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {competitor.brand}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                            {competitor.overlaps_with_target}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                            {competitor.overlap_rate}%
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                formatSentiment(competitor) === "Positive"
                                  ? "bg-green-100 text-green-800"
                                  : formatSentiment(competitor) === "Negative"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {formatSentiment(competitor)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {report.competitor_analysis.length > 5 && (
                  <div className="text-center mt-4 pt-4 border-t border-slate-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllOverlap((v) => !v)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      {showAllOverlap
                        ? "Show Less"
                        : `Show More (${
                            report.competitor_analysis.length - 5
                          } more)`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  Prompt Winners
                </CardTitle>
                <CardDescription>
                  Which brand ranks first for each prompt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const uniquePrompts = new Map()

                    report.raw_responses.forEach((resp) => {
                      if (!uniquePrompts.has(resp.prompt)) {
                        uniquePrompts.set(
                          resp.prompt,
                          resp.ranked_brands[0]?.brand || "N/A"
                        )
                      }
                    })

                    return Array.from(uniquePrompts).map(
                      ([prompt, winner], idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex-1">
                            <span className="font-medium text-blue-700 text-sm">
                              {prompt}:
                            </span>
                          </div>
                          <div>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                              {winner}
                            </span>
                          </div>
                        </div>
                      )
                    )
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  Prompt Opportunities
                </CardTitle>
                <CardDescription>
                  Areas where your brand visibility can be improved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.prompt_performance
                    .filter((p) => !p.target_brand_found)
                    .map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-red-700 block">
                            {p.prompt}
                          </span>
                          <span className="text-red-600 text-sm">
                            Your brand was not found for this prompt.
                          </span>
                        </div>
                      </div>
                    ))}
                  {report.prompt_performance.filter(
                    (p) => !p.target_brand_found
                  ).length === 0 && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-green-700 font-medium">
                        Excellent! Your brand was found for all prompts.
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="pt-4 sm:pt-6">
              <Button
                onClick={handleSaveReport}
                disabled={saving || !report}
                className="w-full h-10 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white group text-sm sm:text-base"
                size="lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="hidden sm:inline">Saving Report...</span>
                    <span className="sm:hidden">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">
                      Save Report to Dashboard
                    </span>
                    <span className="sm:hidden">Save Report</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        <GraphSettingsModal />
      </div>
    </div>
  )
}

export default Step2Page
