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
    let string = fs.readFileSync('./index.html', 'utf8')

    let cookies = request.headers.cookie && request.headers.cookie.split(';')
    let hash = {}
    cookies && cookies.forEach((value) => {
      let tempArr = value.split('=')
      hash[tempArr[0]] = tempArr[1]
    })
    let detail = hash && dbSearch(hash.sign_in_account)
    if (detail) {
      string = string.replace('&&&&log&&&&', `你好${hash.sign_in_account}`)
    } else {
      string = string.replace('&&&&log&&&&', '请登录')
    }
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
      let data = stringParse(body) //分析数据
      let {
        account,
        password
      } = data
      if (account.length >= 6 || password.length >= 6) {
        console.log(dbSearch(account))
        if (!dbSearch(account)) {
          //数据库中没有该帐号 
          response.statusCode = 200
          response.setHeader('Content-Type', 'text;charset=utf-8')
          response.write('success')
          let dbData = JSON.parse(fs.readFileSync('./db', 'utf8'))
          dbData.push({
            account: account,
            password: password
          })
          fs.writeFileSync('./db', JSON.stringify(dbData), 'utf8')
        } else {
          response.statusCode = 404
          response.setHeader('Content-Type', 'text/json;charset=utf-8')
          response.write(`{
          "error":"该账号已存在"
          }`)
        }
      } else {
        response.statusCode = 404
        response.setHeader('Content-Type', 'text/json;charset=utf-8')
        response.write(`{
          "error":"账号密码必须6位以上哦"
          }`)
      }
      response.end()
    })

  } else if (path === '/log_in' && method.toUpperCase() === 'POST') {
    readBody(request).then((body) => {
      let data = stringParse(body) //分析数据
      let {
        account,
        password
      } = data
      let detail = dbSearch(account)
      if (detail) {
        if (detail.password === password) {
          response.statusCode = 200
          //给用户一个cokkie
          response.setHeader('Set-Cookie', `sign_in_account=${account}`)
        } else {
          response.statusCode = 400
          response.setHeader('Content-Type', 'text/json;charset=utf-8')
          response.write(`{
          "error":"密码错误"
          }`)
        }
      } else {
        response.statusCode = 400
        response.setHeader('Content-Type', 'text/json;charset=utf-8')
        response.write(`{
          "error":"帐号不存在"
          }`)
      }
      response.end()
    })
  } else if (path === '/log_in') {
    var string = fs.readFileSync('./log_in.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
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

  function stringParse(string) {
    let data = {}
    let arr = string.split('&')
    arr.forEach((value) => {
      let tempArr = value.split('=')
      data[tempArr[0]] = tempArr[1]
    })
    return data
  }

  function dbSearch(account) {
    let dbData = JSON.parse(fs.readFileSync('./db', 'utf-8'))
    for (let i = 0; i < dbData.length; i++) {
      if (dbData[i].account === account) {
        return dbData[i]
      }
    }
    return false
  }
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)