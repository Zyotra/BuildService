import path from "path";
import fs from "fs";
const checkRepoId = async(repoId: string): Promise<boolean | void> => {
    const repoPath=path.join(__dirname, `../../cloned-repo/${repoId}`);
    if(fs.existsSync(repoPath)){
        return true;
    }else{
        return false;
    }
}
export default checkRepoId;