let errorHandler = (err, req, res,next) => {
    console.log(err)
    res.status(400).setHeader('Cache-Control', 'no-cache').send()
}

module.exports = errorHandler;

