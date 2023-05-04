import {local} from 'wix-storage';
import {session} from 'wix-storage';
import { hashCheck } from 'backend/hashCheck';
import { getTestTrackerData } from 'backend/googleSheetsTestTracker';
import wixLocation from 'wix-location';
import wixData from 'wix-data';

$w.onReady(function () {
    
    //---------- This handles reading logged in users ----------
    //This gets the saved token
    var loggedInToken = local.getItem("loginToken");
    var manager = false;
    var location = [];
    //If there is a token in the saved cache it checks
    if (loggedInToken != null) {
        //This checks if that saves token is in the user database
        hashCheck(loggedInToken).then(result => {
            if (result[0] != true) {
                wixLocation.to("https://rsavage382.editorx.io/my-site-1/login");
            }else{
                //console.log(result)
            }

            if(result[1] == "Manager" || result[1] == "Admin"){
                manager = true;
                location = result[2];
            }

        })
    }else{wixLocation.to("https://rsavage382.editorx.io/my-site-1/login");}
    //------------------------------------------------------------

    getTestTrackerData()
    .then((testTracker) => {
        //console.log(testTracker)
        wixData.query("RegisteredUsers").eq("hash",loggedInToken).find()
        .then((results) => {
            if(results.items.length != 0){
                for (let index = 0; index < testTracker.length; index++) {
                    const employee = testTracker[index];
                    if(employee["Name"] == results.items[0].firstName+" "+results.items[0].lastName){
                        var userData = testTracker[index]
                    }
                    
                }
                $w('#repeater1').onItemReady( ($item, itemData, index) => {
                    try{
                        $item("#text12").text = userData[$item("#text10").text]
                        var todayPlus14 = new Date(Date.now() + 12096e5);
                        var today = new Date();
                        var testDate = new Date(userData[$item("#text10").text].toString());
                        if(todayPlus14 < testDate){
                            $item('#box40').style.backgroundColor = "rgba(0, 255, 0,1)";
                        }
                        if(todayPlus14 > testDate){
                            $item('#box40').style.backgroundColor = "rgba(255, 255, 0,1)";
                        }
                        if(today > testDate){
                            $item('#box40').style.backgroundColor = "rgba(255, 0, 0,1)";
                        }

                    }catch{
                        console.log($item("#text12").text)
                        console.log(userData[$item("#text10").text])
                        $item("#text12").text = "01/01/2023";
                    }
                        

                })
            }
            $w('#repeater1').expand()
            $w('#imageX116').collapse()
            
        
        })

        //manager section
        if(manager == true){
            wixData.query("RegisteredUsers").eq("active",true).contains("position","Front of House").limit(200).find()
            .then((results) => {
                
                var managerRepeater = [];
                if(results.items.length != 0){
                    var usersUnderManager = [];
                    for (let index = 0; index < results.items.length; index++) {
                        const row = results.items[index];
                        if(findCommonElement(location,row["location"]) == true){
                            usersUnderManager.push(row)
                        }
                    }

                    //go through manager users
                    let excludes = ["Event Host","Tony Villanueva","Sean Biggs","MK Yungvanitsait","Nate Yungvanitsait","Moises Tepe"];
                    for (let index = 0; index < usersUnderManager.length; index++) {
                        var employee = usersUnderManager[index];
                        var employeeName = employee["firstName"]+" "+employee["lastName"];
                        
                        //go through tracker data
                        for (let index = 0; index < testTracker.length; index++) {
                            const tracker = testTracker[index];
                            if(tracker["Name"] == employeeName && !excludes.includes(tracker["Name"])){
                                tracker["_id"] = index.toString();
                                tracker["Location"] = employee["location"].filter(n => n).join(", ").toString();
                                tracker["Position"] = employee["position"].filter(n => n);
                                if(employee["role"] != "Lead" && employee["role"] != "Lead in Training" && employee["role"] != "Manager" && employee["role"] != "Admin"  && parseInt(tracker["Test Due"]) != 0){
                                    tracker["Test Due"] = parseInt(tracker["Test Due"]) - 4
                                }
                                managerRepeater.push(tracker)
                            }
                        }
                    }       
                }

                $w('#managerRepeater').onItemReady( ($item, itemData, index) => {
                    $item('#name').text = itemData["Name"];
                    $item('#testDue').text = "Test Due: "+itemData["Test Due"].toString();
                    $item('#POA').text = itemData["POST-ORIENTATION ASSESSMENT"];
                    $item('#EFT1').text = itemData["EXPO AND FOOD TEST - PART 1"];
                    $item('#EFT2').text = itemData["EXPO AND FOOD TEST - PART 2"];
                    $item('#RBS').text = itemData["RESPONSIBLE BEVERAGE SERVICE"];
                    $item('#BT').text = itemData["BEER TEST"];
                    $item('#BC').text = itemData["BAR & COCKTAIL"];
                    $item('#MCT').text = itemData["MUG CLUB TEST"];
                    $item('#SOS').text = itemData["STEPS OF SERVICE"];
                    $item('#T2BT').text = itemData["TIER 2 BEER TEST"];
                    $item('#SLTF').text = itemData["SHIFT LEAD TEST - PART 1 (FUNDAMENTALS)"];
                    $item('#SLTP').text = itemData["SHIFT LEAD TEST - PART 2 (POLICY)"];
                    $item('#SLTM').text = itemData["SHIFT LEAD TEST - PART 3 (MENTALITY)"];
                    $item('#SLTL').text = itemData["SHIFT LEAD TEST - PART 4 (LEADERSHIP)"];
                    $item('#location').text = itemData["Location"];
                    if(parseInt(itemData["Test Due"]) <= 0){
                        $item('#box41').style.backgroundColor = "rgba(0, 255, 0,1)";
                    }
                    if(parseInt(itemData["Test Due"]) >= 1){
                        $item('#box41').style.backgroundColor = "rgba(255, 255, 0,1)";
                    }
                    if(parseInt(itemData["Test Due"]) >= 4){
                        $item('#box41').style.backgroundColor = "rgba(255, 0, 0,1)";
                    }
                });             
                
                managerRepeater.sort(function(a, b){
                    var nameA=a.Name.toLowerCase(), nameB=b.Name.toLowerCase()
                    if (nameA < nameB) //sort string ascending
                        return -1 
                    if (nameA > nameB)
                        return 1
                    return 0 //default return value (no sorting)
                })
                $w('#managerRepeater').data = managerRepeater;
            })

            $w('#button2').expand()

        }
    })

    $w('#box41').onClick((event) => {
        employeeTestClick(event)
    })
    
    $w('#button2').onClick((event) => {
        $w('#section4').collapse()
        $w('#section7').expand()

        var locationSel = [{"label":"All","value":"All"}]
        for (let index = 0; index < location.length; index++) {
            var row = location[index];
            if(row != null){
                locationSel.push({"label":row.toString(),"value":row.toString()})
            }
        }
        
        $w("#locationSelect").options = locationSel;

        $w("#locationSelect").onChange((event) => {
            
            
            $w('#managerRepeater').forEachItem( ($item, itemData, index) => {
                var data = itemData["Location"].split(", ")
                if($w("#locationSelect").value == "All"){
                    $item('#box41').expand()
                    return
                }
                if($w("#locationSelect").value != "Office"){
                    if(!data.includes($w("#locationSelect").value) || data.includes("Office") || data.length > 4){
                        $item('#box41').collapse()
                    }else{
                        $item('#box41').expand()
                    }
                }else{
                    if(!data.includes($w("#locationSelect").value)){
                        $item('#box41').collapse()
                    }else{
                        $item('#box41').expand()
                    }

                }

            })

            
        })
    })


    $w('#button3').onClick((event) => {
        $w('#section7').collapse()
        $w('#section4').expand()
    })

});
//---------- This is the function used to reset beer boxes (used in beerContainerClick) ----------
export function collapseAll(currentItem) {
  $w("#managerRepeater").onItemReady( ($item, itemData, index) => {
    if ($item("#testingBox").collapsed == false && currentItem != $item("#name").text){
      $item("#testingBox").collapse();
    }
  });
}
//-----------------------------------------------------------------------------------------------



//---------- This is the function that handles collapsing and expanding beer boxes ----------
export function employeeTestClick(event) {
  let $item = $w.at(event.context);
  collapseAll($item("#name").text)
  if( $item("#testingBox").collapsed) {
    $item("#testingBox").expand();
  }
  else {
    $item("#testingBox").collapse();
  }
}
//----------------------------------------------------------------------

export function findCommonElement(array1, array2) {
     
    // Loop for array1
    for(let i = 0; i < array1.length; i++) {
         
        // Loop for array2
        for(let j = 0; j < array2.length; j++) {
             
            // Compare the element of each and
            // every element from both of the
            // arrays
            if(array1[i] === array2[j]) {
             
                // Return if common element found
                return true;
            }
        }
    }
     
    // Return if no common element exist
    return false;
}
