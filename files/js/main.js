var data;
var sorted = false;
var emptyReviewsVisible = false;
var retrievalTimeSet = false;
$.ajax({
  type: "GET",  
  url: "https://jb-review-bot.s3-ap-southeast-2.amazonaws.com/reviews1.csv",
  // url: "./reviews1.csv",
  dataType: "text",       
  success: function(response)  
  {
	data = $.csv.toArrays(response);
	generateHtmlTable(data, 1);
  }   
});
$.ajax({
  type: "GET",  
  url: "https://jb-review-bot.s3-ap-southeast-2.amazonaws.com/reviews2.csv",
  // url: "./reviews2.csv",
  dataType: "text",       
  success: function(response)  
  {
	data = $.csv.toArrays(response);
	generateHtmlTable(data, 2);
  }   
});
$.ajax({
  type: "GET",  
  url: "https://jb-review-bot.s3-ap-southeast-2.amazonaws.com/reviews3.csv",
  // url: "./reviews3.csv",
  dataType: "text",       
  success: function(response)  
  {
	data = $.csv.toArrays(response);
	generateHtmlTable(data, 3);
  }   
});
function generateHtmlTable(data, number) {
    var html = '<div class="store_review">';
    var isEmpty = false;
    var ratingTotal = 0;
    var reviewCount = 0;
    var retrievalDate = "";
    // Store the rating in a variable
    var rating = 0;
    var captionHtml = '';
    var timeHtml = '';
    var personHtml = '';
  	if(typeof(data[0]) === 'undefined') {
        return null;
  	} else {
		$.each(data, function( index, row ) {
			if(index != 0){
				html += '<div class="review">';
				$.each(row, function( index, colData ) {
					if(index == 1 || index == 2 || index == 4 || index == 5 || index == 7){
						if(index == 1 && colData == ''){
							isEmpty = true;
						}
						else if (index == 1 && colData != ''){
							isEmpty = false;
						}
						if(index == 1){
							captionHtml = '';
							if(isEmpty) {
								// Save caption html for after reviews are parsed
								captionHtml += '<p class="empty_caption">';
								captionHtml += colData;
								captionHtml += '</p>';
							}
							if(!isEmpty) {
								captionHtml += '<p class="caption">';
								captionHtml += colData;
								captionHtml += '</p>';
							}
							
						}
						if(index == 2){
							timeHtml = '';
							timeHtml += '<p class="time">';
							timeHtml += colData;
							timeHtml += '</p>';
						}
						if(index == 4){
							html += '<div class="rating" data-rating="' + Math.round(colData) + '">';
							// Add up ratings for average later
							ratingTotal += Math.round(colData);
							rating = Math.round(colData);
							reviewCount++;
							for (i = 0; i < colData; i++) {
							  html += '<img class="star" src="./files/img/star.png">';
							}
							if(rating < 5){
								for (j = rating; rating < 5; rating++) {
								  html += '<img class="star" src="./files/img/star_empty.png">';
								}
							}
							html += '</div>';
							// Add in the caption after the rating
							html += captionHtml;
						}
						if(index == 5){
							personHtml = '';
							// Save the person data for display after their image
							personHtml += '<p class="person">';
							personHtml += colData;
							personHtml += '</p>';
						}
						if(index == 7){
							html += '<img class="user_image" src="' + colData +'">';
							html += '<div class="person_container">'
							// Add in the person info time after image
							html += personHtml;
							// Add in the review time after the person info
							html += timeHtml;
							html += '</div>'
						}
					}
					if(index == 3){
						setRetrievalDateTime(colData)
					}
				});
				html += '</div>';
			}
		});

		var csvDisplay = '#csv-display-' + number;

		// Show average ratings 
		var average = ratingTotal / reviewCount;
  		var averageRounded = Math.round((average + Number.EPSILON) * 100) / 100;
		$(csvDisplay).next().find('span').html(averageRounded);

		//Add it all to the DOM
		$(csvDisplay).append(html);
  	}
}	
function createSlickSlider(){
	$('.slider').slick({
	    slidesToShow: 3,
	    slidesToScroll: 1,
	    autoplay: false,
	    responsive: [
	        {
	            breakpoint: 9999,
	            settings: "unslick"
	        },
	        {
	            breakpoint: 992,
	            settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
	            }
	        }
	    ]
	}).on('beforeChange', (event, slick, currentSlide, nextSlide) => {
	    if (currentSlide !== nextSlide) {
	        document.querySelectorAll('.slick-center + .slick-cloned').forEach((next) => {
	            // timeout required or Slick will overwrite the classes
	            setTimeout(() => next.classList.add('slick-current', 'slick-center'));
	        });
	    }
	});
}

function setRatings(){
	//Attaches a data attribute to the parent elements for sorting
	$('.rating').each(function(){
		$(this).parent().attr('data-rating', $(this).attr('data-rating'));
		$(this).removeAttr('data-rating')
	});
}
function changeSortStatus(thisElem, isSecondBtn){
	var interval;
	//If the second sort button is pressed
	//Hide the info button temporarily
	//to prevent overlap
	if(isSecondBtn){
		interval = setInterval(function(){
			if(thisElem.next().hasClass('show')){
				$('.information').removeClass('show');
			}
			else {
				$('.information').addClass('show');
			}
		}, 100);
	}
	else {
		clearInterval(interval);
	}
	if(!sorted){
		thisElem.next().addClass('show');
		thisElem.next().find('.first_identifier').html('worst');
		thisElem.next().find('.second_identifier').html('best');
		sorted = true;
		setTimeout(function(){
			thisElem.next().removeClass('show');
		}, 1200);
	}
	else {
		thisElem.next().addClass('show');
		thisElem.next().find('.first_identifier').html('best');
		thisElem.next().find('.second_identifier').html('worst');
		sorted = false;
		setTimeout(function(){
			thisElem.next().removeClass('show');
		}, 1200);
	}
}
function sortRatingsOnClick(){
	$('#sort_btn_1').click(function(){
		$('#csv-display-1 .store_review').append($('#csv-display-1 .store_review .review').sort(function(a,b){
			if(!sorted){
			   return a.getAttribute('data-rating')-b.getAttribute('data-rating');
			}
			else {
			   return b.getAttribute('data-rating')-a.getAttribute('data-rating');
			}
		}));
		changeSortStatus($(this), false);
	});
	$('#sort_btn_2').click(function(){
		$('#csv-display-2 .store_review').append($('#csv-display-2 .store_review .review').sort(function(a,b){
		   	if(!sorted){
			   return a.getAttribute('data-rating')-b.getAttribute('data-rating');
			}
			else {
			   return b.getAttribute('data-rating')-a.getAttribute('data-rating');
			}
		}));
		changeSortStatus($(this), true);
	});
	$('#sort_btn_3').click(function(){
		$('#csv-display-3 .store_review').append($('#csv-display-3 .store_review .review').sort(function(a,b){
		   	if(!sorted){
				return a.getAttribute('data-rating')-b.getAttribute('data-rating');
			}
			else {
				return b.getAttribute('data-rating')-a.getAttribute('data-rating');
			}
		}));
		changeSortStatus($(this), false);
	});
}
function setRetrievalDateTime(retrievalDate){
	//Show retrieval time
	if(!retrievalTimeSet){
		var date = new Date(retrievalDate + ' GMT');
		var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		$('.updated_time span').html(days[date.getDay()] + " " + date.toLocaleTimeString());
		retrievalTimeSet = true;
	}
}
function toggleInformation(){
	$('.information').click(function(){
		if($('.information_description').hasClass('show')){
			$('.close_btn').removeClass('show');
			$('.info_btn').addClass('show');
			$('.information_description').removeClass('show');
			$('.what_text').addClass('show');
		}
		else {
			$('.info_btn').removeClass('show');
			$('.close_btn').addClass('show');
			$('.information_description').addClass('show');
			$('.what_text').removeClass('show');
		}
	});
}
function hideEmptyReviews(){
	$('.review').each(function(){
  		if($(this).has('.caption').length == 0){
  			$(this).addClass('hidden_review');
  			$(this).attr('data-caption', false);
  		}
	});
}
function showEmptyReviews(){
	$('.container h1').click(function(){
		var headerText = '';
		$('.review').each(function(){
	  		if($(this).attr('data-caption') == 'false'){
	  			$(this).toggleClass('show');
	  			if($(this).hasClass('show')){
	  				emptyReviewsVisible = true;
					headerText = 'Hide Empty Reviews';
	  			}
	  			else {
	  				emptyReviewsVisible = false;
					headerText = 'Show Empty Reviews';
	  			}
			}
		});
		$(this).stop().animate({
	        'opacity': 0
	    }, 200, function() {
        	$(this).text(headerText).animate({
            'opacity': 1
       		}, 200);
		});
	});
	$('.container h1').hover(function(){
		$(this).stop().animate({
	        'opacity': 0
	    }, 200, function() {
	    	var headerText = '';
	    	if(!emptyReviewsVisible){
				headerText = 'Show Empty Reviews';
	    	}
	    	else {
				headerText = 'Hide Empty Reviews';
	    	}
        	$(this).text(headerText).animate({
            'opacity': 1
       	}, 200);
	});
	},function() {
		$(this).stop().animate({
	        'opacity': 0
	    }, 200, function() {
        	$(this).text('Review Bot').animate({
            'opacity': 1
       	}, 200);
        });
    });
}

$(document).ready(function(){
	setTimeout(function(){
		$('#maskoverlay').css('opacity', '0');
	}, 1500);
	setTimeout(function(){
		$('#maskoverlay').css('display', 'none');
	}, 2200);
	setTimeout(function(){
		hideEmptyReviews();
		showEmptyReviews();
		$('#csv-display-3').css('height', $('#csv-display-1').outerHeight() + 'px');
		setRatings();
		sortRatingsOnClick();
		setRetrievalDateTime();
	}, 1000);
	toggleInformation()
	createSlickSlider();
});

//Listen for resize events
$(window).resize(function(){
	$('#csv-display-3').removeAttr('style');
	//Do not show average and sort buttons on resize
	$('h4').removeClass('show');
	$('.sort_btn').removeClass('show');
	hideEmptyReviews();
	//Wait 100ms for resize event to finish
	setTimeout(function(){
		if($(window).width() < 991){
			$('.slider')[0].slick.refresh();
		}
	}, 100);
	var interval = setInterval(function(){
		$('#csv-display-3').css('height', $('#csv-display-1').outerHeight() + 'px');
	}, 50);
	setTimeout(function(){
		clearInterval(interval);
	}, 500);
});