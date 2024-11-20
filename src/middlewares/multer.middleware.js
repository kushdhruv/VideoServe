import multer from "multer"

//MULTER
//Multer is a Node.js middleware used for handling multipart/form-data, which is primarily utilized for uploading files.
 //It is built on top of the busboy library and makes file uploading straightforward by allowing developers to specify storage options, limits, and file filters. 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,"./public/temp") // cb is callback funct
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
  const upload = multer({ 
    storage: storage 
})