// controllers/trackingController.js - Debug Version
import axios from "axios"
import Brand from "../models/brands.js"
import TrackingReport from "../models/trackingReport.js"
import { Groq } from "groq-sdk"
const groq = new Groq({ apiKey: process.env.GROQ_API })
import OpenAI from "openai"
const openai = new OpenAI({ apiKey: process.env.OPENAI_API })

const generateTrackingPrompt = (prompt, brandInfo) => {
  return `You are analyzing brand visibility and ranking for the following prompt: "${prompt}"
            
        Target Brand Information:
        - Brand Name: ${brandInfo.brand_name}
        - Name Variants: ${brandInfo.name_variants.join(", ")}
        - Description: ${brandInfo.description}
            
        Please provide a ranked list of the top 10 brands/companies that would appear for this search query. Include the target brand if it's relevant to this query.
            
        For each brand in your response, provide:
        1. Brand name
        2. Rank position (1-10)
        3. Number of times mentioned/relevance score (1-10)
        4. Brief explanation of why it ranks at this position
        5. Sentiment towards the brand (positive/neutral/negative)
            
        Respond ONLY in the following JSON format:
        {
          "prompt": "${prompt}",
          "analysis_date": "${new Date().toISOString()}",
          "ranked_brands": [
            {
              "brand": "Brand Name",
              "rank": 1,
              "mentions": 8,
              "explanation": "Brief explanation of ranking",
              "sentiment": "positive"
            }
          ],
          "total_brands_found": 10,
          "target_brand_found": true,
          "target_brand_rank": 1
        }`
}

const callMistralForTracking = async (prompt, brandInfo) => {
  try {
    const trackingPrompt = generateTrackingPrompt(prompt, brandInfo)

    const response = await axios.post(
      `https://api.mistral.ai/v1/agents/completions`,
      {
        agent_id: process.env.MISTRAL_AGENT_ID,
        messages: [
          {
            role: "user",
            content: trackingPrompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_2}`,
          "Content-Type": "application/json",
        },
      }
    )

    const content = response.data.choices[0].message.content

    try {
      let cleaned = content.trim()
      if (cleaned.startsWith("```")) {
        cleaned = cleaned
          .replace(/^```json/i, "")
          .replace(/^```/, "")
          .replace(/```$/, "")
          .trim()
      }
      return JSON.parse(cleaned)
    } catch (parseError) {
      console.error("Failed to parse Mistral tracking response:", content)
      throw new Error("Invalid JSON response from Mistral tracking agent")
    }
  } catch (error) {
    console.error(
      "Mistral tracking API error:",
      error.response?.data || error.message
    )
    throw error
  }
}

const callGroqLlamaForTracking = async (prompt, brandInfo) => {
  try {
    const trackingPrompt = generateTrackingPrompt(prompt, brandInfo)

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: trackingPrompt }],
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0].message.content.trim()
    const cleaned = content
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim()
    return JSON.parse(cleaned)
  } catch (err) {
    console.error("Groq SDK error in callGroqLlamaForTracking:", err)
    throw err
  }
}

const callOpenAIForTracking = async (prompt, brandInfo) => {
  try {
    const trackingPrompt = generateTrackingPrompt(prompt, brandInfo)

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: trackingPrompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 1,
      max_tokens: 1024,
    })

    const content = completion.choices[0].message.content.trim()
    return JSON.parse(content)
  } catch (error) {
    console.error("OpenAI API error:", error.response?.data || error.message)
    throw error
  }
}

const calculateGeneralizedMetrics = (responses, brandInfo) => {
  // console.log(`\n=== CALCULATING GENERALIZED METRICS ===`);
  // console.log(`Total responses received: ${responses.length}`);
  // console.log(`Brand variants: ${brandInfo.name_variants.join(', ')}`);

  const targetBrandVariants = brandInfo.name_variants.map((v) =>
    v.toLowerCase()
  )

  // Track unique prompts where brand was found
  const foundPrompts = new Set()
  let totalVisibilityScore = 0
  let totalMentions = 0
  let totalRankSum = 0
  let foundResponsesCount = 0

  // Process all responses in a single pass
  responses.forEach((response, index) => {
    // console.log(`\nProcessing response ${index + 1}:`);
    // console.log(`Prompt: "${response.prompt}"`);
    // console.log(`Ranked brands count: ${response.ranked_brands?.length || 0}`);

    if (!Array.isArray(response.ranked_brands)) {
      console.log(`No ranked_brands array in response ${index + 1}`)
      return
    }

    const targetBrand = response.ranked_brands.find((brand) => {
      const brandNameLower = brand.brand.toLowerCase()
      const match = targetBrandVariants.some((variant) =>
        brandNameLower.includes(variant)
      )
      if (match) {
        console.log(
          `Found target brand: "${brand.brand}" (rank: ${brand.rank}, mentions: ${brand.mentions})`
        )
      }
      return match
    })

    if (targetBrand) {
      foundPrompts.add(response.prompt)
      foundResponsesCount++

      const mentions = targetBrand.mentions || 0
      const rank = targetBrand.rank || 9

      totalMentions += mentions
      totalRankSum += rank

      const visibilityScore = Math.max(0, 110 - rank * 10)
      totalVisibilityScore += visibilityScore

      // console.log(`Added mentions: ${mentions}, rank: ${rank}, visibility: ${visibilityScore}`);
    } else {
      // console.log(`Target brand NOT found in response ${index + 1}`);
      // console.log(`Available brands: ${response.ranked_brands.map(b => b.brand).join(', ')}`);
    }
  })

  const foundInPrompts = foundPrompts.size
  const totalUniquePrompts = new Set(responses.map((r) => r.prompt)).size

  // console.log(`\n=== FINAL CALCULATIONS ===`);
  // console.log(`Found in unique prompts: ${foundInPrompts}`);
  // console.log(`Total unique prompts: ${totalUniquePrompts}`);
  // console.log(`Total responses: ${responses.length}`);
  // console.log(`Found responses count: ${foundResponsesCount}`);

  // Calculate averages
  const avgVisibilityScore =
    foundResponsesCount > 0
      ? Math.round(totalVisibilityScore / foundResponsesCount)
      : 0
  const cappedVisibilityScore = Math.min(avgVisibilityScore, 100)
  const presenceScore = Math.round((foundInPrompts / totalUniquePrompts) * 100)
  const avgRank =
    foundResponsesCount > 0
      ? parseFloat((totalRankSum / foundResponsesCount).toFixed(1))
      : null

  const result = {
    visibility_score: cappedVisibilityScore,
    presence_score: Math.min(presenceScore, 100),
    average_rank: avgRank,
    total_mentions: Math.max(0, totalMentions),
    responses_found_in: foundInPrompts,
    total_prompts: totalUniquePrompts,
  }

  console.log(`Result:`, result)
  return result
}

const calculateSpecificLLMmetrics = (responses, brandInfo) => {
  const variants = (brandInfo.name_variants || []).map((v) => v.toLowerCase())
  let mentionCount = 0
  let totalRankSum = 0
  let numRankedEntries = 0

  responses.forEach((response) => {
    if (!Array.isArray(response.ranked_brands)) return

    response.ranked_brands.forEach((brandObj) => {
      const name = String(brandObj?.brand || "").toLowerCase()
      if (variants.some((v) => name.includes(v))) {
        mentionCount += 1

        const rank = brandObj.rank || 10
        totalRankSum += rank
        numRankedEntries++
      }
    })
  })

  const avgRank =
    numRankedEntries > 0
      ? parseFloat((totalRankSum / numRankedEntries).toFixed(1))
      : null

  return {
    mentions: mentionCount,
    rank_LLM: avgRank,
  }
}

const generateCompetitorAnalysis = (responses, brandInfo) => {
  const competitorMap = new Map()
  const targetBrandVariants = brandInfo.name_variants.map((v) =>
    v.toLowerCase()
  )
  const totalUniquePrompts = new Set(responses.map((r) => r.prompt)).size

  responses.forEach((response) => {
    if (!Array.isArray(response.ranked_brands)) return

    const targetBrandFound = response.ranked_brands.some((brand) =>
      targetBrandVariants.some((variant) =>
        brand.brand.toLowerCase().includes(variant)
      )
    )

    response.ranked_brands.forEach((brand) => {
      const isTargetBrand = targetBrandVariants.some((variant) =>
        brand.brand.toLowerCase().includes(variant)
      )

      if (!isTargetBrand) {
        if (!competitorMap.has(brand.brand)) {
          competitorMap.set(brand.brand, {
            name: brand.brand,
            total_mentions: 0,
            total_ranks: [],
            overlaps_with_target: 0,
            sentiment_scores: [],
            appearances: 0,
          })
        }

        const competitor = competitorMap.get(brand.brand)
        competitor.total_mentions += brand.mentions || 0
        competitor.total_ranks.push(brand.rank)
        competitor.appearances++

        if (targetBrandFound) {
          competitor.overlaps_with_target++
        }

        let sentimentScore
        const sentimentValue = brand.sentiment?.toLowerCase()
        switch (sentimentValue) {
          case "positive":
            sentimentScore = 1
            break
          case "negative":
            sentimentScore = -1
            break
          case "neutral":
          default:
            sentimentScore = 0
            break
        }
        competitor.sentiment_scores.push(sentimentScore)
      }
    })
  })

  const competitors = Array.from(competitorMap.values()).map((comp) => {
    const validRanks = comp.total_ranks.filter(
      (rank) => typeof rank === "number"
    )
    const avgRank =
      validRanks.length > 0
        ? parseFloat(
            (validRanks.reduce((a, b) => a + b, 0) / validRanks.length).toFixed(
              1
            )
          )
        : null

    const overlapRate = Math.min(
      Math.round((comp.overlaps_with_target / totalUniquePrompts) * 100),
      100
    )

    const avgSentiment =
      comp.sentiment_scores.length > 0
        ? parseFloat(
            (
              comp.sentiment_scores.reduce((a, b) => a + b, 0) /
              comp.sentiment_scores.length
            ).toFixed(2)
          )
        : 0

    let sentimentLabel = "neutral"
    if (avgSentiment > 0.33) sentimentLabel = "positive"
    else if (avgSentiment < -0.33) sentimentLabel = "negative"

    return {
      brand: comp.name,
      total_mentions: Math.max(0, comp.total_mentions),
      average_rank: avgRank,
      overlaps_with_target: comp.overlaps_with_target,
      overlap_rate: overlapRate,
      avg_sentiment: avgSentiment,
      sentiment_label: sentimentLabel,
      appearances: comp.appearances,
    }
  })

  competitors.sort((a, b) => b.total_mentions - a.total_mentions)

  return competitors.slice(0, 30) // Top 30 competitors
}

const analyzePromptPerformance = (responses, brandInfo) => {
  const targetBrandVariants = brandInfo.name_variants.map((v) =>
    v.toLowerCase()
  )

  const unique = responses.filter(
    (r, i, arr) => arr.findIndex((x) => x.prompt === r.prompt) === i
  )

  const promptAnalysis = unique
    .map((response) => {
      if (!Array.isArray(response.ranked_brands)) return null

      const targetBrandData = response.ranked_brands.find((brand) =>
        targetBrandVariants.some((variant) =>
          brand.brand.toLowerCase().includes(variant)
        )
      )

      const visibilityScore = targetBrandData
        ? Math.max(0, 110 - targetBrandData.rank * 10)
        : 0

      return {
        prompt: response.prompt,
        visibility_score: visibilityScore,
        target_brand_rank: targetBrandData?.rank || null,
        target_brand_found: !!targetBrandData,
        total_mentions: targetBrandData?.mentions || 0,
      }
    })
    .filter(Boolean)

  promptAnalysis.sort((a, b) => b.visibility_score - a.visibility_score)

  return promptAnalysis
}

export const generateTrackingReport = async (req, res) => {
  try {
    const { brandId } = req.body

    if (!brandId) {
      return res.status(400).json({
        success: false,
        message: "Brand ID is required",
      })
    }

    const brand = await Brand.findById(brandId)

    // console.log(`GENERATING TRACKING REPORT`);
    // console.log(`Brand: ${brand.brand_name}`);
    // console.log(`Variants: ${brand.name_variants.join(', ')}`);
    // console.log(`Prompts to process: ${brand.prompts.length}`);
    brand.prompts.forEach((prompt, i) => console.log(`  ${i + 1}. ${prompt}`))

    const mistralResponses = []
    const groqResponses = []
    const openaiResponses = []
    let usedMockData = false

    // Process prompts through all models
    for (let i = 0; i < brand.prompts.length; i++) {
      const prompt = brand.prompts[i]
      console.log(
        `Processing prompt ${i + 1}/${brand.prompts.length}: "${prompt}"`
      )

      // Mistral
      try {
        console.log(`Calling Mistral...`)
        const mistralResp = await callMistralForTracking(prompt, brand)
        mistralResponses.push(mistralResp)
        console.log(`Mistral completed`)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Mistral error:`, error.message)
        const mockResponse = {
          prompt: prompt,
          analysis_date: new Date().toISOString(),
          ranked_brands: [
            {
              brand: "Mock Brand A",
              rank: 1,
              mentions: 8,
              explanation: "Mock data",
              sentiment: "positive",
            },
            {
              brand: brand.brand_name,
              rank: 4,
              mentions: 5,
              explanation: "Target brand",
              sentiment: "positive",
            },
            {
              brand: "Mock Brand B",
              rank: 2,
              mentions: 7,
              explanation: "Mock data",
              sentiment: "neutral",
            },
            {
              brand: "Mock Brand C",
              rank: 3,
              mentions: 6,
              explanation: "Mock data",
              sentiment: "negative",
            },
          ],
          total_brands_found: 4,
          target_brand_found: true,
          target_brand_rank: 4,
        }
        mistralResponses.push(mockResponse)
        usedMockData = true
      }

      // Groq Llama
      try {
        console.log(`Calling Groq...`)
        const groqResp = await callGroqLlamaForTracking(prompt, brand)
        groqResponses.push(groqResp)
        console.log(`Groq completed`)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Groq error:`, error.message)
        const mockResponse = {
          prompt: prompt,
          analysis_date: new Date().toISOString(),
          ranked_brands: [
            {
              brand: "Mock Brand X",
              rank: 2,
              mentions: 6,
              explanation: "Mock data",
              sentiment: "positive",
            },
            {
              brand: brand.brand_name,
              rank: 5,
              mentions: 4,
              explanation: "Target brand",
              sentiment: "positive",
            },
            {
              brand: "Mock Brand Y",
              rank: 1,
              mentions: 9,
              explanation: "Mock data",
              sentiment: "neutral",
            },
          ],
          total_brands_found: 3,
          target_brand_found: true,
          target_brand_rank: 5,
        }
        groqResponses.push(mockResponse)
        usedMockData = true
      }

      // OpenAI
      try {
        console.log(`Calling OpenAI...`)
        const openaiResp = await callOpenAIForTracking(prompt, brand)
        openaiResponses.push(openaiResp)
        console.log(`OpenAI completed`)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`OpenAI error:`, error.message)
        const mockResponse = {
          prompt: prompt,
          analysis_date: new Date().toISOString(),
          ranked_brands: [
            {
              brand: brand.brand_name,
              rank: 2,
              mentions: 7,
              explanation: "Target brand",
              sentiment: "positive",
            },
            {
              brand: "Mock Brand Z",
              rank: 1,
              mentions: 8,
              explanation: "Mock data",
              sentiment: "positive",
            },
            {
              brand: "Mock Brand W",
              rank: 3,
              mentions: 5,
              explanation: "Mock data",
              sentiment: "neutral",
            },
          ],
          total_brands_found: 3,
          target_brand_found: true,
          target_brand_rank: 2,
        }
        openaiResponses.push(mockResponse)
        usedMockData = true
      }
    }

    // console.log(`Mistral responses: ${mistralResponses.length}`);
    // console.log(`Groq responses: ${groqResponses.length}`);
    // console.log(`OpenAI responses: ${openaiResponses.length}`);

    // Combine responses and calculate metrics
    const allResponses = [
      ...mistralResponses,
      ...groqResponses,
      ...openaiResponses,
    ]
    // console.log(`Total responses: ${allResponses.length}`);

    const generalizedMetrics = calculateGeneralizedMetrics(allResponses, brand)
    const competitorAnalysis = generateCompetitorAnalysis(allResponses, brand)
    const promptPerformance = analyzePromptPerformance(allResponses, brand)

    // Calculate AI model performance
    // console.log(`\nCALCULATING AI MODEL PERFORMANCE`);

    const mistralMetrics = calculateGeneralizedMetrics(mistralResponses, brand)
    const mistralSpecific = calculateSpecificLLMmetrics(mistralResponses, brand)

    const groqMetrics = calculateGeneralizedMetrics(groqResponses, brand)
    const groqSpecific = calculateSpecificLLMmetrics(groqResponses, brand)

    const openaiMetrics = calculateGeneralizedMetrics(openaiResponses, brand)
    const openaiSpecific = calculateSpecificLLMmetrics(openaiResponses, brand)

    const aiModelPerformance = [
      {
        model: "Mistral",
        visibility_score: mistralMetrics.visibility_score,
        presence_score: mistralMetrics.presence_score,
        average_rank: mistralMetrics.average_rank,
        total_mentions: mistralMetrics.total_mentions,
        avgRank_LLM: mistralSpecific.rank_LLM,
        mentions_LLM: mistralSpecific.mentions,
      },
      {
        model: "Llama (Groq)",
        visibility_score: groqMetrics.visibility_score,
        presence_score: groqMetrics.presence_score,
        average_rank: groqMetrics.average_rank,
        total_mentions: groqMetrics.total_mentions,
        avgRank_LLM: groqSpecific.rank_LLM,
        mentions_LLM: groqSpecific.mentions,
      },
      {
        model: "OpenAI",
        visibility_score: openaiMetrics.visibility_score,
        presence_score: openaiMetrics.presence_score,
        average_rank: openaiMetrics.average_rank,
        total_mentions: openaiMetrics.total_mentions,
        avgRank_LLM: openaiSpecific.rank_LLM,
        mentions_LLM: openaiSpecific.mentions,
      },
    ]

    // console.log(`\nres`);
    // console.log(`Generalized metrics:`, generalizedMetrics);
    // console.log(`AI model performance:`, aiModelPerformance);

    // Generate final report
    const report = {
      brand_id: brandId,
      brand_info: {
        brand_name: brand.brand_name,
        name_variants: brand.name_variants,
        analysis_date: new Date().toISOString(),
      },
      generalized_metrics: generalizedMetrics,
      prompt_performance: promptPerformance,
      competitor_analysis: competitorAnalysis,
      ai_model_performance: aiModelPerformance,
      raw_responses: allResponses,
      used_mock_data: usedMockData,
      generated_at: new Date().toISOString(),
    }

    // Save report to database (create a fresh copy without _id)
    const reportToSave = { ...report }
    delete reportToSave._id
    delete reportToSave.__v

    const savedReport = await TrackingReport.create(reportToSave)

    console.log("Tracking report generated and saved successfully")

    res.json({
      success: true,
      data: savedReport,
    })
  } catch (error) {
    console.error("Generate tracking report error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const saveTrackingReport = async (req, res) => {
  try {
    const { report } = req.body

    if (!report || !report.brand_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid report data",
      })
    }

    // Remove _id and __v fields to avoid duplicate key errors
    const reportData = { ...report }
    delete reportData._id
    delete reportData.__v

    // Add timestamp for when the report was saved manually
    reportData.saved_at = new Date().toISOString()

    // Check if a similar report already exists (optional - for duplicate prevention)
    // You can uncomment this if you want to prevent duplicate saves
    /*
        const existingReport = await TrackingReport.findOne({
            brand_id: reportData.brand_id,
            'brand_info.analysis_date': reportData.brand_info?.analysis_date
        });

        if (existingReport) {
            return res.json({
                success: true,
                data: existingReport,
                message: "Report already exists, returning existing report"
            });
        }
        */

    const savedReport = await TrackingReport.create(reportData)

    res.json({
      success: true,
      data: savedReport,
      message: "Report saved successfully",
    })
  } catch (error) {
    console.error("Save tracking report error:", error)

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A report with this data already exists. Please try generating a new report.",
      })
    }

    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Add a new function to get existing reports for a brand
export const getBrandReports = async (req, res) => {
  try {
    const { brandId } = req.params

    if (!brandId) {
      return res.status(400).json({
        success: false,
        message: "Brand ID is required",
      })
    }

    const reports = await TrackingReport.find({ brand_id: brandId })
      .sort({ generated_at: -1 })
      .limit(10)

    res.json({
      success: true,
      data: reports,
    })
  } catch (error) {
    console.error("Get brand reports error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
