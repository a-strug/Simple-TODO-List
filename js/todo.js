function Todo() {
	this.newNote      = [];
	this.completeNote = [];
	
	this.noteTitle    = $('#noteTitle');
	this.noteDesc     = $('#noteDesc');
	this.notReadyNote = $('#not-ready-note');
	this.readyNote    = $('#ready-note');
	this.makeList     = $('#newList');
	this.addButton    = $('#addButton');
	this.clearReady   = $('#clearReady');
	
	this.CASHE = {};
	
	var self = this;
	this.addButton.click(function() {
		var str = self.noteTitle.val();
		self.addNote(str, false); 
		self.saveList(); 
		self.noteTitle.val('What do you need to do?');
		return false;
	});	
	
	this.noteTitle.keypress(function(e) {
		if (e.keyCode == 13) {
			self.addButton.click();
			return false;
		}
	});
	
	$(this.makeList).click(function(){
		self.newList();
	});
	
    $('#not-ready-note').sortable({
    	deactivate: function() {self.resaveList()}
    });
    
    $('input[type=checkbox]').live('click', function() {
    	var el = $(this);
    	if (el.is(":checked")) {
    		el.parent().addClass('completed');
    		el.parent().appendTo(self.readyNote);
    	} else {
    		el.parent().removeClass('completed');
    		el.parent().appendTo(self.notReadyNote);
    	}
    	self.resaveList(true);
    });
    
    $('.del').live('click', function() {
    	if(confirm("Are you want delete this cause?")) {
    		self.delNote($(this).parent());	
    	}
    });

    $('.edit').live('click', function(){
    	self.editNote($(this).parent());
    });
    
    $('.cancel').live('click', function(){
    	self.processNote($(this).parent(), true);
    });

    $('.save').live('click', function(){
    	self.processNote($(this).parent(), false);
    });
    
    this.noteTitle.click(function() {
    	$(this).val('');
    });
    
    this.clearReady.click(function() {
    	self.delComplete();
    });
    
    this.loadList();
}
/**
 * add note in the todo list
 */
Todo.prototype.addNote = function(str, isComplete) {
	var title = unescape(str);
	
	if (!title || title == 'What do you need to do?') {
		this.showError(true);
		return;
	} else{
        this.showError(false);
    }
	
	$('.no-notes').hide();
	
	if (isComplete) {
		this.readyNote.append('<li class="completed"><input type="checkbox" checked /><span>' + title + '</span><div title="Edit" class="edit"></div><div title="Delete" class="del"></div></li>');
		this.completeNote.push(str);
	} else {
		this.newNote.push(str);
		this.notReadyNote.append('<li><input type="checkbox" /><span>' + title + '</span><div title="Edit" class="edit"></div><div title="Delete" class="del"></div></li>');
	}
}
/**
 * delete note from the todo list
 */
Todo.prototype.delNote = function(el) {
	var self = this;
	el.animate({opacity: 0}, 500, function() {
		el.remove();
		self.resaveList(true);
	});
}
/**
 * edit the selected note
 */
Todo.prototype.editNote = function(el) {
	var title = el.find('span').text();
	this.CASHE[el[0]] = el.html();
	el.addClass('edited');
	var editBox = '<textarea class="editText">' + title + '</textarea><div title="Save" class="save"></div><div title="Not save" class="cancel"></div>';
	el.html(editBox);
}
Todo.prototype.processNote = function(el, close) {
	if (close) {
		el.removeClass('edited').html(this.CASHE[el[0]]);
	} else {
		var title = el.find('textarea').val();
		el.removeClass('edited').html(this.CASHE[el[0]]);
		el.find('span').text(title);
		this.resaveList(true);
	}
}
/**
 * delete all complete notes
 */
Todo.prototype.delComplete = function() {
	this.readyNote.html('');
	this.resaveList(true);
}
/**
 * load the actually todo list
 */
Todo.prototype.loadList = function() {
	var noteList = this.getCookie('todoList').split('||');
	
	if (!noteList[0] && !noteList[1]) return;
	
	var self = this;
	if (noteList[0]) {
		$.each(noteList[0].split('&'), function(i, str) {
			self.addNote(str, false);
		});
	}
	
	if (noteList[1]) {
		$.each(noteList[1].split('&'), function(i, str) {
			self.addNote(str, true);
		});		
	}
}
/**
 * save todo`s list information 
 */
Todo.prototype.saveList = function() {
	var data = this.newNote.join('&') + '||' + this.completeNote.join('&');

	var time = new Date();
	time.setTime(time.getTime() + 2678400000);
	document.cookie = 'todoList=' + data + "; expires=" + time.toGMTString();
}
/**
 * resave todo`s list information
 */
Todo.prototype.resaveList = function(notDrag) {
	var self = this;

	if (notDrag) {
		this.newNote      = [];
		this.completeNote = [];
		$('#not-ready-note li').each(function() {
			var title = escape($(this).find('span').text());
			self.newNote.push(title);
		});
		$('#ready-note li').each(function() {
			var title = escape($(this).find('span').text());
			self.completeNote.push(title); 
		});		
	} else { 
		this.newNote = [];
		$('#not-ready-note li').each(function() {
			var title = escape($(this).find('span').text()) || escape($(this).find('textarea').val());
			self.newNote.push(title);
		});
	}
		
	this.saveList();
}
/**
 * create new empty todo list
 */
Todo.prototype.newList = function() {
	this.notReadyNote.empty();
	this.readyNote.empty();
	
	this.newNote      = [];
	this.completeNote = [];
	
	this.saveList();	
}
/**
 * get the cookie
 * @param string name  cookie`s name
 */
Todo.prototype.getCookie = function(name) {
	var cSIndex = document.cookie.indexOf(name);
	if (cSIndex == -1) {
		return ''
	};

	cSIndex = document.cookie.indexOf(name + "=")
	if (cSIndex == -1) {
		return ''
	};

	var cEIndex = document.cookie.indexOf(";", cSIndex + (name + "=").length);
	if (cEIndex == -1) {
		cEIndex = document.cookie.length;
	}

	return document.cookie.substring(cSIndex + (name + "=").length, cEIndex);
}

Todo.prototype.showError = function(error) {
    if (error) {
        this.noteTitle.css({border: "1px solid #EF6F16"});
    } else {
        this.noteTitle.css({border: "2px inset"});
    }
}
