import wixData from 'wix-data';
import wixWindow from 'wix-window';
import { local } from 'wix-storage';
import { session } from 'wix-storage';
import { hashCheck } from 'backend/hashCheck';
import wixLocation from 'wix-location';

$w.onReady(function () {
    
    //---------- This handles reading logged in users ----------
    //This gets the saved token
    var loggedInToken = local.getItem("loginToken");

    //If there is a token in the saved cache it checks
    if (loggedInToken != null) {
        //This checks if that saves token is in the user database
        hashCheck(loggedInToken).then(result => {
            if (result[0] != true) {
                wixLocation.to("https://rsavage382.editorx.io/my-site-1/login");
            }else{
                console.log(result)
            }
        })
    }else{wixLocation.to("https://rsavage382.editorx.io/my-site-1/login");}
    //------------------------------------------------------------



    //---------- This Loads in all the users saved progress ----------
    updateStatus(loggedInToken)
    $w('#checkboxGroup1').onChange((event) => {
        colorChange(event)
    })
    //------------------------------------------------------------
    


    //---------- This handles saving learning academy progress ----------
    $w("#checkboxGroup1").onClick( (event)  => {
        let $item = $w.at(event.context);
        wixData.query("RegisteredUsers")
        .eq("hash",loggedInToken.toString())
        .eq("active",true)
        .find()
        .then((results) => {
            if(results.items.length > 0){
                var user = results.items[0];
                //If this is the users first time clicking a box
                if(user.learningAcademy == undefined){
                    user.learningAcademy = [$item('#materialData').label]
                    wixData.update("RegisteredUsers",user)
                    return
                }
                //See if box is checked or unchecked
                if($item('#checkboxGroup1').value[0] == "true"){
                    user.learningAcademy.push($item('#materialData').label)
                    wixData.update("RegisteredUsers",user)
                }else{
                    const index = user.learningAcademy.indexOf($item('#materialData').label);
                    user.learningAcademy.splice(index, 1);
                    wixData.update("RegisteredUsers",user)
                }
            }
        })
    });
    //------------------------------------------------------------



    $w('#managerTools').onClick((event) =>{
        $w('#learningAcademy').setFilter( wixData.filter()
        .eq("catagory", "Manager Tools")
        );
    })

    $w('#workingWithATeam').onClick((event) =>{
        $w('#learningAcademy').setFilter( wixData.filter()
        .eq("catagory", "Working With A Team")
        );
    })

    $w('#customerService').onClick((event) =>{
        $w('#learningAcademy').setFilter( wixData.filter()
        .eq("catagory", "Customer Service")
        );
    })

    $w('#attitudeInTheWorkPlace').onClick((event) =>{
        $w('#learningAcademy').setFilter( wixData.filter()
        .eq("catagory", "Attitude In The Workplace")
        );
    })

    $w('#humanResources').onClick((event) =>{
        $w('#learningAcademy').setFilter( wixData.filter()
        .eq("catagory", "Human Resources")
        );
    })

    $w('#communication').onClick((event) =>{
        $w('#learningAcademy').setFilter( wixData.filter()
        .eq("catagory", "Communication")
        );
    })

    $w('#timeAndAttendance').onClick((event) =>{
        $w('#learningAcademy').setFilter( wixData.filter()
        .eq("catagory", "Time & Attendance")
        );
    })

    $w('#shiftLeadTraining').onClick((event) =>{
        $w('#learningAcademy').setFilter( wixData.filter()
        .eq("catagory", "Shift Lead Training")
        );
    })

    $w('#fullList').onClick((event) =>{
        $w('#learningAcademy').setFilter( wixData.filter()
        );
    })




    //this collapses the containers when the page loads for mobile and tablet view
    if(wixWindow.formFactor == "Mobile" || wixWindow.formFactor == "Tablet"){
      $w("#learningRepeater").onItemReady( ($item, itemData, index) => {
        $item("#topicData").collapse();
          $item("#authorData").collapse();
          $item("#lengthData").collapse();
          $item("#topic").collapse();
          $item("#author").collapse();
          $item("#length").collapse();
          $item("#checkboxGroup1").collapse();
        
      });
         //This is calls the function to expand a container when its closed
      $w("#box1").onClick( (event) => {
        //local.setItem("location", "roseville");
        beerContainerClick(event)
      });

    }









});

export function updateStatus(loggedInToken){
    wixData.query("RegisteredUsers")
    .eq("hash",loggedInToken.toString())
    .eq("active",true)
    .find()
    .then((results) => {
        $w("#learningRepeater").onItemReady( ($item, itemData, index) => {
            var user = results.items[0];
            if(user.learningAcademy.includes($item('#materialData').label)){
                $item('#checkboxGroup1').value = ["true"];
                $item('#box1').style.backgroundColor = "rgba(124, 252, 0,1)";
            }
        });
    })      
}
export function colorChange(event){
    let $item = $w.at(event.context);
    if($item('#checkboxGroup1').value[0] == "true"){
        $item('#box1').style.backgroundColor = "rgba(124, 252, 0,1)";
    }else{
        $item('#box1').style.backgroundColor = "rgba(255,255,255,1)";
    }
}


//This function collapses any expanded containers, so when the user clicks a diffrent container this closes the other one for them.
export function collapseAll(currentItem) {
  $w("#learningRepeater").onItemReady( ($item, itemData, index) => {
    if ($item("#materialData").collapsed == false && currentItem != $item("#materialData").label){
      $item("#topicData").collapse();
      $item("#authorData").collapse();
      $item("#lengthData").collapse();
      $item("#topic").collapse();
      $item("#author").collapse();
      $item("#lengthData").collapse();
      $item("#checkboxGroup1").collapse();
      }
  });
}

//This handles the collapsing and expanding of the containers
export function beerContainerClick(event) {
  let $item = $w.at(event.context);
  collapseAll($item("#materialData").label)
  if( $item("#topicData").collapsed) {
      $item("#topicData").expand();
      $item("#authorData").expand();
      $item("#lengthData").expand();
      $item("#topic").expand();
      $item("#author").expand();
      $item("#lengthData").expand();
      $item("#checkboxGroup1").expand();
      
  }
  else {
      $item("#topicData").collapse();
      $item("#authorData").collapse();
      $item("#lengthData").collapse();
      $item("#topic").collapse();
      $item("#author").collapse();
      $item("#lengthData").collapse();
      $item("#checkboxGroup1").collapse();
     
  }
}
