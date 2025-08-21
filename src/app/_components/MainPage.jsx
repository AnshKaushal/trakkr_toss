"use client"

import React, { useState } from "react"
import {
  Loader2,
  Plus,
  X,
  ArrowRight,
  Globe,
  Mail,
  Save,
  ChevronRight,
} from "lucide-react"
import { analyzeBrand, saveBrand } from "../../api/axios.js"
import Step2Page from "./step2Page.jsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const MainPage = () => {
  const [email, setEmail] = useState("")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [brandData, setBrandData] = useState(null)
  const [editedData, setEditedData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [savedBrandId, setSavedBrandId] = useState(null)

  const handleAnalyzeBrand = async (brandUrl) => {
    setLoading(true)
    try {
      const response = await analyzeBrand(brandUrl)

      if (response.success) {
        setBrandData(response.data)
        setEditedData(response.data)
      } else {
        toast.error(
          response.message || "Error analyzing brand. Please try again."
        )
      }
    } catch (error) {
      console.error("Error analyzing brand:", error)
      toast.error("Error analyzing brand. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (!email.trim() || !url.trim()) return
    handleAnalyzeBrand(url)
  }

  const updateNameVariants = (index, value) => {
    const newVariants = [...editedData.name_variants]
    newVariants[index] = value
    setEditedData({ ...editedData, name_variants: newVariants })
  }

  const addNameVariant = () => {
    setEditedData({
      ...editedData,
      name_variants: [...editedData.name_variants, ""],
    })
  }

  const removeNameVariant = (index) => {
    if (editedData.name_variants.length <= 1) return
    const newVariants = editedData.name_variants.filter((_, i) => i !== index)
    setEditedData({ ...editedData, name_variants: newVariants })
  }

  const updatePrompt = (index, value) => {
    const newPrompts = [...editedData.prompts]
    newPrompts[index] = value
    setEditedData({ ...editedData, prompts: newPrompts })
  }

  const saveBrandData = async () => {
    setSaving(true)
    try {
      const brandDataToSave = {
        user_email: email,
        brand_url: url,
        brand_name: editedData.brand_name,
        name_variants: editedData.name_variants,
        description: editedData.description,
        prompts: editedData.prompts,
      }

      const response = await saveBrand(brandDataToSave)

      if (response.success) {
        setSavedBrandId(response.data._id)
        setCurrentStep(2)
      } else {
        toast.error(response.message || "Error saving data. Please try again.")
      }
    } catch (error) {
      console.error("Error saving brand data:", error)
      toast.error("Error saving data. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setUrl("")
    setBrandData(null)
    setEditedData(null)
    setCurrentStep(1)
    setSavedBrandId(null)
  }

  const goBackToStep1 = () => {
    setCurrentStep(1)
  }

  if (currentStep === 2) {
    return (
      <Step2Page
        brandId={savedBrandId}
        brandData={editedData}
        email={email}
        onBackToStep1={goBackToStep1}
        onReset={resetForm}
      />
    )
  }

  return (
    <div className="min-h-screen bg-white transition-all duration-300">
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">
                  G
                </span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                  GEO Trakkr
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Brand Intelligence Platform
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm text-slate-500">
              <span className="px-2 sm:px-3 py-1 bg-slate-50 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
                Step 1 of 2
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {!brandData ? (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-500">
            <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 border border-slate-200 rounded-2xl mb-4 sm:mb-6 transition-transform hover:scale-105 duration-300">
                <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight px-4">
                Analyze Your Brand
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-4">
                Enter your brand information to get comprehensive analysis and
                insights. Our AI will extract key data points to help you track
                your brand's visibility.
              </p>
            </div>

            <Card className="max-w-lg mx-4 sm:mx-auto border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl text-slate-900">
                  Get Started
                </CardTitle>
                <CardDescription className="text-slate-600">
                  We'll analyze your brand's online presence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@company.com"
                    className="h-10 sm:h-11 border-slate-200"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="url"
                    className="text-sm font-medium text-slate-700 flex items-center gap-2"
                  >
                    <Globe className="w-4 h-4 text-blue-600" />
                    Brand Website URL
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourcompany.com"
                    className="h-10 sm:h-11 border-slate-200 duration-200"
                    disabled={loading}
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || !email.trim() || !url.trim()}
                  className="w-full h-10 sm:h-11 bg-blue-600 hover:bg-blue-700 group text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Brand...
                    </>
                  ) : (
                    <>
                      Analyze Brand
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Review Brand Information
                </h2>
                <p className="text-slate-600 mt-1">
                  Verify and edit the extracted information before proceeding
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span className="truncate">{url}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-slate-300 text-slate-600 hover:bg-slate-50 w-full sm:w-auto"
              >
                Start Over
              </Button>
            </div>

            <div className="grid gap-6 sm:gap-8">
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg text-slate-900">
                    Brand Name
                  </CardTitle>
                  <CardDescription>
                    The primary name of your brand
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    value={editedData.brand_name}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        brand_name: e.target.value,
                      })
                    }
                    className="h-10 sm:h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    placeholder="Enter brand name"
                  />
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg text-slate-900">
                    Name Variants
                  </CardTitle>
                  <CardDescription>
                    Alternative names or spellings for your brand
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {editedData.name_variants.map((variant, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 sm:gap-3"
                    >
                      <Input
                        value={variant}
                        onChange={(e) =>
                          updateNameVariants(index, e.target.value)
                        }
                        className="h-9 sm:h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder={`Variant ${index + 1}`}
                      />
                      {editedData.name_variants.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNameVariant(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 w-9 sm:h-10 sm:w-10 p-0 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addNameVariant}
                    className="border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 " />
                    Add Variant
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg text-slate-900">
                    Brand Description
                  </CardTitle>
                  <CardDescription>
                    A comprehensive description of your brand
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editedData.description}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        description: e.target.value,
                      })
                    }
                    rows={5}
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                    placeholder="Describe your brand, its mission, values, and key offerings..."
                  />
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg text-slate-900">
                    Visibility Prompts
                  </CardTitle>
                  <CardDescription>
                    These prompts will be used to track your brand's visibility
                    across different LLMs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editedData.prompts.map((prompt, index) => (
                    <div key={index} className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Prompt {index + 1}
                      </Label>
                      <Input
                        value={prompt}
                        onChange={(e) => updatePrompt(index, e.target.value)}
                        className="h-9 sm:h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder={`Enter prompt ${index + 1}`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="pt-4 sm:pt-6">
                <Button
                  onClick={saveBrandData}
                  disabled={saving}
                  className="w-full h-11 sm:h-12 bg-blue-600 hover:bg-blue-700 group text-sm sm:text-base"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin " />
                      Saving Brand Data...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 sm:w-5 sm:h-5 " />
                      Save & Continue to Step 2
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 " />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MainPage
