import { Context } from "elysia";
import path from "path";
import uploadFile from "../bucket/uploadFile";
import { StatusCode } from "../types/types";

const uploadBuildController=async({body,set}:Context)=>{
    const req=body as {repoId:string,outputDir:string,startCommand:string};
    const repoPath="./cloned-repo/"+req.repoId;
    try{
        await uploadFile(path.join(repoPath, req.outputDir));
        set.status=StatusCode.OK
        return {
            message: "Files uploaded successfully to bucket",
            repoId: req.repoId,
            startCommand: req.startCommand
        }
    }catch(error){
        console.error("Error in uploadController:", error);
        set.status=StatusCode.INTERNAL_SERVER_ERROR;
        return {
            message: "Error uploading files to bucket",
            error
        }
    }
}
export default uploadBuildController;