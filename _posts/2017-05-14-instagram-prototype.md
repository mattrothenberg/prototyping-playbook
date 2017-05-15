---
layout: post
title:  "Prototyping Instagram's Filter UX"
date: 2017-05-12 09:00:00 -0400
permalink: 'instagram-prototype'
categories: ['Vue']
---

To those who claim you can't prototype mobile UIs with the tools of the web, I raise you the following tutorial. In this play, we'll use Vue JS to re-create a workflow from Instagram's mobile app: uploading a photo and applying a filter.

## Scenario
You're an enterprising front-end developer convinced that the sky is the limit when it comes to prototyping with HTML, CSS, and Javascript. You tell your friends that you can prototype the "Apply Filter" workflow from Instagram's mobile app in under an hour. Go.

## Mockup
<div style="width: 100%; height: 0px; position: relative; padding-bottom: 55.625%;"><iframe src="https://streamable.com/s/gayvr/hpvrww" frameborder="0" width="100%" height="100%" allowfullscreen style="width: 100%; height: 100%; position: absolute;"></iframe></div>


## Rundown

The best advice I can give you (or anyone else who's looking to become a stronger prototyper) is **don't re-invent the wheel.** As this advice relates to the task at hand, the first thing we should do is identify libraries and plugins that give us some of the functionality from the video above. My gut tells me there are two particulary tricky bits:

- The touch-enabled carousel of photo filters
- The photo filters themselves

A quick Google search for a library or plugin far outweighs a futile attempt to hand-roll this functionality ourselves. I've identified the following libraries that will help us with today's task.

- [Flickity](https://flickity.metafizzy.co/){:target="_blank"} – a library for creating "touch, responsive, flickable carousels"
- [CSSGram](https://una.im/CSSgram/) – a library for recreating Instagram filters with CSS filters and blend modes

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

- Pull in Flickity via CDN
- Pull in CSSGram via CDN
- Gather all our filters as defined in CSSGram

https://codepen.io/mattrothenberg/pen/bWKeNe?editors=1011
