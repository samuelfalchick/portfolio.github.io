// Blocs v4.2
document.addEventListener('DOMContentLoaded', function()
{
  	setUpNavExtras();
	setUpSpecialNavs();
	setUpLightBox();
	setUpVisibilityToggle();
	setUpClassToggle();
	setUpImgProtection();
	
	// Initialise Tool tips
	$('[data-toggle="tooltip"]').tooltip();

	document.querySelectorAll("a[onclick^=\"scrollToTarget\"]").forEach(function(targetObj){targetObj.addEventListener("click", function(e){e.preventDefault();});}); // Prevent page jump on scroll to links
	document.querySelectorAll(".nav-item [data-active-page]").forEach(function(targetObj){targetObj.classList.add(targetObj.getAttribute('data-active-page'));}); // Apply Active Link Classes

	// Internet Explorer Polyfill .closest()
	window.Element&&!Element.prototype.closest&&(Element.prototype.closest=function(e){var t,o=(this.document||this.ownerDocument).querySelectorAll(e),n=this;do{for(t=o.length;--t>=0&&o.item(t)!==n;);}while(t<0&&(n=n.parentElement));return n});

	// Internet Explorer Polyfill .matches()
	if (!Element.prototype.matches) {Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;};
})

// Loading page complete
window.addEventListener("load", function() 
{
	hideAll();
	inViewCheck();
	
	window.addEventListener("scroll", function() {
		inViewCheck();
		scrollBtnVisible();
		stickyNavToggle();
	});	

	var preloader = document.getElementById('page-loading-blocs-notifaction');
	
	// Remove page loading UI
	if (preloader)
	{
		preloader.classList.add('preloader-complete');
	}
})

// Set Up Special NavBars 
function setUpSpecialNavs()
{
	document.querySelectorAll(".navbar-toggler").forEach(function(targetObj)
	{
		targetObj.addEventListener("click", function(e)
		{
			var targetJSNav = e.target.closest('nav');
			var targetMenu = targetJSNav.querySelector('ul.site-navigation');
			var menuHTML = targetMenu.parentNode.innerHTML;
	
			if (targetMenu.parentNode.matches('.fullscreen-nav, .sidebar-nav')) // Special navigation menu
			{
				e.stopPropagation(); // Dont do this is normal menu in use
				targetMenu.parentNode.classList.add('nav-special');
				
				if (!e.target.classList.contains('selected-nav')) // Open menu
				{
					e.target.classList.add('selected-nav');
					var navClasses = targetJSNav.getAttribute('class').replace('navbar','').replace('row','').replace('hover-open-submenu','');
					var menuClasses = targetMenu.parentNode.getAttribute('class').replace('navbar-collapse','').replace('collapse','').replace('collapsing','');

					if (!document.querySelector('.content-tint'))
					{
						document.body.insertAdjacentHTML("beforeend","<div class=\"content-tint\"></div>");
					}

					// Add menu HTML
					document.querySelector(".page-container").insertAdjacentHTML("beforebegin","<div class=\"blocsapp-special-menu "+navClasses+"\"><blocsnav class=\""+menuClasses+"\">"+menuHTML+"</div>");

					// Add close button
					document.querySelector("blocsnav").insertAdjacentHTML("afterbegin","<a class=\"close-special-menu animated fadeIn animDelay06\"><div class=\"close-icon\"></div></a>");
					
					animateNavItems();
					
					setTimeout(function()
					{
						document.querySelector(".blocsapp-special-menu blocsnav").classList.add("open");
						document.querySelector(".content-tint").classList.add("on");
						document.body.classList.add("lock-scroll");

					}, 10);
				}
				else // Close menu
				{
					document.querySelector(".close-special-menu").remove();
					document.querySelector(".blocsapp-special-menu blocsnav").classList.remove("open");
					document.querySelector(".selected-nav").classList.remove("selected-nav");

					setTimeout(function()
					{
						document.querySelector('.blocsapp-special-menu').remove();
						document.body.classList.remove('lock-scroll');
						document.querySelector('.nav-special').classList.remove('nav-special');
					}, 300);
				}
			}
		})	
	});

	// Handle speical menu link click
	delegateSelector('body', "click", '.blocsapp-special-menu a', function(e)
	{
		if (!e.target.closest('.dropdown-toggle'))
		{
			hideNav();
		} 
	});

	// Handle tint and close button touch events
	delegateSelector('body', "mousedown touchstart", '.content-tint, .close-special-menu, .close-special-menu .close-icon', function(e)
	{
		hideNav();
	});

	// Hide special navigation menu
	function hideNav()
	{
		document.querySelector('.content-tint').classList.remove("on");
		document.querySelector('.selected-nav').click();
		setTimeout(function(){document.querySelector('.content-tint').remove();}, 10);
	}

	// Animate Nav Items
	function animateNavItems()
	{
		var delay = 0;
		var increaseVal = 60;
		var animationStyle = "fadeInRight";
	
		if (document.querySelector(".blocsapp-special-menu blocsnav").classList.contains("fullscreen-nav")) // Full Screen
		{
			animationStyle = "fadeIn";
			increaseVal = 100;
		}
		else if (document.querySelector(".blocsapp-special-menu").classList.contains("nav-invert")) // Inverted
		{
			animationStyle = "fadeInLeft";
		}

		document.querySelectorAll(".blocsapp-special-menu blocsnav li").forEach(navItem =>
		{	
			if (navItem.parentNode.classList.contains("dropdown-menu")) // Not dropdown menu
			{
				navItem.classList.add.apply(navItem.classList,["animated","fadeIn"]);	
			}
			else
			{
				delay += increaseVal; 
				navItem.classList.add.apply(navItem.classList,["animated",animationStyle]);	
				navItem.setAttribute("style","animation-delay:"+delay+"ms")
			}
		});
	}
}

// Extra Nav Functions
function setUpNavExtras()
{
	// Programically added nav item clicks
	delegateSelector('body', "click", '.dropdown-menu a.dropdown-toggle', function(e)
	{
		menuPosition(e.target);
	});

	document.querySelectorAll(".dropdown-menu a.dropdown-toggle").forEach(function(targetObj)
	{
		targetObj.addEventListener("click", function(e)
		{
			menuPosition(e.target);
		});
	});

	// Prevent multi level dropdown buttons resetting scroll position
	document.querySelectorAll("ul.dropdown-menu [data-toggle=dropdown]").forEach(function(targetObj)
	{
		targetObj.addEventListener("click", function(e)
		{
			e.stopPropagation();
		});
	});

	// Set Sub Menu Position
	function menuPosition(target)
	{
		var parentMenu = target.closest(".dropdown-menu");

		if (parentMenu)
		{
	        var subMenu = target.parentNode.querySelector(".dropdown-menu");
	    
	        if (!parentMenu.parentNode.classList.contains("navbar-nav"))
	        {
	        	if (!target.closest(".nav-special")) // Vanilla navigation
	        	{
	        		var x = (parentMenu.offsetWidth - 2);
	        		var targetMenu = target.parentNode.querySelector(".dropdown-menu");
	        		var targetMenuWidth = targetMenu.offsetWidth;
	        		subMenu.classList.remove('submenu-left');

	        		if (targetMenuWidth == 0)
	        		{
	        			targetMenuWidth = 160;
	        		}

	        		if ((parentMenu.getBoundingClientRect().left+targetMenuWidth+x) > window.innerWidth) // Offscreen
	        		{
	        			subMenu.classList.add('submenu-left');
	        		}
	        	}
	        }
		}
	}
}

// Scroll to target
function scrollToTarget(D,T)
{
	var speed = "1000";

	if (D == 0) // Next Bloc
	{
		D = T.closest('.bloc').offsetHeight;
	}
	else if (D == 1) // Top of page
	{
		D = 0;
	}
	else if (D == 2) // Bottom of page
	{
		D = document.documentElement.scrollHeight
	}
	else // Specific Bloc
	{
		D = document.querySelector(D).getBoundingClientRect().top + window.scrollY;

		var stickyNav = document.querySelector(".sticky-nav");

		if (stickyNav) // Has sticky navigation
		{
			D -= stickyNav.offsetHeight;
		}
	}

	if (T.matches("[data-scroll-speed]")) // Use assigned scroll speed
	{
		speed = parseInt(T.getAttribute("data-scroll-speed"));
	}

	scrollTo(D, speed,easeInOutQuad);

	function scrollTo(c,e,d){d||(d=easeInOutQuad);
	var a=document.documentElement;
	if(0===a.scrollTop){var b=a.scrollTop;
	++a.scrollTop;a=b+1===a.scrollTop--?a:document.body}
	b=a.scrollTop;0>=e||("object"===typeof b&&(b=b.offsetTop),
	"object"===typeof c&&(c=c.offsetTop),function(a,b,c,f,d,e,h){
	function g(){0>f||1<f||0>=d?a.scrollTop=c:(a.scrollTop=b-(b-c)*h(f),
	f+=d*e,setTimeout(g,e))}g()}(a,b,c,0,1/e,20,d))};
	function easeInOutQuad(t){return t<.5 ? 2*t*t : -1+(4-2*t)*t;}
}

// Sticky Nav Bar Toggle On / Off
function stickyNavToggle()
{
	var stickyNav = document.querySelector(".sticky-nav");

	if (stickyNav)
	{
		var targetRect = stickyNav.getBoundingClientRect();
		var offsetVal = (targetRect.top + window.scrollY); // Offset Value

		var classes = ["sticky"]; // Classes
		var targetContainer = document.querySelector(".page-container");
		var isFillScreenSticky = stickyNav.classList.contains('fill-bloc-top-edge');
		
		if (isFillScreenSticky) // Nav in Hero Bloc
		{
			targetContainer = document.querySelector(".fill-bloc-top-edge.sticky-nav").parentNode;
			classes = ["sticky","animated","fadeInDown"];
		}

		if (stickyNav.classList.contains('sticky')) // Use original offset
		{
			offsetVal = stickyNav.getAttribute('data-original-offset')
		}

		var currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

		if (currentScrollTop > offsetVal) // Scroll Window
		{  
			if (!stickyNav.classList.contains('sticky')) // Add Sticky
			{
				stickyNav.classList.add.apply(stickyNav.classList,classes);
				stickyNav.setAttribute("data-original-offset",offsetVal);

				offsetVal = stickyNav.offsetHeight;

				if (isFillScreenSticky)
				{
					stickyNav.style.background = getBlocBgColor(targetContainer);
					offsetVal += parseInt(targetContainer.style.paddingTop); 
				}

				targetContainer.style.paddingTop = offsetVal;
			}
		}
		else if (stickyNav.classList.contains('sticky')) // Remove Sticky
		{
			stickyNav.classList.remove.apply(stickyNav.classList,classes);
			stickyNav.removeAttribute("style");
			targetContainer.removeAttribute("style");
		}
	}	
}

// Get Bloc Background Color
function getBlocBgColor(targetContainer)
{
	var bgColor = window.getComputedStyle(targetContainer ,null).getPropertyValue('background-color');
	if (targetContainer.classList.contains('b-parallax')) bgColor = window.getComputedStyle(targetContainer.querySelector('.parallax') ,null).getPropertyValue('background-color');
	if (bgColor == "rgba(0, 0, 0, 0)") bgColor = '#FFFFFF'; // Prevent Transparent
	return bgColor;
}

// Hide all animation elements
function hideAll()
{
	document.querySelectorAll('.animated').forEach(targetObj =>
	{	
		if ((!document.body.classList.contains('mob-disable-anim')) || (document.body.classList.contains('mob-disable-anim') && window.innerWidth > 767))
		{
			var targetRect = targetObj.getBoundingClientRect();
			var targetObjX = targetRect.top + (targetObj.offsetHeight/3);
			
			if (targetObjX > window.innerHeight) // Animation item below fold
			{
				targetObj.classList.remove("animated");
				targetObj.classList.add("hideMe");
			}
		}
	});
}

// Check if object is inView
function inViewCheck()
{	
	const hiddenItems = [].slice.call(document.querySelectorAll('.hideMe'), 0).reverse();
	
	hiddenItems.forEach(targetObj =>
	{
		var targetRect = targetObj.getBoundingClientRect();
		var offsetTop = (targetRect.top + window.scrollY);
		var a = offsetTop + targetObj.offsetHeight;
		var b = window.pageYOffset + window.innerHeight;
		
		if (targetObj.offsetHeight > window.innerHeight) // If object height is greater than window height
		{
			a = offsetTop
		}

		if (a < b) 
		{	
			var objectClass = targetObj.className.replace('hideMe','animated');
			targetObj.style.visibility = "hidden";
			targetObj.removeAttribute("class");

			setTimeout(function(){
				targetObj.style.visibility = "visible";
				targetObj.setAttribute('class',objectClass);
			},0.01);

			// Listen for animation end events
			var animEvents = ["webkitAnimationEnd", "mozAnimationEnd", "oAnimationEnd", "animationEnd"];
			animEvents.forEach(function(e)
			{
			  	window.addEventListener(e, function(event)
			  	{
			  		targetObj.classList.remove(targetObj.getAttribute("data-appear-anim-style"));
				});
			});			
		}
	});
};

// Handle Scroll To Top Button Visibility
function scrollBtnVisible()
{
	var scrollBtn = document.querySelector('.scrollToTop');

	if (scrollBtn)
	{
		if (window.pageYOffset > (window.innerHeight/3))
		{	
			if (!scrollBtn.classList.contains('showScrollTop'))
			{
				scrollBtn.classList.add('showScrollTop');
			}	
		}
		else
		{
			scrollBtn.classList.remove('showScrollTop');
		}
	}
};

// Toggle Visibility
function setUpVisibilityToggle()
{
	document.querySelectorAll("[data-toggle-visibility]").forEach(function(targetObj)
	{
		targetObj.addEventListener("click", function(e)
		{
			e.preventDefault();
			var targetID = e.currentTarget.getAttribute('data-toggle-visibility');
			var targeArray = [targetID];

			if (targetID.indexOf(',')!=-1) // Has multiple targets
			{
				targeArray = targetID.split(',');
			}
			
			targeArray.forEach(function(targetID)
			{
				toggleVisibility(document.getElementById(targetID));
			});
		});
	});

	function toggleVisibility(targetObj)
	{
		if (!targetObj.classList.contains('toggled-item')) // Add toggle class
		{
	      	targetObj.classList.add('toggled-item');
		}

	    if (window.getComputedStyle(targetObj, null).getPropertyValue("height") == '0px' || targetObj.classList.contains('object-hidden')) // Show
	    {
	      	targetObj.classList.remove('object-hidden');
	      	targetObj.style.removeProperty("display");
	      	targetObj.style.height = 'auto';
	      	var height = targetObj.clientHeight + 'px';
	      	targetObj.style.height = '0px';
	      	setTimeout(function (){targetObj.style.height = height;}, 0);
	      	setTimeout(function (){targetObj.style.minHeight = height;targetObj.style.removeProperty("height");}, 360);
	    }
	    else // Hide
	    {
			targetObj.style.height = targetObj.scrollHeight + 'px'; // Start height
			targetObj.style.removeProperty("min-height"); // Remove min-height
			window.setTimeout(function (){targetObj.style.height = "0";  if (targetObj.style.height == 0){targetObj.style.display = "none";}}, 0); // Set height to 0
		}

		reCalculateParallax();
	} 
}

// Toggle Classes On Objects
function setUpClassToggle()
{
	document.querySelectorAll("[data-toggle-class-target]").forEach(function(targetObj)
	{
		targetObj.addEventListener("click", function(e)
		{
			e.preventDefault();
			var targetID = e.currentTarget.getAttribute('data-toggle-class-target');
			var targetClass = e.currentTarget.getAttribute('data-toggle-class');

			if (targetClass.length)
			{
				if (targetID.indexOf(',')!=-1) // Multiple
				{
					var targeArray = targetID.split(',');

					targeArray.forEach(function(targetID)
					{
						document.getElementById(targetID).classList.toggle(targetClass);
					});
				}
				else // Single
				{
					document.getElementById(targetID).classList.toggle(targetClass);
				}

				reCalculateParallax();
			}
		});
	});
}

// Light box support
function setUpLightBox()
{
	window.targetJSLightbox;

	document.querySelectorAll("[data-lightbox]").forEach(function(lightboxObj)
	{
		lightboxObj.addEventListener("click", function(e) // Create lightbox Modal
		{
			e.preventDefault();

			targetJSLightbox = lightboxObj;

			var lightBoxPath = targetJSLightbox.getAttribute('data-lightbox');
			var caption = targetJSLightbox.getAttribute('data-caption');
			var lightBoxFrame = targetJSLightbox.getAttribute('data-frame');
			var protectionClass = "";
			var autoplay = "";

			if (targetJSLightbox.getAttribute('data-autoplay') == 1) // Has auto play
			{
				autoplay = "autoplay";
			}

			 // Check for image protection
			var lightboxImg = targetJSLightbox.querySelector('img');

			if (lightboxImg)
			{
				if (lightboxImg.classList.contains('img-protected'))
				{
					protectionClass = "img-protected";
				}
			}

			// Assign Modal
			var lbModal = document.querySelector('#lightbox-modal');

			// Remove old Modal
			if (lbModal)
			{
				lbModal.remove();
			}

			// Navigation icons
			var leftArrow = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 32 32"><path class="lightbox-nav-icon lightbox-prev-icon" d="M22,2L9,16,22,30"/></svg>';
			var rightArrow = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 32 32"><path class="lightbox-nav-icon lightbox-next-icon" d="M10.344,2l13,14-13,14"/></svg>';
			var closeIcon = '<svg class="lightbox-close-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32"><path class="lightbox-close-icon" d="M4,4L28,28"/><path class="lightbox-close-icon" d="M28,4L4,28"/></svg>';

			
			var customModal = '<div id="lightbox-modal" class="modal fade"><div class="modal-dialog modal-dialog-centered modal-lg"><div class="modal-content '+lightBoxFrame+' blocs-lb-container"><button id="blocs-lightbox-close-btn" type="button" class="close-lightbox" data-bs-dismiss="modal" aria-label="Close">'+closeIcon+'</button><div class="modal-body"><a href="#" class="prev-lightbox" aria-label="prev">'+leftArrow+'</a><a href="#" class="next-lightbox" aria-label="next">'+rightArrow+'</a><img id="lightbox-image" class="img-fluid mx-auto '+protectionClass+'" src="'+lightBoxPath+'"><div id="lightbox-video-container" class="embed-responsive embed-responsive-16by9"><video controls '+autoplay+' class="embed-responsive-item"><source id="lightbox-video" src="'+lightBoxPath+'" type="video/mp4"></video></div><p class="lightbox-caption">'+caption+'</p></div></div></div></div>';
		    document.body.insertAdjacentHTML("beforeend",customModal);
		    setUpLightboxNavigation();
		    setUpLightboxSwipe();

		    // Re-assign modal
			lbModal = document.querySelector('#lightbox-modal');

			if (lightBoxFrame == "fullscreen-lb") // Full screen lightbox
			{
				lbModal.classList.add("fullscreen-modal");
				document.querySelector("#blocs-lightbox-close-btn").remove();
				lbModal.insertAdjacentHTML('beforeend',"<a class=\"close-full-screen-modal animated fadeIn\" style=\"animation-delay:0.5s;\" data-bs-dismiss=\"modal\">"+closeIcon+"</a>");
			}

			setLightboxUI();

			// Trigger BS Modal
			var lightboxModal = new bootstrap.Modal(document.querySelector('#lightbox-modal'),{});
			lightboxModal.show();

			// Close lightbox (required for BS4)
			delegateSelector('body', "click", "[data-bs-dismiss=\"modal\"]", function(e){lightboxModal.hide();});
		});
	});
	
	// Navigation Controls
	function setUpLightboxNavigation()
	{
		document.querySelectorAll(".next-lightbox, .prev-lightbox").forEach(function(navBtn)
		{
			navBtn.addEventListener("click", function(e)
			{
				e.preventDefault();
				var lightBoxLinks = document.querySelectorAll("a[data-lightbox]");
				
				if (targetJSLightbox.getAttribute('data-gallery-id')) // Has Gallery ID so use
				{
					var galleryID = targetJSLightbox.getAttribute("data-gallery-id");
					lightBoxLinks = document.querySelectorAll("a[data-gallery-id=\""+galleryID+"\"]");
				}

				// Target Index (Next Item)
				var targetIdx = Array.from(lightBoxLinks).indexOf(targetJSLightbox)+1;

				if (navBtn.classList.contains("prev-lightbox")) // Previous
				{
					targetIdx -= 2;
				}

				if (targetIdx > -1 && lightBoxLinks.length > targetIdx)
				{
					targetJSLightbox = lightBoxLinks[targetIdx];
					setLightboxUI();
				}
			});
		});
	}

	// Set up the required UI for lightbox item
	function setLightboxUI()
	{
		// User Interfaces
		var imageUI = document.querySelector("#lightbox-image");
		var captionUI = document.querySelector(".lightbox-caption");
		var videoUI = document.querySelector("#lightbox-video-container");

		imageUI.style.display = "block";
		captionUI.style.display = "none";
		videoUI.style.display = "none";

		// Media File Path
		var filePath = targetJSLightbox.getAttribute("data-lightbox");

		if (filePath.substring(filePath.length-4) == ".mp4") // Video Object
		{
			var autoplay = "";

			if (targetJSLightbox.getAttribute("data-autoplay") == 1) // Add Auto Play
			{
				autoplay = "autoplay";
			}

			imageUI.style.display = "none";
			videoUI.style.display = "block";
			videoUI.innerHTML = "<video controls "+autoplay+" class=\"embed-responsive-item\"><source id=\"lightbox-video\" src=\""+filePath+"\" type=\"video/mp4\"></video>";	
		}
		else // Image Object
		{
			imageUI.setAttribute("src",filePath);

			var caption = targetJSLightbox.getAttribute('data-caption');

			if (caption)
			{
				captionUI.innerHTML = caption;
				captionUI.style.display = "block";
			}
		}

		var prevBtn = document.querySelector(".prev-lightbox");
		var nextBtn = document.querySelector(".next-lightbox");
		prevBtn.style.display = "block";
		nextBtn.style.display = "block";

		var lightBoxLinks = document.querySelectorAll("a[data-lightbox]");
		
		if (targetJSLightbox.getAttribute('data-gallery-id')) // Has Gallery ID
		{
			var galleryID = targetJSLightbox.getAttribute('data-gallery-id');
			lightBoxLinks = document.querySelectorAll("a[data-gallery-id=\""+galleryID+"\"]");
		}

		var idx = Array.from(lightBoxLinks).indexOf(targetJSLightbox);

		if (idx == 0) // Hide Previous
		{
			prevBtn.style.display = "none";

			if (lightBoxLinks.length == 1) // Hide Next (No other lightbox items)
			{
				nextBtn.style.display = "none";
			}
		}
		else if (idx == lightBoxLinks.length-1) // Hide Next
		{
			nextBtn.style.display = "none";
		}
	}

	// Setup Lightbox Swipe Support
	function setUpLightboxSwipe()
	{
		const gestureZone = document.getElementById("lightbox-image");

		if (gestureZone)
		{
			// Register swipe events
			let touchstartX=0,touchstartY=0,touchendX=0,touchendY=0;gestureZone.addEventListener("touchstart",function(e){touchstartX=e.changedTouches[0].screenX,touchstartY=e.changedTouches[0].screenY},!1),gestureZone.addEventListener("touchend",function(e){touchendX=e.changedTouches[0].screenX,touchendY=e.changedTouches[0].screenY,handleGesture()},!1);

			function handleGesture()
			{
				var prevBtn = document.querySelector(".prev-lightbox");
				var nextBtn = document.querySelector(".next-lightbox");

			    if (touchendX <= touchstartX)
			    {
			        if (nextBtn.style.display != "none") // Swipe left
					{
						nextBtn.click();
					}
			    }
			    
			    if (touchendX >= touchstartX) // Swipe right
			    {
			        if (prevBtn.style.display != "none")
					{
						prevBtn.click();
					}
			    }
			}
		}
	}

	// Keyboard Navigation
	window.addEventListener("keydown", event => 
	{	
  		var targetBtn = document.querySelector('.prev-lightbox');

  		if (event.which == 37 || event.which == 39) // Left & Right Arrows
	  	{
	  		if (event.which == 39) // Arrow Right
	  		{
	  			targetBtn = document.querySelector('.next-lightbox');
	  		}

	  		if (targetBtn.style.display != "none") // Lightbox Back
			{
				targetBtn.click();
			}
	  	}
	  	else if (event.which == 27) // Escape - Close
	  	{
			document.getElementById('blocs-lightbox-close-btn').click();
	  	}
	});
}

// Set Up Image protection
function setUpImgProtection()
{
	document.querySelectorAll(".img-protected").forEach(function(targetObj)
	{
		targetObj.addEventListener("contextmenu", function(e){e.preventDefault();});
		targetObj.addEventListener("mousedown", function(e){e.preventDefault();});
	});
}

// Recalculate Parallax
function reCalculateParallax()
{
	if (document.querySelector(".b-parallax"))
	{
		var parallax = document.querySelectorAll(".parallax__container .parallax");
		parallax.forEach(targetObj =>{targetObj.style.height = "100%";});
		setTimeout(function(){calculateHeight(parallax,3)}, 400);
	}
}

// Add multi level dropdown support
$.fn.dropdown=function(){var o=$.fn.dropdown;return function(d){"string"==typeof d&&"toggle"===d&&($(".has-child-dropdown-show").removeClass("has-child-dropdown-show"),$(this).closest(".dropdown").parents(".dropdown").addClass("has-child-dropdown-show"));var n=o.call($(this),d);return $(this).off("click.bs.dropdown"),n}}(),$(function(){$("body").on("click",'.dropdown [data-toggle="dropdown"]',function(o){$(this).dropdown("toggle"),o.stopPropagation()}),$("body").on("hide.bs.dropdown",".dropdown",function(o){$(this).is(".has-child-dropdown-show")&&($(this).removeClass("has-child-dropdown-show"),o.preventDefault()),o.stopPropagation()}),$('.dropdown [data-toggle="dropdown"]').on("click",function(o){$(this).dropdown("toggle"),o.stopPropagation()}),$(".dropdown").on("hide.bs.dropdown",function(o){$(this).is(".has-child-dropdown-show")&&($(this).removeClass("has-child-dropdown-show"),o.preventDefault()),o.stopPropagation()}),$("a.dropdown-toggle").click(function(o) {o.preventDefault();})});

// Add Event Listeners to Programically Added Elements
function delegateSelector(e,t,c,n){t.split(" ").forEach(t=>{var a=document.querySelectorAll(e);[].forEach.call(a,function(e,a){e.addEventListener(t,function(e){e.target.matches(c)&&n(e)})})})}
