import mongoose from 'mongoose';

const trackingReportSchema = new mongoose.Schema({
    brand_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    brand_info: {
        brand_name: String,
        name_variants: [String],
        analysis_date: Date
    },
    generalized_metrics: {
        visibility_score: Number,
        presence_score: Number,
        average_rank: Number,
        total_mentions: Number,
        responses_found_in: Number
    },
    prompt_performance: [{
        prompt: String,
        visibility_score: Number,
        target_brand_rank: Number,
        target_brand_found: Boolean,
        total_mentions: Number
    }],
    competitor_analysis: [{
        brand: String,
        total_mentions: Number,
        average_rank: Number,
        overlaps_with_target: Number,
        overlap_rate: Number,
        avg_sentiment: Number
    }],
    ai_model_performance: [{
        model: String,
        visibility_score: Number,
        presence_score: Number,
        average_rank: Number,
        total_mentions: Number,
        avgRank_LLM: Number,
        mentions_LLM: Number
    }],
    raw_responses: [],
    used_mock_data: Boolean,
    created_at: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('TrackingReport', trackingReportSchema);