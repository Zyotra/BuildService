const checkSize = async (repoUrl:string): Promise<boolean | void> => {
    const repoArray=repoUrl.split('/');
    const username=repoArray[3];
    const repoName=repoArray[4];
    try {
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
        const data = await response.json();
        if (data.size) {
            const sizeInMB = parseFloat((data.size / 1024).toFixed(2));
            if(sizeInMB > 100){
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error("Error in checkSize:", error);
        return false;
    }
}
export default checkSize;