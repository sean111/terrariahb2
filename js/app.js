var db;
var dbArray=[];

$('#menu').live('pageshow', function(e, data) {
    var cat=getUrlVars()['cat'];
    var subcat=getUrlVars()['subcat'];
    var listview=$('#menuLinks');
    listview.empty();
    listview.hide();
    var query;
    var x;
    if(subcat===undefined) {
        //Category Only
        $('#menuHeader').html(cat);
        query="SELECT DISTINCT subcat FROM items WHERE category='"+cat+"' ORDER BY subcat";
        db.transaction(function(tx) {
            tx.executeSql(query, [], function(tx, results) {
                len=results.rows.length;
                for(x=0; x<len; x++) {
                    listview.append("<li><a href='menu.html?cat="+cat+"&subcat="+results.rows.item(x).subcat+"'>"+results.rows.item(x).subcat.uCaseWords()+"</a></li>");
                }
                listview.listview("refresh", true);
                listview.show();
            });
        });
    }
    else {
        //Category and Subcat (assumed)
        $('#menuHeader').html(subcat);
        query="SELECT name, category, subcat FROM items WHERE subcat='"+subcat+"'";
        db.transaction(function(tx) {
            tx.executeSql(query, [], function(tx, results) {
                len=results.rows.length;
                for(x=0;x<len;x++) {
                    var tName = results.rows.item(x).name.camel();
                    var link = '../'+results.rows.item(x).category+"/"+results.rows.item(x).subcat+"/"+tName+".html";
                    listview.append("<li><a href='"+link+"'><img src='../../img/"+tName+".png' class='ui-li-icon' width='20' height='20'>"+results.rows.item(x).name+"</a></li>");
                }
                listview.listview("refresh", true);
                listview.show();
            });
        });
    }
});

document.addEventListener('deviceready', function () {
    //alert('Device Ready');
    document.addEventListener('menubutton', function() {
        location.href='/index.html#mainMenu';
    }, false);
    document.addEventListener('searchbutton', function() {
        location.href='/objects/misc/search.html';
    }, false);
}, false);

$(function() {
    $.mobile.defaultPageTransition='none';
    db = openDatabase("thb", "", "thb", 2000000);

    if(db.version === "") {
        db.changeVersion("", "1", function(t) {
            populateDatabase();
        });
    }
    $('#searchButton').live('tap', function() {
        var itemName=$('#searchBox').val();
        var resultsContainer = $('#searchResults');
        resultsContainer.empty();
        resultsContainer.hide();
        query = "SELECT name, category, subcat FROM items WHERE name LIKE '%"+itemName+"%'";
        db.transaction(function(tx) {
            tx.executeSql(query, [], function(tx, results) {
                len = results.rows.length;
                if(len===0) {
                    $(resultsContainer).append("<li>No results found</li>");
                }
                else {
                    for(x=0;x<len;x++) {
                        var tName=results.rows.item(x).name;
                        var cat = results.rows.item(x).category;
                        var subcat = results.rows.item(x).subcat;
                        tName = tName.camel();
                        var link = "../"+cat+"/"+subcat+"/"+tName+".html";
                        resultsContainer.append("<li><a href='"+link+"'><img src='../../img/"+tName+".png' class='ui-li-icon' width='20' height='20'/>"+results.rows.item(x).name+"</a></li>");
                    }
                    resultsContainer.listview("refresh", true);
                }
            });
        });
        resultsContainer.show();
    });
});

String.prototype.camel = function() {
    var tmp=this.split(" ");
    tmp[0]=tmp[0].charAt(0).toLowerCase()+tmp[0].slice(1);
    for(var x=1; x<tmp.length; x++) {
        tmp[x]=tmp[x].charAt(0).toUpperCase()+tmp[x].slice(1);
    }
    tmp=tmp.join("");
    tmp=tmp.replace("'", "");
    return tmp;
};

String.prototype.uCaseWords=function() {
    var tmp=this.split(" ");
    for(var x=0; x<tmp.length; x++) {
        tmp[x]=tmp[x].charAt(0).toUpperCase()+tmp[x].slice(1);
    }
    return tmp.join(" ");
};

function doQuery(query, showResult) {
    if(showResult) {
        db.transaction(function(tx) {
            tx.executeSql(query, [], function(tx, results) {
                //console.log(results);
                return results;
            });
        });
    }
    else {
        db.transaction(function(tx) {
            tx.executeSql(query);
        });
    }
}

function search(name) {
    name = name.toLowerCase();
    //console.log(name);
    query = "SELECT name FROM items WHERE name LIKE '%"+name+"%'";
    db.transaction(function(tx) {
        tx.executeSql(query, [], function(tx, results) {
            len = results.rows.length;
            if(len===0) {
                //console.log("No results found");
            }
            else {
                for(x=0;x<len;x++) {
                    //console.log(results.rows.item(x).name);
                }
            }
        });
    });
}

function populateDatabase() {
    //console.log("populating the database");
    db.transaction(
        function(tx) {
            //console.log("Inserting Data");
            tx.executeSql("DROP TABLE IF EXISTS items");
            tx.executeSql("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name, category, subcat)");
            $.getScript("js/dbdata.js").done(function(script, status) {
                for(x=0; x<dbArray.length; x++) {
                    //console.log("Executing query "+x);
                    doQuery(dbArray[x], false);
                }
            });
            //console.log("Done");
        }
    );
}

function databaseError(tx, error) {
    console.error("Error: "+error);
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}