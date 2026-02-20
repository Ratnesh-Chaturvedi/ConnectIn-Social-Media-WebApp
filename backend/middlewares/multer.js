import multer from "multer";


// cb -> callback
const storage = multer.diskStorage({
})

export const upload = multer({ storage})

