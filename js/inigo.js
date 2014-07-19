// global vars
var lastCommand = "",
	// Fibonacci seems as good as anything.
	levelsXPReq = [5, 13, 42, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811, 514229, 832040, 1346269, 2178309, 3524578, 5702887, 9227465, 14930352, 24157817, 39088169],
	inCombat = 0;
;

/* Construction workers
-------------------------------------------------------------------------- */
// class constructor
var Class=function(e){var n,t=function(){this.initialize.apply(this,arguments);}; for(n in e){t.prototype[n]=e[n];}return t;}

/////////////////////////
// classes
////////////////////////

// the user's character.
var toon = Class({
    initialize: function (){
        this.experience = 0;
        this.level = 0;
        this.hitpoints = 30;
        this.maxhitpoints = 30;
        this.inventory = [];
        this.currRoom = 0;
        this.xptolevel = levelsXPReq[this.level];
        this.holding = "";
        this.basehit = 8;
        this.gameover = 0; 
    },
    setCurrentRoom: function(newRoom){if(newRoom != this.currRoom){this.currRoom = newRoom;}},
    getCurrentRoom: function(){return this.currRoom;},
    take: function(objName){
	   	var theObject = rooms[inigo.getCurrentRoom()].takeObject(objName);
	    this.inventory.push(theObject);
    },
    drop: function(objName){
		var objIndex = this.inInventory(objName);
		if(objIndex != -1){
			rooms[inigo.getCurrentRoom()].objects.push(this.inventory[objIndex]);
			this.inventory.splice(objIndex,1);
			return 1;
		}
		return 0;
    },
    inInventory: function(objName){
	    var i, objIndex = -1;
	    for(i=0; i<this.inventory.length; i++){
		    if(this.inventory[i].dName == objName){
			    objIndex = i;
		    }
	    }
	    return objIndex;
    },
    useItem: function(itemID){
	    var usemsg = this.inventory[itemID].usemessage;
	    if(this.inventory[itemID].count <= 1){this.inventory.splice(itemID, 1);}
	    else{this.inventory[itemID].count-=1;}
	    return usemsg;
    },
    xpGain: function(xp){
	    var baseHitInc = 0, hpInc = 0;
	    this.experience += xp;
	    if(this.experience > levelsXPReq[this.level]){
		    this.experience -= this.xptolevel;
		    this.level++;
		    hpInc = Math.floor(Math.random()*(5*this.level)+(2*this.level));
		    this.maxhitpoints += hpInc;
		    this.hitpoints = this.maxhitpoints;
		    baseHitInc = Math.floor((Math.random()*3)+1);
		    this.basehit += baseHitInc;
		    this.xptolevel = levelsXPReq[this.level];
		    return "Woohoo! you gained a level!<br />You are now level "+this.level+".<br /> Your hitpoints increase to "+this.hitpoints+". <br />Your base hit is now " + this.basehit + " and you feel stronger.<br />";
	    }
	    return -1;
    },
    toggleSword: function(){
        if(this.holding !== "sword"){
            this.holding = "sword";
            return "You expertly draw your sword.<br />";
        }
        else {
            this.holding = "";
            return "You deftly slide your sword back into its scabbard.<br />";
        }
    },
    hit: function(damage){
	    this.hitpoints -= damage;
	    if(this.hitpoints <= 0){return -1;}
	    else {return 0;}
    },
    die: function(){
	    return "<p class='dead'>Auugh! You've been slain.</p><p>Now Westley will not be able to rescue Buttercup and she will marry Prince Humperdink. She'll be okay, but she'll never know the depth of Westley's love. Fezzik will be sad for a few minutes and then forget you. Vizzini &hellip; will just keep being Vizzini.</p<p>This could have been a triumph, you know. </p><br/>";
    },
    outcome: function(type){
	    var endmsg = "";
	    if(type == 'victory'){
	    	endmsg = "<p>Wait what?</p><p>Well. You've killed the Man in Black. Huh. That wasn't supposed to happen. I guess Westley's mission will fail, Buttercup will marry Humperdink, Fezzik will continue to be the Brute Squad, and Inigo will return to being a rogue. Good job, I guess.<p>";
	    }
	    else {
		    endmsg = "<p>The Man in Black knocks the sword from your hand. You stand helplessly for a moment, then fall to your knees.</p>";
		    endmsg += '<p>You close your eyes and say, "Kill me quickly."</p>';
		    endmsg += '<p>The Man in Black says, "I would as soon destroy a stained	glass window as an artist like yourself. However, since I can\'t have you following me either."</p>';
			endmsg += '<p>He hits you on the head with the hilt of his sword. As you feel your consciousness slipping away you hear the Man say, "Please understand, I hold you in the highest respect."<?p>';
	    }
	    this.gameover = 1;
	    return "<p class='endGame'>~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~<br />GAME OVER<br />~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~</p>"+endmsg;
    }
});
//initialize inigo
var inigo = new toon(0);

// rooms. When a room is created, it gets added to the rooms array.
var rooms = [];
var room = Class({ 
    initialize: function(id,title,description,firstvisitdesc,visiteddesc,helptext,nRoomID,eRoomID,sRoomID,wRoomID,arrMobiles,arrObjects) {
        this.id = id;
        this.title = title;
        this.desc = description;
        this.firstvisitdesc = firstvisitdesc,
        this.visiteddesc = visiteddesc,
        this.helptext = helptext,
        this.visited  = false;
        this.nRoomID = nRoomID;
        this.eRoomID = eRoomID;
        this.sRoomID = sRoomID;
        this.wRoomID = wRoomID;
        this.mobs = arrMobiles;
        this.objects = arrObjects; 
        rooms[this.id] = this;
    },
    getRoomDesc: function(){return this.desc;},
    getHelpText: function(){return this.helptext;},
    descObject: function(name){
      	for(var i=0; i<this.objects.length; i++){
	    	if(this.objects[i].eName == name) {
      			return this.objects[i].desc;
      		} 	
      	}
        for(i=0; i<this.mobs.length; i++){
            if(this.mobs[i].name == name) {
                return this.mobs[i].desc;
            } 
        }
      	return "";
    },
    takeObject: function(name){
	    var returnThisObject;
	    for(var i=0; i<rooms[inigo.getCurrentRoom()].objects.length; i++){
			if(rooms[inigo.getCurrentRoom()].objects[i].dName == name) {
				returnThisObject = rooms[inigo.getCurrentRoom()].objects[i];
				rooms[inigo.getCurrentRoom()].objects.splice(i,1);
			}
		}
		return returnThisObject;
	},
    omInRoom: function(name){
        for(var i=0; i<this.objects.length; i++){
            if(this.objects[i].eName == name) {
                return true;
            }
        }
        for(i=0; i<this.mobs.length; i++){
            if(this.mobs[i].name == name) {
                return true;
            }
        }   
        return false;
    },
    visitRoom: function(){this.visited = true;},
    navigateToRoom: function(direction){
    	if((direction == "north" || direction == "n")  && this.nRoomID != null){
    		inigo.setCurrentRoom(this.nRoomID);
    		return true;
    	}
    	else if((direction == "east" || direction == "e") && this.eRoomID != null){
    		inigo.setCurrentRoom(this.eRoomID);
    		return true;
    	}
    	else if((direction == "south" || direction == "s") && this.sRoomID != null){
    		inigo.setCurrentRoom(this.sRoomID);
    		return true;
    	}
    	else if((direction == "west" || direction == "w") && this.wRoomID != null){
    		inigo.setCurrentRoom(this.wRoomID);
    		return true;
    	}
    	else {
    		return false;
    	}
    }
});
// in-game object 
var gameObject = Class({
    initialize: function(dName,eName,desc,uses,roomtarget, usemessage) {
        this.dName = dName; // descriptive name
        this.eName = eName; // noun used in commands 
        this.desc = desc;   // description.
        this.uses = uses; // number of times this object can be used. -1 for infinite.
        this.roomtarget = roomtarget;
        this.count = 1; // used for stacking. 
        this.usemessage = usemessage;
    },
    getName: function(){return this.dName},
    getObjectDesc: function(){return this.desc;}
});
// trash mobs 
var mob = Class({
	initialize: function(name,desc,roomdesc,hp,basexp,level,basehit,disposition) {
        this.name = name;
        this.desc = desc;
        this.roomdesc = roomdesc;
        this.hitpoints = hp;
        this.baseXP = basexp;
        this.level = level;
        this.basehit = basehit;
        this.disposition = "passive";
    },
    hit: function(damage){	   
	    this.hitpoints = parseInt(this.hitpoints) - parseInt(damage);
	    if(this.hitpoints <= 0){return -1;}
	    else {return 0;}
    }
});

/* functions 
-------------------------------------------------------------------------- */ 
// command handler
function processCmd(input){
    var output = "<p class='in'> > "+input+" </p>",
        outputElement = $('.output') 
    ;
    if(input != ''){
        var inputArr = input.toLowerCase().split(' '),
            cmd = inputArr[0],
            args  = inputArr.splice(1),
            done = 0
        ; 
        
        //// global commands

        // commands command
        if (cmd == 'commands' || cmd == "cmd"){
            output +="You can: <br /> ";
            output += "- go &lt;direction&gt; to move in that direction (north, east, west, south).<br />";
            output += "- examine &lt;object name&gt; to have a closer look at an object. <br />";
            output += "- take &lt;object name&gt; to put that object in your bag.<br />";
            output += "- drop &lt;object name&gt; to remove that object from your bag.<br />";
            output += "- use &lt;object name&gt; to do an action with an object.<br />";
            output += "- say &lt;message&gt; to talk.<br />";
            output += "- look to scan your surroundings.<br />";
            output += "- inventory to see a list of things in your bag.<br />";
            output += "- draw sword to unsheath your sword.<br />";
            output += "- sheath sword to put your sword away.<br />";
            output += "- attack &lt;mob name&gt; to attack the indicated target.<br />";
            output += "- rest to replenish hit points. You cannot do this while in combat. <br />";
            done = 1;
        }
        // start screen commands
        if(inigo.getCurrentRoom() == 0){
			if(cmd == 'start' && inigo.getCurrentRoom() == 0){
            	inigo.setCurrentRoom(1);
				output += displayRoom(1);
				done = 1;
			}
		}
        // room-based commands
		else {
			// help command
            if (cmd == 'help'){
	        	if(inigo.getCurrentRoom() == 0){output += "Jeez. Just type \'start\', already. <br />";}
	        	else{output += rooms[inigo.getCurrentRoom()].getHelpText() + "<br />";}
	        	done = 1;
	        }
	        if (cmd == 'status' || cmd == 'sta'){
	        	var xpneeded = parseInt(inigo.xptolevel) - parseInt(inigo.experience);
				output += "<div class='title'>~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~<br />~ Status <br />~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~</div>";
				output += "<div class='rbody'>";
					output += "Hitpoints: " + inigo.hitpoints + " of " + inigo.maxhitpoints + "<br />";
					output += "Level: " + inigo.level + "<br />";
					output += "XP required to Level: " + xpneeded + "<br />";
				output += "</div>";
				done = 1;
	        }
	        if(inigo.gameover === 1){
		        output = "Game over man. If there's more you'd like to do, refresh the page to start over.</br />";
		        done = 1;
	        }
	        if(inigo.hitpoints > 0 && done === 0) {
	        	// room scan commands
		        
	            // look command
	            if(cmd == "look" || cmd == "l"){
			        output += displayRoom(inigo.getCurrentRoom());
			        done = 1;
		        }
		        
	            //// object commands 
	        
	            // examine
		        else if(cmd == 'examine' || cmd == 'x'){
					var objDesc = rooms[inigo.getCurrentRoom()].descObject(args);
					if(objDesc != ""){output += objDesc + "<br />";}
					else{output += "I don't see anything like that here. <br />"; }
					done = 1;
		        }
	            // take
		        else if(cmd == 'take' || cmd == 't'){
					if(args[0] == "dead"){args[0] = args[0]+" "+args[1];}
			        for(var i=0; i<rooms[inigo.getCurrentRoom()].objects.length; i++){
				        if(rooms[inigo.getCurrentRoom()].objects[i].dName == args[0]) {
					     	inigo.take(args[0]);   
					     	output += "You place the " + args[0] + " into your bag.<br />";
					     	done = 1;
				        }
			        }
			        if(done === 0){output += "I don't see anything like that here.<br />";}		        
		        }
	            // drop
		        else if(cmd == 'drop' || cmd == 'd'){
		        	if(args[0] == "dead"){args[0] = args[0]+" "+args[1];}
		        	if(!inigo.drop(args[0])){output += "You are not carrying a "+args[0]+".<br />";}
		        	else {output += "You gently place the "+args[0]+" on the ground before you.<br />";}
		        	done = 1;
		        }
		        // use 
	            else if(cmd == 'use' || cmd == 'u'){
	            	if(inigo.getCurrentRoom() == 4 && args == "rope") {
		            	output += '<p>You grab the coil of rope and throw the end down for the Man in Black, who thanks you.</p>';
		            	output += '<p>Having arrived at the top, you allow the Man in Black a rest. You ponder a minute, then say, "I do not mean to pry, but you don\'t by any chance happen to have six fingers on your right hand?"</p>';
		            	output += '<p>The Man in Black retorts, "Do you always begin conversations this way?"</p>';
		            	output += '<p>You explain in great detail how your father was deeply wronged by a six-fingered man, and that you\'ve devoted your life to defeating him with the sword he commissioned and refused to pay for. </p>';
		            	output += "<p>Sensing the end of your story, the Man in Black wishes you well in finding the six-fingered man.</p>";
		            	output += '<p>You ask the Man, "Are you ready then?"</p>';
		            	output += '<p>He responds, "Whether I am or not, You\'ve been more than fair."</p>';
		            	output += '<p>You remark to the Man, "You seem a decent fellow. I hate to kill you."</p>';
		            	output += '<p>He draws his sword and responds, "You seem a decent fellow. I hate to die."</p>';
		            	rooms[4].mobs.push(mib);
		            	done = 1;
	            	}
	            	else {
		            	if(inigo.holding == "sword"){
			            	output += "How about we put the sword away first, bub? <br />";
			            	done = 1;
		            	}
		            	else { 
			            	var theObjectID = inigo.inInventory(args[0]);
			            	if(theObjectID != -1) {
				            	if(inigo.inventory[theObjectID].roomtarget == inigo.getCurrentRoom()){
					            	output += inigo.useItem(theObjectID);
				            	}
				            	else {
					            	output += "There is no use here for that item. <br />";
				            	}
				            	done = 1;
							}
						}
					}
	            }
	            //// combat commands 
	
	            // draw sword command
	            else if(cmd == 'draw' && args == "sword"){
	                if(inigo.holding == "sword"){output += "You're already holding your sword. Right there, out in front of you.<br />";}
	                else{output += inigo.toggleSword();}
	                done = 1;
	            }
	            else if(cmd == 'sheath' && args == "sword"){
	                if(inigo.holding !== "sword"){
	                    output += "What luck! Your sword is already where you want it to be.<br />";
	                }
	                else{output += inigo.toggleSword();}
	                done = 1;
	            }
	            // attack
	            else if(cmd == 'attack' || cmd == 'a'){
	                if(rooms[inigo.getCurrentRoom()].omInRoom(args)){
	                    if(inigo.holding != "sword"){
	                        output += "You're much better with a sword than with your hands. Remember that ticklefight you lost last week?<br />";
	                    } 
	                    else {
							inCombat = 1;
							output += combatEvent(args);
	                    }  
	                }
	                else {
	                    output += "I don't see one of those here.<br />";
	                }
	                done = 1;
	            }
				//// movement commands
		        
	            // go
	            else if(cmd == 'go' || cmd == 'move'){
			        inCombat = 0;
			        if(rooms[inigo.getCurrentRoom()].navigateToRoom(args)){
			        	output += displayRoom(inigo.getCurrentRoom());
			        }
			        else {
				        output += "<p>You cannot go that way.</p>";
			        }
			        done = 1;
		        }
		        else if(cmd == 'rest' || cmd == 'r'){
		        	if(inCombat == 1){
			        	output += "You are in combat. If you want to rest, you should probably flee first. Coward.<br />";
		        	}
		        	else if(inigo.holding != ""){
			        	output += "Whoa there. How about you put that thing away first? <br />";
			        }
			        else {
				        inigo.hitpoints = inigo.maxhitpoints;
				        output += "You sit down and rest for a while. When you get up, you feel refreshed. <br />";
			        }
			        done = 1;
		        }
		        
	            //// social commands
				
	            // say
	            else if(cmd == 'say' || cmd == 's'){
		            if(args[0] == "yes"){		            
			            if(inigo.getCurrentRoom() == 2){
				        	output += "<p class='exp'>You say,\""+args+"\" and Fezzik begins climbing the rope.</p><p class='exp'>You look down to see the Man in Black climbing the rope after you. He climbs expertly; you're impressed. you say,\"He's climbing the rope. And he's gaining on us.\"</p><p class='exp'>Vizzini looks down and says, \"Inconceivable,\" then prods Fezzik. \"Faster!\" he demands.</p><p class='exp'>Fezzik says, \"I thought I was going faster.\"</p><p class='exp'>Vizzini explains, \"You were supposed to be this colossus. You were this great, legendary thing. And yet, he gains\".</p><p class='exp'>\"Well, I'm carrying three people, and he's only got himself,\", Fezzik explains.</p><p class='exp'>Unconvinced, Vizzini interrupts, \"I do not accept excuses. I'm just going to have to find myself a new giant, that's all.\"</p><p class='exp'>Hurt, Fezzik says, \"Don't say that, Vizzini. Please,\" and tries to go faster.</p><p class='exp'>Very near the top, Vizzini shouts, \"DID I MAKE IT CLEAR THAT YOUR JOB IS AT STAKE?\"<br /><span class='cdown'>15</span> ...";
					        inigo.setCurrentRoom(3);
					        var timerCount = 15, 
						        interval = setInterval(function(){
					        		timerCount--;
					        		$('.cdown').text(timerCount);
					        		if(timerCount == 0) {
						        		outputElement.append(displayRoom(inigo.getCurrentRoom()));
										outputElement[0].scrollTop = outputElement[0].scrollHeight;
										clearInterval(interval);
									}
								}, 1000)
							;
			            }
			        }
			        else{
		            	output += '<p>You say, "'+args.join(" ")+'"</p>';
		            }
		            done = 1;
		        }
		        
	            //// character commands 
		        
	            // inventory
	            else if(cmd == 'inventory' || cmd == 'inv'){
		        	if(inigo.inventory.length == 0){output += "Your bag is empty.<br />";}
		        	else {
			        	output += "You are carrying: <br />";	
		        	}
		        	for(var i=0; i<inigo.inventory.length; i++){
			        	output += inigo.inventory[i].count + " " + inigo.inventory[i].dName + "<br />";
		        	}
		        	done = 1;
		        }
	        }
	        else if(done != 1 && inigo.gameover === 0){
					output += "You are dead. Makes it a bit hard to do that, don't you think? <br />";
					done = 1;
				}
	        // default -- we've gotten here becasuse we haven't yet handled the command -- it's a dud. 
	        if(done == 0){
	            var respUnrec = ["<p>Sorry, what was that?</p>", "<p>Didn't quite get that.</p>", "<p>You want to do what now?</p>", "<p>Yeah. Right...</p>", "<p>No. Just No.</p>", "<p>Lol. No.</p>"];
	            output += respUnrec[Math.floor((Math.random()*respUnrec.length-1)+1)];
	        }
	    }
        lastCommand = input;
    } 
    else {
        output += "<p>An actual command would be useful.</p>";
    }
    outputElement.append(output);
    outputElement[0].scrollTop = outputElement[0].scrollHeight; 
}
function displayRoom(roomID) {
	var rTitle = rooms[roomID].title, 
		rDesc = rooms[roomID].desc, 
		rMobs = rooms[roomID].mobs, 
		rObjects = rooms[roomID].objects, 
		rOutput,
		dRoomID
	;
	rOutput = "<div class='title'>~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~<br />~ "+rTitle+"<br />~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~</div>";
	rOutput += "<div class='rbody'>"+rDesc+"</div>";
	if(rooms[roomID].visited == false){rOutput += rooms[roomID].firstvisitdesc;}
	else{rOutput += rooms[roomID].visiteddesc;}
    if(typeof rMobs != 'undefined' && rMobs.length > 0){
        rOutput += "<div class='mobList'>";
        for(var i=0; i<rMobs.length; i++){
            rOutput += rMobs[i].roomdesc;
        }
        rOutput += "</div>"
    }
	if(typeof rObjects != 'undefined' && rObjects.length > 0){
		rOutput += "<div class='objList'>";
		for(var i=0; i<rObjects.length; i++){
			rOutput += "There is a " + rObjects[i].dName + " here." + "<br />";
		}
		rOutput += "</div>"
	}
	rOutput += "<div class='golist'>You can go:<br />";
	if(rooms[roomID].nRoomID != null){
		dRoomID = rooms[roomID].nRoomID;
		rOutput += "<span class='direction'>North</span> to " + rooms[dRoomID].title + "<br >";
	}
	if(rooms[roomID].sRoomID != null){
		dRoomID = rooms[roomID].sRoomID;
		rOutput += "<span class='direction'>South</span> to " + rooms[dRoomID].title + "<br >";
	}
	if(rooms[roomID].eRoomID != null){
		dRoomID = rooms[roomID].eRoomID;
		rOutput += "<span class='direction'>East</span> to " + rooms[dRoomID].title + "<br >";
	}
	if(rooms[roomID].wRoomID != null){
		dRoomID = rooms[roomID].wRoomID;
		rOutput += "<span class='direction'>West</span> to " + rooms[dRoomID].title + "<br >";
	}
	rOutput += "</div>";
	rooms[roomID].visitRoom();
	return rOutput;
}
function combatEvent(target){
	var theTarget, 
		inigoHitDamage, 
		inigoHitChance,
		targetHitDamage,
		targetHitChance,
		returnMe = "",
		targetDead = 0,
		inigoDead,
		deadThing,
		grantedXP
	;
	for(var i=0; i<rooms[inigo.getCurrentRoom()].mobs.length; i++){
		if(typeof theTarget != "object"){
			if(rooms[inigo.getCurrentRoom()].mobs[i].name == target){
				theTarget = rooms[inigo.getCurrentRoom()].mobs[i];		
			}
		}
	}
	if(typeof theTarget.name != 'undefined'){
		inigoHitChance = Math.floor((Math.random()*40)+30) + (10*inigo.level) + 3*(theTarget.level - inigo.level);
		targetHitChance = Math.floor((Math.random()*40)+30) + (10*theTarget.level) + 3*(inigo.level - theTarget.level);
		inigoHitDamage = inigo.basehit*inigo.level+Math.floor((Math.random()*10)+1);
		targetHitDamage = theTarget.basehit*theTarget.level+Math.floor((Math.random()*10)+1); 	
	}
	if(inigoHitChance > 50){
		targetDead = theTarget.hit(inigoHitDamage);
		returnMe += "You hit " + theTarget.name + " for " + inigoHitDamage + "hp.<br />";
	} else {
		returnMe += "Your sword completely misses " + theTarget.name + ". <br />";
	}
	if(targetHitChance > 50){
		inigoDead = inigo.hit(targetHitDamage);
		returnMe += theTarget.name + " hits you, doing " + targetHitDamage + " damage.<br />";
	} else {
		returnMe += theTarget.name + " totally misses you. <br />";
	}
	if(targetDead < 0){
		inCombat = 0;		
		returnMe += "You've killed " + theTarget.name + "! <br />";
		// calcualte the experience gain.
		var	bonus = 0.2*(Math.abs(theTarget.level - inigo.level));
		if(inigo.level > theTarget.level){ bonus = -bonus;}
		grantedXP = theTarget.baseXP+bonus;
		// no xp loss for killing something.
		if(grantedXP < 0){grantedXP = 0;}
		returnMe += "You gain "+grantedXP+" Experience.<br />";
		var levelled = inigo.xpGain(grantedXP);
		if(levelled != -1){returnMe += levelled;}
		// death turns a mob into an object. So it goes. 
		for(var i=0; i<rooms[inigo.getCurrentRoom()].mobs.length; i++){
			if(rooms[inigo.getCurrentRoom()].mobs[i].name == target) {
				rooms[inigo.getCurrentRoom()].mobs.splice(i,1);
				break;
			}
		}
		deadThing = new gameObject("dead "+theTarget.name, "dead "+theTarget.name, "A dead " +theTarget.name+ "is here. It's starting to stink.",-1);
		rooms[inigo.getCurrentRoom()].objects.push(deadThing);
		if(theTarget.name == "man") {
			returnMe += inigo.outcome('victory');
		}
	}
	else if(inigoDead < 0){
		if(theTarget.name == "man") {
			returnMe += inigo.outcome('loss');
		}
		else {
			returnMe += inigo.die();
		}
	}
	return returnMe;
}
/* DOM interactions
-------------------------------------------------------------------------- */
(function($){
    $('#cmds').keyup(function(e){
    	// handle 'enter'
    	if(e.which == 13){$('#doit').trigger('click');}
    	// on up arrow, pull the last command. 
    	else if(e.which == 38 && lastCommand != ""){
	    	$(this).val(lastCommand);
    	}
    	// down arrow clears. 
    	else if(e.which == 40){
	    	$(this).val("");
    	}
    });
    // command handler. 
    $('#doit').click(function(){
        processCmd($('#cmds').val());
        $('#cmds').val("");
    });
}(jQuery));
   
//////////////////////////////
// initialize all mobs 
//////////////////////////////
                  //name,desc,roomdesc,hp,basexp,level,basehit,disposition
var rat1 = new mob("rat","A standard black rat.", "A rat is scrabbling around here.<br />",10,20,1,4,"passive");
var rat2 = new mob("rat","A standard black rat.", "A rat is scrabbling around here.<br />",10,20,1,4,"passive");
var rat3 = new mob("rat","A standard black rat.", "A rat is scrabbling around here.<br />",10 ,20,1,4,"passive");
var rat4 = new mob("shiprat","A monsterous black rat.", "A shiprat is scrabbling around here.<br />",20 ,40,2,5,"passive");
var rat5 = new mob("shiprat","A giant black rat.", "A shiprat is scrabbling around here.<br />",20 ,40,2,5,"passive");
var rat6 = new mob("shiprat","A huge black rat.", "A shiprat is scrabbling around here.<br />",20 ,40,2,5,"passive");
var rat7 = new mob("shiprat","A large black rat.", "A shiprat is scrabbling around here.<br />",20 ,40,2,5,"passive");
// foxes. 
var fox1 = new mob("fox","A red fox.", "A fox is sniffing around here.<br />",20 ,40,5,1,"passive");
var fox2 = new mob("fox","A red fox.", "A fox is sniffing around here.<br />",20 ,40,5,1,"passive");
var fox3 = new mob("fox","A red fox.", "A fox is sniffing around here.<br />",20 ,40,5,1,"passive");
var fox4 = new mob("fox","A red fox.", "A fox is sniffing around here.<br />",20 ,40,5,1,"passive");
// bear 
var bear = new mob("bear","A grizzly bear.", "A grizzly bear is standing threateningly here.<br />",20 ,50,3,8,"passive");
// the boss. 
var mib	= new mob("man", "The Man in Black", "The Man in Black is standing here.<br />", 500, 0, 5, 5, "aggressive");

//////////////////////////////
// initialize all objects 
//////////////////////////////
					    	// dName,   eName,     desc,                                      noUses, roomid, use message	
var harness = new gameObject("harness", "harness", "A climbing harness made of thick creaky leather.",1,2, "You attach the harness to Fezzik and gently guide Buttercup into place. Fezzik smiles at you and says, \"Are you ready?\"<br />"),
	boot = new gameObject("boot", "boot", "An old leather boot.", -1, -1)
;

//////////////////////////////
// initialize rooms			
//////////////////////////////	  

/*
var roomname = new room(
    '',// id  
    '',  // title
    '<p></p>', // description,
    '<p></p>', // show only on first visit
    '<p></p>', // show only once visited
    '<p></p>', // helptext
    null, // nroomid
    null, // eroomid
    null, // sroomid
    null, // wroomid
    [], // arrMobs
    [] // arrObjects
);  
*/

var pier = new room(
    '1', // id  
    'The Pier',  // title
    '<p>After sailing all night while being persued by a mysterious ship, you, Fezzik, and Vizzini find yourselves at the base of the Cliffs of Insanity. Buttercup is standing before you. Her hands are tied. Your vessel glides into place next to a pier and Fezzik ties up the ropes.</p><p>Vizzini says, "We\'re Safe. Only Fezzik is strong enough to go up our way." Gesturing toward the persuing ship and grinning, your leader triumphantly states, "He\'ll have to sail around for hours \'til he finds a harbor."</p>', // description
    '<p>Fezzik and Vizzini head north toward the base of the cliffs, dragging Buttercup behind them.</p>', // show only on first visit
    '<p>To the north, you hear Fezzik and Vizzini arguing about something.</p>', // show only once visited
    '<p>Perhaps you should follow your <strike>compatriots</strike> fellow criminals. They went north.</p>', // helptext
    '2', // nroomid
    '5', // eroomid
    null, // sroomid
    null, // wroomid
    [rat1, rat2, rat3], // arrMobs
    [harness, boot] // arrObjects
);
var cliffsbase = new room(
    '2', // id  
    'The base of the Cliffs',  // title
    '<p>You\'ve reached the base of the Cliffs of Insanity. They are impossibly high. There\'s no way you\'re going to climb them.</p>', // description,
    '<p>Fezzik\'s hand disappears behind a clump of dirt and leaves. When it emerges again, you see that he is holding a thick rope. He grabs onto the rope and looks at you expectantly.</p>', // show only on first visit
    '<p>Fezzik is here, holding a rope that goes all the way to the top. Vizzini has his hands on his hips and is tapping his foot. Both are looking at you expectantly.</p>', // show only once visited
    '<p>Perhaps a harness would be useful -- you could attach it to Fezzik and get a ride up the cliffs.</p>', // helptext
    null, // nroomid
    6, // eroomid
    1, // sroomid
    null, // wroomid
    [], // arrMobs
    [] // arrObjects
);	
var clifftopedge = new room(
    '3', // id  
    'The top of the Cliffs',  // title
    '<p>The air at the top of these cliffs feels somehow thinner. You can see for miles out to sea and the two ships moored to the dock look like tiny models. The wind here is strong.</p>', // description,
    '<p>Fezzik has carried your party to the top of the Cliffs of Insanity. As soon as Fezzik heaves you all over the top, Vizzini has a knife out and is cutting the rope from which the Man in Black dangles. He saws and saws, and finally the rope snaps and slides over the edge.</p><p>You and Fezzik look down to see the Man in Black hanging from the jagged rocks of the cliff.</p><p>Fezzik turns down the corners of his mouth, saying, "He has very good arms."</p><p>Vizzini looks over the cliff to see the Man in Black. He says, "He didn\'t fall? INCONCEIVABLE!"</p><p>Unable to stand it anymore, you turn toward Vizzini and say, "You keep using that word. I do not think it means what you think it means." You look down and see that the Man in Black is still climbing.</p><p>"Whoever he is," Vizzini insists, "he\'s obviously seen us with the princess and therefore must die." He commands Fezzik to carry the princes, then looks toward you and says, "We\'ll head straight for the Guilder Frontier. Catch up when he\'s dead. If he falls, fine. If not, the sword."</p><p>You indicate your desire to duel using your left hand, and your compatriots and captive leave toward the west.</p>', // show only on first visit
    '<p></p>', // show only once visited
    '<p></p>', // helptext
    null, // nroomid
    4, // eroomid
    null, // sroomid
    null, // wroomid
    [], // arrMobs
    [] // arrObjects
);	
var cliffoverlook = new room(
    '4', // id  
    'The very edge of the Cliffs',  // title
    '<p>At the very edge of the cliffs, you feel the wind threating to push you over. Falling from this height would take a really long time. </p>', // description,
    '<p>You look down to see the Man in Black scrambling up the cliff. He is close enough to hear you, so you say hello. He grunts his reply. You say, "Slow Going?"</p><p>The Man in Black responds, "Look, I don\'t mean to be rude, but this is not as easy as it looks. So I\'d appreciate it if you wouldn\'t distract me." You apologize, and ask him to speed up.</p><p>He responds, "If you\'re in such a hurry, you could lower a rope, or a tree branch, or find something useful to do.</p><p>You say, "I could do that. In fact, I\'ve got some rope up here. But I do not think that you will accept my help, since I am only waiting around to kill you."</p><p>"That does put a damper on our relationship", the Man in Black replies.</p><p>You promise not to kill him until after he reaches the top. "That\'s very comforting", he says, "But I\'m afraid you\'ll just have to wait."</p> <p> You say, "I hate waiting. I could give you my word as a Spaniard". He responds, "No good. I\'ve known too many Spaniards."</p><p>Frustrated, you ask the Man in Black if there\'s any way he\'d trust you. He says no.</p><p>You swear on the soul of your father, Domingo Montoya, that he will reach the top alive.</p><p>"Throw me the rope," the man says.</p>', // show only on first visit
    '<p></p>', // show only once visited
    '<p>Perhaps you could use the rope to help the Man in Black.</p>', // helptext
    null, // nroomid
    null, // eroomid
    null, // sroomid
    3, // wroomid
    [], // arrMobs
    [] // arrObjects
);  
var theShip = new room(
    '5',// id  
    'The Ship',  // title
    '<p>You climb aboard the small vessel that carried your party here. It is a small sailing ship with only one deck. </p>', // description,
    '<p></p>', // show only on first visit
    '<p></p>', // show only once visited
    '<p>There is no help for this room. Good luck.</p>', // helptext
    null, // nroomid
    null, // eroomid
    null, // sroomid
    1, // wroomid
    [rat4,rat5,rat6,rat7], // arrMobs
    [] // arrObjects
);  
var alongTheCliffs = new room(
    '6',// id  
    'Along the Cliff Base',  // title
    '<p>A narrow path along the cliffs takes you through a small forest. Though many, the trees are stunted, likely owing ot the proximity of the ocean and the lack of suitable soil. But life finds a way.</p>', // description,
    '<p></p>', // show only on first visit
    '<p></p>', // show only once visited
    '<p>There is no help for this room. Good luck.</p>', // helptext
    null, // nroomid
    7, // eroomid
    null, // sroomid
    2, // wroomid
    [fox1,fox2,fox3], // arrMobs
    [] // arrObjects
);  
var alongTheCliffs = new room(
    '7',// id  
    'A Clearing along the Cliff Base',  // title
    '<p>You\'ve reached a small clearing in the forest. There appears to be a small opening in the cliff wall here. </p>', // description,
    '<p></p>', // show only on first visit
    '<p></p>', // show only once visited
    '<p>There is no help for this room. Good luck.</p>', // helptext
    8, // nroomid
    null, // eroomid
    null, // sroomid
    6, // wroomid
    [fox4], // arrMobs
    [] // arrObjects
); 
var alongTheCliffs = new room(
    '8',// id  
    'A small cave',  // title
    '<p>The only light in this cave comes from the opening, but you can see it is not very deep, a perfect home for a large anmimal.</p>', // description,
    '<p>You smell the animal musk before you see the creature stand up.</p>', // show only on first visit
    '<p></p>', // show only once visited
    '<p>There is no help for this room. Good luck.</p>', // helptext
    null, // nroomid
    null, // eroomid
    7, // sroomid
    null, // wroomid
    [bear], // arrMobs
    [] // arrObjects
); 
/* highlight.js http://highlightjs.org/ */
var hljs=new function(){function k(v){return v.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function t(v){return v.nodeName.toLowerCase()}function i(w,x){var v=w&&w.exec(x);return v&&v.index==0}function d(v){return Array.prototype.map.call(v.childNodes,function(w){if(w.nodeType==3){return b.useBR?w.nodeValue.replace(/\n/g,""):w.nodeValue}if(t(w)=="br"){return"\n"}return d(w)}).join("")}function r(w){var v=(w.className+" "+(w.parentNode?w.parentNode.className:"")).split(/\s+/);v=v.map(function(x){return x.replace(/^language-/,"")});return v.filter(function(x){return j(x)||x=="no-highlight"})[0]}function o(x,y){var v={};for(var w in x){v[w]=x[w]}if(y){for(var w in y){v[w]=y[w]}}return v}function u(x){var v=[];(function w(y,z){for(var A=y.firstChild;A;A=A.nextSibling){if(A.nodeType==3){z+=A.nodeValue.length}else{if(t(A)=="br"){z+=1}else{if(A.nodeType==1){v.push({event:"start",offset:z,node:A});z=w(A,z);v.push({event:"stop",offset:z,node:A})}}}}return z})(x,0);return v}function q(w,y,C){var x=0;var F="";var z=[];function B(){if(!w.length||!y.length){return w.length?w:y}if(w[0].offset!=y[0].offset){return(w[0].offset<y[0].offset)?w:y}return y[0].event=="start"?w:y}function A(H){function G(I){return" "+I.nodeName+'="'+k(I.value)+'"'}F+="<"+t(H)+Array.prototype.map.call(H.attributes,G).join("")+">"}function E(G){F+="</"+t(G)+">"}function v(G){(G.event=="start"?A:E)(G.node)}while(w.length||y.length){var D=B();F+=k(C.substr(x,D[0].offset-x));x=D[0].offset;if(D==w){z.reverse().forEach(E);do{v(D.splice(0,1)[0]);D=B()}while(D==w&&D.length&&D[0].offset==x);z.reverse().forEach(A)}else{if(D[0].event=="start"){z.push(D[0].node)}else{z.pop()}v(D.splice(0,1)[0])}}return F+k(C.substr(x))}function m(y){function v(z){return(z&&z.source)||z}function w(A,z){return RegExp(v(A),"m"+(y.cI?"i":"")+(z?"g":""))}function x(D,C){if(D.compiled){return}D.compiled=true;D.k=D.k||D.bK;if(D.k){var z={};function E(G,F){if(y.cI){F=F.toLowerCase()}F.split(" ").forEach(function(H){var I=H.split("|");z[I[0]]=[G,I[1]?Number(I[1]):1]})}if(typeof D.k=="string"){E("keyword",D.k)}else{Object.keys(D.k).forEach(function(F){E(F,D.k[F])})}D.k=z}D.lR=w(D.l||/\b[A-Za-z0-9_]+\b/,true);if(C){if(D.bK){D.b=D.bK.split(" ").join("|")}if(!D.b){D.b=/\B|\b/}D.bR=w(D.b);if(!D.e&&!D.eW){D.e=/\B|\b/}if(D.e){D.eR=w(D.e)}D.tE=v(D.e)||"";if(D.eW&&C.tE){D.tE+=(D.e?"|":"")+C.tE}}if(D.i){D.iR=w(D.i)}if(D.r===undefined){D.r=1}if(!D.c){D.c=[]}var B=[];D.c.forEach(function(F){if(F.v){F.v.forEach(function(G){B.push(o(F,G))})}else{B.push(F=="self"?D:F)}});D.c=B;D.c.forEach(function(F){x(F,D)});if(D.starts){x(D.starts,C)}var A=D.c.map(function(F){return F.bK?"\\.?\\b("+F.b+")\\b\\.?":F.b}).concat([D.tE]).concat([D.i]).map(v).filter(Boolean);D.t=A.length?w(A.join("|"),true):{exec:function(F){return null}};D.continuation={}}x(y)}function c(S,L,J,R){function v(U,V){for(var T=0;T<V.c.length;T++){if(i(V.c[T].bR,U)){return V.c[T]}}}function z(U,T){if(i(U.eR,T)){return U}if(U.eW){return z(U.parent,T)}}function A(T,U){return !J&&i(U.iR,T)}function E(V,T){var U=M.cI?T[0].toLowerCase():T[0];return V.k.hasOwnProperty(U)&&V.k[U]}function w(Z,X,W,V){var T=V?"":b.classPrefix,U='<span class="'+T,Y=W?"":"</span>";U+=Z+'">';return U+X+Y}function N(){var U=k(C);if(!I.k){return U}var T="";var X=0;I.lR.lastIndex=0;var V=I.lR.exec(U);while(V){T+=U.substr(X,V.index-X);var W=E(I,V);if(W){H+=W[1];T+=w(W[0],V[0])}else{T+=V[0]}X=I.lR.lastIndex;V=I.lR.exec(U)}return T+U.substr(X)}function F(){if(I.sL&&!f[I.sL]){return k(C)}var T=I.sL?c(I.sL,C,true,I.continuation.top):g(C);if(I.r>0){H+=T.r}if(I.subLanguageMode=="continuous"){I.continuation.top=T.top}return w(T.language,T.value,false,true)}function Q(){return I.sL!==undefined?F():N()}function P(V,U){var T=V.cN?w(V.cN,"",true):"";if(V.rB){D+=T;C=""}else{if(V.eB){D+=k(U)+T;C=""}else{D+=T;C=U}}I=Object.create(V,{parent:{value:I}})}function G(T,X){C+=T;if(X===undefined){D+=Q();return 0}var V=v(X,I);if(V){D+=Q();P(V,X);return V.rB?0:X.length}var W=z(I,X);if(W){var U=I;if(!(U.rE||U.eE)){C+=X}D+=Q();do{if(I.cN){D+="</span>"}H+=I.r;I=I.parent}while(I!=W.parent);if(U.eE){D+=k(X)}C="";if(W.starts){P(W.starts,"")}return U.rE?0:X.length}if(A(X,I)){throw new Error('Illegal lexeme "'+X+'" for mode "'+(I.cN||"<unnamed>")+'"')}C+=X;return X.length||1}var M=j(S);if(!M){throw new Error('Unknown language: "'+S+'"')}m(M);var I=R||M;var D="";for(var K=I;K!=M;K=K.parent){if(K.cN){D=w(K.cN,D,true)}}var C="";var H=0;try{var B,y,x=0;while(true){I.t.lastIndex=x;B=I.t.exec(L);if(!B){break}y=G(L.substr(x,B.index-x),B[0]);x=B.index+y}G(L.substr(x));for(var K=I;K.parent;K=K.parent){if(K.cN){D+="</span>"}}return{r:H,value:D,language:S,top:I}}catch(O){if(O.message.indexOf("Illegal")!=-1){return{r:0,value:k(L)}}else{throw O}}}function g(y,x){x=x||b.languages||Object.keys(f);var v={r:0,value:k(y)};var w=v;x.forEach(function(z){if(!j(z)){return}var A=c(z,y,false);A.language=z;if(A.r>w.r){w=A}if(A.r>v.r){w=v;v=A}});if(w.language){v.second_best=w}return v}function h(v){if(b.tabReplace){v=v.replace(/^((<[^>]+>|\t)+)/gm,function(w,z,y,x){return z.replace(/\t/g,b.tabReplace)})}if(b.useBR){v=v.replace(/\n/g,"<br>")}return v}function p(z){var y=d(z);var A=r(z);if(A=="no-highlight"){return}var v=A?c(A,y,true):g(y);var w=u(z);if(w.length){var x=document.createElementNS("http://www.w3.org/1999/xhtml","pre");x.innerHTML=v.value;v.value=q(w,u(x),y)}v.value=h(v.value);z.innerHTML=v.value;z.className+=" hljs "+(!A&&v.language||"");z.result={language:v.language,re:v.r};if(v.second_best){z.second_best={language:v.second_best.language,re:v.second_best.r}}}var b={classPrefix:"hljs-",tabReplace:null,useBR:false,languages:undefined};function s(v){b=o(b,v)}function l(){if(l.called){return}l.called=true;var v=document.querySelectorAll("pre code");Array.prototype.forEach.call(v,p)}function a(){addEventListener("DOMContentLoaded",l,false);addEventListener("load",l,false)}var f={};var n={};function e(v,x){var w=f[v]=x(this);if(w.aliases){w.aliases.forEach(function(y){n[y]=v})}}function j(v){return f[v]||f[n[v]]}this.highlight=c;this.highlightAuto=g;this.fixMarkup=h;this.highlightBlock=p;this.configure=s;this.initHighlighting=l;this.initHighlightingOnLoad=a;this.registerLanguage=e;this.getLanguage=j;this.inherit=o;this.IR="[a-zA-Z][a-zA-Z0-9_]*";this.UIR="[a-zA-Z_][a-zA-Z0-9_]*";this.NR="\\b\\d+(\\.\\d+)?";this.CNR="(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";this.BNR="\\b(0b[01]+)";this.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";this.BE={b:"\\\\[\\s\\S]",r:0};this.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[this.BE]};this.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[this.BE]};this.CLCM={cN:"comment",b:"//",e:"$"};this.CBLCLM={cN:"comment",b:"/\\*",e:"\\*/"};this.HCM={cN:"comment",b:"#",e:"$"};this.NM={cN:"number",b:this.NR,r:0};this.CNM={cN:"number",b:this.CNR,r:0};this.BNM={cN:"number",b:this.BNR,r:0};this.REGEXP_MODE={cN:"regexp",b:/\//,e:/\/[gim]*/,i:/\n/,c:[this.BE,{b:/\[/,e:/\]/,r:0,c:[this.BE]}]};this.TM={cN:"title",b:this.IR,r:0};this.UTM={cN:"title",b:this.UIR,r:0}}();hljs.registerLanguage("javascript",function(a){return{aliases:["js"],k:{keyword:"in if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const class",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require"},c:[{cN:"pi",b:/^\s*('|")use strict('|")/,r:10},a.ASM,a.QSM,a.CLCM,a.CBLCLM,a.CNM,{b:"("+a.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[a.CLCM,a.CBLCLM,a.REGEXP_MODE,{b:/</,e:/>;/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,c:[a.inherit(a.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,c:[a.CLCM,a.CBLCLM],i:/["'\(]/}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+a.IR,r:0}]}});hljs.registerLanguage("css",function(a){var b="[a-zA-Z-][a-zA-Z0-9_-]*";var c={cN:"function",b:b+"\\(",e:"\\)",c:["self",a.NM,a.ASM,a.QSM]};return{cI:true,i:"[=/|']",c:[a.CBLCLM,{cN:"id",b:"\\#[A-Za-z0-9_-]+"},{cN:"class",b:"\\.[A-Za-z0-9_-]+",r:0},{cN:"attr_selector",b:"\\[",e:"\\]",i:"$"},{cN:"pseudo",b:":(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\\"\\']+"},{cN:"at_rule",b:"@(font-face|page)",l:"[a-z-]+",k:"font-face page"},{cN:"at_rule",b:"@",e:"[{;]",c:[{cN:"keyword",b:/\S+/},{b:/\s/,eW:true,eE:true,r:0,c:[c,a.ASM,a.QSM,a.NM]}]},{cN:"tag",b:b,r:0},{cN:"rules",b:"{",e:"}",i:"[^\\s]",r:0,c:[a.CBLCLM,{cN:"rule",b:"[^\\s]",rB:true,e:";",eW:true,c:[{cN:"attribute",b:"[A-Z\\_\\.\\-]+",e:":",eE:true,i:"[^\\s]",starts:{cN:"value",eW:true,eE:true,c:[c,a.NM,a.QSM,a.ASM,a.CBLCLM,{cN:"hexcolor",b:"#[0-9A-Fa-f]+"},{cN:"important",b:"!important"}]}}]}]}]}});hljs.registerLanguage("xml",function(a){var c="[A-Za-z0-9\\._:-]+";var d={b:/<\?(php)?(?!\w)/,e:/\?>/,sL:"php",subLanguageMode:"continuous"};var b={eW:true,i:/</,r:0,c:[d,{cN:"attribute",b:c,r:0},{b:"=",r:0,c:[{cN:"value",v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s\/>]+/}]}]}]};return{aliases:["html"],cI:true,c:[{cN:"doctype",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},{cN:"comment",b:"<!--",e:"-->",r:10},{cN:"cdata",b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{title:"style"},c:[b],starts:{e:"</style>",rE:true,sL:"css"}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{title:"script"},c:[b],starts:{e:"<\/script>",rE:true,sL:"javascript"}},{b:"<%",e:"%>",sL:"vbscript"},d,{cN:"pi",b:/<\?\w+/,e:/\?>/,r:10},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"title",b:"[^ /><]+",r:0},b]}]}});hljs.registerLanguage("http",function(a){return{i:"\\S",c:[{cN:"status",b:"^HTTP/[0-9\\.]+",e:"$",c:[{cN:"number",b:"\\b\\d{3}\\b"}]},{cN:"request",b:"^[A-Z]+ (.*?) HTTP/[0-9\\.]+$",rB:true,e:"$",c:[{cN:"string",b:" ",e:" ",eB:true,eE:true}]},{cN:"attribute",b:"^\\w",e:": ",eE:true,i:"\\n|\\s|=",starts:{cN:"string",e:"$"}},{b:"\\n\\n",starts:{sL:"",eW:true}}]}});hljs.registerLanguage("php",function(b){var e={cN:"variable",b:"\\$+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*"};var a={cN:"preprocessor",b:/<\?(php)?|\?>/};var c={cN:"string",c:[b.BE,a],v:[{b:'b"',e:'"'},{b:"b'",e:"'"},b.inherit(b.ASM,{i:null}),b.inherit(b.QSM,{i:null})]};var d={v:[b.BNM,b.CNM]};return{cI:true,k:"and include_once list abstract global private echo interface as static endswitch array null if endwhile or const for endforeach self var while isset public protected exit foreach throw elseif include __FILE__ empty require_once do xor return parent clone use __CLASS__ __LINE__ else break print eval new catch __METHOD__ case exception default die require __FUNCTION__ enddeclare final try switch continue endfor endif declare unset true false trait goto instanceof insteadof __DIR__ __NAMESPACE__ yield finally",c:[b.CLCM,b.HCM,{cN:"comment",b:"/\\*",e:"\\*/",c:[{cN:"phpdoc",b:"\\s@[A-Za-z]+"},a]},{cN:"comment",b:"__halt_compiler.+?;",eW:true,k:"__halt_compiler",l:b.UIR},{cN:"string",b:"<<<['\"]?\\w+['\"]?$",e:"^\\w+;",c:[b.BE]},a,e,{cN:"function",bK:"function",e:/[;{]/,i:"\\$|\\[|%",c:[b.UTM,{cN:"params",b:"\\(",e:"\\)",c:["self",e,b.CBLCLM,c,d]}]},{cN:"class",bK:"class interface",e:"{",i:/[:\(\$"]/,c:[{bK:"extends implements",r:10},b.UTM]},{bK:"namespace",e:";",i:/[\.']/,c:[b.UTM]},{bK:"use",e:";",c:[b.UTM]},{b:"=>"},c,d]}});hljs.registerLanguage("sql",function(a){return{cI:true,i:/[<>]/,c:[{cN:"operator",b:"\\b(begin|end|start|commit|rollback|savepoint|lock|alter|create|drop|rename|call|delete|do|handler|insert|load|replace|select|truncate|update|set|show|pragma|grant|merge)\\b(?!:)",e:";",eW:true,k:{keyword:"all partial global month current_timestamp using go revoke smallint indicator end-exec disconnect zone with character assertion to add current_user usage input local alter match collate real then rollback get read timestamp session_user not integer bit unique day minute desc insert execute like ilike|2 level decimal drop continue isolation found where constraints domain right national some module transaction relative second connect escape close system_user for deferred section cast current sqlstate allocate intersect deallocate numeric public preserve full goto initially asc no key output collation group by union session both last language constraint column of space foreign deferrable prior connection unknown action commit view or first into float year primary cascaded except restrict set references names table outer open select size are rows from prepare distinct leading create only next inner authorization schema corresponding option declare precision immediate else timezone_minute external varying translation true case exception join hour default double scroll value cursor descriptor values dec fetch procedure delete and false int is describe char as at in varchar null trailing any absolute current_time end grant privileges when cross check write current_date pad begin temporary exec time update catalog user sql date on identity timezone_hour natural whenever interval work order cascade diagnostics nchar having left call do handler load replace truncate start lock show pragma exists number trigger if before after each row merge matched database",aggregate:"count sum min max avg"},c:[{cN:"string",b:"'",e:"'",c:[a.BE,{b:"''"}]},{cN:"string",b:'"',e:'"',c:[a.BE,{b:'""'}]},{cN:"string",b:"`",e:"`",c:[a.BE]},a.CNM]},a.CBLCLM,{cN:"comment",b:"--",e:"$"}]}});hljs.registerLanguage("json",function(a){var e={literal:"true false null"};var d=[a.QSM,a.CNM];var c={cN:"value",e:",",eW:true,eE:true,c:d,k:e};var b={b:"{",e:"}",c:[{cN:"attribute",b:'\\s*"',e:'"\\s*:\\s*',eB:true,eE:true,c:[a.BE],i:"\\n",starts:c}],i:"\\S"};var f={b:"\\[",e:"\\]",c:[a.inherit(c,{cN:null})],i:"\\S"};d.splice(d.length,0,b,f);return{c:d,k:e,i:"\\S"}});