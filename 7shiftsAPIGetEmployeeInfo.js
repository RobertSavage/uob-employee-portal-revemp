import {fetch} from 'wix-fetch'; 
//import {getSecret} from 'wix-secrets-backend';
import wixData from 'wix-data';

export async function getCurrentTemp() {

    const options = {method: 'GET', headers: {Authorization:"Bearer "{API KEY}",Accept: 'application/json'}};
    var sha256 = require('js-sha256');
    fetch('https://api.7shifts.com/v2/company/45224/users?limit=500&status=active', options)
      .then(response => response.json())
      .then(response => {
            var users = response.data;
            for (let index = 0; index < users.length; index++) {
                
                const user = users[index].user;
                
                const alphabet = "abcdefghijklmnopqrstuvwxyz";
                const randomCharacter = alphabet[Math.floor(Math.random() * alphabet.length)] + alphabet[Math.floor(Math.random() * alphabet.length)] + alphabet[Math.floor(Math.random() * alphabet.length)];
                const randomPassword = randomCharacter+Math.floor(Math.random() * 9999);
                const userInfo = {"_id":user.id.toString(),
                                  "firstName":user.firstname.toString(),
                                  "lastName":user.lastname.toString(),
                                  "email":user.email.toString(),
                                  "password":sha256(randomPassword.toString()),
                                  "tempPassword":randomPassword.toString(),
                                  "active":true
                                };
                var id = user.id.toString();
                wixData.query("RegisteredUsers")
                    .eq("_id",id)
                    .find()
                    .then((results) => {
                        if(results.items.length == 0){
                          wixData.insert("RegisteredUsers", userInfo)
                            .then((item) => {
                              //console.log(item); //see item below
                          })                     
                        }
                    })
                .catch((err) => {console.log(err);});
            }


      })
      .catch(err => console.error(err));
   
   console.log("Completed user pull.")
 
}



export async function getUserLocationAndJobs(){
    console.log("Start")
    var locationData = {
      62371 : "Davis",
      315727 : "East Sacramento",
      261160 : "Folsom",
      55676 : "Rocklin",
      203149 : "Roseville",
      63523 : "Sacramento",
      63522 : "Vacaville",
      193644 : "Office"
    }

    //Loop through all locations
    var counter = 0;
    var locationsDataKeys = Object.keys(locationData)
 
    const options = {method: 'GET', headers: {Authorization:"Bearer "{API KEY}",Accept: 'application/json'}};
    fetch('https://api.7shifts.com/v2/company/45224/users?limit=500&status=active', options)
    .then(responseLocation => responseLocation.json())
      .then(responseLocation => {
        
        var users = responseLocation.data; 
        
        var toIntsert = []
        for (let index = 0; index < users.length; index++) {
          const user = users[index];
          
          //loop through all users in those locations
          fetch('https://api.7shifts.com/v2/company/45224/users/'+user.id.toString()+'/assignments', options)
          .then(response => response.json())
            .then(response => {
              
              var userInfo = response.data; 
              //console.log(userInfo.departments)
              wixData.query("RegisteredUsers")
              .eq("firstName", user["first_name"])
              .eq("lastName", user["last_name"])
              .find()
              .then((results) => {

                var user = results.items[0];
                for (let indexUser = 0; indexUser < userInfo.departments.length; indexUser++) {
                  const info = userInfo.departments[indexUser];
                  if(user.position == null || user.position == undefined || user.position == "" ){
                    user.position = [info.name]
                  }else{
                    if(user.position.includes(info.name) == false){
                      user.position.push(info.name)
                    }
                  }

                  if(user.location == null || user.location == undefined || user.location == "" ){
                    user.location = [locationData[info.location_id]]
                  }else{
                    if(user.location.includes(locationData[info.location_id]) == false){
                      user.location.push(locationData[info.location_id])
                    }                    
                  }
                }
                //-----For Loop End
                wixData.update("RegisteredUsers",user)
              })
              //-----Query End
          })
          //-----Fetch End
        }
        //-----For Loop End
    })
    //-----Fetch Loop 
    console.log("End")
}
