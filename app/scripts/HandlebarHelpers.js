Handlebars.registerHelper('checkStartRow', function(indexCount, rowCount, block) {
	if(parseInt(indexCount)%(rowCount)=== 0){
		return block.fn(this);
	}
});

Handlebars.registerHelper('checkEndRow', function(indexCount, rowCount, block) {
	if(parseInt(indexCount+1)%(rowCount)=== 0){
		return block.fn(this);
	}
});

Handlebars.registerHelper('numberCount', function(indexCount) {
	return new Handlebars.SafeString('<span class="num">' + (indexCount+1) + '. </span>');
});

Handlebars.registerHelper('numberString', function(indexCount) {
	return new Handlebars.SafeString('' + (indexCount+1) + '.');
});