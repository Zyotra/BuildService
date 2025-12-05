import s3 from "./s3";
import path from "path";
import fs from "fs";

const uploadFile = async (filePath: string) => {
    console.log(filePath)

    // Check if path exists
    if (!fs.existsSync(filePath)) {
        throw new Error(`Path does not exist: ${filePath}`);
    }

    const dirArray = filePath.split("/");
    const repoId = dirArray[dirArray.length - 2];

    // Recursive function to upload files
    const uploadDirectory = async (currentPath: string, prefix: string = "") => {
        // Check if directory still exists before reading
        if (!fs.existsSync(currentPath)) {
            console.warn(`Skipping non-existent path: ${currentPath}`);
            return;
        }

        const items = fs.readdirSync(currentPath);

        for (const item of items) {
            const fullPath = path.join(currentPath, item);

            // Check if item exists before stating
            if (!fs.existsSync(fullPath)) {
                console.warn(`Skipping non-existent item: ${fullPath}`);
                continue;
            }

            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // Recursively upload subdirectory
                await uploadDirectory(fullPath, `${prefix}${item}/`);
            } else {
                // Upload file
                const fileStream = fs.createReadStream(fullPath);
                const uploadParams = {
                    Bucket: process.env.BUCKET_NAME || "",
                    Key: `${repoId}/${prefix}${item}`,
                    Body: fileStream,
                };
                await s3.putObject(uploadParams);
            }
        }
    };

    await uploadDirectory(filePath);
    return true;
};

export default uploadFile;