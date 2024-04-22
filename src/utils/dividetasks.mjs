const divideString = (str) => {
    const dividedArray = str.split('$');
    return dividedArray;
};

const inputString = 'Hello$world$how$are$you';
const dividedParts = divideString(inputString);
console.log(dividedParts);