String.prototype.geohashToRGB = function (alpha) {
    let alphabetToRGBNumber = function (char) {
        let alphabets = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
        'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
         't', 'u', 'v', 'w', 'x', 'y', 'z'];
         let rgbunit = 255 / alphabets.length;
         return parseInt(alphabets.indexOf(char)*rgbunit) || 0;
    }
    let numberToRGBNumber = function (num) {
        if (255 >= num) {
            return num;
        }
        return parseInt(num%255);
    }
    let stringToRGBNumber = function (str) {
        var num = '';
        for (i = 0; i < str.length; i++) {
            num = num + '' + alphabetToRGBNumber(str[i]);
        }
        return numberToRGBNumber(num);
    }

    let toRGBNumber = function (str) {
        return isNaN(Number(str)) ? stringToRGBNumber(str): numberToRGBNumber(str);
    }
    var r,g,b;
    r = toRGBNumber(this[0]);
    g = toRGBNumber(this[1] || 0);
    b = toRGBNumber(this[2] || 0);

    if (alpha) {
        return 'rgba(' + parseInt(r) + ',' + parseInt(g) + ',' + parseInt(b) + ',' + alpha + ')';
    }
    return 'rgb(' + r + ',' + g + ',' + 'b' + ')';
}