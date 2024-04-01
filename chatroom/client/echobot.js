var BOSH_SERVICE = 'http://0.0.0.0:5443/http-bind';

var connection = null;

var roomJid = "joao.helpDesk@conference.localhost"

function write(msg) 
{
    $('#log').append('<div></div>').append(document.createTextNode(msg));
}

//Connection handler
function onConnect(status)
{
    if (status == Strophe.Status.CONNECTING) {
		write('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
		write('Strophe failed to connect.');
		$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
		write('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
		write('Strophe is disconnected.');
		$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.CONNECTED) {
		write('Strophe is connected.');
		write('ECHOBOT: Send a message to ' + connection.jid + 
		' to talk to me.');
	
	//Received Messages handler
	connection.addHandler(onMsg, null, 'message', null, null,  null); 
	connection.send($pres().tree());

	//Connect to chat room (this 2 lines)
	var d = $pres({'from': $('#jid').get(0).value, 'to': roomJid + '/' + $('#jid').get(0).value.split("@")[0]})
	connection.send(d.tree());
	
	//Send Message to chat room (one line);
	connection.send($msg({ to: "joao.helpDesk@conference.localhost", from: connection.jid, type: 'groupchat' }).c('body').t("ola"))
    }
}

//Function that receives the messages and handles them.
function onMsg(msg){
	console.log(msg);

	var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');

	//Check for groupchat message
    if (type == "groupchat" && elems.length > 0) {
		
		//print and obtain the body of the message.
		var body = elems[0];
		console.log('ECHOBOT: I got a message from ' + from + ': ' + 
		Strophe.getText(body))

		write('ECHOBOT: I got a message from ' + from + ': ' + 
			Strophe.getText(body));
    }

    // we must return true to keep the handler alive.  
    // returning false would remove it after it finishes.
    return true;

}

$(document).ready(function () {

	//Start the connection
    connection = new Strophe.Connection(BOSH_SERVICE);


    $('#connect').bind('click', function () {
	var button = $('#connect').get(0);
	if (button.value == 'connect') {
		button.value = 'disconnect';
		
		//Connect the user to the server;
	    connection.connect($('#jid').get(0).value,
			       $('#pass').get(0).value,
			       onConnect);
	} else {
	    button.value = 'connect';
	    connection.disconnect();
	}
    });
});
