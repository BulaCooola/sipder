$(document).ready(function(){        

	$('body').on('click','.img-responsive', function(){
		var src = $(this).attr('src');
		var is_video = $(this).attr('is_video');

		var media_tag;
		if (is_video == 1) {
			media_tag = '<div id="media_el"><video controls autoplay src="' + src + '" class="img-responsive"></video></div>';
		} else {
			media_tag = '<div id="media_el"><img src="' + src + '" class="img-responsive"/></div>';
		}
		
		var asset = $(this).attr('asset');
		var comment = $(this).attr('comment');
		
		//start of new code new code
		var index = $(this).parent('li').index();   
		
		var html = '';
		html += '<div id="topbar" style="height:25px;clear:both;display:block;text-align:right;">'
		html += '<a class="controls close" href="' + (index) + '">[X]</a/></div>'
		html += media_tag;                
		html += '<div id="img_name" style="height:25px;clear:both;display:block;">';
		html += asset + ': ' + comment;
		html += '</div>';
		html += '<div style="height:25px;clear:both;display:block;">';
		html += '<a class="controls next" href="'+ (index+2) + '">next &raquo;</a>';
		html += '<a class="controls previous" href="' + (index) + '">&laquo; prev</a>';
		html += '</div>';
		
		$('#myModal').modal();
		$('#myModal').on('shown.bs.modal', function(){
			$('#myModal .modal-body').html(html);
			//new code
			$('a.controls.open').trigger('click');
		})
		$('#myModal').on('hidden.bs.modal', function(){
			$('#myModal .modal-body').html('');
		});
		
   });	
   
})

         
$(document).on('click', 'a.controls', function(){
	var index = $(this).attr('href');

    var img = $('#image_ul li:nth-child(' + index +') img');
    var video = $('#image_ul li:nth-child(' + index +') video');

    var valid_el;
    var is_video;
    if (video.length) {
    	valid_el = video;
    	is_video = true;
    } else {
    	valid_el = img;
    	is_video = false;
    }

	var src = valid_el.attr('src');            
	var asset = valid_el.attr('asset');
	var comment = valid_el.attr('comment');

    if (is_video) {
	    $('#media_el').html('<video controls autoplay src="' + src + '" class="img-responsive"></video>');
    } else {
    	$('#media_el').html('<img src="' + src + '" class="img-responsive"/>');
    }
	
	$('#img_name').html(asset + ': ' + comment);
	
	var newPrevIndex = parseInt(index) - 1; 
	var newNextIndex = parseInt(newPrevIndex) + 2; 
	
	if($(this).hasClass('close')) {
		$('#myModal').modal('hide');
		return false;
	}
	
	if($(this).hasClass('previous')){               
		$(this).attr('href', newPrevIndex); 
		$('a.next').attr('href', newNextIndex);
	}else{
		$(this).attr('href', newNextIndex); 
		$('a.previous').attr('href', newPrevIndex);
	}
	
	var total = $('ul.row li').length + 1; 
	//hide next button
	if(total === newNextIndex){
		$('a.next').hide();
	}else{
		$('a.next').show()
	}            
	//hide previous button
	if(newPrevIndex === 0){
		$('a.previous').hide();
	}else{
		$('a.previous').show()
	}
	
	
	return false;
});
