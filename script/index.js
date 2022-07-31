//Obtenemos la Fecha y la hora, y la guardamos en un JSON para meterlas en localStorage.
let date = new Date();
let formatDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()+" ("+date.getHours() + "h:" + date.getMinutes()+"m)";

let localSdata = JSON.parse(localStorage.getItem("user"));



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

//---------------- Creación de la colección "users" ------------------//

const createUser = (user) => {
    db.collection("users")
        .add(user)
        .then((docRef) => console.log("Document written with ID: ", docRef.id))
        .catch((error) => console.error("Error adding document: ", error));
};


// Pantalla inicial

document.getElementById("form-log").style.display = "none";
document.getElementById("form-reg").style.display = "none";
document.getElementById("loggedUsers").style.display = "none";
document.getElementById("unlog").style.display = "none";
document.getElementById("startQuiz").style.display = "none";
document.getElementById("chartScore").style.display = "none";


document.getElementById("dropdown-log").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("form-log").style.display = "flex";
    document.getElementById("form-reg").style.display = "none";
})


document.getElementById("dropdown-reg").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("form-log").style.display = "none";
    document.getElementById("form-reg").style.display = "flex";
})

document.getElementById("figure-index").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("form-log").style.display = "none";
    document.getElementById("form-reg").style.display = "none";
})


//--------------- Auth Firebase con Google ------------------//
let provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().languageCode = 'es';


//---------------- Logarse con Google + registro en BBDD en caso de no estar registrado --------------------//
async function loginGoogle(){
    try {
        const response = await firebase.auth().signInWithPopup(provider)
        console.log(response)
        let newUser = {
            email: response.user.email,
            id: response.user.uid
        }
        console.log(response.user.email)

        db.collection("users")
        .where("email", "==", response.user.email)
        .get()
        .then((querySnapshot) => {  
            console.log(querySnapshot);
            if (querySnapshot.size == 0) { //si el mail NO está en BBDD, se crea un nuevo registro
                db.collection("users")
                    .add(newUser)
                    .then((docRef) => console.log("Document written with ID: ", docRef.id))
                    .catch((error) => console.error("Error adding document: ", error));
            } else {
                console.log(`Usuario con mail ${response.user.email} ya existe en la BBDD.`);
            }
        });

        return response.user

    } catch (error) {
        console.log(error)
    }
}

//Botón logarse con Google

const googleBtn = document.getElementById('dropdown-regGoogle');

googleBtn.addEventListener('click', async (e)=> {
    try {
        await loginGoogle()
    } catch (error) {}
});


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
  

//--------------- Auth Firebase con mail + pass (Sigh up -> registrarse) ------------------//

const signUpUser = (email, password) => {
    console.log(email, password);
    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Inicio sesión (Sigh in -> iniciar sesión):
            let user = userCredential.user;
            console.log(`se ha registrado ${user.email} ID:${user.uid}`)
            alert(`se ha registrado ${user.email} ID:${user.uid}`)

            // Creación del usuario en Firestore a la misma vez que se hace el registro
            createUser({
                id: user.uid,
                email: user.email,
            });

            document.getElementById("dropdown-reg").style.display = "none";
            document.getElementById("form-reg").style.display = "none";
            document.getElementById("dropdown-log").style.display = "none";
            document.getElementById("form-log").style.display = "none";
            document.getElementById("bar").style.display = "none";
            wellcomeContent.innerHTML = `<h3>Sesión iniciada: ${user.email}</h3>`
            document.getElementById("loggedUsers").style.display = "none";
            document.getElementById("unlog").style.display = "flex";
            document.getElementById("startQuiz").style.display = "flex";
            document.getElementById("chartScore").style.display = "none";
            

        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log("Error en el sistema: " + errorMessage);
        });
};

//Credenciales creadas para demostración:
//monica@mail.com (123456)
//nacho@mail.com (1234567)


let regexmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/
let regexpass = /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,16}$/
//regex para normalización de mail y contraseña(dígitos, minúsculas y mayúsculas)

const mailTextHelp = document.getElementById('helpEmail')
const passTextHelp = document.getElementById('helppass')
const passTextHelpTwo = document.getElementById('helppass-repeat')
//para que todos los textos auxiliares estén ocultos

mailTextHelp.style.display = "none";
passTextHelp.style.display = "none";
passTextHelpTwo.style.display = "none";

// Uso del DOM para recoger los valores introducidos en los inputs de "mailreg", "passreg" y "passregrep" y guardarlos en sus respectivas variables al pulsar "submit"
document.getElementById("form-reg").addEventListener("submit", function (event) {
    event.preventDefault();
    let email = event.target.elements.mailreg.value;
    let pass = event.target.elements.passreg.value;
    let pass2 = event.target.elements.passregrep.value;

    // Declaración que obliga a coincidir los campos de "pass" y "pass2"
    pass === pass2 ? signUpUser(email, pass) : alert("error password");

    //validación mail de registro:
    if (!regexmail.test(email.value)) {     
    //el .test() me comprueba que el valor del campo email cumpla los requisitos de la regex
        mailTextHelp.style.color = "#ee4242";
        mailTextHelp.style.display = "block";
    } else {
        mailTextHelp.style.border = ""
        mailTextHelp.style.color = ""
        mailTextHelp.style.display = "none";
    }

    //validación password de registro (dígitos, minúsculas y mayúsculas):
    if (!regexpass.test(pass.value)) {
        passTextHelp.style.color = "#ee4242";
        passTextHelp.style.display = "block";
    } else {
        passTextHelp.style.border = ""
        passTextHelp.style.color = ""
        passTextHelp.style.display = "none";
    }

    if (pass != pass2 ) {
        passTextHelpTwo.style.color = "#ee4242";
        passTextHelpTwo.style.display = "block";
    } else {
        passTextHelp.style.border = ""
        passTextHelp.style.color = ""
        passTextHelp.style.display = "none";
    }


    let user =[
        {
          "email": document.getElementById("mailreg").value,
          "fechalog": formatDate,
        }
      ];

      localStorage.setItem("user", JSON.stringify(user));
})


document.getElementById("startQuiz").addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "./pages/quiz.html";
})



//------------------- Login con mail + pass ------------------//

const mailTextHelpLg = document.getElementById('validEmail')
const passTextHelpLg = document.getElementById('validpass')
//para que todos los textos auxiliares estén ocultos
mailTextHelpLg.style.display = "none";
passTextHelpLg.style.display = "none";


const signInUser = (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            let user = userCredential.user;
            console.log(`se ha logado ${user.email} ID:${user.uid}`)
            alert(`se ha logado ${user.email} ID:${user.uid}`)
            console.log(user);

            document.getElementById("dropdown-reg").style.display = "none";
            document.getElementById("form-reg").style.display = "none";
            document.getElementById("dropdown-log").style.display = "none";
            document.getElementById("form-log").style.display = "none";
            document.getElementById("bar").style.display = "none";
            wellcomeContent.innerHTML = `<h3>Sesión iniciada: ${user.email}</h3>`
            document.getElementById("loggedUsers").style.display = "none";
            document.getElementById("unlog").style.display = "flex";
            document.getElementById("startQuiz").style.display = "flex";
            document.getElementById("chartScore").style.display = "flex";


    //----------------- Validaciones Login --------------------//
    //         //validación mail de login:
    // let emailLg = document.getElementById('maillog').value;
    // let passLG = document.getElementById('passlog').value;


    // if (condition) {
        
    // } else {
        
    // }

    //----------------- Gráfica de puntuaciones ------------------//

            let puntuaciones = [];
            let fechas = [];
            async function getDataFire() {
                await db.collection("score")
                    .where("email", "==", localSdata[0].email)
                    .limit(5)
                    .get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
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
                new Chartist.Bar(
                    ".ct-chart",
                    {
                        labels: fechas,
                        series: [puntuaciones],
                    },
                    {
                        seriesBarDistance: 10,
                        low: 0,
                        high: 10,
                    },
                );

                Chartist.precision = 0;
            }

            document.getElementById("chartScore").style.display="block";



        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode)
            console.log(errorMessage)
        });
}

document.getElementById("form-log").addEventListener("submit", function (event) {
    event.preventDefault();
    let email = event.target.elements.maillog.value;
    let pass = event.target.elements.passlog.value;
    signInUser(email, pass)
    let user =[
        {
          "email": document.getElementById("maillog").value,
          "fechalog": formatDate,
        }
      ];
    
      localStorage.setItem("user", JSON.stringify(user));
      
})



document.getElementById("startQuiz").addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "./pages/quiz.html";
})



//----------------- Unlogin mail + pass ------------------//

const signOut = () => {
    let user = firebase.auth().currentUser;

    firebase.auth().signOut().then(() => {
        console.log("Sale del sistema: " + user.email)

        document.getElementById("dropdown-reg").style.display = "flex";
        document.getElementById("dropdown-reg").style.justifyContent = "center";
        document.getElementById("form-reg").style.display = "none";
        document.getElementById("dropdown-log").style.display = "flex";
        document.getElementById("dropdown-log").style.justifyContent = "center";
        document.getElementById("form-log").style.display = "none";
        document.getElementById("bar").style.display = "flex";
        wellcomeContent.innerHTML = ``
        document.getElementById("loggedUsers").style.display = "none";
        document.getElementById("unlog").style.display = "none";
        document.getElementById("startQuiz").style.display = "none";

    }).catch((error) => {
        console.log("hubo un error: " + error);
    });
}

document.getElementById("unlog").addEventListener("click", signOut);



//------------------- Listener de usuario en el sistema ------------------//

document.getElementById("loggedUsers").addEventListener("click", function () {

    // Controlar usuario logado
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log(`Está en el sistema:${user.email} ${user.uid}`);
        } else {
            console.log("no hay usuarios en el sistema");
        }
    });
})


