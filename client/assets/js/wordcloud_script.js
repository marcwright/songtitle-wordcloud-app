var search;
var goodWordsArray = [];

// event handler that calls the searchArtist function
$('#artistSearch').on('click', function(e){
  searchArtist(e);     
 });

// calls the hitAPI function passing in the search param, 
// also resets the screen for more searces without refresh
function searchArtist(e){
  e.preventDefault(); //stops page refresh with button click
  search = $('#searchCond').val();
  $('#artist').text('searching for ' + search); //briefly displays during API call
  musixmatchAPIArtistSearch(search); // 
  goodWordsArray = []; //empties out parsed out Array
  $('#lyric').empty(); //empties out lyrics div
}

//calls the musixmatch API, returns all tracks by given artist
function musixmatchAPIArtistSearch(userInput){
  $.ajax({
    type: "GET",
    data: {
        apikey:"45f030feddac66fcfa2f9e9f659608c4",
        page_size: 100,
        // q_track:"back to december",
        q_artist: userInput,
        // f_has_lyrics: 1, //only return results with lyrics
        format:"jsonp",
        callback:"jsonp_callback"
    },
    url: "https://api.musixmatch.com/ws/1.1/track.search",
    dataType: "jsonp",
    jsonpCallback: 'jsonp_callback',
    contentType: 'application/json',
    error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
    },
    success: function(data) {
      
      parseMusicData(data);            
    } 
  }) //end of AJAX
} //end of musixmatchAPIArtistSearch function


// digs into data and parses song titles into an array of words
function parseMusicData(data){
  var tracksArray = data.message.body.track_list; //each individual track object
  titlesStringArray(tracksArray);    

  // remove basic words from array, pushes good words into goodArray[]
  function removeBasicWords(array){
    var wordsToRemove = ["the", " ", "", "of", "and", "a", 1, "remix", "digital", "remastered", "version", "edited", "greatest", "hits", "edit"];
    
    $.each(array, function(i, val){
      if ($.inArray(val, wordsToRemove) == -1) {
        goodWordsArray.push(val);
      }
    });
  };

  // grabs each track title, makes a long string, then an array of words
  function titlesStringArray(array){    
      var str = '';
      $.each(tracksArray, function(i, val){
        str += ' ' + val.track.track_name
      });
      
      var stringArray = str.toLowerCase().replace(/\W/g, ' ').split(' ');
      removeBasicWords(stringArray);
  };

  //counts frequency of words
  function count(arr){
    return arr.reduce(function(m,e){
      m[e] = (+m[e]||0)+1; 
      return m;
    },{})};

  // sorts words by frequency  
  function sortWordFrequency(obj){
    // convert object into array
    var sortable=[];
    for(var key in obj)
      if(obj.hasOwnProperty(key))
        sortable.push([key, obj[key]]); // each item is an array in format [key, value]

    // sort items by value
    sortable.sort(function(a, b)
    {
      return a[1]-b[1]; // compare numbers
    });
    return sortable.reverse(); // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
  }

  // re-initialize the page
  function reset(){
    $('#artist').empty();
    $('#searchCond').val('');
    $('#artist').append("<p>" + search.toUpperCase() + "'s song titles</p>");
            
    // prints key/val to browser
    $.each(goodWordsArray, function(i, val){
      $('#lyric').append('<div><strong style="color:red">' + val[1] + ':</strong><span> ' + val[0] + '</span></div>');
    });
  }

  goodWordsArray = sortWordFrequency(count(goodWordsArray));
  
  // Options for the Word Cloud Function below
  var options = {
    list: goodWordsArray,
    // fontWeight: "bold",
    weightFactor: 10,
    // origin: [400,400],
    // shape: "star",
    shuffle: true,
    rotateRatio: .5
  }

  WordCloud(document.getElementById('my_canvas'), options );

  reset();
}