import { Context } from "elysia";
import { StatusCode } from "../types/types";
import simpleGit from "simple-git";
import generateId from "../utils/generateId";
import checkUrl from "../utils/checkUrl";
import checkSize from "../utils/checkSize";
const cloneRepoController = async ({ body, set }: Context) => {
    const req = body as { repoUrl: string,packageInstallerCommand?:string,buildCommand?:string,startCommand?:string,outputDir?:string,projectType?:string };
    try {
        if (!req.repoUrl) {
            set.status = StatusCode.FORBIDDEN
            return {
                message: "Repository URL is required"
            }
        }
        const isValidRepo = await checkUrl(req.repoUrl);
        if (!isValidRepo) {
            set.status = StatusCode.BAD_REQUEST
            return {
                message: "Invalid repository URL"
            }
        }
        const isSizeValid = await checkSize(req.repoUrl);
        if (!isSizeValid) {
            set.status = StatusCode.BAD_REQUEST
            return {
                message: "Repository size exceeds the limit of 100MB"
            }
        }
        const id = generateId();
        await simpleGit().clone(req.repoUrl, `./cloned-repo/${id}`)
        if(req.projectType==="PlainHTML"){
            return {
                message: "Repository cloned successfully",
                repoId: id,
                buildCommand: "",
                startCommand: "",
                outputDir: "",
                projectType: req.projectType || "PlainHTML",
                packageInstallerCommand: ""
            }
        }
        return {
            message: "Repository cloned successfully",
            repoId: id,
            buildCommand: req.buildCommand || "npm run build",
            startCommand: req.startCommand || "npm start",
            outputDir: req.outputDir || "dist",
            projectType: req.projectType || "React",
            packageInstallerCommand: req.packageInstallerCommand || "npm install"
        }
    } catch (error) {
        console.error("Error in cloneRepoController:", error);
        set.status = StatusCode.INTERNAL_SERVER_ERROR
        return {
            message: "Error working with repository",
            error
        }
    }
}
export default cloneRepoController;