var JSONStream = require('JSONStream')
var spawn = require('child_process').spawn
var mkdirp = require('mkdirp')
var Seq = require('seq')
var fs = require('fs')
var request = require('request')
var rimraf = require('rimraf')

var token = process.env.TOKEN

process.stdin
.pipe(JSONStream.parse(true))
.on('data', function (objects) {
  if (!Array.isArray(objects)) objects = [objects]
  
  objects.forEach(function (obj) {
    if (!obj.title || !obj.type || !obj.data) {
      return console.error('couldn\'t parse ' + JSON.stringify(obj))
    }

    var dir = '/tmp/' + Math.random().toString(16).slice(2) + '/'

    Seq()
      // check if the repo exists
      .seq(function () {
        request('https://api.github.com/repos/data-berlin/' + obj.title, this)
      })
      // try creating a repo
      .seq(function (res, body) {
        if (res.statusCode == 200) return this()
        
        request({
          url : 'https://api.github.com/user/repos?access_token='
            + token,
          method : 'POST',
          json : { name : obj.title }
        }, this)
      })
      // make space for tempfiles
      .seq(function () {
        mkdirp(dir, this)
      })
      // checkout the current HEAD of the repo
      .seq(function () {
        var ps = spawn('git', [
          'clone',
          'https://' + token + '@github.com/data-berlin/' + obj.title + '.git',
          dir
        ])
        ps.stderr.on('data', function (data) {
          if (data.toString().match(/warning/)) return
          ps.stderr.write(data)
        })
        ps.on('exit', this.ok)
      })
      // modify / add file
      .seq(function () {
        fs.writeFile(dir + obj.title + '.' + obj.type, obj.data, this)
      })
      // add files
      .seq(function () {
        var ps = spawn('git', ['add', '.'], { cwd : dir })
        ps.stderr.pipe(process.stderr, { end : false })
        ps.on('exit', this.ok)
      })
      // commit files
      .seq(function () {
        var ps = spawn('git', [
          'commit', '-m', 'update ' + Date.now()
        ], { cwd : dir })
        ps.stderr.pipe(process.stderr, { end : false })
        ps.on('exit', this.ok)
      })
      // push to github
      .seq(function () {
        var ps = spawn('git', ['push', '-u', 'origin', 'master'], { cwd : dir })
        ps.stderr.on('data', function (data) {
          if (data.toString().match(/Everything\ up-to-date/)) return
          ps.stderr.write(data)
        })
        ps.on('exit', this.ok)
      })
      // cleanup
      .seq(function () {
        rimraf(dir, this)
      })
      // print success message
      .seq(function () {
        console.log('pushed ' + obj.title)
      })
      .catch(function (err) {
        console.error('err', err)
      })
  })
})
