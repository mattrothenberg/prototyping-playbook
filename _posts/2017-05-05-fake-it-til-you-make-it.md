---
layout: post
title:  "Fake it 'til you Make it"
date:   2017-05-05 16:23:10 -0400
permalink: 'fake-it-til-you-make-it'
categories: ['Vanilla JS', 'Vue', 'React']
---

This is _not_ an essay on the merit (or lack thereof) of using fake data in your prototype. Instead, this play gives you the tools you need to elevate your game from Lorem Ipsum to data that at least _resembles_ what will eventually go in the interface you're building

## Scenario

You've mastered the art of [working with tabular data]({{ site.baseurl}}/working-with-tabular-data). This time, though, you don't have a CSV export handy, and need to populate a table with around ~25 rows of sample data. You know the general shape of the data, but need a means of generating it.

![The Final Product]({{ site.baseurl }}/assets/img/posts/fake-data.png)

## Rundown
As with the aforementioned play, we start by identifying a schema to represent the data. Each table row should show the user's **avatar**, **name**, **email**, and **favorite color**.

{% prism js %}
let user = {
  name: 'Matt Rothenberg',
  avatar: 'http://placehold.it/50x50',
  email: 'hello@mattrothenberg.com',
  color: '#ffa2a2'
}
{% endprism %}

We'll leverage a tool called [Faker.js](https://github.com/marak/faker.js){:target="_blank"} to generate as much fake data as we'd like. Faker can generate a wide variety of fake data, and offers an intuitive API for doing so. Let's replace the hard-coded user object above with a _function_ that generates a fake user instead.

{% prism js %}
function buildFakeUser() {
  return {
    name: faker.internet.userName(),
    avatar: faker.internet.avatar(),
    email: faker.internet.email(),
    color: faker.internet.color()
  }
}
{% endprism %}

Now when we call that function, we get a random user!
{% prism js %}
let user = buildFakeUser()
console.log(user)
/*
  Object {
    name: "Mae65"
    avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/pierre_nel/128.jpg",
    email: "Arch_Considine@yahoo.com",
    color: "#1b327b",
  }
*/
{% endprism %}

Our data set is ready. Let's get to prototyping!

***

## Implementation — Vanilla JS (ES6)

Here's the game plan:
- Build a list of fake users

{% prism js %}
let users = []

for (var i = 0; i < 25; i++) {
  users.push( buildFakeUser() )
}

{% endprism %}
- Write a function that takes a user object and returns the corresponding table row markup (interpolating the **avatar**, **name**, and **email**, and **color**)

{% prism js %}

function generateTableRow (user) {
  return `
    <tr>
      <td class="pa3 bb b--black-10">
        <div class="flex items-center">
          <img class="br-100 w2 h2 mr2" src="${user.avatar}"/>
          ${user.name}
        </div>
      </td>
      <td class="pa3 bb b--black-10">
        ${user.email}
      </td>
      <td class="pa3 bb b--black-10">
        <div class="flex items-center">
          <div
            class="w1 h1 mr2"
            style="background-color: ${user.color}">
          </div>
          ${user.color}
        </div>
      </td>
    </tr>
  `
}

{% endprism %}

- Iterate over our Array of users using `forEach`[^foreach]

{% prism js %}
users.forEach(user => {
  let tableRow = generateTableRow(user)
  tableBody.insertAdjacentHTML("beforeend", tableRow)
})

{% endprism %}

<p data-height="400" data-theme-id="dark" data-slug-hash="wdrVgM" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Fake Data - Vanilla JS (ES6)" data-preview="true" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/wdrVgM/">Fake Data - Vanilla JS (ES6)</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Implementation — Vue JS

Here's the game plan:

- Construct a Vue instance, taking note to:
  - Initialize an empty `users` array on the instance's data property
  - Hook into the instance's `created` life cycle event in order to fill the `users` array with fake data[^lifecycle]

{% prism js %}
new Vue({
  el: "#app",
  data: {
    users: []
  },
  created: function() {
    for (var i = 0; i < 25; i++) {
      this.users.push(buildFakeUser());
    }
  }
})
{% endprism %}

- Define a `user-table-row` component to represent a given row of fake user data

{% prism js %}
Vue.component('user-table-row', {
  props: ['user'],
  template: `
  <tr>
    <td class="pa3 bb b--black-10">
      <div class="flex items-center">
        <img class="br-100 w2 h2 mr2" :src="user.avatar"/>
{{user.name}}
      </div>
    </td>
    <td class="pa3 bb b--black-10">
  {{user.email}}
    </td>
    <td class="pa3 bb b--black-10">
      <div class="flex items-center">
        <div
          class="w1 h1 mr2"
          v-bind:style="{backgroundColor: user.color}">
        </div>
        {{user.color}}
      </div>
    </td>
  </tr>
`
});
{% endprism %}

- Iterate over the instance's `users` property in our template using `v-for` syntax. Due to a template parsing caveat in Vue, we must use the `is` attribute to define which component should be rendered.[^caveat]

{% prism markup %}
<tbody>
  <tr is="user-table-row" v-for="user in users" :user="user"></tr>
</tbody>
{% endprism %}

<p data-height="400" data-theme-id="dark" data-slug-hash="gWXoZP" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Fake Data - Vue JS (ES6)" data-preview="true" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/gWXoZP/">Fake Data - Vue JS (ES6)</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Implementation — React JS

Here's the game plan:

- Create a stateless functional component called `UserTable`
  - It should accept an array of users as a property
  - It should render a `UserTableRow` component for each user in the `users` array

{% prism js %}
const UserTable = ({users}) => {
  return(
    <table className="bg-white w-100 data-table f6" cellspacing="0">
      <thead>
        <tr>
          <th className="tl pa3 bb b--black-10">User</th>
          <th className="tl pa3 bb b--black-10">Email</th>
          <th className="tl pa3 bb b--black-10">Fav Color</th>
        </tr>
      </thead>
      <tbody>
        {
          users.map(function (user) {
            return <UserTableRow user={user}></UserTableRow>
          })
        }
      </tbody>
    </table>
  )
}
{% endprism %}

- Create another stateless functional component called `UserTableRow`
  - It should accept a single user object as a property
  - It should render out `<tr>` markup accordingly
  - In React, the HTML `style` attribute accepts a JavaScript object with camelCased properties rather than a CSS string. At the top of our render function, we can build that object by interpolating the `color` attribute on our user prop.

{% prism js %}
const UserTableRow = ({user}) => {
  let favColorStyle = {
    backgroundColor: user.color
  }
  return (
    <tr>
      <td className="pa3 bb b--black-10">
        <div className="flex items-center">
          <img className="br-100 w2 h2 mr2" src={user.avatar}/>
          {user.name}
        </div>
      </td>
      <td className="pa3 bb b--black-10">
        {user.email}
      </td>
      <td className="pa3 bb b--black-10">
        <div className="flex items-center">
          <div className="w1 h1 mr2" style={favColorStyle}></div>
          {user.color}
        </div>
      </td>
    </tr>
  )
}
{% endprism %}

<p data-height="400" data-theme-id="dark" data-slug-hash="JNOLdR" data-default-tab="result" data-user="mattrothenberg" data-preview="true" data-embed-version="2" data-pen-title="Fake Data - React JS" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/JNOLdR/">Fake Data - React JS</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Footnotes
[^foreach]: [`forEach` on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach?v=example){:target="_blank"}
[^lifecycle]: [Vue Lifecycle Events](https://vuejs.org/v2/guide/instance.html#Instance-Lifecycle-Hooks){:target="_blank"}
[^caveat]: [Template Parsing Caveat](https://vuejs.org/v2/guide/components.html#DOM-Template-Parsing-Caveats){:target="_blank"}
