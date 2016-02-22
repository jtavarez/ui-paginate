# ui-paginate

![uiPaginate](http://jasontavarez.com/x/uipagination.png)

Flexible pagination generation using pure javascript, no dependencies. Created to be as versatile as possible: you can let it create page links and split up element rows accordingly in your html, or use underlying data object to create your own interface and logic.

##### Caveats/Immediate goals
1. This is still an early release, so you may see certain quirks. Please submit feedback if you find anything!
2. Better documentation and examples are my priority
3. Logic is more or less all in place but certain variable names may change
3. Will add unit tests later on
4. Need to finalize testing across browsers. This has been working so far on all modern browsers and IE9+

### Usage

**Install**

Via NPM

1. `npm install ui-paginate`
2. `import uiPaginate from ‘uiPaginate’`

Via old-fashioned way

1. Download raw file in `dist` folder
2. Link to it in \<head> of document


**Initialize**

````
var pager = uiPaginate({
	items : ’tr.row’,
	paginateContainer : ‘#pagination’
})
````

Where items are the html elements you need grouped by page and paginateContainer is where the links will go. You can also pass in a number or array and work directly with the data object that is used to create the html elements (no DOM needed), and there are many more configuration options available (see below)

#### Instance Methods

**info()**

Call at any point to retrieve pertinent info on paginated items. You can use this to customize logic and interface if needed. Returns following object

````javascript
{
	// Currently selected page
 	current: 0

	// Index of the first and last items within the selected page
 	firstItemIndex: 0
	lastItemIndex: 9

 	isFirst: true
 	isLast: false
 	isNearStart: true
 	isNearEnd: false

	// Representing the previous and next pages
 	next: 1
 	prev: 0

	// General information
 	itemsPerPage: 10
  	totalItems: 300
 	totalPages: 30
}
````

In addition to the generated html links which handle user input, you can also programmatically set pages with the following methods.

**setPage(number)**

Sets current page to specified number. Remember that this is a zero-based index, similar to dealing with arrays.

**next(), prev()**

Increments and decrements the current page, respectively. The default value of 1 can be changed

**redo(config)**

Recreates pagination object, where any new configuration options are merged with existing options. You call this method anytime results or item count chnages and you need to 'recount' pages. In those cases you call this method with `items` property

#### Configuration options

What you see below are all the default options used to create uiPaginate instance, and can be changed when passing in config object 

````javascript
var defaultOptions = {
  
	// Only required option, can be one of the following
    // 1) String representing selector : 'tr.row'
    // 2) Nodelist (can be jQuery!) : $('tr.row)
    // 3) Array, where length will be used
    // 4) Integer
    // Providing #3-4 assumes you will add extra logic for showing items
 	items : null,
    
	itemsPerPage : 10,
 	startingPage : 0,
 	
    // Where pagination elements are appended to. Leaving as false
    // assumes you will implement your own pagination controls
    // (utilizing info() object). Expects a String selector
	paginateContainer : false,
	
    // Given to every pagination element
 	className : 'page-link',
	
    // Prepended before certain classes for more granular styling
    // (button, disabled, first, last)
    prefix : 'page-',
    // Labels for First and Last buttons, or set to false to hide
	
    skipLabels : ['First', 'Last'],
 	// Show '1' and last page '#' in addition to First and Last buttons
    skipLabelsInclusive : true,
	
    // Labels to show for Previous and Next increments, or false to hide
    incrementLabels : ['Prev', 'Next'],
	incrementCounter : 1,
	
    // Shown on either side of centerPages when needed. Can set to false to hide,
    // though that isn't recommended
	divider : "...",
    
    // Don't create pagination elements if its just one page. Set to true
    // if there's heavy user interaction (i.e., updating
    // page results with filter options)
	displaySinglePage : false,
	
    // Number of pages to show on each side. Can be also false or 0
    marginPages : 2,
	
    // Number of pages to show in middle
    centerPages : 5
	
    // Tag used to create elements. Can be 'div','span','a','li','th', or 'td'
    element : "span",

    // Hooks
  	// Function that will be called whenever page changes
    // Info parameter is passed containing new pagination info
    // (same as calling info() method)
	onPageSelected : (info){}
}
````

Examples coming soon! Feel free to submit issues or provide feedback.
