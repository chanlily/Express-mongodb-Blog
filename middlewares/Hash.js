module.exports = {
    aesEncrypt: function aesEncrypt(data, key) {
        var string = JSON.stringify(data);
        string=string+key;
        var sha1 = crypto.createHash('sha1');
        sha1.update(string);
        var crypted  = sha1.digest('hex');
        return crypted;
    }
};