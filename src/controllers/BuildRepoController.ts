import { Context } from "elysia";
import { StatusCode } from "../types/types";
import { spawn } from "bun";
import fs from "fs"
const buildRepoController = async ({ body, set }: Context) => {
    const req = body as { repoId: string,buildCommand: string, startCommand: string, outputDir: string, projectType: string, packageInstallerCommand: string };
    try {
        const repoId = req.repoId;
        let p = spawn({
            cmd: req.packageInstallerCommand.split(" "),
            cwd: `./cloned-repo/${repoId}`,
            stdout: "pipe",
            stderr: "pipe"
        });
        for await (const chunk of p.stdout) {
            console.log(chunk.toString());
        }
        let errorOutput = "";
        for await (const chunk of p.stderr) {
            errorOutput += chunk.toString();
        }
        if (errorOutput) {
            console.log("Error during npm install:", errorOutput);
            //fs.rmdirSync(`./cloned-repo/${repoId}`, { recursive: true });
            set.status = StatusCode.INTERNAL_SERVER_ERROR
            return {
                message: "Error during npm install",
                error: errorOutput
            }
        }
        p = spawn({
            cmd: req.buildCommand.split(" "),
            cwd: `./cloned-repo/${repoId}`,
            stdout: "pipe",
            stderr: "pipe"
        });
        for await (const chunk of p.stdout) {
            console.log(chunk.toString());
        }
        errorOutput = "";
        for await (const chunk of p.stderr) {
            errorOutput += chunk.toString();
        }
        if (errorOutput) {
            console.log("Error during build:", errorOutput);
            //fs.rmdirSync(`./cloned-repo/${repoId}`, { recursive: true });
            set.status = StatusCode.INTERNAL_SERVER_ERROR
            return {
                message: "Error during build",
                error: errorOutput
            }
        }
        if (fs.existsSync(`./cloned-repo/${repoId}/${req.outputDir}`)) {
            return {
                message: "Project built successfully",
                repoId: repoId,
                outputDir: req.outputDir,
                startCommand: req.startCommand
            }
        } else {
            set.status = StatusCode.INTERNAL_SERVER_ERROR
            //fs.rmdirSync(`./cloned-repo/${repoId}`, { recursive: true });
            return {
                message: "Build output directory does not exist.",
                error: "Invalid output directory." + req.outputDir + " not found."
            }
        }
    } catch (error) {
        console.log("Error while building the project:");
        //fs.rmdirSync(`./cloned-repo/${req.repoId}`, { recursive: true });
        set.status = StatusCode.INTERNAL_SERVER_ERROR
        return {
            message: "Error while building the project",
            error
        }
    }
}
export default buildRepoController;