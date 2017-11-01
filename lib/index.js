'use strict'
var request = require('request')
var fs = require('fs')
var xml2js = require('xml2js')

module.exports = {
  raw: request,
  get: request.get,

  /**
   * For normal requests
   * @param url
   * @param data
   * @param cb
   */
  request: function(url, data, cb) {
    request.post(
      {
        url: url,
        json: true,
        form: data
      },
      function(error, response, body) {
        if (!error && response.statusCode === 200) {
          // Return false if succeeded, else true
          cb(false, body)
        } else {
          cb(true, {
            message: body
          })
        }
      }
    )
  },

  /**
   * For json data posting
   *
   * @param url
   * @param data
   * @param cb
   */
  json: function(url, data, cb) {
    request.post(
      {
        url: url,
        body: data,
        json: true
      },
      function(error, response, body) {
        if (!error && response.statusCode === 200) {
          cb(false, body)
        } else {
          cb(true, {
            message: body
          })
        }
      }
    )
  },

  /**
   * For xml data posting
   *
   * @param url
   * @param data
   * @param cb
   */
  xml: function(url, xml, cb) {
    request.post(
      {
        url: url,
        body: xml,
        headers: {
          'Content-Type': 'text/xml'
        }
      },
      function(error, response, body) {
        if (!error && response.statusCode === 200) {
          xml2js.parseString(
            body,
            {
              explicitArray: false,
              ignoreAttrs: true
            },
            function(error, json) {
              if (error) {
                return cb(true, new Error(body))
              }
              cb(false, json.xml)
            }
          )
        } else {
          cb(true, {
            message: body
          })
        }
      }
    )
  },

  /**
   * For xml data posting with ssl
   * @param url
   * @param xml
   * @param ssl
   * @param cb
   */
  xmlssl: function(url, xml, ssl, cb) {
    var options = {
      url: url,
      body: xml,
      headers: {
        'Content-Type': 'text/xml'
      }
    }

    if (ssl.ca) {
      options.ca = fs.readFileSync(ssl.ca)
    }

    if (ssl.key) {
      options.key = fs.readFileSync(ssl.key)
    }

    if (ssl.cert) {
      options.cert = fs.readFileSync(ssl.cert)
    }

    request.post(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        xml2js.parseString(
          body,
          {
            explicitArray: false,
            ignoreAttrs: true
          },
          function(error, json) {
            if (error) {
              return cb(true, new Error(body))
            }
            cb(false, json.xml)
          }
        )
      } else {
        cb(true, {
          message: body
        })
      }
    })
  },

  /**
   * For file uploading
   *
   * @param url
   * @param file
   * @param cb
   */
  file: function(url, file, cb) {
    fs.stat(file, function(err) {
      if (err) {
        return cb(true, {
          message: 'File not exist!'
        })
      }
      var media = fs.createReadStream(file)
      request.post(
        {
          url: url,
          json: true,
          formData: {
            media: media,
            nonce: ''
          }
        },
        function(error, response, body) {
          if (!error && response.statusCode === 200) {
            cb(false, body)
          } else {
            cb(true, {
              message: body
            })
          }
        }
      )
    })
  },

  /**
   * For file downloading
   *
   * @param url
   * @param data
   * @param file
   * @param cb
   */
  download: function(url, data, file, cb) {
    request
      .post({
        url: url,
        body: data,
        headers: {
          'Content-Type': 'text/xml'
        }
      })
      .pipe(fs.createWriteStream(file).on('finish', cb))
  }
}
