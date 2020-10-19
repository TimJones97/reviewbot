var data;
$.ajax({
  type: "GET",  
  url: "../data/gm_reviews.csv",
  dataType: "text",       
  success: function(response)  
  {
	data = $.csv.toArrays(response);
	generateHtmlTable(data);
  }   
});
function generateHtmlTable(data) {
    var html = '<table class="table table-condensed table-hover table-striped">';
    var isEmpty = false;
      if(typeof(data[0]) === 'undefined') {
        return null;
      } else {
		$.each(data, function( index, row ) {
		  //bind header
		  if(index == 0) {
			html += '<thead>';
			html += '<tr>';
			$.each(row, function( index, colData ) {
				if(index == 1 || index == 2 || index == 4 || index == 5){
					html += '<th>';
					html += colData;
					html += '</th>';
				}
			});
			html += '</tr>';
			html += '</thead>';
			html += '<tbody>';
		  } else {
			html += '<tr>';
			$.each(row, function( index, colData ) {
				if(index == 1 || index == 2 || index == 4 || index == 5){
					if(index == 1 && colData == ''){
						isEmpty = true;
					}
					else if (index == 1 && colData != ''){
						isEmpty = false;
					}
					if(!isEmpty) {
						html += '<td>';
						html += colData;
						html += '</td>';
					}
				}
			});
			html += '</tr>';
		  }
		});
		html += '</tbody>';
		html += '</table>';
		$('#csv-display').append(html);
	  }
	}	