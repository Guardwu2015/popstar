var chessObj = function(){
	chessboard = [];  // 0-9 0-9 from left down 
}

chessObj.prototype.init = function(){
	colNum = 10;
	for(var i=0; i< colNum; i++){
		chessboard[i] = mathRandom(10);
	}
	
}

//when click the x y, the same type star around will disappear too
chessObj.prototype.click = function(x, y){
	if( !isValid(x, y) ){
		return;
	}
 
	playSound('broken.mp3');

	var disappearSet = [];
	var disabledSet = []; //record position which has been tracked
	var starNo = chessboard[x][y]; 
	popStar(disappearSet, [], disabledSet, x, y, starNo);
	var popStarNumber = disappearSet.length;
	if(popStarNumber>1){ //at least two stars 
		data.update( disappearSet.length );
		disappearSet.forEach(function(item){
			var sx = item[0];
			var sy = item[1];
			chessboard[sx][sy] = -1;
		})
	} 
	// show the encourage tips
	if(popStarNumber>=8){
		playSound('fire.mp3');
	}
	if(popStarNumber>30){
		data.popEncourType = 4;
	}
	else if(popStarNumber>25){
		data.popEncourType = 3;
	}
	else if(popStarNumber>20){
		data.popEncourType = 2;

	}
	else if(popStarNumber>15){
		data.popEncourType = 1;
	}
	else if(popStarNumber>=8){
		data.popEncourType = 0;
	}

	this.update(); 
	this.isGameOver();
}

chessObj.prototype.isGameOver = function(){
	if( !data.clearStage && data.totalScore >= data.targetScore){
		data.clearStage = true;
		playSound('stageclear.mp3');
	}
	var disappearSet;
	var count=0; //the rest star, the less, the more bonus
	for(var i=0; i<colNum; i++){ 
		for(j=0; j<10; j++) {
			disappearSet = []; 
			if (isValid(i, j)) {
				count++;
				popStar(disappearSet, [], [], i, j, chessboard[i][j]);
				if(disappearSet.length>1){
					data.gameOver = false;
					return;
				}
			}
		}
	}
	if(count<10){
		data.leftStar = count;
		data.getBonus = true;
		data.bonus = 2000-count*count*20;
		data.totalScore += data.bonus;
	}
	if( data.clearStage ){
		playSound('win.mp3');
		data.pass = true; //pass this level to the next level
		data.level++; 
		data.targetScore = 1000*(data.level+1)*data.level/2;
		setTimeout(function(){ 
			chess.init();
			data.reset();
		},4000);
	}
	else{
		data.gameOver = true;  // game over  
		playSound('gameover.mp3');
	}
}

/*//when some star disappears, the rest reshape.
chessObj.prototype.update = function(){ 
	
	var gap;
	// for every column
	for(var i=0; i<colNum; i++){ 
		dropData = []; 
		gap = 0;
		for(j=0; j<10; j++){
			if(!chessboard[i][j]){
				continue;
			}
			// the disappeard star
			if(chessboard[i][j] == -1){
				gap++;
			 	// if the next one is still disappear
				if(j<9 && chessboard[i][j+1] == -1){
					continue; 
				}
			}
			else { //the star need to drop
				if( gap>0 ){
					var key = 10*i+j;
					var tem = {};
					tem[key] = [i,j-gap,j];
					dropData.push(tem);
					console.log(tem);
				} 
			} 
		} 
	}

	temp = [];	
	for(i=0; i<colNum; i++){
		//if the colomn is empty, merge 
		if( !isEmpty(chessboard[i]) ){
			temp.push(chessboard[i]);
		}
	} 
	chessboard = temp;
	colNum = temp.length; 
}*/

//when some star disappears, the rest reshape.
chessObj.prototype.update = function(){
	var temp = [];
	for(var i=0; i<colNum; i++){
		temp = []; 
		for(j=0; j<10; j++) {
			if( chessboard[i][j] !== undefined && chessboard[i][j] !== -1){
				temp.push(chessboard[i][j]);
			}
		}
		chessboard[i] = temp;
	}

	temp = [];	
	for(i=0; i<colNum; i++){
		//if the colomn is empty, merge 
		if( !isEmpty(chessboard[i]) ){
			temp.push(chessboard[i]);
		}
	} 
	chessboard = temp;
	colNum = temp.length; 
}

function popStar(disappearSet, p, disabledSet, x, y, starNo){
	if(disappearSet.length == 0){
		disappearSet.push([x,y]);
	}
	else {
		disappearSet.forEach(function(item){
			if(isNeighbor(x,y,item[0], item[1])){
				disappearSet.push([x,y]);
				return;
			}
		})
	}

	disabledSet.push(10*x+y);
	if(isValid(x+1, y) && chessboard[x+1][y] == starNo){
		p.push([x+1,y]);
	}
	if(isValid(x-1, y) &&chessboard[x-1][y] == starNo){
		p.push([x-1,y]);
	}
	if(isValid(x, y+1) &&chessboard[x][y+1] == starNo){
		p.push([x,y+1]);
	}
	if(isValid(x, y-1) &&chessboard[x][y-1] == starNo){
		p.push([x,y-1]);
	}
	// range first search  
	for(var i=0; i<p.length; i++){
		if( disabledSet.indexOf(10*p[i][0]+p[i][1]) < 0){
			popStar(disappearSet, p, disabledSet, p[i][0], p[i][1], starNo);
		}
	}
}

//generate random number from 0 to 4
function mathRandom( n ){
	var x = [];
	for(var i=0; i<n; i++){
		x[i] = Math.floor(Math.random()*5);
	}
	return x;
}

//two points is neighbor or not
function isNeighbor(x1,y1,x2,y2){
	if(Math.abs(x1-x2) + Math.abs(y1-y2) == 1){
		return true;
	}
	return false;
}

//the point is in the valid region 
function isValid(x, y){
	if(!chessboard[x] || chessboard[x][y] == undefined){
		return false; 
	}

	if( chessboard[x][y]<0 &&  chessboard[x][y]>4){
		return false;
	} 

	if(x<0 || x>colNum-1){
		return false;
	}

	if(y<0 || y>9){
		return false;
	} 
	return true;
}

function isEmpty(arr){
	for (var i = 0; i < arr.length; i++) {
		if( arr[i] !== undefined ){
			return false;
		}
	}

	return true;
}