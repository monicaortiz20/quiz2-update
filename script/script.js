
let score = [];
let currentQuestion = 0;
// Se declaran las variables para los contadores. "score" como un array vacío y "currentQuestion" como tipo numérico igualado a 0.

const submitBtn = document.getElementById('submit-quiz');
// Se declara la variable del botón para enviar la respuesta elegida y pasar a la siguiente pregunta. Se usa el DOM para traerlo desde HTML.

quizGame();
// Lo primero, se ejecuta la función quizGame, declarada en la línea 12 como función asíncrona.

async function quizGame() {

    try {
        let responseQuiz = await fetch('https://opentdb.com/api.php?amount=13&category=17&difficulty=medium&type=multiple')
        let pregsQuiz = await responseQuiz.json()
        // Trae de la API las preguntas. En concreto, trae un objeto al que hemos llamado "pregsQuiz".Uno de los elementos de "pregsQuiz" es un array llamado "results" que contiene 13 objetos (preguntas) con sus propiedades (enunciado, respuesta correcta, incorrecta... Copiar enlace en navegador para ver la estructura). Este enlace está generado desde la API, con una configuración previa desde la API en la que se determinan el nº de preguntas, la temática, dificultad...

        paintQUest(
            pregsQuiz.results[currentQuestion].incorrect_answers,
            pregsQuiz.results[currentQuestion].correct_answer,
            pregsQuiz.results[currentQuestion].question
        )
        // Se ejecuta la función "paintQUest", declarada en la línea 89 (fuera de la función asíncrona), que "pinta" el enunciado de la pregunta, la respuesta correcta y las 3 respuestas incorrectas de cada una de las preguntas correspondientes al contador "currentQuestion".

        submitBtn.addEventListener('click', () => {
            // Se asocia el botón con una función de escucha para cuando se haga click ejecute lo siguiente:

            checkGoodAnswer(pregsQuiz.results[currentQuestion].correct_answer, score)

            currentQuestion++;

            if (currentQuestion == pregsQuiz.results.length) {
                let totalScore = 0;
                score.forEach(sum1 => {
                    totalScore += sum1
                    //Cuando llega a la pantalla final, suma los elementos al array "score"
                })

                quiz.innerHTML = `
                <div class="div-results">
                    <h2>Has respondido ${totalScore}/${pregsQuiz.results.length} preguntas correctamente</h2>

                    <div class="div-buttons-results">                    
                        <button id="reload" class="button-registered">Guardar y recargar</button>
                        <button id="exit" class="button-registered">Salir sin guardar</button>
                    </div>
                </div>
                    `

                //window.location.href = "results.html";
                //localStorage.setItem("player",JSON.stringify(localSdata));
            } else {
                deleteRadio()

                paintQUest(
                    pregsQuiz.results[currentQuestion].incorrect_answers,
                    pregsQuiz.results[currentQuestion].correct_answer,
                    pregsQuiz.results[currentQuestion].question
                )

            }

        })

    } catch (error) {
        console.log(error)
    }

}


function paintQUest(bads, good, quest) {

    let arrayresp = [...bads, good]; //para meter las 4 respuestas
    // console.log(arrayresp, quest);
    arrayresp = arrayresp.sort(() => Math.random() - 0.5) //para que la posición de la respuesta correcta vaya cambiando

    document.getElementById('question').innerHTML = `${quest}`
    document.getElementById('a_text').innerHTML = `${arrayresp[0]}`
    document.getElementById('b_text').innerHTML = `${arrayresp[1]}`
    document.getElementById('c_text').innerHTML = `${arrayresp[2]}`
    document.getElementById('d_text').innerHTML = `${arrayresp[3]}`

}

function checkGoodAnswer(goodAnswer, score) {
    let answers = document.getElementsByName('answer')
    answers.forEach(element => {
        if (element.checked && document.getElementById(`${element.id}_text`).textContent == goodAnswer) {
            score.push(1);
        }
    })
}

function deleteRadio() {
    let answers = document.getElementsByName('answer')
    answers.forEach(element => {
        element.checked = false
    })
}




//----------------- Your web app's Firebase configuration ------------------//

const firebaseConfig = {
    apiKey: "AIzaSyCzZ7cOiBFSKZ21yBwNg3mps1764mSJOpo",
    authDomain: "quiz2-f87e2.firebaseapp.com",
    projectId: "quiz2-f87e2",
    storageBucket: "quiz2-f87e2.appspot.com",
    messagingSenderId: "346823333135",
    appId: "1:346823333135:web:0db11aaaca9f09df5e5a7a"
};


//-----------------  Initialize Firebase------------------//
firebase.initializeApp(firebaseConfig);


//para llamar a la bbdd
const db = firebase.firestore();


//--------- Creación de la colección "users" ------------------//
const createUser = (user) => {
    db.collection("users")
        .add(user)
        .then((docRef) => console.log("Document written with ID: ", docRef.id))
        .catch((error) => console.error("Error adding document: ", error));
};



//----------------- Auth Firebase con mail + pass (Sigh up -> registrarse) ------------------//
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

            // Creación del usuario en Firestore a la misma vez que se hace el registro (no sería necesario para el registro en sí)
            createUser({
                id: user.uid,
                email: user.email,
            });

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


// Uso del DOM para recoger los valores introducidos en los inputs de "mailreg", "passreg" y "passregrep" y guardarlos en sus respectivas variables al pulsar "submit"
document.getElementById("form-reg").addEventListener("submit", function (event) {
    event.preventDefault();
    let email = event.target.elements.mailreg.value;
    let pass = event.target.elements.passreg.value;
    let pass2 = event.target.elements.passregrep.value;
    window.location.href = "./pages/home.html";
    // Declaración que obliga a coincidir los campos de "pass" y "pass2"
    pass === pass2 ? signUpUser(email, pass) : alert("error password");

    // Hacer más validaciones...
    let correo =[
        {
          "email": document.getElementById("mailreg").value,
          "Fecha": "",
        }
      ];

      localStorage.setItem("email", JSON.stringify(correo));
})



//----------------- Login con mail + pass ------------------//

const signInUser = (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            let user = userCredential.user;
            console.log(`se ha logado ${user.email} ID:${user.uid}`)
            alert(`se ha logado ${user.email} ID:${user.uid}`)
            console.log(user);

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
    let correo =[
        {
          "email": document.getElementById("maillog").value,
          "Fecha": "",
        }
      ];
    
      localStorage.setItem("email", JSON.stringify(correo));
      window.location.href = "./pages/home.html";
})




//----------------- Unlogin mail + pass ------------------//

const signOut = () => {
    let user = firebase.auth().currentUser;

    firebase.auth().signOut().then(() => {
        console.log("Sale del sistema: " + user.email)
    }).catch((error) => {
        console.log("hubo un error: " + error);
    });
}

document.getElementById("unlog").addEventListener("click", signOut);



//---------- Listener de usuario en el sistema ------------------//

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

