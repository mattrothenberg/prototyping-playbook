---
layout: post
title:  Componentization
date:   2017-05-04 16:23:10 -0400
permalink: 'componentization'
categories: ['Vanilla JS', 'Vue', 'React']
---

In programs like Sketch, we keep things DRY ("don't repeat yourself") by turning our design decisions into "symbols." It's no different in front-end land, so this play will introduce you to a few different ways of encapsulating your designs as "components."

## Scenario
Let’s suppose you’re designing an activity feed for a social networking application. You’ve designed a “card” in Sketch that represents a single item in the feed, but you want to verify that your design works at scale, given a sample set of data.


## Rundown
You’ve figured out that the following chunk of markup produces a single, beautiful, “card.”

{% prism markup %}
<div class="bg-white ba b--black-10 pa3">
  <div class="flex">
    <img class="mr2" src="..." alt="" />
    <div>
      <h1 class="f6 mv0 blue">Paul Smith</h1>
      <ul class="mb0 mt1 pl0 list f6">
        <li class="dib black-50">3 mins</li>
      </ul>
    </div>
  </div>
  <p class="f3 fw3 mt3 mb0">
    What a time to be alive! So many front-end resources,
    so little time...
  </p>
</div>
{% endprism %}

## Mockup
![The Final Product]({{ site.baseurl }}/assets/img/posts/component-card.png)

Having read the play on tabular data, you’ve also identified a schema to represent your activity feed.

{% prism js %}
let posts = [
  {
    name: "Paul Smith",
    timeago: "3 mins",
    avatar: "http://placehold.it/50x50",
    status: "What a time to be alive! So many front-end resources..."
  },
  {
    name: "Jane Doe",
    timeago: "1 hour",
    avatar: "http://placehold.it/50x50",
    status: "Does anyone actually use Facebook stories?"
  },
  {
    name: "Alex Jackson",
    timeago: "2 hours",
    avatar: "http://placehold.it/50x50",
    status: "Best slice of pizza in NYC? Go."
  }
];
{% endprism %}

With our schema in place, let's get to the implementations.

***

## Implementation — Vanilla JS (ES6)

Here's the game plan:
- Write a function that takes a post object and returns a chunk of markup with the **name**, **timeago**, **avatar**, and **status** properties interpolated accordingly.

{% prism js %}
function post_markup(post) {
  return `
  <div class="bg-white ba b--black-10 pa3 mb3">
    <div class="flex">
      <img class="mr2" src="${post.avatar}" alt="" />
      <div>
        <h1 class="f6 mv0 blue">${post.name}</h1>
        <ul class="mb0 mt1 pl0 list f6">
          <li class="dib black-50">${post.timeago}</li>
        </ul>
      </div>
    </div>
    <p class="f3 fw3 mv3">${post.status}</p>
  </div>
`
}
{% endprism %}

- Iterate over the array of posts using `forEach`[^foreach]
- For each post, call the `post_markup` function and insert the return value into the DOM

{% prism js %}
posts.forEach(post => {
  let postElement = post_markup(post)
  stage.insertAdjacentHTML("beforeend", postElement);
});
{% endprism %}

<p data-height="400" data-theme-id="dark" data-slug-hash="JNWoZN" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Componentization - Vanilla JS (ES6)" data-preview="true" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/JNWoZN/">Componentization - Vanilla JS (ES6)</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Implementation — Vue JS

Here's the game plan:
- Construct a Vue instance, passing our array of posts to its `data` attribute

{% prism js %}
new Vue({
  el: "#app", // DOM element that wraps our list
  data: {
    posts: posts // our posts array from earlier
  }
});
{% endprism %}

- Define a Post component that takes a `post` object as its sole property and renders our post markup accordingly

{% prism js %}
Vue.component("Post", { // so we can access it in our markup
  props: ["post"], // each post component gets a post :)
  template: `
    <div class="bg-white ba b--black-10 pa3 mb3">
      <div class="flex">
        <img class="mr2" :src="post.avatar" alt="" />
        <div>
          <h1 class="f6 mv0 blue">{{ post.name }}</h1>
          <ul class="mb0 mt1 pl0 list f6">
            <li class="dib black-50">{{ post.timeago }}</li>
          </ul>
        </div>
      </div>
      <p class="f3 fw3 mv3">
        {{ post.status }}
      </p>
    </div>
  ` // please render this template
});
{% endprism %}

- Add the `<Post/>` component to our HTML, and use the `v-for` directive to iterate over our global array of posts

{% prism markup %}
<Post v-for="post in posts" :post="post"></Post>
{% endprism %}

<p data-height="400" data-theme-id="dark" data-slug-hash="zwZGxz" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Componentization - Vue JS" data-preview="true" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/zwZGxz/">Componentization - Vue JS</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Implementation — React JS

Here's the game plan:

- Make a stateless functional component called `<Post>` that accepts one post as a property

{% prism js %}
const Post = ({post}) => {
  return(
    <div className="bg-white ba b--black-10 pa3 mb3">
      <div className="flex">
        <img className="mr2" src={post.avatar} alt="" />
        <div>
          <h1 className="f6 mv0 blue">{post.name}</h1>
          <ul className="mb0 mt1 pl0 list f6">
            <li className="dib black-50">{post.timeago}</li>
          </ul>
        </div>
      </div>
      <p className="f3 fw3 mv3">
        { post.status }
      </p>
    </div>
  )
}
{% endprism %}

- Make another stateless functional component called `<PostList>` that accepts an _array_ of posts as a property and maps over it, returning individual `<Post>` components accordingly

{% prism js %}
const PostList = ({posts}) => {
  return(
    <div>
      {
        posts.map((post) => {
          return <Post post={post}/>
        })
      }
    </div>
  )
}
{% endprism %}

<p data-height="400" data-theme-id="dark" data-slug-hash="PmpwrV" data-default-tab="js,result" data-user="mattrothenberg" data-embed-version="2" data-preview="true" data-pen-title="Componentization - React JS" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/PmpwrV/">Componentization - React JS</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Footnotes
[^foreach]: [`forEach` on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach?v=example){:target="_blank"}
