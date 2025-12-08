import fs from "fs";
import path from "path";
import getDockerFileContent from "./getDockerFileContent";
import { ProjectType } from "../types/types";

function injectDockerfile(projectPath: string, projectType: ProjectType) {

    const dockerfilePath = path.join(projectPath, "Dockerfile");
    const dockerfileContent=getDockerFileContent(projectType)
    if (fs.existsSync(dockerfilePath)) {
        console.log("Dockerfile already exists. Skipping injection.");
        return;
    }
    fs.writeFileSync(dockerfilePath, dockerfileContent, { encoding: "utf8" });
    console.log("Dockerfile injected successfully!");
}

export default injectDockerfile;
