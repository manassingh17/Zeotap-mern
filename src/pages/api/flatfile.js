import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';

const upload = multer({ dest: 'uploads/' });

export const config = {
    api: {
        bodyParser: false, // Disable body parsing for file uploads
    },
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        upload.single('file')(req, {}, async (err) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            const filePath = path.join(process.cwd(), req.file.path);
            const results = [];

            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    fs.unlinkSync(filePath); // Clean up the uploaded file
                    res.status(200).json({ success: true, data: results });
                });
        });
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}