const request = require("request");
const cheerio = require("cheerio");
const pdfkit = require("pdfkit");
const fs = require("fs");
const path = require("path");

let url = "https://github.com/topics";
request(url, cb);

function cb(err, response, html) {
  if (err) {
    console.log(err);
  } else if (response.statusCode === 404) {
    console.log("Page Not Found");
  } else {
    getTopicLinks(html);
  }
}

function getTopicLinks(html) {
  let search = cheerio.load(html);
  let linkElemArr = search(
    ".no-underline.d-flex.flex-column.flex-justify-center"
  );
  for (let i = 0; i < linkElemArr.length; i++) {
    let href = search(linkElemArr[i]).attr("href");
    // console.log(href);
    let topic = href.split("/").pop();
    let fullLink = `https://github.com${href}`;
    getReposPageHtml(fullLink, topic);
  }
}

function getReposPageHtml(url, topic) {
  request(url, cb1);

  function cb1(err, response, html) {
    if (err) {
      console.log(err);
    } else if (response.statusCode === 404) {
      console.log("Page Not Found");
    } else {
      getReposLink(html);
    }
  }

  function getReposLink(html) {
    let search = cheerio.load(html);
    let repNames = search(
      ".f3.color-text-secondary.text-normal.lh-condensed a.text-bold"
    );

    if (repNames.length > 8) {
      repNames.splice(8);
    }

    for (let i = 0; i < repNames.length; i++) {
      let link = search(repNames[i]).attr("href");
      //   console.log(link);
      let fullLink = `https://github.com${link}/issues`;
      let repoName = link.split("/").pop();
      getIssuesPageHtml(fullLink, topic, repoName);
    }
  }
}

function getIssuesPageHtml(url, topic, repoName) {
  request(url, cb2);

  function cb2(err, response, html) {
    if (err) {
      console.log(err);
    } else if (response.statusCode === 404) {
      console.log("Page Not Found");
    } else {
      getIssues(html);
    }
  }

  function getIssues(html) {
    let search = cheerio.load(html);
    let issuesElemArr = search(
      ".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title"
    );
    let arr = [];
    for (let i = 0; i < issuesElemArr.length; i++) {
      let link = search(issuesElemArr[i]).attr("href");
      //   console.log(link);
      arr.push(link);
    }
    // console.log(topic, "    ", arr);
    let folderpath = path.join(__dirname, topic);
    dirCreater(folderpath);
    let filePath = path.join(folderpath, repoName + ".pdf");
    let text = JSON.stringify(arr);
    let pdfDoc = new pdfkit();
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.text(text);
    pdfDoc.end();
  }
}

function dirCreater(folderpath) {
  if (fs.existsSync(folderpath) == false) {
    fs.mkdirSync(folderpath);
  }
}
