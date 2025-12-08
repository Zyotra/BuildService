import { nodeDockerFile, goDockerFile, nodeTypeScriptDockerFile, rubyDockerFile, javaDockerFile, dotnetDockerFile, pythonDockerFile, phpDockerFile } from "./dockerFileTemplates";
import { ProjectType } from "../types/types";
const getDockerFileContent = (projectType: ProjectType) => {
    switch (projectType) {
        case "nodejs":
            return nodeDockerFile;
        case "nodejs-typescript":
            return nodeTypeScriptDockerFile;
        case "python":
            return pythonDockerFile;
        case "go":
            return goDockerFile;
        case "ruby":
            return rubyDockerFile;
        case "java":
            return javaDockerFile;
        case "dotnet":
            return dotnetDockerFile;
        case "php":
            return phpDockerFile
        default:
            return nodeDockerFile;
    }
};

export default getDockerFileContent;
