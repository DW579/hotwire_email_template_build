const express = require('express');
const path = require('path');
const rp = require('request-promise');
require('dotenv').config()
const fs = require('fs');
const zip = require('express-zip');
const app = express();
const bodyParser = require('body-parser');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: false }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

// API Objects
const optionDate = {
  method: 'GET',
  url: 'https://api.github.com/repos/omccreativeservices/hotwire_template',
  headers: {
      'cache-control': 'no-cache',
      Authorization: process.env.githubKey,
      'user-agent': 'Request-Promise'
  },
  json: true
};

// All API endpoints
app.get('/date', (req, res) => {

  // Read modLibraryDate.json to know the date of mob library on local server
  fs.readFile('./whole_mod_library/modLibraryDate.json', 'utf8', (err, data) => {
    if (err) {
      throw err;
    }

    const modLibraryDate = JSON.parse(data).modLibraryDate;

    // Simplify the date on server of mod library to format: 00/00/0000
    function serverLibraryDate() {
      const serverDate = modLibraryDate.slice(5, 7) + "/" + modLibraryDate.slice(8, 10) + "/" + modLibraryDate.slice(0, 4);

      return serverDate;
    }

    // GET request to GitHub for date of mod library's last update
    rp(optionDate)
      .then(function (data) {

        // Compare GitHub date and Server date, if !== then delete library on server and GET request library from GitHub
        if(data.updated_at !== modLibraryDate) {
          const dateOfUpdate = data.updated_at.slice(5, 7) + "/" + data.updated_at.slice(8, 10) + "/" + data.updated_at.slice(0, 4);
          const gitHubDate = data.updated_at;

          // Delete old library on server and then download up to date library from GitHub
          // Promises for deleting
          const deleteImages = new Promise(function(resolve, reject) {
            fs.readdir(__dirname + '/whole_mod_library/mods/images', function (err, data) {
              if(err) {
                console.log("Error with reading images from mods folder");
                throw err;
              }

              if(data.length > 0) {
                for(let i = 0; i < data.length; i++) {
                  fs.unlink(__dirname + '/whole_mod_library/mods/images/' + data[i], function (err) {
                      if(err) {
                        throw err;
                      }
                      console.log(data[i] + " deleted");
                  });
                }
              }

              resolve();
            })
          })
          const deleteMods = new Promise(function(resolve, reject) {
            fs.readdir(__dirname + '/whole_mod_library/mods', function (err, data) {
              if(err) {
                console.log("Error with readding mods folder");
                throw err;
              }

              if(data.length > 0) {
                for(let i = 0; i < data.length; i++) {
                  if(data[i] !== "images") {
                    fs.unlink(__dirname + '/whole_mod_library/mods/' + data[i], function (err) {
                      if(err) {
                        throw err;
                      }
                      console.log(data[i] + " deleted");
                    });
                  }
                }
              }

              resolve();
            })
          });
          const deleteCssMods = new Promise(function(resolve, reject) {
            fs.readdir(__dirname + '/whole_mod_library/mods_css', function (err, data) {
              if(err) {
                console.log("Error with readding mods_css folder");
                throw err;
              }

              if(data.length > 0) {
                for(let i = 0; i < data.length; i++) {
                  fs.unlink(__dirname + '/whole_mod_library/mods_css/' + data[i], function (err) {
                      if(err) {
                        throw err;
                      }
                      console.log(data[i] + " deleted");
                  });
                }
              }

              resolve();
            })
          });
          const deleteLibraryPieces = new Promise(function(resolve, reject) {
            fs.readdir(__dirname + '/whole_mod_library/library_pieces', function (err, data) {
              if(err) {
                console.log("Error with readding library_pieces folder");
                throw err;
              }

              if(data.length > 0) {
                for(let i = 0; i < data.length; i++) {
                  fs.unlink(__dirname + '/whole_mod_library/library_pieces/' + data[i], function (err) {
                      if(err) {
                        throw err;
                      }
                      console.log(data[i] + " deleted");
                  });
                }
              }

              resolve();
            })
          });
          const deleteLinkDocs = new Promise(function(resolve, reject) {
            fs.unlink(__dirname + '/whole_mod_library/HW_MT_LINK_COMPLETE.xls', function (err) {
              if(err) {
                throw err;
              }

              console.log("HW_MT_LINK_COMPLETE.xls deleted");
            });

            fs.unlink(__dirname + '/whole_mod_library/HW_MT_LINK_SHELL.xls', function (err) {
              if(err) {
                throw err;
              }

              console.log("HW_MT_LINK_SHELL.xls deleted");
            });

            resolve();
          });

          // API header options for GitHub API and downloading the library files
          const getLibraryPieces = {
            method: 'GET',
            url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/library_pieces',
            headers: {
                'cache-control': 'no-cache',
                Authorization: process.env.githubKey,
                'user-agent': 'Request-Promise'
            },
            json: true
          };
          const getModsCSS = {
            method: 'GET',
            url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/mods_css',
            headers: {
                'cache-control': 'no-cache',
                Authorization: process.env.githubKey,
                'user-agent': 'Request-Promise'
            },
            json: true
          };
          const getImages = {
            method: 'GET',
            url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/mods/images',
            headers: {
                'cache-control': 'no-cache',
                Authorization: process.env.githubKey,
                'user-agent': 'Request-Promise'
            },
            json: true
          };
          const getMods = {
            method: 'GET',
            url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/mods',
            headers: {
                'cache-control': 'no-cache',
                Authorization: process.env.githubKey,
                'user-agent': 'Request-Promise'
            },
            json: true
          };
          const getLinkDocComplete = {
            method: 'GET',
            url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/HW_MT_LINK_COMPLETE.xls',
            headers: {
                'cache-control': 'no-cache',
                Authorization: process.env.githubKey,
                'user-agent': 'Request-Promise'
            },
            json: true
          };
          const getLinkDocShell = {
            method: 'GET',
            url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/HW_MT_LINK_SHELL.xls',
            headers: {
                'cache-control': 'no-cache',
                Authorization: process.env.githubKey,
                'user-agent': 'Request-Promise'
            },
            json: true
          };
          



          // Promise and then statements to delete all the old library files on the server
          return deleteImages.then(function() {
            return deleteMods.then(function() {
              return deleteCssMods.then(function() {
                return deleteLibraryPieces.then(function() {
                  return deleteLinkDocs.then(function() {
                    // GET requests for mod library download
                    // GET library_pieces files
                    return rp(getLibraryPieces).then(function(data) {
                      let allPromises = [];

                      for(let i = 0; i < data.length; i++) {
                        const getHeader = {
                          method: 'GET',
                          url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/library_pieces/' + data[i].name,
                          headers: {
                              'cache-control': 'no-cache',
                              Authorization: process.env.githubKey,
                              'user-agent': 'Request-Promise'
                          },
                          json: true
                        }
                        const getPromise = new Promise(function (resolve, reject) {
                          rp(getHeader).then(function(results) {
                            const buff = Buffer.alloc(results.size, results.content, 'base64');
                            const text = buff.toString("ascii");

                            fs.appendFileSync(__dirname + '/whole_mod_library/' + results.path, text, function (err) {
                              if (err) {
                                console.log("Error with writing file " + results.name);
                                throw err;
                              }
                              console.log('Saved ' + results.name + ' in folder /whole_mod_library/' + results.path);
                            });
                          })
                          .catch(function(err) {
                            console.log("Error with promise GET call to " + data[i].name);
                            throw err;
                          })

                          resolve();
                        })

                        allPromises.push(getPromise);
                      }

                      // Promise.all for library_pieces
                      return Promise.all(allPromises).then(function(results) {
                        console.log("Promise.all for library_pieces is finished");

                        // GET mods_css files
                        return rp(getModsCSS).then(function(data) {
                          let allPromises = [];

                          for(let i = 0; i < data.length; i++) {
                            const getHeader = {
                              method: 'GET',
                              url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/mods_css/' + data[i].name,
                              headers: {
                                  'cache-control': 'no-cache',
                                  Authorization: process.env.githubKey,
                                  'user-agent': 'Request-Promise'
                              },
                              json: true
                            }
                            const getPromise = new Promise(function (resolve, reject) {
                              rp(getHeader).then(function(results) {
                                const buff = Buffer.alloc(results.size, results.content, 'base64');
                                const text = buff.toString("ascii");
    
                                fs.appendFileSync(__dirname + '/whole_mod_library/' + results.path, text, function (err) {
                                  if (err) {
                                    console.log("Error with writing file " + results.name);
                                    throw err;
                                  }
                                  console.log('Saved ' + results.name + ' in folder /whole_mod_library/' + results.path);
                                });
                              })
                              .catch(function(err) {
                                console.log("Error with promise GET call to " + data[i].name);
                                throw err;
                              })
    
                              resolve();
                            })
    
                            allPromises.push(getPromise);
                          }
                          
                          // Promise.all for mods_css
                          return Promise.all(allPromises).then(function(results) {
                            console.log("Promise.all for mods_css is finished");

                            // GET images in mods
                            return rp(getImages).then(function(data) {
                              let allPromises = [];

                              for(let i = 0; i < data.length; i++) {
                                const getHeader = {
                                  method: 'GET',
                                  url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/mods/images/' + data[i].name,
                                  headers: {
                                      'cache-control': 'no-cache',
                                      Authorization: process.env.githubKey,
                                      'user-agent': 'Request-Promise'
                                  },
                                  json: true
                                }
                                const getPromise = new Promise(function (resolve, reject) {
                                  rp(getHeader).then(function(results) {
                                    const buff = Buffer.alloc(results.size, results.content, 'base64');
        
                                    fs.writeFile(__dirname + '/whole_mod_library/' + results.path, buff, 'base64', function (err) {
                                      if (err) {
                                        console.log("Error with writing file " + results.name);
                                        throw err;
                                      }
                                      console.log('Saved ' + results.name + ' in folder /whole_mod_library/' + results.path);
                                    });
                                  })
                                  .catch(function(err) {
                                    console.log("Error with promise GET call to " + data[i].name);
                                    throw err;
                                  })
        
                                  resolve();
                                })
        
                                allPromises.push(getPromise);
                              }

                              // Promise.all for images in mods
                              return Promise.all(allPromises).then(function(results) {
                                console.log("Promise.all for images in mods is finished");

                                // GET files in mods folder
                                return rp(getMods).then(function(data) {
                                  let allPromises = [];

                                  for(let i = 0; i < data.length; i++) {
                                    if(data[i].name !== 'images') {
                                      const getHeader = {
                                        method: 'GET',
                                        url: 'https://api.github.com/repos/omccreativeservices/hotwire_template/contents/mods/' + data[i].name,
                                        headers: {
                                            'cache-control': 'no-cache',
                                            Authorization: process.env.githubKey,
                                            'user-agent': 'Request-Promise'
                                        },
                                        json: true
                                      }
                                      const getPromise = new Promise(function (resolve, reject) {
                                        rp(getHeader).then(function(results) {
                                          const buff = Buffer.alloc(results.size, results.content, 'base64');
                                          const text = buff.toString("ascii");
              
                                          fs.appendFileSync(__dirname + '/whole_mod_library/' + results.path, text, function (err) {
                                            if (err) {
                                              console.log("Error with writing file " + results.name);
                                              throw err;
                                            }
                                            console.log('Saved ' + results.name + ' in folder /whole_mod_library/' + results.path);
                                          });
                                        })
                                        .catch(function(err) {
                                          console.log("Error with promise GET call to " + data[i].name);
                                          throw err;
                                        })
              
                                        resolve();
                                      })

                                      allPromises.push(getPromise);
                                    }
                                    
                                  }
                                  // Promise.all for mods
                                  return Promise.all(allPromises).then(function(results) {
                                    console.log("Promise.all for mods is finished");

                                    // GET Link Doc Complete
                                    return rp(getLinkDocComplete).then(function(results) {
                                      const buff = Buffer.alloc(results.size, results.content, 'base64');
                                      const text = buff.toString("ascii");

                                      fs.appendFileSync(__dirname + '/whole_mod_library/' + results.path, text, function (err) {
                                        if (err) {
                                          console.log("Error with writing file " + results.name);
                                          throw err;
                                        }
                                        console.log('Saved ' + results.name + ' in folder /whole_mod_library/' + results.path);
                                      });

                                      // GET Link Doc Shell
                                      return rp(getLinkDocShell).then(function(results) {
                                        const buff = Buffer.alloc(results.size, results.content, 'base64');
                                        const text = buff.toString("ascii");
                                        const newDate = {
                                          "modLibraryDate": gitHubDate
                                        }
                                        const dateStringify = JSON.stringify(newDate, null, 2);

                                        fs.appendFileSync(__dirname + '/whole_mod_library/' + results.path, text, function (err) {
                                          if (err) {
                                            console.log("Error with writing file " + results.name);
                                            throw err;
                                          }
                                          console.log('Saved ' + results.name + ' in folder /whole_mod_library/' + results.path);
                                        });

                                        // Delete and Write modLibraryDate.json to update the date
                                        fs.unlink(__dirname + '/whole_mod_library/modLibraryDate.json', (err) => {
                                          if(err) {
                                            throw err;
                                          }
                                          console.log('modLibraryDate.json was deleted');

                                          fs.writeFile(__dirname + '/whole_mod_library/modLibraryDate.json', dateStringify, (err) => {  
                                            if(err) {
                                              throw err;
                                            }
                                            console.log('newDate written to modLibraryDate.json');
                                          });
                                        });

                                        console.log("Sent current date to front end, App.js");
                                        res.json(dateOfUpdate);
                                      })
                                      .catch(function(err) {
                                        console.log("Erro with GET of Link Doc Shell")
                                      })
                                    })
                                    .catch(function(err) {
                                      console.log("Error with GET of Link Doc Complete");
                                      throw err;
                                    })
                                  })
                                  .catch(function(err) {
                                    console.log("Error with Promise.all for files to mods folder");
                                    throw err;
                                  })
                                })
                                .catch(function(err) {
                                  console.log("Error with GET call to mods folder");
                                  throw err;
                                })
                              })
                              .catch(function(err) {
                                console.log("Error with Promise.all for images in mods folder");
                                throw err;
                              })
                            })
                            .catch(function(err) {
                              console.log("Error with GET call to images in mods folder");
                              throw err;
                            })
                          })
                          .catch(function(err) {
                            console.log("Error with Promise.all for mods_css");
                            throw err;
                          })
                        })
                      })
                      .catch(function(err) {
                        console.log("Error on Promise.all for library_pieces");
                        throw err;
                      })
                    })
                    .catch(function(err) {
                      console.log("Error with GET call to library_pieces folder");
                      throw err;
                    })
                  })
                  .catch(function(err) {
                    console.log("Error with deleteLinkDocs");
                    throw err;
                  })
                })
                .catch(function(err) {
                  console.log("Error with deleteLibraryPieces");
                  throw err;
                })
              })
              .catch(function(err) {
                console.log("Error with deleteCssMods");
                throw err;
              })
            })
            .catch(function(err) {
              console.log("Error with deleteMods");
              throw err;  
            })
          })
          .catch(function(err) {
            console.log("Error with deleteImages");
            throw err;    
          })

        }
        else {
          console.log("GitHub and Server dates are same for mod library");
          res.json(serverLibraryDate());
        }
      })
      .catch(function (err) {
        console.log("Error thrown for getting the date from GitHub");
        throw err;
      })
  });

});

// Download whole mod library
app.get('/download_library', (req, res) => {
  let libraryJson = {};

  // Reused function to create an array of promises to get the content for each file
  const readFolderFunction = function(folderName) {
    return new Promise(function(resolve, reject) {
      libraryJson[folderName] = {};

      fs.readdir(__dirname + "/whole_mod_library/" + folderName, (err, data) => {
        if(err) {
          console.log("Error with reading folder " + folderName);
          throw err;
        }
        
        let arrPromises = [];

        for(let i = 0; i < data.length; i++) {
          // Checking for the images folder to skip it
          if(data[i] !== "images") {
            const freshPromise = new Promise(function(resolve, reject) {
              const fileName = data[i];
  
              fs.readFile(__dirname + "/whole_mod_library/" + folderName + "/" + fileName, (err, data) => {
                if(err) {
                  console.log("Error with reading file " + fileName);
                  throw err;
                }

                const content = "";
                
                if(folderName === "mods/images") {
                  contnet = data.toString('base64');
                }
                else {
                  contnet = data.toString();
                }

                libraryJson[folderName][fileName] = contnet;
  
                resolve();
              })
            })
  
            arrPromises.push(freshPromise);
          }
        }

        resolve(arrPromises);
      });

      
    })
  }

  // Then statements to call on each folder to store content in key:value pair in libraryJson
  readFolderFunction("library_pieces").then(function(data) {
    return Promise.all(data).then(function() {
      return readFolderFunction("mods").then(function(data) {
        return Promise.all(data).then(function() {
          return readFolderFunction("mods_css").then(function(data) {
            return Promise.all(data).then(function() {
              return readFolderFunction("mods/images").then(function(data) {
                return Promise.all(data).then(function() {
                  res.json(libraryJson);
                })
                .catch(function(err) {
                  console.log("Error with Promise.all for images");
                  throw err;
                })
              })
              .catch(function(err) {
                console.log("Error with readFolderFunction for images");
                throw err;
              })
            })
            .catch(function(err) {
              console.log("Error with Promise.all for mods_css");
              throw err;
            })
          })
          .catch(function(err) {
            console.log("Error with readFolderFunction for mods_css");
            throw err;
          })
        })
        .catch(function(err) {
          console.log("Error with Promise.all for mods");
          throw err;
        })
      })
      .catch(function(err) {
        console.log("Error with readFolderFunction for mods");
        throw err;
      })
    })
    .catch(function(err) {
      console.log("Error with Promise.all for library_pieces");
      throw err;
    })
  })
  .catch(function(err) {
    console.log("Error with readFolderFunction for library_pieces");
    throw err;
  })

})

// Pass all mod file names to client side
app.get('/mod_names', (req, res) => {
  // let fileNamesArr = [];
  // let modsNameImages = {
  //   "names": fileNamesArr,
  //   "images": {}
  // };

  // fs.readdir(__dirname + "/whole_mod_library/mods", function (err, data) {
  //   if(err) {
  //     console.log("Error with reading /whole_mod_library/mods file names");
  //     throw err;
  //   }

    // for(let i = 0; i < data.length; i++) {
    //   // Make sure to not pass images into fileNamesArr
    //   if(data[i] !== "images") {
    //     let fileName = "";

    //   for(let j = 0; j < data[i].length; j++) {
    //     if(data[i][j] === ".") {
    //       j = data[i].length;
    //     }
    //     else {
    //       fileName = fileName + data[i][j];
    //     }
    //   }

    //   fileNamesArr.push(fileName);
    //   }
    // }
  //   console.log(modsNameImages);
  //   res.json(fileNamesArr);
  // })

  let modNamesThumbs = {
    "names": [],
    "images": {}
  }

  const readModDir = function() {
    return new Promise(function(resolve, reject) {
      let fileNamesArr = [];

      fs.readdir(__dirname + "/whole_mod_library/mods", function(err, data) {
        if(err) {
          console.log("Error with readModDir");
          throw err;
        }

        for(let i = 0; i < data.length + 1; i++) {
          // Make sure to not pass images into fileNamesArr
          if(i === data.length) {
            modNamesThumbs["names"] = fileNamesArr;
            resolve(fileNamesArr);
          }
          else if(data[i] !== "images") {
            let fileName = "";
    
          for(let j = 0; j < data[i].length; j++) {
            if(data[i][j] === ".") {
              j = data[i].length;
            }
            else {
              fileName = fileName + data[i][j];
            }
          }
    
          fileNamesArr.push(fileName);
          }
        }
      })
    })
  }

  const thumbExists = function(fileNames) {
    let doesExistsPromises = [];

    return new Promise(function(resolve, reject) {
      for(let i = 0; i <= fileNames.length; i++) {
        if(i === fileNames.length) {
          resolve(doesExistsPromises);
        }
        else if(fs.existsSync(__dirname + "/preview_images_thumb/" + fileNames[i] + ".png")) {
          const freshPromise = new Promise(function(resolve, reject) {
            fs.readFile(__dirname + "/preview_images_thumb/" + fileNames[i] + ".png", (err, data) => {
              if(err) {
                console.log("Error with freshPromise in thumbExists Promise.all");
                throw err;
              }

              modNamesThumbs["images"][fileNames[i]] = "data:image/png;base64," + data.toString("base64");

              resolve();
            })
          })

          doesExistsPromises.push(freshPromise);
        }
        else {
          modNamesThumbs["images"][fileNames[i]] = false;
        }
      }
    })
  }

  

  readModDir().then(function(fileNames) {
    return thumbExists(fileNames).then(function(data) {
      return Promise.all(data).then(function() {
        res.json(modNamesThumbs);
      })
    })
  })
})

app.post('/download_unique_email', (req, res) => {
  console.log(req.body);
  const userMods = req.body;
  let emailImagesData = {
    "email": "",
    "images": {}
  };
  let imageFileNames = [];

  const writeLibraryTopHtml = function() {
    return new Promise(function(resolve, reject) {
      fs.readFile(__dirname + '/whole_mod_library/library_pieces/library_top.html', (err, data) => {
        if(err) {
          console.log("Error with reading library pieces");
          throw err;
        }
    
        fs.writeFile(__dirname + '/unique_email/unique_email.html', data, (err) => {
          if(err) {
            console.log("Error with writing file");
            throw err;
          }
    
          console.log("Wrote file to unique_email.html");
  
          resolve();
        })
      })
    })
  }

  const readAppendMod = function(folderName, modName, ext) {
    return new Promise(function(resolve, reject) {
      fs.readFile(__dirname + '/whole_mod_library/' + folderName + '/' + modName + ext, (err, data) => {
        if(err) {
          console.log("Error with reading file: " + modName + ext);
          throw err;
        }

        fs.appendFile(__dirname + '/unique_email/unique_email.html', data, (err) => {
          if(err) {
            console.log("Error with appending file: " + modName + ext);
            throw err;
          }

          resolve();
        })
      })
    })
  }

  const readImageData = function() {
    return new Promise(function(resolve, reject) {
      fs.readdir(__dirname + '/whole_mod_library/mods/images', function (err, data) {
        if(err) {
          console.log("Error with reading images folder");
          throw err;
        }

        imageFileNames = data;

        resolve();
      })
    })
  }

  const addImageData = function(imageName) {
    return new Promise(function(resolve, reject) {
      fs.readFile(__dirname + '/whole_mod_library/mods/images/' + imageName, (err, data) => {
        if(err) {
          console.log("Error at reading image: " + imageName);
          throw err;
        }
        
        emailImagesData["images"][imageName] = data.toString('base64');

        resolve();
      })
    })
  }

  const readSendUniqueEmail = function() {
    return new Promise(function(resolve, reject) {
      fs.readFile(__dirname + '/unique_email/unique_email.html', (err, data) => {
        if(err) {
          console.log("Error with reading unique_email");
          throw err;
        }

        emailImagesData["email"] = data.toString();

        resolve();
      })
    })
  }

  async function buildUniqueEmail() {
    // Read, write top portion of html shell
    await writeLibraryTopHtml();

    // Place holder for CSS promises
    for(let i = 0; i < userMods.length; i++) {
      if(fs.existsSync(__dirname + "/whole_mod_library/mods_css/" + userMods[i] + ".css")) {
        await readAppendMod("mods_css", userMods[i], ".css");
      }
    }

    // Read, append middle portion of the html shell
    await readAppendMod("library_pieces", "library_middle", ".html");

    // Read, append all mods
    for(let i = 0; i < userMods.length; i++) {
      await readAppendMod("mods", userMods[i], ".html");
    }

    // Read, append bottom portion of html shell
    await readAppendMod("library_pieces", "library_bottom", ".html");

    // Read all file names in images folder
    await readImageData();

    // Read and add all image data to emailImagesData object
    for(let i = 0; i < imageFileNames.length; i++) {
      await addImageData(imageFileNames[i]);
    }

    // Read, send data to client side for zipping
    await readSendUniqueEmail();

    res.json(emailImagesData);
  }

  buildUniqueEmail();
})

app.post('/preview_image', (req, res) => {
  let imageData = {
    "image": ""
  };

  const readImageData = function(imageName) {
    return new Promise(function(resolve, reject) {
      fs.readFile(__dirname + '/preview_images/' + imageName + '.png', (err, data) => {
        if(err) {
          console.log("Error at reading image: " + imageName);
          throw err;
        }

        imageData["image"] = data.toString('base64');

        resolve();
      })
    })
  }

  async function requestImage() {
    if(fs.existsSync(__dirname + '/preview_images/' + req.body.name + '.png')) {
      await readImageData(req.body.name);
    }
    else {
      imageData["image"] = false;
    }

    res.send(imageData);
  };

  requestImage();
})

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  // res.sendFile(path.join(__dirname + '/client/build/index.html'));
  res.send("Catch all page");
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Server listening on port ${port}`);