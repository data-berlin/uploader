var spawn = require('child_process').spawn
var JSONStream = require('JSONStream')

var ps = spawn('node', [__dirname + '/index.js'])
ps.stdout.pipe(process.stdout)
ps.stderr.pipe(process.stderr)

var stringifier = JSONStream.stringify()
stringifier.pipe(ps.stdin)

stringifier.write({
	title : 'foo',
	type : 'json',
	data : "{\n  some : 'other',\n  'super' : 'sweet',\n  contents : 'present'}"
})

stringifier.write({
	title : 'bar',
	type : 'xml',
	data : '<just>more</just><sweet>content</sweet>'
})

stringifier.end()