var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
  console.log('请指定端口号')
  process.exit(1)
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true)
  var path = request.url
  var query = ''
  if (path.indexOf('?') >= 0) {
    query = path.substring(path.indexOf('?'))
    path = path.slice(0, path.indexOf('?'))
  }
  var pathNoQuery = parsedUrl.pathname
  var queryObject = parsedUrl.query
  var method = request.method

  //----------------------------
  console.log('HTTP 路径为\n' + path)
  console.log('查询字符串为\n' + query)
  // console.log('不含查询字符串的路径为\n' + pathNoQuery)


  if (path === '/') {
    var string = fs.readFileSync('./index.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  } else if (path === '/register') {
    var string = fs.readFileSync('./register.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  } else if (path === '/verification' && method.toUpperCase() === 'POST') {

    readBody(request).then((body) => {
      let data = {}
      let arr = body.split('&')
      arr.forEach((value) => {
        let tempArr = value.split('=')
        data[tempArr[0]] = tempArr[1]
      }) //分析数据
      let {
        account,
        password
      } = data
      if (account === 'admin' && password === 'admin') {
        response.statusCode = 200
        response.setHeader('Content-Type', 'text;charset=utf-8')
        response.write('success')
      } else {
        response.statusCode = 404
        response.setHeader('Content-Type', 'text/json;charset=utf-8')
        response.write(`{
          "error":"账号密码不匹配"
          }`)
      }


      response.end()
    })


  } else {
    response.statusCode = 404
    response.end()
  }

  function readBody(request) {
    return new Promise((resolve, reject) => {
      let body = []
      request.on('data', (chunk) => {
        body.push(chunk)
      }).on('end', () => {
        body = Buffer.concat(body).toString()
        resolve(body)
      })
    })
  }
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)