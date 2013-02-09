# data berlin uploader

## usage

```bash
$ git clone git@github.com:data-berlin/uploader.git
$ cat stream | TOKEN=kj342k3j4h2 node uploader/index.js
```

## format of stdin

```
[
{
  title : 'foo',
  type : 'json',
  data : "{'some':'json'}"
},
{
  title : 'bar',
  type : 'xml',
  data : "<some>xml</some>"
}
]
```

## token

You need to set the `TOKEN` environment variable to a
valid token. Get [help](https://help.github.com/articles/creating-an-oauth-token-for-command-line-use).
`scopes` must be `repo`;
