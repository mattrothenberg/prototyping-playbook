---
layout: post
title:  "Prototyping Instagram's Filter UX"
date: 2017-05-12 09:00:00 -0400
permalink: 'instagram-prototype'
categories: ['Vue', 'Long Form']
---

To those who claim you can't prototype mobile user interfaces with the tools of the web, I raise you the following tutorial. In this play, we'll use Vue JS to re-create a workflow from Instagram's mobile app: uploading a photo and applying a filter.

**Warning: this is a long-form tutorial, so feel free to tackle it one step at a time.**

***

## Scenario
You're convinced that the sky is the limit when it comes to prototyping with HTML, CSS, and Javascript. You tell your friends that you can prototype the "Apply Filter" workflow from Instagram's mobile app in under an hour. Go.

## Mockup
<div style="width: 100%; height: 0px; position: relative; padding-bottom: 55.625%;"><iframe src="https://streamable.com/s/gayvr/hpvrww" frameborder="0" width="100%" height="100%" allowfullscreen style="width: 100%; height: 100%; position: absolute;"></iframe></div>

## Rundown

The best advice I can give you (or anyone else who's looking to become a stronger prototyper) is **don't re-invent the wheel.** As this advice relates to the task at hand, the first thing we should do is identify libraries and plugins that give us some of the functionality from the mockup above. My gut tells me there will be four particularly tricky features:

- The touch-enabled, draggable carousel of photo filters
- The photo filters themselves
- The touch-enabled slider to adjust the strength of the chosen filter
- The fade transitions throughout the workflow

Seriously. A quick Google search for a library or plugin _far_ outweighs a futile attempt to hand-roll this functionality yourself. I've identified the following libraries that will help us with today's task.

- [Flickity](https://flickity.metafizzy.co/){:target="_blank"} – a library for creating "touch, responsive, flickable carousels"
- [CSSGram](https://una.im/CSSgram/){:target="_blank"} – a library for recreating Instagram filters with CSS filters and blend modes
- [noUISlider](https://refreshless.com/nouislider/){:target="_blank"} – a lightweight JavaScript range slider
- [Animate.css](https://daneden.github.io/animate.css/){:target="_blank"} – Just-add-water CSS animations

Let's get to coding.

## Step 1: Scaffold the Project

<p data-height="547" data-theme-id="0" data-slug-hash="xdzwQo" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Step 1: Scaffold Vue Instance [Instagram Prototype]" data-preview="true" class="codepen">See the Pen <a href="https://codepen.io/mattrothenberg/pen/xdzwQo/">Step 1: Scaffold Vue Instance [Instagram Prototype]</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

As mentioned above, we'll be using Vue JS to build the prototype. By now, you should be a pro at scaffolding Vue instances. As a refresher,
let's add the following combination of markup and Javascript to the mix.

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

Believe it or not, the code above will serve as the foundation for the rest of tutorial. We'll soon begin to see some magical coordination between our parent Vue instance, and the components we build along the way.

## Step 2: Implement the Photo Upload Feature

<p data-height="482" data-theme-id="0" data-slug-hash="XRYmLQ" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Step 2: Implement Photo Upload [Instagram Prototype]" data-preview="true" class="codepen">See the Pen <a href="https://codepen.io/mattrothenberg/pen/XRYmLQ/">Step 2: Implement Photo Upload [Instagram Prototype]</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### Game Plan

There's a lot going on here, so let's try to break down the feature into steps:

- User **clicks** an empty state **component**
- User is prompted to select a photo via the **native file dialog**
- User selects a photo
- User then sees the selected photo **instead** of the empty state

The reason why I put some of the above words in **bold** is because they should trigger associations in your Vue JS brain.
- **Click**: we're probably going to use the `@click` directive
- **Component**: we're probably going to encapuslate markup and state into a `<component>`
- **Native File Dialog**: we're probably going to need an `<input type="file"/>`
- **Instead**: we're probably going to need to conditionally render some content with `v-if`

Let's kick things off by creating a component called `<empty-state>`. This component is responsible for rendering a box with a dashed border–our "empty state"–as well as a hidden `<input type="file"`>.

Why a hidden input? It is notoriously difficult to style HTML5 file inputs. One workaround involves putting an input in the DOM and hiding it with CSS. In order for the browser to open the native file dialog, this input must receive a click event. How it gets clicked, and how the client then handles what the user uploads, though, is totally up to us.

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

We don't want users to _see_ the vanilla file input; instead, we want the entire empty state to be clickable. So, we can add an `@click` directive to the outermost div in our `<empty-state>` component. The function that we provide to this directive, `triggerFilePicker()`, is just responsible for sending a click event to the hidden file input so that the native file picker pops up.

{% prism js %}
methods: {
  // 'refs' is an easy way to keep track of
  // different elements in your component
  triggerFilePicker: function () {
    this.$refs.upload.click()
  }
}
{% endprism %}

Getting the native file picker to appear is one thing. Handling the user's photo selection is another. To accomplish that task, we can add an `@change` directive to the file input itself. The function that we provide to this directive is called after a user has selected photo from their computer. In our case, we want to encode the selected photo as a base64 string, and immediately `$emit` that information back to the parent Vue instance (since it is responsible for all things "state management" in our prototype).

In our case, we want to **$emit** that information back to our parent Vue instance, who is responsible for responsible for all-things-state-management in our prototype.

{% prism js %}
methods: {
  handlePhotoUpload: function (e) {
    let self = this
    let reader = new FileReader()
    reader.onload = function(e) {
      // phone home with the base64 string
      self.$emit('photo-uploaded', e.target.result)
    }
    reader.readAsDataURL(e.target.files[0])
  }
}
{% endprism %}

### Child Component ↔️ Parent Instance Communication

Any time we emit an event from a child component, we **must** do two more things.

  1. Define a method on our Vue instance that is responsible for handling the emitted event
  2. Pass that method down to the child component using the `v-on` directive

As mentioned above, the `photo-uploaded` event is responsible for emitting the base64 encoded photo string back to the parent instance. Currently, though, our parent instance doesn't have any state. Let's add a `photo` key to the instance's data field, initialize it as an empty string, and define a method `setPhoto` that sets the emitted base64 string to this property.


{% prism js %}
// etcetera
  data: {
    photo: '',
  },
  methods: {
    setPhoto: function (photoString) {
      this.photo = photoString
    }
  }
// etcetera
{% endprism %}

Now, when we place the `<empty-state>` component into our markup, we can use the `v-on` directive to map the name of emitted event to the appropriate handler method from our parent instance.

{% prism markup %}
<!-- we emit 'photo-uploaded' -->
<!-- we want 'setPhoto' to be called -->
<empty-state v-on:photo-uploaded="setPhoto"></empty-state>
{% endprism %}

### Conditional Rendering

Finally, we want to hide the empty state once a user has uploaded a photo. Vue offers a handful of template directives (v-if, v-show, v-else) to help you show and hide content conditionally. Each directive takes a Javascript expression that gets evaluated and renders the attached content accordingly.

{% prism markup %}
<empty-state
  v-if="noPhotoUploaded"
  v-on:photo-uploaded="setPhoto">
</empty-state>
<img
  v-if="photoUploaded"
  :src="photo"/>
{% endprism %}

Those Javascript expressions, `noPhotoUploaded` and `photoUploaded`, don't exist yet. Let's define them as computed properties on our parent Vue instance, since their values are _functions_ of the `photo` attribute on our instance's data model.

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

Nice work. Before moving on, I encourage you to repeat this step until you're comfortable with coordinating events between child components and the parent Vue instance. This maneuver plays an integral part in the following steps. If you still don't understand this concept, feel free to reach out on Twitter ([@mattrothenberg](https://twitter.com/@mattrothenberg){:target="_blank"}) or via GitHub!

## Step 3: Componentization

<p data-height="700" data-theme-id="0" data-slug-hash="wdXMpx" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Step 3: Make it Prettier [Instagram Prototype]" class="codepen">See the Pen <a href="https://codepen.io/mattrothenberg/pen/wdXMpx/">Step 3: Make it Prettier [Instagram Prototype]</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

Vue encourages us to pull out components as much as possible. Looking at the mockup, I see a few different components.

- A **header** with the Instagram logo, "Back" and "Next" buttons
- A **preview** of our upload photo and the applied filter
- A scrollable **list of filters**
- A **slider** to adjust the strength of the applied filters

Here's a rough diagram for visual learners:

![The Final Product]({{ site.baseurl }}/assets/img/posts/component-breakdown.png){: .w-100.w-50-l.db.center }

And so, our markup should look something like the following. Note that we're passing `photo` as a prop to both the `<photo-preview>` and `<filter-list>` components. This should make sense, considering both components need to have an awareness of this state in order to render a preview of the uploaded photo.

{% prism markup %}
<main class="flex flex-column h-100" v-if="photoUploaded">
  <app-header></app-header>
  <photo-preview :photo="photo"></photo-preview>
  <filter-list :photo="photo"></filter-list>
</main>
{% endprism %}

I'm going to omit the Javascript implementation of these components, since they are solely responsible (at the moment) for taking a prop and rendering markup accordingly.

## Step 4: Implement the Filter List Carousel
<p data-height="700" data-theme-id="0" data-slug-hash="bWKeNe" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Step 4: Filter List Carousel [Instagram Prototype]" data-preview="true" class="codepen">See the Pen <a href="https://codepen.io/mattrothenberg/pen/bWKeNe/">Step 4: Filter List Carousel [Instagram Prototype]</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### Grab The Filters

First things first, let's pull in two of our third-party libraries, Flickity and CSSGram, via CDN.

{% prism markup %}
<script src="https://cdnjs.cloudflare.com/ajax/libs/flickity/2.0.5/flickity.pkgd.min.js"></script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/cssgram/0.1.10/cssgram.min.css"/>
{% endprism %}

CSSgram is a "library for editing images with Instagram-like filters directly using CSS. [It works by] applying color and/or gradient overlays via various blending techniques to mimic filter effects."[^cssgram]

As such, it provides 20+ classes that we can apply to both the `<photo-preview>` component, and the thumbnails inside of our `<filter-list>` carousel.

Since our prototype will make use of both the display name _and_ class name of each filter, it will be helpful to build a data structure that we can populate with this information. Let's write a function that generates an Array of `filter` objects, setting the display name, class name, and default strength (of 100) on each. In a later step, it will become clear why we generate this list with a function, instead of hard-coding it on our parent instance's data model.

{% prism js %}
const generateFilters = () => {
  return [
   { displayName: '1977', className: '_1977', strength: 100 },
   { displayName: 'Aden', className: 'aden', strength: 100 },
   { displayName: 'Brannan', className: 'brannan', strength: 100 }
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

### Build The Carousel

Let's update our `<filter-list>` component so that it dynamically renders a carousel of Instagram filters. There are two steps to this dance.

- Use the `v-for` directive to iterate over the list of `filters` that we received as a prop. We can pluck the `className` attribute off each `filter` object and apply it to the `filter-preview` DIV to create the appearance of a "thumbnail"

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

- Instantiate the Flickity library once the component is mounted, so that our inline list of filters turns into a touch-enabled carousel

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

So far so good! We now have a beautiful carousel of filters. But nothing happens when you tap on one of them.

That's a sub-optimal user experience. Fortunately, it's one that can be improved by **writing more code**.

## Selecting a Filter

When a user taps a filter, we want to do two things:

1. Scroll that particular filter into the center of the viewport
2. Apply that filter to the `<photo-preview>` component so that we can see what the filter actually does to the photo

We can begin by adding an `@click` directive to each carousel item inside the `v-for` loop. When clicked, we'll call our component's `selectFilter` function to handle the aforementioned tasks.

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

The first line of our `selectFilter` function tells the Flickity library to scroll the element at the given `index` into the center of the viewport.

The second line, however, is another example of child-parent communication. In this scenario, we want to tell the parent Vue instance that a user has chosen the filter living at `index` on its `filters` array. Once equipped with that information, our parent Vue instance can pass the correct filter filter to the `<photo-preview>` component, thereby "applying" the filter to our glorious preview image.

Let's see how we can orchestrate that maneuver.

First, let's modify our parent Vue instance in a couple of ways.

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

And now, we can use the `v-on` directive to map the emitted event `filter-selected` to the parent Vue instance's `setFilter` method. Voilà

{% prism markup %}
<filter-list
   v-on:filter-selected="setFilter"
   :active-index="activeFilterIndex"
   :filters="filters"
   :photo="photo">
</filter-list>
{% endprism %}

## Updating the Photo Preview

Now for the grand finalé, let's update the `<photo-preview>` component so that it takes an additional prop, `active-class`. With this class, we can dynamically apply the correct filter to the large preview image when a user selects an item in the filter carousel.

Vue provides the `v-bind:class` directive to add a dynamic list of classes to a DOM element.

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

That last feature was a doozy. Let's build something simpler this time around, say, a back button that removes the uploaded photo and takes you back to the initial, empty state.

In our `<app-header>` component, let's add an `@click` directive to the button that contains the "Back" icon.

{% prism markup %}
<button @click="goBack">
  <i class="material-icons">keyboard_arrow_left</i>
</button>
{% endprism %}

And let's implement the `goBack` method that gets called when our button is clicked.

{% prism js %}
// Inside <app-header>
methods: {
  goBack: function () {
    this.$emit('go-back')
  }
}
{% endprism %}

By now you probably remember that, whenever we $emit an event, we must define a corresponding method on our parent Vue instance to handle it. In this case, we'll set the `photo` string back to an empty one, and our `activeFilterIndex` to zero.

{% prism js  %}
// Inside the parent Vue instance
methods: {
  resetApp: function () {
    this.photo = ''
    this.activeFilterIndex = 0
  }
}
{% endprism %}

To finalize this coordination, let's register the `go-back` event by using `v-on` directly on our `<app-header>` component.

{% prism markup %}
<app-header v-on:go-back="resetApp"></app-header>
{% endprism %}


## Step 6: Implement The Filter Strength Slider

<p data-height="700" data-theme-id="0" data-slug-hash="LyreEV" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Step 6: Filter Strength Slider [Instagram Prototype]" data-preview="true" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/LyreEV/">Step 6: Filter Strength Slider [Instagram Prototype]</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

Phew! One more major feature and we'll be on the home stretch.

First, let's pull in noUiSlider and its dependencies via CDN.

{% prism markup %}
<script src="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/9.2.0/nouislider.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/wnumb/1.1.0/wNumb.min.js"></script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/9.2.0/nouislider.min.css"/>
{% endprism %}

### The Slider Component

Next, let's create a component called `<strength-slider>`. This component will have a few responsibilities:

- It will appear conditionally (as a function of a user "double tapping" a filter)
- When it appears, it will initialize an instance of noUiSlider
- When that slider is dragged, it will emit its value (the "strength" of the filter) to the parent Vue instance
- It will also show a "Done" button that, when clicked, will hide the slider and show the `<filter-list>` component

The markup for this component is fairly straightforward.

{% prism js %}
// in the Strength Slider component
template:
  `<div class="pa5">
    <div id="slider"></div>
    <div class="mt4 tc">
      <button @click="hideFilterStrength" class="fw6 f6 ttu black bn bg-white">Done</button>
    </div>
  </div>`,
{% endprism %}

Once the component has mounted, we can initialize noUiSlider and hook into the library's event system. Each noUiSlider instance emits an 'update' event that we can listen to and handle accordingly. In our case, on `update`, we want to $emit an event to our parent Vue instance indicating that the currently selected filter's strength has been adjusted.

{% prism js %}
// in the Strength Slider component
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
  slider.on('update', function (e) {
   let newVal = e[0]
   self.$emit('adjusted-filter-strength', newVal)
  })
}
{% endprism %}

We also ought to implement the `hideFilterStrength` method that's being passed to the "Done" button's `@click` directive.

{% prism js %}
methods: {
  hideFilterStrength: function () {
    this.$emit('hide-filter-strength')
  }
},
{% endprism %}

We're emitting two different events, and we haven't yet updated our parent Vue instance! Let's get to it.

{% prism js %}
// parent Vue component
data: {
  showingFilterStrength: false,
},
computed: {
  activeFilterStrength: function() {
    return this.filters[this.activeFilterIndex].strength
  },
},
methods: {
  hideFilterStrength: function () {
    this.showingFilterStrength = false
  },
  adjustFilterStrength: function (strength) {
    this.filters[this.activeFilterIndex].strength = strength
  }
}
{% endprism %}

And finally, let's finish orchestrating the child-parent communication here with the `v-on` directive.

{% prism markup %}
<strength-slider
 v-if="showingFilterStrength"
 :active-strength="activeFilterStrength"
 v-on:hide-filter-strength="hideFilterStrength"
 v-on:adjusted-filter-strength="adjustFilterStrength">
</strength-slider>
{% endprism %}

### The Filter List Component

As currently implemented, our slider component will never appear, since the expression inside its `v-if` directive, `showingFilterStrength` is hard-coded to false.

So, let's update our filter carousel so that when a filter is "double tapped", that expression evalutes to true and thus shows the `<strength-slider>` component.

For our intents and purposes, a "double tap" is when a user selects a filter whose index matches the `activeFilterIndex` attribute on our parent vue Instance. That means that users can _single_ tap any filter to apply it, and tap it once more to toggle the `<strength-slider>` component.

Here's a GIF that should shed light on what's happening under the hood.

<div style="width:100%;height:0px;position:relative;padding-bottom:199.142%;"><iframe src="https://streamable.com/s/7j90n/crygrq" frameborder="0" width="100%" height="50%" allowfullscreen style="width:100%;height:100%;position:absolute;left:0px;top:0px;overflow:hidden;"></iframe></div>

{% prism js %}
selectFilter: function (index) {
  if (this.activeIndex === index) {
    this.$emit('filter-double-tapped', index)
  }

  this.flickityInstance.select(index)
  this.$emit('filter-selected', index)
}
{% endprism %}

Since we're now emitting an event from the `<filter-list>` component, we have to add a handler to our parent Vue instance...

{% prism js %}

// parent Vue instance
methods: {
  showFilterStrength: function () {
    this.showingFilterStrength = true
  }
}
{% endprism %}

...and finish the orchestration with a `v-on` directive on the component itself.

{% prism markup %}
<filter-list
   v-if="!showingFilterStrength"
   v-on:filter-double-tapped="showFilterStrength"
   v-on:filter-selected="setFilter"
   :active-index="activeFilterIndex"
   :filters="filters"
   :photo="photo">
</filter-list>
{% endprism %}

### The Photo Preview Component

Our Photo Preview component has a newfound responsibility: showing the user a preview of their photo, given the selected filter **and** its strength.

Accordingly, we'll need to make a few updates.

1. Update the `template` field on our component to render two `div`s, one stacked on top of the other. We're doing this to create a crude "mask"
2. Read the `activeFilterStrength` value from our `<strength-slider>` as a prop, and use that to determine how transparent the top div should be (i.e., how "strong" the filter should appear)

{% prism js %}
Vue.component('photo-preview', {
  props: ['photo', 'activeClass', 'activeStrength'],
  computed: {
    photoAsBackgroundImageUrl: function () {
      return `url(${this.photo})`
    },
    filterOpacity: function () {
      return this.activeStrength / 100
    }
  },
  template: `
    <div class="relative flex-auto h-100">
      <div v-bind:style="{backgroundImage: photoAsBackgroundImageUrl}"
           class="w-100 h-100 bg-center cover absolute top-0 left-0 bottom-0 right-0 z-4">
      </div>
      <div v-bind:class="[activeClass]"
           v-bind:style="{opacity: filterOpacity, backgroundImage: photoAsBackgroundImageUrl}"
           class="w-100 h-100 bg-center cover absolute top-0 left-0 bottom-0 right-0 z-5">
       </div>
    </div>
  `
})
{% endprism %}

### The Back Button
Since our parent Vue instance now has more state (by keeping track of the `strength` attribute on each filter object), we must reset these values when a user clicks the back button.

You may recall that we generate our list of filters at runtime by passing the `generateFilters` function to our parent Vue instance's `filters` data attribute and calling it.

To effectively "reset" this list of filters, let's just do that maneuever one more time

{% prism js %}
// parent Vue instance
methods: {
  resetApp: function () {
    this.photo = ''
    this.activeFilterIndex = 0
    this.filters = generateFilters() // hello, goodbye
  }
}
{% endprism %}

## Step 7: The Final Act – "Make it Pop" with Transitions
<p data-height="700" data-theme-id="dark" data-slug-hash="MmXGrd" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Step 7: Transitions [Instagram Prototype]" data-preview="true" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/MmXGrd/">Step 7: Transitions [Instagram Prototype]</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

We made it to the final step. The prototype "works," but we can add transitions here and there to make things a bit smoother. Let's pull in our final third-party library, **Animate.css**, via CDN.

{% prism markup %}
<link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css"/>
{% endprism %}

By default, Vue doesn't animate the entrance or exit of conditionally rendered elements (via `v-if`). We can change that by wrapping said conditionally rendered components in a `<transition>` component. All this component asks is that you provide instructions for how the transition should work.

An amazing (and in-depth) explanation of Vue transitions can be found in the official docs. For now, suffice it to say that by adding a list of classes to the `enter-active-class` and `leave-active-class` directives, we can choreograph animations.[^docs]

## Fade Out Empty State / Fade In Photo Preview

This one is easy! Let's wrap our sibling `<empty-state>` and `<main>` tags in a `<transition>` tag. We'll use the `fadeIn` and `fadeOut` classes provided by Animate.css as the enter / leave classes respectively.

{% prism markup %}
<transition
  name="mainStageTransition"
  enter-active-class="animated fadeIn"
  leave-active-class="animated fadeOut">
  <empty-state v-if="noPhotoUploaded"></empty-state>
  <main v-if="photoUploaded">
    <!-- implementation details -->
  </main>
</transition>
{% endprism %}

### Fade Out Filter List / Fade In Strength Slider

This one is easy, too! Let's wrap our sibling `<filter-list>` and `<strength-slider>` components in a `<transition>` tag. Again we'll use `fadeIn` and `fadeOut` to choreograph the transition. This time, though, we'll provide the `out-in` mode so that the active element transitions out first, then when complete, the new element transitions in.

{% prism markup %}
<transition
  name="filterAreaTransition"
  mode="out-in"
  enter-active-class="animated fadeIn"
  leave-active-class="animated fadeOut">
  <filter-list
    v-if="!showingFilterStrength">
  </filter-list>
  <strength-slider
    v-if="showingFilterStrength">
  </strength-slider>
</transition>
{% endprism %}


### Fade Out Header / Fade In Active Filter Name

This one is a bit more complex. When the `<strength-filter>` component is visible, we want to hide the back button, Instagram logo, and next button, and instead show the active filter name. We'll need to make a few code changes to achieve this effect.

- Add a computed property to our parent Vue instance, `activeFilterName`, which returns the `displayName` attribute of the selected filter object
- Pass `showingFilterStrength` and `activeFilterName` as props to the `<app-header>` component
- Conditionally render the default elements (logo & buttons) and the active filter name in the `<app-header>` component

{% prism js %}
// parent Vue instance
computed {
  activeFilterName: function () {
    return this.filters[this.activeFilterIndex].displayName
  },
}
{% endprism %}

Now, let's update the template of our `<app-header>` component, adding two `<transition>` components for the different states that our header will live in

{% prism markup %}
<div class="flex items-center relative overflow-hidden app-header bb b--black-10">
    <transition
      mode="out-in"
      name="headerTransition"
      enter-active-class="animated fadeInUp"
      leave-active-class="animated fadeOutDown">
      <div v-if="!showingFilter" class="absolute top-0 left-0 right-0 bottom-0 w-100 flex items-center">
       <!-- back button, instagram logo, next button -->
     </div>
    </transition>
    <transition
      mode="out-in"
      name="filterTrans"
      enter-active-class="animated fadeInUp"
      leave-active-class="animated fadeOutDown">
       <div v-if="showingFilter" class="pl3">
          {{ activeFilter }}
       </div>
      </transition>
  </div>
{% endprism %}

## In Conclusion

We made it! Thanks so much for giving this article a read – I hope it wasn't too painful.

I apologize if any of the code snippets or explanations were unclear. **Please** don't hesitate to reach out with questions, comments, or general feedback.

Until then, Happy Prototyping!

## Footnotes
[^cssgram]: [`CSSGram` on GitHub](https://github.com/una/CSSgram){:target="_blank"}
[^docs]:[Vue JS Documentation](https://vuejs.org/v2/guide/transitions.html#Custom-Transition-Classes){:target="_blank"}
