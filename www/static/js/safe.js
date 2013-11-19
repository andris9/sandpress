var JsonFormatter = {
    stringify: function (cipherParams) {
        // create json object with ciphertext
        var jsonObj = {
            ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
        };

        // optionally add iv and salt
        if (cipherParams.iv) {
            jsonObj.iv = cipherParams.iv.toString();
        }
        if (cipherParams.salt) {
            jsonObj.s = cipherParams.salt.toString();
        }

        // stringify json object
        return JSON.stringify(jsonObj);
    },

    parse: function (jsonStr) {
        // parse json string
        var jsonObj = JSON.parse(jsonStr);

        // extract ciphertext from json object, and create cipher params object
        var cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
        });

        // optionally extract iv and salt
        if (jsonObj.iv) {
            cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
        }
        if (jsonObj.s) {
            cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
        }

        return cipherParams;
    }
};

function ajaxRequest(url, otp, method, payload, callback){
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function(){
        var data;
        if(xmlhttp.readyState == 4){
            try{
                data = JSON.parse(xmlhttp.responseText);
                if(!data || !data.status){
                    return callback(new Error(data && data.error || "Error: response " + xmlhttp.status));
                }
                return callback(null, data.data);
            }catch(E){
                alert(E.message)
                callback(new Error("Invalid response from server"));
            }
        }
    }
    xmlhttp.open(method, url, true);
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.setRequestHeader("X-Auth-OTP", otp);

    if(payload){
        xmlhttp.send(typeof payload == "object" ? JSON.stringify(payload) : payload);
    }else{
        xmlhttp.send();
    }

}

function store(){
    var pass = document.getElementById("pass").value,
        otp = document.getElementById("otp-save").value,
        data = document.getElementById("data").value;
    document.getElementById("otp-save").value = "";

    $("#save-btn").button('loading');

    var encrypted = CryptoJS.AES.encrypt(data, pass, { format: JsonFormatter });
    ajaxRequest("/api/safe", otp, "POST", encrypted.toString(), function(err, response){

        $("#save-btn").button('reset');

        if(err){
            alert("Error: " + err.message);
        }else{
            alert("Data encrypted and stored using provided encryption password");
        }

    });
};

function load(){
    var pass = document.getElementById("pass").value,
        otp = document.getElementById("otp-load").value;
    document.getElementById("otp-load").value = "";

    $("#load-btn").button('loading');

    ajaxRequest("/api/safe", otp, "GET", false, function(err, response){

        $("#load-btn").button('reset');

        if(err){
            alert(err.message);
        }else{
            try{
                document.getElementById("data").value = CryptoJS.AES.decrypt(JSON.stringify(response), pass, { format: JsonFormatter }).toString(CryptoJS.enc.Utf8);
                alert("Data loaded and decrypted using provided encryption password");
            }catch(E){
                alert("Error decrypting data\n" + E.message);
            }
        }

    });
};