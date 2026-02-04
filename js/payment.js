  const firebaseConfig = {
    apiKey: "AIzaSyAwAE44Qyx1KbCZ9woQqi8s9xFL06l8n8M",
    authDomain: "creatorcoremain.firebaseapp.com",
    databaseURL: "https://creatorcoremain-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "creatorcoremain",
    storageBucket: "creatorcoremain.firebasestorage.app",
    messagingSenderId: "335493133788",
    appId: "1:335493133788:web:0e5793806e3d4f2035cb19"
  };

  // Initialize Firebase
firebase.initializeApp(firebaseConfig);

// refference my databse
var salesFormDB = firebase.database().ref("salesForm");

document.addEventListener('submit', submitForm);

function submitForm(e){
    e.preventDefault();

    var fullName = getElementVal('fullName')
    var phone = getElementVal('phone')
    var email = getElementVal('email')
    var bkashNumber = getElementVal('bkashNumber')
    var transactionId = getElementVal('transactionId')

    MakeSells(fullName , phone, email ,bkashNumber ,transactionId);
        window.location.href = "success.html";

}
const MakeSells = (fullName , phone, email ,bkashNumber ,transactionId) =>{
  var newSalesForm = salesFormDB.push();

  newSalesForm.set({
    fullName : fullName,
    phone :phone,
    email:email,
    bkashNumber:bkashNumber,
    transactionId:transactionId,
  })
}
const getElementVal = (id) =>{
    return document.getElementById(id).value;
}