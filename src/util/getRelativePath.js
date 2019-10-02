/**
 * @file 获取两个文件的相对路径
 */

module.exports = function getRelativePath(fileA, fileB) {
    let arr1 = fileA.split('/').reverse();
    let arr2 = fileB.split('/').reverse();

    let pathSame = '';
    let pathSameIndex = 0;
    for (let i = 1; i < arr1.length; i++) {
        let parentIndex = arr2.findIndex(e => e === arr1[i]);
        if (parentIndex > -1) {
            pathSameIndex = parentIndex;
            break;
        } else {
            pathSame += '../';
        }
    }

    let pathDiff = arr2.slice(0, pathSameIndex).reverse().join('/');
    return pathSame + pathDiff;
};
