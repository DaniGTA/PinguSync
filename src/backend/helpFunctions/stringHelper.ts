class StringHelper {
    public async reverseString(s: string): Promise<string> {
        var splitString = s.split("");
        var reversedArray = splitString.reverse();
        return reversedArray.join("");
    }
}

export default new StringHelper();