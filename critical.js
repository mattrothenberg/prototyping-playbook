var critical = require('critical')

critical.generate({
  inline: true,
  base: 'dist/',
  src: 'index.html',
  css: ['dist/assets/main.css'],
  dest: 'dist/foo.html',
  minify: true,
  width: 320,
  height: 480
}).then(function (output) {
    console.log(output)
}).error(function (err) {
    console.log(err)
});



//
//
// critical.generate({
//     base: 'dist/',
//     css: ['dist/assets/main.css'],
//     src: 'index.html',
//     width: 1300,
//     height: 500
// }).then(function (output) {
//     console.log(output)
// }).error(function (err) {
//     console.log(err)
// });
