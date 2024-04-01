var base_url = "http://127.0.0.1:8001/";

var BOSH_SERVICE = 'http://0.0.0.0:5443/http-bind';

var API_URL = "http://localhost:8888/api/get_chat"

var query_bot = "query_chatbot/?statement=";

var sub_feedback = "store_feedback";

var find_city = "find_destination/?statement=";

var sentiment_analysis = "sentiment_analysis/?statement="

var intent = "greetings";

var user_location = null;

var conversation = [];

var rating_bot = 0;

var google_api = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";

var google_key = "insert_key_here";

var flights_api = "http://localhost:5000/getFlights?";

var flights_api_airport = "http://localhost:5000/getNearestAirport?";

var carousel_count = 0;

var jid = "client";

var pw = "user";

var bot = true;

var roomJid;

var city_options = [];

var errors = 0;

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

window.onload = function() {
    
  //JavaScript goes here

  var initial_messages = ["Hello", "Good to see you again!", "Hi there, how can I help?"];
  var random_initial = initial_messages[Math.floor(Math.random()*initial_messages.length)];
  insert_html(random_initial, true);
  start_response();

}

function locationSuccess(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  //insert_html("Please wait a moment while I find the nearest airport", true)

  $.ajax({
    'url' : flights_api_airport + "lat=" + latitude + "&lon=" + longitude,
    headers:{
        "Access-Control-Allow-Origin":"http://localhost"
    },
    'type' : 'GET',
    'success' : function(data) {
      user_location = data[0].toLowerCase();
      city_options = data;
      intent = "verify_city";
      insert_html("Based on your location we have chosen " + user_location + " as the departure location", true)
      insert_html(get_sentence(intent), true)
      allow_writing();
      quick_response();
    },
    'error': function (jqXHR) {
      user_location = "porto";
      intent = "verify_city";
      insert_html("Based on your location we have chosen " + user_location + " as the departure location", true)
      insert_html(get_sentence(intent), true)
      allow_writing();
      quick_response();
    },
  });
}

function get_sentence(intent){
  if (intent == "destination"){
    var messages = ["What is the destination?", "Where do you want to go?", "What is the destination of the flight?"];
    var random_message = messages[Math.floor(Math.random()*messages.length)];
    return random_message
  }
  else if (intent == "help"){
    var messages = ["How can I help you?", "What can I help you with?", "How may I serve you?"];
    var random_message = messages[Math.floor(Math.random()*messages.length)];
    return random_message
  }
  else if (intent == "continue"){
    var messages = ["Can I help you with anything else?", "Is there anything else?", "Anything else you want to do?"];
    var random_message = messages[Math.floor(Math.random()*messages.length)];
    return random_message;
  }
  else if (intent == "sorry"){
    var messages = ["Sorry that I couldn't help, goodbye.", "It seems that I couldn't help you, my apologies.", "I'm sorry I didn't meet your needs, Goodbye."];
    var random_message = messages[Math.floor(Math.random()*messages.length)];
    return random_message
  }
  else if (intent == "goodbye"){
    var messages = ["Goodbye.", "I hope this was helpful, goodbye."];
    var random_message = messages[Math.floor(Math.random()*messages.length)];
    return random_message
  }
  else if(intent == "talk_human"){
    var messages = ["Do you want to talk to a human agent?", "Do you need a live agent?", "Do you want me to connect you to a live agent?"];
    var random_message = messages[Math.floor(Math.random()*messages.length)];
    return random_message
  }
  else if(intent == "verify_city"){
    var messages = ["Do you want to change the departure city?", "Do you want to change your departure location?"];
    var random_message = messages[Math.floor(Math.random()*messages.length)];
    return random_message
  }

}

function allow_writing(){
  document.getElementById("input_client").placeholder = "";
  document.getElementById("input_client").disabled = false;
  document.getElementById("input_client").focus();
  document.getElementById("input_client").select();
}

function insert_html(text, bot){
  if (bot){
    conversation.push(["bot", text])
    document.getElementById("messages").insertAdjacentHTML("beforeend", "<li class=\"clearfix\"><div class=\"message-data\"><div class=\"message my-message\">" + text + "</div></div></li>");
  }
  else{
    conversation.push(["client", text])
    document.getElementById("messages").insertAdjacentHTML("beforeend", "<li class=\"clearfix\"><div class=\"message-data text-right\" style=\"display: block;\"><div class=\"client float-right\">" + text + "</div></div></li>");
  }

}

function insert_results(flights){
  document.getElementById("messages").insertAdjacentHTML("beforeend", "<li class=\"clearfix\"><div class=\"\"><div class=\"\" style=\"width: 100%;\">" + 
                                                                        "<div id=\"carouselExampleControls\" class=\"carousel slide\" data-ride=\"carousel\" data-interval=\"false\">" + 
                                                                        "<div class=\"carousel-indicators\" id=\"car_ind" + carousel_count + "\">" +
                                                                          "<button type=\"button\" data-bs-target=\"#carouselExampleIndicators\" data-bs-slide-to=\"0\" class=\"active\" aria-current=\"true\" aria-label=\"Slide 1\"></button>" +
                                                                        "</div>" +
                                                                          "<div class=\"carousel-inner\" id=\"inner_content" + carousel_count + "\">" +
                                                                            "<div class=\"carousel-item active\">" +
                                                                              create_flight_card(flights[0]) +
                                                                            "</div>" +
                                                                          "</div>" +
                                                                          "<a class=\"carousel-control-prev\" href=\"#carouselExampleControls\" role=\"button\" data-slide=\"prev\">" +
                                                                            "<span class=\"carousel-control-prev-icon\" aria-hidden=\"true\"></span>" +
                                                                            "<span class=\"sr-only\">Previous</span>" +
                                                                          "</a>" +
                                                                          "<a class=\"carousel-control-next\" href=\"#carouselExampleControls\" role=\"button\" data-slide=\"next\">" + 
                                                                            "<span class=\"carousel-control-next-icon\" aria-hidden=\"true\"></span>" +
                                                                            "<span class=\"sr-only\">Next</span>" +
                                                                          "</a>" +
                                                                        "</div>" + 
                                                                      "</div></div></li>"
  );

  for(var i = 1; i <= flights.length - 1; i++){
    document.getElementById("car_ind" + carousel_count).insertAdjacentHTML("beforeend", "<button type=\"button\" data-bs-target=\"#carouselExampleIndicators\" data-bs-slide-to=\"" + i + "\" aria-label=\"Slide " + i + "\"></button>");
    document.getElementById("inner_content" + carousel_count).insertAdjacentHTML("beforeend", "<div class=\"carousel-item\">" + create_flight_card(flights[i]) + "</div>");
  }

  carousel_count += 1;

}

function create_flight_card(flight){
  dep_date = new Date(flight.departure.scheduled);
  dep_hours = dep_date.getHours();
  dep_min = dep_date.getMinutes();
  arr_date = new Date(flight.arrival.scheduled);
  arr_hours = arr_date.getHours();
  arr_min = arr_date.getMinutes();

  if (dep_min == '0'){
    dep_min = '00';
  }

  if (arr_min == '0'){
    arr_min = '00';
  }


  final_card = 
  "<div class=\"flight-card d-block w-100\">" +
    "<div class=\"flight-card-header\">" +
      "<div class=\"flight-logo\">" +
        "<h1 style=\"color: white;\">" + flight.airline.name + "</h1>" +
      "</div>" +
      "<div class=\"flight-data\">" +
          "<div class=\"passanger-details\">" +
            "<span class=\"title\">Date</span>" +
            "<span class=\"detail\">" + flight.flight_date + "</span>" +
          "</div>" +
          "<div class=\"passanger-depart\">" +
            "<span class=\"title\">Depart</span>" +
            "<span class=\"detail\">" + dep_hours + ":" + dep_min + " H</span>" +
          "</div>" +
          "<div class=\"passanger-arrives\">" +
            "<span class=\"title\">Arrives</span>" +
            "<span class=\"detail\">" + arr_hours + ":" + arr_min +  " H</span>" +
          "</div>" +
        "</div>" +
    "</div>" +
  "<div class=\"flight-card-content\">" +
    "<div class=\"flight-row\">" +
      "<div class=\"flight-from col-sm-12\">" +
        "<span class=\"from-code\">" + flight.departure.iata + "</span>" +
        "<span class=\"from-city\">" + flight.departure.airport + "</span>" +
      "</div>" +
      "<div class=\"plane col-sm-12\">" +
        "<img src=\"https://cdn.onlinewebfonts.com/svg/img_537856.svg\" alt=\"\">" +
      "</div>" +
      "<div class=\"flight-to col-sm-12\">" +
        "<span class=\"to-code\">" + flight.arrival.iata + "</span>" +
        "<span class=\"to-city\">" + flight.arrival.airport + "</span>" +
      "</div>" +
    "</div>" +
    "<div class=\"flight-details-row\">" +
      "<div class=\"flight-operator col-sm-12\">" +
        "<span class=\"title\">OPERATOR</span>" +
        "<span class=\"detail\">" + flight.airline.name + "</span>" +
      "</div>" +
      "<div class=\"flight-number col-sm-12\">" +
        "<span class=\"title\">FLIGHT</span>" +
        "<span class=\"detail\">" + flight.flight.icao + "</span>" +
      "</div>" +
      "<div class=\"flight-class col-sm-12\">" +
        "<span class=\"title\">TIME ZONE</span>" +
        "<span class=\"detail\">" + flight.departure.timezone + "</span>" +
      "</div>" +
    "</div>" +
  "</div>" +
"</div>";

return final_card;
}

function write_messages(){
  if(document.getElementById('input_client').value.length >= 2){
    if(bot){
      var quick = $('#quick_answer');
      var first = $('#start_answer');
      if (quick.css('display') == 'block'){
        quick.css({'display': 'none'})
      }

      if (first.css('display') == 'block'){
        first.css({'display': 'none'})
      }
      var inputValue = document.getElementById("input_client").value;
      insert_html(inputValue, false);
      document.getElementById("input_client").value = "";
      document.getElementById("input_client").disabled = true;
      document.getElementById("input_client").placeholder = "Wait for response...";
      get_response(inputValue);
    } 
    else{
      var inputValue = document.getElementById("input_client").value;
      document.getElementById("input_client").value = "";
      connection.send($msg({ to: roomJid, from: connection.jid, type: 'groupchat' }).c('body').t(inputValue));
    }
  }
}

function get_human_help(){
  $.ajax({
    'url' : base_url+query_bot+"human help",
    'type' : 'GET',
    'success' : function(data) {

      intent = "talk_human";
      insert_html(data[0], true);
      insert_html(get_sentence("talk_human"), true);
      allow_writing();
      quick_response();
    }
  });
}

function get_response(statement){

  if (intent == "action"){
    $.ajax({
      'url' : base_url+find_city+statement,
      'type' : 'GET',
      'success' : function(data) {
        success = data[1];
        if(success == "success"){
          insert_html("Please wait while I search for flights...", true);
           
          // calling cities API
          $.ajax({
            'url' : flights_api + "dep_city=" + user_location + "&arr_city=" + statement,
            headers:{
                "Access-Control-Allow-Origin":"http://localhost"
            },
            'type' : 'GET',
            'success' : function(data) {
                results = data.data;
                scheduled = [];
                for (var i = 0; i<results.length; i++) {
                  if(results[i].flight_status == "scheduled" || results[i].flight_status == "active"){
                    scheduled.push(results[i]);
                  } 
                }

                scheduled.sort(function(a,b) {
                  var date1 = new Date(a.flight_date);
                  var date2 = new Date(b.flight_date);
                  return date1 - date2;
                });

                if(scheduled.length >= 5){
                  final_flights = scheduled.slice(0, 5);
                }
                else{
                  final_flights = scheduled;
                }

                if(final_flights.length == 0){
                  insert_html("There are no available flights to " + statement + "!", true);
                }
                else{
                  console.log(final_flights);
                  insert_results(final_flights);
                }

                insert_html(get_sentence("continue"), true);

                intent = "continue"
                allow_writing();
                quick_response();
            },
            'error': function (jqXHR) {
              errors ++;
              if (errors >=2){
                get_human_help();
              }
              else{
                if (jqXHR.status === 0) {
                  insert_html("I did not find any flights... please make sure you write the correct destination (In English).", true);
                } else if (jqXHR.status == 404) {
                  insert_html("I did not find any flights... please make sure you write the correct destination (In English).", true);
                } else {
                  insert_html("I did not find any flights... please make sure you write the correct destination (In English).", true);
                }
                allow_writing();
              }
            },
          });
        }
        else{
          errors ++;
          if (errors >=2){
            get_human_help();
          }
          else{
            insert_html("City not found! Please make sure you write the correct destination (In English).", true);
            allow_writing();
          } 
        }
      }
    });
  }
  else if( intent == "continue"){
    $.ajax({
      'url' : base_url+sentiment_analysis+statement,
      'type' : 'GET',
      'success' : function(data) {
        if(data == "affirmation"){
          insert_html(get_sentence("help"), true);
          intent = "feeling";
          allow_writing();
        }
        else if(data == "negation"){
          insert_html(get_sentence("goodbye"), true);
        }
        else{
          intent = "feeling";
          get_response(statement);
        }
      }
    });
  }
  else if(intent == "restart"){
    $.ajax({
      'url' : base_url+sentiment_analysis+statement,
      'type' : 'GET',
      'success' : function(data) {
        if(data == "affirmation"){
          insert_html(get_sentence("help"), true);
          intent = "feeling";
          allow_writing();
        }
        else{
          insert_html(get_sentence("sorry"), true);
        }
      }
    });
  }
  else if (intent == "geolocation"){
    $.ajax({
      'url' : base_url+sentiment_analysis+statement, // change to sentiment analysis
      'type' : 'GET',
      'success' : function(data) {
        if(data == "affirmation"){
          function locationError(error) {
            errors ++
            if (errors >=2){
              get_human_help();
            }
            else{
              insert_html("I need to have access to your location so that I can help you. \n Please allow the location request. ", true)
              insert_html("Have you changed?", true)
              allow_writing();
              quick_response();
            }
          }
          navigator.geolocation.getCurrentPosition(locationSuccess, locationError); 
        }
        else{
          insert_html(get_sentence("talk_human"), true);
          intent = "talk_human";
          allow_writing();
          quick_response();
        }
      }
    });
  }
  else if( intent == "talk_human"){
    $.ajax({
      'url' : base_url+sentiment_analysis+statement, // change to sentiment analysis
      'type' : 'GET',
      'success' : function(data) {
        if(data == "affirmation"){
          insert_html("Wait while I try to connect you with a human agent", true);
          connect_human();
        }
        else{
          insert_html("Do you wish to restart the talk?", true);
          intent = "restart";
          allow_writing();
        }
      }
    });
  }
  else if(intent == "verify_city"){
    $.ajax({
      'url' : base_url+sentiment_analysis+statement, // change to sentiment analysis
      'type' : 'GET',
      'success' : function(data) {
        errors = 0;
        if(data == "affirmation"){
          insert_html("The options available are: ", true);
          available_cities = city_options[0]
          for (var i = 1; i < city_options.length -1; i++){
            available_cities += ", " + city_options[i];
          }
          available_cities += " or " + city_options[city_options.length -1];
          insert_html(available_cities, true);
          intent = "new_departure";
          allow_writing()
        }
        else{
          intent = "action";
          insert_html(get_sentence("destination"), true);
          allow_writing()
        }
      }
    });
  }
  else if(intent == "new_departure"){
    cities = [];
    for (var i = 0; i < city_options.length ; i++ ){
      cities.push(city_options[i].toLowerCase());
    }
    $.ajax({
      'url' : base_url+find_city+statement,
      'type' : 'GET',
      'success' : function(data) {
        success = data[1];
        if(success == "success"){
          var i = 0
          data[0] = data[0].toLowerCase();
          for(; i < city_options.length; i++){
            if (data[0] == city_options[i].toLowerCase()){
              errors = 0;
              intent = "action";
              insert_html(get_sentence("destination"), true);
              allow_writing()
              break;
            }
          }
          if(i == city_options.length){
            errors ++;
            if (errors >=2){
              get_human_help();
            }
            else{
              insert_html("City not in the available options", true);
              allow_writing();
            }
          }
          
        }
        else{
          errors ++;
          if (errors >=2){
            get_human_help();
          }
          else{
            insert_html("City not found! Please make sure you write the correct destination (In English).", true);
            allow_writing();
          }
        }
      }
    });
  }
  else{
    $.ajax({
      'url' : base_url+query_bot+statement,
      'type' : 'GET',
      'success' : function(data) {
        intent = data[1];
        console.log(intent);
        if(intent == "action"){
          errors = 0;
          if( user_location == null){
            insert_html(data[0], true);
            get_location();
          }
          else{
            insert_html(get_sentence("destination"), true)
            allow_writing();
          }
        }
        else if(intent == "talk_human"){
          //insert_html(data[0], true);
          insert_html(get_sentence("talk_human"), true);
          allow_writing();
          quick_response();
        }
        else if (intent == "noanswer"){
          console.log(errors)
          errors ++;
          if (errors >=2){
            get_human_help();
          }
          else{
            insert_html(data[0], true);
            allow_writing();
          }
        }
        else{
          errors = 0;
          insert_html(data[0], true);
          allow_writing();
        }
      }
    });
  }
}

function get_location(){

  function locationError(error) {
      insert_html("I need to have access to your location so that I can help you. \n Please allow the location request. ", true)
      intent = "geolocation";
      insert_html("Have you changed the permissions?", true);
      allow_writing();
      quick_response();
  }
  navigator.geolocation.getCurrentPosition(locationSuccess, locationError); 
}


function leave_feedback(){
    $('#exampleModal').modal('show');
}

function change_rating(rate){
    rating_bot = rate;
    //console.log(rating_bot);
}

function submit_feedback(){
  $.ajax({
    'url' : base_url+sub_feedback,
    'type' : 'POST',
    'headers' : {"Content-Type" : "application/json"},
    'data' : JSON.stringify({
      'score' : rating_bot,
      'conversation' : conversation
    }),
    'success' : function(data) {
      $("#exampleModal").modal("hide");
      insert_html("Thanks for your feedback!", true);
    }
  });
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
  
    //print and obtain the body of the message.
    var body = elems[0];

    if(from.split("/")[1]== jid){
      insert_html(Strophe.getText(body), false);
    }
    else{
        insert_html(Strophe.getText(body), true);
    }
  }
  return true;
}

function connect_human(){
  //Start the connection
  connection = new Strophe.Connection(BOSH_SERVICE);

  $.ajax({
    'url' : API_URL, // change to sentiment analysis
    'type' : 'GET',
    'success' : function(data) {
      if(data.length != 0){
        bot = false;
        roomJid = data;
        connection.connect(jid+"@localhost",
          pw,
          onConnect);
        $('#messages').get(0).innerHTML = '';
        allow_writing();
        $('#user_name').text("Live Agent - " + roomJid.split(".")[0].replace(/[0-9]/g, ''));
        insert_html("Connected to human agent", true);
      }
      else{
          insert_html("Unfortunatly there are no human agents currently available.", true);
          insert_html("Do you wish to restart the talk?", true);
          intent = "restart";
          allow_writing();
      }
    }
  });
}

function quick_response(){
  var quick =  $('#quick_answer');

  if (quick.css('display') == 'block'){
    quick.css({'display': 'none'})
  }
  else{
    quick.css({'display': 'block'})
  }
}

function start_response(){
  var quick =  $('#start_answer');

  if (quick.css('display') == 'block'){
    quick.css({'display': 'none'})
  }
  else{
    quick.css({'display': 'block'})
  }
}

function use_quick_value(value, resp_type){
  if (resp_type){
    start_response();
  }
  else{
    quick_response();
  }

  insert_html(value, false);
  document.getElementById("input_client").value = "";
  document.getElementById("input_client").disabled = true;
  document.getElementById("input_client").placeholder = "Wait for response...";
  get_response(value);
}


