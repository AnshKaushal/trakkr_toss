// middleware\validation.js

export const validateBrandId = (req, res, next) => {
    const brandId = req.body.brandId || req.params.brandId;
    
    if (!brandId) {
        return res.status(400).json({
            success: false,
            message: 'Brand ID is required'
        });
    }

    // Add brandId to request object
    req.brandId = brandId;
    next();
};