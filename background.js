
// To initialize the library, create a ChromeExOAuth object in the background page:
//var oauth = ChromeExOAuth.initBackgroundPage({
//    'request_url': <OAuth request URL>,
//  'authorize_url': <OAuth authorize URL>,
//  'access_url': <OAuth access token URL>,
//  'consumer_key': <OAuth consumer key>,
//  'consumer_secret': <OAuth consumer secret>,
//  'scope': <scope of data access, not used by all OAuth providers>,
//  'app_name': <application name, not used by all OAuth providers>
//});

// In the case of the Documents List API and Google’s OAuth endpoints, a possible initialization may be:
//var oauth = ChromeExOAuth.initBackgroundPage({
//  'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
//  'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
//  'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
//  'consumer_key': 'anonymous',
//  'consumer_secret': 'anonymous',
//  'scope': 'https://docs.google.com/feeds/',
//  'app_name': 'My Google Docs Extension'
//});

// Fetching and authorizing a request token
// Once you have your background page set up, call the authorize() function to
// begin the OAuth dance and redirect the user to the OAuth provider. The client
// library abstracts most of this process, so all you need to do is pass a callback
// to the authorize() function, and a new tab will open and redirect the user.

//function callback(resp, xhr) {
//  // ... Process text response ...
//};
//
//function onAuthorized() {
//  var url = 'https://docs.google.com/feeds/default/private/full';
//  var request = {
//    'method': 'GET',
//    'parameters': {'alt': 'json'}
//  };
//
//  // Send: GET https://docs.google.com/feeds/default/private/full?alt=json
//  oauth.sendSignedRequest(url, callback, request);
//};
//
//oauth.authorize(onAuthorized);

// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var oauth = ChromeExOAuth.initBackgroundPage({
  'request_url' : 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url' : 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url' : 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key' : 'anonymous',
  'consumer_secret' : 'anonymous',
  'scope' : 'http://www.google.com/m8/feeds/',
  'app_name' : 'OAuth Example'
});

var contacts = null;

function setIcon() {
  if (oauth.hasToken()) {
    //chrome.browserAction.setIcon({ 'path' : 'img/icon-19-on.png'});
    chrome.browserAction.setIcon({ 'path' : 'icon.png'});
  } else {
    //chrome.browserAction.setIcon({ 'path' : 'img/icon-19-off.png'});
    chrome.browserAction.setIcon({ 'path' : 'icon.png'});
  }
};

function onContacts(text, xhr) {
  contacts = [];
  var data = JSON.parse(text);
  for (var i = 0, entry; entry = data.feed.entry[i]; i++) {
    var contact = {
      'name' : entry['title']['$t'],
      'id' : entry['id']['$t'],
      'emails' : []
    };

    if (entry['gd$email']) {
      var emails = entry['gd$email'];
      for (var j = 0, email; email = emails[j]; j++) {
        contact['emails'].push(email['address']);
      }
    }

    if (!contact['name']) {
      contact['name'] = contact['emails'][0] || "<Unknown>";
    }
    contacts.push(contact);
  }

  chrome.tabs.create({ 'url' : 'contacts.html'});
};

function getContacts() {
  oauth.authorize(function() {
    console.log("on authorize");
    setIcon();
    var url = "http://www.google.com/m8/feeds/contacts/default/full";
    oauth.sendSignedRequest(url, onContacts, {
      'parameters' : {
        'alt' : 'json',
        'max-results' : 100
      }
    });
  });
};

function logout() {
  oauth.clearTokens();
  setIcon();
};

setIcon();
chrome.browserAction.onClicked.addListener(getContacts);