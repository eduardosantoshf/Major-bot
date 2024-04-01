
var BOSH_SERVICE = 'http://0.0.0.0:5443/http-bind';

var API_URL = "http://localhost:8888/api/chatroom?name="

var connection = null;

var jid;

var pw;

var counter = 0;

var roomJid;

var first_message = true;

function insert_html(text, bot){
  if (bot){
    document.getElementById("messages").insertAdjacentHTML("beforeend", "<li class=\"clearfix\"><div class=\"message-data\"><div class=\"message my-message\">" + text + "</div></div></li>");
  }
  else{
    document.getElementById("messages").insertAdjacentHTML("beforeend", "<li class=\"clearfix\"><div class=\"message-data text-right\" style=\"display: block;\"><div class=\"client float-right\">" + text + "</div></div></li>");
  }
}

function write_messages(){
  var inputValue = document.getElementById("input_client").value;
  document.getElementById("input_client").value = "";
  connection.send($msg({ to: roomJid, from: connection.jid, type: 'groupchat' }).c('body').t(inputValue));
}

//Connection handler
function onConnect(status)
{
  if (status == Strophe.Status.CONNECTED) {
    //Received Messages handler
    connection.addHandler(onMsg, null, 'message', null, null,  null); 
    connection.send($pres().tree());

    
    //Connect to chat room (this 2 lines)
    var d = $pres({'from': jid+"@localhost", 'to': roomJid+"/"+jid})
    connection.send(d.tree());   
  }
}

//Function that receives the messages and handles them.
function onMsg(msg){
  var from = msg.getAttribute('from');
  var type = msg.getAttribute('type');
  var elems = msg.getElementsByTagName('body');

	//Check for groupchat message
  if (type == "groupchat" && elems.length > 0) {
    if(first_message){
      $('#user_name').text("User is connected.");
      $('#div_status').html("<i class=\"fa fa-circle online\"></i> Online");
    }
  
    //print and obtain the body of the message.
    var body = elems[0];

    if(from.split("/")[1]== jid){
      insert_html(Strophe.getText(body), false);
    }
    else{
        insert_html(Strophe.getText(body), true);
    }
    first_message = false;
  }

  return true;
}

function reset_connection(){
  connection.disconnect();
  $('#messages').get(0).innerHTML = '';
  $('#user_name').text("No user connected.");
  $('#div_status').html("<i class=\"fa fa-circle offline\"></i> Offline");
  first_message = true;

  //Start the connection
  connection = new Strophe.Connection(BOSH_SERVICE);

  roomJid = jid+counter+".helpDesk@conference.localhost";

  $.ajax({
    'url' : API_URL+jid + counter,
    'type' : 'POST',
    'success' : function(data) {
      //Connect the user to the server;
      connection.connect(jid+"@localhost",
      pw,
      onConnect);
      counter ++;
    }
  });
}

$(document).ready(function () {

  //Start the connection
  connection = new Strophe.Connection(BOSH_SERVICE);
  $('#connect').bind('click', function () {
    jid = $('#Uname').get(0).value;
    pw = $('#Pass').get(0).value;
    roomJid = jid+counter+".helpDesk@conference.localhost"
    $('#login').css({'display': 'none'});
    $('#chat').css({'display': 'block'});

    $.ajax({
      'url' : API_URL+jid + counter,
      'type' : 'POST',
      'success' : function(data) {
        //Connect the user to the server;
        connection.connect(jid+"@localhost",
        pw,
        onConnect);
        counter ++;
      }
    });
  });

});
