const fs = require('fs');
const path = require('path');

const structure = {
    "public": [],
    "src": {
        "pages": {
            "api": ["clickhouse.js", "flatfile.js", "ingest.js"],
            "": ["index.js", "clickhouse.js", "flatfile.js"]
        },
        "components": [
            "SourceSelector.js",
            "ClickHouseForm.js",
            "FlatFileForm.js",
            "ColumnSelector.js",
            "StatusMessage.js"
        ],
        "lib": ["clickhouseClient.js", "csvUtils.js", "ingestUtils.js"],
        "styles": ["globals.css"]
    },
    "": [".env.local", "next.config.js", "tailwind.config.js", "postcss.config.js", "package.json", "README.md"]
};

function createStructure(basePath, structure) {
    for (const key in structure) {
        const fullPath = path.join(basePath, key);
        if (Array.isArray(structure[key])) {
            // Create folder and files
            if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
            structure[key].forEach(file => {
                const filePath = path.join(fullPath, file);
                if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '', 'utf8');
            });
        } else {
            // Create folder and recurse
            if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
            createStructure(fullPath, structure[key]);
        }
    }
}

const basePath = path.resolve(__dirname);
createStructure(basePath, structure);

console.log("Workspace structure created successfully!");