var express = require('express');
var app = express();
var path = require('path');
const https = require('https');
var request = require("request");
var rp = require('request-promise');
var Promise = require("bluebird");
var fs = require('fs');
var port = process.env.PORT || 5000;

// Testing new Promise format
app.get('/html_library', function(req, res) {
    var cssContent = [];
    var htmlContent = [];
    var optionTop = { 
        method: 'GET',
        url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/library_pieces/library_top.html',
        headers: {
            'cache-control': 'no-cache',
            Authorization: process.env.githubKey,
            'user-agent': 'Request-Promise'
        },
        json: true
    };
    var optionsCSS = { 
        method: 'GET',
        url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/mods_css',
        headers: {
            'cache-control': 'no-cache',
            Authorization: process.env.githubKey,
            'user-agent': 'Request-Promise'
        },
        json: true
    };
    var optionMiddle = { 
        method: 'GET',
        url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/library_pieces/library_middle.html',
        headers: {
            'cache-control': 'no-cache',
            Authorization: process.env.githubKey,
            'user-agent': 'Request-Promise'
        },
        json: true
    };
    var options = { 
        method: 'GET',
        url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/mods',
        headers: {
            'cache-control': 'no-cache',
            Authorization: process.env.githubKey,
            'user-agent': 'Request-Promise'
        },
        json: true
    };
    var optionBottom = { 
        method: 'GET',
        url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/library_pieces/library_bottom.html',
        headers: {
            'cache-control': 'no-cache',
            Authorization: process.env.githubKey,
            'user-agent': 'Request-Promise'
        },
        json: true
    };

    var file = __dirname + '/mod_library/hotwire_library.html';

    // Delete hotwire_library.html if it exist
    if(fs.existsSync(file)) {
        fs.unlinkSync(file, function (err) {
            if (err) throw err;
            console.log("File hotwire_library.html was deleted!");
        });
    }

    rp(optionTop)
        .then(function(topData) {
            var buff = Buffer.alloc(topData.size, topData.content, 'base64');
            var text = buff.toString("ascii");

            fs.writeFileSync('mod_library/hotwire_library.html', text, function (err) {
                if (err) throw err;
                console.log('Saved!');
            });

            return;
        })
        .then(function() {
            // Input all the unique css for each mod that has it
            return rp(optionsCSS)
                .then(function(cssFiles) {
                    // Setting up the API options to call each CSS file
                    var cssAPIs = [];
                    for(var i = 0; i < cssFiles.length; i++) {
                        var singleCssAPI = {
                            method: 'GET',
                            url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/mods_css/' + cssFiles[i].name,
                            headers: {
                                'cache-control': 'no-cache',
                                Authorization: process.env.githubKey,
                                'user-agent': 'Request-Promise'
                            },
                            json: true
                        }

                        cssAPIs.push(singleCssAPI);
                    }

                    return cssAPIs;
                })
                .then(function(cssAPIs) {
                    // Creating an array of Promises for the CSS files
                    var cssPromises = [];
                    for(var i = 0; i < cssAPIs.length; i++) {
                        var initalPromise = new Promise(function(resolve, reject) {
                            rp(cssAPIs[i])
                                .then(function(result) {
                                    var arr = [result.name];
                                    var buff = Buffer.alloc(result.size, result.content, 'base64');
                                    var text = buff.toString("ascii");

                                    arr.push(text);

                                    cssContent.push(arr);

                                    resolve();
                                })
                                .catch(function(err) {
                                    console.log(err);
                                })
                        })

                        cssPromises.push(initalPromise);
                    }

                    return cssPromises;
                })
                .then(function(cssPromises) {
                    // Call Promise.all for the CSS files
                    return Promise.all(cssPromises)
                        .then(function(results) {
                            console.log(results);
                            console.log("promise.all for CSS finshed");

                            return;
                        })
                        .catch(function(err) {
                            console.log("Promise.all for CSS has failed");
                            console.log(err);
                        })
                    
                })
        })
        .then(function() {
            // Sort and write css code to the new file
            cssContent.sort();
            for(var i = 0; i < cssContent.length; i++) {
                fs.appendFileSync('mod_library/hotwire_library.html', cssContent[i][1], function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                });
            }
        })
        .then(function() {
            // Inputing middle portion of html mod library
            return rp(optionMiddle)
                .then(function(middleData) {
                    var buff = Buffer.alloc(middleData.size, middleData.content, 'base64');
                    var text = buff.toString("ascii");

                    fs.appendFileSync('mod_library/hotwire_library.html', text, function (err) {
                        if (err) throw err;
                        console.log('Saved!');
                    });
                    
                    return;
                })
                .catch(function(err) {
                    console.log("Appending middle section API Failed");
                    console.log(err);
                })
        })
        .then(function() {
            // This is the main html portion of API calls and writing
            return rp(options)
                .then(function (mods) {
                    // Creating the API Headers for HTML files
                    var mulitpleAPIs = [];
                    for(var i = 0; i < mods.length; i++) {
                        if(mods[i].name !== "images") {
                            var singleAPI = {
                                method: 'GET',
                                url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/mods/' + mods[i].name,
                                headers: {
                                    'cache-control': 'no-cache',
                                    Authorization: process.env.githubKey,
                                    'user-agent': 'Request-Promise'
                                },
                                json: true
                            }
                            mulitpleAPIs.push(singleAPI);
                        }
                    }
                    return mulitpleAPIs;
                })
                .then(function (mulitpleAPIs) {
                    // Creating the new Promises
                    var promiseArr = [];
                    for(var i = 0; i < mulitpleAPIs.length; i++) {
                        var freshPromise = new Promise(function(resolve, reject) {
                            rp(mulitpleAPIs[i])
                                .then(function(result) {
                                    var arr = [result.name];
                                    var buff = Buffer.alloc(result.size, result.content, 'base64');
                                    var text = buff.toString("ascii");

                                    arr.push(text);

                                    htmlContent.push(arr);

                                    resolve();
                                })
                                .catch(function(err) {
                                    console.log(err);
                                })
                        });
                        promiseArr.push(freshPromise);
                    }
                    return promiseArr;
                })
                .then(function(promiseArr) {
                    return Promise.all(promiseArr)
                        .then(function(results) {
                            console.log(results);
                            console.log("promise.all finshed");

                            return;
                        })
                        .catch(function(err) {
                            console.log("Promise.all has failed");
                            console.log(err);
                        })
                })
                .then(function() {
                    // Sort and write css code to the new file
                    htmlContent.sort();
                    for(var i = 0; i < htmlContent.length; i++) {
                        fs.appendFileSync('mod_library/hotwire_library.html', htmlContent[i][1], function (err) {
                            if (err) throw err;
                            console.log('Saved!');
                        });
                    }
                })
                .then(function() {
                    // API call for last portion of html file requested and written into html file
                    return rp(optionBottom)
                        .then(function(result) {
                            var buff = Buffer.alloc(result.size, result.content, 'base64');
                            var text = buff.toString("ascii");

                            fs.appendFileSync('mod_library/hotwire_library.html', text, function (err) {
                                if (err) throw err;
                                console.log('Saved!');
                            });

                            return;
                        })
                        .catch(function(err) {
                            console.log(err);
                        })
                })
                .then(function() {
                    res.download(file);
                })
                .catch(function (err) {
                    console.log("API Call Failed");
                    console.log(err);
                });
        })
        .then(function(data) {
            console.log("This should be the last line to appear")
        })
        .catch(function(err) {
            console.log("This is the main err");
            console.log(err);
        })
});

app.get('/link_doc', function(req, res) {
    var linkDoc = __dirname + '/mod_library/HW_MT_LINK.xls';

    res.download(linkDoc);
});

app.get('/image_folder', function(req, res) {
    var imageFolder = __dirname + '/mod_library/images';
    
});

app.use(express.static(path.join(__dirname, 'pages')));
app.get('/', (req, res) => res.render('index'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));