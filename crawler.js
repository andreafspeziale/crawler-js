var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "http://top-ix.org";
var SEARCH_WORD = "streaming";

var pagesVisited = {};
var pagesToVisit = [];
var instance = 0;
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

console.log('Starting Crawling ' + new Date(Date.now()).toString() + '\n\n');
function crawl() {
    var nextPage = pagesToVisit.pop();
    if(nextPage != undefined) {
        if (nextPage in pagesVisited)
            crawl();
        else
            visitPage(nextPage, crawl);
    } else {
        console.log('\n\nSite has been Crawled ' + new Date(Date.now()).toString() + '\n\n');
        console.log('Instance of ' + SEARCH_WORD + ':\n' + instance + '\n\n');
        console.log('Page visited:\n');
        for(var k in pagesVisited)
            console.log(k);
    }
}

function visitPage(url, callback) {
    pagesVisited[url] = true;
    request(url, function(error, response, body) {
        if(response.statusCode !== 200) {
            callback();
            return;
        }
        var $ = cheerio.load(body);
        var isWordFound = searchWord($, SEARCH_WORD);
        if(isWordFound) {
            console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
            instance ++;
        }
        collectLink($);
        callback();
    })
};

function searchWord ($, word) {
    var bodyToText = $('html > body').text();
    if(bodyToText.toLowerCase().indexOf(word.toLowerCase()) !== -1) return true
    return false
}

function collectLink($) {
    var relativeLinks = $("a[href^='/']");
    relativeLinks.each(function() {
        pagesToVisit.push(baseUrl + $(this).attr('href'));
    });
}
