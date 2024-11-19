export const trackMiddleware = (req, res, next) => {
    // Logging or tracking middleware if needed
    console.log(`Tracking visit from IP: ${req.ip}`);
    next();
};
