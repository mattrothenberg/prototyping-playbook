---
layout: post
title:  "Working with Tabular Data"
date:   2017-05-04 16:23:10 -0400
permalink: 'working-with-tabular-data'
---

Designing tables in Sketch can be downright frustrating. And despite the myriad plugins that advertise "[an] easy way to populate your design with meaningful data," I'm convinced that code is often a better tool for the job. This play will get you up and iterating over data sets with Javascript, like a pro, in ~5 minutes.

## Scenario
Let’s suppose you’re designing a dashboard and you need to turn a raw, CSV export of project data into a beautiful table.

![The Final Product]({{ site.baseurl }}/assets/img/posts/working-with-data.png)

## Rundown
The key to this play is identifying a schema to represent your data. Luckily, if you have a CSV dump to work with, the schema is likely right before your eyes.

{% prism md %}
Name,Budget,Lead
Uber for Cats,$1,000,000,Jane Smith
Twitter for Puppies,$10,000,000,John Doe
Lyft for Fish,$15,000,000,Sally Stevenson
{% endprism %}

Each row of data has a **name**, **budget**, and **lead**. And so, we can represent any given row of our dataset as a Javascript Object, using those descriptors as properties:

{% prism js %}
let project = {
  name: 'Uber for Cats',
  budget: '$1,000,000',
  lead: 'Jane Smith'
}
{% endprism %}

Now, we can collect each individual project object in a Javascript Array:

{% prism js %}
let projects = [
  {
    name: 'Uber for Cats',
    budget: '$1,000,000',
    lead: 'Jane Smith'
  },
  {
    name: 'Twitter for Puppies',
    budget: '$10,000,000',
    lead: 'John Doe'
  },
  {
    name: 'Lyft for Fish',
    budget: '$15,000,000',
    lead: 'Sally Stevenson'
  }
]
{% endprism %}

We’re done with the hard part. Let’s see how to get this list of projects onto the page.

***

## Implementation — Vanilla JS (ES6)

Here's the game plan:
- Iterate over our Array of projects using `forEach`[^foreach]
- For each project, build a template literal that represents a table row, interpolating the **name**, **budget**, and **lead**

{% prism javascript %}
let tableRow = `
<tr>
  <td class="pa3 bb b--black-10">
    ${project.name}
  </td>
  <td class="pa3 bb b--black-10">
    ${project.budget}
  </td>
  <td class="pa3 bb b--black-10">
    ${project.lead}
  </td>
</tr>
`
{% endprism %}

- Insert the newly created table row into the DOM using `insertAdjacentHTML`[^insertadjacent]

<p data-height="400" data-theme-id="dark" data-slug-hash="mmmmYY" data-default-tab="html,result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Table - Vanilla JS (ES6)" data-preview="true" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/mmmmYY/">Table - Vanilla JS (ES6)</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Implementation - Vue JS

Here’s the game plan:

- Construct a Vue instance, passing our array of projects to its data attribute

{% prism javascript %}
new Vue({
  el: '#app',
  data: {
    projects: [
      {
        name: 'Uber for Cats',
        budget: '$1,000,000',
        lead: 'Jane Smith'
      },
      // etcetera
    ]
  }
})
{% endprism %}

- Leverage the `v-for` syntax in our HTML to iterate over our array of projects and display each one

{% prism html %}
{% raw %}
<tr v-for="project in projects">
  <td class="pa3 bb b--black-10">{{ project.name }}</td>
  <td class="pa3 bb b--black-10">{{ project.budget }}</td>
  <td class="pa3 bb b--black-10">{{ project.lead }}</td>
</tr>
{% endraw %}
{% endprism %}

<p data-height="400" data-theme-id="dark" data-slug-hash="RVVgrX" data-default-tab="html,result" data-user="mattrothenberg" data-embed-version="2" data-preview="true" data-pen-title="Table - Vue.js" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/RVVgrX/">Table - Vue.js</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Implementation — React JS

Here's the game plan

- Make a stateless functional component called `<ProjectsTable>` . This component should accept a list of projects as a property.

{% prism javascript %}
const ProjectsTable = ({projects}) => (
  // nothing to see here
)
{% endprism %}

- Map over the list of projects and return a table row for each, interpolating the name, budget, and lead.

{% prism javascript %}
<tbody>
  {
    projects.map((project) => {
      return(
        <tr>
          <td className="pa3 bb b--black-10">{ project.name }</td>
          <td className="pa3 bb b--black-10">{ project.budget }</td>
          <td className="pa3 bb b--black-10">{ project.lead }</td>
        </tr>
      )
    })
  }
</tbody>
{% endprism %}

<p data-height="400" data-theme-id="dark" data-slug-hash="wddeWG" data-default-tab="result" data-user="mattrothenberg" data-embed-version="2" data-pen-title="Table - React JS" data-preview="true" class="codepen">See the Pen <a href="http://codepen.io/mattrothenberg/pen/wddeWG/">Table - React JS</a> by Matt Rothenberg (<a href="http://codepen.io/mattrothenberg">@mattrothenberg</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Footnotes
[^foreach]: [`forEach` on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach?v=example){:target="_blank"}
[^insertadjacent]: [`insertAdjacentHTML` on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML){:target="_blank"}
