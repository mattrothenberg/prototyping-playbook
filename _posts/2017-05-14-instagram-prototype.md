---
layout: post
title:  "Prototyping Instagram's Filter UX"
date: 2017-05-12 09:00:00 -0400
permalink: 'instagram-prototype'
categories: ['Vue']
---

To those who claim you can't prototype mobile UIs with the tools of the web, I raise you the following tutorial. In this play, we'll use Vue JS to re-create a workflow from Instagram's mobile app: uploading a photo and applying a filter. This is a long-form tutorial, so feel free to tackle it one step at a time!

## Scenario
You're an enterprising front-end developer convinced that the sky is the limit when it comes to prototyping with HTML, CSS, and Javascript. You tell your friends that you can prototype the "Apply Filter" workflow from Instagram's mobile app in under an hour. Go.

## Mockup
<div style="width: 100%; height: 0px; position: relative; padding-bottom: 55.625%;"><iframe src="https://streamable.com/s/gayvr/hpvrww" frameborder="0" width="100%" height="100%" allowfullscreen style="width: 100%; height: 100%; position: absolute;"></iframe></div>


## Rundown

The best advice I can give you (or anyone else who's looking to become a stronger prototyper) is **don't re-invent the wheel.** As this advice relates to the task at hand, the first thing we should do is identify libraries and plugins that give us some of the functionality from the video above. My gut tells me there are two particulary tricky bits:

- The touch-enabled carousel of photo filters
- The photo filters themselves
- The touch-enabled slider to adjust the filter strength

A quick Google search for a library or plugin far outweighs a futile attempt to hand-roll this functionality ourselves. I've identified the following libraries that will help us with today's task.

- [Flickity](https://flickity.metafizzy.co/){:target="_blank"} – a library for creating "touch, responsive, flickable carousels"
- [CSSGram](https://una.im/CSSgram/){:target="_blank"} – a library for recreating Instagram filters with CSS filters and blend modes
- [noUISlider](https://refreshless.com/nouislider/){:target="_blank"} – a lightweight JavaScript range slider

Let's get to coding.


## Step 1: Scaffold the Project

<p data-height="547" data-theme-id="0" data-slug-hash="xdzwQo" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Step 1: Scaffold Vue Instance [Instagram Prototype]" data-preview="true" class="codepen">See the Pen <a href="https://codepen.io/mattrothenberg/pen/xdzwQo/">Step 1: Scaffold Vue Instance [Instagram Prototype]</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

As mentioned above, we'll be using Vue to build our prototype. By now, you should be a pro at scaffolding Vue instances. As a refresher, let's add the following combination of markup and Javascript.

{% prism markup %}
{% raw %}
<div class="wrap vh-100 overflow-hidden" id="instagram">
  <div class="phone relative bg-white w-100 h-100">
    {{ testMessage }}
  </div>
</div>
{% endraw %}
{% endprism %}

{% prism js %}
new Vue({
  el: '#instagram',
  data: {
    testMessage: 'Nothing to see here...'
  }
})
{% endprism %}

## Step 2: Implement the Photo Upload Feature

<p data-height="482" data-theme-id="0" data-slug-hash="XRYmLQ" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Step 2: Implement Photo Upload [Instagram Prototype]" data-preview="true" class="codepen">See the Pen <a href="https://codepen.io/mattrothenberg/pen/XRYmLQ/">Step 2: Implement Photo Upload [Instagram Prototype]</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### Game Plan

There's quite a bit going here, so let's break down this feature into steps:

- User clicks an empty state on the screen
- User is prompted to select a photo
- User selects a photo
- User sees the selected photo instead of the empty state

We'll start by creating a component called `<empty-state>`. This component will render a box with a dashed border (our "empty state") as well as a hidden file `input`.

{% prism markup %}
<div
  class="..."
  @click="triggerFilePicker">
  <input
    ref="upload"
    @change="handlePhotoUpload"
    class="hide"  type="file">
  <h2 class="fw5 mv0 black-30">Click to upload a photo</h2>
</div>
{% endprism %}

{% prism css %}
.hide {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
}
{% endprism %}

### Event Handling

For clarification, it is notoriously difficult to style HTML5 file inputs. One workaround involves putting an input in the DOM and hiding it with CSS. In order for the browser to open the native file picker, this input must be clicked. How it gets clicked, and how the client handles what the user uploads, though, is totally up to us.

And so, we can add an `@click` handler to the outermost div which calls a function that triggers said "click." In order to handle the user's photo selection, we can add an `@change` handler to the file input itself. This handler triggers a function that encodes the selected photo as a base64 string and emits that information to the parent Vue instance.

{% prism js %}
Vue.component('empty-state', {
  template: `<div
    @click="triggerFilePicker"
    class="empty-state absolute tc top-1 left-1 right-1 bottom-1 flex items-center justify-center pa3 ba">
    <input @change="handlePhotoUpload" class="hide" ref="upload" type="file">
    <h2 class="fw5 mv0 black-30">Click to upload a photo</h2>
  </div>`,
  methods: {
    handlePhotoUpload: function (e) {
      let self = this
      let reader = new FileReader()
      reader.onload = function(e) {
        self.$emit('photo-uploaded', e.target.result)
      }
      reader.readAsDataURL(e.target.files[0])
    },
    triggerFilePicker: function () {
      this.$refs.upload.click()
    }
  }
})
{% endprism %}

### Child-Parent Communication

In the parent Vue instance, we need to define how we would like to handle events that are emitted by child components. We'll modify the instance by adding a `photo` key to its data field (initialized as an empty string), and defining a method that sets the value of the `photo` key to the encoded base64 string.

{% prism js %}
new Vue({
  el: '#instagram',
  data: {
    photo: '',
  },
  methods: {
    setPhoto: function (photoString) {
      this.photo = photoString
    }
    // We'll pass this method ^^ to the empty-state component
  }
})
{% endprism %}

When we place the `<empty-state>` component into our markup, we can use the `v-on` directive to ensure that when the `photo-uploaded` event is emitted, the newly defined `setPhoto` function is called.

{% prism markup %}
<empty-state v-on:photo-uploaded="setPhoto"></empty-state>
{% endprism %}

### Conditional Rendering

Finally, we want to replace the empty state with the uploaded photo. Vue offers a handful of template helpers (v-if, v-show, v-else , etc) to help you show and hide content conditionally. When the JavaScript expression passed to this directive evaluates to true, the element is rendered, and vice-versa.

{% prism markup %}
<empty-state v-if="noPhotoUploaded" v-on:photo-uploaded="setPhoto">
</empty-state>
<img :src="photo" v-if="photoUploaded" alt="Uploaded Photo"/>
{% endprism %}

All we have to do is define the two expressions, `noPhotoUploaded` and `photoUploaded` as computed properties on our parent Vue instance.

{% prism js %}
computed: {
  noPhotoUploaded: function () {
    return this.photo.length === 0
  },
  photoUploaded: function () {
    return this.photo.length > 0
  }
}
{% endprism %}

## Step 3: Componentization

<p data-height="700" data-theme-id="0" data-slug-hash="wdXMpx" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Step 3: Make it Prettier [Instagram Prototype]" class="codepen">See the Pen <a href="https://codepen.io/mattrothenberg/pen/wdXMpx/">Step 3: Make it Prettier [Instagram Prototype]</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

Vue encourages us to pull out components where possible. Looking at the finished product, I see a few different components:

- A **header** with the Instagram logo, "Back" and "Next" buttons.
- A **preview of our uploaded photo (and applied filter)**
  - Takes `photo` as a prop
- A **scrollable list of filters**
  - Takes `photo` as a prop

![The Final Product]({{ site.baseurl }}/assets/img/posts/component-breakdown.png){: .w-100.w-50-l.db.center }

Let's update our markup and Javascript accordingly. I'll omit the Javascript components from the tutorial, since they don't have any state (yet) and simply render HTML. Note, though, that we're passing down the `photo` to both the `<photo-preview>` and `<filter-list>` components.

{% prism markup %}
<main class="flex flex-column h-100" v-if="photoUploaded">
  <app-header></app-header>
  <photo-preview :photo="photo"></photo-preview>
  <filter-list :photo="photo"></filter-list>
</main>
{% endprism %}

## Step 4: Implement the Filter List Carousel
<p data-height="700" data-theme-id="0" data-slug-hash="bWKeNe" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Step 4: Filter List Carousel [Instagram Prototype]" data-preview="true" class="codepen">See the Pen <a href="https://codepen.io/mattrothenberg/pen/bWKeNe/">Step 4: Filter List Carousel [Instagram Prototype]</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

Time for the fun part. Let's formulate a step-by-step game plan.

## Just The Carousel

First things first, let's pull in two of our third-party libraries, Flickity and CSSGram, via CDN.

{% prism markup %}
<script src="https://cdnjs.cloudflare.com/ajax/libs/flickity/2.0.5/flickity.pkgd.min.js"></script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/cssgram/0.1.10/cssgram.min.css"/>
{% endprism %}

Next, let's generate a list of the filters provided by CSSGram, specifying the display name and class name of each. Since we'll eventually need to pass this list to our `<filter-list>` component as a property, let's go ahead and add it to our root instance's data model.

{% prism js %}
const generateFilters = () => {
  return [
   { displayName: '1977', className: '_1977', opacity: 1 },
   { displayName: 'Aden', className: 'aden', opacity: 1 },
   { displayName: 'Brannan', className: 'brannan', opacity: 1 }
   // etcetera
 ]
}

new Vue({
  el: '#instagram',
  data: {
    photo: '',
    filters: generateFilters()
  }
  // etcetera
})
{% endprism %}

{% prism markup %}
<filter-list
  :filters="filters"
  :photo="photo">
</filter-list>
{% endprism %}

Next, we need to modify our `<filter-list>` component so that it renders a **carousel** of available filters (applied to a thumbnail version of our uploaded photo). There are two steps to this dance.

1. Leverage the `v-for` directive to iterate over the list of filters we received as a prop. We'll pluck the `className` attribute off each `filter` object and apply it to the`filter-preview` div to let users know what that filter looks like.

{% prism js %}
Vue.component('filter-list', {
  props: ['photo', 'filters'],
  template: `
    <div class="filter-list pa3">
      <div class="tc dib mr3 filter" v-for="(filter, index) in filters">
        <h4 class="f5 fw5 mt0 mb2">{{ filter.displayName }}</h4>
      <div v-bind:class="[filter.className]" class="filter-preview aspect-ratio aspect-ratio--1x1">
        <div class="aspect-ratio--object cover" v-bind:style="{backgroundImage: photoAsBackgroundImageUrl}"></div>
      </div>
    </div>
  </div>`,
  // etcetera
})
{% endprism %}

2. Instantiate the Flickity library once the component is mounted, so that our static list of filters turns into a touch-enabled carousel

{% prism js %}
Vue.component('filter-list', {
  // stuff above here
  data: function () {
    return {
      flickityInstance: {}
    }
  },
  mounted: function () {
    this.flickityInstance = new Flickity(this.$el, {
      cellAlign: 'center',
      contain: true,
      initialIndex: 0,
      pageDots: false,
      setGallerySize: true,
      prevNextButtons: false
    })
  }
  // etcetera
})
{% endprism %}

So far so good. We have a beautiful carousel of filters. But nothing happens when you click on them! That's a sub-optimal user experience. Fortunately, it's one that can be fixed with **more code**.

## Selecting a Filter

When a user taps a filter, we want to do two things:

1. Scroll that filter into the center of the viewport
2. Apply that filter to the `<photo-preview>` component so that we can see what the filter actually does to the photo

We'll start by adding an `@click` directive to each carousel item. When clicked, we'll call the `selectFilter` function to handle the tasks above.

{% prism markup %}
<div class="tc dib mr3 filter"
    v-for="(filter, index) in filters"
    @click="selectFilter(index)">
  <!-- lol implementation details -->
</div>
{% endprism %}

{% prism js %}
methods: {
  selectFilter: function (index) {
    this.flickityInstance.select(index)
    this.$emit('filter-selected', index)
  },
},
{% endprism %}

The first line of `selectFilter` tells the Flickity library to scroll the element at the given `index` into the center of the viewport. The second line, however, is another example of parent-child communication. We want to tell the parent Vue instance know that the user has chosen the filter at index `index`. Equipped with that information, our parent instance can now tell the `<photo-preview>` component that the active filter is the one living at location `filters[filter]`. Let's check out how we can orchestrate this dance.

First, let's modify our parent Vue instance in a few ways.
1. Add an `activeFilterIndex` property to its data model and set it to zero
2. Add a computed property, `activeFilterClass`, so that we can dynamically (and automatically) pass the correct class name to the `<photo-preview>` component.
3. Add a method, `setFilter`, to handle the event we'll emit from the `<filter-list>` component

{% prism js %}
new Vue({
  el: '#instagram',
  data: {
    activeFilterIndex: 0,
    photo: '',
    filters: generateFilters()
  },
  computed: {
    activeFilterClass: function() {
      return this.filters[this.activeFilterIndex].className
    }
  },
  methods: {
    setFilter: function (filterIndex) {
      this.activeFilterIndex = filterIndex
    }
  }
})
{% endprism %}

Now, we can add the `v-on` directive to our `<filter-list>` component so that the emitted event ('filter-selected') triggers the parent Vue instance's `setFilter` method.

{% prism markup %}
<filter-list
   v-on:filter-selected="setFilter"
   :active-index="activeFilterIndex"
   :filters="filters"
   :photo="photo">
</filter-list>
{% endprism %}

## Updating the Preview

And for the grand finale, let's modify the `<photo-preview>` component so that it takes an additional property: `active-class`. This property will be the value of the parent Vue instance's computed property, `activeFilterClass`. We'll also update the component's template so that it dynamically applies `activeClass` via the `v-bind:class` directive.

{% prism markup %}
<photo-preview
 :active-class="activeFilterClass"
 :photo="photo"
 ></photo-preview>
{% endprism %}

{% prism js %}
Vue.component('photo-preview', {
  props: ['photo', 'activeClass'],
  computed: {
    photoAsBackgroundImageUrl: function () {
      return `url(${this.photo})`
    }
  },
  template: `
    <div
      v-bind:class="[activeClass]"
      class="photo-preview bg-center cover flex-auto"
      v-bind:style="{backgroundImage: photoAsBackgroundImageUrl}">
    </div>
  `
})
{% endprism %}

## Step 5: Implement the Back Button
<p data-height="700" data-theme-id="0" data-slug-hash="ZKRpzV" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Step 5: Back Button [Instagram Prototype]" data-preview="true" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/ZKRpzV/">Step 5: Back Button [Instagram Prototype]</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

That last feature was a doozy. Let's build something simpler this time around, say, a back button that removes your uploaded photo and takes you back to the initial, empty state.

In our `<app-header>` component, let's add an `@click` directive to the button that contains the "Back" icon.

{% prism markup %}
<button @click="goBack">
  <i class="material-icons">keyboard_arrow_left</i>
</button>
{% endprism %}

And let's implement the `goBack` method that gets called when our button is pressed.

{% prism js %}
// Inside <app-header>
methods: {
  goBack: function () {
    this.$emit('go-back')
  }
}
{% endprism %}

Whenever we emit an event, we need to define a corresponding method on our parent Vue instance to handle it. In this case, we'll set the photo string back to an empty one, and our active filter index to zero.

{% prism js  %}
// Inside the parent Vue instance
methods: {
  resetApp: function () {
    this.photo = ''
    this.activeFilterIndex = 0
  }
}
{% endprism %}

To finalize this coordination, let's register the `go-back` event by using `v-on` directly in the template where `<app-header>` is used.

{% prism markup %}
<app-header v-on:go-back="resetApp"></app-header>
{% endprism %}


## Step 6: Implement The Filter Strength Slider

<p data-height="700" data-theme-id="0" data-slug-hash="LyreEV" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Step 6: Filter Strength Slider [Instagram Prototype]" data-preview="true" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/LyreEV/">Step 6: Filter Strength Slider [Instagram Prototype]</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

Again, there's quite a bit going on in this feature. I'll do my best to break it down, step-by-step.

First, let's pull in noUiSlider and its dependencies via CDN.

{% prism markup %}
<script src="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/9.2.0/nouislider.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/wnumb/1.1.0/wNumb.min.js"></script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/9.2.0/nouislider.min.css"/>
{% endprism %}

Next, let's create a component called `<strength-slider>` that will house our filter strength slider.

{% prism js %}
Vue.component('strength-slider', {
  props: ['activeStrength'],
  template:
  `<div class="pa5">
    <div id="slider"></div>
    <div class="mt4 tc">
      <button class="fw6 f6 ttu black bn bg-white">Done</button>
    </div>
  </div>`,
  mounted: function () {
    let self = this
    let sliderEl = this.$el.querySelector('#slider')
    let options = {
     connect: [true, false],
     tooltips: true,
     format: wNumb({
      decimals: 0,
     }),
     start: [this.activeStrength],
      step: 1,
      range: {
       'min': [0],
       'max': [100]
      }
    }

    let slider = noUiSlider.create(sliderEl, options)
  }
})
{% endprism %}













Update past codepens to use "strength"
Update bg-center class on thumbnails
update app-header height

nouislider via cdn
