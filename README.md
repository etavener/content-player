# E-learning Content Player #

This content player is a code base for developing responsive interactive e-learning material.

This functions includes:
- Navigation between screens
- Lauching of modal popups
- Routing to screens
- HTML Template management (loading and destroying)
- Binding JSON data to HTML templates with Handlebars
- Trnsitions between screen
- Dispatching of HTML template lifecycle events (created, transition started, transition completed etc)
- Basic layout styling
- LMS communication (SCORM functionality) - saving, bookmarking, completion.
- Showing progress
- Debugging

How does it work
1. Loads the App.json
2. Loads the template for the chrome / general UI
3. Binds App.json data to the UI with Handlebars
2. Loads the Screens.json
3. Loads all the HTML templates required
4. Bind screens.json content object to each template
5. Go to required screen
6. Start transition to chosen screen (from URL)
