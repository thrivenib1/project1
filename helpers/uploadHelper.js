var logger = require('../services/loggerService').infoLog;
var multer = require('multer');

module.exports = {
    storagePath: multer.diskStorage({
        //The destination image folder
        destination: function (req, file, cb) {
            if (file.originalname.split(".")[1] == ("jpg" || "jpeg" || "png")) {
                cb(null, 'public/images/profile');
            } else {
                logger.info("file type >> " + file.originalname.split(".")[1]);
                cb("Invalid File Type", false);
            }
        },
        //filename used for saving an image(the file will be replaced)
        //validate the filename(expecting only png/jpg/jpeg files)
        filename: function (req, file, cb) {
            cb(null, req.user[0].emp_code + ".jpg");
        }
    })
};