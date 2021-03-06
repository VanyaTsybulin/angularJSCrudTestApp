/**
 * Created by vanya on 03.06.15.
 */
var express = require('express');
var path = require("path");
var fs = require('fs');
var port = 7777;
var databasePath = 'database';
app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'app')));

readDirectory = function(dir) {
    var array = fs.readdirSync(dir);
    return array;
};

listDirectory = function(dir, filesList) {
    var array = [];
    filesList.forEach(function(file) {
        //var static = fs.readFileSync(dir + '/' + file,'utf8');
        var obj = JSON.parse(fs.readFileSync(dir + '/' + file, 'utf8'));
        array.push(obj);
    });
    return array;
};
app.get('/', function(req, res) {
    res.sendfile(path.join(__dirname + '/index.html'));
});

app.get('/get-customers', function(req, res) {
    var dirContent = readDirectory(databasePath);
    var result = listDirectory(databasePath, dirContent);
    res.send(JSON.stringify(result));
});

app.get('/manage-customer/:id', function(req, res) {
    var customerId = req.params.id;
    var dirContent = readDirectory(databasePath);
    var result = listDirectory(databasePath, dirContent);
    for (var i = 0; i < result.length; i++) {
        if (result[i].id == customerId) {
            res.send(JSON.stringify(result[i]));
        }
    }

});



app.post('/manage-customer', function(req, res) {
    var obj = req.body;
    var dirContent = readDirectory(databasePath);
    var result = listDirectory(databasePath, dirContent);
    var ifCustomerExists = null;
    var fileId = result.length + 1;
    var fileName = obj.inputName + '.json';
    var fileContent = {
        "id": (fileId) ? fileId : "",
        "name": (obj.inputName) ? obj.inputName : "",
        "email": (obj.inputEmail) ? obj.inputEmail : "",
        "telephone": (obj.inputTelephone) ? obj.inputTelephone : "",
        "address": (obj.inputAddress) ? obj.inputAddress : "",
        "street": (obj.inputStreet) ? obj.inputStreet : "",
        "city": (obj.inputCity) ? obj.inputCity : "",
        "state": (obj.inputState) ? obj.inputState : "",
        "zip": (obj.inputZip) ? obj.inputZip : ""
    };
    fs.writeFileSync(databasePath + '/' + fileName, JSON.stringify(fileContent));
    res.end("yes");
});
app.delete('/manage-customer/:id', function(req, res) {
    var customerId = req.params.id;
    var dirContent = readDirectory(databasePath);
    var result = listDirectory(databasePath, dirContent);
    for (var i = 0; i < result.length; i++) {
        if (result[i].id == customerId) {
            fs.unlinkSync(databasePath + '/' + dirContent[i])
        }
    }
});
app.put('/manage-customer', function(req, res) {
    var obj = req.body;
    var id = obj.id;
    var dirContent = readDirectory(databasePath);
    var result = listDirectory(databasePath, dirContent);
    for (var i = 0; i < result.length; i++) {
        if (result[i].id == id) {
            //write to file
            fs.writeFileSync(databasePath + '/' + result[i].name + '.json', JSON.stringify(obj));
            //rename file
            fs.renameSync(databasePath + '/' + result[i].name + '.json', databasePath + '/' + obj.name + '.json');
        }
    }
});
app.listen(port);