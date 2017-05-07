var critical = require('critical')
var fs = require('fs')

critical.generate({
    inline: true,
    base: 'dist/',
    src: 'index.html',
    css: ['dist/assets/main.css'],
    width: 1300,
    height: 1400,
    minify: true,
    extract: true,
    timeout: 30000
}).then(function(buffer) {
  fs.writeFile('dist/index.html', buffer, (err) => {
    if (err) throw err;
    console.log('It\'s saved!');
  })
})
