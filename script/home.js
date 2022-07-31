//-------------- Your web app's Firebase configuration ------------------//
const firebaseConfig = {
    apiKey: "AIzaSyCzZ7cOiBFSKZ21yBwNg3mps1764mSJOpo",
    authDomain: "quiz2-f87e2.firebaseapp.com",
    projectId: "quiz2-f87e2",
    storageBucket: "quiz2-f87e2.appspot.com",
    messagingSenderId: "346823333135",
    appId: "1:346823333135:web:0db11aaaca9f09df5e5a7a"
};


//------------------ Initialize Firebase ------------------//
firebase.initializeApp(firebaseConfig);

//para llamar a la bbdd
const db = firebase.firestore();


let isLogged = localStorage.getItem("user")
if(isLogged == null){
    console.log("User not logged");
    window.location.href = "../index.html"
}

const user = JSON.parse(localStorage.user)




//DESLOGUEARSE con Google AUTH
const deslogarGoogle = async () => {
    try {
        let user = await firebase.auth().currentUser;
        await firebase.auth().signOut();
        console.log("Sale del sistema: " + user.email);
        localStorage.clear();
    } catch (error) {
        console.log("Ha habido un error: " + error);
    }
  }

  document.getElementById("unlog").addEventListener("click", deslogarGoogle);



document.getElementById("startQuiz").addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "quiz.html";
})




//----------------- Unlogin mail + pass ------------------//

const signOut = () => {

    firebase.auth().signOut().then(() => {
        localStorage.clear();
        window.location.href = "../index.html"
    }).catch((error) => {
        console.log("hubo un error: " + error);
    });
}

document.getElementById("unlog").addEventListener("click", signOut);



//------------------- Listener de usuario en el sistema ------------------//

document.getElementById("loggedUsers").innerHTML = `
    <h4> ${user[0].email} </h4>

`


    //----------------- Gráfica de puntuaciones ------------------//

let puntuaciones = [];
let fechas = [];
async function getDataFire() {
    await db.collection("score")
        .where('email', '==', user[0].email)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                console.log(doc.data());
                puntuaciones.push(doc.data().puntuacion);
                fechas.push(doc.data().fechascore);
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}

getDataFire().then(() => {
    createChart (puntuaciones, fechas)
});

function createChart (puntuaciones, fechas) {
    new Chartist.Bar('.ct-chart', {
        labels: fechas,
        series: puntuaciones
      }, {
        distributeSeries: true
      });

}



