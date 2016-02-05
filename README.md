# E-learning Content Player #

This content player is a code base for developing responsive interactive e-learning material. I've used this successfully on many e-learning development projects.

Some of the libraries used:
- Backbone
- Handlebars for HTML templates
- jQuery
- Respond for media queries in old browsers
- Modernizr
- gsap for animations
- pipwerks.scorm for LMS SCORM calls

This functions includes:
- Navigation between screens
- Lauching of modal popups
- Routing to screens
- HTML Template management (loading and destroying)
- Binding JSON data to HTML templates with Handlebars
- Transitions between screens (slide, scroll, fade, parallax effect, 3d transitions) with gsap
- Dispatching of HTML template lifecycle events (created, transition started, transition completed etc)
- Basic layout styling
- LMS communication (SCORM functionality) - saving, bookmarking, completion.
- Showing progress
- Debugging

How does it work?
- Loads the App.json
- Loads the template for the chrome / general UI
- Binds App.json data to the UI with Handlebars
- Loads the Screens.json
- Loads all the HTML templates required
- Bind screens.json content object to each template
- Go to required screen
- Start transition to chosen screen (from URL)


