/*******************************************************************************
                             Gentle Anchors v1.2.6
********************************************************************************
* Author: Kendall Conrad of Angelwatt.com
* Home Page: http://www.angelwatt.com/coding/gentle_anchors.php
* Created: 2008-06-25
* Updated: 2016-04-23
* Description: Gentle Anchors is a page scrolling script for anchor and area tags on a page.
* License:
	This work is licensed under a Creative Commons Attribution-Share Alike
	3.0 United States License
	http://creativecommons.org/licenses/by-sa/3.0/us/
*******************************************************************************/
;(function(scope)
{
'use strict';

scope.Gentle_Anchors = function()
{
	//#### Script preferences ####
	// Recommended Speed Range: 4 to 40 (fast to slow) default value 12
	var scrollSpeed  = 12,     // Controls speed of scroll:
		shine        = true,   // Whether to use shine effect
		shineColor   = '#adf', // Background color for shine
		shineOutline = '#5af', // Outline color for shine; transparent for off
		shineMs      = 1000,   // milliseconds shine should last
		excluded = [ // array of exclusion patterns in regex format
			// example /exampleExclu[sion]{4}Pattern/
		],
	//#### End script preferences ####
		timer,      // Timer item
		elt = null, // the current clicked on element
		// Get the current URL page
		curPage = location.href.split('?')[0].split('#')[0],
		anchorOnPage = new RegExp("^" + curPage + "(\\?[^#]*)?#[a-zA-Z0-9:\._-]+");

	/**
	 * Setup href from link.
	 */
	var fxLinkClick = function(e)
	{
		e = e || window.event;
		var href = undefined,
			node = e.target ? e.target : e.srcElement;

		// Images wrapped with an anchor steal the event target
		if (node.nodeName.toUpperCase() === 'IMG' || node.href === undefined)
		{
			var parent = node.parentNode;
			if (parent !== undefined && parent.nodeName.toUpperCase() === 'A')
			{
				href = parent.href;
			}
		}
		else
		{
			href = node.href;
		}

		if (e.preventDefault)
		{
			e.preventDefault();
		}
		e.returnValue = false; // for IE
		return Setup(href);
	};

	/**
	 * Initialization, grabbing all anchors and adding onclick event
	 */
	var Init = function()
	{
		var a = document.getElementsByTagName('a'),
			area = document.getElementsByTagName('area'),
			links = [],
			x = 0,
			y = 0;

		// combine NodeLists together
		for (x = 0, y = a.length; x < y; links.push(a[x++]));
		for (x = 0, y = area.length; x < y; links.push(area[x++]));

		// Process each link and add event listener
		LBL:for (x = 0, y = links.length; x < y; x++)
		{
			// If the link is on the current page and has an anchor
			if (anchorOnPage.test(links[x].href))
			{
				// Check if the link matches the exclusion list
				for (var j = 0, k = excluded.length; j < k; j++)
				{
					if (excluded[j].test(links[x].href))
					{
						continue LBL;
					}
				}
				addClickListener(links[x]);
			}
		}
	};

	/**
	 * Adds a click listener to a node for links
	 */
	var addClickListener = (function()
	{
		// Return a function based on browser support
		if (window.addEventListener)
		{
			return function(node)
			{
				node.addEventListener('click', fxLinkClick, true);
			};
		}
		else if (window.attachEvent)
		{
			return function(node)
			{
				node.attachEvent('onclick', fxLinkClick);
			};
		}
		else
		{
			return function(node)
			{
				node['onclick'] = fxLinkClick;
			};
		}
	})();

	/**
	 * Set things up for the scrolling effect
	 * @param hash The URL (relative or absolute) containing the anchor hash
	 */
	var Setup = function(href)
	{
		if (href === undefined || !href.match(/#([^\?]+)/))
		{
			return true;
		}
		var doc = document,
			hash = href.match(/#([^\?]+)/)[1]; // get id, but not any query string

		// identify destination element
		if (doc.getElementById(hash))
		{
			elt = doc.getElementById(hash);
		}
		else if (doc.getElementsByName(hash)[0])
		{
			elt = doc.getElementsByName(hash)[0];
		}
		else
		{
			return true;
		}

		// Find scroll position to destination
		var dest = elt.offsetTop;

		for (var node = elt;
			node.offsetParent && node.offsetParent != doc.body;)
		{
			node = node.offsetParent;
			dest += node.offsetTop;
		}

		// fix for stupid IE
		if (navigator.appName.indexOf("Microsoft") != -1 &&
			parseFloat(navigator.appVersion.split("MSIE")[1]) < 8.0)
		{
			dest = elt.offsetTop;
		}
		clearTimeout(timer);
		var start = getPageY();
		// fix for back button
		location.hash = hash;      // jump to destination
		window.scrollTo(0, start); // then quickly jump back to scroll the distance

		var speed = parseInt(Math.abs(start - dest) / scrollSpeed);
		Scroll(speed, (dest - 10));   // minus 10 for padding
		return false;
	};

	/**
	 * Handles the scroll effect.
	 * @param step The pixels to scroll
	 * @param desty The destination in pixels down the page
	 */
	var Scroll = function(step, desty)
	{
		var doc = document,
			was = getPageY(),
			// find out how much to scroll by up/down
			amt = (was < desty) ? was + step : was - step;

		// Make sure we didn't go past
		if (Math.abs(was - desty) < step)
		{
			amt = desty;
		}
		window.scrollTo(0, amt);
		var now = getPageY(),
			// slow scroll down as approach
			diff = Math.abs(now - desty);

		// Less than one doesn't add well
		if (diff < 1)
		{
			step = 1;
		}
		else if (diff < step * 2)
		{
			step *= .6;
		}
		else if (diff < step * 6)
		{
			step *= .9;
		}

		// if we're at the right scroll position
		if (was === now)
		{
			window.scrollTo(0, desty);
			clearTimeout(timer); // clear interval
			if (shine)
			{
				setTimeout(function()
				{
					ShineOn();
				}, 400);
			}
			return;
		}
		timer = setTimeout(function()
		{
			Scroll(step, desty);
		}, 30);
	};

	/**
	 * Returns the current offset from the top of the page.
	 */
	var getPageY = function()
	{
		return window.pageYOffset ||
			document.documentElement.scrollTop ||
			document.body.scrollTop;
	};

	/**
	 * Highlght the target.
	 */
	var ShineOn = function()
	{
		var c = elt.style.backgroundColor,
			o = elt.style.outline;

		// Set the highlighting style
		elt.style.backgroundColor = shineColor;
		elt.style.outline = '1px solid ' + shineOutline;

		// Deactivate shine in a moment
		setTimeout(function()
		{
			ShineOff(c, o);
		}, shineMs);
	};

	/**
	 * Removes the shine effect.
	 * @param oldColor The color to use to restore background color
	 * @param oldOutline The outline property to use to restore to
	 */
	var ShineOff = function(oldColor, oldOutline)
	{
		elt.style.backgroundColor = oldColor;
		elt.style.outline = oldOutline;
	};

	/**
	 * Adds a function to run when the page has loaded the DOM
	 * @param fx The function to add to the event
	 */
	function appendOnLoad(fx)
	{
		try
		{ // For browsers that know DOMContentLoaded (FF, Safari, Opera)
			document.addEventListener('DOMContentLoaded', fx, false);
		}
		catch (e)
		{ // for IE and older browser
			try
			{
				document.addEventListener('load', fx, false);
			}
			catch (ee)
			{
				window.attachEvent('onload', fx);
			}
		}
	}

	appendOnLoad(Init);

	// Return public methods
	return {
		Setup:Setup
	};
}();

})(window);

