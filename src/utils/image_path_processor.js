export function getImageSource(path) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return { uri: path }
    } else {
        return require(path);
    }
}