var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
        res.sendfile('index.html');
        });

var possibleSystemNumbers = new Object();

function matchSimilarity(system_number, user_input){
    var a=0,b=0;
    for(var i=0;i<4;i++){
        for(var j=0;j<4;j++){
            if(user_input[j]== system_number[i]){
                if(j==i)
                    a+=1;
                else
                    b+=1;
                break;
            }
        }
    }
    return [a,b];
}

function checkRepitionDigits(number_str){
    for(var i=0;i<4;i++){
        for(var j=i+1;j<4;j++){
            if(number_str[i] == number_str[j])
                return true;
        }
    }
    return false;
}

function initializePossibleSystemNumbers(){
    for(var i=1000;i<10000;i++){
        if(checkRepitionDigits(i.toString())){
            possibleSystemNumbers[i] = false;
        }else{
            possibleSystemNumbers[i] = true;
        }
    }
}

function getOutputWithMaxCount(possibleOutputsCount){
    var bestPossibleOutput, maxOutputCount=0;
    for (var key in possibleOutputsCount) {
        if(maxOutputCount < possibleOutputsCount[key]){
            maxOutputCount = possibleOutputsCount[key];
            bestPossibleOutput = key;
        }
    }
    return bestPossibleOutput;
}

function calculateOutput(user_input){
    if(isNaN(user_input))
        return "Input should be a number."
        
    var possibleOutputsCount = new Object();
    
    for(var i=1000;i<10000;i++){
        //Doing computations when 'i' can be considered as a system output and not already discarded.
        if(possibleSystemNumbers[i]){
            var possibleOutput = matchSimilarity(i.toString(), user_input);
            if(possibleOutputsCount[possibleOutput] == undefined){
                // if system output [a,b] occurring for the first time, setting count to be '1'
                possibleOutputsCount[possibleOutput] = 1;
            }
            else{
                // if system output [a,b] has already occurred for some other 'i' as well, just incrementing count
                possibleOutputsCount[possibleOutput] += 1;
            }
        }
    }
    
    // [a,b] having maximum count of possible system numbers will reveal minimum information
    var bestPossibleOutput = getOutputWithMaxCount(possibleOutputsCount);
    
    /*As the best system output for current situation is known, discarding numbers giving other output,
    as in the next computation they will not satisfy the previous outputs by the system*/
    for(var i=1000;i<10000;i++){
        if(possibleSystemNumbers[i]){
            // possibleOutput could have been saved but computing again as O(1) complexity vs space.
            var possibleOutput = matchSimilarity(i.toString(), user_input);
            if(possibleOutput != bestPossibleOutput){
                possibleSystemNumbers[i] = false;
            }
        }
    }
    if(bestPossibleOutput == [4,0]){
        return "Success!!!";
    }
    else{
        return "a=>"+bestPossibleOutput[0]+", b=>"+bestPossibleOutput[2];
    }
    
    
}

initializePossibleSystemNumbers();

io.on('connection', function(socket){
      socket.on('user input', function(user_input){
                msg = calculateOutput(user_input)
                
                io.emit('system output', user_input+ ": "+msg);
                console.log(user_input+ ": "+msg);
                });
      socket.on('reset game',function(){
                console.log('resetting game.')
               initializePossibleSystemNumbers(); 
                })
});


http.listen(8001, function(){
            console.log('listening on *:8001');
});