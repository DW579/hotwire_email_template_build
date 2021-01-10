import React, { Component } from 'react';
import logo from './images/oracle_logo.png';
import loadingIcon from './images/loading.gif';
import './App.css';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const zip = new JSZip();

class Nav extends Component {
  render() {
    return (
      <div className="Nav">
        <nav className="navbar navbar-expand-lg navbar-light">
          <img src={logo} id="logo" alt="Oracle" />
        </nav>
      </div>
    );
  }
}

function Image(props) {
  return <i className={props.image}></i>;
}

function Title(props) {
  return <h1 className="title">{props.title}</h1>;
}

function Text(props) {
  return <p className="text">{props.text}</p>;
}

class Date extends Component {
  state = { 
    date: [],
    displayOn: true,
    closeButton: false
  }

  // Once endpoint '/date' on server has finished it's GET calls by comparing dates and downloading mod library from GitHub, then turn off progress bar here on frontend
  componentDidMount() {
    fetch('/date')
      .then(res => res.json())
      .then(date => {
        this.setState({ displayOn: false })
        this.setState({ date })
      })
  }

  render() {
    return (
      <div>
        <p className="date">LAST UPDATED {this.state.date}</p>
        <div className="modal" style={{display: this.state.displayOn ? 'block' : 'none'}}>
          <div className="modalBox container">
            <div className="row">
              <div className="col-sm">
              </div>
              <div className="col-sm">
                <img src={loadingIcon} alt="" />
              </div>
              <div className="col-sm">
              </div>
            </div>
            <div className="row">
              <div className="col-sm">
              </div>
              <div className="col-sm">
                <h1 className="title">Checking to see if the Library is up to date</h1>
                <p className="text">Please wait until the module library download is complete. If you get bored, try saying this 10 times fast: <span id="downloadSuccess">Six sleek swans swam swiftly southwards.</span></p>
              </div>
              <div className="col-sm">
              </div>
            </div>
          </div>
        </div>
      </div>
      
    );
  }
}

class LibraryButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayOn: true,
      closeOn: true,
      icon: true
    };
    this.downloadLibrary = this.downloadLibrary.bind(this);
    this.lightBoxClose = this.lightBoxClose.bind(this);
  }

  lightBoxClose() {
    this.setState(state => ({
      displayOn: !state.displayOn,
      icon: !state.icon,
      closeOn: !state.closeOn
    }));
  }

  // Function for downloading whole Mod Library
  downloadLibrary() {
    this.setState(state => ({
      displayOn: !state.displayOn,
    }));

    fetch('/download_library')
      .then(res => res.json())
      .then(data => {
        console.log(data);
        const loadFilesFunction = function(folderName) {
          return new Promise(function(resolve, reject) {
            for(let title in data[folderName]) {
              const name = folderName + "/" + title;
              if(folderName === "mods/images") {
                zip.file(name, data[folderName][title], {base64: true});
              }
              else {
                zip.file(name, data[folderName][title]);
              }
            }
            resolve();
          })
        }

        for(let folder in data) {
          loadFilesFunction(folder).then(function() {
            return;
          })
        }

        zip.generateAsync({type:"blob"}).then(function(content) {
          // see FileSaver.js
          saveAs(content, "hotwire_mod_library.zip");
        });

        // Show close button in lightbox
        this.setState(state => ({
          closeOn: !state.closeOn,
          icon: !state.icon
        }));
      })
  }

  render() {
    return (
      <div className="Button">
        <button type="button" className="btn btn-danger redBtn" onClick={this.downloadLibrary}>{this.props.button}</button>
        <div className="modal" style={{display: this.state.displayOn ? 'none' : 'block'}}>
          <div className="modalBox container">
            <div className="row">
              <div className="col-sm"></div>
              <div className="col-sm"></div>
              <div className="col-sm">
                <div className="close" style={{display: this.state.closeOn ? 'none' : 'block'}} onClick={this.lightBoxClose}>&times;</div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm">
              </div>
              <div className="col-sm" align="center">
                <img src={loadingIcon} style={{display: this.state.icon ? 'block' : 'none'}} alt="" />
                <i className="far fa-check-circle fa-7x" style={{display: this.state.icon ? 'none' : 'block'}}></i>
              </div>
              <div className="col-sm">
              </div>
            </div>
            <div className="row">
              <div className="col-sm">
              </div>
              <div className="col-sm" align="center">
                <h1 className="title" style={{display: this.state.icon ? 'block' : 'none'}}>Download in Progress</h1>
                <p className="text" style={{display: this.state.icon ? 'block' : 'none'}}>Please wait until your download is complete. If you get bored, try saying this 10 times fast: <span id="downloadSuccess">Six sleek swans swam swiftly southwards.</span></p>
                <h1 className="title" style={{display: this.state.icon ? 'none' : 'block'}}>Success! Your download is ready.</h1>
                <p className="text" style={{display: this.state.icon ? 'none' : 'block'}}>Now it’s time to get back to work. Depending on what you’re up to, you can edit your build or build a new email.</p>
              </div>
              <div className="col-sm">
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function Box(props) {
  return(
    <div>
      <Image image={props.image}></Image>
      <Title title={props.title}></Title>
      <Text text={props.text}></Text>
    </div>
  );
}

class DragDropImage extends Component {
  state = {
    mods: [],
    thumb_images: {},
    mods_used: [],
    mod_count: 0,
    displayOn: true,
    icon: true,
    closeOn: true
  };

  // Close lightbox
  lightBoxClose() {
    this.setState(state => ({
      displayOn: !state.displayOn,
      icon: !state.icon,
      closeOn: !state.closeOn
    }));
  }

  // Fetching all mod file names from server
  componentDidMount() {
    fetch('/mod_names')
      .then(res => res.json())
      .then(data => {
        this.setState(state => ({
          mods: data.names,
          thumb_images: data.images
        }));
      })
  }

  addMod(ev) {
    const modCard = document.createElement("div");
    const cardTitle = document.createElement("div");
    const clearButton = document.createElement("button");
    const image = document.createElement("img");
    const notFound = document.createElement("div");
    const modUsedImageDiv = document.createElement("div");
    const modUsedImage = document.createElement("img");
    const emptyDiv = document.createElement("div");
    const cardId = ev.target.id + "_" + this.state.mod_count;
    const imageId = ev.target.id + "_" + this.state.mod_count + "_img";
    const selectedMod = {
      "name": ev.target.id
    }
    let imageData = "data:image/png;base64,";

    // Fetch preview image data
    fetch('/preview_image', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(selectedMod)
    })
      .then(res => res.json())
      .then(data => {
        imageData += data.image;

        if(data.image !== false) {
          // Set attributes on preview image
          image.setAttribute("src", imageData);
          image.setAttribute("id", imageId);

          // Append preview images
          document.getElementById("emailPreview").appendChild(image);
        }
        else {
          // Set attributes to div not found
          notFound.setAttribute("id", imageId);
          notFound.innerText = "Image unavaliable";

          // Append to emailPreview
          document.getElementById("emailPreview").appendChild(notFound);
        }

        
      })

    // Set attributes on modCard
    modCard.setAttribute("class", "ui-state-default modsBox");
    modCard.setAttribute("id", cardId);

    // Set attributes on modUsedImageDiv and modUsedImage
    modUsedImageDiv.setAttribute("class", "thumbImg");
    if(this.state.thumb_images[ev.target.id] === false) {
      modUsedImageDiv.appendChild(emptyDiv);
    }
    else {
      modUsedImage.setAttribute("src", this.state.thumb_images[ev.target.id]);
      modUsedImage.setAttribute("alt", "modsUsedImage");
      modUsedImageDiv.appendChild(modUsedImage);
    }
    
    


    // Set attributes on cardTitle
    cardTitle.setAttribute("class", "modsName");
    cardTitle.innerHTML = ev.target.id;
    
    // Set attributes on clearButton
    clearButton.innerHTML = "x";
    clearButton.setAttribute("class", "clearButton");
    clearButton.setAttribute("onclick", "clearCard(this.parentElement.id)");
    

    // Append elements to modCard
    modCard.appendChild(modUsedImageDiv);
    modCard.appendChild(cardTitle);
    modCard.appendChild(clearButton);

    document.getElementById("modsUsed").appendChild(modCard);

    this.setState(state => ({
      mod_count: state.mod_count + 1
    }));
  
  }

  resetMods() {
    const parentNodeModsUsed = document.getElementById("modsUsed");
    const parentNodeEmailPreview = document.getElementById("emailPreview");

    // Delete all mods selected in modsUsed div
    while(parentNodeModsUsed.firstChild) {
      parentNodeModsUsed.removeChild(parentNodeModsUsed.firstChild);
    }

    // Delete all preview images in emailPreview div
    while(parentNodeEmailPreview.firstChild) {
      parentNodeEmailPreview.removeChild(parentNodeEmailPreview.firstChild);
    }
  }

  downloadEmail() {
    const parentNode = document.getElementById("modsUsed");
    let arrModsUsed = [];

    // Turn on light box
    this.setState(state => ({
      displayOn: !state.displayOn,
    }));

    // Push mod titles into arrModsUsed that will be passed to the server
    for(let i = 0; i < parentNode.children.length; i++) {
      arrModsUsed.push(parentNode.children[i].children[1].innerHTML);
    }

    fetch('/download_unique_email', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(arrModsUsed)
    })
      .then(res => res.json())
      .then(data => {
        // Add unique_email content to the zip.file blob
        zip.file("unique_email.html", data["email"]);

        // Adding images content to zip.file blob
        for(let imageName in data["images"]) {
          zip.file("images/" + imageName, data["images"][imageName], {base64: true});
        }

        // Show Success on lightbox
        this.setState(state => ({
          icon: !state.icon,
          closeOn: !state.closeOn
        }));

        // Download zip of all the files found in the zip.file blob
        zip.generateAsync({type:"blob"}).then(function(content) {
          // see FileSaver.js
          saveAs(content, "unique_email.zip");
        });

      });
  }

  render() {
    return (
      <div className="DragDropImage">
        <div className="row">
          <div className="col-lg-3">
            <div className="modsTitleDiv" align="center">
              <div className="modsTitle">MODULES</div>
            </div>
            <div id="mods">
              {this.state.mods.map(mods => (
                  <div 
                    key={mods}
                    className="modsBox" 
                  >
                    <div className="thumbImg">
                      <img alt="thumb" src={this.state.thumb_images[mods] ? this.state.thumb_images[mods] : undefined} style={{display: this.state.thumb_images[mods] ? 'block' : 'none'}} />
                    </div>
                    <div className="modsName">
                      {mods}
                    </div>
                    <button id={mods} className="modsAdd" onClick={ev => this.addMod(ev)}>
                      ADD
                    </button>
                  </div>
              ))}
            </div>
          </div>
          <div className="col-lg-3">
            <div className="modsTitleDiv" align="center">
              <div className="modsTitle">MODULES USED</div>
            </div>
            <div id="modsUsed"></div>
          </div>
          <div className="col-lg-6">
            <div className="previewTitleDiv" align="center">
              <div className="modsTitle">EMAIL PREVIEW</div>
            </div>
            <div id="emailPreview" align="center"></div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-3"></div>
          <div className="col-lg-3"></div>
          <div className="col-lg-3">
            <button id="uniqueReset" onClick={ev => this.resetMods(ev)}>CLEAR ALL MODULES</button>
          </div>
          <div className="col-lg-3">
            <button id="uniqueDownload" onClick={ev => this.downloadEmail(ev)}>DOWNLOAD</button>
          </div>
        </div>
        <div className="modal" style={{display: this.state.displayOn ? 'none' : 'block'}}>
          <div className="modalBox container">
            <div className="row">
              <div className="col-sm"></div>
              <div className="col-sm"></div>
              <div className="col-sm">
                <div className="close" style={{display: this.state.closeOn ? 'none' : 'block'}} onClick={ev => this.lightBoxClose()}>&times;</div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm">
              </div>
              <div className="col-sm" align="center">
                <img src={loadingIcon} style={{display: this.state.icon ? 'block' : 'none'}} alt="" />
                <i className="far fa-check-circle fa-7x" style={{display: this.state.icon ? 'none' : 'block'}}></i>
              </div>
              <div className="col-sm">
              </div>
            </div>
            <div className="row">
              <div className="col-sm">
              </div>
              <div className="col-sm" align="center">
                <h1 className="title" style={{display: this.state.icon ? 'block' : 'none'}}>Download in Progress</h1>
                <p className="text" style={{display: this.state.icon ? 'block' : 'none'}}>Please wait until your download is complete. If you get bored, try saying this 10 times fast: <span id="downloadSuccess">Six sleek swans swam swiftly southwards.</span></p>
                <h1 className="title" style={{display: this.state.icon ? 'none' : 'block'}}>Success! Your download is ready.</h1>
                <p className="text" style={{display: this.state.icon ? 'none' : 'block'}}>Now it’s time to get back to work. Depending on what you’re up to, you can edit your build or build a new email.</p>
              </div>
              <div className="col-sm">
              </div>
            </div>
          </div>
        </div>
      </div>
      
    )
  }
}

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayOn: true,
      closeOn: true,
      icon: true,
      downloadLibraryPage: true
    };
    this.uniqueEmail = this.uniqueEmail.bind(this);
  }

  uniqueEmail() {
    this.setState(state => ({
      downloadLibraryPage: !state.downloadLibraryPage,
    }));
  }

  render() {
    return (
      <div className="Main">
        <div className="container-fluid downloadLibraryPage" style={{display: this.state.downloadLibraryPage ? 'block' : 'none'}}>
          <div className="row">
            <div className="col-lg-1"></div>
            <div className="Box col-lg-4">
              <Box 
                image={downloadBox.image} 
                title={downloadBox.title} 
                text={downloadBox.text}
              ></Box>
              <LibraryButton button={downloadBox.button}></LibraryButton>
              <Date></Date>
            </div>
            
            <div className="col-lg-2"></div>
            <div className="Box col-lg-4">
              <Box 
                image={uniqueBox.image} 
                title={uniqueBox.title} 
                text={uniqueBox.text}
              ></Box>
              <button type="button" className="btn btn-danger redBtn" onClick={this.uniqueEmail}>BUILD EMAIL</button>
            </div>
            <div className="col-lg-1"></div>
          </div>
        </div>
        <div className="container-fluid" style={{display: this.state.downloadLibraryPage ? 'none' : 'block'}}>
          <div className="row">
            <div className="col-lg-1">
              <button id="backButton" type="button" onClick={this.uniqueEmail}>Back</button>
            </div>
          </div>
          <div className="row" align="center">
            <div className="col-lg-4"></div>
            <div className="col-lg-4">
              <h3 id="uniqueTitle">Build a Unique Email</h3>
            </div>
            <div className="col-lg-4"></div>
          </div>
          <div className="row" align="center">
            <div className="col-lg-1"></div>
            <div className="col-lg-10">
              <p id="uniqueText">Select any module from the left column by clicking the ADD button. To arrange their order, drag any module in the middle column up or down.</p>
            </div>
            <div className="col-lg-1"></div>
          </div>
          <DragDropImage></DragDropImage>
        </div>
      </div>
    );
  }
}

class Footer extends Component {
  render() {
    return (
      <div className="Footer">
        <div className="footer fixed-bottom">Copyright &copy;2019 Oracle</div>
      </div>
    )
  }
}

const downloadBox = {
  image: 'fas fa-cloud-download-alt fa-7x',
  title: 'Download the Hotwire Library',
  text: 'Save the entire library of Hotwire modules locally to your\xa0computer.',
  button: 'DOWNLOAD NOW'
}

const uniqueBox = {
  image: 'fas fa-tools fa-7x',
  title: 'Build a Unique\xa0Email',
  text: 'If you’re ready to start, click here to begin building a new\xa0email.',
  button: 'BUILD EMAIL'
}

class Body extends Component {
  render() {
    return (
      <div className="Body">
        <Nav></Nav>
        <Main></Main>
        <Footer></Footer>
      </div>
    );
  }
}

export default Body;
