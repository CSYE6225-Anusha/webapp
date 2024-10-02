let errorHandler = (err, req, res,next) => {
    console.log(err)
    res.status(400).send()
}

module.exports = errorHandler;

