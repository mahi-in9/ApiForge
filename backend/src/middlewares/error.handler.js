const errorHandler = async (err, req, res, next) => {

    const message = err.message || "system error";

    const status = err.status || 500;

    return res.status(status).json({success: false, message})

}

module.exports = errorHandler;