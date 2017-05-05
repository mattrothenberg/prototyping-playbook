---
layout: post
title:  Simulating Asynchronous Events
date:   2017-05-04 16:23:10 -0400
permalink: 'simulating-async-events'
---

Page refreshes are _so_ 2005. Single page applications (SPA) are the new hotness, and offer a variety of design challenges. One such challenge is letting users know what's happening while a request (e.g., a form submission) does it thing. This play will give you the fundamentals needed to prototype such situations.

## Scenario

Let’s suppose you’re designing a SPA. You want to introduce a pattern where a button that triggers an asynchronous event behind the scenes shows a spinner for the duration of the request.

<div style="width: 100%; height: 0px; position: relative; padding-bottom: 39.697%;"><iframe src="https://streamable.com/s/vggdh/zeqdud" frameborder="0" width="100%" height="100%" allowfullscreen style="width: 100%; height: 100%; position: absolute;"></iframe></div>

## Rundown

The key here is to understand the “states” in which our button will live.

In its **default** state, the button will show the text “Submit Form”. In its **loading** state, the button will hide that text and show a spinner instead.

And so, we can mark up our button accordingly, wrapping the "Submit Form" text in a span tag with the class `label`, and the spinner in a span tag with the class `spinner`.

{% prism markup %}
<button class="bg-blue bn white tc h3 fw6 w-100 relative">
  <span class="label">Submit Form</span>
  <span class="spinner absolute top-1 bottom-1 left-0 right-0">
    <!-- fancy SVG spinner goes here  -->
  </span>
</button>
{% endprism %}

For simplicity’s sake, we can choreograph the hiding of the label / display of the spinner by toggling the class `is-loading` on the parent button tag.

{% prism sass %}
button .spinner {
  opacity: 0; // Hide the spinner by default
  transition: opacity .2s ease-out;
}
button .label {
  display: block; // Show the label by default
}
button.is-loading {
  .label {
    display: none; // Hide the label when button 'is-loading'
  }
  .spinner {
    opacity: 1; // Show the spinner when button 'is-loading'
  }
}
{% endprism %}

Now, we can use Javascript to trigger this choreography on `click` of our button.

***

## Implementation — Vanilla JS (ES6)

Here's the game plan:

- Write a function named `showSpinner`. The function should do a few things:
  - Add the `is-loading` class to our button — kicking off the choreography described above.
  - Remove the `is-loading` class after a duration of two seconds
  - Set the `disabled` attribute on our button to true while the `is-loading` class is present, to prevent users from repeatedly triggering the sequence.

{% prism js %}
function showSpinner() {
  let button = this
  let isEnabled = !button.disabled; // Is the button enabled?

  if (isEnabled) { // If so
    button.disabled = true // Disable the button
    button.classList.toggle('is-loading') // Toggle the class

    setTimeout(() => { // And do the following after 2 seconds
      button.classList.toggle('is-loading') // Toggle the class
      button.disabled = false // Enable the button
    }, 2000)
  }
}
{% endprism %}

- Add a `click` event listener to our button which calls the showSpinner function.

{% prism js %}
// Thou shalt do my bidding when clicked
button.addEventListener('click', showSpinner)
{% endprism %}

<p data-height="400" data-theme-id="dark" data-slug-hash="qmmXoN" data-default-tab="html,result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Asynchronous Events - Vanilla JS (ES6)" data-preview="true" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/qmmXoN/">Asynchronous Events - Vanilla JS (ES6)</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Implementation — Vue JS

Here's the game plan:
- Construct a Vue instance and add a data property called `loading` to represent our button's loading state


{% prism js %}
new Vue({
  el: '#app',
  data: {
    loading: false // Button shouldn't spin by default :)
  },
  methods: {
    // nothing to see here
  }
})
{% endprism %}

- Mark up our button, adding the following:
  - A `@click` directive to which we can eventually attach an event listener
  - A `:disabled` attribute that we can enable/disable the button as a function of the loading state
  - A `:class` directive so that we can dynamically toggle the `is-loading` class with respect to our loading state

{% prism markup %}
<button
  @click="submitForm"
  :disabled="loading"
  v-bind:class="{'is-loading': loading}"
  class="bg-blue bn white tc h3 fw6 w-100 relative">
{% endprism %}

- Implement the `submitForm` method and add it to our instance’s methods property. Like in the previous example, this method should add the `is-loading` class and remove it after a duration of two seconds
- Fortunately, and thanks to Vue’s two-way data binding, we no longer have to manually set our button’s `disabled` attribute since it’s a function of our instance’s state

{% prism javascript %}
methods: {
  submitForm: function() {
    let self = this;
    self.loading = true; // set the instance's loading state to true

    setTimeout(() => {
      self.loading = false; // set it to false
    }, 2000) // After two seconds
  }
}
{% endprism %}

<p data-height="400" data-theme-id="dark" data-slug-hash="zwwpzO" data-default-tab="html,result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Asynchronous Events - Vue JS" data-preview="true" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/zwwpzO/">Asynchronous Events - Vue JS</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Implementation — React JS

Here's the game plan:

- Scaffold a React component (using the traditional `class` syntax) to represent our button

{% prism javascript %}
class SpinnerButton extends React.Component {
  constructor () {
    super ()

    this.state = { // Similar to Vue's 'data' property
      loading: false
    }
  }
}
{% endprism %}

- Implement our component's `render` method to appease the React gods. Note that we're only adding the `is-loading` class when our state's `loading` attribute is truthy.

{% prism javascript %}
render () {
  let buttonClass

  this.state.loading ? // Are you loading?
    buttonClass = 'is-loading' : // If so, add 'is-loading' class
    buttonClass = ''

  return(
    <button
      disabled={this.state.loading} // Disable if loading
      className={"bg-blue bn white tc h3 fw6 w-100 relative " + buttonClass}> // Dynamically add the 'is-loading' class
       {<!-- implementation details -->}
    </button>
  )
}
{% endprism %}

- Add an `onClick` handler to our button, and implement the function it calls

{% prism markup %}
<button onClick={this.submitForm.bind(this)}></button>
{% endprism %}

{% prism javascript %}
submitForm () {
  let self = this
  self.toggleSpinner()

  setTimeout(() => {
    self.toggleSpinner()
  }, 2000)
}
toggleSpinner () {
  this.setState({
    loading: !this.state.loading
  })
}
{% endprism %}

<p data-height="400" data-theme-id="dark" data-slug-hash="oWWpGz" data-default-tab="js,result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Asynchronous Events - React JS" data-preview="true" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/oWWpGz/">Asynchronous Events - React JS</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
